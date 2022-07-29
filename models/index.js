const bookshelf = require("../bookshelf") // by default if we import a folder, nodejs will look for index.js

//a bookshelf model represents one table
//name of the model (the first argument) must be 1. SINGULAR form of table name, 2. the first letter must be upper case (ie. products --> Product)
const Product = bookshelf.model("Product", {
    tableName: "products", //"products must match the table name on the database"

    //the name of the function is the name of the relationship
    //the name MUST match the model name, but singular and always lowercase
    category() {
        return this.belongsTo('Category')
    },
    tags() {
        return this.belongsToMany('Tag');
    }

})

const Category = bookshelf.model('Category',{
    tableName: 'categories',

    //the name of the function for a hasmany relationship should be the
    //plural form of the corresponding model in plural form and all lower case
    products() {
        return this.hasMany('Product');
    }

})

const Tag = bookshelf.model('Tag',{
    tableName: 'tags',
    products() {
        return this.belongsToMany('Product')
    }
})

const User = bookshelf.model('User',{
    tableName: 'users'
})

module.exports = {Product, Category, Tag, User};