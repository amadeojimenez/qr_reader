
/** @type {import('sequelize-cli').Migration} */
module.exports = {

  async up(queryInterface, Sequelize) {

    return queryInterface.sequelize.transaction(async t => {
    await queryInterface.createTable('t_usuarios', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
    },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
        notEmpty: true,
        unique:true,
      },
      password: {
        type:Sequelize.STRING
      },
      role: {
        type: Sequelize.STRING,
        allowNull: true,
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
    await queryInterface.dropTable('t_usuarios',{ transaction: t });
    })
  }
};