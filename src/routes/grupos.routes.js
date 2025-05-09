const express = require('express');
const router = express.Router();

const {
  obtenerGrupos,
  insertarGrupo,
  obtenerGrupoPorId,
  actualizarGrupo,
  eliminarGrupo,
  obtenerGruposPorUsuario
} = require('../controllers/gruposcontroller');

// Obtener todos los grupos
router.get('/', obtenerGrupos);

// Insertar nuevo grupo
router.post('/', insertarGrupo);

// Obtener grupo por ID
router.get('/:id', obtenerGrupoPorId);

// Actualizar grupo por ID
router.put('/:id', actualizarGrupo);

// Eliminar grupo por ID
router.delete('/:id', eliminarGrupo);

// Ruta para obtener grupos basados en el usuario
router.get('/usuario/:usuarioId', obtenerGruposPorUsuario);


module.exports = router;
