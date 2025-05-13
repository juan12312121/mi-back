const express = require('express');
const cors = require('cors');
const app = express();
const path    = require('path');        // ← Agrega esta línea
const sequelize = require('./config/config');

// Importar las rutas
const usuarioRoutes = require('./routes/usuario.routes');
const escuelasRoutes = require('./routes/escuelas.routes');
const facultadesRoutes = require('./routes/facultades.router');
const carrerasRoutes = require('./routes/carreras.routes');
const gruposRoutes = require('./routes/grupos.routes');
const materiaRoutes = require('./routes/materiaRoutes');  // Ruta para materias
const aulasRoutes = require('./routes/aulas.routes');
const asignacionesRoutes = require('./routes/asignaciones.routes')
const horariosRoutes = require('./routes/horarios.route')
const asistenciaTemaRoutes = require('./routes/asistenciaTemaRoutes');  // Ruta para manejar la inserción en ambas tablas
const justificacionesRoutes = require('./routes/justificaciones.Routes');


app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'))
);

app.use(cors());
app.use(express.json());

app.use('/api/usuarios', usuarioRoutes);  
app.use('/api/escuelas', escuelasRoutes);
app.use('/api/facultades', facultadesRoutes);
app.use('/api/carreras', carrerasRoutes); 
app.use('/api/grupos', gruposRoutes); 
app.use('/api/materias', materiaRoutes);  
app.use('/api/aulas', aulasRoutes);  // Nueva ruta para
app.use('/api/asignaciones', asignacionesRoutes);
app.use('/api/horarios', horariosRoutes);
app.use('/api/asistencia-tema', asistenciaTemaRoutes);
app.use('/api/justificaciones',justificacionesRoutes);


app.get('/api/estadisticas', async (req, res) => {
  try {
    const [escuelas] = await sequelize.query('SELECT COUNT(*) AS total FROM escuelas');
    const [facultades] = await sequelize.query('SELECT COUNT(*) AS total FROM facultades');
    const [jefes] = await sequelize.query(`
      SELECT COUNT(*) AS total
      FROM usuarios u
      JOIN roles r ON u.rol_id = r.id
      WHERE r.nombre = 'Jefe de Carrera'
    `);
    const [carreras] = await sequelize.query('SELECT COUNT(*) AS total FROM carreras');

    res.json({
      escuelas: escuelas[0].total,
      facultades: facultades[0].total,
      jefes: jefes[0].total,
      carreras: carreras[0].total
    });
  } catch (err) {
    console.error('Error al obtener estadísticas:', err);
    res.status(500).json({ message: 'Error al obtener estadísticas' });
  }
});




module.exports = app;
