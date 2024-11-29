
const { sequelize } = require('../connection.js');
const { DataTypes } = require('sequelize');

const Usuarios = sequelize.define(
    'usuarios',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            unique: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            notEmpty: true,
        },
        password: DataTypes.STRING,
        role: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        validated: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        codigo: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        tableName: 't_usuarios',
        timestamps: true,
    },
);



module.exports = Usuarios;
