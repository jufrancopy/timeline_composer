const express = require('express');
const requireAdmin = require('../middlewares/requireAdmin');
const requireDocenteOrAdmin = require('../middlewares/requireDocenteOrAdmin');
const { requireUser } = require('../middlewares/requireUser');
const requireDocente = require('../middlewares/requireDocente');
const { generateQuestionsWithAI } = require('../ai');

const router = express.Router();
let prisma;
let transporter;

// Functions to set the Prisma client and Nodemailer transporter
const setPrismaClient = (client) => {
  prisma = client;
};

const setTransporter = (t) => {
  transporter = t;
};



// 1. AI Question Generation (Admin Only)
router.post('/admin/catedras/:catedraId/generate-evaluation', requireAdmin, async (req, res) => {
  try {
    const catedraId = parseInt(req.params.catedraId, 10);
    const { topic, numberOfQuestions, numberOfOptions } = req.body;

    if (!topic || !numberOfQuestions || !numberOfOptions) {
      return res.status(400).json({ error: 'Topic, number of questions, and number of options are required.' });
    }

    const catedra = await prisma.catedra.findUnique({ where: { id: catedraId } });
    if (!catedra) {
      return res.status(404).json({ error: 'Cátedra not found.' });
    }

    // Simulate AI generation of questions
    const generatedQuestions = await generateQuestionsWithAI(topic, numberOfQuestions, numberOfOptions);

    let evaluationTitle = topic;
    // Attempt to remove common prompt prefixes and trailing dot
    evaluationTitle = evaluationTitle.replace(/^Genera preguntas (de seleccion multiple |de selección múltiple )?sobre /i, '');
    evaluationTitle = evaluationTitle.replace(/^Crea una evaluación sobre /i, '');
    evaluationTitle = evaluationTitle.replace(/\.$/, '');

    // Create Evaluation record
    const newEvaluation = await prisma.evaluacion.create({
      data: {
        titulo: `Evaluación de ${evaluationTitle} para ${catedra.nombre}`,
        catedraId: catedraId,
        isMaster: true,
        // fecha_limite se establecerá al asignar la evaluación
        preguntas: {
          create: generatedQuestions.map((q, index) => ({
            texto: q.texto,
            orden: index, // Asignar el orden basado en el índice
            opciones: {
              create: q.opciones.map(o => ({ texto: o.texto, es_correcta: o.es_correcta })),
            },
          })),
        },
      },
      include: { preguntas: { include: { opciones: true } } },
    });

    // Create a Publicacion for the EvaluacionMaestra, not visible to students initially
    const newPublicacion = await prisma.publicacion.create({
      data: {
        titulo: `Nueva Evaluación Maestra: ${newEvaluation.titulo}`,
        contenido: `Se ha creado una nueva evaluación maestra. Podrás asignarla a tus alumnos en cualquier momento.`,
        tipo: 'EVALUACION',
        catedraId: catedraId,
        autorDocenteId: req.user.docenteId, // Asume que el docenteId está en req.user
        evaluacionMaestraId: newEvaluation.id,
        visibleToStudents: false, // Por defecto, no visible para los alumnos
      },
    });



    res.status(201).json({ message: 'Evaluación maestra generada y publicada en el tablón del docente exitosamente', evaluation: newEvaluation });
  } catch (error) {
    console.error('Error generating evaluation:', error);
    console.error('Detailed error generating evaluation:', error);
    res.status(500).json({ error: 'Error generating evaluation', details: error.message, stack: error.stack });
  }
});



