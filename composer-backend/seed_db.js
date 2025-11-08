require('dotenv').config({ path: '/home/jucfra/Proyectos/TimeLineComposer/composer-backend/.env' });
const { PrismaClient } = require('@prisma/client');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Helper function to split name into first and last name
function splitName(fullName) {
  const parts = fullName.trim().split(' ');
  if (parts.length === 1) {
    return { first_name: parts[0], last_name: '' };
  }
  const last_name = parts.pop();
  const first_name = parts.join(' ');
  return { first_name, last_name };
}

// Helper function to determine period based on birth/death year
function getPeriod(birthYear, deathYear) {
  if (!birthYear && !deathYear) return 'INDETERMINADO';

  const avgYear = birthYear || deathYear;

  if (avgYear <= 1811) return 'COLONIAL';
  if (avgYear <= 1870) return 'INDEPENDENCIA';
  if (avgYear <= 1920) return 'POSGUERRA';
  if (avgYear <= 1950) return 'MODERNO';
  return 'CONTEMPORANEO';
}

// Helper function to determine main roles based on Tipo string
function getMainRoles(tipo) {
  const roles = [];
  if (tipo.includes('Compositor')) roles.push('COMPOSER');
  if (tipo.includes('Músico') || tipo.includes('Guitarrista') || tipo.includes('Arpista') || tipo.includes('Bandoneonista') || tipo.includes('Solista') || tipo.includes('Cantante') || tipo.includes('Trompetista') || tipo.includes('Clarinetista')) roles.push('PERFORMER');
  if (tipo.includes('Director') || tipo.includes('Maestro') || tipo.includes('Jefe de Música')) roles.push('CONDUCTOR');
  if (tipo.includes('Poeta')) roles.push('POET');
  if (tipo.includes('Agrupación') || tipo.includes('Orquesta')) roles.push('ENSEMBLE_ORCHESTRA');
  // Ensure unique roles
  return [...new Set(roles)];
}


