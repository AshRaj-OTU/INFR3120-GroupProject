var mongoose=require('mongoose');
async function connectDatabase(){
  if(!process.env.MONGODB_URI){
    throw new Error('MONGODB_URI is missing.');
  }
  await mongoose.connect(process.env.MONGODB_URI,{serverSelectionTimeoutMS:10000});
  console.log('MongoDB connected.');
}
module.exports=connectDatabase;
