'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {

      await queryInterface.addColumn('t_asignaturas', 'semestre_horario', { type: Sequelize.STRING, after: 'user_id' , allowNull: true }, { transaction: t })
      await queryInterface.addColumn('t_asignaturas', 'paleta_horario', { type:  Sequelize.STRING, after: 'user_id', allowNull: true }, { transaction: t })
      await queryInterface.addColumn('t_asignaturas', 'calendar_event_ids', { type:  Sequelize.JSON, before: 'data_user',allowNull: true }, { transaction: t })
      await queryInterface.renameTable('t_asignaturas', 't_horarios', { transaction: t });
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.renameTable('t_horarios', 't_asignaturas', { transaction: t });
      await queryInterface.removeColumn('t_asignaturas', 'semestre_horario', { transaction: t })
      await queryInterface.removeColumn('t_asignaturas', 'paleta_horario', { transaction: t })
      await queryInterface.removeColumn('t_asignaturas', 'calendar_event_ids', { transaction: t })
    })
  }
};
