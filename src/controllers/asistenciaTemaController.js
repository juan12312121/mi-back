const sequelize = require('../config/config');
const Asignacion = require('../models/asignacionModel');
const Asistencia = require('../models/asistenciaNodel');
const TemaVisto = require('../models/temaVistoModel');
const Usuario = require('../models/usuarioModel');
const Rol = require('../models/rolesModel');


// 📌 Función para registrar asistencia y tema visto
const registrarAsistenciaYTema = async (req, res) => {
  try {
    const {
      asignacion_id,
      asistio,
      registrado_por_id,
      tipo_registro,
      tema
    } = req.body;

    if (!asignacion_id || typeof asistio === 'undefined' || !registrado_por_id) {
      return res.status(400).json({ message: 'Faltan campos obligatorios.' });
    }

    const asignacion = await Asignacion.findByPk(asignacion_id);
    if (!asignacion) {
      return res.status(404).json({ message: 'Asignación no encontrada.' });
    }

    const { profesor_id, materia_id } = asignacion;

    const usuario = await Usuario.findByPk(registrado_por_id, {
      include: {
        model: Rol,
        as: 'rol'
      }
    });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    const rol = usuario.rol.nombre;
    const tipoRegistro = asignarTipoRegistro(rol);

    // Validar si es profesor y asistió, entonces debe haber tema
    if (rol === 'Profesor' && asistio === true && (!tema || tema.trim() === '')) {
      return res.status(400).json({ message: 'Debe registrar un tema si asistió como profesor.' });
    }

    // Insertar asistencia
    const nuevaAsistencia = await Asistencia.create({
      asignacion_id,
      asistio,
      registrado_por_id,
      tipo_registro: tipoRegistro,
      profesor_id,
      materia_id
    });

    // Insertar tema si aplica
    let nuevoTema = null;
    if (tema && tema.trim() !== '') {
      nuevoTema = await TemaVisto.create({
        asignacion_id,
        tema,
        registrado_por_id
      });
    }

    return res.status(201).json({
      message: 'Registro exitoso',
      asistencia: nuevaAsistencia,
      tema: nuevoTema
    });

  } catch (error) {
    console.error('Error al registrar asistencia y tema:', error);
    return res.status(500).json({ message: 'Error del servidor' });
  }
};

const obtenerTodasLasAsistencias = async (req, res) => {
  try {
    const results = await sequelize.query(
      `
      SELECT
        a.id,
        a.asignacion_id,
        DATE(CONVERT_TZ(a.fecha, '+00:00', '-07:00')) AS fecha,
        TIME(CONVERT_TZ(a.fecha, '+00:00', '-07:00')) AS hora,
        ELT(WEEKDAY(CONVERT_TZ(a.fecha, '+00:00', '-07:00'))+1, 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo') AS dia_semana,
        a.asistio,
        a.registrado_por_id,
        a.tipo_registro,
        m.nombre AS materia_nombre,
        u.nombre AS profesor_nombre,
        u2.nombre AS registrado_por_nombre
      FROM asistencias a
      JOIN asignaciones s ON a.asignacion_id = s.id
      JOIN materias m ON s.materia_id = m.id
      JOIN usuarios u ON s.profesor_id = u.id
      JOIN roles r ON u.rol_id = r.id
      JOIN usuarios u2 ON a.registrado_por_id = u2.id
      WHERE r.nombre = 'Profesor'
      ORDER BY a.fecha DESC;
      `,
      {
        type: sequelize.QueryTypes.SELECT
      }
    );

    console.log("Resultados de asistencias:", results);
    return res.status(200).json(results);
  } catch (error) {
    console.error('Error al obtener las asistencias:', error);
    return res.status(500).json({ message: 'Error del servidor' });
  }
};


