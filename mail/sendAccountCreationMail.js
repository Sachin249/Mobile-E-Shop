const path = require('path');
const ejs = require('ejs');
const transporter = require('./transporter');
const sendUserCreationEmail = async ({name,email}) =>{
    const templatePath = path.join(__dirname,'../views/mails/accountCreated.ejs');
    const data = await ejs.renderFile(templatePath,{name})

    const mainOptions = {
        from : "Mobile E-shop",
        to:email,
        subject : 'Account Activated',
        html:data
    }
    await transporter.sendMail(mainOptions);
}

module.exports = sendUserCreationEmail;