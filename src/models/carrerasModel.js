// src/models/carrerasModel.js
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/config');
const Facultad = require('./facultadModel');  // Asegúrate de importar el modelo de Facultad
const Escuela = require('./escuelasModel');    // Asegúrate de importar el modelo de Escuela

class Carrera extends Model {}

Carrera.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  facultad_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Carrera',
  tableName: 'carreras',
  timestamps: false
});

// Relación entre Carrera y Facultad
Carrera.belongsTo(Facultad, {
  foreignKey: 'facultad_id',  // Campo en Carrera que referencia a Facultad
  as: 'facultad'  // Alias para acceder a la facultad
});



module.exports = Carrera;
