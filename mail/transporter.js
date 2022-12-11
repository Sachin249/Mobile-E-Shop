const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service:'gmail',
    auth:{
      user:'sachinsensks999@gmail.com',
      pass:'gqthhggshufleazt'
    },
    port:465,
    host:'smtp.google.com'
})

// mailtrap
// const transporter = nodemailer.createTransport({
//     host: "smtp.mailtrap.io",
//     port: 2525,
//     auth: {
//       user: "da2f3b7b800d1c",
//       pass: "567e7eb60a9eba"
//     }
//   });

// checking connection
transporter.verify = (error,success) =>{
    if(error){
        console.log(error)
    }else{
        console.log('mail server is running...');
    }
}

module.exports = transporter;