var express=require('express');
var path=require('path');
var logger=require('morgan');
var createError=require('http-errors');
var mongoose=require('mongoose');
var indexRouter=require('./routes/index');
var apiRouter=require('./routes/api');
var app=express();
// Same Express/EJS layout as the Assignment 2 reference.
app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(express.static(path.join(__dirname,'public')));
app.use('/bootstrap',express.static(path.join(__dirname,'node_modules/bootstrap')));
app.use('/fontawesome',express.static(path.join(__dirname,'node_modules/@fortawesome/fontawesome-free')));
app.get('/health',function(req,res){
  var connected=mongoose.connection.readyState===1;
  res.status(connected?200:503).json({database:connected?'connected':'disconnected'});
});
app.use('/',indexRouter);
// Enable temporary development routes only for local testing.
if(process.env.ENABLE_DEMO==='true'&&app.get('env')!=='production'){
  app.use('/api/bookings',apiRouter);
  app.use('/demo',require('./routes/demo'));
}
// Group integration: enable these after Parts 2 and 3 supply their routes.
// app.use('/rooms', require('./routes/rooms'));
// app.use('/equipment', require('./routes/equipment'));
// app.use('/bookings', require('./routes/bookings'));
app.use(function(req,res,next){
  next(createError(404));
});
app.use(function(err,req,res,next){
  var status=err.status||500;
  res.status(status);
  res.render('error',{
    title:'Error',
    message:status>=500?'Something went wrong.':err.message
  });
});
module.exports=app;
