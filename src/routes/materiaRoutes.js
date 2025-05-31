const express = require("express");
const router = express.Router();
const {
  crearMateria,
  obtenerMaterias,
  actualizarMateria,
  eliminarMateria,
  obtenerMateriasPorUsuario, // <-- Importa la nueva función simplificada
} = require("../controllers/materiaController"); // Asegúrate de importar el nuevo controlador
const verificarToken = require("../middlewares/authMiddleware");

// Crear nueva materia
router.post('/', verificarToken, crearMateria);

// Obtener materias
router.get('/', verificarToken, obtenerMaterias);

// El backend usará el ID de carrera del usuario del token.
router.get('/por-usuario', verificarToken, obtenerMateriasPorUsuario); // <-- Nueva ruta protegida

// Actualizar materia existente
router.put("/:id", verificarToken, actualizarMateria); // Nueva ruta para actualización
router.delete("/:id", verificarToken, eliminarMateria);

module.exports = router;
