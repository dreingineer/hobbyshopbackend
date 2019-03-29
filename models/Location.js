'use strict';
module.exports = (sequelize, DataTypes) => {
  const Location = sequelize.define('Location', {
    address: DataTypes.STRING,
    zip: DataTypes.INTEGER
  }, {
    paranoid:true,
    timestamps:true
  });
  Location.associate = function(models) {
    // associations can be defined here
    // Location.hasMany(models.Shop, {foreignKey:'locationId'});
    // Location.hasMany(models.Customer, {foreignKey:'locationId'});
    Location.hasMany(models.Customer, {foreignKey:'locationId'});
    Location.belongsToMany(models.Shop, {as:'shops', through:'shopsLocations', foreignKey:'locationId', otherKey:'shopId'});
  };
  return Location;
};
