const express = require('express');
const router = express.Router();
const {check,body} = require('express-validator');

const authController = require('../controllers/auth');
const User = require('../models/user');

router.get('/login',authController.getLogIn);

router.post('/login',[
    check('email','Please enter a vaild email address.').isEmail().normalizeEmail(),
    body('password','Password has to be vaild.').isLength({min:4}).isAlphanumeric().trim()
],authController.postLogIn);

router.post('/logout',authController.postLogOut);

router.get('/signup',authController.getSignUp);

router.post('/signup',[
    check('email','Please enter a vaild email.').isEmail().custom((value,{req})=>{
        return User.findOne({email:value}).then(userDoc=>{
            if(userDoc){
                return Promise.reject('This Email already exist. Try another email.')
            }
        })
    }).normalizeEmail(), 
    body('password','Password must be between 5 and 6 character.').isLength({min:4,max:6}).isAlphanumeric().trim(),
    body('confirmPassword').trim().custom((value,{req})=>{
        if(value !== req.body.password){
            throw new Error('Confirm password must be match to the password.')
        }
        return true;
    })
],authController.postSignUp);

router.get('/reset',authController.getReset);
router.post('/reset',authController.postReset);

router.get('/reset/:token',authController.getNewPassword);
router.post('/new-password',authController.postNewPassword);

module.exports = router;