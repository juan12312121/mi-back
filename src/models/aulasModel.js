// src/models/aula.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const Aula = sequelize.define('Aula', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  }
}, {
  tableName: 'aulas',
  timestamps: false
});

module.exports = Aula;
