// routes/asignacionesRoutes.js

const express = require('express');
const router = express.Router();
const asignacionesController = require('../controllers/asignacionesController');
const verificarToken = require('../middlewares/authMiddleware');  // Importa el middleware

// Ruta para obtener todas las asignaciones (protegida)
router.get('/', verificarToken, asignacionesController.obtenerAsignaciones);

// Ruta para crear una nueva asignación (protegida)
router.post('/', verificarToken, asignacionesController.crearAsignacion);

// Ruta para actualizar una asignación (protegida)
router.put('/:id', verificarToken, asignacionesController.actualizarAsignacion);

// Ruta para eliminar una asignación (protegida)
router.delete('/:id', verificarToken, asignacionesController.eliminarAsignacion);

module.exports = router;
