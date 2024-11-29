
const { sequelize } = require('../connection.js');
const { DataTypes } = require('sequelize');

const Noticias = sequelize.define(
    'noticias',
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        dia_de_la_semana: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: false,
          },

        numero_dia: {
            type: DataTypes.STRING,
            allowNull: false,
        unique: false,
        },
        mes: {
            type: DataTypes.STRING,
            allowNull: false,
        unique: false,
        },
        ano: {
            type: DataTypes.STRING,
            allowNull: false,
        unique: false,
        },
        titulo: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: false,
        },
        texto: {
            type: DataTypes.STRING(2000),
            allowNull: false,
        },
        link: {
            type: DataTypes.STRING,
            allowNull: true,
        unique: false,
        },
    },
    {
        tableName: 't_noticias',
        timestamps: true,
    },
);


  

module.exports = Noticias;
