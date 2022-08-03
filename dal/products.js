const {Product, Category, Tag} = require ('../models')

async function getAllCategories(){
    const categories = await Category.fetchAll().map(category => {
        return [category.get('id'), category.get('name')]
    })
    return categories;
}

async function getAllTags(){
    const tags = await Tag.fetchAll().map(tag => [tag.get('id'), tag.get('name')]);
    return tags;
}

async function getProductById(productId){
    const product = await Product.where({
        'id': productId
    }).fetch({
        require: true,
        withRelated: ['tags'] //means if not found will cause an exception (aka error)
    });
    return product;
}

//for products.js in api routes
async function getAllProducts() {
    return await Product.fetchAll({
        withRelated: ['tags', 'category']
    });
}

module.exports = {getAllCategories, getAllTags, getProductById, getAllProducts};