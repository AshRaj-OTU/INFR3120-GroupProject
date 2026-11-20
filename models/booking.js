var mongoose=require('mongoose');
// Rooms and equipment use the same collection and field names.
var bookingSchema=new mongoose.Schema({
  bookingType:{type:String,required:true,enum:['room','equipment']},
  resourceId:{type:String,required:true,trim:true,maxlength:80},
  studentName:{type:String,required:true,trim:true,maxlength:120},
  studentNumber:{type:String,required:true,trim:true,maxlength:30},
  email:{type:String,required:true,trim:true,lowercase:true,maxlength:254},
  resourceName:{type:String,trim:true,maxlength:120},
  labName:{type:String,trim:true,maxlength:120},
  title:{type:String,trim:true,maxlength:120},
  notes:{type:String,trim:true,maxlength:500},
  people:{type:Number,min:1,max:8},
  date:{type:String,required:true,match:/^\d{4}-\d{2}-\d{2}$/},
  startTime:{type:String,required:true,match:/^([01]\d|2[0-3]):[0-5]\d$/},
  endTime:{type:String,required:true,match:/^([01]\d|2[0-3]):[0-5]\d$/}
},{timestamps:true,bufferCommands:false});
// Helps MongoDB find reservations for the same resource and date.
bookingSchema.index({bookingType:1,resourceId:1,date:1,startTime:1});
module.exports=mongoose.model('Booking',bookingSchema);
