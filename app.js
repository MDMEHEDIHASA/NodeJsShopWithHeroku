const https = require('https');
const fs = require('fs');
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');
const helmet = require('helmet');
const compression  = require('compression');
const morgan = require('morgan');

const app = express();

app.set('view engine','ejs');
app.set('views','views');

// const mongoConnect = require('./util/database').mongoConnect;
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const MongoDB_URI = `mongodb+srv://${process.env.Mongo_User}:${process.env.Mongo_password}@cluster0.k9uip.mongodb.net/${process.env.Mongo_DB}?retryWrites=true&w=majority`;

// 'mongodb+srv://hasan:4545fuck@cluster0.k9uip.mongodb.net/shop2?retryWrites=true&w=majority'

const store = new MongoDBStore({
    uri:MongoDB_URI,
    collection:'sessions'
})

const csrfProtection = csrf();

// const privateKey = fs.readFileSync('server.key');
// const certificate = fs.readFileSync('server.cert');


const User = require('./models/user');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

const errorController = require('./controllers/error');




app.use(express.static('public'));
app.use("/images",express.static('images'));
app.use(bodyParser.urlencoded({extended:false}));


const fileFilter = (req,file,cb)=>{
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg'){
        cb(null,true);
    }else{
        cb(null,false);
    }
    
}

const filteStorage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'images');
    },
    filename:(req,file,cb)=>{
        cb(null,Math.random()+'-'+file.originalname);
    }
})

app.use(multer({storage:filteStorage,fileFilter:fileFilter}).single('image'));


app.use(session({
    secret: 'My secret',
    store:store,
    resave:false,
    saveUninitialized:false,
}))


const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })

app.use(csrfProtection);
app.use(flash());
// app.use(helmet()); //it is important for secure product api key but with cart we donot use it.
app.use(compression());
app.use(morgan("combined",{ stream: accessLogStream }))


app.use((req,res,next)=>{
    res.locals.isAuthinticate = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
})




app.use((req,res,next)=>{
    if(!req.session.user){
        return next();
    }
    User.findById(req.session.user._id).then(user=>{
        // throw new Error('Dummy');
        req.user = user;
        next();
    }).catch(err=>{
        next(new Error(err));
        // console.log(err);
    })
    
})




app.use('/admin',adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);



app.get('/500',errorController.get500);
app.use(errorController.getError);




app.use((error,req,res,next)=>{
    res.status(500).render('500',{
        pageTitle: 'Error!',
        path:'/500',
        isAuthinticate:req.session.isLoggedIn,
    })
})


mongoose.connect(MongoDB_URI,{useNewUrlParser:true,useUnifiedTopology: true })
.then((result)=>{
    // https
    // .createServer({key:privateKey,cert:certificate},app)
    // .listen(process.env.PORT||3000);
    app.listen(process.env.PORT||3000);
}).catch(err=>{
    console.log(err);
})