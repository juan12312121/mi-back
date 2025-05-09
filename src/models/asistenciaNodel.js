const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const Asistencia = sequelize.define('Asistencia', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  asignacion_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  fecha: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  asistio: {
    type: DataTypes.ENUM('Asistió', 'No Asistió', 'Justificado'),
    allowNull: false
  },
  registrado_por_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  tipo_registro: {
    type: DataTypes.ENUM('Profesor', 'Checador', 'Jefe de Grupo'),
    allowNull: false
  }
}, {
  tableName: 'asistencias',
  timestamps: false
});

module.exports = Asistencia;
