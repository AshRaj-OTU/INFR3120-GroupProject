// Validate server-side even when the form already has HTML validation.
function invalid(message){
  var error=new Error(message);
  error.status=400;
  throw error;
}
function validateBooking(input){
  input=input||{};
  var fields=['bookingType','resourceId','studentName','studentNumber',
    'email','date','startTime','endTime'];
  var booking={};
  for(var i=0;i<fields.length;i++){
    var field=fields[i];
    if(typeof input[field]!=='string'||input[field].trim()===''){
      invalid(field+' is required.');
    }
    booking[field]=input[field].trim();
  }
  booking.bookingType=booking.bookingType.toLowerCase();
  booking.resourceId=booking.resourceId.toLowerCase();
  booking.email=booking.email.toLowerCase();
  if(booking.bookingType!=='room'&&booking.bookingType!=='equipment'){
    invalid('Booking type must be room or equipment.');
  }
  if(booking.resourceId.length>80||booking.studentName.length>120||
    booking.studentNumber.length>30||booking.email.length>254){
    invalid('One or more fields are too long.');
  }
  if(!/^\d+$/.test(booking.studentNumber)){
    invalid('Student number must contain digits only.');
  }
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(booking.email)){
    invalid('Enter a valid email address.');
  }
  // Reject impossible dates, including February 30.
  if(!/^\d{4}-\d{2}-\d{2}$/.test(booking.date)){
    invalid('Use YYYY-MM-DD for the date.');
  }
  var date=new Date(booking.date+'T00:00:00Z');
  if(isNaN(date.getTime())||date.toISOString().slice(0,10)!==booking.date){
    invalid('Enter a real calendar date.');
  }
  // Fixed-width 24-hour times can be compared as strings.
  var timePattern= /^([01]\d|2[0-3]):[0-5]\d$/;
  if(!timePattern.test(booking.startTime)|| !timePattern.test(booking.endTime)){
    invalid('Use HH:MM in 24-hour format for both times.');
  }
  if(booking.startTime>=booking.endTime){
    invalid('End time must be after start time on the same day.');
  }
  var optional=['resourceName','labName','title','notes'];
  optional.forEach(function(field){
    if(typeof input[field]==='string'){
      booking[field]=input[field].trim();
      if(booking[field].length>(field==='notes'?500:120)) invalid(field+' is too long.');
    }
  });
  if(input.people!==undefined){
    if(!Number.isInteger(input.people)||input.people<1||input.people>8) invalid('Invalid group size.');
    booking.people=input.people;
  }
  return booking;
}
module.exports=validateBooking;
