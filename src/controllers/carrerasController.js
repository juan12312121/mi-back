// carreras.controller.js
const sequelize = require('../config/config');

// Crear una carrera
const crearCarrera = async (req, res) => {
  try {
    const { nombre, facultad_id } = req.body;

    await sequelize.query(
      'INSERT INTO carreras (nombre, facultad_id) VALUES (?, ?)',
      {
        replacements: [nombre, facultad_id],
      }
    );

    res.status(201).json({ message: 'Carrera creada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la carrera', details: error.message });
  }
};

// Controlador para obtener todas las carreras con JOIN a facultades y escuelas
const obtenerCarreras = async (req, res) => {
  try {
    const [carreras] = await sequelize.query(`
      SELECT 
        c.id AS carrera_id,
        c.nombre AS carrera_nombre,
        f.nombre AS facultad_nombre,
        e.nombre AS escuela_nombre
      FROM carreras c
      INNER JOIN facultades f ON c.facultad_id = f.id
      INNER JOIN escuelas e ON f.escuela_id = e.id
      ORDER BY c.id ASC
    `);
    res.status(200).json(carreras);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las carreras', details: error.message });
  }
};


// Actualizar una carrera
const actualizarCarrera = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, facultad_id } = req.body;

    const [result] = await sequelize.query(
      'UPDATE carreras SET nombre = ?, facultad_id = ? WHERE id = ?',
      {
        replacements: [nombre, facultad_id, id],
      }
    );

    // result.affectedRows o similar según driver, pero asumimos éxito si no lanza error
    res.status(200).json({ message: 'Carrera actualizada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la carrera', details: error.message });
  }
};

// Eliminar una carrera
const eliminarCarrera = async (req, res) => {
  try {
    const { id } = req.params;

    await sequelize.query(
      'DELETE FROM carreras WHERE id = ?',
      {
        replacements: [id],
      }
    );

    res.status(200).json({ message: 'Carrera eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la carrera', details: error.message });
  }
};

module.exports = {
  crearCarrera,
  obtenerCarreras,
  actualizarCarrera,
  eliminarCarrera
};
