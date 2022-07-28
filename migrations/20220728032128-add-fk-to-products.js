'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  //first arg: the TABLE that i want to change (ie add new column)
  //second arg: the object representing the new COLUMN i want to add to the table
  //!!the name of the fk should be that of the other table in singular form with _id at the back
  //third arg: the object that defines the column. data type of fk MUST match the corresponding type of the primary key
  return db.addColumn('products', 'category_id', {
    type: 'int',
    unsigned:true,
    notNull : true,
    foreignKey: {
        name: 'product_category_fk',
        table: 'categories',
        mapping: 'id',
        rules: {
            onDelete:'cascade', //enables cascading delete
            onUpdate:'restrict'
        },
    }
})
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};
