// src/models/usuario.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');
const Carrera = require('./carrerasModel');  // Importa el modelo Carrera

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  correo: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  contrasena: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  rol_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  carrera_id: {
    type: DataTypes.INTEGER,
    allowNull: true  // Como este campo es opcional (puede ser NULL)
  }
}, {
  tableName: 'usuarios',
  timestamps: false
});

// Define la asociación con el modelo Carrera
Usuario.belongsTo(Carrera, {
  foreignKey: 'carrera_id',  // El campo que establece la relación
  as: 'carrera'  // Alias para poder acceder a la carrera desde un usuario
});

module.exports = Usuario;
