'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

    await queryInterface.addColumn('requests_logs', 'device_id', {
      type: Sequelize.DataTypes.TEXT,
      allowNull: true
    });
    await queryInterface.addColumn('error_logs', 'device_id', {
      type: Sequelize.DataTypes.TEXT,
      allowNull: true
    });
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('requests_logs', 'device_id');
    await queryInterface.removeColumn('error_logs', 'device_id');
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
