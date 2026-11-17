// The table of all upcoming bookings, and the confirmation page shown right
// after a booking is made.

var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();

var Booking = require('../models/booking');
var schedule = require('../lib/schedule');

/* GET /bookings : every upcoming booking, in a table. */
router.get('/', async function(req, res, next) {
  try {
    var bookings = await Booking.find({ date: { $gte: schedule.todayString() } })
      .sort({ date: 1, start: 1 });
    res.render('bookings/index', { title: 'All bookings', bookings: bookings });
  } catch (err) {
    next(err);
  }
});

/* GET /bookings/confirmation/:id : the "you're booked" page. */
router.get('/confirmation/:id', async function(req, res, next) {
  try {
    // An id that is not a valid MongoDB id can never match, so skip the query.
    if (!mongoose.isValidObjectId(req.params.id)) return next();

    var booking = await Booking.findById(req.params.id);
    if (!booking) return next();

    res.render('bookings/confirmation', {
      title: 'Booking confirmed',
      booking: booking,
      mailed: req.query.mailed === '1'
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
