const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting database wipe...');

  // Delete records in an order that respects foreign key constraints.

  console.log('Deleting ComentarioPublicacion records...');
  await prisma.comentarioPublicacion.deleteMany({});
  console.log('ComentarioPublicacion records deleted.');

  console.log('Deleting PublicacionInteraccion records...');
  await prisma.publicacionInteraccion.deleteMany({});
  console.log('PublicacionInteraccion records deleted.');

  console.log('Deleting Publicacion records...');
  await prisma.publicacion.deleteMany({});
  console.log('Publicacion records deleted.');

  console.log('Deleting RespuestaAlumno records...');
  await prisma.respuestaAlumno.deleteMany({});
  console.log('RespuestaAlumno records deleted.');

  console.log('Deleting Asistencia records...');
  await prisma.asistencia.deleteMany({});
  console.log('Asistencia records deleted.');

  console.log('Deleting DiaClase records...');
  await prisma.diaClase.deleteMany({});
  console.log('DiaClase records deleted.');

  console.log('Deleting Opcion records...');
  await prisma.opcion.deleteMany({});
  console.log('Opcion records deleted.');

  console.log('Deleting Pregunta records...');
  await prisma.pregunta.deleteMany({});
  console.log('Pregunta records deleted.');

  console.log('Deleting CalificacionEvaluacion records...');
  await prisma.calificacionEvaluacion.deleteMany({});
  console.log('CalificacionEvaluacion records deleted.');

  console.log('Deleting Evaluacion records...');
  await prisma.evaluacion.deleteMany({});
  console.log('Evaluacion records deleted.');

  console.log('Deleting Tarea records...');
  await prisma.tarea.deleteMany({});
  console.log('Tarea records deleted.');

  console.log('Deleting Puntuacion records...');
  await prisma.puntuacion.deleteMany({});
  console.log('Puntuacion records deleted.');

  console.log('Deleting Pago records...');
  await prisma.pago.deleteMany({});
  console.log('Pago records deleted.');

  console.log('Deleting CatedraAlumno records...');
  await prisma.catedraAlumno.deleteMany({});
  console.log('CatedraAlumno records deleted.');

  console.log('Deleting CostoCatedra records...');
  await prisma.costoCatedra.deleteMany({});
  console.log('CostoCatedra records deleted.');

  console.log('Deleting CatedraDiaHorario records...');
  await prisma.catedraDiaHorario.deleteMany({});
  console.log('CatedraDiaHorario records deleted.');

  console.log('Deleting UnidadPlan records...');
  await prisma.unidadPlan.deleteMany({});
  console.log('UnidadPlan records deleted.');

  console.log('Deleting PlanDeClases records...');
  await prisma.planDeClases.deleteMany({});
  console.log('PlanDeClases records deleted.');

  console.log('Deleting UnidadPlan records...');
  await prisma.unidadPlan.deleteMany({});
  console.log('UnidadPlan records deleted.');

  console.log('Deleting PlanDeClases records...');
  await prisma.planDeClases.deleteMany({});
  console.log('PlanDeClases records deleted.');

  console.log('Deleting Catedra records...');
  await prisma.catedra.deleteMany({});
  console.log('Catedra records deleted.');

  console.log('Deleting Alumno records...');
  await prisma.alumno.deleteMany({});
  console.log('Alumno records deleted.');

  console.log('Deleting Docente records...');
  await prisma.docente.deleteMany({});
  console.log('Docente records deleted.');

  console.log('Deleting EditSuggestion records...');
  await prisma.editSuggestion.deleteMany({});
  console.log('EditSuggestion records deleted.');

  console.log('Deleting Comment records...');
  await prisma.comment.deleteMany({});
  console.log('Comment records deleted.');

  console.log('Deleting Rating records...');
  await prisma.rating.deleteMany({});
  console.log('Rating records deleted.');

  console.log('Deleting Composer records...');
  await prisma.composer.deleteMany({});
  console.log('Composer records deleted.');

  console.log('Deleting Otp records...');
  await prisma.otp.deleteMany({});
  console.log('Otp records deleted.');

  console.log('Deleting User records...');
  await prisma.user.deleteMany({});
  console.log('User records deleted.');

  console.log('Database wipe finished successfully.');

  console.log('Resetting all table ID sequences...');
  const tableNames = [
    'ComentarioPublicacion', 'PublicacionInteraccion', 'Publicacion', 'RespuestaAlumno',
    'Asistencia', 'DiaClase', 'Opcion', 'Pregunta', 'CalificacionEvaluacion', 'Evaluacion',
    'Tarea', 'Puntuacion', 'Pago', 'CatedraAlumno', 'CostoCatedra', 'CatedraDiaHorario',
    'UnidadPlan', 'PlanDeClases', 'Catedra', 'Alumno', 'Docente', 'EditSuggestion',
    'Comment', 'Rating', 'Composer', 'Otp', 'User'
  ];

  for (const tableName of tableNames) {
    try {
      await prisma.$executeRawUnsafe(`ALTER SEQUENCE "${tableName}_id_seq" RESTART WITH 1;`);
      console.log(`Sequence for ${tableName} reset.`);
    } catch (error) {
      console.warn(`Could not reset sequence for ${tableName} (might not have an auto-incrementing ID or sequence name differs):`, error.message);
    }
  }
  console.log('All table ID sequences reset.');
}

main()
  .catch((e) => {
    console.error('An error occurred during the database wipe:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('Prisma client disconnected.');
  });
