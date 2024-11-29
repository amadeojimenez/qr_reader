
const { sequelize } = require('../connection.js');
const { DataTypes } = require('sequelize');

const Horarios = sequelize.define(
    'horarios',
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
            references: {
                model:'t_usuarios',
                key: 'id'
            }
        },
        semestre_horario: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'semestre_1'
        },
        paleta_horario: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue:'default-color'
        },
        calendar_event_ids: {
            type: DataTypes.JSON,
            allowNull: true,
        }, 
        data_user: {
            type: DataTypes.JSON,
            allowNull: true,
        }, 
    },
    {
        tableName: 't_horarios',
        timestamps: true,
    },
);

module.exports = Horarios;
