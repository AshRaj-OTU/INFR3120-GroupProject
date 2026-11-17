// Lab equipment booking: pick a lab and date -> schedule grid -> booking form.

var express = require('express');
var router = express.Router();

var Booking = require('../models/booking');
var config = require('../config/resources');
var schedule = require('../lib/schedule');
var createBooking = require('../lib/createBooking');

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
  var bookings = await Booking.find({ resourceId: found.item.id, date: date });
  res.render('equipment/new', {
    title: 'Book ' + found.item.name,
    lab: found.lab,
    item: found.item,
    date: date,
    start: start,
    durations: schedule.durationChoices(bookings, start, config.equipmentMaxMinutes),
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

    var bookings = await Booking.find({ kind: 'equipment', date: date });
    var rows = schedule.buildGrid(lab.items, bookings, date, function(item, start) {
      return '/equipment/new?item=' + item.id + '&date=' + date + '&start=' + start;
    });

    res.render('schedule', {
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

/* POST /equipment : save the booking, or show the form again with the errors. */
router.post('/', async function(req, res, next) {
  try {
    var found = findItem(req.body.item);
    if (!found) return res.redirect('/equipment');

    var result = await createBooking({
      kind: 'equipment',
      resource: found.item,
      labName: found.lab.name,
      maxMinutes: config.equipmentMaxMinutes,
      body: req.body,
      siteName: req.app.locals.siteName
    });

    if (result.errors.length) {
      res.status(400);
      return await showForm(res, found, req.body.date || '', parseInt(req.body.start, 10), result.errors, req.body);
    }
    res.redirect('/bookings/confirmation/' + result.booking._id + '?mailed=' + (result.mailed ? '1' : '0'));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
