'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
 
  async up(queryInterface, Sequelize) {

    return queryInterface.sequelize.transaction(async t => {
    await queryInterface.createTable('t_noticias', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
      },
      dia_de_la_semana: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: false,
      },
      numero_dia: {
        type: Sequelize.STRING,
        allowNull: false,
       unique: false,
      },
      mes: {
        type: Sequelize.STRING,
        allowNull: false,
       unique: false,
      },
      ano: {
        type: Sequelize.STRING,
        allowNull: false,
       unique: false,
      },
      titulo: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: false,
      },
      texto: {
        type: Sequelize.STRING(2000),
        allowNull: false,
      },
      link: {
        type: Sequelize.STRING,
        allowNull: true,
       unique: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    },{ transaction: t });
  })
  },
  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async t => {
    await queryInterface.dropTable('t_noticias',{ transaction: t });
    })
  }
};