// 8. Create a new Tarea for a Catedra (Admin Only)
router.post('/admin/catedras/:catedraId/tareas', requireAdmin, async (req, res) => {
  try {
    const catedraId = parseInt(req.params.catedraId, 10);
    const { titulo, descripcion, fecha_entrega, puntos_posibles, multimedia_path } = req.body;

    if (!titulo || !descripcion || !puntos_posibles) {
      return res.status(400).json({ error: 'Titulo, descripción y puntos posibles son requeridos.' });
    }

    // Fetch all students and composers enrolled in the catedra
    const enrollments = await prisma.catedraAlumno.findMany({
      where: { catedraId: catedraId },
      include: {
        alumno: true,
        composer: true,
      },
    });

    if (enrollments.length === 0) {
      return res.status(404).json({ error: 'No hay alumnos o compositores inscritos en esta cátedra para asignar la tarea.' });
    }

    const createdTasks = [];
    const catedraDetails = await prisma.catedra.findUnique({
      where: { id: catedraId },
      select: { nombre: true, anio: true, institucion: true },
    });

    if (!catedraDetails) {
      return res.status(404).json({ error: 'Cátedra no encontrada.' });
    }

    const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const tasksLink = `${frontendBaseUrl}/my-contributions`;

    for (const enrollment of enrollments) {
      let studentIdToAssign = null;
      let recipientEmail = null;
      let recipientName = 'Alumno/Colaborador';

      if (enrollment.alumno) {
        studentIdToAssign = enrollment.alumno.id;
        recipientEmail = enrollment.alumno.email;
        recipientName = `${enrollment.alumno.nombre} ${enrollment.alumno.apellido}`;
      } else if (enrollment.composer) {
        // Assuming composers that are enrolled are considered 'students' for tasks
        // The composerId is stored in catedraAlumno, but tasks are related to alumnoId
        // This needs a decision: either tasks can be assigned to composerId, or we map composers to a dummy alumnoId, or prevent assigning tasks to composers.
        // For now, let's assume only actual Alumnos get tasks.
        console.warn(`[TAREA] Skipping task assignment for composer ${enrollment.composer.id} as tasks are linked to alumnoId.`);
        continue; // Skip if it's a composer, until explicit task-to-composer logic is added
      }

      if (!studentIdToAssign || !recipientEmail) {
        console.warn(`[TAREA] Skipping task assignment for an enrollment without a valid alumnoId or email.`);
        continue;
      }

      const nuevaTarea = await prisma.tarea.create({
        data: {
          titulo,
          descripcion,
          fecha_entrega: fecha_entrega ? new Date(fecha_entrega) : null,
          puntos_posibles: parseInt(puntos_posibles, 10),
          catedraId,
          alumnoId: studentIdToAssign,
          multimedia_path: multimedia_path || null,
        },
      });
      createdTasks.push(nuevaTarea);

      // Send email notification
      const mailOptions = {
        from: `"Aportes HMPY" <${process.env.EMAIL_USER}>`,
        to: recipientEmail,
        subject: `Nueva tarea asignada: ${nuevaTarea.titulo}`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #5a189a; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">Nueva Tarea Asignada</h1>
            </div>
            <div style="padding: 20px;">
              <p>Hola ${recipientName},</p>
              <p>Se te ha asignado una nueva tarea en la cátedra <strong>${catedraDetails.nombre} (${catedraDetails.institucion} - ${catedraDetails.anio})</strong>:</p>
              
              <h3 style="color: #333;">Detalles de la Tarea:</h3>
              <p><strong>Título:</strong> ${nuevaTarea.titulo}</p>
              <p><strong>Descripción:</strong> ${nuevaTarea.descripcion.substring(0, 150)}...</p>
              <p><strong>Puntos Posibles:</strong> ${nuevaTarea.puntos_posibles}</p>
              ${nuevaTarea.fecha_entrega ? `<p><strong>Fecha de Entrega:</strong> ${new Date(nuevaTarea.fecha_entrega).toLocaleDateString()}</p>` : ''}
              <p style="margin-top: 20px;">Puedes ver y gestionar tus tareas en tu panel de contribuciones. Haz clic en el botón de abajo:</p>
              <p style="text-align: center; margin-top: 30px;">
                <a href="${tasksLink}" style="display: inline-block; padding: 12px 25px; background-color: #5a189a; color: white; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">
                  Ver Mis Tareas
                </a>
              </p>
              <p style="margin-top: 20px; font-size: 14px; color: #666;">
                Si tienes alguna duda, no dudes en contactar a tu instructor.
              </p>
            </div>
            <div style="background-color: #f8f8f8; padding: 15px; text-align: center; font-size: 12px; color: #999;">
              Este es un correo automático, por favor no respondas a este mensaje.
            </div>
          </div>
        `,
      };

      transporter.sendMail(mailOptions)
        .then((info) => console.log(`[TAREA] Correo de tarea enviado a ${recipientEmail} - MessageID: ${info.messageId}`))
        .catch((error) => console.error(`[TAREA] Error al enviar correo de tarea a ${recipientEmail}:`, error));
    }

    res.status(201).json({ message: `Tareas creadas y asignadas a ${createdTasks.length} alumnos.`, tasks: createdTasks });
  } catch (error) {
    console.error('Error creating tarea:', error);
    res.status(500).json({ error: 'Error al crear la tarea', details: error.message });
  }
});

// Ruta para obtener evaluaciones de una Catedra
router.get('/docente/catedra/:catedraId/evaluaciones', requireDocente, async (req, res) => {
  const { catedraId } = req.params;

  try {
    const evaluaciones = await prisma.evaluacion.findMany({
      where: {
        catedraId: parseInt(catedraId),
      },
      select: {
        id: true,
        titulo: true,
        fecha_limite: true,
        Pregunta: {
          select: {
            puntos: true, // Asumiendo que Pregunta tiene un campo 'puntos'
          },
        },
      },
    });

    const evaluacionesConPuntosTotales = evaluaciones.map(evaluacion => {
      const puntosTotales = evaluacion.Pregunta.reduce((sum, pregunta) => sum + (pregunta.puntos || 0), 0);
      return { ...evaluacion, puntosTotales, Pregunta: undefined }; // Eliminar Pregunta del objeto final
    });

    res.status(200).json(evaluacionesConPuntosTotales);
  } catch (error) {
    console.error('Error al obtener evaluaciones:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});
// 2. Get Evaluations for a Catedra
router.get('/catedras/:catedraId/evaluaciones', async (req, res) => {
  try {
    const catedraId = parseInt(req.params.catedraId, 10);

    const evaluaciones = await prisma.evaluacion.findMany({
      where: { catedraId: catedraId },
      orderBy: { created_at: 'desc' },
      include: {
        _count: { select: { preguntas: true } },
      },
    });

    res.json(evaluaciones);
  } catch (error) {
    console.error('Error getting evaluations for catedra:', error);
    res.status(500).json({ error: 'Error al obtener evaluaciones de la cátedra', details: error.message });
  }
});

// 3. Get a Specific Evaluation (for student to take - without correct answers)
router.get('/alumnos/evaluaciones/:asignacionId', requireUser, async (req, res) => {
  try {
    const asignacionId = parseInt(req.params.asignacionId, 10);
    const { alumnoId } = req.user;

    if (!alumnoId) {
      return res.status(403).json({ error: 'No autorizado: Información de alumno no disponible.' });
    }

    // Find the assignment for the specific student
    const assignment = await prisma.evaluacionAsignacion.findUnique({
      where: { id: asignacionId, alumnoId: alumnoId },
      include: {
        evaluacion: {
          include: {
            catedra: true, // Incluir la información de la cátedra de la evaluación maestra
            preguntas: {
              include: {
                opciones: { select: { id: true, texto: true } }, // No enviar 'es_correcta'
              },
            },
          },
        },
      },
    });

    if (!assignment) {
      return res.status(404).json({ error: 'Asignación de evaluación no encontrada o no pertenece al alumno.' });
    }

    // Return the master evaluation details for the student to take
    res.json({
      asignacionId: assignment.id,
      estadoAsignacion: assignment.estado,
      fecha_entrega: assignment.fecha_entrega,
      evaluacion: assignment.evaluacion,
    });
  } catch (error) {
    console.error('Error getting evaluation for student:', error);
    res.status(500).json({ error: 'Error al obtener la evaluación', details: error.message });
  }
});

// Get all evaluations for the logged-in student
router.get('/alumnos/evaluaciones', requireUser, async (req, res) => {
  try {
    const { alumnoId } = req.user;

    if (!alumnoId) {
      return res.status(403).json({ error: 'No autorizado: Solo los alumnos pueden ver sus evaluaciones.' });
    }

    const assignments = await prisma.evaluacionAsignacion.findMany({
      where: { alumnoId: alumnoId },
      include: {
        evaluacion: {
          include: {
            catedra: { select: { nombre: true } },
          },
        },
        calificacion: true,
      },
      orderBy: { created_at: 'desc' },
    });

    const evaluationsWithStatus = assignments.map(assignment => ({
      id: assignment.evaluacion.id,
      titulo: assignment.evaluacion.titulo,
      created_at: assignment.evaluacion.created_at,
      catedra: assignment.evaluacion.catedra,
      estadoAsignacion: assignment.estado,
      fecha_entrega: assignment.fecha_entrega,
      realizada: assignment.calificacion !== null,
      asignacionId: assignment.id, // ID de la asignación
    }));

    res.json(evaluationsWithStatus);
  } catch (error) {
    console.error('Error getting student evaluations:', error);
    res.status(500).json({ error: 'Error al obtener las evaluaciones del alumno', details: error.message });
  }
});

// 4. Submit Evaluation Answers (Student)
router.post('/evaluaciones/:asignacionId/submit', requireUser, async (req, res) => {
  const asignacionId = parseInt(req.params.asignacionId, 10);
  console.log(`[SUBMIT EVAL] Endpoint hit. asignacionId: ${asignacionId}, alumnoId from token: ${req.user?.alumnoId}`);
  try {
    const { alumnoId } = req.user; // Obtener alumnoId del token JWT
    const { respuestas } = req.body; // Array de { preguntaId: Int, opcionElegidaId: Int }

    console.log(`[SUBMIT EVAL] Processing submission. alumnoId: ${alumnoId}, respuestas length: ${respuestas?.length}`);
    if (!alumnoId) {
      console.error('[SUBMIT EVAL] No alumnoId found in request user object.');
      return res.status(403).json({ error: 'No autorizado: Solo los alumnos pueden enviar evaluaciones.' });
    }

    if (!Array.isArray(respuestas) || respuestas.length === 0) {
      console.error('[SUBMIT EVAL] Invalid or empty respuestas array provided.');
      return res.status(400).json({ error: 'Respuestas no proporcionadas o en formato incorrecto.' });
    }

    console.log(`[SUBMIT EVAL] Fetching assignment details for ID: ${asignacionId}`);
    const assignment = await prisma.evaluacionAsignacion.findUnique({
      where: { id: asignacionId },
      include: {
        alumno: true,
        evaluacion: {
          include: {
            catedra: true,
            preguntas: { include: { opciones: true } },
          },
        },
      },
    });

    if (!assignment) {
      console.error(`[SUBMIT EVAL] Evaluation Assignment with ID ${asignacionId} not found.`);
      return res.status(404).json({ error: 'Asignación de evaluación no encontrada.' });
    }
    const evaluation = assignment.evaluacion;
    if (!evaluation) {
      console.error(`[SUBMIT EVAL] Master Evaluation not found for assignment ID ${asignacionId}.`);
      return res.status(404).json({ error: 'Evaluación Maestra no encontrada para la asignación.' });
    }
    console.log(`[SUBMIT EVAL] Found assignment for evaluation: ${evaluation.titulo}, catedraId: ${evaluation.catedraId}`);

    let correctAnswersCount = 0;
    const studentResponses = [];

    console.log(`[SUBMIT EVAL] Processing ${respuestas.length} submitted answers.`);
    for (const respuesta of respuestas) {
      const { preguntaId, opcionElegidaId } = respuesta;
      console.log(`[SUBMIT EVAL] Checking answer: preguntaId=${preguntaId}, opcionElegidaId=${opcionElegidaId}`);
      const pregunta = evaluation.preguntas.find(p => p.id === preguntaId);

      if (pregunta) {
        const opcion = pregunta.opciones.find(o => o.id === opcionElegidaId);
        if (opcion) {
          console.log(`[SUBMIT EVAL] Found opcion. Text: ${opcion.texto}, es_correcta: ${opcion.es_correcta}`);
          if (opcion.es_correcta) {
            correctAnswersCount++;
            console.log(`[SUBMIT EVAL] Correct answer found. Incrementing count to ${correctAnswersCount}`);
          }
        } else {
          console.warn(`[SUBMIT EVAL] Opcion with ID ${opcionElegidaId} not found for preguntaId ${preguntaId}`);
        }
        studentResponses.push({
          alumnoId,
          preguntaId,
          opcionElegidaId,
        });
      } else {
        console.warn(`[SUBMIT EVAL] Pregunta with ID ${preguntaId} not found in evaluation ${evaluationId}`);
      }
    }

    // Save student's responses
    console.log(`[SUBMIT EVAL] Saving ${studentResponses.length} student responses.`);
    await prisma.respuestaAlumno.createMany({
      data: studentResponses,
      skipDuplicates: true, // Prevent duplicate submissions for the same question by the same student
    });

    // Calculate total points for the evaluation
    const totalQuestions = evaluation.preguntas.length;
    const score = totalQuestions > 0 ? Math.round((correctAnswersCount / totalQuestions) * 100) : 0; // Score out of 100
    console.log(`[SUBMIT EVAL] Calculated score: ${score}% (${correctAnswersCount}/${totalQuestions})`);

    // Save evaluation score for the student
    console.log(`[SUBMIT EVAL] Upserting CalificacionEvaluacion for alumnoId: ${alumnoId}, asignacionId: ${asignacionId}, puntos: ${score}`);
    await prisma.calificacionEvaluacion.upsert({
      where: { evaluacionAsignacionId: asignacionId }, // Usar asignacionId como unique
      update: { puntos: score },
      create: {
        alumnoId,
        evaluacionAsignacionId: asignacionId,
        puntos: score,
      },
    });

    // Update the assignment status to REALIZADA
    await prisma.evaluacionAsignacion.update({
      where: { id: asignacionId },
      data: { estado: 'REALIZADA' },
    });

    // Add points to general Puntuacion for the Catedra
    console.log(`[SUBMIT EVAL] Creating Puntuacion record: alumnoId: ${alumnoId}, catedraId: ${evaluation.catedraId}, puntos: ${score}`);
    await prisma.puntuacion.create({
      data: {
        alumnoId,
        catedraId: evaluation.catedraId,
        puntos: score, // Sumar los puntos obtenidos en la evaluación
        motivo: `Calificación de evaluación: ${evaluation.titulo}`,
        tipo: 'EVALUACION',
      },
    });

    console.log(`[SUBMIT EVAL] Submission processed successfully. Sending 200 response with score: ${score}`);
    res.status(200).json({ message: 'Respuestas guardadas y evaluación calificada.', score, correctAnswersCount, totalQuestions });
  } catch (error) {
    console.error('[SUBMIT EVAL] Error submitting evaluation:', error);
    console.error('[SUBMIT EVAL] Detailed error submitting evaluation:', error.message);
    console.error('[SUBMIT EVAL] Stack trace:', error.stack);
    res.status(500).json({ error: 'Error al enviar la evaluación', details: error.message });
  }
});

// 5. Get Evaluation Results (Student - with correct/incorrect answers)
router.get('/evaluaciones/:evaluacionId/results', requireUser, async (req, res) => {
  try {
    const evaluacionId = parseInt(req.params.evaluacionId, 10);
    const { alumnoId } = req.user;

    if (!alumnoId) {
      return res.status(403).json({ error: 'No autorizado: Información de alumno no disponible.' });
    }

    // Buscar la asignación de evaluación para este alumno y esta evaluación maestra
    const assignment = await prisma.evaluacionAsignacion.findFirst({
      where: { evaluacionId: evaluacionId, alumnoId: alumnoId },
      include: {
        evaluacion: {
          include: { preguntas: { include: { opciones: true } } },
        },
        calificacion: true,
      },
    });

    if (!assignment) {
      return res.status(404).json({ error: 'Asignación de evaluación no encontrada para este alumno y evaluación.' });
    }

    const evaluation = assignment.evaluacion;
    const asignacionId = assignment.id; // Obtenemos el asignacionId de la asignación encontrada
    const studentResponses = await prisma.respuestaAlumno.findMany({
      where: { alumnoId, pregunta: { evaluacionId: evaluation.id } },
      include: { opcion_elegida: true },
    });

    let correctAnswersCount = 0;
    const totalQuestions = evaluation.preguntas.length;

    const formattedResults = evaluation.preguntas.map(pregunta => {
      const studentAnswer = studentResponses.find(r => r.preguntaId === pregunta.id);
      const correctOption = pregunta.opciones.find(o => o.es_correcta === true);

      // Check if the student's answer is correct
      if (studentAnswer && studentAnswer.opcion_elegida.es_correcta) {
        correctAnswersCount++;
      }

      return {
        id: pregunta.id,
        text: pregunta.texto,
        options: pregunta.opciones.map(op => ({
          id: op.id,
          text: op.texto,
          isCorrect: op.es_correcta,
        })),
        correctAnswerId: correctOption ? correctOption.id : null,
        alumnoAnswerId: studentAnswer ? studentAnswer.opcionElegidaId : null,
      };
    });

    const studentScore = assignment.calificacion?.puntos || 0;

    res.json({
      evaluationTitle: evaluation.titulo,
      score: studentScore,
      totalPoints: 100, // Assuming total points is 100 for percentage score
      correctAnswersCount,
      totalQuestions,
      questions: formattedResults,
    });
  } catch (error) {
    console.error('Error getting evaluation results:', error);
    res.status(500).json({ error: 'Error al obtener los resultados de la evaluación', details: error.message });
  }
});

// 6. Admin View All Evaluation Results for a Catedra
// Admin: Get all pending suggestions
router.get('/admin/suggestions', requireAdmin, async (req, res) => {
  try {
    const pendingSuggestions = await prisma.editSuggestion.findMany({
      where: {
        status: 'PENDIENTE',
      },
      include: {
        composer: true, // The original composer being edited (the one associated with composerId)
      },
      orderBy: {
        created_at: 'desc',
      },
    });
    res.json(pendingSuggestions);
  } catch (error) {
    console.error('Error fetching pending suggestions:', error);
    res.status(500).json({ error: 'Error al obtener sugerencias pendientes', details: error.message });
  }
});

router.get('/admin/catedras/:catedraId/evaluation-results', requireAdmin, async (req, res) => {
  try {
    const catedraId = parseInt(req.params.catedraId, 10);

    const evaluationsWithResults = await prisma.evaluacion.findMany({
      where: { catedraId: catedraId },
      include: {
        catedra: { select: { nombre: true, anio: true } },
        calificaciones: {
          include: {
            alumno: { select: { id: true, nombre: true, apellido: true, email: true } },
          },
          orderBy: { created_at: 'desc' },
        },
        preguntas: { include: { opciones: true } }, // Include questions and options for detailed review
      },
      orderBy: { created_at: 'desc' },
    });

    res.json(evaluationsWithResults);
  } catch (error) {
    console.error('Error getting admin evaluation results:', error);
    res.status(500).json({ error: 'Error al obtener los resultados de evaluaciones para administradores', details: error.message });
  }
});

// Obtener una cátedra por ID
router.get('/catedras/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const catedra = await prisma.catedra.findUnique({
      where: { id: parseInt(id) },
      include: {
        alumnos: {
          include: {
            alumno: true,
            composer: true,
          },
        },
        tareasMaestras: {
          include: {
            _count: {
              select: { asignaciones: true }
            }
          }
        }, // Cambiado para incluir el conteo de asignaciones
        evaluaciones: {
          include: {
            preguntas: {
              include: {
                opciones: true,
              },
            },
            publicacion: true, // Incluir la publicación de la evaluación maestra
            asignaciones: {
              include: { alumno: true, publicacion: true, calificacion: true }, // Incluir asignaciones y sus publicaciones/calificaciones
            },
          },
        },
      },
    });

    if (!catedra) {
      return res.status(404).json({ error: 'Cátedra no encontrada' });
    }

    res.json(catedra);
  } catch (error) {
    console.error('Error al obtener cátedra por ID:', error);
    res.status(500).json({ error: 'Error al obtener la cátedra', details: error.message });
  }
});



// 7. Delete Master Evaluation (Admin Only)
router.delete('/evaluaciones/maestra/:evaluationMaestraId', requireDocenteOrAdmin, async (req, res) => {
  try {
    const evaluationMaestraId = parseInt(req.params.evaluationMaestraId, 10);

    await prisma.$transaction(async (tx) => {
      // Find the master evaluation and its associated publications and assignments
      const evaluationToDelete = await tx.evaluacion.findUnique({
        where: { id: evaluationMaestraId },
        include: {
          publicacion: true,
          asignaciones: {
            include: {
              publicacion: true,
              calificacion: true,
            },
          },
          preguntas: { select: { id: true } },
        },
      });

      if (!evaluationToDelete) {
        throw new Error('Evaluación Maestra no encontrada.');
      }

      // 1. Delete associated Publicaciones for individual assignments
      for (const assignment of evaluationToDelete.asignaciones) {
        if (assignment.publicacionId) {
          await tx.publicacion.delete({
            where: { id: assignment.publicacionId },
          });
        }
      }

      // 2. Delete associated CalificacionEvaluacion records via assignments
      const asignacionIds = evaluationToDelete.asignaciones.map(a => a.id);
      if (asignacionIds.length > 0) {
        await tx.calificacionEvaluacion.deleteMany({
          where: { evaluacionAsignacionId: { in: asignacionIds } },
        });
      }

      // 3. Delete associated RespuestaAlumno records (linked to master evaluation questions)
      const preguntaIds = evaluationToDelete.preguntas.map(p => p.id);
      if (preguntaIds.length > 0) {
        await tx.respuestaAlumno.deleteMany({
          where: { preguntaId: { in: preguntaIds } },
        });
      }

      // 4. Delete associated EvaluacionAsignacion records
      await tx.evaluacionAsignacion.deleteMany({
        where: { evaluacionId: evaluationMaestraId },
      });

      // 5. Delete associated Publicacion for the master evaluation itself
      if (evaluationToDelete.publicacion?.id) {
        await tx.publicacion.delete({
          where: { evaluacionMaestraId: evaluationMaestraId },
        });
      }

      // 6. Delete associated Opcion records
      await tx.opcion.deleteMany({
        where: {
          pregunta: {
            evaluacionId: evaluationMaestraId,
          },
        },
      });

      // 7. Delete associated Pregunta records
      await tx.pregunta.deleteMany({
        where: { evaluacionId: evaluationMaestraId },
      });

      // 8. Delete the Master Evaluation record itself
      await tx.evaluacion.delete({
        where: { id: evaluationMaestraId },
      });
    });

    res.status(200).json({ message: 'Evaluación Maestra y todos los registros asociados eliminados exitosamente.' });
  } catch (error) {
    console.error('Error deleting master evaluation:', error);
    res.status(500).json({ error: 'Error al eliminar la evaluación maestra', details: error.message });
  }
});

router.delete('/catedras/:id', requireAdmin, async (req, res) => {
  try {
    const catedraId = parseInt(req.params.id, 10);

    // Start a transaction to ensure all related records are deleted
    await prisma.$transaction(async (tx) => {
      // 1. Delete Puntuacion records associated with this catedra
      await tx.puntuacion.deleteMany({
        where: { catedraId: catedraId },
      });

      // 2. Delete CalificacionEvaluacion records linked to evaluations of this catedra
      const evaluationAssignmentIds = (await tx.evaluacionAsignacion.findMany({
        where: { evaluacion: { catedraId: catedraId } },
        select: { id: true },
      })).map(ea => ea.id);

      if (evaluationAssignmentIds.length > 0) {
        await tx.calificacionEvaluacion.deleteMany({
          where: { evaluacionAsignacionId: { in: evaluationAssignmentIds } },
        });
      }

      // 3. Delete RespuestaAlumno records linked to questions of evaluations of this catedra
      const evaluationMaestraIds = (await tx.evaluacion.findMany({
        where: { catedraId: catedraId },
        select: { id: true },
      })).map(e => e.id);

      const preguntaIds = (await tx.pregunta.findMany({
        where: { evaluacionId: { in: evaluationMaestraIds } },
        select: { id: true },
      })).map(p => p.id);

      if (preguntaIds.length > 0) {
        await tx.respuestaAlumno.deleteMany({
          where: { preguntaId: { in: preguntaIds } },
        });
      }

      // 4. Delete Publicacion records linked to EvaluacionAsignacion of this catedra
      await tx.publicacion.deleteMany({
        where: {
          catedraId: catedraId,
          evaluacionAsignacion: { isNot: null },
        },
      });

      // 5. Delete EvaluacionAsignacion records for this catedra
      await tx.evaluacionAsignacion.deleteMany({
        where: { evaluacion: { catedraId: catedraId } },
      });

      // 6. Delete Opcion records linked to questions of evaluations of this catedra
      if (preguntaIds.length > 0) {
        await tx.opcion.deleteMany({
          where: { preguntaId: { in: preguntaIds } },
        });
      }

      // 7. Delete Pregunta records linked to evaluations of this catedra
      if (evaluationMaestraIds.length > 0) {
        await tx.pregunta.deleteMany({
          where: { evaluacionId: { in: evaluationMaestraIds } },
        });
      }

      // 8. Delete Publicacion records linked to EvaluacionMaestra of this catedra
      await tx.publicacion.deleteMany({
        where: {
          catedraId: catedraId,
          evaluacionMaestra: { isNot: null },
        },
      });

      // 9. Delete Evaluacion records for this catedra (Master Evaluations)
      await tx.evaluacion.deleteMany({
        where: { catedraId: catedraId },
      });

      // 7. Delete TareaAsignacion records for this catedra
      const tareaMaestraIds = (await tx.tareaMaestra.findMany({
        where: { catedraId: catedraId },
        select: { id: true },
      })).map(tm => tm.id);

      if (tareaMaestraIds.length > 0) {
        await tx.tareaAsignacion.deleteMany({
          where: { tareaMaestraId: { in: tareaMaestraIds } },
        });
      }

      // 8. Delete TareaMaestra records for this catedra
      await tx.tareaMaestra.deleteMany({
        where: { catedraId: catedraId },
      });

      // 8. Delete Asistencia records associated with DiaClase for this catedra
      const diaClaseIds = (await tx.diaClase.findMany({
        where: { catedraId: catedraId },
        select: { id: true },
      })).map(dc => dc.id);

      if (diaClaseIds.length > 0) {
        await tx.asistencia.deleteMany({
          where: { diaClaseId: { in: diaClaseIds } },
        });
      }

      // 9. Delete DiaClase records for this catedra
      await tx.diaClase.deleteMany({
        where: { catedraId: catedraId },
      });

      // 10. Delete CatedraDiaHorario records for this catedra
      await tx.catedraDiaHorario.deleteMany({
        where: { catedraId: catedraId },
      });

      // 11. Delete CostoCatedra record for this catedra
      await tx.costoCatedra.deleteMany({
        where: { catedraId: catedraId },
      });

      // 12. Delete CatedraAlumno records for this catedra
      await tx.catedraAlumno.deleteMany({
        where: { catedraId: catedraId },
      });

      // 13. Finally, delete the Catedra itself
      await tx.catedra.delete({
        where: { id: catedraId },
      });
    });

    res.status(200).json({ message: 'Cátedra y todos los registros asociados eliminados exitosamente.' });
  } catch (error) {
    console.error('Error deleting catedra:', error);
    res.status(500).json({ error: 'Error al eliminar la cátedra', details: error.message });
  }
});

// 8. Docente Edits Student Evaluation Answers (Docente/Admin Only)
router.put('/docente/evaluaciones/asignacion/:asignacionId/respuestas', requireDocenteOrAdmin, async (req, res) => {
  const asignacionId = parseInt(req.params.asignacionId, 10);
  const { respuestas, studentId } = req.body; // Array de { preguntaId: Int, opcionElegidaId: Int }, studentId: Int
  const docenteId = req.user.docenteId; // Obtenemos el ID del docente del token

  if (!studentId) {
    return res.status(400).json({ error: 'studentId es requerido en el body.' });
  }
  const parsedStudentId = parseInt(studentId, 10);
  if (isNaN(parsedStudentId)) {
    return res.status(400).json({ error: 'studentId debe ser un número entero válido.' });
  }

  console.log(`[DOCENTE EDIT EVAL] Endpoint hit. asignacionId: ${asignacionId}, docenteId: ${docenteId}, respuestas length: ${respuestas?.length}`);

  try {
    if (!respuestas || !Array.isArray(respuestas) || respuestas.length === 0) {
      return res.status(400).json({ error: 'Respuestas no proporcionadas o en formato incorrecto.' });
    }

    await prisma.$transaction(async (tx) => {
      console.log(`[DOCENTE EDIT EVAL] Attempting to find evaluation assignment with ID: ${asignacionId}`);
      // 1. Verificar la asignación y obtener detalles de la evaluación
      const assignment = await tx.evaluacionAsignacion.findUnique({
        where: { id: asignacionId },
        include: {
          Evaluacion: {
            include: {
              Catedra: true,
              Pregunta: { include: { Opcion: true } },
            },
          },
          Alumno: true,
          CalificacionEvaluacion: true,
        },
      });

      if (!assignment) {
        console.warn(`[DOCENTE EDIT EVAL] Asignación con ID ${asignacionId} no encontrada.`);
        return res.status(404).json({ error: 'Asignación de evaluación no encontrada.' });
      }
      console.log(`[DOCENTE EDIT EVAL] Asignación encontrada (ID: ${asignacionId}):`, JSON.stringify(assignment, null, 2));
      const evaluation = assignment.Evaluacion;
      const alumnoId = assignment.alumnoId;
      const catedraId = evaluation.catedraId;

      // 2. Verificar que el docente pertenece a la cátedra de la evaluación (si es docente)
      if (req.user.role === 'DOCENTE') {
        const docenteCatedra = await tx.catedraDocente.findUnique({
          where: {
            catedraId_docenteId: {
              catedraId: catedraId,
              docenteId: docenteId,
            },
          },
        });
        if (!docenteCatedra) {
          throw new Error('No autorizado: El docente no está asignado a esta cátedra.');
        }
      }

      // 3. Eliminar respuestas anteriores del alumno para las preguntas que se van a editar
      const preguntaIdsToUpdate = respuestas.map(r => r.questionId).filter(id => id !== undefined && id !== null);
      console.log(`[DOCENTE EDIT EVAL] studentId for deleteMany: ${req.body.studentId}`);
      console.log(`[DOCENTE EDIT EVAL] preguntaIdsToUpdate for deleteMany: ${JSON.stringify(preguntaIdsToUpdate)}`);
      if (preguntaIdsToUpdate.length > 0) {
        await tx.respuestaAlumno.deleteMany({
          where: {
            alumnoId: parsedStudentId,
            preguntaId: { in: preguntaIdsToUpdate },
          },
        });
      }

      // 4. Guardar las nuevas respuestas del docente
      const newStudentResponses = [];
      for (const respuesta of respuestas) {
        const { questionId, answerId } = respuesta;
        if (!evaluation || !evaluation.Pregunta) {
          console.error(`[DOCENTE EDIT EVAL] Evaluation o evaluation.Pregunta es indefinido. Evaluation Assignment ID: ${asignacionId}`);
          return res.status(500).json({ message: 'Error: Evaluación o preguntas de la evaluación no encontradas.' });
        }
        const pregunta = evaluation.Pregunta.find(p => p.id === questionId);

        if (!pregunta) {
          console.warn(`[DOCENTE EDIT EVAL] Pregunta con ID ${questionId} no encontrada en la evaluación.`);
          continue;
        }

        const opcion = pregunta.Opcion.find(o => o.id === answerId);
        if (!opcion) {
          console.warn(`[DOCENTE EDIT EVAL] Opción con ID ${answerId} no encontrada para la pregunta ${questionId}.`);
          continue;
        }

        newStudentResponses.push({
          alumnoId: parsedStudentId,
          preguntaId: questionId,
          opcionElegidaId: answerId,
        });
      }

      if (newStudentResponses.length > 0) {
        console.log(`[DOCENTE EDIT EVAL] newStudentResponses for createMany: ${JSON.stringify(newStudentResponses)}`);
        await tx.respuestaAlumno.createMany({
          data: newStudentResponses,
        });
      }

      // 5. Recalcular la calificación de la evaluación
      const allStudentResponses = await tx.respuestaAlumno.findMany({
        where: { alumnoId: parsedStudentId, Pregunta: { evaluacionId: evaluation.id } },
        include: { Opcion: true },
      });

      let correctAnswersCount = 0;
      for (const resAlumno of allStudentResponses) {
        if (resAlumno.Opcion?.es_correcta) {
          correctAnswersCount++;
        }
      }

      const totalQuestions = evaluation.Pregunta.length;
      const newScore = correctAnswersCount;

      // 6. Actualizar la calificación en CalificacionEvaluacion
      await tx.calificacionEvaluacion.upsert({
        where: { evaluacionAsignacionId: asignacionId },
        update: { puntos: newScore },
        create: {
          alumnoId,
          evaluacionAsignacionId: asignacionId,
          puntos: newScore,
        },
      });

      // 7. Actualizar el estado de la asignación a 'REALIZADA' si aún no lo está (o mantenerlo)
      await tx.evaluacionAsignacion.update({
        where: { id: asignacionId },
        data: { estado: 'REALIZADA' }, // Asegurar que el estado sea REALIZADA después de la edición
      });

      // 8. Actualizar Puntuacion general del alumno en la Catedra
      // Necesitamos encontrar el registro de Puntuacion anterior para la evaluación y actualizarlo o crear uno nuevo.
      // O, para simplificar y asegurar consistencia, eliminar el anterior y crear uno nuevo para esta evaluación.
      await tx.puntuacion.deleteMany({
        where: {
          alumnoId: alumnoId,
          catedraId: catedraId,
          motivo: `Calificación de evaluación: ${evaluation.titulo}`,
          tipo: 'EVALUACION',
        },
      });

      await tx.puntuacion.create({
        data: {
          alumnoId,
          catedraId: catedraId,
          puntos: newScore,
          motivo: `Calificación de evaluación: ${evaluation.titulo}`,
          tipo: 'EVALUACION',
        },
      });

      res.status(200).json({ message: 'Evaluación del alumno actualizada exitosamente por el docente.', score: newScore, correctAnswersCount, totalQuestions });
    });

  } catch (error) {
    console.error('[DOCENTE EDIT EVAL] Error updating student evaluation:', error);
    res.status(500).json({ error: 'Error al actualizar la evaluación del alumno', details: error.message });
  }
});


module.exports = { router, setPrismaClient, setTransporter };