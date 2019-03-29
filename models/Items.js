'use strict';
module.exports = (sequelize, DataTypes) => {
  const Items = sequelize.define('Items', {
    name: DataTypes.STRING,
    description: DataTypes.STRING
  }, {
    paranoid:true,
    timestamps:true
  });
  Items.associate = function(models) {
    // associations can be defined here
    // Items.belongsTo(models.Brand, {foreignKey:'brandId'});
    // Items.belongsToMany(models.Customer, {as:'customers', foreignKey:'customerId', through:'customersItems'});
    Items.belongsTo(models.Category, {foreignKey:'categoryId'});
    Items.belongsToMany(models.Customer, {as:'buyers', through:'itemsCustomers', foreignKey:'itemId', otherKey:'customerId'});
  };
  return Items;
};
