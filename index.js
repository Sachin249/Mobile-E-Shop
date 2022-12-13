const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser =require('body-parser');
const authRoutes = require('./routes/auth');
const shopRoutes = require('./routes/shop');
const adminRoutes =require('./routes/admin');
const User =require('./models/User');
const session = require('express-session');
const errorController = require('./controllers/error');
const MongoDBStore = require('connect-mongodb-session')(session);
const multer = require('multer');
const shortid = require('shortid');
const flash = require('connect-flash');
require('dotenv').config();


// mail server
require('./mail/transporter');

const app = express();

const store = new MongoDBStore({
  uri :process.env.MONGO_URI,
  collections:'sessions'
})

mongoose.connect(process.env.MONGO_URI,{
    useNewUrlParser: true,
    useUnifiedTopology: true
  })

const fileFilter = (req,file,cb) =>{
  if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png'){
    cb(null,true)
  }else{
    cb(null,false)
  }
}
const fileStorage = multer.diskStorage({
  destination: (req,file,cb) =>{
    cb(null,'images');
  },
  filename:(req,file,cb) => {
    // cb(null, file.originalname + '-' + Date.now());
     cb(null, shortid.generate() + '-' + file.originalname);
  }
})

app.set('view engine', 'ejs');
app.set('views', 'views');
// app.use(function(req, res, next){
//   res.locals.message = req.flash();
//   next();
// });

app.use(session({
  secret:'my secret',
  resave:false,
  saveUninitialized:false,
  store:store
}));

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      if(!user){
        return next();
      }
      req.user = user;
      next();
    })
    .catch(err => {
      next(new Error(err))
    });
});

app.use(multer({storage:fileStorage,fileFilter:fileFilter}).single('pimage'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images',express.static(path.join(__dirname, 'images')));

app.use(authRoutes);
app.use('/admin',adminRoutes);
app.use(shopRoutes);

app.use('/403',errorController.get403);
app.use('/404',errorController.get404);
app.use('/500',errorController.get500);
app.use(errorController.get404);
// app.use( (error, req, res, next) =>{
//   res.redirect('/500')
// });

app.listen(3000,()=>{
    console.log("app is listen on port 3000")
});