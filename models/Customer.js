'use strict';
module.exports = (sequelize, DataTypes) => {
  const Customer = sequelize.define('Customer', {
    uuid: {
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
    Customer.belongsTo(models.Items, {foreignKey:'itemId'});
    Customer.belongsTo(models.Location, {foreignKey:'locationId'});
  };
  return Customer;
};