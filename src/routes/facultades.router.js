// src/routes/facultadesRoutes.js
const express = require('express');
const router = express.Router();
const {
  obtenerTodasFacultadesConEscuela,
  obtenerFacultadConEscuela,
  agregarFacultad,
  actualizarFacultad,
  eliminarFacultad
} = require('../controllers/facultadesController');
const verificarToken = require('../middlewares/authMiddleware');

// Obtener todas las facultades con el nombre de la escuela
router.get('/facultades', verificarToken, obtenerTodasFacultadesConEscuela);

// Obtener una facultad específica con su escuela
router.get('/facultad/:id', verificarToken, obtenerFacultadConEscuela);

// Agregar una nueva facultad
router.post('/facultad', verificarToken, agregarFacultad);

// Actualizar una facultad existente
router.put('/actualizar-facultad/:id', verificarToken, actualizarFacultad);

// Eliminar una facultad existente
router.delete('/eliminar-facultad/:id', verificarToken, eliminarFacultad);

module.exports = router;
