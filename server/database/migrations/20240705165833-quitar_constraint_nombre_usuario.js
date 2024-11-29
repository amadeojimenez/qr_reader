'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

      return queryInterface.sequelize.transaction(async (t) => {
      
        await queryInterface.removeConstraint('t_usuarios', 't_usuarios_username_key', { transaction: t });
      });
  },

  async down (queryInterface, Sequelize) {
      return queryInterface.sequelize.transaction(async (t) => {
        await queryInterface.addConstraint('t_usuarios', {
            fields: ['username'],
            type: 'unique',
            name: 't_usuarios_username_key',
        }, { transaction: t });

      });
  }
};
