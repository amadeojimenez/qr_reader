'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // change the column type from varchar to text
    await queryInterface.changeColumn('requests_logs', 'payload', {
      type: Sequelize.DataTypes.TEXT,
      allowNull: true
    })
    await queryInterface.changeColumn('error_logs', 'payload', {
      type: Sequelize.DataTypes.TEXT,
      allowNull: true
    })
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
  },

  async down (queryInterface, Sequelize) {
    // change the column type from text to varchar
    await queryInterface.changeColumn('requests_logs', 'payload', {
      type: Sequelize.DataTypes.STRING,
      allowNull: true
    })
    await queryInterface.changeColumn('error_logs', 'payload', {
      type: Sequelize.DataTypes.STRING,
      allowNull: true
    })
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
