const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const TemaVisto = sequelize.define('TemaVisto', {
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
  tema: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  registrado_por_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'temas_vistos',
  timestamps: false
});

module.exports = TemaVisto;
