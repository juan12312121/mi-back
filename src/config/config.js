const { Sequelize } = require('sequelize');
require('dotenv').config();  // Asegúrate de que esta línea esté al principio

const sequelize = new Sequelize(
  process.env.DB_NAME,    // Nombre de la base de datos
  process.env.DB_USER,    // Usuario de la base de datos
  process.env.DB_PASS,    // Contraseña de la base de datos
  {
    host: process.env.DB_HOST,  // Host de la base de datos
    dialect: 'mysql',           // El dialecto de la base de datos
    logging: false,             // Opcional, para evitar que Sequelize imprima las consultas SQL
  }
);

// Verificar la conexión
sequelize.authenticate()
  .then(() => {
    console.log('Conexión a la base de datos establecida con éxito');
  })
  .catch(err => {
    console.error('No se pudo conectar a la base de datos:', err);
  });

module.exports = sequelize;
