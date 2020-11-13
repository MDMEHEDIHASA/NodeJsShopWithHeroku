const mongodb =require('mongodb');
const MongoCilent = mongodb.MongoCilent;
let _db;


const mongoConnect = ()=>{
    return new Promise((resolve,reject)=>{
        MongoCilent.connect('mongodb+srv://hasan:<password>@cluster0.k9uip.mongodb.net/<dbname>?retryWrites=true&w=majority',{useNewUrlParser:true,useUnifiedTopology: true }).then(cilent=>{
            _db = cilent.db();
            resolve(_db);
        }).catch(err=>{
            reject(err);
        })
    })
}

const getDb = ()=>{
    if(_db){
        return _db;
    }else{
        throw 'error';
    }
}
