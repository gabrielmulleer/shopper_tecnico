'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Products extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Products.hasMany(models.Packs, { foreignKey: 'pack_id' });
      Products.hasMany(models.Packs, { foreignKey: 'product_id' });
    }
  }
  Products.init(
    {
      code: DataTypes.BIGINT,
      name: DataTypes.STRING(100),
      cost_price: DataTypes.DECIMAL(9, 2),
      sales_price: DataTypes.DECIMAL(9, 2),
    },
    {
      sequelize,
      modelName: 'Products',
    }
  );
  return Products;
};
