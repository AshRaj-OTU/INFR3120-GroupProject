var mongoose=require('mongoose');
var Booking=require('../models/booking');
// Convert the shared model to the fields used by the team schedule pages.
function minutes(time){
  var parts=time.split(':');
  return Number(parts[0])*60+Number(parts[1]);
}
function display(booking){
  var b=booking.toObject?booking.toObject():booking;
  return Object.assign({},b,{
    kind:b.bookingType,
    resourceName:b.resourceName||b.resourceId,
    labName:b.labName||'Lab',
    title:b.title||b.studentName,
    start:minutes(b.startTime),end:minutes(b.endTime),
    roomId:b.resourceId.toUpperCase(),userName:b.title||b.studentName,
    reference:String(b._id)
  });
}
async function find(query){
  if(mongoose.connection.readyState!==1) return [];
  var bookings=await Booking.find(query||{});
  return bookings.map(display);
}
module.exports={find:find,display:display};
