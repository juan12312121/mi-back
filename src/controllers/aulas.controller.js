const Aula = require('../models/aulasModel');

// Obtener todas las aulas
const obtenerAulas = async (req, res) => {
  try {
    const aulas = await Aula.findAll();
    res.json({ success: true, data: aulas });
  } catch (error) {
    console.error('Error al obtener aulas:', error);
    res.status(500).json({ success: false, message: 'Error al obtener aulas' });
  }
};

// Obtener una aula por ID
const obtenerAulaPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const aula = await Aula.findByPk(id);
    if (!aula) {
      return res.status(404).json({ success: false, message: 'Aula no encontrada' });
    }
    res.json({ success: true, data: aula });
  } catch (error) {
    console.error('Error al obtener aula:', error);
    res.status(500).json({ success: false, message: 'Error al obtener aula' });
  }
};

// Crear una nueva aula
const crearAula = async (req, res) => {
  const { nombre } = req.body;
  try {
    const nuevaAula = await Aula.create({ nombre });
    res.status(201).json({ success: true, data: nuevaAula });
  } catch (error) {
    console.error('Error al crear aula:', error);
    res.status(500).json({ success: false, message: 'Error al crear aula' });
  }
};

// Actualizar aula
const actualizarAula = async (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;
  try {
    const aula = await Aula.findByPk(id);
    if (!aula) {
      return res.status(404).json({ success: false, message: 'Aula no encontrada' });
    }

    aula.nombre = nombre;
    await aula.save();

    res.json({ success: true, data: aula });
  } catch (error) {
    console.error('Error al actualizar aula:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar aula' });
  }
};

// Eliminar aula
const eliminarAula = async (req, res) => {
  const { id } = req.params;
  try {
    const aula = await Aula.findByPk(id);
    if (!aula) {
      return res.status(404).json({ success: false, message: 'Aula no encontrada' });
    }

    await aula.destroy();
    res.json({ success: true, message: 'Aula eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar aula:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar aula' });
  }
};

module.exports = {
  obtenerAulas,
  obtenerAulaPorId,
  crearAula,
  actualizarAula,
  eliminarAula
};
