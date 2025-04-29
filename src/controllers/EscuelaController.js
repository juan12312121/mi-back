const Escuela = require('../models/escuelasModel');  // Sin desestructuración

// Verificar si el usuario tiene el nivel adecuado para insertar escuela
const verificarNivelUsuario = (req) => {
  const usuario = req.usuario; // Asegúrate de que 'usuario' esté en el objeto 'req'

  if (usuario && usuario.rol_id === 5) {
    return true;
  }

  return false;
};

// Función para insertar una nueva escuela
const insertarEscuela = async (req, res) => {
  console.log('Verificando nivel de usuario...');
  
  if (!verificarNivelUsuario(req)) {
    console.error('Acceso denegado: Usuario no tiene el nivel adecuado.');
    return res.status(403).json({
      message: 'Acceso denegado: solo usuarios con nivel 5 pueden insertar escuelas.'
    });
  }

  const { folio, nombre } = req.body;

  if (!folio || !nombre) {
    console.error('Faltan datos obligatorios: folio y nombre.');
    return res.status(400).json({ message: 'Folio y nombre son obligatorios.' });
  }

  try {
    console.log('Intentando insertar la escuela...');
    const nuevaEscuela = await Escuela.create({
      folio,
      nombre,
    });
    
    console.log('Escuela insertada correctamente:', nuevaEscuela);
    return res.status(201).json({ message: 'Escuela insertada correctamente.', escuela: nuevaEscuela });
  } catch (error) {
    console.error('Error al insertar la escuela:', error);
    return res.status(500).json({ message: 'Error al insertar la escuela.', error: error.message });
  }
};

const verEscuelas = async (req, res) => {
    console.log('Verificando nivel de usuario para ver escuelas...');

    if (!verificarNivelUsuario(req)) {
        console.error('Acceso denegado: Usuario no tiene el nivel adecuado.');
        return res.status(403).json({
            message: 'Acceso denegado: solo usuarios con nivel 5 pueden ver las escuelas.'
        });
    }

    try {
        console.log('Consultando todas las escuelas...');
        const escuelas = await Escuela.findAll();  // Obtiene todas las escuelas de la base de datos

        if (escuelas.length === 0) {
            return res.status(404).json({ message: 'No se encontraron escuelas.' });
        }

        console.log('Escuelas encontradas:', escuelas);
        return res.status(200).json({ escuelas });
    } catch (error) {
        console.error('Error al obtener las escuelas:', error);
        return res.status(500).json({ message: 'Error al obtener las escuelas.', error: error.message });
    }
};

const actualizarEscuela = async (req, res) => {
    console.log('Verificando nivel de usuario para actualizar escuela...');
  
    if (!verificarNivelUsuario(req)) {
      console.error('Acceso denegado: Usuario no tiene el nivel adecuado.');
      return res.status(403).json({
        message: 'Acceso denegado: solo usuarios con nivel 5 pueden actualizar escuelas.'
      });
    }
  
    const { id } = req.params; // ID de la escuela a actualizar
    const { folio, nombre } = req.body;
  
    if (!folio || !nombre) {
      console.error('Faltan datos obligatorios: folio y nombre.');
      return res.status(400).json({ message: 'Folio y nombre son obligatorios.' });
    }
  
    try {
      console.log(`Buscando escuela con ID ${id} para actualizar...`);
      const escuela = await Escuela.findByPk(id);
  
      if (!escuela) {
        console.warn('Escuela no encontrada.');
        return res.status(404).json({ message: 'Escuela no encontrada.' });
      }
  
      escuela.folio = folio;
      escuela.nombre = nombre;
  
      await escuela.save();
  
      console.log('Escuela actualizada correctamente:', escuela);
      return res.status(200).json({ message: 'Escuela actualizada correctamente.', escuela });
    } catch (error) {
      console.error('Error al actualizar la escuela:', error);
      return res.status(500).json({ message: 'Error al actualizar la escuela.', error: error.message });
    }
  };

  const eliminarEscuela = async (req, res) => {
    console.log('Verificando nivel de usuario para eliminar escuela...');
  
    // Verificamos que el usuario tenga el nivel adecuado para eliminar
    if (!verificarNivelUsuario(req)) {
      console.error('Acceso denegado: Usuario no tiene el nivel adecuado.');
      return res.status(403).json({
        message: 'Acceso denegado: solo usuarios con nivel 5 pueden eliminar escuelas.'
      });
    }
  
    const { id } = req.params; // ID de la escuela a eliminar
  
    try {
      console.log(`Buscando escuela con ID ${id} para eliminar...`);
      const escuela = await Escuela.findByPk(id); // Buscar la escuela por ID
  
      if (!escuela) {
        console.warn('Escuela no encontrada.');
        return res.status(404).json({ message: 'Escuela no encontrada.' });
      }
  
      // Eliminamos la escuela de la base de datos
      await escuela.destroy();
  
      console.log('Escuela eliminada correctamente:', escuela);
      return res.status(200).json({ message: 'Escuela eliminada correctamente.' });
    } catch (error) {
      console.error('Error al eliminar la escuela:', error);
      return res.status(500).json({ message: 'Error al eliminar la escuela.', error: error.message });
    }
  };
  

  module.exports = {
    insertarEscuela,
    verEscuelas,
    actualizarEscuela,
    eliminarEscuela
  };
  
