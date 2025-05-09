const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

const sequelize = require('../config/config');
const Usuario = require('../models/usuarioModel');
const Carrera = require('../models/carrerasModel');
const Facultad = require('../models/facultadModel');
const Escuela = require('../models/escuelasModel');


// ==============================
// Helpers
// ==============================

const generarToken = (usuario) => {
  return jwt.sign(
    { id: usuario.id, rol_id: usuario.rol_id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const validarPermisos = (solicitante, objetivo, accion) => {
  const { rol_id } = solicitante;

  if (accion === 'crear') {
    if (rol_id === 5) return true;
    if (rol_id === 4 && objetivo !== 5) return true;
    return false;
  }

  if (accion === 'editar' || accion === 'eliminar') {
    if (rol_id === 5 && objetivo === 4) return true;
    if (rol_id === 4 && objetivo >= 1 && objetivo <= 3) return true;
    return false;
  }

  if (accion === 'listar') {
    return rol_id === 5 || rol_id === 4;
  }

  return false;
};

// ==============================
// Controladores
// ==============================

const registrarUsuario = async (req, res) => {
  const { nombre, correo, contrasena, rol_id, carrera_id, grupo_id } = req.body;
  const creador = req.usuario;

  if (!validarPermisos(creador, rol_id, 'crear')) {
    return res.status(403).json({ message: 'No tienes permisos para crear este usuario' });
  }

  if (!nombre || !correo || !contrasena || !rol_id || !carrera_id) {
    return res.status(400).json({ message: 'Faltan campos obligatorios' });
  }

  try {
    const usuarioExistente = await Usuario.findOne({ where: { correo } });
    if (usuarioExistente) {
      return res.status(400).json({ message: 'El correo ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(contrasena, 10);

    const nuevoUsuario = await Usuario.create({
      nombre,
      correo,
      contrasena: hashedPassword,
      rol_id,
      carrera_id,
      grupo_id: grupo_id || null, // Se guarda grupo_id si viene, sino null
    });

    const token = generarToken(nuevoUsuario);

    res.status(201).json({ usuario: nuevoUsuario, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear usuario', error: error.message });
  }
};


const registrarChecadorYJefe = async (req, res) => {
  const { nombre, correo, contrasena, rol_id, carrera_id, grupo_id } = req.body;
  const creador = req.usuario;

  // Validar permisos para crear el usuario
  if (!validarPermisos(creador, rol_id, 'crear')) {
    return res.status(403).json({ message: 'No tienes permisos para crear este usuario' });
  }

  // Validar que todos los campos necesarios estén presentes
  if (!nombre || !correo || !contrasena || !rol_id || !carrera_id || (rol_id === 3 && !grupo_id)) {
    return res.status(400).json({ message: 'Faltan campos obligatorios' });
  }

  try {
    // Verificar si el correo ya está registrado
    const usuarioExistente = await Usuario.findOne({ where: { correo } });
    if (usuarioExistente) {
      return res.status(400).json({ message: 'El correo ya está registrado' });
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    // Crear el nuevo usuario
    const nuevoUsuario = await Usuario.create({
      nombre,
      correo,
      contrasena: hashedPassword,
      rol_id,
      carrera_id,
      grupo_id: grupo_id || null, // El grupo_id solo es necesario si es Jefe de Grupo
    });

    // Generar el token JWT
    const token = generarToken(nuevoUsuario);

    // Responder con los datos del nuevo usuario y el token
    res.status(201).json({ usuario: nuevoUsuario, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear el usuario', error: error.message });
  }
};
const login = async (req, res) => {
  const { correo, contrasena } = req.body;

  try {
    const usuario = await Usuario.findOne({ where: { correo } });

    if (!usuario) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const hashedPassword = usuario.contrasena;

    const esValida =
      // Intenta comparar con bcrypt
      (await bcrypt.compare(contrasena, hashedPassword)) ||
      // Si falla (por ejemplo no es hash), intenta comparación directa
      contrasena === hashedPassword;

    if (!esValida) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const token = generarToken(usuario);
    const { contrasena: _, ...usuarioSinPass } = usuario.toJSON();
    res.status(200).json({ usuario: usuarioSinPass, token });

  } catch (error) {
    res.status(500).json({ message: 'Error en login', error: error.message });
  }
};



const crearAdministrador = async (req, res) => {
  const { nombre, correo, contrasena } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(contrasena, 10);
    const nuevoAdmin = await Usuario.create({
      nombre,
      correo,
      contrasena: hashedPassword,
      rol_id: 5,
      carrera_id: null,
    });

    const token = generarToken(nuevoAdmin);
    res.status(201).json({ usuario: nuevoAdmin, token });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear administrador', error: error.message });
  }
};

const actualizarUsuario = async (req, res) => {
  const editor = req.usuario;
  const { id } = req.params;
  const { nombre, correo, contrasena, rol_id, carrera_id, grupo_id } = req.body;

  try {
    const target = await Usuario.findByPk(id);
    if (!target) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (!validarPermisos(editor, target.rol_id, 'editar')) {
      return res.status(403).json({ message: 'No tienes permisos para editar este usuario' });
    }

    // Actualizar campos con los valores proporcionados (solo si existen)
    if (nombre) target.nombre = nombre;
    if (correo) target.correo = correo;
    if (rol_id !== undefined) target.rol_id = rol_id;
    if (carrera_id !== undefined) target.carrera_id = carrera_id;
    if (grupo_id !== undefined) target.grupo_id = grupo_id;

    // Solo hashear la contraseña si fue proporcionada
    if (contrasena) {
      target.contrasena = await bcrypt.hash(contrasena, 10);
    }

    await target.save();

    res.json({ usuario: target });
  } catch (error) {
    console.error('❌ Error al actualizar usuario:', error);
    res.status(500).json({ message: 'Error al actualizar usuario', error: error.message });
  }
};


const eliminarUsuario = async (req, res) => {
  const editor = req.usuario;
  const { id } = req.params;

  try {
    const target = await Usuario.findByPk(id);
    if (!target) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (!validarPermisos(editor, target.rol_id, 'eliminar')) {
      return res.status(403).json({ message: 'No tienes permisos para eliminar este usuario' });
    }

    await target.destroy();
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar usuario', error: error.message });
  }
};

const listarUsuarios = async (req, res) => {
  const viewer = req.usuario;

  console.log('Iniciando la función listarUsuarios');

  if (!validarPermisos(viewer, null, 'listar')) {
    console.log('Usuario no tiene permisos para listar');
    return res.status(403).json({ message: 'No tienes permisos para listar usuarios' });
  }

  try {
    // Consulta SQL con JOIN para obtener rol_id
    const query = `
      SELECT
        u.id,
        u.nombre,
        u.correo,
        g.nombre AS grupo,
        c.nombre AS carrera,
        u.rol_id  -- Agregamos el rol_id
      FROM
        usuarios u
      LEFT JOIN
        grupos g ON u.grupo_id = g.id
      LEFT JOIN
        carreras c ON u.carrera_id = c.id
      WHERE
        u.rol_id IN (2, 3); -- Solo usuarios con rol_id 2 y 3
    `;

    // Ejecutar la consulta SQL
    const [usuarios] = await sequelize.query(query);

    console.log('Usuarios obtenidos:', usuarios);
    res.json({ usuarios });
  } catch (error) {
    console.log('Error al listar usuarios:', error.message);
    res.status(500).json({ message: 'Error al listar usuarios', error: error.message });
  }
};




const obtenerJefesCarrera = async (req, res) => {
  try {
    // Verificar si el rol del usuario es 5
    if (req.usuario.rol_id !== 5) {  // Verifica si el rol es igual a 5
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    // Construir la consulta SQL para obtener los jefes de carrera con sus respectivas facultades y escuelas
    const query = `
      SELECT
        u.id AS usuario_id,
        u.nombre AS usuario_nombre,
        u.correo AS usuario_correo,
        c.id AS carrera_id,
        c.nombre AS carrera_nombre,
        f.id AS facultad_id,
        f.nombre AS facultad_nombre,
        e.id AS escuela_id,
        e.nombre AS escuela_nombre
      FROM
        usuarios u
      LEFT JOIN
        carreras c ON u.carrera_id = c.id
      LEFT JOIN
        facultades f ON c.facultad_id = f.id
      LEFT JOIN
        escuelas e ON f.escuela_id = e.id
      WHERE
        u.rol_id = 4
      ORDER BY
        u.nombre ASC;
    `;

    // Ejecutar la consulta SQL
    const [jefes] = await sequelize.query(query);

    // Si no se encuentran jefes de carrera
    if (jefes.length === 0) {
      return res.status(404).json({ message: 'No se encontraron jefes de carrera' });
    }

    // Responder con los datos de los jefes, dentro de la propiedad "jefes"
    res.status(200).json({ jefes });
  } catch (error) {
    console.error('Error al obtener jefes de carrera:', error);
    res.status(500).json({ message: 'Error al obtener jefes de carrera', error: error.message });
  }
};

const obtenerUsuarioPorId = async (req, res) => {
  const { id } = req.params;

  try {
    // Buscar al usuario por su ID
    const usuario = await Usuario.findByPk(id);

    // Si el usuario no existe, responder con un error 404
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Responder con los datos del usuario encontrado
    res.json({ usuario });
  } catch (error) {
    console.error('Error al obtener usuario por ID:', error);
    res.status(500).json({ message: 'Error al obtener usuario', error: error.message });
  }
};


const registrarProfesor = async (req, res) => {
  const { nombre, correo, contrasena } = req.body;
  const creador = req.usuario;
  const objetivoRol = 1; // rol_id para Profesores

  // 1) Validar permisos (solo admin rol 5 o jefe de carrera rol 4 pueden crear)
  if (!validarPermisos(creador, objetivoRol, 'crear')) {
    return res.status(403).json({ message: 'No tienes permisos para crear profesores' });
  }

  // 2) Validar campos obligatorios
  if (!nombre || !correo || !contrasena) {
    return res.status(400).json({ message: 'Faltan campos obligatorios: nombre, correo o contraseña' });
  }

  try {
    // 3) Verificar que el correo no exista
    const existente = await Usuario.findOne({ where: { correo } });
    if (existente) {
      return res.status(400).json({ message: 'El correo ya está registrado' });
    }

    // 4) Hashear la contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    // 5) Crear el usuario con rol_id = 1 y sin carrera ni grupo
    const nuevoProfesor = await Usuario.create({
      nombre,
      correo,
      contrasena: hashedPassword,
      rol_id: objetivoRol,
      carrera_id: null,
      grupo_id: null
    });

    // 6) Generar token JWT
    const token = generarToken(nuevoProfesor);

    // 7) Responder con el usuario y el token
    res.status(201).json({ usuario: nuevoProfesor, token });
  } catch (error) {
    console.error('❌ Error al crear profesor:', error);
    res.status(500).json({ message: 'Error al crear profesor', error: error.message });
  }
};


const listarProfesores = async (req, res) => {
  const viewer = req.usuario;

  // Solo administradores (5) y jefes de carrera (4) pueden listar
  if (!validarPermisos(viewer, null, 'listar')) {
    return res.status(403).json({ message: 'No tienes permisos para listar profesores' });
  }

  try {
    // Consulta SQL con JOIN a roles para obtener además rol_nombre
    const query = `
      SELECT
        u.id,
        u.nombre,
        u.correo,
        u.rol_id,
        r.nombre AS rol_nombre
      FROM
        usuarios u
      INNER JOIN
        roles r ON u.rol_id = r.id
      WHERE
        u.rol_id = 1
      ORDER BY
        u.nombre ASC;
    `;
    const [profesores] = await sequelize.query(query);

    res.json({ profesores });
  } catch (error) {
    console.error('❌ Error al listar profesores:', error);
    res.status(500).json({ message: 'Error al listar profesores', error: error.message });
  }
};

const actualizarProfesor = async (req, res) => {
  const editor = req.usuario;
  const { id } = req.params;
  const { nombre, correo, contrasena } = req.body;
  const OBJETIVO_ROL = 1; // rol_id para Profesores

  // 1) Validar permisos (solo admin rol 5 o jefe de carrera rol 4 pueden editar profesores)
  if (!validarPermisos(editor, OBJETIVO_ROL, 'editar')) {
    return res.status(403).json({ message: 'No tienes permisos para editar profesores' });
  }

  try {
    // 2) Buscar al profesor existente
    const profesor = await Usuario.findByPk(id);
    if (!profesor) {
      return res.status(404).json({ message: 'Profesor no encontrado' });
    }

    // 3) Comprobar que en efecto sea un profesor
    if (profesor.rol_id !== OBJETIVO_ROL) {
      return res.status(400).json({ message: 'El usuario no es un profesor' });
    }

    // 4) Verificar y actualizar nombre
    if (nombre) {
      profesor.nombre = nombre;
    }

    // 5) Verificar y actualizar correo (evitando duplicados)
    if (correo && correo !== profesor.correo) {
      const existente = await Usuario.findOne({ where: { correo } });
      if (existente) {
        return res.status(400).json({ message: 'El correo ya está registrado' });
      }
      profesor.correo = correo;
    }

    // 6) Solo hashear y actualizar contraseña si viene en el body
    if (contrasena) {
      profesor.contrasena = await bcrypt.hash(contrasena, 10);
    }

    // 7) Guardar cambios
    await profesor.save();

    // 8) Responder con el profesor actualizado
    return res.json({ profesor });
  } catch (error) {
    console.error('❌ Error al actualizar profesor:', error);
    return res
      .status(500)
      .json({ message: 'Error al actualizar profesor', error: error.message });
  }
};



// ==============================
// Exports
// ==============================

module.exports = {
  registrarUsuario,
  login,
  crearAdministrador,
  actualizarUsuario,
  eliminarUsuario,
  listarUsuarios,
  obtenerJefesCarrera,
  obtenerUsuarioPorId,
  registrarChecadorYJefe ,
  registrarProfesor,
  listarProfesores,
  actualizarProfesor
};
