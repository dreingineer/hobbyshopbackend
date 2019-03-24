'use strict';
module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define('Category', {
    name: DataTypes.STRING,
    description: DataTypes.STRING
  }, {
    paranoid:true,
    timestamps:true
  });
  Category.associate = function(models) {
    // associations can be defined here
    Category.belongsTo(models.Shop, {foreignKey:'shopId'});
    Category.hasMany(models.Brand, {foreignKey:'brandId'});
    
  };
  return Category;
};