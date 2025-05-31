const { DataTypes } = require("sequelize");
const sequelize = require("../config/config");

// Define el modelo de Rol
const Rol = sequelize.define(
  "Rol",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
  },
  {
    tableName: "roles",
    timestamps: false,
  }
);

// No es necesario `hasMany` aquí, solo se necesita `belongsTo` en el modelo Usuario

module.exports = Rol;
