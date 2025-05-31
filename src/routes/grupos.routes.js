const express = require("express");
const router = express.Router();

const {
  obtenerGrupos, // Este método ahora filtra por usuario si es Jefe
  insertarGrupo,
  obtenerGrupoPorId, // Ahora valida permisos
  actualizarGrupo, // Ahora valida permisos
  eliminarGrupo, // Ahora valida permisos
  // obtenerGruposPorUsuario, // <-- Eliminada y no se importa
} = require("../controllers/gruposcontroller");

const verificarToken = require("../middlewares/authMiddleware"); // <-- Importa tu middleware


// Obtener grupos (filtros aplicados en el controlador según el rol del usuario logeado)
router.get("/", verificarToken, obtenerGrupos); // <-- Ruta GET / protegida

// Insertar nuevo grupo (validaciones en el controlador)
router.post("/", verificarToken, insertarGrupo); // <-- Ruta POST / protegida

// Obtener grupo por ID (validaciones en el controlador)
router.get("/:id", verificarToken, obtenerGrupoPorId); // <-- Ruta GET /:id protegida

// Actualizar grupo por ID (validaciones en el controlador)
router.put("/:id", verificarToken, actualizarGrupo); // <-- Ruta PUT /:id protegida

// Eliminar grupo por ID (validaciones en el controlador)
router.delete("/:id", verificarToken, eliminarGrupo); // <-- Ruta DELETE /:id protegida

// La ruta GET /usuario/:usuarioId ha sido ELIMINADA.
// El filtrado por carrera del usuario logeado ahora lo hace la ruta GET /grupos con el controlador obtenerGrupos modificado.




module.exports = router;