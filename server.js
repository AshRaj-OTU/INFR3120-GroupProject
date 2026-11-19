// Load the environment before starting the Express application.
require('dotenv').config();
var http=require('http');
var app=require('./app');
var connectDatabase=require('./config/database');
var port=process.env.PORT||3000;
// Start accepting requests only after MongoDB is connected.
async function start(){
  try{
    await connectDatabase();
    app.set('port',Number(port));
    var server=http.createServer(app);
    server.on('error',function(error){
      console.error('Server error: '+error.message);
      process.exit(1);
    });
    server.listen(Number(port),'0.0.0.0',function(){
      console.log('Server running on port '+port);
    });
  }catch(error){
    // Do not print database credentials or the connection URI.
    console.error('Database startup failed. Check MONGODB_URI and database access.');
    process.exit(1);
  }
}
start();
