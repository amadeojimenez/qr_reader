'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // add uniqueHash text column to t_users table
    await queryInterface.addColumn('t_users', 'id_device', {
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
    // remove uniqueHash text column from t_users table
    await queryInterface.removeColumn('t_users', 'id_device');
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};