const express = require("express");
const { route } = require("./landing");
const router = express.Router();
const { createProductForm, bootstrapField } = require("../forms")

//import in the product model
const { Product, Category } = require('../models');

router.get('/', async function (req, res) {

    //fetch all products
    let products = await Product.collection().fetch({
        "withRelated" : ['category'] //functions like a join
    });

    res.render("products/index", {
        products: products.toJSON()
    });
});

router.get('/create', async function (req, res) {
    // fetch all the categories 
    const categories = await Category.fetchAll().map(category => {
        return [category.get('id'), category.get('name')]
    })


    const productForm = createProductForm(categories);

    res.render("products/create", {

        //get html version of the form formatted using bootstrap
        form: productForm.toHTML(bootstrapField)
    });
})

router.post('/create', async function (req, res) {
    // fetch all the categories 
    const categories = await Category.fetchAll().map(category => {
        return [category.get('id'), category.get('name')]
    })

    const productForm = createProductForm(categories);

    productForm.handle(req, {
        //the form argument feeds back the input from the form
        "success": async function (form) {
            //insert into the products table using bookshelf
            //the model represents the table, one instance of the model represents a row
            const product = new Product();
            product.set("name", form.data.name);
            product.set("cost", form.data.cost);
            product.set("description", form.data.description);
            product.set("category_id", form.data.category_id);

            await product.save();
            res.redirect("/products")
        },
        "error": function (form) {
            res.render("products/create", {
                form: form.toHTML(bootstrapField)
            })
        },
        "empty": function (form) {

        }
    })
})

//target URL: /products/:product_id/update, but index.js already has a /products prefix
router.get('/:product_id/update', async (req, res) => {
    //get categories
    // fetch all the categories 
    const categories = await Category.fetchAll().map(category=>{
        return [category.get('id'), category.get('name')]
    })

    // retrieve the product
    // product.where == select * from products where product_id = <req.params.product_id> in mysql
    const product = await Product.where({
        'id': req.params.product_id
    }).fetch({
        require: true //means if not found will cause an exception (aka error)
    });

    const productForm = createProductForm(categories);

    // fill in the existing values into the form with the values retrieved
    productForm.fields.name.value = product.get('name');
    productForm.fields.cost.value = product.get('cost');
    productForm.fields.description.value = product.get('description');
    productForm.fields.category_id.value = product.get('category_id');

    res.render('products/update', {
        'form': productForm.toHTML(bootstrapField),
        'product': product.toJSON()
    })

})

router.post('/:product_id/update', async (req, res) => {
    // fetch all the categories 
    const categories = await Category.fetchAll().map(category=>{
        return [category.get('id'), category.get('name')]
    })

    // retrieve the product
    // product.where == select * from products where product_id = <req.params.product_id> in mysql
    const product = await Product.where({
        'id': req.params.product_id
    }).fetch({
        require: true //means if not found will cause an exception (aka error)
    });

    // process the form
    const productForm = createProductForm(categories);
    productForm.handle(req, {
        'success': async function (form) {
            //form arguments contain whatever the user has typed into the form
            //update products set name = ?, cost = ?, description = ? where product_id = ?
            product.set(form.data);
            await product.save();
            res.redirect("/products");
        },
        'error': async function (form) {
            res.render("products/update", {
                "form": form.toHTML(bootstrapField),
                "product": product.toJSON()
            })
        },
        "empty": async function (form) {
            res.render("products/update", {
                "form": form.toHTML(bootstrapField),
                "product": product.toJSON()
            })
        }
    })
})

router.get('/:product_id/delete', async (req, res) => {
    // fetch the product that we want to delete
    const product = await Product.where({
        'id': req.params.product_id
    }).fetch({
        require: true
    });

    res.render('products/delete', {
        'product': product.toJSON()
    })

});

router.post('/:product_id/delete', async (req, res) => {
    // fetch the product that we want to delete
    const product = await Product.where({
        'id': req.params.product_id
    }).fetch({
        require: true
    });
    await product.destroy();
    res.redirect('/products')
})

module.exports = router;