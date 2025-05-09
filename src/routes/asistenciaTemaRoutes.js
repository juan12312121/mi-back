const express = require('express');
const router = express.Router();
const {
  registrarAsistenciaYTema,
  obtenerTodasLasAsistencias,
  obtenerAsistenciasPorUsuario,
  obtenerTemasVistos,
  obtenerTemasPorUsuario
} = require('../controllers/asistenciaTemaController');

// Ruta para registrar asistencia y tema
router.post('/', registrarAsistenciaYTema);

// Ruta para obtener todas las asistencias
router.get('/', obtenerTodasLasAsistencias);

// Ruta para obtener las asistencias de un usuario específico por su ID
router.get('/usuario/:userId', obtenerAsistenciasPorUsuario);  // <-- Aquí agregas la ruta para el usuario

router.get('/temas-vistos', obtenerTemasVistos);

router.get('/temas-vistos/usuario/:usuarioId', obtenerTemasPorUsuario);


module.exports = router;
