var assert=require('assert');
var app=require('../app');
var schedule=require('../lib/schedule');
var mongoose=require('mongoose');
async function test(){
  assert.strictEqual(mongoose.connection.readyState,0);
  var server=app.listen(0,'127.0.0.1');
  try{
    await new Promise(function(resolve){server.once('listening',resolve);});
    var base='http://127.0.0.1:'+server.address().port;
    var date=schedule.addDays(schedule.todayString(),1);
    var pages=[['/','Campus Booking'],['/rooms','Book a study room'],['/rooms/schedule?date='+date,'SR-201A'],['/rooms/book?room=SR-201A&date='+date+'&start=10:00','Student Number'],['/equipment','Book lab equipment'],['/equipment/schedule?lab=net-lab&date='+date,'Cisco Pod 1'],['/equipment/new?item=pod-1&date='+date+'&start=600','Student number'],['/bookings','All upcoming bookings'],['/rules','Study rooms'],['/images/logo.svg','<svg'],['/stylesheets/style.css','.site-header']];
    for(var pair of pages){
      var res=await fetch(base+pair[0],{redirect:'manual'});
      assert.strictEqual(res.status,200,pair[0]);
      assert((await res.text()).includes(pair[1]),pair[0]);
    }
    var health=await fetch(base+'/health');
    assert.strictEqual((await health.json()).mode,'preview');
    var post=await fetch(base+'/rooms/book',{method:'POST',body:new URLSearchParams({room:'SR-201A',date:date,start:'10:00',duration:'30',people:'2',groupName:'Test Group',studentNumber:'12345',email:'test@example.com'}),redirect:'manual'});
    assert.strictEqual(post.status,503);
    assert((await post.text()).includes('Database is offline'));
    var equip=await fetch(base+'/equipment',{method:'POST',body:new URLSearchParams({item:'pod-1',date:date,start:'600',duration:'60',title:'Test',studentNumber:'12345',email:'test@example.com'}),redirect:'manual'});
    assert.strictEqual(equip.status,503);
    console.log('Preview routes and offline booking protection passed.');
  }finally{server.close();}
}
test().catch(function(error){console.error(error);process.exitCode=1;});
