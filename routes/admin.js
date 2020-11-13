const express = require('express');

const router = express.Router();
const {check,body} = require('express-validator');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

router.get('/add-product',isAuth,adminController.getAddProducts);

router.post('/add-product',
[
    body('title','Enter a title.Must be minimum 3 character').isString().isLength({min:3}).trim(),
    body('price','Enter a floating price.').isFloat(),
    body('description','Description must be 5 to 400 character').isLength({min:5, max:400}).trim()
],
isAuth,adminController.postAddProducts);

router.get('/products',isAuth,adminController.getProducts);

router.get('/edit-product/:productId',isAuth,adminController.getEditProducts);

router.post('/edit-product',
[
    body('title','Enter a title.Must be minimum 3 character').isString().isLength({min:3}).trim(),
    body('price','Enter a floating price.').isFloat(),
    body('description','Description must be 5 to 400 character').isLength({min:5, max:400}).trim()
],
isAuth,adminController.postEditProduct);

// router.post('/delete-product',isAuth,adminController.postDeleteProduct);
router.delete('/product/:productId',isAuth,adminController.postDeleteProduct)

module.exports = router;