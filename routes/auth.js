const express = require('express');
const isAuth  = require('../middleware/is-auth');
const { check,body } = require('express-validator');
const authController = require('../controllers/auth');
const User = require('../models/User');
const router = express.Router();

router.get('/signup',authController.getSignUp);
router.post('/signup',
[
    
    body('uname','User name field contains only characters (minimum length 3)!').isLength({min:3}).isAlpha(),

    check('uemail')
    .isEmail()
    .withMessage('Please Enter a valid email')
    .custom((value,{ req })=>{
        return User.findOne({email:value}).then(userDoc=>{
            if(userDoc){
                return Promise.reject('E-mail is already exist , please pick a different one');
            }
        })
    })
    .normalizeEmail(),
    body('udob','Please fill your date of birth').isDate(),
    
    body('upassword','Please enter a password with only numbers and text and at least 5 characters')
    .isLength({min:5})
    .isAlphanumeric()
    .trim(),

    body('uconfirmpassword').custom((value ,{ req }) => {
        if(value !== req.body.upassword){
            throw new Error('Passwords have to match!')
        }
        return true;
    })
    .trim()

]
,authController.postSignUp);

router.get('/login',authController.getLogin);
router.post('/login',
[
    check('uemail')
    .isEmail()
    .withMessage('Please Enter a valid email')
    .custom((value,{ req })=>{
        return User.findOne({email:value}).then(userDoc=>{
            if(!userDoc){
                return Promise.reject('Email not registered !');
            }
           
        })
    })
    .normalizeEmail(),

    body('upassword','Make sure your password have only numbers and text and at least 5 characters')
    .trim()
    .isLength({min:5})
    .isAlphanumeric()
]
,authController.postLogin);

router.get('/reset',authController.getReset);
router.post('/reset',authController.postReset);
router.get('/reset/:token',authController.getNewPassword);
router.post('/new-password',authController.postNewPassword);
router.get('/logout',authController.postLogout);
module.exports = router;