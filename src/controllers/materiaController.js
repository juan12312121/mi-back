const Materia = require('../models/materiasModel'); // Asegúrate de importar sin llaves
const sequelize = require('../config/config');
const Carrera = require('../models/carrerasModel'); // Asegúrate de importar el modelo Carrera



const crearMateria = async (req, res) => {
  const { nombre, carrera_id } = req.body;

  try {
    if (!nombre || !carrera_id) {
      return res.status(400).json({ error: 'El nombre y el ID de la carrera son requeridos' });
    }

    const nuevaMateria = await Materia.create({ nombre, carrera_id });

    res.status(201).json({
      message: 'Materia creada exitosamente',
      data: nuevaMateria,
    });
  } catch (error) {
    console.error('Error al crear la materia:', error);
    res.status(500).json({ error: 'Hubo un error al crear la materia' });
  }
};

const obtenerMaterias = async (req, res) => {
    try {
      // Obtener todas las materias con el nombre de la carrera asociada
      const materias = await Materia.findAll({
        include: [
          {
            model: Carrera,
            as: 'carrera', // Alias que se usará para acceder a los datos de la carrera
            attributes: ['nombre'], // Solo obtenemos el nombre de la carrera
          },
        ],
      });
  
      if (!materias || materias.length === 0) {
        return res.status(404).json({ message: 'No se encontraron materias' });
      }
  
      res.status(200).json({
        message: 'Materias obtenidas exitosamente',
        data: materias,
      });
    } catch (error) {
      console.error('Error al obtener las materias:', error);
      res.status(500).json({ error: 'Hubo un error al obtener las materias' });
    }
  };

  const actualizarMateria = async (req, res) => {
    const { id } = req.params;
    const { nombre, carrera_id } = req.body;
  
    if (!nombre || !carrera_id) {
      return res.status(400).json({ error: 'El nombre y el ID de la carrera son requeridos' });
    }
  
    try {
      // Buscar la materia
      const materia = await Materia.findByPk(id);
      if (!materia) {
        return res.status(404).json({ error: 'Materia no encontrada' });
      }
  
      // Actualizar campos
      materia.nombre = nombre;
      materia.carrera_id = carrera_id;
      await materia.save();
  
      // Opcional: volver a cargar la relación a carrera para respuesta
      const materiaActualizada = await Materia.findByPk(id, {
        include: [{ model: Carrera, as: 'carrera', attributes: ['nombre'] }]
      });
  
      res.status(200).json({
        message: 'Materia actualizada exitosamente',
        data: materiaActualizada
      });
    } catch (error) {
      console.error('Error al actualizar la materia:', error);
      res.status(500).json({ error: 'Hubo un error al actualizar la materia' });
    }
  };

  const eliminarMateria = async (req, res) => {
    const { id } = req.params;
  
    try {
      const materia = await Materia.findByPk(id);
  
      if (!materia) {
        return res.status(404).json({ error: 'Materia no encontrada' });
      }
  
      await materia.destroy();
  
      res.status(200).json({ message: 'Materia eliminada exitosamente' });
    } catch (error) {
      console.error('Error al eliminar la materia:', error);
      res.status(500).json({ error: 'Hubo un error al eliminar la materia' });
    }
  };
  
  

module.exports = { crearMateria,
    obtenerMaterias, actualizarMateria, eliminarMateria
 };
