const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
const cors = require('cors')
const session = require('express-session');
const csrf = require('csurf');
const flash = require('connect-flash');
const FileStore = require('session-file-store')(session);
require("dotenv").config();
const jwt = require('jsonwebtoken')

const app = express()

//enable cors. MUST BE BEFORE SESSIONS
app.use(cors()); 

app.set("view engine", "hbs")



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
    secret: process.env.SESSION_SECRET, //used to generate the session id
    resave: false, // do we automatically recreate the session even if there is no change to it (no in this case)
    saveUninitialized: true //if new browser connects do we create a new session
}));

//enable csruf protection
// app.use(csrf());
const csrfInstance = csrf();
app.use(function (req, res, next) {
    // console.log("checking for csrf exclusion")
    // exclude whatever url we want from CSRF protection
    if (req.url === "/checkout/process_payment" || req.url.slice(0,5) == '/api/'){
        console.log("detected")
        next();
    } else {
        csrfInstance(req, res, next);
    }
})

app.use(function (req, res, next) {
    if (req.csrfToken) {
        res.locals.csrfToken = req.csrfToken();
    }
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

app.use(function (req, res, next) {
    res.locals.user = req.session.user;
    next();
})

//middleware to share shopping cart data
app.use(async function (req, res, next) {
    if (req.session.user) {
        const cartItems = await getCart(req.session.user.id);
        res.locals.cartCount = cartItems.toJSON().length;
    }
    next();
})

//can create a middleware for cloudinary env data


//add in the router files
const landingRoutes = require('./routes/landing')
const productRoutes = require("./routes/products")
const userRoutes = require('./routes/users')
const cloudinaryRoutes = require('./routes/cloudinary.js')
const cartRoutes = require('./routes/cart');
const checkoutRoutes = require('./routes/checkout');
const { checkIfAuthenticated } = require("./middlewares");
const { getCart } = require("./dal/cart");
 

const api = {
    products: require('./routes/api/products'),
    user: require('./routes/api/user')
}


app.use("/", landingRoutes);
app.use("/products", productRoutes); // /products is a prefix to the routes in products.js, linear search matching
app.use('/users', userRoutes);
app.use('/cloudinary', cloudinaryRoutes);
app.use('/checkout', checkoutRoutes);
app.use('/cart',checkIfAuthenticated ,cartRoutes) //put the middleware here to apply to all routes in the cartRoutes
//register api routes. will be protected by jwt
app.use('/api/products', express.json(), api.products); //need express json to send the json data over to the endpoint
app.use('/api/user', express.json(), api.user)

async function main() {
}
main();

app.listen(process.env.PORT, () => {
    console.log("server started")
})