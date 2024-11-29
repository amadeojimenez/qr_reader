
const { sequelize } = require('../connection.js');
const { DataTypes } = require('sequelize');

const Sesiones = sequelize.define(
    'sesiones',
    {
        user_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            unique: true,
            references: {
                model:'t_usuarios',
                key: 'id'
            }
        },
        last_session: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        total_sessions: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        },
    },
    {
        tableName: 't_sesiones',
        timestamps: false,
    },
);

module.exports = Sesiones;
