// const mongodb = require('mongodb');
const Product = require('../models/product');
// const ObjectID = mongodb.ObjectID;
const {validationResult} = require('express-validator');
const fileHelper = require('../util/file');


exports.getAddProducts = (req,res,next)=>{

    res.render('admin/edit-product',{
        pageTitle:'Add Product',
        path:'/admin/add-product',
        editing:false,
        errorMessage:null,
        hasError:false,
        prod:{
            title:'',
            imageUrl:'',
            price:'',
            description:'',
        },
        validationErrors: [],
    });
}

exports.postAddProducts = (req,res,next)=>{
    const title = req.body.title;
    const image = req.file;
    const price = req.body.price;
    const description = req.body.description;

    console.log(image);
    if(!image){
        return res.status(400).render('admin/edit-product',{
            pageTitle:'Add Product',
            path:'/admin/add-product',
            editing:false,
            hasError:true,
            prod:{
                title:title,
                price:price,
                description:description,
            },
            errorMessage: 'Attach a Image file',
            validationErrors: [],
        });
    }
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        console.log(errors.array());
        return res.status(400).render('admin/edit-product',{
            pageTitle:'Add Product',
            path:'/admin/add-product',
            editing:false,
            errorMessage: errors.array()[0].msg,
            hasError:true,
            prod:{
                title:title,
                price:price,
                description:description,
            },
            validationErrors: errors.array(),
        });
    }
    
    const imageUrl = image.path;

    const product = new Product({
        title: title,
        imageUrl: imageUrl,
        price: price,
        description: description,
        userId: req.user
    });
    product.save().then(products=>{
        res.redirect('/');
    }).catch(err=>{
         // res.redirect('/500');
        const error= new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    })
}

exports.getEditProducts = (req,res,next)=>{
    
    const editMode = req.query.edit;
    if(!editMode){
        return res.redirect('/')
    }
    const prodId = req.params.productId;
    Product.findById(prodId)
    .then(product=>{
        
        if(!product){
            return res.redirect('/')
        }
        res.render('admin/edit-product',{
            prod:product,
            pageTitle:'Edit Product',
            path:'/admin/edit-product',
            editing:editMode,
            hasError:false,
            errorMessage:null,
            validationErrors: [],
        });
    }).catch(err=>{
        // res.redirect('/500');
       const error= new Error(err);
       error.httpStatusCode = 500;
       return next(error);
   })
}


exports.postEditProduct = (req,res,next)=>{
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const image = req.file;
    const updatedPrice = req.body.price;
    const updatedDescription = req.body.description;
    
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        console.log(errors.array());
        return res.status(400).render('admin/edit-product',{
            pageTitle:'Edit Product',
            path:'/admin/edit-product',
            editing:true,
            prod:{
                title:updatedTitle,
                price:updatedPrice,
                description:updatedDescription,
                _id:prodId
            },
            errorMessage:errors.array()[0].msg,
            hasError:true,
            validationErrors: errors.array(),
            
        });
    }
     
    Product.findById(prodId).then(product=>{
        if(product.userId.toString() !== req.user._id.toString()){
            return res.redirect('/')
        }
        product.title = updatedTitle;
        if(image){
            fileHelper.deleteFile(product.imageUrl);
            product.imageUrl = image.path;
        }
        product.price = updatedPrice;
        product.description = updatedDescription;

        return product.save()
        .then(result=>{
            console.log('UPDATED PRODUCT!');
            res.redirect('/admin/products');
        });
    }).catch(err=>{
        // res.redirect('/500');
       const error= new Error(err);
       error.httpStatusCode = 500;
       return next(error);
   })
}


exports.postDeleteProduct = (req,res,next)=>{
    const prodId = req.params.productId;
    Product.findById(prodId).then(prodId).then(product=>{
        if(!product){
            return next(new Error('Product not found'));
        }
        fileHelper.deleteFile(product.imageUrl);
        return Product.deleteOne({_id: prodId, userId: req.user._id})
    }).then(result=>{
        // res.redirect('/admin/products');
        res.json({message:"Success"});
    }).catch(err=>{
        // res.redirect('/500');
    //    const error= new Error(err);
    //    error.httpStatusCode = 500;
    //    return next(error);
    res.json({message:"failure"});
   })
}


exports.getProducts = (req,res,next)=>{
   Product.find({userId: req.user._id})
//    .select('title imageUrl -_id')
//    .populate('userId')
   .then(products=>{
       console.log(products);
        res.render('admin/products',{
            prod:products,
            path:'/admin/products',
            
        })
    }).catch(err=>{
        // res.redirect('/500');
       const error= new Error(err);
       error.httpStatusCode = 500;
       return next(error);
   })
    
}

