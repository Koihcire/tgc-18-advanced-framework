const express = require("express")
const hbs = require("hbs")
const wax = require("wax-on")
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

//set up wax-on
wax.on(hbs.handlebars);
wax.setLayoutPath("./views/layouts");

//add in the router files
const landingRoutes = require('./routes/landing')
const productRoutes = require("./routes/products")

app.use("/", landingRoutes)
app.use("/products", productRoutes) // /products is a prefix to the routes in products.js, linear search matching



async function main(){
}
main();

app.listen(3000,()=>{
    console.log("server started")
})