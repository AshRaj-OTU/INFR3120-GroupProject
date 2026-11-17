// The table of all upcoming bookings, and the confirmation page shown right
// after a booking is made.

var express = require('express');
var router = express.Router();

var Booking = require('../models/booking');
var schedule = require('../lib/schedule');

/* GET /bookings : every upcoming booking, in a table. */
router.get('/', async function(req, res, next) {
  try {
    // Dates are "YYYY-MM-DD" strings, so $gte (greater than or equal) on the
    // text also means "today or later".
    var bookings = await Booking.find({ date: { $gte: schedule.todayString() } });

    // earliest date first, and earliest start time when two are on the same day
    bookings.sort(function(a, b) {
      if (a.date < b.date) return -1;
      else if (a.date > b.date) return 1;
      else if (a.start < b.start) return -1;
      else if (a.start > b.start) return 1;
      else return 0;
    });

    res.render('bookings/index', { title: 'All bookings', bookings: bookings });
  } catch (err) {
    next(err);
  }
});

/* GET /bookings/confirmation/:id : the "you're booked" page. */
router.get('/confirmation/:id', async function(req, res, next) {
  try {
    // A MongoDB _id is 24 hex characters. Anything else can never match a
    // booking, so go straight to the 404 page instead of querying.
    if (!/^[0-9a-fA-F]{24}$/.test(req.params.id)) return next();

    // find() always gives back an array, so take the first (and only) match.
    var results = await Booking.find({ _id: req.params.id });
    var booking = results[0];
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
