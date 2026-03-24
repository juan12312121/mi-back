const bcrypt = require('bcrypt');
const sequelize = require('./src/config/config');
const Usuario = require('./src/models/usuarioModel');
const Rol = require('./src/models/rolesModel');
const Escuela = require('./src/models/escuelasModel');
const Facultad = require('./src/models/facultadModel');
const Carrera = require('./src/models/carrerasModel');
const Grupo = require('./src/models/gruposModel');
const Aula = require('./src/models/aulasModel');

async function run() {
  try {
    console.log('Sincronizando modelos con la base de datos (alter: true)...');
    await sequelize.sync({ alter: true });
    console.log('✅ Base de datos sincronizada.');

    // 1. Asegurar que el Rol 6 existe
    let superAdminRole = await Rol.findByPk(6);
    if (!superAdminRole) {
        console.log('El rol 6 no existe. Creándolo...');
        await Rol.create({ id: 6, nombre: 'Súper Administrador' });
        console.log('✅ Rol 6 (Súper Administrador) creado.');
    } else {
        console.log('ℹ️ Rol 6 ya existe.');
    }

    // 2. Crear el usuario
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const [user, created] = await Usuario.findOrCreate({
      where: { correo: 'superadmin@gestion.edu' },
      defaults: {
        nombre: 'Super Administrador',
        contrasena: hashedPassword,
        rol_id: 6,
        escuela_id: null
      }
    });

    if (created) {
      console.log('✅ SuperAdmin creado con éxito: superadmin@gestion.edu / admin123');
    } else {
      console.log('ℹ️ El SuperAdmin ya existe.');
    }
  } catch (error) {
    console.error('❌ Error fatal:', error);
  } finally {
    process.exit();
  }
}

run();
