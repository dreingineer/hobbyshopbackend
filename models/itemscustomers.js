'use strict';
module.exports = (sequelize, DataTypes) => {
  const itemsCustomers = sequelize.define('itemsCustomers', {
    itemId: DataTypes.INTEGER,
    customerId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    }
  }, {
    paranoid:true,
    timestamps:true
  });
  itemsCustomers.associate = function(models) {
    // associations can be defined here
  };
  return itemsCustomers;
};
