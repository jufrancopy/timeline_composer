const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const periods = ['COLONIAL', 'INDEPENDENCIA', 'POSGUERRA', 'MODERNO', 'CONTEMPORANEO'];

const composersData = [
  // COLONIAL
  { first_name: 'Domenico', last_name: 'Zipoli', birth_year: 1688, death_year: 1726, period: 'COLONIAL', mainRole: ['COMPOSER'], bio: 'Misionero jesuita y compositor italiano, figura clave del barroco musical en las reducciones de Paraguay.', notable_works: 'Misa a San Ignacio, Vísperas Solemnes de San Ignacio', email: 'seed@example.com' },
  { first_name: 'Martin', last_name: 'Schmid', birth_year: 1694, death_year: 1772, period: 'COLONIAL', mainRole: ['COMPOSER'], bio: 'Misionero, músico y arquitecto suizo. Dejó un gran legado musical en las misiones de Chiquitos.', notable_works: 'Óperas misionales, música sacra', email: 'seed@example.com' },
  { first_name: 'Juan', last_name: 'Vasen', birth_year: 1672, death_year: 1720, period: 'COLONIAL', mainRole: ['COMPOSER'], bio: 'Compositor y organista flamenco que trabajó en las reducciones jesuíticas del Paraguay.', notable_works: 'Música para órgano y coro', email: 'seed@example.com' },
  
  // INDEPENDENCIA
  { first_name: 'José', last_name: 'de la Cruz Ayala', birth_year: 1805, death_year: 1875, period: 'INDEPENDENCIA', mainRole: ['COMPOSER'], bio: 'Conocido como "Alón", fue un poeta y músico popular, autor de las primeras polcas paraguayas.', notable_works: 'Campamento Cerro León, Mamá Kumandá', email: 'seed@example.com' },
  { first_name: 'Francisco', last_name: 'Solano López', birth_year: 1827, death_year: 1870, period: 'INDEPENDENCIA', mainRole: ['COMPOSER'], bio: 'Aunque más conocido como militar y presidente, fue un gran impulsor de la música y compuso algunas piezas.', notable_works: 'Marcha del Mariscal López', email: 'seed@example.com' },
  { first_name: 'Cantantes', last_name: 'de la Guerra', birth_year: 1865, death_year: 1900, period: 'INDEPENDENCIA', mainRole: ['PERFORMER'], bio: 'Grupo de músicos anónimos que mantuvieron viva la tradición musical durante y después de la Guerra de la Triple Alianza.', notable_works: 'Canciones patrióticas y populares', email: 'seed@example.com' },

  // POSGUERRA
  { first_name: 'Agustín', last_name: 'Pío Barrios', birth_year: 1885, death_year: 1944, period: 'POSGUERRA', mainRole: ['COMPOSER', 'PERFORMER'], bio: 'Conocido como "Mangoré", es el guitarrista y compositor más reconocido de Paraguay a nivel mundial.', notable_works: 'La Catedral, Un sueño en la floresta, Danza Paraguaya', email: 'seed@example.com' },
  { first_name: 'José', last_name: 'Asunción Flores', birth_year: 1904, death_year: 1972, period: 'POSGUERRA', mainRole: ['COMPOSER'], bio: 'Creador del género musical de la Guarania, que revolucionó la música popular paraguaya.', notable_works: 'India, Nde Rendape Ajú, Panambí Verá', email: 'seed@example.com' },
  { first_name: 'Herminio', last_name: 'Giménez', birth_year: 1905, death_year: 1991, period: 'POSGUERRA', mainRole: ['COMPOSER', 'CONDUCTOR'], bio: 'Prolífico compositor y director de orquesta, autor de algunas de las polcas y guaranias más famosas.', notable_works: 'Cerro Corá, Mi oración azul', email: 'seed@example.com' },

  // MODERNO
  { first_name: 'Luis', last_name: 'Alberto del Paraná', birth_year: 1926, death_year: 1974, period: 'MODERNO', mainRole: ['COMPOSER', 'PERFORMER'], bio: 'Cantante, compositor y guitarrista de fama internacional. Lideró el trío "Los Paraguayos".', notable_works: 'A mi tierra, Malagueña, Galopera', email: 'seed@example.com' },
  { first_name: 'Demetrio', last_name: 'Ortiz', birth_year: 1916, death_year: 1975, period: 'MODERNO', mainRole: ['COMPOSER'], bio: 'Compositor de la icónica guarania "Recuerdos de Ypacaraí", conocida en todo el mundo.', notable_works: 'Recuerdos de Ypacaraí, Mis noches sin ti', email: 'seed@example.com' },
  { first_name: 'Mauricio', last_name: 'Cardozo Ocampo', birth_year: 1907, death_year: 1982, period: 'MODERNO', mainRole: ['COMPOSER', 'POET'], bio: 'Figura fundamental de la música paraguaya, autor de la letra y música de innumerables clásicos.', notable_works: 'Galopera, Chokokue purahéi', email: 'seed@example.com' },

  // CONTEMPORANEO
  { first_name: 'Berta', last_name: 'Rojas', birth_year: 1966, death_year: null, period: 'CONTEMPORANEO', mainRole: ['PERFORMER'], bio: 'Guitarrista clásica de renombre mundial, nominada a varios premios Grammy Latinos.', notable_works: 'Interpretaciones de Barrios, álbum "Salsa Roja"', email: 'seed@example.com' },
  { first_name: 'Rolando', last_name: 'Chaparro', birth_year: 1965, death_year: null, period: 'CONTEMPORANEO', mainRole: ['COMPOSER', 'PERFORMER'], bio: 'Referente del rock y el blues en Paraguay, líder de la banda "Krhizya".', notable_works: 'Todo es mentira, Sobrevivir', email: 'seed@example.com' },
  { first_name: 'Lizza', last_name: 'Bogádo', birth_year: 1963, death_year: null, period: 'CONTEMPORANEO', mainRole: ['PERFORMER'], bio: 'Cantante y compositora, una de las voces más destacadas de la música popular contemporánea de Paraguay.', notable_works: 'Paloma blanca, Un solo canto', email: 'seed@example.com' },

  // --- DATOS PARA EFEMÉRIDES (FECHA ACTUAL) ---
  { 
    first_name: 'Efemérides', 
    last_name: 'Nacido Hoy', 
    birth_year: 1955, 
    birth_month: 7, // Julio
    birth_day: 9,   // Día 9
    death_year: null, 
    period: 'CONTEMPORANEO', 
    mainRole: ['COMPOSER'], 
    bio: 'Compositor ficticio nacido en la fecha actual para probar la funcionalidad de efemérides.', 
    notable_works: 'Sinfonía del Día Presente', 
    email: 'seed@example.com' 
  },
  { 
    first_name: 'Aniversario', 
    last_name: 'Fúnebre', 
    birth_year: 1920, 
    death_year: 1988, 
    death_month: 7, // Julio
    death_day: 9,   // Día 9
    period: 'MODERNO', 
    mainRole: ['COMPOSER'], 
    bio: 'Compositor ficticio fallecido en la fecha actual para probar la funcionalidad de efemérides.', 
    notable_works: 'Réquiem del Recuerdo', 
    email: 'seed@example.com' 
  }
];

async function main() {
  console.log('Start seeding...');

  // Borrar datos existentes en el orden correcto para evitar errores de constraint
  await prisma.rating.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.composer.deleteMany({});
  console.log('Deleted existing ratings, comments, and composers.');

  // Crear nuevos compositores
  for (const data of composersData) {
    await prisma.composer.create({
      data: {
        ...data,
        status: 'PUBLISHED', // Publicar directamente para la siembra
        quality: 'A', // Asignar calidad alta por defecto
      },
    });
  }
  console.log(`Created ${composersData.length} composers.`);

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
