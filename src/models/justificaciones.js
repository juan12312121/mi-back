// src/models/justificaciones.js  (o donde tengas tu modelo)

const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/config');

class Justificacion extends Model {}

Justificacion.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  asistencia_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'asistencias', key: 'id' },
  },
  motivo: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  archivo_prueba: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: ''      // ← aquí añades el defaultValue
  },
  fecha_justificacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: true,
  },
}, {
  sequelize,
  modelName: 'Justificacion',
  tableName: 'justificaciones',
  timestamps: false,
});

module.exports = Justificacion;
