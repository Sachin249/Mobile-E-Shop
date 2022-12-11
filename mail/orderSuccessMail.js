const path = require('path');
const ejs = require('ejs');
const transporter = require('./transporter');
const sendUserCreationEmail = async ({name,email,products,total}) =>{
    const templatePath = path.join(__dirname,'../views/mails/orderSucceed.ejs');
    const data = await ejs.renderFile(templatePath,{name,products,total})
    console.log(products)
    const mainOptions = {
        from : '"Mobile E-shop" sachinsensks999@gmail.com',
        to:email,
        subject : 'Ordered Successfully',
        html:data
    }
    await transporter.sendMail(mainOptions);
}

module.exports = sendUserCreationEmail;