'use strict';
module.exports = (sequelize, DataTypes) => {
  const Shop = sequelize.define('Shop', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    owner: DataTypes.STRING,
    founded: DataTypes.INTEGER
  }, {
    paranoid:true,
    timestamps:true
  });
  Shop.associate = function(models) {
    // associations can be defined here
    // shop belongsto location
    // Shop.belongsToMany(models.Location, {as:'branches', foreignKey:'locationId', through:'shopsLocations'});
    Shop.hasMany(models.Brand, {foreignKey:'shopId'});
    Shop.belongsToMany(models.Location, {as:'branches', through:'shopsLocations', foreignKey:'shopId', otherKey:'locationId'});
  };

  return Shop;
};
