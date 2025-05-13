// src/controllers/justificacionesController.js

const sequelize = require('../config/config');
const Justificacion = require('../models/justificaciones');
const Asistencia    = require('../models/asistenciaNodel');

// 📌 Función para crear una justificación
const crearJustificacion = async (req, res) => {
  try {
    const { asistencia_id, motivo } = req.body;
    const archivo_prueba = req.file ? req.file.filename : '';

    if (!asistencia_id || !motivo) {
      return res.status(400).json({ message: 'Faltan campos obligatorios: asistencia_id y motivo.' });
    }

    const asistencia = await Asistencia.findByPk(asistencia_id);
    if (!asistencia) {
      return res.status(404).json({ message: 'Asistencia no encontrada.' });
    }

    const nuevaJustificacion = await Justificacion.create({
      asistencia_id,
      motivo,
      archivo_prueba,
      fecha_justificacion: new Date(),
    });

    await Asistencia.update(
      { asistio: 'Justificado' },
      { where: { id: asistencia_id } }
    );

    return res.status(201).json({
      message: 'Justificación registrada con éxito y asistencia marcada como Justificado.',
      justificacion: nuevaJustificacion,
    });

  } catch (error) {
    console.error('Error al crear la justificación:', error);
    return res.status(500).json({ message: 'Error del servidor.' });
  }
};

// 📌 Función para obtener TODAS las justificaciones desde la vista
const obtenerTodasLasJustificaciones = async (req, res) => {
  try {
    const [rows] = await sequelize.query(
      'SELECT * FROM vista_asistencias_justificadas'
    );
    return res.json({ total: rows.length, justificaciones: rows });
  } catch (error) {
    console.error('Error al obtener todas las justificaciones:', error);
    return res.status(500).json({ message: 'Error del servidor al obtener justificaciones.' });
  }
};

// 📌 Función para obtener la justificación de UNA asistencia concreta
const obtenerJustificacionPorAsistencia = async (req, res) => {
  try {
    const { asistencia_id } = req.params;
    const [rows] = await sequelize.query(
      'SELECT * FROM vista_asistencias_justificadas WHERE asistencia_id = ?',
      { replacements: [asistencia_id] }
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'No se encontró justificación para esta asistencia.' });
    }
    return res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener justificación por asistencia:', error);
    return res.status(500).json({ message: 'Error del servidor al obtener la justificación.' });
  }
};

module.exports = {
  crearJustificacion,
  obtenerTodasLasJustificaciones,
  obtenerJustificacionPorAsistencia
};
