const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuario.controller');
const authMiddleware = require('../middlewares/authMiddleware');

// Crear administrador (nivel 5, sin autenticación)
router.post('/crear-admin', usuarioController.crearAdministrador);

// Login
router.post('/login', usuarioController.login);

// Crear usuarios genéricos (nivel 5 o nivel 4, requiere token)
router.post('/crear', authMiddleware, usuarioController.registrarUsuario);

// Crear checador/jefe de grupo (nivel 5 o 4, requiere token)
router.post('/crear-checador-jefe', authMiddleware, usuarioController.registrarChecadorYJefe);

// Crear profesores (nivel 5 o 4, requiere token)
router.post('/crear-profesor', authMiddleware, usuarioController.registrarProfesor);

// Listar solo Profesores (rol_id = 1)
router.get('/listar-profesores', authMiddleware, usuarioController.listarProfesores);

// Actualizar usuario genérico (requiere token)
router.put('/actualizar/:id', authMiddleware, usuarioController.actualizarUsuario);

// **Actualizar profesor** (solo campos propios de profesor; nivel 5 o 4)  
router.put(
  '/actualizar-profesor/:id',
  authMiddleware,
  usuarioController.actualizarProfesor
);

// Eliminar usuario (requiere token)
router.delete('/eliminar/:id', authMiddleware, usuarioController.eliminarUsuario);

// Listar usuarios (nivel 5 ve a nivel 4, nivel 4 ve niveles 1–3)
router.get('/listar', authMiddleware, usuarioController.listarUsuarios);

// Obtener jefes de carrera (solo nivel 5)
router.get('/jefes', authMiddleware, usuarioController.obtenerJefesCarrera);

// Obtener usuario por ID
router.get('/:id', authMiddleware, usuarioController.obtenerUsuarioPorId);

module.exports = router;
