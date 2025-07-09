const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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

async function main() {
  console.log('Iniciando el proceso de seeding...');

  // Limpiar la base de datos en el orden correcto para evitar errores de constraints
  console.log('Eliminando ratings existentes...');
  await prisma.rating.deleteMany({}).catch(e => console.log("No ratings to delete or error:", e.message));
  console.log('Eliminando comentarios existentes...');
  await prisma.comment.deleteMany({}).catch(e => console.log("No comments to delete or error:", e.message));
  console.log('Eliminando compositores existentes...');
  await prisma.composer.deleteMany({}).catch(e => console.log("No composers to delete or error:", e.message));
  
  console.log('Base de datos limpiada.');

  const creatorsData = [
    {
      name: 'José Asunción Flores',
      birthDate: new Date('1904-08-27'),
      deathDate: new Date('1972-05-16'),
      period: 'GUARANIA',
      approved: true,
      photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Jos%C3%A9_Asunci%C3%B3n_Flores.jpg/440px-Jos%C3%A9_Asunci%C3%B3n_Flores.jpg',
      youtubeLink: 'https://www.youtube.com/watch?v=Rgq3iR3a_8A', // India
      bio: 'Creador del género musical denominado Guarania. Es uno de los músicos más influyentes de la historia de Paraguay.',
      notable_works: 'India, Nde Rendape Ajú, Panambí Verá, Gallito Cantor'
    },
    {
      name: 'Manuel Ortiz Guerrero',
      birthDate: new Date('1897-07-16'),
      deathDate: new Date('1933-05-08'),
      period: 'GUARANIA',
      approved: true,
      photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Manuel_Ortiz_Guerrero.jpg/440px-Manuel_Ortiz_Guerrero.jpg',
      youtubeLink: 'https://www.youtube.com/watch?v=Rgq3iR3a_8A', // Letra de India
      bio: 'Poeta y letrista paraguayo, figura central del modernismo en Paraguay. Sus obras están intrínsecamente ligadas a la Guarania.',
      notable_works: 'Letra de "India", "Nde Rendape Ajú", "Panambí Verá"'
    },
    {
      name: 'Agustín Pío Barrios',
      birthDate: new Date('1885-05-05'),
      deathDate: new Date('1944-08-07'),
      period: 'POSGUERRA',
      approved: true,
      photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Agustin_Barrios_Mangore_1.jpg/440px-Agustin_Barrios_Mangore_1.jpg',
      youtubeLink: 'https://www.youtube.com/watch?v=jJ-sC-5GfVI', // La Catedral
      bio: 'Conocido como "Mangoré", es uno de los guitarristas clásicos y compositores más importantes de todos los tiempos. Su obra es un pilar de la música paraguaya.',
      notable_works: 'La Catedral, Un Sueño en la Floresta, Julia Florida, Las Abejas'
    },
    {
      name: 'Emiliano R. Fernández',
      birthDate: new Date('1894-08-08'),
      deathDate: new Date('1949-09-15'),
      period: 'POSGUERRA',
      approved: true,
      photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Emiliano_R._Fern%C3%A1ndez_1926.jpg/440px-Emiliano_R._Fern%C3%A1ndez_1926.jpg',
      youtubeLink: 'https://www.youtube.com/watch?v=_-l4kS5-y2o', // 13 Tuyuti
      bio: 'Poeta y músico popular, conocido como el "Tirteo del Paraguay". Sus composiciones narran la historia y la cultura del país, especialmente la Guerra del Chaco.',
      notable_works: '13 Tuyutí, Che La Reina, Asunción del Paraguay, Rojas Silva Rekávo'
    },
    {
      name: 'Luis Alberto del Paraná',
      birthDate: new Date('1926-06-21'),
      deathDate: new Date('1974-09-15'),
      period: 'DICTADURA',
      approved: true,
      photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Luis_Alberto_del_Paran%C3%A1_1961.jpg/440px-Luis_Alberto_del_Paran%C3%A1_1961.jpg',
      youtubeLink: 'https://www.youtube.com/watch?v=h3TCHa_zQ8A', // Cascada
      bio: 'Cantante, compositor y guitarrista de fama mundial. Lideró el trío "Los Paraguayos" y fue un embajador de la música paraguaya en el mundo.',
      notable_works: 'Cascada, A mi tierra, Mi guitarra y mi voz, Bajo el cielo del Paraguay'
    },
    {
      name: 'Herminio Giménez',
      birthDate: new Date('1905-02-20'),
      deathDate: new Date('1991-06-06'),
      period: 'GUARANIA',
      approved: true,
      photoUrl: 'https://www.musicaparaguaya.org/imagenes/herminio_gimenez_1.jpg',
      youtubeLink: 'https://www.youtube.com/watch?v=f-GzDB_H_sM', // Lejanía
      bio: 'Director de orquesta y compositor. Es una de las figuras clave en el desarrollo de la música sinfónica y popular de Paraguay.',
      notable_works: 'Lejanía, Cerro Corá, El Canto de mi Selva, Mi Oración Azul'
    },
    {
      name: 'Félix Pérez Cardozo',
      birthDate: new Date('1908-11-20'),
      deathDate: new Date('1952-06-09'),
      period: 'GUARANIA',
      approved: true,
      photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/F%C3%A9lix_P%C3%A9rez_Cardozo.jpg/440px-F%C3%A9lix_P%C3%A9rez_Cardozo.jpg',
      youtubeLink: 'https://www.youtube.com/watch?v=Dk42v_94g-A', // Pájaro Campana
      bio: 'Compositor e intérprete de arpa paraguaya. Su versión de "Pájaro Campana" es un ícono del folklore paraguayo a nivel mundial.',
      notable_works: 'Pájaro Campana, Tren Lechero, Llegada, Mi Despedida'
    },
    {
      name: 'Teodoro S. Mongelós',
      birthDate: new Date('1914-11-09'),
      deathDate: new Date('1966-05-20'),
      period: 'GUARANIA',
      approved: true,
      photoUrl: 'https://i.ytimg.com/vi/k-r-g-t-Y-s/hqdefault.jpg',
      youtubeLink: 'https://www.youtube.com/watch?v=Z_c-bC3f-PQ', // Virginia
      bio: 'Poeta y letrista, sus versos han sido musicalizados por los más grandes compositores paraguayos. Sus obras reflejan el alma y el sentir popular.',
      notable_works: 'Virginia, Ha Mboriahu, Nde Resa Kuarahy\'ame'
    },
    {
        name: 'Remberto Giménez',
        birthDate: new Date('1898-02-04'),
        deathDate: new Date('1977-02-15'),
        period: 'POSGUERRA',
        approved: true,
        photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Remberto_Gimenez.jpg/440px-Remberto_Gimenez.jpg',
        youtubeLink: 'https://www.youtube.com/watch?v=0KWYg3Ab82E', // Himno Nacional
        bio: 'Compositor y director de orquesta. Es conocido por ser el autor de la versión oficial del Himno Nacional Paraguayo.',
        notable_works: 'Himno Nacional Paraguayo, Rapsodia Paraguaya, Kuarahy mimby'
    },
    {
        name: 'Mauricio Cardozo Ocampo',
        birthDate: new Date('1907-05-14'),
        deathDate: new Date('1982-05-05'),
        period: 'GUARANIA',
        approved: true,
        photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Mauricio_Cardozo_Ocampo.jpg/440px-Mauricio_Cardozo_Ocampo.jpg',
        youtubeLink: 'https://www.youtube.com/watch?v=g-b-qg-8-gQ', // Galopera
        bio: 'Músico, compositor, poeta y autor teatral. Es una de las figuras más polifacéticas y prolíficas de la cultura paraguaya.',
        notable_works: 'Galopera, Chokokue Kéra, Regalo de Amor, Mombyry Guive'
    },
    {
      name: 'Juan Max Boettner',
      birthDate: new Date('1899-05-26'),
      deathDate: new Date('1958-07-03'),
      period: 'POSGUERRA',
      approved: true,
      photoUrl: 'https://www.musicaparaguaya.org/imagenes/juan_max_boettner.jpg',
      youtubeLink: 'https://www.youtube.com/watch?v=example',
      bio: 'Médico y compositor. Escribió el influyente libro "Música y músicos del Paraguay".',
      notable_works: 'Scherzo en Si menor, Himno de la Escuela de Medicina'
    },
    {
      name: 'Carlos Lara Bareiro',
      birthDate: new Date('1914-03-06'),
      deathDate: new Date('1987-09-23'),
      period: 'DICTADURA',
      approved: true,
      photoUrl: 'https://www.musicaparaguaya.org/imagenes/carlos_lara_bareiro.jpg',
      youtubeLink: 'https://www.youtube.com/watch?v=example',
      bio: 'Director de orquesta y compositor. Fue una figura importante en la música clásica de Paraguay, aunque gran parte de su carrera la desarrolló en el exilio.',
      notable_works: 'Concierto para piano y orquesta, Acuarela Paraguaya'
    },
    {
      name: 'Rolando Chaparro',
      birthDate: new Date('1965-08-02'),
      deathDate: null,
      period: 'TRANSICION',
      approved: true,
      photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Rolando_Chaparro.jpg/440px-Rolando_Chaparro.jpg',
      youtubeLink: 'https://www.youtube.com/watch?v=example',
      bio: 'Guitarrista, cantante y compositor, referente del rock paraguayo. Fundador de la banda "Krhizya".',
      notable_works: 'Sobrevivir, Krhizya, Es un Secreto'
    },
    {
      name: 'Berta Rojas',
      birthDate: new Date('1966-09-23'),
      deathDate: null,
      period: 'TRANSICION',
      approved: true,
      photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Berta_Rojas_-_2019.jpg/440px-Berta_Rojas_-_2019.jpg',
      youtubeLink: 'https://www.youtube.com/watch?v=example',
      bio: 'Guitarrista clásica de renombre internacional. Ha sido nominada varias veces a los premios Grammy Latinos.',
      notable_works: 'Día y Medio, Céu e Mar, Legado'
    },
    {
      name: 'Ricardo Flecha',
      birthDate: new Date('1961-01-01'),
      deathDate: null,
      period: 'ACTUALIDAD',
      approved: true,
      photoUrl: 'https://www.abc.com.py/resizer/v2/https%3A%2F%2Fcloudfront-us-east-1.images.arcpublishing.com%2FABCPAR%2F4Q2Z3Y4XJVBJ3H2L5Y4Q3Z3Y4Q.jpg?auth=d2d2c2d2c2d2c2d2c2d2c2d2c2d2c2d2&width=720&height=480&quality=70',
      youtubeLink: 'https://www.youtube.com/watch?v=example',
      bio: 'Cantante y referente del Nuevo Cancionero Popular Paraguayo. Su trabajo se centra en la música de contenido social y la memoria histórica.',
      notable_works: 'La Noche de las Máscaras, Canto de los Karai'
    },
    {
      name: 'Lizza Bogado',
      birthDate: new Date('1963-01-01'),
      deathDate: null,
      period: 'ACTUALIDAD',
      approved: true,
      photoUrl: 'https://www.ultimahora.com/archivos/20190815/imagenes/41564-lizza-bogado-cantante.jpg',
      youtubeLink: 'https://www.youtube.com/watch?v=example',
      bio: 'Cantante y compositora de gran trayectoria en el folklore y la música popular paraguaya.',
      notable_works: 'Paloma del Amor, Un solo canto'
    }
  ];

  const transformedCreators = creatorsData.map((creator, index) => {
    const { first_name, last_name } = splitName(creator.name);
    const birthDate = creator.birthDate;
    const deathDate = creator.deathDate;

    return {
      first_name,
      last_name,
      birth_year: birthDate.getFullYear(),
      birth_month: birthDate.getMonth() + 1,
      birth_day: birthDate.getDate(),
      death_year: deathDate ? deathDate.getFullYear() : null,
      death_month: deathDate ? deathDate.getMonth() + 1 : null,
      death_day: deathDate ? deathDate.getDate() : null,
      bio: creator.bio || 'Biografía pendiente.',
      notable_works: creator.notable_works || 'Obras notables pendientes.',
      period: creator.period,
      references: '', // Campo opcional, se deja vacío por ahora
      photo_url: creator.photoUrl,
      youtube_link: creator.youtubeLink,
      status: 'PUBLISHED',
      quality: 'A', // Calidad por defecto para datos iniciales
      email: `testuser+${index}@example.com`, // Email único para cada registro
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
}

main()
  .catch((e) => {
    console.error('Error durante el proceso de seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });