const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
const Category = require('../models/Category');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const stripe = require('stripe')('sk_test_51M17JXSAsRf6ztASMZHErBu9jkDe4TTpYLdeXeQfHDZGhbiwHGYTFoeO5aTlxMlMNZE8yW6DEm0EGpC5kChGPo8o00rq7uaQRi')
const nodemailer = require('nodemailer');
const orderSuccessMail = require('../mail/orderSuccessMail');

const ITEMS_PER_PAGE = 2;

exports.getShopItems = (req,res)=>{
  const page = +req.query.page || 1; // add + sign to use a value as a int
  const category = req.query.category;
  let categories;
  let totalItems;
  Category.find().then(catItem=>{
    categories = catItem ;
    return Product.find().count();
  })
  .then(numProducts=>{
    totalItems = numProducts ;
    // console.log(numProducts)
    if(category){
      return Product.find({category:category})
                  .skip((page-1) * ITEMS_PER_PAGE)
                  .limit(ITEMS_PER_PAGE)
    }
    return Product.find()
                  .skip((page-1) * ITEMS_PER_PAGE)
                  .limit(ITEMS_PER_PAGE)
    
  })
  .then(products=>{
        //console.log(products)

        res.render('shop/shop',{
            path:'/',
            pageTitle:'Shop',
            products:products,
            categories:categories,
            isAuthenticated:req.session.isLoggedIn,
            currentPage:page,
            hasNextPage : ITEMS_PER_PAGE * page < totalItems,
            hasPreviousPage: page > 1 ,
            nextPage: page + 1,
            previousPage:page - 1,
            lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
        });
    })
    .catch(err=>{
        console.log(err);
    })  
}

exports.postCartItem = (req,res) =>{
    const productId = req.body.productId;
    Product.findById(productId)
    .then(product=>{
        return req.user.addToCart(product);
    })
    .then(result=>{
        console.log(result);
        res.redirect('/cart');
    })
    
}

exports.getCartItems = (req,res) =>{
    req.user
    .populate('cart.items.productId')
    .then(user => {
      const products = user.cart.items;
      req.session.products = products
      console.log(products)
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products,
        isAuthenticated:req.session.isLoggedIn
      });
    })
    // .catch(err => {
    //     console.log(err)
    // //   const error = new Error(err);
    // //   error.httpStatusCode = 500;
    // //   return next(error);
    
    // });
}

exports.postCartDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    console.log(prodId)
    req.user
      .removeFromCart(prodId)
      .then(result => {
        res.redirect('/cart');
      })
      .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      
      });
  };

  exports.getCheckOut = (req,res,next) => {
    let products;
    let total = 0;
    req.user
    .populate('cart.items.productId')
    .then(user => {
      total=0;
      products = user.cart.items;
      products.forEach(p=>{
        total = total + p.productId.price * p.quantity ;
      })

      return stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items:products.map(p=>{
              return {
                quantity: p.quantity,
                price_data:{
                  unit_amount:p.productId.price * 100,
                  currency: 'inr',
                  product_data :{
                    name: p.productId.title,
                    description:p.productId.description,
                  }
                }
                
              }
            }),
            mode:'payment',
            success_url:'http://localhost:3000/checkout/success',
            /* 
                req.protocol + '://' --> http://
                req.get('host')      --> localhost:3000
            */
            cancel_url:'http://localhost:3000/checkout/cancel'
      });
    })
    .then(session => {
      
      res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Checkout',
        products: products,
        totalSum : total,
        isAuthenticated:req.session.isLoggedIn,
        sessionId:session.id
      });
    })
    .catch(err=>{
      console.log(err);
    })
  } 

  exports.postOrder = (req, res, next) => {
    let products;
    req.user
      .populate('cart.items.productId')
      .then(user => {
         products = user.cart.items.map(i => {
          return { quantity: i.quantity, product: { ...i.productId._doc } };
        });
        const order = new Order({
          user: {
            email: req.user.email,
            userId: req.user
          },
          products: products
        });
        console.log(products)
        return order.save();
      })
      .then(result => {
        // const msg = {
        //   from : 'sachinsensks999@gmail.com',
        //   to : req.user.email,
        //   subject:'Mobile E-shop',
        //   text :'|| Thanks for ordering with us ||'
        // };
        // nodemailer.createTransport({
        //     service:'gmail',
        //     auth:{
        //       user:'sachinsensks999@gmail.com',
        //       pass:'gqthhggshufleazt'
        //     },
        //     port:465,
        //     host:'smtp.google.com'
        // })
        // .sendMail(msg ,err=>{
        //   if(err){
        //     console.log(err);
        //   }else{
        //     console.log('email sent');
        //   }
        // })
        const name = req.session.user.name;
        const email = req.session.user.email;
      //   let products;
      //   req.user
      // .populate('cart.items.productId')
      // .then(user => {
      //    products = user.cart.items;
      // })
        // console.log(products)
        let total= 0;
        products.map(p=>{
          total = total + p.product.price * p.quantity
        })
        orderSuccessMail({name,email,products,total})
        return req.user.clearCart();
      })
      .then(() => {
        res.redirect('/orders');
      })
      .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  };
  
  exports.getOrders = (req, res, next) => {
    Order.find({ 'user.userId': req.user._id })
      .then(orders => {
        res.render('shop/orders', {
          path: '/orders',
          pageTitle: 'Your Orders',
          orders: orders,
          isAuthenticated:req.session.isLoggedIn
        });
      })
      .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  };
  
