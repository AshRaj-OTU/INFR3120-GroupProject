// Home page and the rules page.

var express = require('express');
var router = express.Router();

var Booking = require('../lib/readBookings');
var config = require('../config/resources');
var schedule = require('../lib/equipmentSchedule');

/* GET home page: hero buttons plus a table of the next bookings. */
router.get('/', async function(req, res, next) {
  try {
    // Dates are "YYYY-MM-DD" strings, so comparing them as text also
    // compares them as dates.
    var bookings = await Booking.find({ date: { $gte: schedule.todayString() } });

    // earliest date first, and earliest start time when two are on the same day
    bookings.sort(function(a, b) {
      if (a.date < b.date) return -1;
      else if (a.date > b.date) return 1;
      else if (a.start < b.start) return -1;
      else if (a.start > b.start) return 1;
      else return 0;
    });

    // the home page only shows the next 10, the full list is on /bookings
    var nextBookings = [];
    for (var i = 0; i < bookings.length && i < 10; i++) {
      nextBookings[i] = bookings[i];
    }

    res.render('index', { title: 'Home', bookings: nextBookings });
  } catch (err) {
    next(err);
  }
});

/* GET rules page. */
router.get('/rules', function(req, res) {
  res.render('rules', { title: 'Rules', config: config });
});

module.exports = router;
