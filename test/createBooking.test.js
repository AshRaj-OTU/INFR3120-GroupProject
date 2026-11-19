var assert=require('assert');
var makeCreator=require('../lib/createBooking').makeCreator;
// Fake model for testing the helper without a running MongoDB server.
var records=[];
var model={
  findOne:async function(query){
    return records.find(function(record){
      return record.bookingType===query.bookingType&&
        record.resourceId===query.resourceId&&record.date===query.date&&
        record.startTime<query.startTime.$lt&&record.endTime>query.endTime.$gt;
    });
  },
  create:async function(booking){
    await new Promise(function(resolve){setTimeout(resolve,5);});
    records.push(booking);
    return booking;
  }
};
var save=makeCreator(function(){return model;});
var booking={bookingType:'room',resourceId:'room-101',studentName:'Test Student',
  studentNumber:'100000001',email:'test@example.com',date:'2027-01-15',
  startTime:'10:00',endTime:'11:00'};
async function test(){
  // Simulate two simultaneous requests for the same room and time.
  var results=await Promise.allSettled([save(booking),save(booking)]);
  assert.strictEqual(results[0].status,'fulfilled');
  assert.strictEqual(results[1].status,'rejected');
  assert.strictEqual(results[1].reason.status,409);
  assert.strictEqual(records.length,1);
  await assert.rejects(save(Object.assign({},booking,{startTime:'10:30',endTime:'11:30'})),{status:409});
  await assert.rejects(save(Object.assign({},booking,{email:'invalid'})),{status:400});
  // The queue should still save a valid request after errors.
  await save(Object.assign({},booking,{startTime:'11:00',endTime:'12:00'}));
  await save(Object.assign({},booking,{bookingType:'equipment',resourceId:'camera-01'}));
  assert.strictEqual(records.length,3);
  console.log('Booking helper tests passed (simulated database, overlap, queue recovery).');
}
test().catch(function(error){console.error(error);process.exitCode=1;});
