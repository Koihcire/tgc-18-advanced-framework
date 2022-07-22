const knex = require ("knex")({
    client: "mysql", 
    connection: {
        user: "foofoo",
        password: "barbar",
        database: "organic"
    }
})

const bookshelf = require ("bookshelf")(knex);

module.exports = bookshelf;