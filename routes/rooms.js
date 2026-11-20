var express=require('express');
var router=express.Router();
var Booking=require('../lib/readBookings');
var schedule=require('../lib/schedule');
var createBooking=require('../lib/createBooking');
var sendConfirmation=require('../lib/mailer');
router.get('/',function(req,res){
  res.render('rooms/index',{title:'Book a study room',rooms:schedule.ROOMS,dates:schedule.getBookableDates()});
});
router.get('/schedule',async function(req,res,next){
  try{
    var date=req.query.date;
    if(!schedule.isDateBookable(date)) return res.redirect('/rooms');
    var bookings=await Booking.find({bookingType:'room',date:date});
    res.render('schedule',{title:'Study room schedule',date:date,dateLabel:schedule.formatDate(date),grid:schedule.buildGrid(date,bookings),taken:req.query.taken==='1'});
  }catch(error){next(error);}
});
async function showForm(res,slot,values,errors){
  var bookings=await Booking.find({bookingType:'room',date:slot.date});
  var max=schedule.maxDurationFor(slot.room.id,slot.date,slot.startMin,bookings);
  res.render('rooms/form',{title:'Book a study room',room:slot.room,date:slot.date,dateLabel:schedule.formatDate(slot.date),start:schedule.minutesToValue(slot.startMin),startLabel:schedule.formatMinutes(slot.startMin),durations:schedule.durationOptions(max),values:values,errors:errors});
}
router.get('/book',async function(req,res,next){
  try{
    var slot=schedule.parseSlot(req.query);
    if(slot.errors.length) return res.redirect('/rooms');
    await showForm(res,slot,{},[]);
  }catch(error){next(error);}
});
router.post('/book',async function(req,res,next){
  try{
    var slot=schedule.parseSlot(req.body);
    if(slot.errors.length) return res.redirect('/rooms');
    var result=schedule.validateRoomRequest(req.body);
    if(result.errors.length){
      res.status(400);
      return await showForm(res,slot,req.body,result.errors);
    }
    var v=result.value;
    try{
      var booking=await createBooking({bookingType:'room',resourceId:v.room.id,resourceName:v.room.id,studentName:v.groupName,studentNumber:req.body.studentNumber,email:v.email,date:v.date,startTime:schedule.minutesToValue(v.startMin),endTime:schedule.minutesToValue(v.startMin+v.duration),title:v.groupName,people:v.people});
    }catch(error){
      if([400,409,503].includes(error.status)){
        res.status(error.status);
        return await showForm(res,slot,req.body,[error.message]);
      }
      throw error;
    }
    var mailed=await sendConfirmation(booking);
    res.redirect(303,'/bookings/confirmation/'+booking._id+'?mailed='+(mailed?'1':'0'));
  }catch(error){next(error);}
});
module.exports=router;
