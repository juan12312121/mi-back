// src/controllers/gruposcontroller.js
// Importa Op de sequelize si vas a usar operadores avanzados
const { Op } = require('sequelize'); // Importa Op
const Grupo = require("../models/gruposModel"); // Importa tu modelo de Grupo
const sequelize = require("../config/config"); // Lo mantienes si lo usas para queries crudas en otros lados
const Carrera = require("../models/carrerasModel"); // Importa tu modelo de Carrera (necesario para include)
const Usuario = require('../models/usuarioModel'); // Importa tu modelo de Usuario (necesario para validar permisos)
const Rol = require('../models/rolesModel');     // Importa tu modelo de Rol (necesario para validar permisos)

// Asegúrate de que tus modelos tienen las relaciones configuradas:
// Grupo.belongsTo(Carrera, { foreignKey: 'carrera_id', as: 'carrera' }); // Esto lo añadimos en gruposModel.js
// Usuario.belongsTo(Rol, { foreignKey: 'rol_id', as: 'rol' }); // Ya está en usuarioModel.js
// Usuario.belongsTo(Carrera, { foreignKey: 'carrera_id', as: 'carrera' }); // Ya está en usuarioModel.js


// Roles (AJUSTA si son diferentes en tu BD)
const ROL_JEFE_CARRERA = 4;
const ROL_ADMINISTRADOR = 5;


/**
 * Obtiene grupos. Filtra automáticamente por carrera del usuario logeado si es Jefe de Carrera.
 * Requiere autenticación. Valida permisos según el rol del usuario.
 * Usa el ORM de Sequelize con include.
 */
const obtenerGrupos = async (req, res) => {
    // El middleware `verificarToken` DEBE adjuntar el objeto usuario decodificado (con id, rol_id, carrera_id, etc.)
    // a `req.usuario`.
    // AJUSTA 'req.usuario' si tu middleware usa otra propiedad (ej: req.user, req.decoded)
    const user = req.usuario; // Usuario obtenido del token y de la DB por authMiddleware

    try {
      // 1. Verificar autenticación (el middleware ya lo hizo, pero verificar `req.usuario` es seguro)
      if (!user) {
          console.warn('Backend: obtenerGrupos: req.usuario is missing. Token problem?');
          return res.status(401).json({ message: 'No autenticado.' });
      }

      let whereCondition = {}; // Objeto para construir la cláusula WHERE de Sequelize
      let includeOptions = [
          // Siempre incluimos el nombre de la carrera asociada. Usa el alias 'carrera' definido en el modelo.
          { model: Carrera, as: 'carrera', attributes: ['nombre'] }
      ];

      // --- Lógica de validación de permisos y construcción del filtro ---
      // 1. Si el usuario es Administrador (rol_id 5): puede ver TODOS los grupos.
      if (user.rol_id === ROL_ADMINISTRADOR) {
          console.log('Backend: Usuario es Administrador. Obteniendo todos los grupos.');
          // No aplicamos filtro de carrera en el WHERE por defecto para el admin.
      }
      // 2. Si el usuario es Jefe de Carrera (rol_id 4):
      else if (user.rol_id === ROL_JEFE_CARRERA) {
          // Un jefe de carrera SOLO debe ver grupos de SU carrera asignada.
          // Verificamos si el jefe tiene carrera_id asignada en su perfil (desde req.usuario).
          if (user.carrera_id !== null && user.carrera_id !== undefined) {
               // Si el jefe de carrera tiene carrera_id asignada, aplicamos el filtro por su carrera_id.
               whereCondition = { carrera_id: user.carrera_id };
               console.log(`Backend: Usuario es Jefe de Carrera (${user.id}). Obteniendo grupos para carrera ID: ${user.carrera_id}.`);
          } else {
               // Si el jefe de carrera NO tiene carrera_id asignada en su perfil
               console.warn(`Backend: Jefe de Carrera (${user.id}) sin carrera_id asignada. Acceso denegado.`);
               // Devolver 200 OK con data vacía y un mensaje específico, más amigable para el frontend.
               // Si prefieres un 403 estricto, cambia el status code.
               return res.status(200).json({ message: 'Su usuario no tiene una carrera asignada para ver grupos.', data: [] });
          }
      }
      // 3. Otros roles no deberían tener acceso a esta ruta (el middleware ya los bloquea mayormente),
      // pero añadimos una capa de seguridad extra aquí.
      else {
          console.warn(`Backend: Usuario con rol ${user.rol_id} intentó acceder a grupos. Acceso denegado.`);
          return res.status(403).json({ message: 'No autorizado para ver grupos.' });
      }
      // --- Fin de lógica de validación de permisos y construcción del filtro ---


      // Realiza la consulta a la base de datos usando la condición WHERE construida
      const grupos = await Grupo.findAll({
        where: whereCondition, // Aplica el filtro de carrera (si aplica para Jefe de Carrera)
        include: includeOptions, // Incluye la relación con Carrera para el nombre
        order: [ // Opcional: ordena los resultados
            ['semestre', 'ASC'], // Ordena por semestre (asumiendo que 'semestre' se puede ordenar así)
            ['nombre', 'ASC'] // Luego por nombre
        ]
      });

      // Responde con la lista de grupos obtenida.
      // Si no se encontraron grupos DESPUÉS de aplicar los filtros (carrera/permisos),
      // devolvemos 200 OK con un array vacío.
      res.status(200).json({
        message: 'Grupos obtenidos exitosamente',
        data: grupos, // Devuelve el array de grupos (filtrado si aplicó)
      });
    } catch (error) {
      console.error('Backend: Error en obtenerGruposController:', error);
      res.status(500).json({ error: 'Hubo un error al obtener los grupos', details: error.message }); // Añade detalles del error
    }
  };

