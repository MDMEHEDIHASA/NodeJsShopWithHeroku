const express = require('express');
const router = express.Router();

const shopController = require('../controllers/shop');
const isAuth = require('../middleware/is-auth');

router.get('/',shopController.getIndex);


router.get('/products',shopController.getProducts);

router.get('/products/:productId',isAuth,shopController.getProductDetails);


router.get('/cart',isAuth,shopController.getCart);

router.post('/cart',isAuth,shopController.postCart);

router.post('/delete-cart',isAuth,shopController.postDeleteCart);

router.get('/orders',isAuth,shopController.getOrders);

router.post('/create-order',isAuth,shopController.postOrder);

router.get('/order/:orderId',isAuth,shopController.getInvoice);

router.get('/checkout',isAuth,shopController.getCheckout);
router.get('/checkout/success',isAuth,shopController.checkOutSuccess);
router.get('/checkout/cancel',isAuth,shopController.getCheckout);


module.exports = router;