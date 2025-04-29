const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/config');
const Escuela = require('./escuelasModel');

class Facultad extends Model {}

Facultad.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  escuela_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Escuela,
      key: 'id',
    },
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  email_contacto: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  telefono_contacto: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
}, {
  sequelize,
  modelName: 'Facultad',
  tableName: 'facultades',
  timestamps: false  // ← evita que busque createdAt/updatedAt
});

module.exports = Facultad;
