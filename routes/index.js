var express=require('express');
var router=express.Router();
// Temporary home route. Part 3 will replace this with the actual landing page.
router.get('/',function(req,res){
  res.render('index',{title:'Library Booking',demoEnabled:process.env.ENABLE_DEMO==='true'&&req.app.get('env')!=='production'});
});
module.exports=router;
