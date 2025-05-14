const sequelize = require('../config/config'); // Importar sequelize desde la configuración
const { Horario } = require('../models/horariosModel'); // Importar modelo de horarios
const { Grupo } = require('../models/gruposModel'); // Importar modelo de grupos
const { Aula } = require('../models/aulasModel'); // Importar modelo de aulas
const { Op } = require('sequelize'); // Operadores de Sequelize

// Crear un nuevo horario
exports.crearHorario = async (req, res) => {
  try {
    const nuevoHorario = await Horario.create(req.body);
    res.status(201).json({ success: true, data: nuevoHorario });
  } catch (error) {
    console.error('Error al crear horario:', error);
    res.status(500).json({ success: false, message: 'Error al crear horario', error: error.message });
  }
};

// Obtener horarios usando una consulta SQL personalizada
exports.obtenerHorariosConSQL = async (req, res) => {
  try {
    const [resultados] = await sequelize.query(`
      SELECT 
        h.id,
        h.asignacion_id,
        h.dia_semana,
        h.hora_inicio,
        h.hora_fin,
        h.grupo_id,
        g.nombre         AS grupo_nombre,
        h.aula_id,
        a.nombre         AS aula_nombre,
        h.turno,
        h.tipo_duracion,
        h.duracion_clase,
        h.tiempo_descanso,

        -- Campos nuevos:
        m.id              AS materia_id,
        m.nombre          AS materia_nombre,
        u.id              AS profesor_id,
        u.nombre          AS profesor_nombre

      FROM horarios h
      LEFT JOIN grupos     g ON h.grupo_id       = g.id
      LEFT JOIN aulas      a ON h.aula_id        = a.id
      LEFT JOIN asignaciones asg ON h.asignacion_id = asg.id
      LEFT JOIN materias   m ON asg.materia_id    = m.id
      LEFT JOIN usuarios   u ON asg.profesor_id   = u.id
    `);
    res.status(200).json({ success: true, data: resultados });
  } catch (error) {
    console.error('Error al obtener horarios (consulta SQL):', error);
    res.status(500).json({ success: false, message: 'Error al obtener horarios', error: error.message });
  }
};


// Obtener los valores ENUM disponibles para días, turnos y tipos de duración
exports.obtenerValoresEnum = (req, res) => {
  try {
    const diasSemana = Horario.rawAttributes.dia_semana.values;
    const turnos = Horario.rawAttributes.turno.values;
    const tiposDuracion = Horario.rawAttributes.tipo_duracion.values;

    res.status(200).json({
      success: true,
      data: {
        diasSemana,
        turnos,
        tiposDuracion
      }
    });
  } catch (error) {
    console.error('Error al obtener ENUMs:', error);
    res.status(500).json({ success: false, message: 'Error al obtener ENUMs', error: error.message });
  }
};

exports.obtenerHorariosPorUsuario = async (req, res) => {
  try {
    const usuarioId = req.params.usuarioId;
    if (!usuarioId) {
      return res.status(400).json({ error: 'ID de usuario no proporcionado' });
    }

    // Verificar el grupo_id del usuario utilizando una consulta SQL directa
    const [usuario] = await sequelize.query(`
      SELECT grupo_id 
      FROM usuarios 
      WHERE id = :usuarioId
    `, {
      replacements: { usuarioId },
      type: sequelize.QueryTypes.SELECT
    });

    if (!usuario) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    console.log(`Usuario con ID: ${usuarioId} tiene grupo_id: ${usuario.grupo_id}`);

    // Obtener los horarios asociados al grupo_id, incluyendo el nombre del usuario (como profesor) y la materia
    const horarios = await sequelize.query(`
      SELECT h.*, 
             u.nombre AS profesor_nombre, 
             m.nombre AS materia_nombre
      FROM horarios h
      JOIN asignaciones a ON h.asignacion_id = a.id
      JOIN usuarios u ON a.profesor_id = u.id
      JOIN materias m ON a.materia_id = m.id
      WHERE h.grupo_id = :grupoId
      ORDER BY 
        FIELD(h.dia_semana, 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'), 
        h.hora_inicio ASC
    `, {
      replacements: { grupoId: usuario.grupo_id },
      type: sequelize.QueryTypes.SELECT
    });

    if (horarios.length === 0) {
      return res.status(404).json({
        success: false, 
        message: 'No se encontraron horarios para este grupo'
      });
    }

    // Agrupar los horarios por grupo_id
    const horariosAgrupados = horarios.reduce((acc, horario) => {
      const grupoId = horario.grupo_id;
      if (!acc[grupoId]) {
        acc[grupoId] = [];
      }
      acc[grupoId].push(horario);
      return acc;
    }, {});

    console.log('Enviando respuesta con horarios agrupados:', horariosAgrupados);

    // Devolver los horarios agrupados
    return res.status(200).json({
      success: true,
      horarios: horariosAgrupados
    });

  } catch (error) {
    console.error('Error al obtener horarios por usuario:', error);
    return res.status(500).json({
      success: false, 
      message: 'Error al obtener horarios por usuario',
      error: error.message
    });
  }
};

