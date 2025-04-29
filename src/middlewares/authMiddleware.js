const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuarioModel'); // Asegúrate de que el modelo Usuario esté bien importado

const verificarToken = async (req, res, next) => {
  // 1. Verifica si el encabezado 'Authorization' existe
  const authHeader = req.headers.authorization;

  // Si no existe o no tiene el prefijo 'Bearer', retorna error
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  // 2. Extrae el token de la cabecera 'Authorization'
  const token = authHeader.split(' ')[1];

  try {
    // 3. Verifica el token con la clave secreta
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Asegúrate de que JWT_SECRET esté en tu archivo .env

    // 4. Busca al usuario en la base de datos utilizando el ID decodificado
    const usuario = await Usuario.findByPk(decoded.id); // Asumiendo que 'id' es el campo en el modelo Usuario
    if (!usuario) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    // 5. Verifica si el usuario tiene el id 4 (jefe de carrera) o si su rol es 5 (otro rol permitido)
    if (usuario.rol_id !== 4 && usuario.rol_id !== 5) { // Permite el acceso si el rol es 4 (jefe de carrera) o rol 5
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    // 6. Adjunta el usuario al objeto `req` para que esté disponible en las rutas protegidas
    req.usuario = usuario;

    // 7. Llama al siguiente middleware o controlador
    next();

  } catch (error) {
    // Si el token es inválido o ha expirado
    console.error('Error en la verificación del token:', error); // Imprime el error para depuración
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

module.exports = verificarToken;
