async function sendConfirmation(booking){
  if(!process.env.SMTP_HOST||!process.env.SMTP_FROM) return false;
  try{
    var nodemailer=require('nodemailer');
    var options={host:process.env.SMTP_HOST,port:Number(process.env.SMTP_PORT||587),secure:process.env.SMTP_SECURE==='true',connectionTimeout:10000,greetingTimeout:10000,socketTimeout:10000};
    if(process.env.SMTP_USER) options.auth={user:process.env.SMTP_USER,pass:process.env.SMTP_PASS};
    var transporter=nodemailer.createTransport(options);
    await transporter.sendMail({from:process.env.SMTP_FROM,to:booking.email,subject:'Campus Booking confirmation',text:'Your booking is confirmed.\nResource: '+(booking.resourceName||booking.resourceId)+'\nDate: '+booking.date+'\nTime: '+booking.startTime+' - '+booking.endTime+'\nReference: '+booking._id});
    return true;
  }catch(error){console.error('Confirmation email could not be sent.');return false;}
}
module.exports=sendConfirmation;
