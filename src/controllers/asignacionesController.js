
const sequelize = require('../config/config'); // Ajusta el path si es necesario

// Obtener todas las asignaciones (consulta manual)
const obtenerAsignaciones = async (req, res) => {
  try {
    const [asignaciones] = await sequelize.query(`
      SELECT 
        asignaciones.id,
        usuarios.nombre AS profesorNombre,
        materias.nombre AS materiaNombre
      FROM asignaciones
      INNER JOIN usuarios ON asignaciones.profesor_id = usuarios.id
      INNER JOIN materias ON asignaciones.materia_id = materias.id
      WHERE usuarios.rol_id = 1;  -- Asegúrate de filtrar solo los profesores
    `);

    res.json(asignaciones);
  } catch (error) {
    console.error('Error al obtener las asignaciones:', error);
    res.status(500).json({ message: 'Error al obtener las asignaciones' });
  }
};

// Crear nueva asignación (también manual, pero usando consulta con parámetros)
const crearAsignacion = async (req, res) => {
  try {
    const { profesor_id, materia_id } = req.body;

    // Validaciones
    if (!profesor_id || !materia_id) {
      return res.status(400).json({ message: 'Profesor y materia son requeridos' });
    }

    // Verificamos si el profesor es un usuario válido con rol de profesor (rol_id = 1)
    const [profesor] = await sequelize.query(`
      SELECT id FROM usuarios WHERE id = :profesor_id AND rol_id = 1
    `, {
      replacements: { profesor_id },
      type: sequelize.QueryTypes.SELECT
    });

    if (!profesor) {
      return res.status(400).json({ message: 'El usuario no es un profesor válido' });
    }

    // Insertar la nueva asignación
    await sequelize.query(`
      INSERT INTO asignaciones (profesor_id, materia_id)
      VALUES (:profesor_id, :materia_id)
    `, {
      replacements: { profesor_id, materia_id },
      type: sequelize.QueryTypes.INSERT
    });

    res.status(201).json({ message: 'Asignación creada exitosamente' });
  } catch (error) {
    console.error('Error al crear la asignación:', error);
    res.status(500).json({ message: 'Error al crear la asignación' });
  }
};

const actualizarAsignacion = async (req, res) => {
    try {
      const { id } = req.params;  // id de la asignación a actualizar
      const { profesor_id, materia_id } = req.body;
  
      // Validaciones
      if (!profesor_id || !materia_id) {
        return res.status(400).json({ message: 'Profesor y materia son requeridos' });
      }
  
      // Verificar si la asignación existe
      const [asignacion] = await sequelize.query(`SELECT * FROM asignaciones WHERE id = :id`, {
        replacements: { id },
        type: sequelize.QueryTypes.SELECT
      });
  
      if (!asignacion) {
        return res.status(404).json({ message: 'Asignación no encontrada' });
      }
  
      // Verificar si el profesor es válido con rol de profesor (rol_id = 1)
      const [profesor] = await sequelize.query(`
        SELECT id FROM usuarios WHERE id = :profesor_id AND rol_id = 1
      `, {
        replacements: { profesor_id },
        type: sequelize.QueryTypes.SELECT
      });
  
      if (!profesor) {
        return res.status(400).json({ message: 'El usuario no es un profesor válido' });
      }
  
      // Actualizar la asignación
      await sequelize.query(`
        UPDATE asignaciones
        SET profesor_id = :profesor_id, materia_id = :materia_id
        WHERE id = :id
      `, {
        replacements: { id, profesor_id, materia_id },
        type: sequelize.QueryTypes.UPDATE
      });
  
      res.status(200).json({ message: 'Asignación actualizada exitosamente' });
    } catch (error) {
      console.error('Error al actualizar la asignación:', error);
      res.status(500).json({ message: 'Error al actualizar la asignación' });
    }
  };

  // Eliminar asignación
const eliminarAsignacion = async (req, res) => {
    try {
      const { id } = req.params;  // id de la asignación a eliminar
  
      // Verificar si la asignación existe
      const [asignacion] = await sequelize.query(`SELECT * FROM asignaciones WHERE id = :id`, {
        replacements: { id },
        type: sequelize.QueryTypes.SELECT
      });
  
      if (!asignacion) {
        return res.status(404).json({ message: 'Asignación no encontrada' });
      }
  
      // Eliminar la asignación
      await sequelize.query(`
        DELETE FROM asignaciones WHERE id = :id
      `, {
        replacements: { id },
        type: sequelize.QueryTypes.DELETE
      });
  
      res.status(200).json({ message: 'Asignación eliminada exitosamente' });
    } catch (error) {
      console.error('Error al eliminar la asignación:', error);
      res.status(500).json({ message: 'Error al eliminar la asignación' });
    }
  };
  

module.exports = {
  obtenerAsignaciones,
  crearAsignacion,
  actualizarAsignacion,
  eliminarAsignacion
};