async function main() {
  const prisma = new PrismaClient();
  console.log('Iniciando el proceso de seeding...');

  // Limpiar la base de datos en el orden correcto para evitar errores de constraints
  console.log('Eliminando ratings existentes...');
  await prisma.rating.deleteMany({}).catch(e => console.log("No ratings to delete or error:", e.message));
  console.log('Eliminando comentarios existentes...');
  await prisma.comment.deleteMany({}).catch(e => console.log("No comments to delete or error:", e.message));
  console.log('Eliminando compositores existentes...');
  await prisma.composer.deleteMany({}).catch(e => console.log("No composers to delete or error:", e.message));

  // Eliminar alumnos, docentes y usuarios para un "clean slate"
  console.log('Eliminando calificaciones de evaluación existentes...');
  await prisma.calificacionEvaluacion.deleteMany({}).catch(e => console.log("No calificaciones de evaluación to delete or error:", e.message));
  console.log('Eliminando asignaciones de evaluación existentes...');
  await prisma.evaluacionAsignacion.deleteMany({}).catch(e => console.log("No asignaciones de evaluación to delete or error:", e.message));
  console.log('Eliminando respuestas de alumno existentes...');
  await prisma.respuestaAlumno.deleteMany({}).catch(e => console.log("No respuestas de alumno to delete or error:", e.message));
  console.log('Eliminando tareas asignadas existentes...');
  await prisma.tareaAsignacion.deleteMany({}).catch(e => console.log("No tareas asignadas to delete or error:", e.message));
  console.log('Eliminando publicaciones existentes...');
  await prisma.publicacion.deleteMany({}).catch(e => console.log("No publicaciones to delete or error:", e.message));
  console.log('Eliminando evaluaciones existentes...');
  await prisma.evaluacion.deleteMany({}).catch(e => console.log("No evaluaciones to delete or error:", e.message));
  console.log('Eliminando tareas maestras existentes...');
  await prisma.tareaMaestra.deleteMany({}).catch(e => console.log("No tareas maestras to delete or error:", e.message));
  console.log('Eliminando asistencias existentes...');
  await prisma.asistencia.deleteMany({}).catch(e => console.log("No asistencias to delete or error:", e.message));
  console.log('Eliminando puntuaciones existentes...');
  await prisma.puntuacion.deleteMany({}).catch(e => console.log("No puntuaciones to delete or error:", e.message));
  console.log('Eliminando pagos existentes...');
  await prisma.pago.deleteMany({}).catch(e => console.log("No pagos to delete or error:", e.message));
  console.log('Eliminando relaciones catedra-alumno existentes...');
  await prisma.catedraAlumno.deleteMany({}).catch(e => console.log("No relaciones catedra-alumno to delete or error:", e.message));
  console.log('Eliminando costos de cátedra existentes...');
  await prisma.costoCatedra.deleteMany({}).catch(e => console.log("No costos de cátedra to delete or error:", e.message));
  console.log('Eliminando días y horarios de cátedra existentes...');
  await prisma.catedraDiaHorario.deleteMany({}).catch(e => console.log("No días y horarios de cátedra to delete or error:", e.message));
  console.log('Eliminando unidades de plan de clases existentes...');
  await prisma.unidadPlan.deleteMany({}).catch(e => console.log("No unidades de plan de clases to delete or error:", e.message));
  console.log('Eliminando planes de clases existentes...');
  await prisma.planDeClases.deleteMany({}).catch(e => console.log("No planes de clases to delete or error:", e.message));
  console.log('Eliminando cátedras existentes...');
  await prisma.catedra.deleteMany({}).catch(e => console.log("No cátedras to delete or error:", e.message));
  console.log('Eliminando docentes existentes...');
  await prisma.docente.deleteMany({}).catch(e => console.log("No docentes to delete or error:", e.message));
  console.log('Eliminando alumnos existentes...');
  await prisma.alumno.deleteMany({}).catch(e => console.log("No alumnos to delete or error:", e.message));
  console.log('Eliminando usuarios existentes...');
  await prisma.user.deleteMany({}).catch(e => console.log("No users to delete or error:", e.message));
  console.log('Eliminando Otp existentes...');
  await prisma.otp.deleteMany({}).catch(e => console.log("No Otp to delete or error:", e.message));

  console.log('Importando alumno_backup.sql...');
  try {
    const dbUrl = process.env.DATABASE_URL;
    const dbConfig = new URL(dbUrl);
    const dbUser = dbConfig.username;
    const dbPassword = dbConfig.password;
    const dbHost = dbConfig.hostname;
    const dbPort = dbConfig.port;
    const dbName = dbConfig.pathname.substring(1);

    const psqlCommand = `PGPASSWORD="${dbPassword}" psql -U ${dbUser} -d ${dbName} -h ${dbHost} -p ${dbPort} -f /home/jucfra/Proyectos/TimeLineComposer/composer-backend/prisma/alumno_backup.sql`;
    console.log(`Executing: ${psqlCommand.replace(dbPassword, '********')}`); // Log command without password
    const { stdout, stderr } = await execPromise(psqlCommand, { env: process.env });
    if (stdout) console.log(`stdout: ${stdout}`);
    if (stderr) console.error(`stderr: ${stderr}`);
    console.log('alumno_backup.sql importado con éxito.');
  } catch (error) {
    console.error('Error al importar alumno_backup.sql:', error);
    process.exit(1);
  }

  console.log('Base de datos limpiada.');

  // Crear o encontrar al docente 'Julio Franco'
  let julioFrancoDocente = await prisma.docente.findUnique({
    where: { email: 'jucfra23@gmail.com' },
  });

  if (!julioFrancoDocente) {
    julioFrancoDocente = await prisma.docente.create({
      data: {
        nombre: 'Julio',
        apellido: 'Franco',
        email: 'jucfra23@gmail.com',
        created_at: new Date(),
        updated_at: new Date(),
        direccion: 'Laurelty 4565, Luque - Paraguay',
        telefono: '0981574711',
      },
    });
    console.log('Docente Julio Franco creado.');
  } else {
    console.log('Docente Julio Franco ya existe.');
  }

  // Crear la Cátedra 'Introducción a la Filosofía'
  let filosofiaCatedra = await prisma.catedra.findFirst({
    where: { nombre: 'Introducción a la Filosofía' },
  });

  if (!filosofiaCatedra) {
    filosofiaCatedra = await prisma.catedra.create({
      data: {
        nombre: 'Introducción a la Filosofía',
        anio: 2025,
        institucion: 'Conservatorio Nacional de Música',
        turno: 'Tarde',
        aula: 'Aula 201',
        dias: 'Jueves',
        docenteId: julioFrancoDocente.id,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
    console.log('Cátedra Introducción a la Filosofía creada.');
  } else {
    console.log('Cátedra Introducción a la Filosofía ya existe.');
  }

  // Asociar días y horarios para Introducción a la Filosofía
  let catedraDiaHorarioFilosofia = await prisma.catedraDiaHorario.findFirst({
    where: {
      catedraId: filosofiaCatedra.id,
      dia_semana: 'Jueves',
    },
  });

  if (catedraDiaHorarioFilosofia) {
    await prisma.catedraDiaHorario.update({
      where: { id: catedraDiaHorarioFilosofia.id },
      data: { hora_inicio: '16:00', hora_fin: '17:00', updated_at: new Date() },
    });
    console.log('Horario para Introducción a la Filosofía actualizado.');
  } else {
    await prisma.catedraDiaHorario.create({
      data: {
        catedraId: filosofiaCatedra.id,
        dia_semana: 'Jueves',
        hora_inicio: '16:00',
        hora_fin: '17:00',
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
    console.log('Horario para Introducción a la Filosofía creado.');
  }

  // Crear la Cátedra 'Historia de la Música del Paraguay'
  let historiaMusicaCatedra = await prisma.catedra.findFirst({
    where: { nombre: 'Historia de la Música del Paraguay' },
  });

  if (!historiaMusicaCatedra) {
    historiaMusicaCatedra = await prisma.catedra.create({
      data: {
        nombre: 'Historia de la Música del Paraguay',
        anio: 2025,
        institucion: 'Conservatorio Nacional de Música',
        turno: 'Mañana',
        aula: 'Aula 101',
        dias: 'Jueves',
        docenteId: julioFrancoDocente.id,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
    console.log('Cátedra Historia de la Música del Paraguay creada.');
  } else {
    console.log('Cátedra Historia de la Música del Paraguay ya existe.');
  }

  // Asociar días y horarios para Historia de la Música del Paraguay
  let catedraDiaHorarioHistoria = await prisma.catedraDiaHorario.findFirst({
    where: {
      catedraId: historiaMusicaCatedra.id,
      dia_semana: 'Jueves',
    },
  });

  if (catedraDiaHorarioHistoria) {
    await prisma.catedraDiaHorario.update({
      where: { id: catedraDiaHorarioHistoria.id },
      data: { hora_inicio: '17:00', hora_fin: '18:00', updated_at: new Date() },
    });
    console.log('Horario para Historia de la Música del Paraguay actualizado.');
  } else {
    await prisma.catedraDiaHorario.create({
      data: {
        catedraId: historiaMusicaCatedra.id,
        dia_semana: 'Jueves',
        hora_inicio: '17:00',
        hora_fin: '18:00',
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
    console.log('Horario para Historia de la Música del Paraguay creado.');
  }

  // Asociar todos los alumnos existentes a la nueva cátedra
  const allAlumnos = await prisma.alumno.findMany({});
  console.log(`Asociando ${allAlumnos.length} alumnos a la cátedra...`);

  for (const alumno of allAlumnos) {
    const existingCatedraAlumno = await prisma.catedraAlumno.findUnique({
      where: {
        catedraId_alumnoId: {
          catedraId: historiaMusicaCatedra.id,
          alumnoId: alumno.id,
        },
      },
    }).catch(() => null);

    if (!existingCatedraAlumno) {
      await prisma.catedraAlumno.create({
        data: {
          catedraId: historiaMusicaCatedra.id,
          alumnoId: alumno.id,
          assignedBy: julioFrancoDocente.nombre + ' ' + julioFrancoDocente.apellido,
          fecha_inscripcion: new Date(),
        },
      });
    }
  }
  console.log('Alumnos asociados a la cátedra.');

  // Alumnos para Introducción a la Filosofía
  const alumnosFilosofia = [
    { nombre: 'Leandro Esteban', apellido: 'Lugo Ruiz', email: 'leandrolugo129@gmail.com' },
    { nombre: 'Liz Vanessa', apellido: 'Britez Gomez', email: 'lizvanesabritezgomez@gmail.com' },
    { nombre: 'Lourdes Natalia', apellido: 'Meza Escurra', email: 'loumeza85@gmail.com' },
    { nombre: 'Carmina Araceli', apellido: 'Colman Martinez', email: 'carminacolman@gmail.com' },
    { nombre: 'Bruno Matias', apellido: 'Monges Arias', email: 'brunomonges0@gmail.com' },
  ];

  for (const alumnoData of alumnosFilosofia) {
    let alumno = await prisma.alumno.findUnique({
      where: { email: alumnoData.email },
    });
    if (!alumno) {
      alumno = await prisma.alumno.create({
        data: {
          nombre: alumnoData.nombre,
          apellido: alumnoData.apellido,
          email: alumnoData.email,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
      console.log(`Alumno ${alumnoData.nombre} ${alumnoData.apellido} creado.`);
    } else {
      console.log(`Alumno ${alumnoData.nombre} ${alumnoData.apellido} ya existe.`);
    }

    const existingCatedraAlumno = await prisma.catedraAlumno.findUnique({
      where: {
        catedraId_alumnoId: {
          catedraId: filosofiaCatedra.id,
          alumnoId: alumno.id,
        },
      },
    }).catch(() => null);

    if (!existingCatedraAlumno) {
      await prisma.catedraAlumno.create({
        data: {
          catedraId: filosofiaCatedra.id,
          alumnoId: alumno.id,
          assignedBy: julioFrancoDocente.nombre + ' ' + julioFrancoDocente.apellido,
          fecha_inscripcion: new Date(),
        },
      });
      console.log(`Alumno ${alumno.nombre} ${alumno.apellido} asociado a Introducción a la Filosofía.`);
    } else {
      console.log(`Alumno ${alumno.nombre} ${alumno.apellido} ya asociado a Introducción a la Filosofía.`);
    }
  }

  // Alumnos adicionales para Historia de la Música del Paraguay
  const alumnosHistoriaMusica = [
    { nombre: 'Jacqueline', apellido: 'Ibañez Escurra', email: 'ibanezjacqueline11@gmail.com' },
    { nombre: 'Sebastian', apellido: 'Mendoza', email: 'mendosanseb@gmail.com' }
  ];

  for (const alumnoData of alumnosHistoriaMusica) {
    let alumno = await prisma.alumno.findUnique({
      where: { email: alumnoData.email },
    });
    if (!alumno) {
      alumno = await prisma.alumno.create({
        data: {
          nombre: alumnoData.nombre,
          apellido: alumnoData.apellido,
          email: alumnoData.email,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
      console.log(`Alumno ${alumnoData.nombre} ${alumnoData.apellido} creado.`);
    } else {
      console.log(`Alumno ${alumnoData.nombre} ${alumnoData.apellido} ya existe.`);
    }

    const existingCatedraAlumno = await prisma.catedraAlumno.findUnique({
      where: {
        catedraId_alumnoId: {
          catedraId: historiaMusicaCatedra.id,
          alumnoId: alumno.id,
        },
      },
    }).catch(() => null);

    if (!existingCatedraAlumno) {
      await prisma.catedraAlumno.create({
        data: {
          catedraId: historiaMusicaCatedra.id,
          alumnoId: alumno.id,
          assignedBy: julioFrancoDocente.nombre + ' ' + julioFrancoDocente.apellido,
          fecha_inscripcion: new Date(),
        },
      });
      console.log(`Alumno ${alumno.nombre} ${alumno.apellido} asociado a Historia de la Música del Paraguay.`);
    } else {
      console.log(`Alumno ${alumno.nombre} ${alumno.apellido} ya asociado a Historia de la Música del Paraguay.`);
    }
  }

  // Obtener todos los alumnos asociados a la Cátedra Historia de la Música del Paraguay
  const alumnosHistoriaMusicaIds = (await prisma.catedraAlumno.findMany({
    where: { catedraId: historiaMusicaCatedra.id },
    select: { alumnoId: true },
  })).map(ca => ca.alumnoId);

  // === Fin de la sección de Docente, Cátedra y Alumnos ===

  const newCreatorsData = [
    {
      "Nombre": "Pedro Comentale",
      "Tipo": "Músico Jesuita/Compositor",
      "Año de nacimiento": "1595",
      "Año de muerte": "1664",
      "biografia_resumida": "Originario de Nápoles, Italia. Trabajó en las Reducciones de San Ignacio del Paraná entre 1610 y 1640. Despertó entusiasmo en Buenos Aires en 1628 al presentar un grupo de veinte indios, diestros cantores y músicos de vihuelas de arco y otros instrumentos.",
      "obras_mas_importantes": "N/A (Se menciona su trabajo formando músicos indígenas)."
    },
    {
      "Nombre": "Jean Vaisseau (Juan Vaseo)",
      "Tipo": "Músico Jesuita",
      "Año de nacimiento": "1584",
      "Año de muerte": "1623",
      "biografia_resumida": "Nació en Tournay, Bélgica. Fue maestro de capilla de la corte de Carlos V antes de llegar a América. Arribó a las reducciones en 1617, trabajando intensamente en la Misión de Loreto hasta 1623.",
      "obras_mas_importantes": "Trajo consigo no pocas piezas de música."
    },
    {
      "Nombre": "Luis Berger (Louis Berger)",
      "Tipo": "Músico Jesuita/Docente",
      "Año de nacimiento": "1588",
      "Año de muerte": "1639",
      "biografia_resumida": "Originario de Abbeville, Amiens, Francia. Llegó al Paraguay en 1616. Desarrolló una valiosa labor docente en las reducciones jesuíticas de San Ignacio, Misiones. Enseñó a los indígenas a pintar y ejecutar instrumentos musicales.",
      "obras_mas_importantes": "N/A."
    },
    {
      "Nombre": "Anton Sepp (Joseph Von Reineg)",
      "Tipo": "Músico Jesuita/Compositor",
      "Año de nacimiento": "1655",
      "Año de muerte": "1733",
      "biografia_resumida": "Músico de origen tirolés que llegó a las Reducciones Jesuíticas en 1616, estableciéndose en Yapeyú. Integró el Coro de la Corte Imperial en Viena. Ejecutaba más de 20 instrumentos y fue de los primeros en introducir el arpa en Paraguay.",
      "obras_mas_importantes": "Fue compositor (no se especifican títulos)."
    },
    {
      "Nombre": "Domenico Zipoli",
      "Tipo": "Compositor/Músico Jesuita",
      "Año de nacimiento": "1688",
      "Año de muerte": "1726",
      "biografia_resumida": "Nacido en Prato, Italia. Fue el compositor más destacado de su tiempo en Roma y organista de la Chiesa del Gesu. Llegó a América en 1717 y se estableció en Córdoba (Argentina). Su música se hizo muy apreciada por indígenas y misioneros en las reducciones. Su obra sudamericana fue mayormente redescubierta en Bolivia tras siglos de pérdida.",
      "obras_mas_importantes": "De Europa: 'Sonate d’Intavolature per Órgano e Címbalo'. De América: 'Misa en fa', 'La Misa de los Santos Apóstoles', 'La Misa a San Ignacio', 'Letanía', 'Himno Te Deum Laudamus', 'Laudate Pueri'."
    },
    {
      "Nombre": "Martin Schmid",
      "Tipo": "Músico Jesuita/Arquitecto/Compositor",
      "Año de nacimiento": "N/A",
      "Año de muerte": "N/A",
      "biografia_resumida": "Misionero músico y brillante arquitecto. Diseñó y dirigió la construcción de los principales templos de la reducción de Chiquitos (hoy Bolivia). También se dedicó a construir instrumentos.",
      "obras_mas_importantes": "Creó numerosas obras para el repertorio musical."
    },
    {
      "Nombre": "Rodrigo de Melgarejo",
      "Tipo": "Músico",
      "Año de nacimiento": "N/A",
      "Año de muerte": "N/A",
      "biografia_resumida": "Clérigo virtuoso y pretendiente de la Compañía de Jesús. Fue el primer maestro de arte con que contaron los indios.",
      "obras_mas_importantes": "N/A."
    },
    {
      "Nombre": "Manuel Sierra",
      "Tipo": "Maestro de Música",
      "Año de nacimiento": "N/A",
      "Año de muerte": "N/A",
      "biografia_resumida": "Maestro de Música que se destacó en la Escuela de Jóvenes Aprendices de Música Militar, fundada en la capital en 1817.",
      "obras_mas_importantes": "N/A."
    },
    {
      "Nombre": "Benjamín González",
      "Tipo": "Músico/Instructor",
      "Año de nacimiento": "N/A",
      "Año de muerte": "N/A",
      "biografia_resumida": "Hermano de Felipe González, de nacionalidad argentina. Contratado en 1820 por el gobierno de Francia como instructor de bandas de música militar. Recontratado en 1853 por C. A. López.",
      "obras_mas_importantes": "N/A."
    },
    {
      "Nombre": "Felipe González (Felipe Santiago González)",
      "Tipo": "Músico/Instructor",
      "Año de nacimiento": "N/A",
      "Año de muerte": "N/A",
      "biografia_resumida": "Hermano de Benjamín González. Destacado en las bandas de la Capital. Colaborador de Francisco S. de Dupuis en la formación de nuevas agrupaciones.",
      "obras_mas_importantes": "N/A."
    },
    {
      "Nombre": "José Gabriel Téllez",
      "Tipo": "Guitarrista/Educador",
      "Año de nacimiento": "N/A",
      "Año de muerte": "N/A (activo hasta 1840)",
      "biografia_resumida": "Director de la primera escuela pública del Paraguay. Músico hábil guitarrista y cantor. Confirmado como director de la Escuela Central de Primeras Letras en 1812. Dirigía conjuntos musicales.",
      "obras_mas_importantes": "N/A."
    },
    {
      "Nombre": "Antonio María Quintana (Luis María Quintana)",
      "Tipo": "Guitarrista/Maestro de Música",
      "Año de nacimiento": "N/A",
      "Año de muerte": "N/A",
      "biografia_resumida": "Considerado el primer maestro de música del Paraguay. Virtuoso de la guitarra, también relojero y docente. Sucedió a José Gabriel Téllez en la dirección de la escuela en 1843.",
      "obras_mas_importantes": "Se le atribuye la música del himno de la Academia Literaria. Atribuida la música del Himno Patriótico (de Anastasio Rolón)."
    },
    {
      "Nombre": "Kangüe Herreros (Cangué Herreros)",
      "Tipo": "Guitarrista/Cantor Popular",
      "Año de nacimiento": "N/A",
      "Año de muerte": "N/A",
      "biografia_resumida": "Nacido en Carapeguá. Uno de los más hábiles intérpretes de la guitarra y cantor popular posterior a la Independencia (1811). Formó parte de la banda de músicos del Batallón Escolta.",
      "obras_mas_importantes": "Se le atribuye la creación de la polca 'Campamento Cerro León' y la canción 'Che lucero aguai’y'."
    },
    {
      "Nombre": "Rufino López",
      "Tipo": "Guitarrista Popular",
      "Año de nacimiento": "N/A",
      "Año de muerte": "N/A",
      "biografia_resumida": "Destacado guitarrista popular de la zona de Luque, hacia 1830.",
      "obras_mas_importantes": "N/A."
    },
    {
      "Nombre": "Ulpiano López",
      "Tipo": "Guitarrista Popular",
      "Año de nacimiento": "N/A",
      "Año de muerte": "N/A",
      "biografia_resumida": "Guitarrista popular de gran fama, en la zona de San Pedro, hacia 1830.",
      "obras_mas_importantes": "N/A."
    },
    {
      "Nombre": "Tomás Miranda (Tomás Carapeguá)",
      "Tipo": "Guitarrista",
      "Año de nacimiento": "N/A",
      "Año de muerte": "N/A",
      "biografia_resumida": "Guitarrista virtuoso de la zona de Carapeguá, destacado en las décadas de 1830 y 1840.",
      "obras_mas_importantes": "N/A."
    },
    {
      "Nombre": "Anastasio Rolón",
      "Tipo": "Guitarrista/Poeta/Autor de Himno",
      "Año de nacimiento": "Comienzos del siglo XIX",
      "Año de muerte": "N/A",
      "biografia_resumida": "Nació en Caraguatay. Es autor del primer Himno Patriótico del Paraguay, con letra original en guaraní, escrito hacia 1830.",
      "obras_mas_importantes": "Primer Himno Patriótico del Paraguay (Tetã Purahéi)."
    },
    {
      "Nombre": "Francisco Sauvageot de Dupuis",
      "Tipo": "Compositor/Jefe de Música",
      "Año de nacimiento": "1813 (París, Francia)",
      "Año de muerte": "1861 (Asunción)",
      "biografia_resumida": "Maestro francés contratado en 1853 por C. A. López como Jefe de Música. Formó más de 20 agrupaciones musicales y fue maestro de los primeros músicos profesionales. Carácter despótico y rigurosa disciplina.",
      "obras_mas_importantes": "Presunto autor de la música del Himno Nacional del Paraguay y autor de una 'Marcha al Mariscal López'."
    },
    {
      "Nombre": "Cantalicio Guerrero",
      "Tipo": "Clarinetista/Compositor/Director de Orquesta",
      "Año de nacimiento": "1853 (Asunción)",
      "Año de muerte": "1908 (Asunción)",
      "biografia_resumida": "Uno de los primeros músicos profesionales, discípulo de Dupuis. Integró orquestas en Buenos Aires tras ser prisionero en la Guerra de la Triple Alianza. Organizó la primera Orquesta Nacional subvencionada por el Estado en 1890.",
      "obras_mas_importantes": "La paraguaya (habanera sinfónica), una Mazurca, y 'Canción guerrera' (1865). Realizó una transcripción del Himno Nacional."
    },
    {
      "Nombre": "Rudecindo Morales",
      "Tipo": "Trompetista",
      "Año de nacimiento": "N/A",
      "Año de muerte": "N/A",
      "biografia_resumida": "Virtuoso de la trompeta a mediados del siglo XIX. Integraba la Banda de Músicos de la Capital hacia 1850.",
      "obras_mas_importantes": "N/A."
    },
    {
      "Nombre": "Indalecio Odriozola",
      "Tipo": "Director de Orquesta",
      "Año de nacimiento": "c. 1830 (Asunción)",
      "Año de muerte": "c. 1865-1870",
      "biografia_resumida": "Discípulo de Dupuis. Figura relevante en las décadas de 1850 al 60. Dirigió las primeras orquestas en la capital. Falleció en Humaitá en el frente de batalla, dirigiendo la banda militar durante un bombardeo.",
      "obras_mas_importantes": "N/A."
    },
    {
      "Nombre": "Francisco Acuña de Figueroa",
      "Tipo": "Poeta/Autor de Letras (Uruguay)",
      "Año de nacimiento": "N/A",
      "Año de muerte": "N/A",
      "biografia_resumida": "Poeta uruguayo, autor del Himno Nacional del Uruguay. Creó el texto del actual Himno Nacional Paraguayo, entregado en 1840.",
      "obras_mas_importantes": "Texto del Himno Nacional Paraguayo; Himno Nacional del Uruguay."
    },
    {
      "Nombre": "Francisco José Debali",
      "Tipo": "Compositor (Húngaro)",
      "Año de nacimiento": "N/A",
      "Año de muerte": "N/A",
      "biografia_resumida": "Músico húngaro radicado en el Uruguay. Figura entre los presuntos autores de la música del Himno Nacional Paraguayo.",
      "obras_mas_importantes": "Autor del Himno de Uruguay."
    },
    {
      "Nombre": "José Giuffra",
      "Tipo": "Compositor (Italiano)",
      "Año de nacimiento": "N/A",
      "Año de muerte": "N/A",
      "biografia_resumida": "Músico italiano. Figura entre los presuntos autores de la música del Himno Nacional Paraguayo.",
      "obras_mas_importantes": "N/A."
    },
    {
      "Nombre": "Luis Cavedagni",
      "Tipo": "Músico (Italiano)",
      "Año de nacimiento": "N/A",
      "Año de muerte": "N/A",
      "biografia_resumida": "Músico italiano que llegó a Paraguay en 1874.",
      "obras_mas_importantes": "Realizó la primera reconstrucción del Himno Nacional, publicada en su 'Álbum de los Toques más Populares del Paraguay' (1874)."
    },
    {
      "Nombre": "Nicolino Pellegrini",
      "Tipo": "Compositor/Director",
      "Año de nacimiento": "N/A",
      "Año de muerte": "N/A",
      "biografia_resumida": "Maestro de Agustín Pío Barrios Mangoré. Dirigió la orquesta que acompañó a Mangoré en 1908. Co-fundador de la zarzuela paraguaya con la obra 'Tierra Guaraní' (1913). Dirigió la Banda de la Policía de la Capital.",
      "obras_mas_importantes": "Tierra Guaraní (zarzuela, 1913). Versión del Himno Nacional (1922)."
    },
    {
      "Nombre": "Agustín Pío Barrios Mangoré",
      "Tipo": "Compositor/Guitarrista",
      "Año de nacimiento": "1885 (San Juan Bautista)",
      "Año de muerte": "1944 (San Salvador, El Salvador)",
      "biografia_resumida": "El más universal de los músicos paraguayos. Estudió con Sosa Escalada y Nicolino Pellegrini. Realizó extensas giras por América y Europa. Desarrolló tres estilos: barroco, romántico y folklórico hispanoamericano. Considerado genio nacional en El Salvador.",
      "obras_mas_importantes": "'Las Abejas', 'Danza Paraguaya', 'Estudio de Concierto', 'Mazurca, Apasionata', 'La Catedral', 'Valses 3 y 4', 'Choro de Saudade' (1929), 'Julia Florida' (1938), 'Una limosna por amor de Dios', 'Kyguá Verá'."
    },
    {
      "Nombre": "José Asunción Flores",
      "Tipo": "Compositor/Creador de Género",
      "Año de nacimiento": "1904 (Asunción)",
      "Año de muerte": "1972 (Buenos Aires)",
      "biografia_resumida": "La figura más importante de la música popular paraguaya del siglo XX. Creó la 'Guarania' en 1925. Fue un pionero en la búsqueda de un lenguaje nacional en el campo sinfónico.",
      "obras_mas_importantes": "Guaranias: 'Jejuí' (la primera), 'India', 'Kerasy', 'Ne rendápe aju', 'Panambí verá', 'Ñemity'. Poemas Sinfónicos: 'Mburikaó', 'Pyhare Pyte' (1954), 'Ñanderuvusu' (1957), 'María de la Paz' (1961)."
    },
    {
      "Nombre": "Herminio Giménez",
      "Tipo": "Compositor/Director",
      "Año de nacimiento": "1905 (Caballero)",
      "Año de muerte": "1991 (Asunción)",
      "biografia_resumida": "Dirigió la orquesta del Comando del Ejército durante la Guerra del Chaco. Incursionó en la composición sinfónica y creó música para filmes argentinos. Su música 'Cerro Corá' fue declarada Canción Nacional en 1944.",
      "obras_mas_importantes": "Obras sinfónicas: 'El Rabelero' (1944), 'Suite El Pájaro' (1950), 'Sinfonía en Gris Mayor' (1990). Populares: 'El canto de mi selva', 'Che Trompo arasá', 'Cerro Corá' (1931), 'Cerro Porteño' (1936)."
    },
    {
      "Nombre": "Carlos Lara Bareiro",
      "Tipo": "Compositor/Director",
      "Año de nacimiento": "1914 (Capiatá)",
      "Año de muerte": "1987 (Buenos Aires)",
      "biografia_resumida": "Músico de más alta formación académica del Paraguay, estudió becado en Brasil. Creó la Orquesta Sinfónica de la Asociación de Músicos del Paraguay (1951).",
      "obras_mas_importantes": "Obras sinfónicas: 'Suite Paraguaya Nº 1 y 2', 'Concierto para piano y orquesta', 'Gran Guarania en Do mayor', 'Guarania Sinfónica'. Para piano: 'Acuarelas Paraguayas'."
    },
    {
      "Nombre": "Emilio Biggi",
      "Tipo": "Compositor/Bandoneonista",
      "Año de nacimiento": "1910 (Asunción)",
      "Año de muerte": "1969 (San Cristóbal, Venezuela)",
      "biografia_resumida": "Estudió en la Banda de Músicos de los Salesianos y formó su gran orquesta típica. Se estableció en Venezuela (1952) como músico y docente.",
      "obras_mas_importantes": "Poema sinfónico 'Renacer Guaraní' (1957). 'Cuarteto de cuerdas' (1953), 'Aire Nacional Op.3' (1953). Populares: 'Paraguay', 'Mimby pú', 'Acosta ñu', 'Cordión jahe’o'."
    },
    {
      "Nombre": "Juan Max Boettner",
      "Tipo": "Compositor/Musicólogo/Médico",
      "Año de nacimiento": "1899 (Asunción)",
      "Año de muerte": "1958 (Asunción)",
      "biografia_resumida": "Se graduó de Doctor en Medicina en Buenos Aires. Pionero en musicología y rescate de música indígena. Autor de importantes estudios y libros como 'Música y músicos del Paraguay'.",
      "obras_mas_importantes": "'Suite guaraní' (orquesta), 'Sinfonía en Mi menor', Ballet 'El sueño de René'. Canciones: 'Azul luna', 'Nostalgia guaraní'."
    },
    {
      "Nombre": "Juan Carlos Moreno González",
      "Tipo": "Compositor/Director/Creador de Zarzuela Paraguaya",
      "Año de nacimiento": "1916 (Asunción)",
      "Año de muerte": "1983 (Asunción)",
      "biografia_resumida": "Superó un accidente en la niñez que le costó ambas piernas. Estudió becado en Brasil. Junto a Manuel Frutos Pane, creó el género de la 'Zarzuela Paraguaya' (1956). Director del Conservatorio Municipal de Música.",
      "obras_mas_importantes": "Zarzuelas: 'La tejedora de Ñandutí' (1956), 'Corochire' (1958), 'María Pacuri' (1959). Sinfónico: Poema 'Kuarahy mimby' (1944). Canciones: 'Margarita' (1929)."
    },
    {
      "Nombre": "Remberto Giménez",
      "Tipo": "Director/Compositor/Violinista",
      "Año de nacimiento": "1898 (Coronel Oviedo)",
      "Año de muerte": "1977 (Asunción)",
      "biografia_resumida": "Estudió en Argentina y se perfeccionó en París y Berlín. Reconstruyó la versión oficial del Himno Nacional Paraguayo (1934). Fundó la Escuela Normal de Música (1940) y la Orquesta Sinfónica de la Ciudad de Asunción (OSCA) (1957).",
      "obras_mas_importantes": "'Rapsodia Paraguaya' (1932 y 1954). 'Nostalgias del Terruño', 'Ka´aguy Ryakuä', 'Marcha Presidencial' (1938). 'Himno a la Juventud'."
    },
    {
      "Nombre": "Luis Cañete",
      "Tipo": "Compositor/Bandoneonista/Arreglador",
      "Año de nacimiento": "1905 (Concepción)",
      "Año de muerte": "1985 (Asunción)",
      "biografia_resumida": "Hábil ejecutante del bandoneón. Formó su propia Orquesta Típica (1925) y dirigió la Orquesta Gigante de la Asociación de Músicos del Paraguay (1938). Fundador y docente de la Escuela de Música de APA.",
      "obras_mas_importantes": "'Jahe´o soro' (canción, 1925), 'Sueño de Artista' (poema sinfónico, 1938), 'Divertimento para cuerdas' (1938), 'Patria mía' (poema sinfónico, 1952), 'Asunción de antaño' (poema sinfónico, 1953)."
    },
    {
      "Nombre": "Florentín Giménez",
      "Tipo": "Compositor/Director/Fundador",
      "Año de nacimiento": "1925 (Ybycuí)",
      "Año de muerte": "N/A",
      "biografia_resumida": "Director de la OSCA (1976-1990) y director invitado en varios países. Fundó el Conservatorio Nacional de Música (1997). Autor de la primera ópera paraguaya 'Juana de Lara'. Recibió el Premio Nacional de Música en 2001.",
      "obras_mas_importantes": "Ópera 'Juana de Lara' (1987). 6 Sinfonías (1980-1994). Poemas sinfónicos: 'Minas Cué' (1970), 'El Río de la Esperanza' (1972). Comedia musical 'Sombrero piri'. Canción 'Así Canta mi Patria'."
    },
    {
      "Nombre": "Mauricio Cardozo Ocampo",
      "Tipo": "Compositor/Folklorólogo/Músico",
      "Año de nacimiento": "1907 (Ybycuí)",
      "Año de muerte": "1982 (Buenos Aires)",
      "biografia_resumida": "Se dedicó fundamentalmente a la composición de música de inspiración folklórica. Integró el dúo Martínez-Cardozo con Eladio Martínez. Estudió folklore con Juan Alfonso Carrizo. Fundador de SADAIC (Argentina). Autor del libro 'Mundo Folklórico Paraguayo'.",
      "obras_mas_importantes": "Alrededor de 300 canciones. 'Las siete cabrillas', 'Pueblo Ybycuí', 'Añoranza', 'Paraguaya linda', 'Guavirá poty', 'Galopera'."
    },
    {
      "Nombre": "Francisco Alvarenga (Nenin)",
      "Tipo": "Compositor/Violinista/Director",
      "Año de nacimiento": "1903 (Itá)",
      "Año de muerte": "1957 (Buenos Aires)",
      "biografia_resumida": "Se radicó en Buenos Aires, participando activamente en la Agrupación Folklórica Guaraní. Estudió armonía y composición con Gilardo Gilardi. Fue director de la orquesta de la Agrupación Folklórica Guaraní.",
      "obras_mas_importantes": "'Carne de cañón', 'Chokokue purahéi', 'Meditación', versión sinfónica de 'Campamento Cerro León', 'Plata yvyguy'."
    },
    {
      "Nombre": "Emigdio Ayala Báez",
      "Tipo": "Compositor/Músico",
      "Año de nacimiento": "1917 (Escobar)",
      "Año de muerte": "1993 (Escobar)",
      "biografia_resumida": "Inició su carrera junto a Herminio Giménez. Integró el célebre Trío Olímpico (1948) con Eladio Martínez y Albino Quiñonez. Su canción 'Mi dicha lejana' le dio gran popularidad.",
      "obras_mas_importantes": "'Polca del Club Sol de América', 'Mi dicha lejana', 'Lejana flor', 'Oración a mi amada' (co-autoría), 'A mi pueblito Escobar'."
    },
    {
      "Nombre": "Agustín Barboza",
      "Tipo": "Compositor/Solista/Cantante",
      "Año de nacimiento": "1913 (Asunción)",
      "Año de muerte": "N/A (Activo en 1997)",
      "biografia_resumida": "Se estableció en Buenos Aires, siendo solista de orquestas importantes. Participó en la grabación del primer disco de José Asunción Flores (1934). Obtuvo el Premio Nacional de Música por 'Mi patria soñada' (1997).",
      "obras_mas_importantes": "'Alma Vibrante', 'Flor de Pilar', 'Mi patria soñada', 'Sobre el corazón de mi guitarra', 'Dulce tierra mía' (con A. Roa Bastos), 'Reservista purahéi' (con F. Fernández)."
    },
    {
      "Nombre": "Neneco Norton (Elio Ramón Benítez González)",
      "Tipo": "Compositor/Director/Músico",
      "Año de nacimiento": "1923 (Asunción)",
      "Año de muerte": "N/A",
      "biografia_resumida": "Estudió en la Banda de Músicos del Colegio Salesiano. Creó la orquesta 'Los Caballeros del Ritmo'. Desarrolló una importante labor en la creación de zarzuelas paraguayas a partir de 1960.",
      "obras_mas_importantes": "Posee 84 composiciones. Polca 'Paloma Blanca' (difusión mundial). Guaranias: 'Aquel ayer', 'Resedá'. Zarzuelas: 'El arribeño', 'Ribereña', 'Naranjera'."
    },
    {
      "Nombre": "Eladio Martínez",
      "Tipo": "Compositor/Cantante/Músico",
      "Año de nacimiento": "1912 (Paraguarí)",
      "Año de muerte": "1990 (Asunción)",
      "biografia_resumida": "Ganó el Primer Premio en el Concurso Nacional de Canto (1930). Formó el célebre dúo Martínez-Cardozo. Dirigió programas radiales de música paraguaya en Argentina. Integró el Trío Olímpico. Musicalizó la película 'El trueno entre las hojas'.",
      "obras_mas_importantes": "'Lucerito alba', 'Noches guaireñas', 'Che pycasumi', 'Pacholí' (zarzuela). Co-autor de 'Oración a mi amada' y 'Lejana flor'."
    },
    {
      "Nombre": "Demetrio Ortíz",
      "Tipo": "Compositor/Cantante/Guitarrista",
      "Año de nacimiento": "1916 (Piribebuy)",
      "Año de muerte": "1975 (Buenos Aires)",
      "biografia_resumida": "Formó el Trío Asunceno (1943) con Ignacio Melgarejo y Digno García. Se hizo famoso internacionalmente con su canción 'Mis noches sin ti', dedicada a su madre recién fallecida.",
      "obras_mas_importantes": "'Recuerdos de Ypacaraí', 'Mis noches sin ti', 'Que será de ti', 'Mi canción viajera'."
    },
    {
      "Nombre": "Félix Pérez Cardozo",
      "Tipo": "Compositor/Arpista",
      "Año de nacimiento": "1908 (Hyaty, Guairá)",
      "Año de muerte": "1952 (Buenos Aires)",
      "biografia_resumida": "Figura más relevante en la interpretación y desarrollo técnico del arpa paraguaya. Inició su carrera como autodidacta. Amplió los recursos técnicos del arpa y aumentó el número de cuerdas. Su pueblo natal lleva su nombre actualmente.",
      "obras_mas_importantes": "Versión de la polca 'Guyra Campana' (Pájaro campana, recopilación). 'Llegada', 'Tren lechero', 'Che valle mi Yaguarón', 'Los sesenta granaderos', 'Oda pasional'."
    },
    {
      "Nombre": "Oscar Nelson Safuán",
      "Tipo": "Compositor/Creador de Avanzada",
      "Año de nacimiento": "1943 (San Estanislao)",
      "Año de muerte": "N/A",
      "biografia_resumida": "Estudió en Brasil. Creador del género 'Avanzada' (1977), que fusiona guarania y polca con ritmos modernos e instrumentos electrónicos.",
      "obras_mas_importantes": "'Tema paraguayo' (1977), 'Avanzada', 'Paraguay 80', 'Nacionales 1, 2 y 3'."
    },
    {
      "Nombre": "Maneco Galeano (Félix Roberto Galeano)",
      "Tipo": "Cantautor/Compositor del Nuevo Cancionero",
      "Año de nacimiento": "1945 (Puerto Pinasco)",
      "Año de muerte": "1980 (Asunción)",
      "biografia_resumida": "Formó parte del movimiento del Nuevo Cancionero Latinoamericano en Paraguay. Destacado por sus textos de aguda visión, ironía y compromiso social. Fue periodista y profesor de música.",
      "obras_mas_importantes": "'Yo soy de la Chacarita' (1971), 'Despertar' (1973), 'La Chuchi' (1970), 'Los problemas que acarrea un televisor...', 'Poncho de 60 listas' (1980), 'Ceferino Zarza compañero' (con Jorge Garbett)."
    },
    {
      "Nombre": "Papi Galán",
      "Tipo": "Compositor",
      "Año de nacimiento": "N/A",
      "Año de muerte": "N/A",
      "biografia_resumida": "Compositor que creó varias composiciones dentro del género 'Avanzada'.",
      "obras_mas_importantes": "Composiciones en género Avanzada."
    },
    {
      "Nombre": "Vicente Castillo",
      "Tipo": "Compositor",
      "Año de nacimiento": "N/A",
      "Año de muerte": "N/A",
      "biografia_resumida": "Compositor que creó varias composiciones dentro del género 'Avanzada'.",
      "obras_mas_importantes": "Composiciones en género Avanzada."
    },
    {
      "Nombre": "Luis Bordón",
      "Tipo": "Compositor",
      "Año de nacimiento": "N/A",
      "Año de muerte": "N/A",
      "biografia_resumida": "Compositor que creó varias composiciones dentro del género 'Avanzada'.",
      "obras_mas_importantes": "Composiciones en género Avanzada."
    },
    {
      "Nombre": "Carlos Noguera",
      "Tipo": "Compositor del Nuevo Cancionero",
      "Año de nacimiento": "N/A",
      "Año de muerte": "N/A",
      "biografia_resumida": "Representante destacado del movimiento del Nuevo Cancionero en Paraguay.",
      "obras_mas_importantes": "'Canto de esperanza', 'A la residenta', 'Hazme un sitio a tu lado', 'El silencio y la aurora'."
    },
    {
      "Nombre": "Jorge Garbett",
      "Tipo": "Compositor del Nuevo Cancionero",
      "Año de nacimiento": "N/A",
      "Año de muerte": "N/A",
      "biografia_resumida": "Representante destacado del movimiento del Nuevo Cancionero en Paraguay.",
      "obras_mas_importantes": "'Ceferino Zarza compañero' (con Maneco Galeano), 'Los hombres' (marcha), 'Para vivir'."
    },
    {
      "Nombre": "Alberto Rodas",
      "Tipo": "Compositor e Intérprete del Nuevo Cancionero",
      "Año de nacimiento": "N/A",
      "Año de muerte": "N/A",
      "biografia_resumida": "Representante destacado e intérprete del movimiento del Nuevo Cancionero.",
      "obras_mas_importantes": "'Torres de babel', 'Sudor de pobre', 'Tenemos tanto', 'Mundo loco'."
    },
    {
      "Nombre": "Rolando Chaparro",
      "Tipo": "Compositor del Nuevo Cancionero",
      "Año de nacimiento": "N/A",
      "Año de muerte": "N/A",
      "biografia_resumida": "Representante destacado del movimiento del Nuevo Cancionero en Paraguay.",
      "obras_mas_importantes": "'Polcaza', 'Polcarera de los lobos', 'Un misil en mi ventana', 'Ojavea'."
    }
  ];

  const transformedCreators = newCreatorsData.map((creator, index) => {
    const { first_name, last_name } = splitName(creator.Nombre);
    
    const birthYearMatch = String(creator["Año de nacimiento"]).match(/\d{4}/);
    const birthYear = birthYearMatch ? parseInt(birthYearMatch[0], 10) : null;
    const deathYearMatch = String(creator["Año de muerte"]).match(/\d{4}/);
    const deathYear = deathYearMatch ? parseInt(deathYearMatch[0], 10) : null;

    const period = getPeriod(birthYear, deathYear);
    const mainRole = getMainRoles(creator.Tipo || '');

    return {
      first_name,
      last_name,
      birth_year: birthYear || 1800, // 👈 Usar 1800 como default
      birth_month: 1,
      birth_day: 1,
      death_year: deathYear,
      death_month: deathYear !== null ? 1 : null,
      death_day: deathYear !== null ? 1 : null,
      bio: creator.biografia_resumida || 'Biografía pendiente.',
      notable_works: creator.obras_mas_importantes || 'Obras notables pendientes.',
      period: period, // Usamos la lógica de inferencia de período
      mainRole: mainRole.length > 0 ? mainRole : ['COMPOSER'],
      references: '',
      photo_url: '',
      youtube_link: '',
      status: 'PUBLISHED',
      quality: 'A',
      email: `seed_user_${index}_${Date.now()}@example.com`, // Correo único para cada registro
      ip_address: '127.0.0.1',
      updated_at: new Date(),
    };
  });

  console.log(`Insertando ${transformedCreators.length} creadores en la base de datos...`);
  for (const creatorData of transformedCreators) {
    await prisma.composer.create({
      data: creatorData,
    });
  }

  // Crear el Plan de Clases para Historia de la Música del Paraguay
  const planAnual = await prisma.planDeClases.create({
    data: {
      titulo: `PLAN ANUAL DE ESTUDIOS 2025 - ${historiaMusicaCatedra.nombre}`,
      tipoOrganizacion: 'MES',
      docenteId: julioFrancoDocente.id,
      catedraId: historiaMusicaCatedra.id,
      created_at: new Date(),
      updated_at: new Date(),
    },
  });
  console.log(`Plan de Clases "PLAN ANUAL DE ESTUDIOS 2025 - ${historiaMusicaCatedra.nombre}" creado.`);

  // Crear Unidades de Plan de Clases
  const unidadesData = [
    {
      periodo: 'Marzo (2ª Quincena)',
      contenido: 'UNIDAD 1: INTRODUCCIÓN (El Paraguay, Una provincia gigante, Integración política y cultural).',
      capacidades: 'Comprender el proceso de consolidación, origen y antecedentes históricos de la música paraguaya.',
      horasTeoricas: 2,
      horasPracticas: 0,
      estrategiasMetodologicas: 'Clase introductoria (Exposición oral). Presentación del programa.',
      mediosVerificacionEvaluacion: 'Tareas y Trabajos prácticos.',
    },
    {
      periodo: 'Abril (1ª Quincena)',
      contenido: 'UNIDAD 2: LOS INDÍGENAS Y SU MÚSICA (El prejuicio de lo estético, Análisis Morfológico).',
      capacidades: 'Conocer y analizar características sociales y culturales de cada familia lingüística de la población indígena.',
      horasTeoricas: 2,
      horasPracticas: 0,
      estrategiasMetodologicas: 'Clases magistrales. Uso de medios auxiliares (pizarra, folletos).',
      mediosVerificacionEvaluacion: 'Evaluación continua del progreso.',
    },
    {
      periodo: 'Abril (2ª Quincena)',
      contenido: 'UNIDAD 2 (Continuación) (Instrumentos musicales, Descripción más amplia de instrumentos étnicos).',
      capacidades: 'Analizar la música desde la perspectiva del canto, los instrumentos, las danzas y los rituales.',
      horasTeoricas: 2,
      horasPracticas: 0,
      estrategiasMetodologicas: 'Análisis de material bibliográfico (Ej: BOETTNER, MELIÁ).',
      mediosVerificacionEvaluacion: 'Tareas y Trabajos prácticos sobre instrumentos.',
    },
    {
      periodo: 'Mayo (1ª Quincena)',
      contenido: 'UNIDAD 3: LA MÚSICA DURANTE LA COLONIA. UNIDAD 4: LAS MISIONES JESUÍTICAS (Los jesuitas y la música).',
      capacidades: 'Conocer las características culturales de la etapa de colonización. Analizar la labor de los misioneros y las características de la música reduccional.',
      horasTeoricas: 2,
      horasPracticas: 0,
      estrategiasMetodologicas: 'Explicación detallada de los temas a trabajar (Exposición oral).',
      mediosVerificacionEvaluacion: 'Evaluación de la comprensión y aplicación de conceptos.',
    },
    {
      periodo: 'Mayo (2ª Quincena)',
      contenido: 'UNIDAD 4 (Continuación) (Músicos jesuitas destacados: Pedro Comentale, Domenico Zipoli, etc.).',
      capacidades: 'Conocer biografía y obras de músicos paraguayos de cada etapa.',
      horasTeoricas: 2,
      horasPracticas: 0,
      estrategiasMetodologicas: 'Clases magistrales enfocadas en personajes históricos.',
      mediosVerificacionEvaluacion: 'Seguimiento del progreso en el estudio.',
    },
    {
      periodo: 'Junio (1ª Quincena)',
      contenido: 'UNIDAD 5: LA INDEPENDENCIA (Música y la dictadura de Francia, El auténtico himno paraguayo, Músicos destacados).',
      capacidades: 'Conocer las manifestaciones culturales de este periodo (1811-1840).',
      horasTeoricas: 2,
      horasPracticas: 0,
      estrategiasMetodologicas: 'Enfoque en el estudio temático seleccionado.',
      mediosVerificacionEvaluacion: 'Evaluación del progreso y dominio de los conceptos.',
    },
    {
      periodo: 'Junio (2ª Quincena)',
      contenido: 'EVALUACIÓN 1ER. CUATRIMESTRE (Unidades 1 a 5).',
      capacidades: 'Demostrar dominio y comprensión de los contenidos del primer cuatrimestre.',
      horasTeoricas: 0,
      horasPracticas: 0,
      estrategiasMetodologicas: 'Prueba escrita cuatrimestral.',
      mediosVerificacionEvaluacion: 'Prueba escrita cuatrimestral (Suma Tareas/Trabajos Prácticos).',
    },
    {
      periodo: 'Julio (1ª Quincena)',
      contenido: 'UNIDAD 6: LOS LÓPEZ (Progreso material y cultural, Primeras referencias sobre Música Popular Paraguaya).',
      capacidades: 'Analizar los procesos a través de las etapas históricas (Los López).',
      horasTeoricas: 2,
      horasPracticas: 0,
      estrategiasMetodologicas: 'Se facilitarán materiales bibliográficos para el desarrollo de las lecciones.',
      mediosVerificacionEvaluacion: 'Tareas y Trabajos prácticos.',
    },
    {
      periodo: 'Julio (2ª Quincena)',
      contenido: 'UNIDAD 7: HIMNO NACIONAL PARAGUAYO. UNIDAD 8: LA GUERRA DE LA TRIPLE ALIANZA.',
      capacidades: 'Conocer la historia del Himno y analizar el impacto cultural de la guerra.',
      horasTeoricas: 2,
      horasPracticas: 0,
      estrategiasMetodologicas: 'Uso de textos específicos (Ej: CALZADA MACHO).',
      mediosVerificacionEvaluacion: 'Seguimiento del progreso y aplicación de conceptos.',
    },
    {
      periodo: 'Agosto (1ª Quincena)',
      contenido: 'UNIDAD 9: DANZAS PARAGUAYAS (Origen, Tipos, Trajes típicos).',
      capacidades: 'Conocer rasgos culturales propios del paraguayo y las manifestaciones de su identidad.',
      horasTeoricas: 2,
      horasPracticas: 0,
      estrategiasMetodologicas: 'Repaso y ampliación de las unidades trabajadas (Exposición oral).',
      mediosVerificacionEvaluacion: 'Evaluación de la mejora en la comprensión y aplicación.',
    },
    {
      periodo: 'Agosto (2ª Quincena)',
      contenido: 'UNIDAD 10: EL COMPUESTO. UNIDAD 11: EL JEJUVYKUE JERÁ.',
      capacidades: 'Analizar estos géneros como expresiones musicales de los habitantes de esta tierra.',
      horasTeoricas: 2,
      horasPracticas: 0,
      estrategiasMetodologicas: 'Práctica de técnicas de análisis.',
      mediosVerificacionEvaluacion: 'Evaluación de dominio y precisión.',
    },
    {
      periodo: 'Setiembre (1ª Quincena)',
      contenido: 'UNIDAD 12: LOS ESTACIONEROS O PASIONEROS. UNIDAD 13: MÚSICA PARAGUAYA (Popular, Géneros y Estilos: Polca, Guarania, Purahéi, Kyre’ŷ, etc.).',
      capacidades: 'Analizar la función de las agrupaciones tradicionales. Analizar la música erudita y popular (Géneros y Estilos).',
      horasTeoricas: 2,
      horasPracticas: 0,
      estrategiasMetodologicas: 'Estudio y perfeccionamiento temático.',
      mediosVerificacionEvaluacion: 'Evaluación del avance y dominio de los géneros.',
    },
    {
      periodo: 'Octubre (1ª Quincena)',
      contenido: 'UNIDAD 14: AGRUPACIONES TRADICIONALES (Cantores, Bandas Hyekue, Orquestas Típicas). UNIDAD 15: ZARZUELA PARAGUAYA (Generalidades).',
      capacidades: 'Conocer la conformación de grupos tradicionales y reconocer al creador de la zarzuela (J.C. Moreno González).',
      horasTeoricas: 2,
      horasPracticas: 0,
      estrategiasMetodologicas: 'Preparación para la evaluación.',
      mediosVerificacionEvaluacion: 'Evaluación del dominio de las unidades.',
    },
    {
      periodo: 'Octubre (2ª Quincena)',
      contenido: 'EVALUACIÓN 2DO. CUATRIMESTRE (Unidades 6 a 15).',
      capacidades: 'Demostrar dominio y comprensión de los contenidos del segundo cuatrimestre.',
      horasTeoricas: 0,
      horasPracticas: 0,
      estrategiasMetodologicas: 'Prueba escrita cuatrimestral.',
      mediosVerificacionEvaluacion: 'Prueba escrita cuatrimestral (Requisito: 80% asistencia y tareas).',
    },
    {
      periodo: 'Noviembre (hasta el 9)',
      contenido: 'UNIDAD 16: COMPOSITORES PARAGUAYOS DEL SIGLO XX (Mangoré, Flores, Giménez, etc.).',
      capacidades: 'Analizar la música erudita y popular de compositores destacados.',
      horasTeoricas: 2,
      horasPracticas: 0,
      estrategiasMetodologicas: 'Consolidación y perfeccionamiento de los temas. Exploración de bibliografía (SZARÁN, SÁNCHEZ HAASE).',
      mediosVerificacionEvaluacion: 'Evaluación de la comprensión y aplicación de características estilísticas.',
    },
    {
      periodo: 'Noviembre (10 al 14)',
      contenido: 'SEMANA DE EVALUACIÓN DE MATERIAS TEÓRICAS',
      capacidades: 'Obtener un Término Medio Mínimo o superior a la calificación 2 resultante de los dos cuatrimestres para habilitar el examen final.',
      horasTeoricas: 0,
      horasPracticas: 0,
      estrategiasMetodologicas: 'EVALUACIÓN FINAL (Según el cronograma institucional).',
      mediosVerificacionEvaluacion: 'Evaluación Final (Requisito previo: T.M. habilitante y 11 clases de asistencia mínima por cuatrimestre).',
    },
    {
      periodo: 'Noviembre (17 al 28)',
      contenido: 'UNIDAD 17: EL MOVIMIENTO DEL NUEVO CANCIONERO EN PARAGUAY. Cierre y Retroalimentación.',
      capacidades: 'Reflexionar y emitir juicios de valor sobre la historia de la música paraguaya a lo largo del tiempo y en la actualidad.',
      horasTeoricas: 4,
      horasPracticas: 0,
      estrategiasMetodologicas: 'Preparación para una presentación final/Trabajo de reflexión.',
      mediosVerificacionEvaluacion: 'Certificación de Desempeño (El estudiante debe tener un 70% de las tareas y trabajos prácticos exigidos).',
    },
  ];

  const createdUnidades = [];
  for (const unidad of unidadesData) {
    const createdUnidad = await prisma.unidadPlan.create({
      data: {
        planDeClasesId: planAnual.id,
        periodo: unidad.periodo,
        contenido: unidad.contenido,
        capacidades: unidad.capacidades,
        horasTeoricas: unidad.horasTeoricas,
        horasPracticas: unidad.horasPracticas,
        estrategiasMetodologicas: unidad.estrategiasMetodologicas,
        mediosVerificacionEvaluacion: unidad.mediosVerificacionEvaluacion,
        recursos: [],
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
    createdUnidades.push(createdUnidad);
    console.log(`Unidad Plan "${unidad.contenido}" creada.`);
  }

  // Encontrar la unidad de "Junio (2ª Quincena)" para asociar la evaluación
  const unidadJunio2daQuincena = createdUnidades.find(u => u.periodo === 'Junio (2ª Quincena)');
  if (unidadJunio2daQuincena) {
    const evaluacion1erCuatrimestre = await prisma.evaluacion.create({
      data: {
        titulo: 'EVALUACIÓN 1ER. CUATRIMESTRE',
        catedraId: historiaMusicaCatedra.id,
        fecha_limite: new Date('2025-06-30T23:59:59Z'), // Fin de junio
        isMaster: true,
        unidadPlanId: unidadJunio2daQuincena.id,
        created_at: new Date(),
      },
    });
    // Asignar evaluación a todos los alumnos de la cátedra
    for (const alumnoId of alumnosHistoriaMusicaIds) {
      const evaluacionAsignacion = await prisma.evaluacionAsignacion.create({
        data: {
          alumnoId: alumnoId,
          evaluacionId: evaluacion1erCuatrimestre.id,
          fecha_entrega: evaluacion1erCuatrimestre.fecha_limite,
          estado: 'CALIFICADA',
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
      await prisma.calificacionEvaluacion.create({
        data: {
          alumnoId: alumnoId,
          evaluacionAsignacionId: evaluacionAsignacion.id,
          puntos: 80, // Asignar un puntaje para que aparezca como calificada
          created_at: new Date(),
        },
      });
      console.log(`Evaluación "EVALUACIÓN 1ER. CUATRIMESTRE" asignada al alumno ${alumnoId}.`);
    }
    console.log('Evaluación "EVALUACIÓN 1ER. CUATRIMESTRE" creada.');
  } else {
    console.error('No se encontró la unidad "Junio (2ª Quincena)" para asociar la evaluación.');
  }

  // Encontrar la unidad de "Marzo (2ª Quincena)" para asociar la primera tarea
  const unidadMarzo2daQuincena = createdUnidades.find(u => u.periodo === 'Marzo (2ª Quincena)');
  if (unidadMarzo2daQuincena) {
    const nuevaTarea = await prisma.tareaMaestra.create({
      data: {
        titulo: 'Tarea: Prejuicios Estéticos y Análisis Morfológico',
        descripcion: 'Investigar y analizar dos ejemplos de prejuicios estéticos en la música, y aplicar un análisis morfológico básico a una pieza musical indígena (proporcionada en clase).',
        fecha_entrega: new Date('2025-04-15T23:59:59Z'),
        puntos_posibles: 20,
        recursos: ['Guía de análisis morfológico.pdf'],
        catedraId: historiaMusicaCatedra.id,
        unidadPlanId: unidadMarzo2daQuincena.id,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
    console.log('Tarea "Prejuicios Estéticos y Análisis Morfológico" creada.');
    // Asignar tarea a todos los alumnos de la cátedra
    for (const alumnoId of alumnosHistoriaMusicaIds) {
      await prisma.tareaAsignacion.create({
        data: {
          alumnoId: alumnoId,
          tareaMaestraId: nuevaTarea.id,
          estado: 'CALIFICADA',
          submission_date: new Date(),
          puntos_obtenidos: 20,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
      console.log(`Tarea "Prejuicios Estéticos y Análisis Morfológico" asignada al alumno ${alumnoId}.`);
    }
  } else {
    console.error('No se encontró la unidad "Marzo (2ª Quincena)" para asociar la tarea.');
  }

  // Encontrar la unidad de "Abril (2ª Quincena)" para asociar la segunda tarea
  const unidadAbril2daQuincena = createdUnidades.find(u => u.periodo === 'Abril (2ª Quincena)');
  if (unidadAbril2daQuincena) {
    const nuevaTarea2 = await prisma.tareaMaestra.create({
      data: {
        titulo: 'Tarea: Instrumentos Musicales Indígenas',
        descripcion: 'Realizar una investigación sobre 3 instrumentos musicales étnicos del Paraguay. Incluir descripción, origen, y uso en rituales o danzas. Presentar en formato de informe corto con imágenes.',
        fecha_entrega: new Date('2025-05-10T23:59:59Z'),
        puntos_posibles: 20,
        recursos: ['Lista de recursos bibliográficos.pdf'],
        catedraId: historiaMusicaCatedra.id,
        unidadPlanId: unidadAbril2daQuincena.id,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
    console.log('Tarea "Instrumentos Musicales Indígenas" creada.');
    for (const alumnoId of alumnosHistoriaMusicaIds) {
      await prisma.tareaAsignacion.create({
        data: {
          alumnoId: alumnoId,
          tareaMaestraId: nuevaTarea2.id,
          estado: 'CALIFICADA',
          submission_date: new Date(),
          puntos_obtenidos: 20,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
      console.log(`Tarea "Instrumentos Musicales Indígenas" asignada al alumno ${alumnoId}.`);
    }
  } else {
    console.error('No se encontró la unidad "Abril (2ª Quincena)" para asociar la tarea.');
  }



  const alumnosFilosofiaIds = (await prisma.catedraAlumno.findMany({
    where: { catedraId: filosofiaCatedra.id },
    select: { alumnoId: true },
  })).map(ca => ca.alumnoId);

  // Crear el Plan de Clases para Introducción a la Filosofía
  const planFilosofia = await prisma.planDeClases.create({
    data: {
      titulo: `PLAN ANUAL DE ESTUDIOS 2025 - ${filosofiaCatedra.nombre}`,
      tipoOrganizacion: 'MES',
      docenteId: julioFrancoDocente.id,
      catedraId: filosofiaCatedra.id,
      created_at: new Date(),
      updated_at: new Date(),
    },
  });
  console.log(`Plan de Clases "PLAN ANUAL DE ESTUDIOS 2025 - ${filosofiaCatedra.nombre}" para Filosofía creado.`);

  // Crear Unidades de Plan de Clases para Introducción a la Filosofía
  const unidadesFilosofiaData = [
    {
      periodo: 'Marzo (2ª Quincena)',
      contenido: 'UNIDAD I: CONTEXTUALIZACIÓN FILOSÓFICA DE LA ESTÉTICA (La filosofía como disciplina humanística).',
      capacidades: 'Ubicar al estudiante en los ciclos intelectuales de sistemas filosóficos, propiciando la diversidad y pluralidad.',
      horasTeoricas: 2,
      horasPracticas: 0,
      estrategiasMetodologicas: 'Exposición oral y Participación. Introducción a la bibliografía básica.',
      mediosVerificacionEvaluacion: 'Registro anecdótico y Observación. Tareas de contextualización.',
    },
    {
      periodo: 'Abril (1ª Q)',
      contenido: 'UNIDAD I (Continuación): El mundo del arte en el pensamiento filosófico.',
      capacidades: 'Interpretar temas y problemas de la filosofía frente a las diversas disciplinas.',
      horasTeoricas: 2,
      horasPracticas: 0,
      estrategiasMetodologicas: 'Clases expositivas-participativas. Apoyo con audición de obras varias.',
      mediosVerificacionEvaluacion: 'Mapas conceptuales y/o Trabajos prácticos.',
    },
    {
      periodo: 'Abril (2ª Q)',
      contenido: 'UNIDAD I (Cierre): La estética, crítica y teoría del arte.',
      capacidades: 'Desarrollar lineamientos relevantes sobre la corriente estética de la filosofía.',
      horasTeoricas: 2,
      horasPracticas: 0,
      estrategiasMetodologicas: 'Análisis de textos introductorios (Jiménez, Oliveras).',
      mediosVerificacionEvaluacion: 'Evaluación continua de la comprensión.',
    },
    {
      periodo: 'Mayo (1ª Q)',
      contenido: 'UNIDAD II: LA FILOSOFÍA ANTIGUA DEL ARTE (Mitos, Tragedias y el legado de la antigua Grecia).',
      capacidades: 'Analizar los principales pensamientos filosóficos en el ámbito de la estética.',
      horasTeoricas: 2,
      horasPracticas: 0,
      estrategiasMetodologicas: 'Exposición magistral. Análisis de fragmentos de Poética (Aristóteles).',
      mediosVerificacionEvaluacion: 'Prueba oral o escrita corta.',
    },
    {
      periodo: 'Mayo (2ª Q)',
      contenido: 'UNIDAD II (Continuación): Platón y el canon de belleza suprema; Aristóteles, el arte como vivencia e imitación.',
      capacidades: 'Aplicar críticamente los pensamientos en el mundo del arte.',
      horasTeoricas: 2,
      horasPracticas: 0,
      estrategiasMetodologicas: 'Lectura y discusión de El Banquete, Fedro (Platón).',
      mediosVerificacionEvaluacion: 'Trabajos de investigación bibliográfica individual.',
    },
    {
      periodo: 'Junio (1ª Q)',
      contenido: 'UNIDAD III: LA FILOSOFÍA DEL ARTE EN LA EDAD MODERNA (Kant, entre lo bello y lo sublime).',
      capacidades: 'Indagar y contraponer los diversos criterios en la formulación de propios argumentos.',
      horasTeoricas: 2,
      horasPracticas: 0,
      estrategiasMetodologicas: 'Exposición enfocada en Crítica del Juicio (Kant).',
      mediosVerificacionEvaluacion: 'Escala de actitudes (participación).',
    },
    {
      periodo: 'Junio (2ª Q)',
      contenido: 'EVALUACIÓN 1ER. CUATRIMESTRE (U. I, II, III inicio).',
      capacidades: 'Demostrar comprensión de los sistemas filosóficos y estéticos iniciales.',
      horasTeoricas: 0,
      horasPracticas: 0,
      estrategiasMetodologicas: 'Examen Cuatrimestral (Prueba escrita).',
      mediosVerificacionEvaluacion: 'Examen Cuatrimestral (Suma tareas/trabajos).',
    },
    {
      periodo: 'Julio (1ª Q)',
      contenido: 'UNIDAD III (Continuación): Hegel y el fin del arte; El idealismo alemán en la estética romántica.',
      capacidades: 'Abordar aspectos relacionado al arte con argumentación filosófica.',
      horasTeoricas: 2,
      horasPracticas: 0,
      estrategiasMetodologicas: 'Análisis de Introducción a la Estética (Hegel).',
      mediosVerificacionEvaluacion: 'Portafolio de trabajos (recopilación de lecturas).',
    },
    {
      periodo: 'Julio (2ª Q)',
      contenido: 'UNIDAD III (Cierre): Nietzsche y la voluntad de poder como arte.',
      capacidades: 'Valorar la condición humana estética ante los cambios en el mundo de la técnica.',
      horasTeoricas: 2,
      horasPracticas: 0,
      estrategiasMetodologicas: 'Discusión sobre El nacimiento de la tragedia (Nietzsche).',
      mediosVerificacionEvaluacion: 'Tareas de análisis y reflexión.',
    },
    {
      periodo: 'Agosto (1ª Q)',
      contenido: 'UNIDAD IV: PENSAMIENTO DEL SIGLO XX SOBRE EL ARTE (Heidegger, verdad y arte; Benjamín y el aura del arte).',
      capacidades: 'Reflexionar sobre el impacto de la reproductibilidad técnica en la estética.',
      horasTeoricas: 2,
      horasPracticas: 0,
      estrategiasMetodologicas: 'Clases expositivas. Apoyo con medios visuales (películas/videos). Análisis de La obra de arte... (Benjamín).',
      mediosVerificacionEvaluacion: 'Trabajos de investigación bibliográfica (individual y/o grupal).',
    },
    {
      periodo: 'Agosto (2ª Q)',
      contenido: 'UNIDAD IV (Continuación): Merleau-Ponty y la experiencia estética.',
      capacidades: 'Interpretar la experiencia estética a través de la fenomenología.',
      horasTeoricas: 2,
      horasPracticas: 0,
      estrategiasMetodologicas: 'Presentaciones de los alumnos sobre temas específicos.',
      mediosVerificacionEvaluacion: 'Pruebas prácticas sobre aplicación de conceptos.',
    },
    {
      periodo: 'Setiembre (1ª Q)',
      contenido: 'UNIDAD V: CONTEMPORANEIDAD EN LA ESTÉTICA FILOSÓFICA (Jameson y la playa estética).',
      capacidades: 'Analizar el pensamiento posmoderno en relación al arte.',
      horasTeoricas: 2,
      horasPracticas: 0,
      estrategiasMetodologicas: 'Discusión sobre Posmodernismo o la lógica cultural... (Jameson).',
      mediosVerificacionEvaluacion: 'Evaluación continua basada en la participación en debates.',
    },
    {
      periodo: 'Setiembre (2ª Q)',
      contenido: 'UNIDAD V (Continuación): Chul Han y la salvación de lo bello; Vattimo, en el crepúsculo del arte.',
      capacidades: 'Analizar las corrientes estéticas actuales.',
      horasTeoricas: 2,
      horasPracticas: 0,
      estrategiasMetodologicas: 'Exposición sobre La salvación de lo bello (Chul-Han) y El fin de la modernidad (Vattimo).',
      mediosVerificacionEvaluacion: 'Elaboración de un argumento filosófico propio.',
    },
    {
      periodo: 'Octubre (1ª Q)',
      contenido: 'UNIDAD V (Cierre): Gadamer como justificación del arte. Repaso e Integración.',
      capacidades: 'Integrar críticamente los diversos criterios en la formulación de argumentos propios.',
      horasTeoricas: 2,
      horasPracticas: 0,
      estrategiasMetodologicas: 'Clases de repaso y resolución de dudas.',
      mediosVerificacionEvaluacion: 'Preparación para el examen cuatrimestral.',
    },
    {
      periodo: 'Octubre (2ª Q)',
      contenido: 'EVALUACIÓN 2DO. CUATRIMESTRE (U. III cierre, IV, V).',
      capacidades: 'Demostrar dominio de las corrientes estéticas modernas y contemporáneas.',
      horasTeoricas: 0,
      horasPracticas: 0,
      estrategiasMetodologicas: 'Examen Cuatrimestral (Prueba escrita).',
      mediosVerificacionEvaluacion: 'Examen Cuatrimestral. El conservatorio establece que la participación en conciertos vale puntaje adicional.',
    },
    {
      periodo: 'Noviembre (hasta el 9)',
      contenido: 'CONSOLIDACIÓN Y PREPARACIÓN FINAL (Integración de los 5 ejes).',
      capacidades: 'Habilitarse para la evaluación final obteniendo el término medio mínimo.',
      horasTeoricas: 2,
      horasPracticas: 0,
      estrategiasMetodologicas: 'Preparación de la defensa de trabajos finales o proyectos de investigación.',
      mediosVerificacionEvaluacion: 'Revisión de Portafolio.',
    },
    {
      periodo: 'Noviembre (10 al 14)',
      contenido: 'SEMANA DE EVALUACIÓN DE MATERIAS TEÓRICAS',
      capacidades: 'N/A',
      horasTeoricas: 0,
      horasPracticas: 0,
      estrategiasMetodologicas: 'N/A',
      mediosVerificacionEvaluacion: 'EVALUACIÓN FINAL (Según cronograma).',
    },
    {
      periodo: 'Noviembre (17 al 28)',
      contenido: 'UNIDAD 17: EL MOVIMIENTO DEL NUEVO CANCIONERO EN PARAGUAY. Cierre y Retroalimentación.',
      capacidades: 'Reflexionar y emitir juicios de valor sobre la historia de la música paraguaya a lo largo del tiempo y en la actualidad.',
      horasTeoricas: 4,
      horasPracticas: 0,
      estrategiasMetodologicas: 'Preparación para una presentación final/Trabajo de reflexión.',
      mediosVerificacionEvaluacion: 'Certificación de Desempeño (El estudiante debe tener un 70% de las tareas y trabajos prácticos exigidos).',
    },
  ];

  const createdUnidadesFilosofia = [];
  for (const unidad of unidadesFilosofiaData) {
    const createdUnidad = await prisma.unidadPlan.create({
      data: {
        planDeClasesId: planFilosofia.id,
        periodo: unidad.periodo,
        contenido: unidad.contenido,
        capacidades: unidad.capacidades,
        horasTeoricas: unidad.horasTeoricas,
        horasPracticas: unidad.horasPracticas,
        estrategiasMetodologicas: unidad.estrategiasMetodologicas,
        mediosVerificacionEvaluacion: unidad.mediosVerificacionEvaluacion,
        recursos: [],
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
    createdUnidadesFilosofia.push(createdUnidad);
    console.log(`Unidad Plan para Filosofía "${unidad.contenido}" creada.`);
  }


  const unidadFilosofiaJunio2daQuincena = createdUnidadesFilosofia.find(u => u.periodo === 'Junio (2ª Q)');
  if (unidadFilosofiaJunio2daQuincena) {
    await prisma.evaluacion.create({
      data: {
        titulo: 'EVALUACIÓN 1ER. CUATRIMESTRE Filosofía',
        catedraId: filosofiaCatedra.id,
        fecha_limite: new Date('2025-06-30T23:59:59Z'),
        isMaster: true,
        unidadPlanId: unidadFilosofiaJunio2daQuincena.id,
        created_at: new Date(),
      },
    });
    console.log('Evaluación "EVALUACIÓN 1ER. CUATRIMESTRE Filosofía" creada.');
  } else {
    console.error('No se encontró la unidad "Junio (2ª Q)" para Filosofía para asociar la evaluación.');
  }


  // === Adición de Evaluaciones y Tareas para Historia de la Música del Paraguay ===
  
  const unidadHistoriaMusicaJulio1raQuincena = createdUnidades.find(u => u.planDeClasesId === planAnual.id && u.periodo === 'Julio (1ª Quincena)');
  if (unidadHistoriaMusicaJulio1raQuincena) {
    const evaluacionLosLopez = await prisma.evaluacion.create({
      data: {
        titulo: 'Evaluación sobre el Periodo de Los López',
        catedraId: historiaMusicaCatedra.id,
        fecha_limite: new Date('2025-07-15T23:59:59Z'),
        isMaster: true,
        unidadPlanId: unidadHistoriaMusicaJulio1raQuincena.id,
        created_at: new Date(),
      },
    });
    // Asignar evaluación a todos los alumnos de la cátedra
    for (const alumnoId of alumnosHistoriaMusicaIds) {
      const evaluacionAsignacion = await prisma.evaluacionAsignacion.create({
        data: {
          alumnoId: alumnoId,
          evaluacionId: evaluacionLosLopez.id,
          fecha_entrega: evaluacionLosLopez.fecha_limite,
          estado: 'CALIFICADA',
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
      await prisma.calificacionEvaluacion.create({
        data: {
          alumnoId: alumnoId,
          evaluacionAsignacionId: evaluacionAsignacion.id,
          puntos: 0,
          created_at: new Date(),
        },
      });
      console.log(`Evaluación "Evaluación sobre el Periodo de Los López" asignada al alumno ${alumnoId}.`);
    }
    console.log('Evaluación "Evaluación sobre el Periodo de Los López" creada.');
  } else {
    console.error('No se encontró la unidad "Julio (1ª Quincena)" para Historia de la Música para asociar la evaluación.');
  }

  // === Fin de Adición de Evaluaciones y Tareas para Historia de la Música del Paraguay ===


  // === Adición de Evaluaciones y Tareas para Introducción a la Filosofía ===
  const unidadFilosofiaAbril1raQ = createdUnidadesFilosofia.find(u => u.periodo === 'Abril (1ª Q)');
  if (unidadFilosofiaAbril1raQ) {
    const evaluacionFilosofiaArte = await prisma.evaluacion.create({
      data: {
        titulo: 'Evaluación: El mundo del arte en el pensamiento filosófico',
        catedraId: filosofiaCatedra.id,
        fecha_limite: new Date('2025-04-30T23:59:59Z'),
        isMaster: true,
        unidadPlanId: unidadFilosofiaAbril1raQ.id,
        created_at: new Date(),
      },
    });
    // Asignar evaluación a todos los alumnos de la cátedra
    for (const alumnoId of alumnosFilosofiaIds) {
      const evaluacionAsignacion = await prisma.evaluacionAsignacion.create({
        data: {
          alumnoId: alumnoId,
          evaluacionId: evaluacionFilosofiaArte.id,
          fecha_entrega: evaluacionFilosofiaArte.fecha_limite,
          estado: 'CALIFICADA',
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
      await prisma.calificacionEvaluacion.create({
        data: {
          alumnoId: alumnoId,
          evaluacionAsignacionId: evaluacionAsignacion.id,
          puntos: 0,
          created_at: new Date(),
        },
      });
      console.log(`Evaluación "El mundo del arte en el pensamiento filosófico" asignada al alumno ${alumnoId}.`);
    }
    console.log('Evaluación "El mundo del arte en el pensamiento filosófico" creada.');
  } else {
    console.error('No se encontró la unidad "Abril (1ª Q)" para Filosofía para asociar la evaluación.');
  }

  const unidadFilosofiaJulio2daQ = createdUnidadesFilosofia.find(u => u.periodo === 'Julio (2ª Q)');
  if (unidadFilosofiaJulio2daQ) {
    const evaluacionNietzsche = await prisma.evaluacion.create({
      data: {
        titulo: 'Evaluación: Nietzsche y la voluntad de poder como arte',
        catedraId: filosofiaCatedra.id,
        fecha_limite: new Date('2025-07-30T23:59:59Z'),
        isMaster: true,
        unidadPlanId: unidadFilosofiaJulio2daQ.id,
        created_at: new Date(),
      },
    });
    // Asignar evaluación a todos los alumnos de la cátedra
    for (const alumnoId of alumnosFilosofiaIds) {
      const evaluacionAsignacion = await prisma.evaluacionAsignacion.create({
        data: {
          alumnoId: alumnoId,
          evaluacionId: evaluacionNietzsche.id,
          fecha_entrega: evaluacionNietzsche.fecha_limite,
          estado: 'CALIFICADA',
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
      await prisma.calificacionEvaluacion.create({
        data: {
          alumnoId: alumnoId,
          evaluacionAsignacionId: evaluacionAsignacion.id,
          puntos: 0,
          created_at: new Date(),
        },
      });
      console.log(`Evaluación "Nietzsche y la voluntad de poder como arte" asignada al alumno ${alumnoId}.`);
    }
    console.log('Evaluación "Nietzsche y la voluntad de poder como arte" creada.');
  } else {
    console.error('No se encontró la unidad "Julio (2ª Q)" para Filosofía para asociar la evaluación.');
  }

  const unidadFilosofiaMarzo2daQuincena = createdUnidadesFilosofia.find(u => u.periodo === 'Marzo (2ª Quincena)');
  if (unidadFilosofiaMarzo2daQuincena) {
    const tareaFilosofiaEstetica = await prisma.tareaMaestra.create({
      data: {
        titulo: 'Tarea: Contextualización Filosófica de la Estética',
        descripcion: 'Realizar un breve ensayo sobre la filosofía como disciplina humanística y su relación con la estética.',
        fecha_entrega: new Date('2025-03-30T23:59:59Z'),
        puntos_posibles: 10,
        catedraId: filosofiaCatedra.id,
        unidadPlanId: unidadFilosofiaMarzo2daQuincena.id,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
    for (const alumnoId of alumnosFilosofiaIds) {
      await prisma.tareaAsignacion.create({
        data: {
          alumnoId: alumnoId,
          tareaMaestraId: tareaFilosofiaEstetica.id,
          estado: 'ENTREGADA',
          submission_date: new Date(),
          puntos_obtenidos: tareaFilosofiaEstetica.puntos_posibles,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
      console.log(`Tarea "Contextualización Filosófica de la Estética" asignada al alumno ${alumnoId}.`);
    }
    console.log('Tarea "Contextualización Filosófica de la Estética" creada.');
  } else {
    console.error('No se encontró la unidad "Marzo (2ª Quincena)" para Filosofía para asociar la tarea.');
  }

  const unidadFilosofiaMayo1raQ = createdUnidadesFilosofia.find(u => u.periodo === 'Mayo (1ª Q)');
  if (unidadFilosofiaMayo1raQ) {
    const tareaFilosofiaAntigua = await prisma.tareaMaestra.create({
      data: {
        titulo: 'Tarea: Análisis de la Filosofía Antigua del Arte',
        descripcion: 'Analizar un mito o tragedia griega y relacionarlo con el pensamiento filosófico de la época sobre el arte.',
        fecha_entrega: new Date('2025-05-10T23:59:59Z'),
        puntos_posibles: 10,
        catedraId: filosofiaCatedra.id,
        unidadPlanId: unidadFilosofiaMayo1raQ.id,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
    for (const alumnoId of alumnosFilosofiaIds) {
      await prisma.tareaAsignacion.create({
        data: {
          alumnoId: alumnoId,
          tareaMaestraId: tareaFilosofiaAntigua.id,
          estado: 'ENTREGADA',
          submission_date: new Date(),
          puntos_obtenidos: tareaFilosofiaAntigua.puntos_posibles,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
      console.log(`Tarea "Análisis de la Filosofía Antigua del Arte" asignada al alumno ${alumnoId}.`);
    }
    console.log('Tarea "Análisis de la Filosofía Antigua del Arte" creada.');
  } else {
    console.error('No se encontró la unidad "Mayo (1ª Q)" para Filosofía para asociar la tarea.');
  }

  // === Fin de Adición de Evaluaciones y Tareas para Introducción a la Filosofía ===


  // === Fin de Adición de Evaluaciones y Tareas para Introducción a la Filosofía ===

  // === Asignar puntuaciones máximas a alumnos para tareas y evaluaciones ===
  console.log('Asignando puntuaciones máximas a alumnos...');



  // Obtener todas las tareas de Historia de la Música del Paraguay
  const tareasHistoriaMusica = await prisma.tareaMaestra.findMany({
    where: { catedraId: historiaMusicaCatedra.id },
  });

  // Asignar puntuaciones de tareas para Historia de la Música del Paraguay
  for (const tarea of tareasHistoriaMusica) {
    for (const alumnoId of alumnosHistoriaMusicaIds) {
      if (alumnoId) {
        await prisma.puntuacion.create({
          data: {
            alumnoId: alumnoId,
            catedraId: historiaMusicaCatedra.id,
            puntos: tarea.puntos_posibles,
            motivo: `Tarea: ${tarea.titulo}`,
            tipo: 'TAREA',
            created_at: new Date(),
          },
        }).catch(e => {
          if (e.code === 'P2002') {
            console.log(`Puntuación para tarea "${tarea.titulo}" para alumno ${alumnoId} ya existe. Saltando.`);
          } else {
            console.error(`Error al crear puntuación para tarea "${tarea.titulo}" para alumno ${alumnoId}:`, e.message);
          }
        });
      }
    }
  }

  // Obtener todas las evaluaciones de Historia de la Música del Paraguay
  const evaluacionesHistoriaMusica = await prisma.evaluacion.findMany({
    where: { catedraId: historiaMusicaCatedra.id },
  });

  // Asignar puntuaciones de evaluaciones para Historia de la Música del Paraguay
  for (const evaluacion of evaluacionesHistoriaMusica) {
    for (const alumnoId of alumnosHistoriaMusicaIds) {
      if (alumnoId) {
        await prisma.puntuacion.create({
          data: {
            alumnoId: alumnoId,
            catedraId: historiaMusicaCatedra.id,
            puntos: 20, // Puntaje máximo para evaluaciones
            motivo: `Evaluación: ${evaluacion.titulo}`,
            tipo: 'EVALUACION',
            created_at: new Date(),
          },
        }).catch(e => {
          if (e.code === 'P2002') {
            console.log(`Puntuación para evaluación "${evaluacion.titulo}" para alumno ${alumnoId} ya existe. Saltando.`);
          } else {
            console.error(`Error al crear puntuación para evaluación "${evaluacion.titulo}" para alumno ${alumnoId}:`, e.message);
          }
        });
      }
    }
  }


  // Obtener todas las tareas de Introducción a la Filosofía
  const tareasFilosofia = await prisma.tareaMaestra.findMany({
    where: { catedraId: filosofiaCatedra.id },
  });

  // Asignar puntuaciones de tareas para Introducción a la Filosofía
  for (const tarea of tareasFilosofia) {
    for (const alumnoId of alumnosFilosofiaIds) {
      if (alumnoId) {
        await prisma.puntuacion.create({
          data: {
            alumnoId: alumnoId,
            catedraId: filosofiaCatedra.id,
            puntos: tarea.puntos_posibles,
            motivo: `Tarea: ${tarea.titulo}`,
            tipo: 'TAREA',
            created_at: new Date(),
          },
        }).catch(e => {
          if (e.code === 'P2002') {
            console.log(`Puntuación para tarea "${tarea.titulo}" para alumno ${alumnoId} ya existe. Saltando.`);
          } else {
            console.error(`Error al crear puntuación para tarea "${tarea.titulo}" para alumno ${alumnoId}:`, e.message);
          }
        });
      }
    }
  }

  // Obtener todas las evaluaciones de Introducción a la Filosofía
  const evaluacionesFilosofia = await prisma.evaluacion.findMany({
    where: { catedraId: filosofiaCatedra.id },
  });

  // Asignar puntuaciones de evaluaciones para Introducción a la Filosofía
  for (const evaluacion of evaluacionesFilosofia) {
    for (const alumnoId of alumnosFilosofiaIds) {
      if (alumnoId) {
        await prisma.puntuacion.create({
          data: {
            alumnoId: alumnoId,
            catedraId: filosofiaCatedra.id,
            puntos: 20, // Puntaje máximo para evaluaciones
            motivo: `Evaluación: ${evaluacion.titulo}`,
            tipo: 'EVALUACION',
            created_at: new Date(),
          },
        }).catch(e => {
          if (e.code === 'P2002') {
            console.log(`Puntuación para evaluación "${evaluacion.titulo}" para alumno ${alumnoId} ya existe. Saltando.`);
          } else {
            console.error(`Error al crear puntuación para evaluación "${evaluacion.titulo}" para alumno ${alumnoId}:`, e.message);
          }
        });
      }
    }
  }
  // === Fin de Asignar puntuaciones máximas ===

  console.log('¡Seeding completado con éxito!');
  await prisma.$disconnect();
}


main()
  .catch((e) => {
    console.error('Error durante el proceso de seeding:', e);
    process.exit(1);
  });
