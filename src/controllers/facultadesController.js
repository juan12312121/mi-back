// src/controllers/facultadesController.js
const { QueryTypes } = require('sequelize');
const sequelize = require('../config/config');
const Facultad = require('../models/facultadModel');
const Escuela = require('../models/escuelasModel');

// Obtener todas las facultades, cargando nombre de escuela por lookup
const obtenerTodasFacultadesConEscuela = async (req, res) => {
  try {
    const { escuela_id, rol_id } = req.usuario;
    let query = `SELECT * FROM facultades`;
    let replacements = {};

    if (rol_id === 5) {
      query += ` WHERE escuela_id = :escuela_id`;
      replacements = { escuela_id };
    }

    const facultadesRaw = await sequelize.query(
      query,
      { 
        replacements,
        type: QueryTypes.SELECT 
      }
    );

    // 2) Para cada facultad, buscamos la escuela por su ID y añadimos el nombre
    const facultades = await Promise.all(
      facultadesRaw.map(async f => {
        const escuela = await Escuela.findByPk(f.escuela_id);
        return {
          ...f,
          escuela_nombre: escuela ? escuela.nombre : null
        };
      })
    );

    res.json(facultades);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener una sola facultad, cargando nombre de escuela por lookup
const obtenerFacultadConEscuela = async (req, res) => {
  try {
    const facultadId = req.params.id;

    // 1) Traemos la facultad
    const [facultad] = await sequelize.query(
      `SELECT * FROM facultades WHERE id = :facultadId`,
      {
        replacements: { facultadId },
        type: QueryTypes.SELECT
      }
    );

    if (!facultad) {
      return res.status(404).json({ error: 'Facultad no encontrada' });
    }

    // 2) Buscamos la escuela por su ID
    const escuela = await Escuela.findByPk(facultad.escuela_id);

    // 3) Respondemos incluyendo el nombre de la escuela
    res.json({
      ...facultad,
      escuela_nombre: escuela ? escuela.nombre : null
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Agregar una nueva facultad — inserta sólo escuela_id, no el nombre
const agregarFacultad = async (req, res) => {
  try {
    const { nombre, escuela_id: body_escuela_id, descripcion, email_contacto, telefono_contacto } = req.body;
    const { escuela_id: user_escuela_id, rol_id } = req.usuario;

    // Si es admin de escuela (nivel 5) o jefe de carrera (nivel 4), ignoramos lo que venga en el body y usamos su escuela
    const final_escuela_id = (rol_id === 5 || rol_id === 4) ? user_escuela_id : body_escuela_id;

    if (!final_escuela_id) {
       return res.status(400).json({ error: 'Falta escuela_id' });
    }

    // 1) Creamos la facultad
    const nuevaFacultad = await Facultad.create({
      nombre,
      escuela_id: final_escuela_id,
      descripcion,
      email_contacto,
      telefono_contacto
    });

    // 2) Hacemos lookup para devolver también el nombre de la escuela en la respuesta
    const escuela = await Escuela.findByPk(final_escuela_id);

    res.status(201).json({
      message: 'Facultad creada con éxito',
      facultad: {
        ...nuevaFacultad.toJSON(),
        escuela_nombre: escuela ? escuela.nombre : null
      }
    });
  } catch (error) {
    console.error('[Error en agregarFacultad]:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const actualizarFacultad = async (req, res) => {
  try {
    const facultadId = req.params.id;
    const { nombre, escuela_id, descripcion, email_contacto, telefono_contacto } = req.body;

    // 1) Buscar la facultad por PK
    const facultad = await Facultad.findByPk(facultadId);
    if (!facultad) {
      return res.status(404).json({ error: 'Facultad no encontrada' });
    }

    // 2) Actualizar los campos
    facultad.nombre            = nombre            ?? facultad.nombre;
    facultad.escuela_id        = escuela_id        ?? facultad.escuela_id;
    facultad.descripcion       = descripcion       ?? facultad.descripcion;
    facultad.email_contacto    = email_contacto    ?? facultad.email_contacto;
    facultad.telefono_contacto = telefono_contacto ?? facultad.telefono_contacto;

    // 3) Guardar cambios
    await facultad.save();

    // 4) Lookup para nombre de escuela
    const escuela = await Escuela.findByPk(facultad.escuela_id);

    // 5) Responder con el objeto actualizado + escuela_nombre
    res.json({
      message: 'Facultad actualizada con éxito',
      facultad: {
        ...facultad.toJSON(),
        escuela_nombre: escuela ? escuela.nombre : null
      }
    });
  } catch (error) {
    console.error('[actualizarFacultad] ', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Eliminar una facultad
const eliminarFacultad = async (req, res) => {
  try {
    const facultadId = req.params.id;

    // 1) Buscar la facultad por su ID
    const facultad = await Facultad.findByPk(facultadId);
    if (!facultad) {
      return res.status(404).json({ error: 'Facultad no encontrada' });
    }

    // 2) Eliminar la facultad
    await facultad.destroy();

    // 3) Responder con éxito
    res.json({ message: 'Facultad eliminada correctamente' });
  } catch (error) {
    console.error('[eliminarFacultad] ', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


module.exports = {
  obtenerTodasFacultadesConEscuela,
  obtenerFacultadConEscuela,
  agregarFacultad,
  actualizarFacultad,
  eliminarFacultad
};
