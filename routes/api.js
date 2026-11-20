var express=require('express');
var router=express.Router();
var createBooking=require('../lib/createBooking');
// Temporary test endpoint for Part 1. The group forms can call the same helper.
router.post('/',async function(req,res){
  try{
    var booking=await createBooking(req.body);
    res.status(201).json({message:'Booking saved.',id:booking._id});
  }catch(error){
    var status=error.status||500;
    res.status(status).json({
      message:status===500?'Could not save booking.':error.message
    });
  }
});
module.exports=router;
