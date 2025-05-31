const Materia = require("../models/materiasModel"); // Asegúrate de importar sin llaves
const sequelize = require("../config/config");
const Carrera = require("../models/carrerasModel"); // Asegúrate de importar el modelo Carrera

const crearMateria = async (req, res) => {
  const { nombre, carrera_id } = req.body;

  try {
    if (!nombre || !carrera_id) {
      return res
        .status(400)
        .json({ error: "El nombre y el ID de la carrera son requeridos" });
    }

    const nuevaMateria = await Materia.create({ nombre, carrera_id });

    res.status(201).json({
      message: "Materia creada exitosamente",
      data: nuevaMateria,
    });
  } catch (error) {
    console.error("Error al crear la materia:", error);
    res.status(500).json({ error: "Hubo un error al crear la materia" });
  }
};

const obtenerMaterias = async (req, res) => {
  try {
    // Obtener todas las materias con el nombre de la carrera asociada
    const materias = await Materia.findAll({
      include: [
        {
          model: Carrera,
          as: "carrera", // Alias que se usará para acceder a los datos de la carrera
          attributes: ["nombre"], // Solo obtenemos el nombre de la carrera
        },
      ],
    });

    if (!materias || materias.length === 0) {
      return res.status(404).json({ message: "No se encontraron materias" });
    }

    res.status(200).json({
      message: "Materias obtenidas exitosamente",
      data: materias,
    });
  } catch (error) {
    console.error("Error al obtener las materias:", error);
    res.status(500).json({ error: "Hubo un error al obtener las materias" });
  }
};

const actualizarMateria = async (req, res) => {
  const { id } = req.params;
  const { nombre, carrera_id } = req.body;

  if (!nombre || !carrera_id) {
    return res
      .status(400)
      .json({ error: "El nombre y el ID de la carrera son requeridos" });
  }

  try {
    // Buscar la materia
    const materia = await Materia.findByPk(id);
    if (!materia) {
      return res.status(404).json({ error: "Materia no encontrada" });
    }

    // Actualizar campos
    materia.nombre = nombre;
    materia.carrera_id = carrera_id;
    await materia.save();

    // Opcional: volver a cargar la relación a carrera para respuesta
    const materiaActualizada = await Materia.findByPk(id, {
      include: [{ model: Carrera, as: "carrera", attributes: ["nombre"] }],
    });

    res.status(200).json({
      message: "Materia actualizada exitosamente",
      data: materiaActualizada,
    });
  } catch (error) {
    console.error("Error al actualizar la materia:", error);
    res.status(500).json({ error: "Hubo un error al actualizar la materia" });
  }
};

// >>>>>>>> INICIO DE LA NUEVA FUNCIÓN obtenerMateriasPorUsuario (SIMPLIFICADA) <<<<<<<<<<

const obtenerMateriasPorUsuario = async (req, res) => {
  const user = req.usuario; // Usuario obtenido del token por authMiddleware

  try {
    // 1. Verificar autenticación (esto lo hace el middleware, pero verificar `req.user` es seguro)
    if (!user) {
      // Esto indica un problema con el middleware o token
      console.warn(
        "Backend: obtenerMateriasPorUsuario (Simplificado): No autenticado (req.user is missing)."
      );
      return res.status(401).json({ message: "No autenticado." });
    }

    // 2. Obtener el carrera_id directamente del usuario en el token
    const userCareerId = user.carrera_id;

    // 3. Si el usuario NO tiene carrera_id asignado en su perfil, no puede ver materias
    // Esto es una validación mínima para evitar consultar con un carrera_id NULL
    if (userCareerId === null || userCareerId === undefined) {
      console.warn(
        `Backend: obtenerMateriasPorUsuario (Simplificado): Usuario ${user.id} sin carrera_id asignada.`
      );
      // Devolver 200 OK con data vacía para que el frontend pueda mostrar un mensaje.
      return res.status(200).json({
        message: "Su usuario no tiene una carrera asignada.",
        data: [],
      });
    }

    console.log(
      `Backend: obtenerMateriasPorUsuario (Simplificado): Obteniendo materias para carrera ID: ${userCareerId}.`
    );

    // 4. Realizar la consulta a la base de datos filtrando por el carrera_id del usuario
    const materias = await Materia.findAll({
      where: { carrera_id: userCareerId }, // Filtra por el ID de la carrera del usuario logeado
      include: [
        {
          model: Carrera,
          as: "carrera", // Alias para acceder al nombre de la carrera (DEBE COINCIDIR CON EL ALIAS EN EL MODELO Materia)
          attributes: ["nombre"], // Solo obtenemos el nombre de la carrera
        },
      ],
      // No se aplican validaciones de ROL aquí. Cualquier usuario con token y carrera_id
      // en el token obtendrá las materias de esa carrera_id.
    });

    // 5. Responder con la lista de materias encontradas
    // Si no se encontraron materias para esa carrera, devuelve 200 OK con un array vacío.
    res.status(200).json({
      message: "Materias obtenidas exitosamente para el usuario",
      data: materias, // Devuelve el array de materias filtrado por carrera
    });
  } catch (error) {
    console.error(
      "Backend: Error en obtenerMateriasPorUsuarioController (Simplificado):",
      error
    );
    res.status(500).json({
      error: "Hubo un error al obtener las materias del usuario",
      details: error.message,
    });
  }
};

// >>>>>>>> FIN DE LA NUEVA FUNCIÓN obtenerMateriasPorUsuario (SIMPLIFICADA) <<<<<<<<<<

const eliminarMateria = async (req, res) => {
  const { id } = req.params;

  try {
    const materia = await Materia.findByPk(id);

    if (!materia) {
      return res.status(404).json({ error: "Materia no encontrada" });
    }

    await materia.destroy();

    res.status(200).json({ message: "Materia eliminada exitosamente" });
  } catch (error) {
    console.error("Error al eliminar la materia:", error);
    res.status(500).json({ error: "Hubo un error al eliminar la materia" });
  }
};

module.exports = {
  crearMateria,
  obtenerMaterias,
  actualizarMateria,
  eliminarMateria,
  obtenerMateriasPorUsuario, // <-- Exporta la nueva función simplificada
};
