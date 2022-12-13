const express = require('express');
const isAuth =require('../middleware/is-auth');
const {check,body} = require('express-validator');
const adminController = require('../controllers/admin');
const router =express.Router();

// add- product routes
router.get('/add-product',isAuth,adminController.getAddProduct);
router.post('/add-product',
[
    body('pname','Please enter a valid name.(product name accepts only alphabates)')
    .notEmpty().isAlpha()
    ,
    body('pmodel','Please enter model name').isAlphanumeric().notEmpty(),
    // body('pimage','Please enter a valid image url').isURL(),
    body('pprice').isNumeric().withMessage('Please enter a price within a valid format'),

    body('pdes','Write a description between 5 to 400 letters').isLength({min:5,max:400})
]
,isAuth,adminController.postAddProduct);
// admin-poduct routes
router.get('/admin-product',isAuth,adminController.getAdminProduct);

router.get('/edit-product/:EditId',isAuth,adminController.getEditProduct);
router.post('/edit-product/',isAuth,adminController.postEditProduct);

router.get('/delete-product/:DeleteId',isAuth,adminController.deleteAdminProduct);
router.get('/admin-product-category',isAuth,adminController.getProductCategory);
router.post('/admin-product-category',isAuth,adminController.postProductCategory);
router.get('/admin-product-category-update/:EditId',isAuth,adminController.geteditCategory);
router.post('/admin-product-category-update/',isAuth,adminController.posteditCategory);
router.get('/admin-product-category-delete/:DeleteId',isAuth,adminController.getDeleteCategory);
// router.delete('/admin-product-delete/:DeleteId',isAuth,adminController.deleteAdminProduct)
module.exports = router;