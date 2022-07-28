'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db) {
  return db.addColumn('products', 'brand_id', {
    'type': 'int',
    'unsigned': true,
    //above must match the brand_id in the brands
    'notNull': true,
    'defaultValue': 1,
    // set all existing products without brands to the default brand we just created
    'foreignKey': {
      'name': 'product_brand_fk',
      'table': 'brands',
      'mapping': 'id',
      'rules': {
        'onDelete': 'cascade', //
        'onUpdate': 'restrict'
      }
    }
  });
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  "version": 1
};
