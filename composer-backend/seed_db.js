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
  // Eliminada la línea de EvaluacionAsignacion aquí
  console.log('Eliminando respuestas de alumno existentes...');
  await prisma.respuestaAlumno.deleteMany({}).catch(e => console.log("No respuestas de alumno to delete or error:", e.message));
  console.log('Eliminando tareas asignadas existentes...');
  await prisma.tareaAsignacion.deleteMany({}).catch(e => console.log("No tareas asignadas to delete or error:", e.message));
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
        dias: 'Lunes, Miércoles',
        docenteId: julioFrancoDocente.id,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
    console.log('Cátedra Historia de la Música del Paraguay creada.');
  } else {
    console.log('Cátedra Historia de la Música del Paraguay ya existe.');
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
      "obras_mas_important es": "Se le atribuye la creación de la polca 'Campamento Cerro León' y la canción 'Che lucero aguai’y'."
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
      "obras_mas_important es": "Composiciones en género Avanzada."
    },
    {
      "Nombre": "Vicente Castillo",
      "Tipo": "Compositor",
      "Año de nacimiento": "N/A",
      "Año de muerte": "N/A",
      "biografia_resumida": "Compositor que creó varias composiciones dentro del género 'Avanzada'.",
      "obras_mas_important es": "Composiciones en género Avanzada."
    },
    {
      "Nombre": "Luis Bordón",
      "Tipo": "Compositor",
      "Año de nacimiento": "N/A",
      "Año de muerte": "N/A",
      "biografia_resumida": "Compositor que creó varias composiciones dentro del género 'Avanzada'.",
      "obras_mas_important es": "Composiciones en género Avanzada."
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
    };
  });

  console.log(`Insertando ${transformedCreators.length} creadores en la base de datos...`);
  for (const creatorData of transformedCreators) {
    await prisma.composer.create({
      data: creatorData,
    });
  }

  console.log('¡Seeding completado con éxito!');
  await prisma.$disconnect(); // 👈 AGREGA ESTA LÍNEA AQUÍ

}

main()
  .catch((e) => {
    console.error('Error durante el proceso de seeding:', e);
    process.exit(1);
  });
  