exports.getInvoice = (req,res,next) =>{
    const orderId = req.params.orderId;
    Order.findById(orderId).then(order=>{
      if(!order){
        return res.redirect('/404')
      }
      if(order.user.userId.toString() !== req.user._id.toString()){
        return res.redirect('/403')
      }
      const invoiceName = 'invoice-' + orderId + '.pdf';
      const invoicePath =  path.join('data','invoices',invoiceName)
      // fs.readFile(invoicePath,(err,data)=>{
      //     if(err){
      //         return next(err);
      //     }
      //     res.setHeader('Content-Type','application/pdf');
      //     res.setHeader('Content-Disposition','inline;filename="'+ invoiceName +'"');
      //     res.send(data)
      // });

    // Passsword Protection

      // user dob with '-'
      userDob = req.session.user.dob;
      // converting dob into array
      stringToArray = userDob.split("");
      // filtering number from the array
      result = stringToArray.filter(num=>{
          if(num!='-')
          {
              return num;
          }
      })
      // storing dob without '-' in DOB variable
      const DOB = result.join('');
      const options = {
        userPassword :DOB,
      }
      const pdfDoc = new PDFDocument(options);
      // Document Title
      pdfDoc.info.Title = 'Invoice ' + new Date().toDateString();
      
      res.setHeader('Content-Type','application/pdf');
      res.setHeader('Content-Disposition','inline;filename="'+ invoiceName +'"');
      pdfDoc.pipe(fs.createWriteStream(invoicePath))
      pdfDoc.pipe(res);
      pdfDoc.fontSize(26).text('Invoice',{
        // underline:true
      });
      pdfDoc.text('------------------------');
      let totalPrice = 0 ;
      order.products.forEach(prod=>{
          totalPrice =  totalPrice +  prod.quantity * prod.product.price;
          
          pdfDoc.fontSize(14).text(prod.product.title + '-' + prod.quantity + 'x' + '-' +'Rs'+ prod.product.price )
      })

      pdfDoc.text('--------------------------------------------');
      pdfDoc.fontSize(18).text('TotalPrice = Rs' + totalPrice);
      
      pdfDoc.end();
      // const file = fs.createReadStream(invoicePath);
      //     res.setHeader('Content-Type','application/pdf');
      //     res.setHeader('Content-Disposition','inline;filename="'+ invoiceName +'"');
      //     file.pipe(res);
    })
    
}