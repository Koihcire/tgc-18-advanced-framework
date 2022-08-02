const cartDataLayer = require('../dal/cart');

async function addToCart(userId, productId, quantity) {
    //1. check if product id is already in the user shopping cart
    const cartItem = await cartDataLayer.getCartItemByUserAndProduct(userId, productId)
    if (!cartItem) {
        //2. if not then create new
        // check if the user has added the product to the shopping cart before
        await cartDataLayer.createCartItem(userId, productId, quantity)
    } else {
        //3. if yest then increase the quantity in the cart item by 1
        await cartDataLayer.updateQuantity(userId, productId, cartItem.get("quantity")+1)
    }
    return true;
}

async function getCart(userId) {
    return cartDataLayer.getCart(userId)
}

async function updateQuantity(userId, productId, newQuantity){
    //check if the quantity matches the business rule (eg, must have enough stock eg, certain prodcut can only buy 1 etc)
    return cartDataLayer.updateQuantity(userId, productId, newQuantity);
}

async function remove(userId, productId){
    return cartDataLayer.removeCartItem (userId, productId);
}

module.exports = { addToCart, getCart, updateQuantity, remove }