/**
 * Insertar un nuevo grupo.
 * Requiere autenticación (Jefe de Carrera o Admin). Valida que sea de la carrera del jefe si aplica.
 */
const insertarGrupo = async (req, res) => {
  const { nombre, carrera_id, semestre } = req.body;
  const user = req.usuario; // Usuario obtenido del token

  try {
    // 1. Validar autenticación (middleware ya lo hizo, pero verificamos req.usuario)
    if (!user) return res.status(401).json({ message: 'No autenticado.' });

    // 2. Validar datos mínimos del body
    if (!nombre || !carrera_id) { // semestre puede ser null según tu tabla
      return res.status(400).json({ message: 'Nombre y carrera_id son requeridos.' });
    }

    // 3. Lógica de validación de permisos para INSERTAR
    if (user.rol_id === ROL_JEFE_CARRERA) {
        // Si es Jefe de Carrera, verifica que el grupo que intenta crear sea de SU carrera
        if (user.carrera_id === null || user.carrera_id === undefined) {
             return res.status(403).json({ message: 'Su usuario no tiene una carrera asignada para crear grupos.' });
        }
        // Verifica que el carrera_id proporcionado en el body coincida con el carrera_id del jefe logeado.
        if (carrera_id !== user.carrera_id) {
             return res.status(403).json({ message: 'No autorizado para crear grupos en una carrera diferente a la suya.' });
        }
    } else if (user.rol_id !== ROL_ADMINISTRADOR) {
         // Otros roles no autorizados (Admin ya tiene acceso por defecto si el middleware lo permite)
         return res.status(403).json({ message: 'No autorizado para crear grupos.' });
    }
    // Nota: Si es Admin (rol 5), el middleware ya le dio acceso. No validamos qué carrera_id pone aquí en esta versión simplificada.
    // Para más seguridad, un Admin podría requerir especificar la carrera_id y validarla vs DB.


    // 4. Opcional: Verificar si la carrera_id existe en la tabla Carreras si no confías 100% en el frontend
    const carreraExistente = await Carrera.findByPk(carrera_id);
    if (!carreraExistente) {
         return res.status(404).json({ message: `Carrera con ID ${carrera_id} no encontrada.` });
    }


    // 5. Si las validaciones pasaron, crear el grupo
    const nuevoGrupo = await Grupo.create({ nombre, carrera_id, semestre });

    // Opcional: Recuperar el grupo recién creado con la relación de carrera para la respuesta detallada
    const grupoCreadoConCarrera = await Grupo.findByPk(nuevoGrupo.id, {
         include: [{ model: Carrera, as: 'carrera', attributes: ['nombre'] }]
    });

    // Responde con éxito
    res.status(201).json({
      message: "Grupo creado exitosamente",
      data: grupoCreadoConCarrera, // Devuelve el objeto completo con relación si lo incluiste
    });
  } catch (error) {
    console.error("Backend: Error en insertarGrupoController:", error);
    res.status(500).json({ error: "Hubo un error al crear el grupo", details: error.message });
  }
};

/**
 * Obtener un grupo por ID.
 * Requiere autenticación. Valida permisos (Jefe de Carrera solo ve los de su carrera, Admin cualquiera).
 */
