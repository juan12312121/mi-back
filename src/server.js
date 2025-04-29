// src/server.js
const app = require('./app');
const sequelize = require('./config/config');
require('dotenv').config();

const PORT = process.env.PORT || 4000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Conectado a la base de datos');
    await sequelize.sync(); // solo si quieres que cree tablas si no existen

    app.listen(PORT, () => {
      console.log(`Servidor escuchando en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error al conectar la base de datos:', error);
  }
})();
