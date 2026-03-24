const express = require('express');
const router = express.Router();
const {
  obtenerAulas,
  obtenerAulaPorId,
  crearAula,
  actualizarAula,
  eliminarAula
} = require('../controllers/aulas.controller');

const verificarToken = require('../middlewares/authMiddleware');

// Rutas CRUD para aulas
router.get('/', verificarToken, obtenerAulas);             
router.get('/:id', verificarToken, obtenerAulaPorId);      
router.post('/', verificarToken, crearAula);               
router.put('/:id', verificarToken, actualizarAula);       
router.delete('/:id', verificarToken, eliminarAula);       

module.exports = router;
