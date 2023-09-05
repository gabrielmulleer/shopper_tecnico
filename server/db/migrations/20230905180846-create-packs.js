'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Packs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
      },
      pack_id: {
        allowNull: false,
        type: Sequelize.BIGINT,
        references: { model: 'products', key: 'code' },
        onUpdate: 'CASCADE',
      },
      product_id: {
        allowNull: false,
        type: Sequelize.BIGINT,
        references: { model: 'products', key: 'code' },
        onUpdate: 'CASCADE',
      },
      qty: {
        allowNull: false,
        type: Sequelize.BIGINT,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Packs');
  },
};