exports.obtenerHorariosPorChecador = async (req, res) => {
  try {
    const usuarioId = req.params.usuarioId;
    if (!usuarioId) {
      return res.status(400).json({ success: false, message: 'ID de usuario no proporcionado' });
    }

    const filas = await sequelize.query(`
      SELECT
        uChec.nombre                      AS checador,
        c.nombre                          AS carrera,
        f.nombre                          AS facultad,
        g.id                              AS grupo_id,
        g.nombre                          AS grupo_nombre,
        h.id                              AS horario_id,
        h.asignacion_id,                 -- 👈 añadimos el ID de asignación aquí
        h.dia_semana,
        FIELD(h.dia_semana,
              'Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo') AS orden_dia,
        h.turno,
        h.tipo_duracion,
        h.duracion_clase,
        COALESCE(h.tiempo_descanso, 0)    AS tiempo_descanso_min,
        h.hora_inicio,
        h.hora_fin,
        aul.nombre                        AS aula,
        uProf.nombre                      AS profesor,
        m.nombre                          AS materia
      FROM usuarios uChec
        JOIN carreras c       ON uChec.carrera_id = c.id
        JOIN facultades f     ON c.facultad_id   = f.id
        JOIN grupos g         ON g.carrera_id    = c.id
        JOIN horarios h       ON h.grupo_id      = g.id
        JOIN aulas aul        ON h.aula_id       = aul.id
        JOIN asignaciones asm ON h.asignacion_id = asm.id
        JOIN usuarios uProf   ON asm.profesor_id  = uProf.id
        JOIN materias m       ON asm.materia_id   = m.id
      WHERE uChec.id    = :usuarioId
        AND uChec.rol_id = 2
      ORDER BY
        g.id,
        orden_dia,
        h.hora_inicio;
    `, {
      replacements: { usuarioId },
      type: sequelize.QueryTypes.SELECT
    });

    if (filas.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No se encontraron horarios para este usuario o no es un checador'
      });
    }

    // Agrupar los horarios por grupo y día
    const grupos = filas.reduce((acc, fila) => {
      const { grupo_id, grupo_nombre, dia_semana, ...horario } = fila;

      if (!acc[grupo_id]) {
        acc[grupo_id] = {
          grupo_id,
          grupo_nombre,
          horarios: []
        };
      }

      const diaIndex = acc[grupo_id].horarios.findIndex(h => h.dia_semana === dia_semana);

      if (diaIndex === -1) {
        acc[grupo_id].horarios.push({
          dia_semana,
          horarios_del_dia: [horario]
        });
      } else {
        acc[grupo_id].horarios[diaIndex].horarios_del_dia.push(horario);
      }

      return acc;
    }, {});

    const resultado = Object.values(grupos);

    return res.status(200).json({
      success: true,
      data: resultado
    });

  } catch (error) {
    console.error('Error al obtener horarios por checador:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener horarios por checador',
      error: error.message
    });
  }
};








