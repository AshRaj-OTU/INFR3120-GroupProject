var express=require('express');
var router=express.Router();
var Booking=require('../models/booking');
var createBooking=require('../lib/createBooking');
// Local development demo only. Part 2 and 3 own the actual booking pages.
async function showForm(res,next,status,message,saved){
  try{
    // Only resource and schedule information is shown, not student details.
    var bookings=await Booking.find({},'bookingType resourceId date startTime endTime -_id')
      .sort({date:1,startTime:1}).limit(50);
    res.status(status).render('backend-demo',{
      title:'Part 1 Backend Demo',bookings:bookings,message:message,saved:saved
    });
  }catch(error){
    next(error);
  }
}
router.get('/',function(req,res,next){
  return showForm(res,next,200,req.query.saved==='1'?'Booking saved.':'',req.query.saved==='1');
});
router.post('/',async function(req,res,next){
  try{
    // Use dummy student information for this demo, not real personal data.
    await createBooking({
      bookingType:req.body.bookingType,
      resourceId:req.body.resourceId,
      date:req.body.date,
      startTime:req.body.startTime,
      endTime:req.body.endTime,
      studentName:'Test Student',
      studentNumber:'100000001',
      email:'test@example.com'
    });
    res.redirect(303,'/demo?saved=1');
  }catch(error){
    if(error.status===400||error.status===409){
      return showForm(res,next,error.status,error.message,false);
    }
    next(error);
  }
});
module.exports=router;
