var assert=require('assert');
var validateBooking=require('../lib/validateBooking');
var overlapQuery=require('../lib/createBooking').overlapQuery;
var sample={
  bookingType:'room',resourceId:'Room-101',studentName:'Test Student',
  studentNumber:'100000001',email:'Test@example.com',date:'2027-01-15',
  startTime:'10:00',endTime:'11:00'
};
var valid=validateBooking(sample);
assert.strictEqual(valid.resourceId,'room-101');
assert.strictEqual(valid.email,'test@example.com');
assert.throws(function(){validateBooking({});},/required/);
assert.throws(function(){validateBooking(Object.assign({},sample,{email:'invalid'}));},/email/);
assert.throws(function(){validateBooking(Object.assign({},sample,{studentNumber:'abc'}));},/digits/);
assert.throws(function(){validateBooking(Object.assign({},sample,{date:'2027-02-30'}));},/calendar date/);
assert.throws(function(){validateBooking(Object.assign({},sample,{startTime:'24:00'}));},/HH:MM/);
assert.throws(function(){validateBooking(Object.assign({},sample,{endTime:'09:00'}));},/End time/);
assert.throws(function(){validateBooking(Object.assign({},sample,{endTime:'10:00'}));},/End time/);
assert.throws(function(){validateBooking(Object.assign({},sample,{bookingType:'other'}));},/Booking type/);
// Check the generated query against a simulated existing 10:00-11:00 booking.
function overlaps(start,end,changes){
  var input=Object.assign({},sample,{startTime:start,endTime:end},changes);
  var query=overlapQuery(validateBooking(input));
  return valid.bookingType===query.bookingType&&valid.date===query.date&&
    valid.resourceId===query.resourceId&&valid.startTime<query.startTime.$lt&&
    valid.endTime>query.endTime.$gt;
}
assert.strictEqual(overlaps('09:00','10:00'),false);
assert.strictEqual(overlaps('10:00','11:00'),true);
assert.strictEqual(overlaps('10:30','11:30'),true);
assert.strictEqual(overlaps('09:00','12:00'),true);
assert.strictEqual(overlaps('10:15','10:30'),true);
assert.strictEqual(overlaps('11:00','12:00'),false);
assert.strictEqual(overlaps('10:00','11:00',{resourceId:'room-102'}),false);
assert.strictEqual(overlaps('10:00','11:00',{bookingType:'equipment'}),false);
assert.strictEqual(overlaps('10:00','11:00',{date:'2027-01-16'}),false);
console.log('Validation and overlap-query tests passed.');
