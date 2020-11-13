const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const UserSchema = new Schema({

    email:{type:String,required:true},
    password:{type: String,required:true},
    resetToken: {type: String,},
    resetTokenExpiration:{type:Date},  
    cart:{
        items:[
        {productId:{type: Schema.Types.ObjectID,
        ref:'Product',
        required:true},

        quantity:{type: Number,required:true}
    }
    ]}
})

UserSchema.methods.addToCart = function(product){

        const cartProductIndex = this.cart.items.findIndex(cp=>{
            console.log(cp.productId === product._id);
            return cp.productId.toString() === product._id.toString();
        });

        const updatedCartItems = [...this.cart.items];
        
        let newQuantity = 1;
        if(cartProductIndex >= 0){
            newQuantity = this.cart.items[cartProductIndex].quantity+1;
            updatedCartItems[cartProductIndex].quantity = newQuantity;
        }else{
            updatedCartItems.push({productId: product._id,quantity: newQuantity});
        }
        
        const updatedCart = {items: updatedCartItems};
        this.cart = updatedCart;
        return this.save();

}



UserSchema.methods.deleteFromCart = function(prodId){
        const updatedCartItems = this.cart.items.filter(item=>{
            return item.productId.toString() !== prodId.toString();
        });
        this.cart.items = updatedCartItems;
        return this.save();
}


UserSchema.methods.clearCart = function(){
    this.cart.items = [];
    this.save();
}



module.exports = mongoose.model('User',UserSchema);




























// const Sequelize = require('sequelize');
// const sequelize = require('../util/database');

// const User = sequelize.define('user',{
//     id:{
//     type:Sequelize.INTEGER,
//     autoIncrement:true,
//     primaryKey:true,
//     allowNull:false
//     },
//     name:{
//         type:Sequelize.STRING,
//         allowNull:false
//     },
//     email:{
//         type:Sequelize.STRING,
//         allowNull:false
//     }
// });

// module.exports = User;


// const mongodb = require('mongodb');
// const { get } = require('../routes/shop');

// const getDb = require('../util/database').getDb;

// const ObjectID = mongodb.ObjectID;

// class User{
//     constructor(username,email,cart,_id){
//         this.username = username;
//         this.email = email;
//         this.cart = cart;
//         this._id = _id;
//     }

//     save(){
//         const db = getDb();
//         return db.collection('users').insertOne(this).then(result=>{
//             console.log(result);
//         }).catch(err=>{
//             console.log(err);
//         })
//     }

//     addToCart(product){
//         const cartProductIndex = this.cart.items.findIndex(cp=>{
//             console.log(cp.productId === product._id);
//             return cp.productId.toString() === product._id.toString();
//         });

//         const updatedCartItems = [...this.cart.items];
        
//         let newQuantity = 1;
//         if(cartProductIndex >= 0){
//             newQuantity = this.cart.items[cartProductIndex].quantity+1;
//             updatedCartItems[cartProductIndex].quantity = newQuantity;
//         }else{
//             updatedCartItems.push({productId: new ObjectID(product._id),quantity: newQuantity});
//         }
        
//         const updatedCart = {items: updatedCartItems};
//         const db = getDb();
//         return db.collection('users').updateOne({_id: this._id},{$set: {cart:updatedCart}})
//     }

//     getCart(){
//         const db = getDb();
//         const productIds = this.cart.items.map(i=>{
//             return i.productId;
//         });
//         return db.collection('products').find({_id: {$in: productIds}}).toArray().then(products=>{
//             return products.map(p=>{
//                 return{
//                     ...p,
//                     quantity: this.cart.items.find(i=>{
//                         return i.productId.toString() === p._id.toString();
//                     }).quantity
//                 }
//             })
//         })
//     }


//     deleteFromCart(prodId){
//         const db = getDb();
//         const updatedCartItems = this.cart.items.filter(item=>{
//             return item.productId.toString() !== prodId.toString();
//         });
//         return db.collection('users').updateOne({_id: new ObjectID(this._id)},{$set:{cart: {items: updatedCartItems}}})
//     }

//     addOrder(){
//         const db = getDb();
//         return this.getCart().then(products=>{
//             const order = {
//                 items: products,
//                 user:{
//                     _id: new ObjectID(this._id),
//                     username: this.username,
//                 } 
//              };
//             return db.collection('orders').insertOne(order)

//         }).then(result=>{
//             this.cart = {items: []};
//             return db.collection('users').updateOne({_id: new ObjectID(this._id)},{$set:{cart:{items:[]}}});
//         })
//     }

//     getOrders(){
//         const db = getDb();
//         return db.collection('orders').find({'user._id': new ObjectID(this._id)}).toArray()
        
//     }

//     static findByPk(userId){
//         const db = getDb();
//         return db.collection('users').findOne({_id: new ObjectID(userId)}).then(result=>{
//             console.log(result);
//             return result;
//         }).catch(err=>{
//             console.log(err);
//         })
//     }
// }

// module.exports = User;