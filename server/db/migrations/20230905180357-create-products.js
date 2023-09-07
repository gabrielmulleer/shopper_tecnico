'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Products', {
      code: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.BIGINT,
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING(100),
      },
      cost_price: {
        allowNull: false,
        type: Sequelize.DECIMAL(9, 2),
      },
      sales_price: {
        allowNull: false,
        type: Sequelize.DECIMAL(9, 2),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('products');
  },
};
