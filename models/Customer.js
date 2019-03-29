'use strict';
module.exports = (sequelize, DataTypes) => {
  const Customer = sequelize.define('Customer', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    name: DataTypes.STRING,
    gender: DataTypes.STRING,
    address: DataTypes.STRING
  }, {
    paranoid:true,
    timestamps:true
  });
  Customer.associate = function(models) {
    // associations can be defined here
    // Customer.belongsToMany(models.Items, {as:'faveItems' , foreignKey:'itemId', through:'customersItems'});
    // Customer.belongsTo(models.Location, {foreignKey:'locationId'});
      Customer.belongsToMany(models.Items, {as:'faveItems', through:'itemsCustomers', foreignKey:'customerId', otherKey:'itemId'});
      Customer.belongsTo(models.Location, {foreignKey:'locationId'});
  };
  return Customer;
};
