// const Sequelize = require('sequelize');

// const sequelize = new Sequelize('nodejs','root','hasan',{
//     dialect:'mysql',
//     host:'localhost'
// });


// module.exports = sequelize;






// const mongodb = require('mongodb');

// const MongoClient = mongodb.MongoClient;

// let _db;

// const mongoConnect = ()=>{
//     return new Promise((resolve,reject)=>{
//         MongoClient.connect('mongodb+srv://hasan:4545fuck@cluster0.k9uip.mongodb.net/shop2?retryWrites=true&w=majority',{useNewUrlParser:true,useUnifiedTopology: true })
//         .then(client=>{
//             _db = client.db();
//             resolve(_db);
//         }).catch(err=>{
//             reject(err);
//             throw(err);
//         })
//     })
// }


// const getDb = ()=>{
//     if(_db){
//         return _db;
//     }
//     throw 'No database found';
// }

// exports.mongoConnect = mongoConnect;
// exports.getDb = getDb;