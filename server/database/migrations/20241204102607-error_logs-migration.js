
/** @type {import('sequelize-cli').Migration} */
module.exports = {

  async up(queryInterface, Sequelize) {

    return queryInterface.sequelize.transaction(async t => {
    await queryInterface.createTable('error_logs', {
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
      level: {
        allowNull: false,
        type: Sequelize.STRING
      },
      method: {
        allowNull: false,
        type: Sequelize.STRING
      },
      endpoint: {
        allowNull: false,
        type: Sequelize.STRING
      },
      statuscode: {
        allowNull: false,
        type: Sequelize.STRING
      },
      payload: {
        allowNull: false,
        type: Sequelize.STRING
      },
      error: {
        allowNull: false,
        type: Sequelize.STRING
      }
    },{ transaction: t });
  })
  },
  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async t => {
    await queryInterface.dropTable('error_logs',{ transaction: t });
    })
  }
};