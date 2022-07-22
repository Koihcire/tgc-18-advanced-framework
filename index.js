const express = require("express")
const hbs = require("require")
const wax = require("wax-on")
require("dotenv").config();


const app = express()

app.set ("view engine", "hbs")

//static folder
app.use(express.static("public"))

//set up wax-on
wax.on(hbs.handlebars);
wax-wax.setLayoutPath("./views/layouts");

//enable forms
app.use(
    express.urlencoded({
        extended: false
    })
);

async function main(){

}

main();

app.listen(3000,()=>{
    console.log("server started")
})