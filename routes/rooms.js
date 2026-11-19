var express = require('express');
var router = express.Router();
var Booking = require('../models/booking');
var schedule = require('../lib/schedule');

// Show study room homepage
router.get('/', function(req, res) {
  res.render('rooms/index', {
    rooms: schedule.ROOMS,
    dates: schedule.getBookableDates()
  });
});

// Show available rooms
router.get('/schedule', async function(req, res, next) {
  try {
    var bookings = await Booking.find();

    res.render('schedule', {
      bookings: bookings
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;