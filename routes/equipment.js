// Lab equipment booking: pick a lab and date -> schedule grid -> booking form.

var express = require('express');
var router = express.Router();

var Booking = require('../lib/readBookings');
var config = require('../config/resources');
var schedule = require('../lib/equipmentSchedule');
var createBooking = require('../lib/createBooking');
var roomSchedule=require('../lib/schedule');
var sendConfirmation=require('../lib/mailer');

function findLab(id) {
  return config.labs.find(function(lab) { return lab.id === id; });
}

// Looks through every lab for the item and returns it with its lab.
function findItem(id) {
  for (var lab of config.labs) {
    var item = lab.items.find(function(i) { return i.id === id; });
    if (item) return { lab: lab, item: item };
  }
  return null;
}

// Checks that a start time is one of the real slot times on the grid.
// filter() keeps only the slots that match, so a real slot leaves one behind.
function isSlotStart(start) {
  var matches = schedule.slotStarts().filter(function(s) { return s === start; });
  return matches.length > 0;
}

// Renders the booking form, for the first visit and when there are errors.
async function showForm(res, found, date, start, errors, values) {
  var bookings = await Booking.find({ bookingType:'equipment',resourceId: found.item.id, date: date });
  res.render('equipment/new', {
    title: 'Book ' + found.item.name,
    lab: found.lab,
    item: found.item,
    date: date,
    start: start,
    durations: roomSchedule.at(date,start)<=new Date()?[]:schedule.durationChoices(bookings, start, config.equipmentMaxMinutes),
    errors: errors,
    values: values
  });
}

/* GET /equipment : pick a lab and a date. */
router.get('/', function(req, res) {
  res.render('equipment/index', {
    title: 'Book lab equipment',
    labs: config.labs,
    dates: schedule.upcomingDates()
  });
});

/* GET /equipment/schedule?lab=&date= : the grid of equipment and time slots. */
router.get('/schedule', async function(req, res, next) {
  try {
    var lab = findLab(req.query.lab);
    var date = req.query.date || '';
    if (!lab || !schedule.isBookableDate(date)) return res.redirect('/equipment');

    var bookings = await Booking.find({ bookingType: 'equipment', date: date });
    var rows = schedule.buildGrid(lab.items, bookings, date, function(item, start) {
      return '/equipment/new?item=' + item.id + '&date=' + date + '&start=' + start;
    });

    res.render('equipment/schedule', {
      title: lab.name,
      heading: lab.name,
      date: date,
      columns: lab.items,
      rows: rows,
      backHref: '/equipment'
    });
  } catch (err) {
    next(err);
  }
});

/* GET /equipment/new?item=&date=&start= : the booking form for one open slot. */
router.get('/new', async function(req, res, next) {
  try {
    var found = findItem(req.query.item);
    var date = req.query.date || '';
    // query string values are text, so turn the start time back into a number
    var start = parseInt(req.query.start, 10);
    if (!found || !schedule.isBookableDate(date) || !isSlotStart(start)) {
      return res.redirect('/equipment');
    }
    await showForm(res, found, date, start, [], {});
  } catch (err) {
    next(err);
  }
});

/* POST /equipment: validate and save through the shared backend. */
router.post('/',async function(req,res,next){
  try{
    var found=findItem(req.body.item);
    var date=req.body.date||'';
    var start=Number(req.body.start);
    var duration=Number(req.body.duration);
    if(!found||!schedule.isBookableDate(date)||!isSlotStart(start)) return res.redirect('/equipment');
    var errors=[];
    if(![60,120,180].includes(duration)||start+duration>1260) errors.push('Invalid duration.');
    if(roomSchedule.at(date,start)<=new Date()) errors.push('This time has passed.');
    var title=String(req.body.title||'').trim();
    if(!title||title.length>40) errors.push('Enter a description of 1 to 40 characters.');
    if(errors.length){res.status(400);return await showForm(res,found,date,start,errors,req.body);}
    try{
      var booking=await createBooking({bookingType:'equipment',resourceId:found.item.id,resourceName:found.item.name,labName:found.lab.name,studentName:title,studentNumber:req.body.studentNumber,email:req.body.email,date:date,startTime:roomSchedule.minutesToValue(start),endTime:roomSchedule.minutesToValue(start+duration),title:title,notes:req.body.notes||''});
    }catch(error){
      if([400,409,503].includes(error.status)){
        res.status(error.status);
        return await showForm(res,found,date,start,[error.message],req.body);
      }
      throw error;
    }
    var mailed=await sendConfirmation(booking);
    res.redirect(303,'/bookings/confirmation/'+booking._id+'?mailed='+(mailed?'1':'0'));
  }catch(error){next(error);}
});
module.exports=router;
