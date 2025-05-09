const express = require('express');
const cors = require('cors');
const app = express();

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


// Importar el middleware de verificación de token

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


module.exports = app;
