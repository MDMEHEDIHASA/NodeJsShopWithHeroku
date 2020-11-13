const { ObjectID } = require('mongodb');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    title:{
        type: String,
        required: true,
    },
    imageUrl:{
        type: String,
        required: true,
    },
    price:{
        type: Number,
        required: true,
    },
    description:{
        type: String,
        required: true
    },
    userId:{
        type:Schema.Types.ObjectID,
        ref: 'User',
        required:true
    }
});

module.exports =  mongoose.model('Product',ProductSchema);































// // const Sequelize = require('sequelize');



// // const sequelize = require('../util/database');

// // const mongoConnect = require('../util/database').mongoConnect;
// const mongodb = require('mongodb');
// const getDb = require('../util/database').getDb;


// class Product{
//     constructor(title,imageUrl,price,description,_id,userId){
//         this.title = title;
//         this.imageUrl = imageUrl;
//         this.price = price;
//         this.description = description;
//         this._id = _id ? new mongodb.ObjectID(_id) : null;
//         this.userId = userId;
//     }

//     save(){
//         let dbOp;
//         const db = getDb();
//         if(this._id){
//             dbOp = db.collection('products').updateOne({_id: this._id},{$set: this});

//         }else{
//             dbOp = db.collection('products').insertOne(this);
//         }
//         // db.collection('products').insertOne(this)
//         return dbOp.then(result=>{
//             console.log(result);
//         }).catch(err=>{
//             console.log(err);
//         })
//     }

//     static fetchAll(){
//         const db = getDb();
//         return db.collection('products').find().toArray().then(products=>{
//             console.log(products);
//             return products;
//         }).catch(err=>{
//             console.log(err);
//         })
//     }

//     static findByPk(prodId){
//         const db = getDb();
//         return db.collection('products').find({_id: new mongodb.ObjectID(prodId)}).next().then(product=>{
//             console.log(product);
//             return product;
//         }).catch(err=>{
//             console.log(err);
//         })
//     }

//     update(prodId){
//         const db = getDb();
//         return db.collection('products').updateOne({_id: new mongodb.ObjectID(productId)},{$set: this});
//     }

//     static deleteBYId(prodId){
//         const db = getDb();
//         return db.collection('products').deleteOne({_id: new mongodb.ObjectID(prodId)}).then(result=>{
//             console.log(result);
//         }).catch(err=>{
//             console.log(err);
//         })
//     }
// }


// // const Product = sequelize.define('product',{
// //     id:{
// //         type:Sequelize.INTEGER,
// //         autoIncrement:true,
// //         allowNull:false,
// //         primaryKey:true,
// //     },
    
// //     title:{
// //         type:Sequelize.STRING,
// //         allowNull:false
// //     },
// //     imageUrl:{
// //         type:Sequelize.STRING,
// //         allowNull:false
// //     },
// //     description:{
// //         type:Sequelize.STRING,
// //         allowNull:false
// //     },
// //     price:{
// //         type:Sequelize.INTEGER,
// //         allowNull:false
// //     }
    
    
// // });

// module.exports = Product;