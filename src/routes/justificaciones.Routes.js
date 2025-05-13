// routes/justificaciones.js

const express = require('express');
const multer  = require('multer');
const path    = require('path');
const {
  crearJustificacion,
  obtenerTodasLasJustificaciones,
  obtenerJustificacionPorAsistencia
} = require('../controllers/justificacionesControllers');

const router = express.Router();

// ─── Configuración de Multer ────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads')); // carpeta de subida
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + file.originalname;
    cb(null, unique);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.pdf', '.jpg', '.jpeg', '.png'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Sólo se permiten PDF, JPG, JPEG y PNG'));
    }
  }
});
// ──────────────────────────────────────────────────────────────────────────────

// POST /api/justificaciones/
// Crear justificación (archivo opcional)
router.post('/', upload.single('archivo_prueba'), crearJustificacion);

// GET /api/justificaciones/ver-todas
// Listar todas las justificaciones con su URL de archivo
router.get('/', async (req, res, next) => {
  try {
    const { total, justificaciones } = await obtenerTodasLasJustificaciones(req, res);
    // Construir la URL pública para cada archivo
    const host = `${req.protocol}://${req.get('host')}`;
    const data = justificaciones.map(j => ({
      ...j,
      archivo_url: j.archivo_prueba
        ? `${host}/uploads/${j.archivo_prueba}`
        : null
    }));
    res.json({ total, justificaciones: data });
  } catch (err) {
    next(err);
  }
});

// GET /api/justificaciones/:asistencia_id
// Obtener la justificación de una asistencia específica, con URL de archivo
router.get('/:asistencia_id', async (req, res, next) => {
  try {
    const justi = await obtenerJustificacionPorAsistencia(req, res);
    if (res.headersSent) return; // ya hizo el res.json o 404
    const host = `${req.protocol}://${req.get('host')}`;
    justi.archivo_url = justi.archivo_prueba
      ? `${host}/uploads/${justi.archivo_prueba}`
      : null;
    res.json(justi);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
