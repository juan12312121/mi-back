const express = require('express');
const router = express.Router();
const horarioController = require('../controllers/horarioController');

// Ruta para crear un nuevo horario
router.post('/', horarioController.crearHorario);

// Ruta para obtener todos los horarios con la consulta SQL
router.get('/', horarioController.obtenerHorariosConSQL);

// Ruta para obtener los valores ENUM disponibles
router.get('/enums', horarioController.obtenerValoresEnum);

// Ruta para obtener los horarios de un usuario
router.get('/usuario/:usuarioId', horarioController.obtenerHorariosPorUsuario);

router.get('/checador/:usuarioId', horarioController.obtenerHorariosPorChecador);


module.exports = router;
 