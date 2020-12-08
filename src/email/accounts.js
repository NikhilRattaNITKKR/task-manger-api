const sgMail=require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail=(email,name)=>{
  sgMail.send({
  to:email,
  from: 'nikhilratta84@gmail.com',
  subject: 'Welcome Aboard',
  text:'I hope you have a wonderful experience '+name,
}).catch((err)=>{
  console.log(err);
})
}

const sendDeleteEmail= (email,name)=>{
  sgMail.send({
  to:email,
  from: 'nikhilratta84@gmail.com',
  subject: 'We are sad to see you go',
  text:'What went wrong with our service? '+name,
}).catch((err)=>{
  console.log(err);
})
}

module.exports={
  sendWelcomeEmail,
  sendDeleteEmail,
}
