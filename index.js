const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
const session = require ('express-session');
const csrf = require('csurf');
const flash = require('connect-flash');
const FileStore = require('session-file-store')(session);
require("dotenv").config();

const app = express()

app.set ("view engine", "hbs")

//set up static folder
app.use(express.static("public"))

//set up enable forms
app.use(
    express.urlencoded({
        extended: false
    })
);

//set up sessions
app.use(session({
    store: new FileStore(), //means we want to use files to store sessions
    secret: 'keyboard cat', //used to generate the session id
    resave: false, // do we automatically recreate the session even if there is no change to it (no in this case)
    saveUninitialized: true //if new browser connects do we create a new session
}));

//enable csruf protection
app.use(csrf());

app.use(function(req,res,next){
    res.locals.csrfToken = req.csrfToken();
    next();
})

//register flash messages
app.use(flash());
//setup a middleware
app.use(function (req, res, next) {
    //res.locals will contain all variables available to hbs files
    res.locals.success_messages = req.flash("success_messages"); 
    res.locals.error_messages = req.flash("error_messages");
    next();
});

//set up wax-on
wax.on(hbs.handlebars);
wax.setLayoutPath("./views/layouts");

//add in the router files
const landingRoutes = require('./routes/landing')
const productRoutes = require("./routes/products")
const userRoutes = require('./routes/users')

app.use("/", landingRoutes)
app.use("/products", productRoutes) // /products is a prefix to the routes in products.js, linear search matching
app.use('/users', userRoutes)

async function main(){
}
main();

app.listen(3000,()=>{
    console.log("server started")
})