const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/config');
const Carrera = require('./carrerasModel');  // Importa el modelo Carrera

class Materia extends Model {}

Materia.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  carrera_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'carreras',  // Relaciona con la tabla de carreras
      key: 'id',
    },
  },
}, {
  sequelize,
  modelName: 'Materia',
  tableName: 'materias',
  timestamps: false,
});

// Establece la relación "Materia pertenece a Carrera"
Materia.belongsTo(Carrera, {
  foreignKey: 'carrera_id',  // Campo en Materia que hace referencia a Carrera
  as: 'carrera',  // Alias para acceder a la carrera asociada
});

module.exports = Materia;
