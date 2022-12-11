const path = require('path');
const ejs = require('ejs');
const transporter = require('./transporter');
const sendResetPasswordEmail = async ({email,token}) =>{
    const templatePath = path.join(__dirname,'../views/mails/resetPassword.ejs');
    const data = await ejs.renderFile(templatePath,{email,token})
    const mainOptions = {
        from : '"Mobile E-shop" sachinsensks999@gmail.com',
        to:email,
        subject : 'Password Reset',
        html:data
    }
    await transporter.sendMail(mainOptions);
}

module.exports = sendResetPasswordEmail;