const obtenerGrupoPorId = async (req, res) => {
  const { id } = req.params;
  const user = req.usuario; // Usuario obtenido del token

  try {
    // 1. Validar autenticación
    if (!user) return res.status(401).json({ message: 'No autenticado.' });

    // 2. Buscar el grupo por su ID
    const grupo = await Grupo.findByPk(id, {
        include: [{ model: Carrera, as: 'carrera', attributes: ['nombre'] }] // Incluye la relación
    });

    if (!grupo) {
      return res.status(404).json({ message: "Grupo no encontrado" });
    }

    // 3. --- Lógica de validación de permisos para OBTENER POR ID ---
    if (user.rol_id === ROL_JEFE_CARRERA) {
         // Si es Jefe de Carrera, verifica que el grupo solicitado sea de SU carrera
         if (user.carrera_id === null || user.carrera_id === undefined) {
              return res.status(403).json({ message: 'Su usuario no tiene una carrera asignada.' });
         }
         if (grupo.carrera_id !== user.carrera_id) {
              return res.status(403).json({ message: 'No autorizado para ver grupos de otra carrera.' });
         }
     } else if (user.rol_id !== ROL_ADMINISTRADOR) {
         // Otros roles no autorizados (Admin ya tiene acceso por defecto si el middleware lo permite)
         return res.status(403).json({ message: 'No autorizado para ver grupos.' });
     }
    // Nota: Si es Admin (rol 5), el middleware ya le dio acceso y puede ver cualquier grupo si existe.


    // 4. Si las validaciones pasaron, responde con el grupo
    res.status(200).json({
        message: "Grupo obtenido exitosamente",
        data: grupo // Devuelve el objeto grupo (con relación incluida)
    });

  } catch (error) {
    console.error("Backend: Error al obtener grupo por ID:", error);
    res.status(500).json({ error: "No se pudo obtener el grupo", details: error.message });
  }
};

/**
 * Actualizar un grupo existente.
 * Requiere autenticación (Jefe de Carrera o Admin). Valida permisos.
 */
const actualizarGrupo = async (req, res) => {
  const { id } = req.params;
  const { nombre, carrera_id, semestre } = req.body; // carrera_id y semestre opcionales
  const user = req.usuario; // Usuario obtenido del token

  try {
      // 1. Validar autenticación
      if (!user) return res.status(401).json({ message: 'No autenticado.' });

      // 2. Validar que al menos un campo (nombre, carrera_id, semestre) se proporciona para actualizar
      if (nombre === undefined && carrera_id === undefined && semestre === undefined) {
          return res.status(400).json({ message: 'Se requiere al menos un campo (nombre, carrera_id, o semestre) para actualizar.' });
      }

      // 3. Buscar el grupo existente
      const grupoAActualizar = await Grupo.findByPk(id);
      if (!grupoAActualizar) {
          return res.status(404).json({ message: `Grupo con ID ${id} no encontrado.` });
      }

      // 4. --- Lógica de validación de permisos para ACTUALIZAR ---
      if (user.rol_id === ROL_JEFE_CARRERA) {
          // Si es Jefe de Carrera, verifica que el grupo sea de SU carrera
          if (user.carrera_id === null || user.carrera_id === undefined) {
               return res.status(403).json({ message: 'Su usuario no tiene una carrera asignada.' });
          }
          if (grupoAActualizar.carrera_id !== user.carrera_id) {
               return res.status(403).json({ message: 'No autorizado para actualizar grupos de otra carrera.' });
          }
          // Impedir que un Jefe de Carrera cambie el carrera_id o semestre del grupo (generalmente)
          if (carrera_id !== undefined && carrera_id !== grupoAActualizar.carrera_id) {
               return res.status(403).json({ message: 'No autorizado para cambiar la carrera de un grupo.' });
          }
           if (semestre !== undefined && semestre !== grupoAActualizar.semestre) {
                // Decide si permites al Jefe cambiar el semestre o no
                // Si no permites: return res.status(403).json({ message: 'No autorizado para cambiar el semestre de un grupo.' });
                // Si permites: continúa
           }
          // Si es Jefe de Carrera, solo puede actualizar nombre y quizás semestre (si lo permites)
          // Forzamos el carrera_id si viene en el body para asegurar que sea el suyo, aunque ya validamos que no sea diferente
           if (carrera_id !== undefined && carrera_id === user.carrera_id) { // Si el jefe envía su propia carrera_id
                grupoAActualizar.carrera_id = carrera_id;
           } // Si no envía carrera_id, mantenemos el existente (validado como suyo)

      } else if (user.rol_id === ROL_ADMINISTRADOR) {
          // Admin puede actualizar cualquier grupo.
          // Si el admin intenta cambiar el carrera_id, verificamos que la nueva carrera exista.
          if (carrera_id !== undefined && carrera_id !== grupoAActualizar.carrera_id) {
              const carreraExistente = await Carrera.findByPk(carrera_id);
              if (!carreraExistente) {
                  return res.status(404).json({ message: `Carrera con ID ${carrera_id} no encontrada.` });
              }
           }
      } else {
           // Otros roles no autorizados
           return res.status(403).json({ message: 'No autorizado para actualizar grupos.' });
      }
      // --- Fin de lógica de validación de permisos ---


      // 5. Aplicar actualizaciones si los campos se proporcionaron y pasaron validación
      if (nombre !== undefined) grupoAActualizar.nombre = nombre;
      if (semestre !== undefined) grupoAActualizar.semestre = semestre; // Asegúrate de manejar semestre aquí
      // carrera_id ya se manejó en la validación de admin o jefe.


      await grupoAActualizar.save(); // Guarda los cambios

      // Opcional: volver a cargar la relación a carrera para la respuesta detallada
      const grupoActualizadoConCarrera = await Grupo.findByPk(id, {
        include: [{ model: Carrera, as: "carrera", attributes: ["nombre"] }],
      });

      res.status(200).json({
        message: "Grupo actualizado exitosamente",
        data: grupoActualizadoConCarrera,
      });
    } catch (error) {
      console.error("Backend: Error al actualizar grupo:", error);
      res.status(500).json({ error: "Hubo un error al actualizar el grupo", details: error.message });
    }
  };

