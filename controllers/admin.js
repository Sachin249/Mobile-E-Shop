const Product = require('../models/Product');
const Category = require('../models/Category');
const fileHelper = require('../util/file');
// const mongoose = require('mongoose');

const {validationResult} = require('express-validator');
exports.getAddProduct = (req,res) =>{
    Category.find()
    .then(category=>{
        req.session.allcat = category;
        res.render('admin/add-product',{
            path:'/admin/add-product',
            pageTitle:'Add Product',
            allcat:category,
            isAuthenticated:req.session.isLoggedIn,
            errorMessage:null,
            oldInput:{
                pname:'',
                pimage:'',
                pprice:'',
                pdes:'',
            }
        });
    })
    .catch(err=>{
        console.log(err);
    })
    
}

exports.postAddProduct =(req,res,next) =>{
    console.log(req.body);
    const productName = req.body.pname;
    const productModel = req.body.pmodel;
    const productBrand = req.body.pbrand;
    const productImage = req.file;
    // console.log(productImage)
    const productCategory = req.body.pcategory;
    const productPrice = req.body.pprice;
    const productDes = req.body.pdes;
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        console.log(errors.array());
        return res.render('admin/add-product',{
            path:'/admin/add-product',
            pageTitle:'Add Product',
            allcat:req.session.allcat,
            isAuthenticated:req.session.isLoggedIn,
            errorMessage:errors.array()[0].msg,
            oldInput:{
                pname:productName,
                pmodel:productModel,
                pbrand:productBrand,
                pprice:productPrice,
                pdes:productDes,
                pcategory:productCategory
            }
        });
    }
    if(!productImage){
        return res.render('admin/add-product',{
            path:'/admin/add-product',
            pageTitle:'Add Product',
            allcat:req.session.allcat,
            isAuthenticated:req.session.isLoggedIn,
            errorMessage:'Please attached a image file',
            oldInput:{
                pname:productName,
                pmodel:productModel,
                pbrand:productBrand,
                pimage:productImage,
                pprice:productPrice,
                pdes:productDes,
                pcategory :productCategory

            }
        });
    }

    // extracting the image path from image object
    const imgPath = productImage.path;
    console.log(imgPath)

    
    const product = new Product({
        // _id:new mongoose.Types.ObjectId('63610392caa06780d21553b9'),
        title:productName,
        imgUrl:imgPath,
        category:productCategory,
        model:productModel,
        brand:productBrand,
        price:productPrice,
        description:productDes,
        userId:req.user._id
    })
    product.save()
    .then(()=>{
        res.redirect('/admin/admin-product');
    })
    .catch(err=>{
        //  res.redirect('/500');
        console.log(err)
        // const error = new Error(err);
        // error.httpStatusCode = 500 ;
        // return next(error);
    })
}

exports.getAdminProduct = (req,res) =>{
    // Product.find({userId:req.user._id})
    Product.find()
    .then(products=>{
        res.render('admin/admin-product',{
            path:'/admin/admin-product',
            pageTitle:'Admin Product',
            products:products,
            isAuthenticated:req.session.isLoggedIn
        })
    })
} 

exports.deleteAdminProduct = (req,res,next) =>{
    const productId = req.params.DeleteId;
    Product.findById(productId).then(product=>{
        if(!product){
            return next(new Error('Product Not Found!'));
        }
        fileHelper.deleteFile(product.imgUrl)
        return Product.deleteOne({_id:productId})
    })
    .then(()=>{
        res.redirect('/admin/admin-product');
        // res.status(200).json({message:'success'});
    })
    .catch(err=>{
        console.log(err);
        // res.status(500).json({message:'failed'});
    })
}

exports.getEditProduct = (req,res) =>{
    const productId = req.params.EditId;
    Product.findById(productId)
    .then(product=>{
        if(!product){
            return res.redirect('/404');
        }
        res.render('admin/edit-product',{
            path:'/admin/admin-product',
            pageTitle:'Edit Product',
            product:product,
            isAuthenticated:req.session.isLoggedIn
        });
    })
    .catch(err=>{
        console.log(err);
    })
}

exports.postEditProduct = (req,res)=>{
    const productName = req.body.pname;
    const productImage = req.file;
    const productPrice = req.body.pprice;
    const productDes = req.body.pdes;
    const productId = req.body.productId;
    // console.log(productId);

   
    Product.findById(productId)
    .then(product=>{
        product.title = productName;
        product.price =  productPrice;
        product.description = productDes;
        if(productImage){
            product.imgUrl = productImage.path;
            Product.findById(productId).then(product=>{
                fileHelper.deleteFile(product.imgUrl)
            });
        }
        return product.save();
    })
    .then(()=>{
        return res.redirect('/admin/admin-product');
    })

}

exports.getProductCategory =(req,res,next) =>{
    Category.find().then(category =>{
        res.render('admin/category',{
            path:'/admin/admin-product-category',
            pageTitle:'Product Category',
            pcategory:category,
            mode:'add',
            isAuthenticated:req.session.isLoggedIn
        });
    })
    .catch(err=>{
        console.log(err);
    })
    
}

exports.postProductCategory = (req,res,next) =>{
    const title = req.body.title;
    const category = new Category({
        title : title
    })
    category.save()
    .then(result=>{
        return Category.find();
    })
    .then(category =>{
        res.render('admin/category',{
            path:'/admin/admin-product-category',
            pageTitle:'Product Category',
            pcategory:category,
            mode:'add',
            isAuthenticated:req.session.isLoggedIn
        });
    })
    .catch(err=>{
        console.log(err);
    })
}

exports.geteditCategory = (req,res,next) =>{
    const EditId = req.params.EditId;
    Category.findById(EditId).then(category =>{
        res.render('admin/category',{
            path:'/admin/admin-product-category-update',
            pageTitle:'Product Category',
            pcategory:category,
            mode:'update',
            isAuthenticated:req.session.isLoggedIn
        });
    })
    .catch(err=>{
        console.log(err);
    })
}

exports.posteditCategory = (req,res,next) => {
    const editId = req.body.editId;
    const newTitle = req.body.title;
    Category.findById(editId)
    .then(category=>{
        category.title = newTitle
        return category.save()
    })
    .then(()=>{
        return res.redirect('/admin/admin-product-category');
    })
    .catch(err=>{
        console.log(err);
    })


}

exports.getDeleteCategory = (req,res,next) => {
    const deleteId = req.params.DeleteId;
    Category.findByIdAndRemove(deleteId)
    .then(()=>{
        return res.redirect('/admin/admin-product-category');
    })
    .catch(err=>{
        console.log(err);
    })

}