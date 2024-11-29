
/** @type {import('sequelize-cli').Migration} */
module.exports = {

  async up(queryInterface, Sequelize) {

    return queryInterface.sequelize.transaction(async t => {
    await queryInterface.createTable('t_logs', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      fecha: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')  
      },
      verb: {
        allowNull: false,
        type: Sequelize.STRING
      },
      payload: {
        allowNull: false,
        type: Sequelize.STRING
      }
    },{ transaction: t });
  })
  },
  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async t => {
    await queryInterface.dropTable('t_usuarios',{ transaction: t });
    })
  }
};