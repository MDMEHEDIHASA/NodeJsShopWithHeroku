const express = require('express');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const crypto = require('crypto');
const {validationResult} = require('express-validator');

const User = require('../models/user');




const transport = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: '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'
        
    }
}));

 


exports.getLogIn = (req,res,next)=>{
    let message = req.flash('error');
    if(message.length>0){
        message = message[0];
    }else{
        message = null;
    }
    res.render('auth/login',{
        pageTitle: 'Login',
        path:'/login',
        errorMessage:message,
        oldInput:{
            email:'',
            password:''
        },
        validationErrors:[],
    });
}


exports.postLogIn = (req,res,next)=>{
    const email = req.body.email;
    const password = req.body.password;
   
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        console.log(errors.array());
        return res.status(400).render('auth/login',{
            pageTitle: 'Login',
            path:'/login',
            errorMessage:errors.array()[0].msg,
            oldInput:{
                email:email,
                password:password
            },
            validationErrors:errors.array(),
        })
    }
   
    User.findOne({email:email}).then(user=>{
        if(!user){
            // req.flash('error','Invaild email or password');
            // return res.redirect('/login');
            return res.status(400).render('auth/login',{
                pageTitle: 'Login',
                path:'/login',
                errorMessage: 'Invaild email or password',
                oldInput:{
                    email:email,
                    password:password
                },
                validationErrors:errors.array()
            })
        }
        bcrypt.compare(password,user.password).then(doMatch=>{
            if(!doMatch){
                // req.flash('error','Invaild email or password');
                // return res.redirect('/login');
                return res.status(400).render('auth/login',{
                    pageTitle: 'Login',
                    path:'/login',
                    errorMessage: 'Invaild email or password',
                    oldInput:{
                        email:email,
                        password:password
                    },
                    validationErrors:errors.array()
                })
            }
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save(()=>{
                res.redirect('/');
            })
        }).catch(err=>{
            console.log(err);
            res.redirect('/login');
        })
    }).catch(err=>{
        // res.redirect('/500');
       const error= new Error(err);
       error.httpStatusCode = 500;
       return next(error);
   })
}

exports.postLogOut = (req,res,next)=>{
    req.session.destroy(()=>{
        res.redirect('/');
    });
}


exports.getSignUp = (req,res,next)=>{
    let message = req.flash('error');
    if(message.length>0){
        message = message[0];
    }else{
        message = null;
    }
    res.render('auth/signup',{
        path:'/signup',
        pageTitle:'Sign Up',
        errorMessage:message,
        oldInput:{
            email:'',
            password:'',
            confirmPassword:''
        },
        validationErrors:[],
        
    })
}


exports.postSignUp = (req,res,next)=>{
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        console.log(errors.array())
        return res.status(400).render('auth/signup',{
            path:'/signup',
            pageTitle:'Sign Up',
            errorMessage:errors.array()[0].msg,
            oldInput:{
                email: email,
                password: password,
                confirmPassword: confirmPassword
            },
            validationErrors: errors.array(),
        })
    }

    // User.findOne({email:email}).then(userDoc=>{
    //     if(userDoc){
    //         req.flash('error','Try Another Email.This email already exist.')
    //         return res.redirect('/signup');
    //     }
        bcrypt.hash(password,12).then(hashPassword=>{
            const user = new User({
                email: email,
                password: hashPassword,
                cart:{
                    items:[],
                }
            })
            return user.save();  
        }).then(result=>{
            res.redirect('/login');
            return transport.sendMail({
                to:email,
                from:'mhd7894@outlook.com',
                subject:'Sign Up Succeeded!',
                text:'Thank you for Sign Up. Keep in touch with us.',
                html:'<h1>You Successfully Signed Up</h1>'
            });
        }).catch(err=>{
            // res.redirect('/500');
           const error= new Error(err);
           error.httpStatusCode = 500;
           return next(error);
       })
    
    
}


exports.getReset = (req,res,next)=>{
    let message = req.flash('error');
    if(message.length > 0){
        message = message[0];
    }else{
        message = null;
    }
    res.render('auth/reset',{
        path:'/reset',
        pageTitle:'Reset Page',
        errorMessage:message,
    })
};


exports.postReset = (req,res,next)=>{
    const email = req.body.email;
    User.findOne({email:email}).then(user=>{
        crypto.randomBytes(32,(err,buffer)=>{
            if(err){
                console.log(err);
                return res.redirect('/login');
            }
            const token = buffer.toString('hex');
            if(!user){
                req.flash('error','EMail not found.')
                return res.redirect('/reset');
            }
            user.resetToken = token;
            user.resetTokenExpiration = Date.now() + 3600000;
            user.save().then(result =>{
                req.flash('error','We send an link to your email to reset password. Press refresh button to remove the letter');
                res.redirect('/');
                transport.sendMail({
                    to:email,
                    from:'mhd7894@outlook.com',
                    subject:'Sign Up Succeeded!',
                    text:'Thank you for Sign Up. Keep in touch with us.',
                    html:`
                    <p> You have requested for change password</p>
                    <p>click this  <a href="http://localhost:3000/reset/${token}"> link </a> to reset password.</p>
                    
                    `
                });
                
            });
        })
    }).catch(err=>{
        // res.redirect('/500');
       const error= new Error(err);
       error.httpStatusCode = 500;
       return next(error);
   })
};



exports.getNewPassword  = (req,res,next)=>{
    const token = req.params.token;
    User.findOne({resetToken:token,resetTokenExpiration: {$gt: Date.now()}}).then(user=>{
        let message = req.flash('error');
        if(message.length >0){
            message = message[0];
        }else{
            message = null;
        }
        res.render('auth/new-password',{
            path:'/new-password',
            pageTitle:'New Password',
            userId: user._id.toString(),
            passwordToken: token,
            errorMessage: message
        })
    }).catch(err=>{
        // res.redirect('/500');
       const error= new Error(err);
       error.httpStatusCode = 500;
       return next(error);
   })
}

exports.postNewPassword = (req,res,next)=>{
    const passwordToken = req.body.passwordToken;
    const userId = req.body.userId;
    const newPassword = req.body.password;
    let resetUser;
    User.findOne({_id: userId,resetToken:passwordToken,resetTokenExpiration:{$gt:Date.now()}}).then(user=>{
        resetUser =user;
        return bcrypt.hash(newPassword,12)
    }).then(hashPassword=>{
        resetUser.password = hashPassword;
        resetUser.resetToken = undefined;
        resetUser.resetTokenExpiration = undefined;
        return resetUser.save();
    }).then(result=>{
        res.redirect('/');
    }).catch(err=>{
        // res.redirect('/500');
       const error= new Error(err);
       error.httpStatusCode = 500;
       return next(error);
   })
}