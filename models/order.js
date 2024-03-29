const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const OrderSchema = new Schema({
    products:[{
        product:{type:Object,required:true},
        quantity:{type: Number,required:true},
        
    }],
    user:{
        email:{type:String,required:true},
        userId:{type: Schema.Types.ObjectId,ref:'User',required:true}
    },
});

module.exports = mongoose.model('Order',OrderSchema);


// const Sequelize  = require('sequelize');
// const sequelize = require('../util/database');

// const Order = sequelize.define('order',{
//     id:{
//         type:Sequelize.INTEGER,
//         autoIncrement:true,
//         primaryKey:true,
//         allowNull:false,

//     }
// });

// module.exports = Order;