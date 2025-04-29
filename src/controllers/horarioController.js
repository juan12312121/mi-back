// controllers/horarioController.js
const { crearHorario, obtenerHorario } = require('../models/horariosModel');

/**
 * POST /api/horarios
 * Body: { periodos: [ { asignacion_id, dia_semana, hora_inicio, hora_fin, grupo_id, aula_id, turno, tipo_duracion, duracion_clase, tiempo_descanso }, … ] }
 */
const crearHorarioController = (req, res) => {
  const { periodos } = req.body;

  crearHorario(periodos)
    .then(created => {
      res.status(201).json({
        message: 'Horarios creados correctamente',
        data: created
      });
    })
    .catch(err => {
      console.error(err);
      res.status(400).json({
        message: 'Error al crear horarios',
        error: err.message
      });
    });
};


/**
 * GET /api/horarios
 * Query params: ?grupo_id=1&aula_id=101&turno=Matutino
 */
const obtenerHorarioController = (req, res) => {
  const { grupo_id, aula_id, turno } = req.query;

  obtenerHorario({ 
    grupo_id: parseInt(grupo_id, 10), 
    aula_id: parseInt(aula_id, 10), 
    turno 
  })
    .then(rows => {
      res.json({
        message: 'Horario obtenido',
        data: rows
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({
        message: 'Error al obtener horario',
        error: err.message
      });
    });
};

module.exports = {
  crearHorarioController,
  obtenerHorarioController
};
