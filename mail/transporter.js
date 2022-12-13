const nodemailer = require('nodemailer');
require('dotenv').config()
const transporter = nodemailer.createTransport({
    service:'gmail',
    auth:{
      user:process.env.MAIL_ID,
      pass:process.env.MAIL_ID_KEY
    },
    port:465,
    host:'smtp.google.com'
})

// checking connection
transporter.verify = (error,success) =>{
    if(error){
        console.log(error)
    }else{
        console.log('mail server is running...');
    }
}

module.exports = transporter;