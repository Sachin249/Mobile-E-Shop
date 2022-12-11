const express = require('express');
const shopController =require('../controllers/shop');
const router = express.Router();

router.get('/',shopController.getShopItems);
router.post('/add-to-cart',shopController.postCartItem);

router.get('/cart',shopController.getCartItems);
router.post('/cart-delete-item', shopController.postCartDeleteProduct);

// router.post('/create-order', shopController.postOrder);

router.get('/checkout',shopController.getCheckOut);

router.get('/checkout/success', shopController.postOrder);

router.get('/checkout/cancel', shopController.getCheckOut);

router.get('/orders',shopController.getOrders);
router.get('/orders/:orderId',shopController.getInvoice);

module.exports = router;