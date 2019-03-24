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
    Shop.belongsTo(models.Location, {foreignKey:'locationId'});
  };

  Shop.searchables = [
    'id',
    'owner',
    'founded'
  ];

  Shop.filterables = {    
    'id':'',
    'owner':'',
    'founded':''
  };

  return Shop;
};