const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/config');
const Facultad = require('./facultadModel');

class Escuela extends Model {}

Escuela.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  folio: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'Escuela',
  tableName: 'escuelas',
  timestamps: false, // ✅ Esto está bien si NO quieres createdAt ni updatedAt
});

module.exports = Escuela;
