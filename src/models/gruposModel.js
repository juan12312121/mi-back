const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/config');

class Grupo extends Model {}

Grupo.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  carrera_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  semestre: {
    type: DataTypes.STRING(20), // puedes ajustar el largo si quieres
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Grupo',
  tableName: 'grupos',
  timestamps: false
});

module.exports = Grupo;
