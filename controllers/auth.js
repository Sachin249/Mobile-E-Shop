const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const sendUserCreationEmail = require('../mail/sendAccountCreationMail');
const resetPasswordMail = require('../mail/resetPasswordMail');
const flash = require('connect-flash');
exports.getSignUp = (req,res) =>{
    res.render('auth/signup',{
        path:'/',
        pageTitle:'SignUp',
        isAuthenticated:req.session.isLoggedIn,
        errorMessage : null,
        oldInput :{
            uname:'',
            uemail:'',
            upassword:'',
            uconfirmpassword:''
        },
        validationErrors: []
    })
}

exports.postSignUp = (req,res) =>{
    const name = req.body.uname;
    const email = req.body.uemail;
    const dob = req.body.udob;
    const password = req.body.upassword;
    const confirmPassword = req.body.uconfirmpassword;
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        console.log(errors.array());
        return res.status(442).render('auth/signup',{
            path:'/',
            pageTitle:'SignUp',
            isAuthenticated:req.session.isLoggedIn,
            errorMessage : errors.array()[0].msg,
            oldInput :{
                uname:name,
                uemail:email,
                udob:dob,
                upassword:password,
                uconfirmpassword:confirmPassword
            },
            validationErrors : errors.array()
        })
    }
    // User.findOne({email:email})
    // .then(userDoc=>{
    //     if(userDoc){
    //         return res.redirect('/signup');
    //     }
        // return bcrypt.hash(password,12)
        bcrypt.hash(password,12)
        .then(hashPassword=>{
            const user =new User({
                name:name,
                email:email,
                dob:dob,
                password:hashPassword,
                cart:{item :[]}
            })
           return user.save()
           
        })
        .then(()=>{
            // sending registration mail function
            sendUserCreationEmail({
                name:name,
                email:email
            })
            
            return res.redirect('/login')
       })
       .catch(err=>{
            console.log(err);
        })
    // })
    // .catch(err=>{
    //     console.log(err);
    // })
}

exports.getLogin = (req,res) =>{
    res.render('auth/login',{
        path:'/',
        pageTitle:'Login',
        isAuthenticated:req.session.isLoggedIn,
        errorMessage : null,
        oldInput :{
            uemail:'',
            upassword:''
        },
        validationErrors : []
    })
}

exports.postLogin = (req,res) =>{
    const email = req.body.uemail;
    const password = req.body.upassword;
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        console.log(errors.array());
        return res.status(442).render('auth/login',{
            path:'/',
            pageTitle:'Login',
            isAuthenticated:req.session.isLoggedIn,
            errorMessage : errors.array()[0].msg,
            oldInput :{
                uemail:email,
                upassword:password
            },
            validationErrors : errors.array()
        })
    }
    User.findOne({email:email})
    .then(user=>{
       bcrypt.compare(password,user.password)
       .then(doMatch=>{
            if(doMatch){
                req.session.isLoggedIn = true ;
                req.session.user = user;
                return req.session.save(err=>{
                    console.log(err);
                    res.redirect('/');
                });
            }
            res.redirect('/login')
       })
    })
    .catch(err=>{
        console.log(err);
    })
}

exports.postLogout = (req,res) =>{
    req.session.destroy(err=>{
        console.log(err);
        res.redirect('/');
    })
}

exports.getReset = (req,res,next) =>{
    res.render('auth/resetPassword',{
        path:'/',
        pageTitle:'Password Reset',
        isAuthenticated:req.session.isLoggedIn,
        errorMessage : null,
        oldInput :{
            uemail:'',
        },
        validationErrors: []
    })
}

exports.postReset = (req,res,next) =>{
    const email = req.body.uemail;
    crypto.randomBytes(32 , (err,buffer)=>{
        if(err){
            console.log(err);
            return res.redirect('/reset');
        }
        const token = buffer.toString('hex');
        User.findOne({email :email })
        .then(user=>{
            if(!user){
                // res.flash('error','No account registered with this E-mail.');
                console.log('email registered nhi hai');
                return res.redirect('/reset');
            }
            user.resetToken = token;
            user.resetTokenExpiration = Date.now() + 3600000 ;
            return user.save();
        })
        .then(result=>{
            res.redirect('/login');
            resetPasswordMail({email,token})
        })
        .catch(err=>{console.log(err)})
    })
}

exports.getNewPassword = (req,res,next) =>{
    const token = req.params.token;
    User.findOne({resetToken: token , resetTokenExpiration: {$gt : Date.now() } })
    .then(user=>{
        res.render('auth/new-password',{
            path:'/',
            pageTitle:'New Password',
            isAuthenticated:req.session.isLoggedIn,
            errorMessage : null,
            userId : user._id.toString(),
            passwordToken : token,
            oldInput :{
                upassword:'',
            },
            validationErrors: []
        })
    })
    .catch(err=>{
        console.log(err);
    })
    
}

exports.postNewPassword = (req,res,next) => {
    const newPassword = req.body.upassword;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;
    let resetUser;
    User.findOne({
        resetToken: passwordToken ,
        resetTokenExpiration: {$gt : Date.now() },
        _id :userId
    })
    .then(user=>{
        resetUser = user;
        return bcrypt.hash(newPassword,12);
    })
    .then(hashedPassword  =>{
        resetUser.password = hashedPassword ;
        resetUser.resetToken = undefined;
        resetUser.resetTokenExpiration = undefined;
        return resetUser.save();
    })
    .then(result=>{
        res.redirect('/login');
    })
    .catch(err=>{
        console.log(err);
    })
}