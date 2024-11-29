'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    return queryInterface.sequelize.transaction(async t => {
    await queryInterface.createTable('t_sesiones', {
      user_id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          allowNull: false,
          unique: true,
          references: {
              model:'t_usuarios',
              key: 'id'
          }
      },
      last_session: {
          type: Sequelize.DATE,
          allowNull: true,
      }, 
      total_sessions: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      }
    },{ transaction: t });
  })
  },
  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async t => {
    await queryInterface.dropTable('t_sesiones',{ transaction: t });
    })
  }
};
