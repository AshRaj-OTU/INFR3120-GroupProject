require('dotenv').config();
process.env.TZ=process.env.TZ||'America/Toronto';
var http=require('http');
var app=require('./app');
var connectDatabase=require('./config/database');
var port=Number(process.env.PORT||3000);
// Start even without MongoDB so the pages can be previewed on Render.
var server=http.createServer(app);
server.on('error',function(error){
  console.error('Server error: '+error.message);
  process.exit(1);
});
server.listen(port,'0.0.0.0',function(){
  console.log('Server running on port '+port);
  if(!process.env.MONGODB_URI){
    console.log('Preview mode: MongoDB is not configured.');
    return;
  }
  connectDatabase().catch(function(){
    console.error('MongoDB unavailable. Running in preview mode. Check MONGODB_URI and database access.');
  });
});
