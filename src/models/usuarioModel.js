const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

// Importar los modelos relacionados
const Carrera = require('./carrerasModel');
const Grupo = require('./gruposModel');
const Rol = require('./rolesModel');  // Importar el modelo de Rol
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
    allowNull: true
  },
  grupo_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'usuarios',
  timestamps: false
});

// Relaciones

// Un usuario pertenece a una carrera
Usuario.belongsTo(Carrera, {
  foreignKey: 'carrera_id',
  as: 'carrera'
});

// Un usuario puede pertenecer a un grupo
Usuario.belongsTo(Grupo, {
  foreignKey: 'grupo_id',
  as: 'grupo'
});

// Un usuario pertenece a un rol (relación agregada)
Usuario.belongsTo(Rol, {
  foreignKey: 'rol_id',
  as: 'rol'  // Alias para la relación
});

module.exports = Usuario;
