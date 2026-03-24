// routes/carreras.js
const express = require('express');
const router = express.Router();
const {
  crearCarrera,
  obtenerCarreras,
  actualizarCarrera,
  eliminarCarrera
} = require('../controllers/carrerasController');
const verificarToken = require('../middlewares/authMiddleware');

// Crear una nueva carrera
router.post('/', verificarToken, crearCarrera);

// Obtener todas las carreras
router.get('/', verificarToken, obtenerCarreras);

// Actualizar una carrera existente
router.put('/:id', verificarToken, actualizarCarrera);

// Eliminar una carrera
router.delete('/:id', verificarToken, eliminarCarrera);

module.exports = router;
