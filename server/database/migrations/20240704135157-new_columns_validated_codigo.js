'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {

      await queryInterface.addColumn('t_usuarios', 'validated', { type: Sequelize.BOOLEAN, after: 'user_id' , allowNull: true,  defaultValue: false }, { transaction: t })
      await queryInterface.addColumn('t_usuarios', 'codigo', { type:  Sequelize.STRING, after: 'user_id', allowNull: true }, { transaction: t })
      
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.removeColumn('t_usuarios', 'validated', { transaction: t })
      await queryInterface.removeColumn('t_usuarios', 'codigo', { transaction: t })
    })
  }
};