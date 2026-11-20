var validateBooking=require('./validateBooking');
// An existing booking overlaps if it begins before the new booking ends
// AND it ends after the new booking begins. Consecutive bookings are allowed.
function overlapQuery(booking){
  return{
    bookingType:booking.bookingType,
    resourceId:booking.resourceId,
    date:booking.date,
    startTime:{$lt:booking.endTime},
    endTime:{$gt:booking.startTime}
  };
}
// A single queue prevents two requests from passing the overlap check at
// the same time in the same Node server. All routes must use this helper.
function makeCreator(getModel){
  var pending=Promise.resolve();
  return function createBooking(input){
    var task=pending.then(async function(){
      var booking=validateBooking(input);
      var Booking=getModel();
      var existing=await Booking.findOne(overlapQuery(booking));
      if(existing){
        var error=new Error('This resource is already booked during that time.');
        error.status=409;
        throw error;
      }
      return await Booking.create(booking);
    });
    // Keep the queue working even if a booking fails.
    pending=task.catch(function(){});
    return task;
  };
}
var createBooking=makeCreator(function(){
  return require('../models/booking');
});
module.exports=createBooking;
module.exports.overlapQuery=overlapQuery;
// Allows tests to provide a temporary fake database model.
module.exports.makeCreator=makeCreator;