/**
 * Eliminar un grupo existente.
 * Requiere autenticación (Jefe de Carrera o Admin). Valida permisos.
 */
const eliminarGrupo = async (req, res) => {
  const { id } = req.params;
  const user = req.usuario; // Usuario obtenido del token

  try {
      // 1. Validar autenticación
      if (!user) return res.status(401).json({ message: 'No autenticado.' });

      // 2. Buscar el grupo existente para validar permisos
      const grupoAEliminar = await Grupo.findByPk(id);

      if (!grupoAEliminar) {
          return res.status(404).json({ message: "Grupo no encontrado" });
      }

      // 3. --- Lógica de validación de permisos para ELIMINAR ---
      if (user.rol_id === ROL_JEFE_CARRERA) {
          // Si es Jefe de Carrera, verifica que el grupo sea de SU carrera
          if (user.carrera_id === null || user.carrera_id === undefined) {
               return res.status(403).json({ message: 'Su usuario no tiene una carrera asignada.' });
          }
          if (grupoAEliminar.carrera_id !== user.carrera_id) {
               return res.status(403).json({ message: 'No autorizado para eliminar grupos de otra carrera.' });
          }
      } else if (user.rol_id !== ROL_ADMINISTRADOR) {
           // Otros roles no autorizados
           return res.status(403).json({ message: 'No autorizado para eliminar grupos.' });
      }
      // Nota: Si es Admin (rol 5), el middleware ya le dio acceso y puede eliminar cualquier grupo si existe.


      // 4. Si las validaciones pasaron, eliminar el grupo
      await grupoAEliminar.destroy();

      // Responde con éxito
      res.status(200).json({ message: "Grupo eliminado exitosamente" });

  } catch (error) {
    console.error("Backend: Error al eliminar grupo:", error);
    res.status(500).json({ error: "Hubo un error al eliminar el grupo", details: error.message });
  }
};


// >>>>>>>> obtenerGruposPorUsuario ELIMINADO/REFACTORIZADO <<<<<<<<<<
// Ya no necesitamos esta función porque 'obtenerGrupos' ha sido modificada
// para filtrar automáticamente por la carrera del usuario del token si es Jefe de Carrera.
// Si necesitas una ruta que explícitamente filtre por un usuario_id PASADO EN LA URL (inseguro),
// podrías recrearla, pero la versión segura es que el backend use el ID del TOKEN.


// Exporta todas las funciones
module.exports = {
  obtenerGrupos, // Ahora este método obtiene todos O los de la carrera del Jefe
  insertarGrupo,
  obtenerGrupoPorId, // Ahora valida si el Jefe ve los de su carrera
  actualizarGrupo, // Ahora valida permisos
  eliminarGrupo, // Ahora valida permisos
  // obtenerGruposPorUsuario, // <-- Ya no se exporta porque fue eliminado/reemplazado
};