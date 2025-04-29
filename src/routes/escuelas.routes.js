const express = require('express');
const router = express.Router();
const { insertarEscuela, verEscuelas, actualizarEscuela, eliminarEscuela } = require('../controllers/EscuelaController');
const verificarToken = require('../middlewares/authMiddleware');

// Ruta para insertar escuela
router.post('/crear-escuela', verificarToken, insertarEscuela);

// Ruta para ver todas las escuelas
router.get('/ver-escuelas', verificarToken, verEscuelas);

// Ruta para actualizar escuela
router.put('/:id', verificarToken, actualizarEscuela);

// Ruta para eliminar escuela
router.delete('/:id', verificarToken, eliminarEscuela); // Nueva ruta para eliminar escuela

module.exports = router;
