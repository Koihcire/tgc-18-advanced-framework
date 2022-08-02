const { CartItem } = require('../models');

const getCart = async (userId) => {
    return await CartItem.collection()
        .where({
            'user_id': userId
        }).fetch({
            require: false,
            withRelated: ['product', 'product.category']
        });
}

//find out which user is adding the item, which product is being added and the quantity
async function createCartItem(userId, productId, quantity) {
    //the name of the model is the table, an instance of the model is one row in the table
    const cartItem = new CartItem({
        'user_id': userId,
        'product_id': productId,
        'quantity': quantity
    })
    await cartItem.save();
    return cartItem;
}

//create a service layer to test the above 2 functions first for cross development

//check if product id is already in the user shopping cart
const getCartItemByUserAndProduct = async (userId, productId) => {
    return await CartItem.where({
        'user_id': userId,
        'product_id': productId
    }).fetch({
        require: false
    });
}

//update cart item quantity
const updateQuantity = async (userId, productId, newQuantity)=>{
    const cartItem = await getCartItemByUserAndProduct(userId, productId);
    if (cartItem) {
        //update the cart item
        cartItem.set ('quantity', newQuantity);
        await cartItem.save();
    } else {
        return false;
    }
}

const removeCartItem = async (userId, productId) => {
    const cartItem = await getCartItemByUserAndProduct(userId, productId);
    await cartItem.destroy();
    return true;
}

module.exports = {getCart, createCartItem, getCartItemByUserAndProduct, updateQuantity, removeCartItem}