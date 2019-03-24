'use strict';
module.exports = (sequelize, DataTypes) => {
  const Items = sequelize.define('Items', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    name: DataTypes.STRING,
    description: DataTypes.STRING
  }, {
    paranoid:true,
    timestamps:true
  });
  Items.associate = function(models) {
    // associations can be defined here
    Items.belongsTo(models.Brand, {foreignKey:'brandId'});
    Items.hasMany(models.Customer, {foreignKey:'customerId'});
  };
  return Items;
};