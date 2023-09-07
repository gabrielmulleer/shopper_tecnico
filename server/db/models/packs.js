'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Packs extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Packs.belongsTo(models.Products, { foreignKey: 'code' });
    }
  }
  Packs.init(
    {
      pack_id: DataTypes.BIGINT,
      product_id: DataTypes.BIGINT,
      qty: DataTypes.BIGINT,
    },
    {
      sequelize,
      modelName: 'Packs',
      timestamps: false, // Desative timestamps
      updatedAt: false, // Desative a coluna updatedAt
    }
  );
  return Packs;
};
