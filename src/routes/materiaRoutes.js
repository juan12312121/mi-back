const express = require('express');
const router = express.Router();
const {
  crearMateria,
  obtenerMaterias,
  actualizarMateria,
  eliminarMateria
} = require('../controllers/materiaController');  // Asegúrate de importar el nuevo controlador
const verificarToken = require('../middlewares/authMiddleware');

// Crear nueva materia
router.post('/', verificarToken, crearMateria);

// Obtener materias
router.get('/', verificarToken, obtenerMaterias);

// Actualizar materia existente
router.put('/:id', verificarToken, actualizarMateria);  // Nueva ruta para actualización
router.delete('/:id', verificarToken,eliminarMateria);

module.exports = router;
