
const { DataTypes } = require('sequelize');
const sequelize = require('../config/config'); // Ajusta el path si es necesario

const Asignacion = sequelize.define('Asignacion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  profesor_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  materia_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'asignaciones',  // Nombre exacto de la tabla en MySQL
  timestamps: false           // Porque tu tabla no tiene createdAt ni updatedAt
});

module.exports = Asignacion;
