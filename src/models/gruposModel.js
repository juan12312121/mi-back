// src/models/gruposModel.js
const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/config");
const Carrera = require("./carrerasModel"); // Importa el modelo Carrera

class Grupo extends Model {}

Grupo.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    carrera_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // Permitimos null si hay grupos generales sin carrera específica
      references: {
        model: "carreras", // Relaciona con la tabla de carreras
        key: "id",
      },
    },
    semestre: {
      type: DataTypes.STRING(20), // puedes ajustar el largo si quieres
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Grupo",
    tableName: "grupos",
    timestamps: false,
  }
);

// Establece la relación "Grupo pertenece a Carrera" usando el ORM
Grupo.belongsTo(Carrera, {
  foreignKey: "carrera_id", // Campo en Grupo que hace referencia a Carrera
  as: "carrera", // Alias para acceder a la carrera asociada (usado en `include`)
});

module.exports = Grupo;
