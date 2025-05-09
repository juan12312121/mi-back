const { Sequelize } = require('sequelize');
require('dotenv').config();  

// Crear una instancia de Sequelize con las variables de entorno
const sequelize = new Sequelize(
  process.env.DB_NAME,   // Nombre de la base de datos
  process.env.DB_USER,   // Usuario
  process.env.DB_PASS,   // Contraseña
  {
    host: process.env.DB_HOST,  // Host de la base de datos
    dialect: 'mysql',          // El dialecto de la base de datos
    logging: false,            // Opcional: deshabilitar los logs de SQL
  }
);

// Verificar la conexión a la base de datos
sequelize.authenticate()
  .then(() => {
    console.log('Conexión a la base de datos establecida con éxito');
  })
  .catch(err => {
    console.error('No se pudo conectar a la base de datos:', err);
  });

// Exportar sequelize para usar en otros archivos
module.exports = sequelize;
