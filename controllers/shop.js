const fs = require('fs');
const path  = require('path');

const PDFDocument = require('pdfkit');
const stripe = require('stripe')(process.env.Stripe_Key);

// ('sk_test_51HhGcuIcgvz2PzTpdrjL2UTP8JBGIMdU929wrwYFukFdoGbofGqWnVo4QZgpWstbaCzxRED8jZPkGCk7CNfVMI5M00uKUJrf5o')

const Product = require('../models/product');
const Order = require('../models/order');



const Items_Per_page = 1;

exports.getProducts = (req,res,next)=>{
    const page = +req.query.page || 1;
    // console.log(page);
    let totalItems;
    Product.find().countDocuments().then(totalProducts=>{
        totalItems = totalProducts;
        return Product.find().skip((page-1)*Items_Per_page).limit(Items_Per_page)
    }).then(products=>{
        // console.log(products);
        res.render('shop/product-list',{
            prod:products,
            path:'/products',
            currentPage:page,
            hasNextPage: page*Items_Per_page < totalItems,
            nextPage: page+1,
            hasPreviousPage: page > 1,
            previousPage: page-1,
            lastPage:Math.ceil(totalItems/Items_Per_page),
            
        });
    }).catch(err=>{
        // res.redirect('/500');
       const error= new Error(err);
       error.httpStatusCode = 500;
       return next(error);
   })
    
}



exports.getIndex = (req,res,next)=>{
    let message = req.flash('error');
    if(message.length > 0){
        message = message[0];
    }else{
        message = null;
    }
    const page = +req.query.page || 1;
    // console.log(page);
    let totalItems;
    Product.find().countDocuments().then(totalProducts=>{
        totalItems = totalProducts;
        return Product.find().skip((page-1)*Items_Per_page).limit(Items_Per_page)
    }).then(products=>{
        // console.log(products);
        res.render('shop/index',{
            prod:products,
            path:'/',
            erroMessage: message,
            currentPage:page,
            hasNextPage: page*Items_Per_page < totalItems,
            nextPage: page+1,
            hasPreviousPage: page > 1,
            previousPage: page-1,
            lastPage:Math.ceil(totalItems/Items_Per_page),
            
        });
    }).catch(err=>{
        // res.redirect('/500');
       const error= new Error(err);
       error.httpStatusCode = 500;
       return next(error);
   })
    
}


exports.getCart = (req,res,next)=>{
    req.user.populate('cart.items.productId')
    .execPopulate()
    .then(user=>{
        const products = user.cart.items;
        console.log(user.cart.items);
        res.render('shop/cart',{
            path:'/cart',
            prod:products,
            
        });
    }).catch(err=>{
        // res.redirect('/500');
       const error= new Error(err);
       error.httpStatusCode = 500;
       return next(error);
   })

}




exports.postCart = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findById(prodId).then(product=>{
        req.user.addToCart(product);
        res.redirect('/cart');
    }).then(result=>{
        console.log(result);
    }).catch(err=>{
        // res.redirect('/500');
       const error= new Error(err);
       error.httpStatusCode = 500;
       return next(error);
   });
  };


exports.postDeleteCart = (req,res,next)=>{
    const prodId = req.body.productId;
    req.user.deleteFromCart(prodId).then(product=>{
            res.redirect('/cart');
        }).catch(err=>{
            // res.redirect('/500');
           const error= new Error(err);
           error.httpStatusCode = 500;
           return next(error);
       });
}

exports.getOrders = (req,res,next)=>{
    Order.find({'user.userId': req.user._id}).then(orders=>{
        console.log(orders);
        res.render('shop/orders',{
            path:'/orders',
            pageTitle:'Your Orders',
            orders:orders,
            
        });
    }).catch(err=>{
        // res.redirect('/500');
       const error= new Error(err);
       error.httpStatusCode = 500;
       return next(error);
   })
}


