const bookshelf = require("../bookshelf") // by default if we import a folder, nodejs will look for index.js

//a bookshelf model represents one table
//name of the model (the first argument) must be 1. SINGULAR form of table name, 2. the first letter must be upper case (ie. products --> Product)
const Product = bookshelf.model("Product", {
    tableName: "products" //"products must match the table name on the database"
})
module.exports = {Product};