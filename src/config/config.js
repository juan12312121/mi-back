const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
);

sequelize.authenticate()
  .then(() => {
    console.log('✅ Conexión a la base de datos establecida con éxito');
  })
  .catch(err => {
    console.error('❌ No se pudo conectar a la base de datos:', err);
  });

module.exports = sequelize;
