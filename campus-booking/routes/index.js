// Home page and the rules page.

var express = require('express');
var router = express.Router();

var Booking = require('../models/booking');
var config = require('../config/resources');
var schedule = require('../lib/schedule');

/* GET home page: hero buttons plus a table of the next bookings. */
router.get('/', async function(req, res, next) {
  try {
    // Dates are "YYYY-MM-DD" strings, so comparing them as text also
    // compares them as dates.
    var bookings = await Booking.find({ date: { $gte: schedule.todayString() } })
      .sort({ date: 1, start: 1 })
      .limit(10);
    res.render('index', { title: 'Home', bookings: bookings });
  } catch (err) {
    next(err);
  }
});

/* GET rules page. */
router.get('/rules', function(req, res) {
  res.render('rules', { title: 'Rules', config: config });
});

module.exports = router;
