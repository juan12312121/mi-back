const Grupo = require('../models/gruposModel');
const sequelize = require('../config/config');
/**
 * Obtener todos los grupos
 */

console.log(sequelize); 

const obtenerGrupos = async (req, res) => {
    try {
      // Realizamos la consulta SQL usando JOIN entre 'grupos', 'carreras' y ahora también el campo 'semestre' de la tabla 'grupos'
      const [grupos, metadata] = await sequelize.query(`
        SELECT g.id, g.nombre AS grupo_nombre, c.nombre AS carrera_nombre, g.semestre
        FROM grupos g
        JOIN carreras c ON g.carrera_id = c.id
      `);
      
      // Si la consulta fue exitosa, enviamos la respuesta con los grupos obtenidos
      res.status(200).json(grupos);
    } catch (error) {
      // Si ocurre un error, lo mostramos en consola y enviamos un mensaje de error
      console.error('Error al obtener grupos:', error);
      res.status(500).json({ error: 'No se pudieron obtener los grupos' });
    }
  };
  
  
  

/**
 * Insertar un nuevo grupo
 */
const insertarGrupo = async (req, res) => {
    const { nombre, carrera_id, semestre } = req.body;
  
    try {
      const nuevoGrupo = await Grupo.create({ nombre, carrera_id, semestre });
      res.status(201).json({
        mensaje: 'Grupo creado exitosamente',
        grupo: nuevoGrupo
      });
    } catch (error) {
      console.error('Error al crear grupo:', error);
      res.status(500).json({ error: 'No se pudo crear el grupo' });
    }
  };
  
/**
 * Obtener un grupo por ID
 */
const obtenerGrupoPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const grupo = await Grupo.findByPk(id);

    if (!grupo) {
      return res.status(404).json({ mensaje: 'Grupo no encontrado' });
    }

    res.status(200).json(grupo);
  } catch (error) {
    console.error('Error al obtener grupo:', error);
    res.status(500).json({ error: 'No se pudo obtener el grupo' });
  }
};

/**
 * Actualizar un grupo
 */
const actualizarGrupo = async (req, res) => {
  const { id } = req.params;
  const { nombre, carrera_id } = req.body;

  try {
    const grupo = await Grupo.findByPk(id);

    if (!grupo) {
      return res.status(404).json({ mensaje: 'Grupo no encontrado' });
    }

    grupo.nombre = nombre;
    grupo.carrera_id = carrera_id;

    await grupo.save();

    res.status(200).json({
      mensaje: 'Grupo actualizado exitosamente',
      grupo
    });
  } catch (error) {
    console.error('Error al actualizar grupo:', error);
    res.status(500).json({ error: 'No se pudo actualizar el grupo' });
  }
};

/**
 * Eliminar un grupo
 */
const eliminarGrupo = async (req, res) => {
  const { id } = req.params;

  try {
    const grupo = await Grupo.findByPk(id);

    if (!grupo) {
      return res.status(404).json({ mensaje: 'Grupo no encontrado' });
    }

    await grupo.destroy();

    res.status(200).json({ mensaje: 'Grupo eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar grupo:', error);
    res.status(500).json({ error: 'No se pudo eliminar el grupo' });
  }
};

module.exports = {
  obtenerGrupos,
  insertarGrupo,
  obtenerGrupoPorId,
  actualizarGrupo,
  eliminarGrupo
};