exports.postOrder = (req,res,next)=>{
    req.user.populate('cart.items.productId').execPopulate().then(user=>{
        const products = user.cart.items.map(i=>{
            return {product:{...i.productId._doc},quantity:i.quantity} 
        })
        const order = new Order({
            user:{
                email: req.user.email,
                userId: req.user,
            },
            products:products,
        });
        return order.save();
    }).then(()=>{
        return req.user.clearCart();
    }).then(result=>{
        res.redirect('/orders');
    }).catch(err=>{
        // res.redirect('/500');
       const error= new Error(err);
       error.httpStatusCode = 500;
       return next(error);
   })
}





exports.getProductDetails = (req,res,next)=>{
    const prodId = req.params.productId;
    Product.findById(prodId).then((products)=>{
        res.render('shop/product-detail',{
            product:products,
            path:'/products',
            pageTitle:'Product Detail',
            
        })
    }).catch(err=>{
        // res.redirect('/500');
       const error= new Error(err);
       error.httpStatusCode = 500;
       return next(error);
   })

}



exports.getCheckout = (req, res, next) => {
    let totals =0;
    let products;
    req.user.populate('cart.items.productId')
    .execPopulate().then(user=>{
        totals = 0
        products = user.cart.items;
        console.log(products);
        products.forEach(p=>{
            totals += p.quantity * p.productId.price;
        });
        console.log(totals);
        return stripe.checkout.sessions.create({
            payment_method_types:['card'],
            line_items: products.map(p=>{
                return{
                    name:p.productId.title,
                    description:p.productId.description,
                    amount: p.productId.price * 100,
                    currency: 'usd',
                    quantity:p.quantity,
                };
            }),
            success_url: req.protocol + '://' + req.get('host') + '/checkout/success', // => http://localhost:3000
            cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancel'

        });
    }).then(session=>{
        console.log('Session for payment',session);
        res.render('shop/checkout',{
            pageTitle:"checkout",
            path:'/checkout',
            prod:products,
            totals:totals,
            sessionId:session.id,

        })
    }).catch(err=>{
         // res.redirect('/500');
       const error= new Error(err);
       error.httpStatusCode = 500;
       return next(error);
    })
};


exports.checkOutSuccess = (req,res,next)=>{
    req.user.populate('cart.items.productId').execPopulate().then(user=>{
        const products = user.cart.items.map(i=>{
            return {product:{...i.productId._doc},quantity:i.quantity} 
        })
        const order = new Order({
            user:{
                email: req.user.email,
                userId: req.user,
            },
            products:products,
        });
        return order.save();
    }).then(()=>{
        return req.user.clearCart();
    }).then(result=>{
        res.redirect('/orders');
    }).catch(err=>{
        // res.redirect('/500');
       const error= new Error(err);
       error.httpStatusCode = 500;
       return next(error);
   })
}






exports.getInvoice = (req,res,next)=>{
    const orderId = req.params.orderId;
    
    Order.findById(orderId).then(order=>{
        if(!order){
            return next(new Error('No order found.'));
        }
        if(order.user.userId.toString() !== req.user._id.toString()){
            return next(new Error('Unauthorized'));
        }
        const invoiceName = 'invoice-'+orderId+'.pdf';
        const invoicePath = path.join('invoices',invoiceName);

        const pdfDoc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            'inline; filename="' + invoiceName + '"'
          );
        pdfDoc.pipe(fs.createWriteStream(invoicePath));
        pdfDoc.pipe(res);
        pdfDoc.fontSize(25).text('Invoice',{
            underline:true
        });
        pdfDoc.text('-------------------------------');
        let totalPrice = 0;
        order.products.forEach(prod=>{
            totalPrice += prod.quantity * prod.product.price;
            pdfDoc.text(prod.product.title + '-' + prod.quantity + ' x '+ '$' + prod.product.price);
        });
        pdfDoc.text(`Total Price:${totalPrice}`);
        pdfDoc.end();

    })
}