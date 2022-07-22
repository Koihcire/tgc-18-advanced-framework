const express = require("express");
const { route } = require("./landing");
const router = express.Router();
const {createProductForm, bootstrapField} = require("../forms")

//import in the product model
const {Product} = require('../models');

router.get('/', async function(req,res){

    //fetch all products
    let products = await Product.collection().fetch();

    res.render("products/index", {
        products : products.toJSON() 
    });
});

router.get('/create', function(req,res){
    const productForm = createProductForm();

    res.render("products/create",{

        //get html version of the form formatted using bootstrap
        form: productForm.toHTML(bootstrapField)
    });
})

router.post('/create', function(req,res){
    const productForm = createProductForm();

    productForm.handle(req,{
        //the form argument feeds back the input from the form
        "success": async function(form){
            //insert into the products table using bookshelf
            //the model represents the table, one instance of the model represents a row
            const product = new Product();
            product.set("name", form.data.name);
            product.set("cost", form.data.cost);
            product.set("description", form.data.description);
            
            await product.save();
            res.redirect("/products")
        },
        "error": function(form){
            res.render("products/create",{
                form: form.toHTML(bootstrapField)
            })
        },
        "empty": function(form){

        }
    })
})

module.exports = router;