const obtenerAsistenciasPorUsuario = async (req, res) => {
  try {
    // Obtener el userId de la solicitud (puede venir en los parámetros de la URL, o el cuerpo de la solicitud)
    const { userId } = req.params;  // O si lo pasas en el cuerpo: const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'Se debe proporcionar un userId.' });
    }

    const results = await sequelize.query(
      `
      SELECT
        a.id,
        a.asignacion_id,
        DATE(CONVERT_TZ(a.fecha, '+00:00', '-07:00')) AS fecha,
        TIME(CONVERT_TZ(a.fecha, '+00:00', '-07:00')) AS hora,
        ELT(WEEKDAY(CONVERT_TZ(a.fecha, '+00:00', '-07:00'))+1, 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo') AS dia_semana,
        a.asistio,
        a.registrado_por_id,
        a.tipo_registro,
        m.nombre AS materia_nombre,
        u.nombre AS profesor_nombre,
        u2.nombre AS registrado_por_nombre
      FROM asistencias a
      JOIN asignaciones s ON a.asignacion_id = s.id
      JOIN materias m ON s.materia_id = m.id
      JOIN usuarios u ON s.profesor_id = u.id
      JOIN roles r ON u.rol_id = r.id
      JOIN usuarios u2 ON a.registrado_por_id = u2.id
      WHERE a.registrado_por_id = :userId
      ORDER BY a.fecha DESC;
      `,
      {
        replacements: { userId },
        type: sequelize.QueryTypes.SELECT
      }
    );

    console.log(`Asistencias registradas por el usuario con id ${userId}:`, results);
    return res.status(200).json(results);
  } catch (error) {
    console.error('Error al obtener las asistencias:', error);
    return res.status(500).json({ message: 'Error del servidor' });
  }
};


const obtenerTemasVistos = async (req, res) => {
  try {
    const results = await sequelize.query(
      `
      SELECT
        tv.id,
        tv.asignacion_id,
        tv.tema,
        tv.registrado_por_id,
        u.nombre AS registrado_por_nombre,
        DATE(CONVERT_TZ(tv.fecha, '+00:00', '-07:00')) AS fecha,
        TIME(CONVERT_TZ(tv.fecha, '+00:00', '-07:00')) AS hora
      FROM temas_vistos tv
      JOIN usuarios u ON tv.registrado_por_id = u.id
      ORDER BY tv.fecha DESC;
      `,
      {
        type: sequelize.QueryTypes.SELECT
      }
    );

    console.log("Temas vistos:", results);
    return res.status(200).json(results);
  } catch (error) {
    console.error('Error al obtener los temas vistos:', error);
    return res.status(500).json({ message: 'Error del servidor' });
  }
};

const obtenerTemasPorUsuario = async (req, res) => {
  const { usuarioId } = req.params; // o req.query / req.body dependiendo cómo lo envíes

  try {
    const results = await sequelize.query(
      `
      SELECT
        tv.id,
        tv.asignacion_id,
        tv.tema,
        tv.registrado_por_id,
        u.nombre AS registrado_por_nombre,
        DATE(CONVERT_TZ(tv.fecha, '+00:00', '-07:00')) AS fecha,
        TIME(CONVERT_TZ(tv.fecha, '+00:00', '-07:00')) AS hora
      FROM temas_vistos tv
      JOIN usuarios u ON tv.registrado_por_id = u.id
      WHERE tv.registrado_por_id = :usuarioId
      ORDER BY tv.fecha DESC;
      `,
      {
        replacements: { usuarioId }, // este sustituye :usuarioId
        type: sequelize.QueryTypes.SELECT
      }
    );

    return res.status(200).json(results);
  } catch (error) {
    console.error('Error al obtener los temas del usuario:', error);
    return res.status(500).json({ message: 'Error del servidor' });
  }
};



// 📌 Mapeo de tipo de registro según rol
const asignarTipoRegistro = (rol) => {
  const tipos = {
    'Profesor': 'Profesor',
    'Checador': 'Checador',
    'Jefe de Grupo': 'Jefe de Grupo',
    'Jefe de Carrera': 'Jefe de Carrera',
    'Administrador': 'Administrador',
  };

  return tipos[rol] || 'Checador';
};

module.exports = {
  registrarAsistenciaYTema,
  obtenerTodasLasAsistencias,
  obtenerAsistenciasPorUsuario,
  obtenerTemasVistos,
  obtenerTemasPorUsuario
};
