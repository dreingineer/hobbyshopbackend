'use strict';
module.exports = (sequelize, DataTypes) => {
  const Brand = sequelize.define('Brand', {
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    country: DataTypes.STRING
  }, {
    paranoid:true,
    timestamps:true
  });
  Brand.associate = function(models) {
    // associations can be defined here
    Brand.belongsTo(models.Category, {foreignKey:'categoryId'});
    // Brand.hasMany(models.Item, {foreignKey:'itemId'});
  };
  return Brand;
};