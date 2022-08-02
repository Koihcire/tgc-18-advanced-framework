const cartServices = require('../services/cart')
const express = require('express')

const router = express.Router();

router.get('/', async function (req,res){
    const cartItems = await cartServices.getCart(req.session.user.id);
    res.render('cart/index', {
        cartItems: cartItems.toJSON()
    })
})

router.get('/:product_id/add', async function (req,res){
    const userId = req.session.user.id;
    const productId = req.params.product_id;
    await cartServices.addToCart(userId, productId, 1);
    req.flash('success_messages', 'Product added to cart successfully');
    res.redirect('/cart/')
})

router.post('/:product_id/update', async function (req,res){
    const userId = req.session.user.id;
    const productId = req.params.product_id;
    if(req.body.newQuantity > 0){
        await cartServices.updateQuantity(userId, productId, req.body.newQuantity);
        req.flash('success_messages', 'quantity update')
        res.redirect('/cart')
    } else {
        req.flash('error_messages', "quantity must be greater than 0")
        res.redirect('/cart')
    }
})

router.get('/:product_id/delete', async function(req,res){
    await cartServices.remove(req.session.user.id, req.params.product_id)
    req.flash('success_messages', 'product removed from shopping cart')
    res.redirect('/cart')
})

module.exports = router
