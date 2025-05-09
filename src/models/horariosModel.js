const { DataTypes, Op } = require('sequelize');
const sequelize = require('../config/config'); // Ajusta la ruta a tu archivo de conexión

// Definición del modelo Horario
const Horario = sequelize.define('Horario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  asignacion_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  dia_semana: {
    type: DataTypes.ENUM('Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'),
    allowNull: false,
  },
  hora_inicio: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  hora_fin: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  grupo_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  aula_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  turno: {
    type: DataTypes.ENUM('Matutino','Vespertino','Nocturno','Personalizado'),
    allowNull: false,
  },
  tipo_duracion: {
    type: DataTypes.ENUM('Estandar','Personalizada'),
    allowNull: false,
    defaultValue: 'Estandar',
  },
  duracion_clase: {
    type: DataTypes.TINYINT,
    allowNull: true,
    defaultValue: 60,
  },
  tiempo_descanso: {
    type: DataTypes.TINYINT,
    allowNull: true,
  }
}, {
  tableName: 'horarios',
  timestamps: false // Si no usas createdAt/updatedAt
});

module.exports = { Horario };