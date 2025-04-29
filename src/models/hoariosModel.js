// models/horario.model.js
const pool = require('../config/config'); // Configuración de conexión mysql2/promise

// Helper para extraer valores de ENUM desde information_schema
async function _getEnumValues(table, column) {
  const sql = `
    SELECT COLUMN_TYPE
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = ?
      AND COLUMN_NAME = ?
  `;
  const [rows] = await pool.query(sql, [table, column]);
  if (!rows.length) return [];
  const columnType = rows[0].COLUMN_TYPE; // ej: "enum('A','B','C')"
  return columnType
    .slice(columnType.indexOf('(') + 1, columnType.lastIndexOf(')'))
    .split(',')
    .map(val => val.replace(/'/g, ''));
}

module.exports = {
  /**
   * Recupera todos los horarios con datos de grupo y aula
   * @returns {Promise<Array>} Array de objetos horario
   */
  async getAll() {
    const sql = `
      SELECT h.*, g.grupo_nombre AS grupo, a.nombre AS aula
      FROM horarios h
      LEFT JOIN grupos g ON h.grupo_id = g.id
      LEFT JOIN aulas a ON h.aula_id = a.id
    `;
    const [rows] = await pool.query(sql);
    return rows;
  },

  /**
   * Crea un nuevo horario
   * @param {Object} data - Datos del horario
   * @returns {Promise<import('mysql2').OkPacket>} Resultado de la inserción
   */
  async create(data) {
    const sql = `
      INSERT INTO horarios
        (asignacion_id, dia_semana, hora_inicio, hora_fin, grupo_id, aula_id, turno, tipo_duracion, duracion_clase, tiempo_descanso)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      data.asignacion_id,
      data.dia_semana,
      data.hora_inicio,
      data.hora_fin,
      data.grupo_id || null,
      data.aula_id  || null,
      data.turno,
      data.tipo_duracion,
      data.duracion_clase || null,
      data.tiempo_descanso || null
    ];
    const [result] = await pool.query(sql, params);
    return result;
  },

  /**
   * Obtiene los valores del ENUM 'turno'
   * @returns {Promise<string[]>}
   */
  async getTurnosEnum() {
    return _getEnumValues('horarios', 'turno');
  },

  /**
   * Obtiene los valores del ENUM 'tipo_duracion'
   * @returns {Promise<string[]>}
   */
  async getTipoDuracionEnum() {
    return _getEnumValues('horarios', 'tipo_duracion');
  }
};
