const express = require('express');
const { requireUser } = require('../middlewares/requireUser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

module.exports = (prisma, transporter) => {
  const router = express.Router();

  // Multer configuration for student task submissions
  const uploadDir = path.join(__dirname, '..', 'uploads', 'entregas');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
  });

  const upload = multer({
    storage: storage,
    limits: { fileSize: 20 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|ppt|pptx|xls|xlsx|txt|zip|rar/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);

      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error('Tipo de archivo no permitido. Solo imágenes, PDFs y documentos son aceptados.'), false);
      }
    }
  });

  // Helper function to validate student access
  const validateStudentAccess = (req) => {
    return (
      req.user &&
      req.user.role &&
      String(req.user.role).toLowerCase() === 'alumno' &&
      req.user.alumnoId &&
      (typeof req.user.alumnoId === 'number' || !isNaN(parseInt(req.user.alumnoId))) &&
      parseInt(req.user.alumnoId) > 0
    );
  };

  // RUTAS ESPECÍFICAS (/me) - DEBEN IR PRIMERO
  router.get('/alumnos/me', requireUser(prisma), async (req, res) => {
    try {
      const alumnoId = parseInt(req.user.alumnoId);
      const role = req.user.role;

      if (!validateStudentAccess(req)) {
        return res.status(403).json({ error: 'Acceso denegado: Solo para alumnos.' });
      }

      const alumno = await prisma.alumno.findUnique({
        where: { id: alumnoId },
        include: {
          CatedraAlumno: {
            include: {
              Catedra: true,
            },
          },
          TareaAsignacion: {
            include: {
              TareaMaestra: {
                include: {
                  Catedra: {
                    select: {
                      nombre: true,
                      anio: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (!alumno) {
        return res.status(404).json({ error: 'Alumno no encontrado.' });
      }

      const totalPuntos = await prisma.puntuacion.aggregate({
        where: { alumnoId: alumno.id },
        _sum: {
          puntos: true,
        },
      });

      res.json({ ...alumno, totalPuntos: totalPuntos._sum.puntos || 0 });
    } catch (error) {
      console.error('Error al obtener perfil del alumno:', error);
      res.status(500).json({ error: 'Error al obtener el perfil del alumno', details: error.message });
    }
  });

  router.get('/alumnos/me/catedras', requireUser(prisma), async (req, res) => {
    try {
      if (!validateStudentAccess(req)) {
        return res.status(403).json({ error: 'Acceso denegado: Solo para alumnos.' });
      }

      const alumnoId = parseInt(req.user.alumnoId);

      const alumnoCatedras = await prisma.CatedraAlumno.findMany({
        where: {
          alumnoId: alumnoId,
        },
        include: {
          Catedra: {
            select: {
              id: true,
              nombre: true,
              anio: true,
              institucion: true,
              turno: true,
              aula: true,
              dias: true,
              modalidad_pago: true,
            },
          },
        },
      });

      res.json(alumnoCatedras);
    } catch (error) {
      console.error('Error al obtener las cátedras del alumno:', error);
      res.status(500).json({ error: 'Error al obtener las cátedras del alumno', details: error.message });
    }
  });

  router.get('/alumnos/me/tareas', requireUser(prisma), async (req, res) => {
    try {
      if (!validateStudentAccess(req)) {
        return res.status(403).json({ error: 'Acceso denegado: Solo para alumnos.' });
      }

      const alumnoId = parseInt(req.user.alumnoId);
      console.log("[BACKEND GET ALUMNO TAREAS] Alumno ID:", alumnoId);
      const tareas = await prisma.TareaAsignacion.findMany({
        where: {
          alumnoId: alumnoId,
        },
        select: {
          id: true,
          estado: true,
          submission_path: true,
          submission_date: true,
          puntos_obtenidos: true,
          created_at: true,
          updated_at: true,
          alumnoId: true,
          tareaMaestraId: true,
          TareaMaestra: {
            select: {
              id: true,
              titulo: true,
              descripcion: true,
              fecha_entrega: true,
              multimedia_path: true,
              puntos_posibles: true,
              Catedra: {
                select: {
                  id: true, // Añadir el ID de la cátedra
                  nombre: true,
                  anio: true
                }
              }
            }
          }
        },
      });
      console.log("[BACKEND GET ALUMNO TAREAS] Tareas fetched:", tareas);

      res.json(tareas);
    } catch (error) {
      console.error('Error al obtener las tareas del alumno:', error);
      res.status(500).json({ error: 'Error al obtener las tareas del alumno', details: error.message });
    }
  });

  router.get('/alumnos/me/evaluaciones', requireUser(prisma), async (req, res) => {
    try {
      if (!validateStudentAccess(req)) {
        return res.status(403).json({ error: 'Acceso denegado: Solo para alumnos.' });
      }

      const alumnoId = parseInt(req.user.alumnoId);

      const evaluaciones = await prisma.Evaluacion.findMany({
        where: {
          EvaluacionAsignacion: {
            some: {
              alumnoId: alumnoId,
            },
          },
        },
        include: {
          Catedra: {
            select: {
              id: true,
              nombre: true,
            },
          },
          EvaluacionAsignacion: {
            where: {
              alumnoId: alumnoId,
            },
            select: {
              id: true,
              estado: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      });

      const evaluacionesConEstado = evaluaciones.map(ev => ({
        ...ev,
        realizada: ev.EvaluacionAsignacion.length > 0,
      }));

      res.json(evaluacionesConEstado);
    } catch (error) {
      console.error('Error al obtener las evaluaciones del alumno:', error);
      res.status(500).json({ error: 'Error al obtener las evaluaciones del alumno', details: error.message });
    }
  });

  router.post('/alumnos/me/evaluaciones/:evaluationId/submit', requireUser(prisma), async (req, res) => {
    try {
      if (!validateStudentAccess(req)) {
        return res.status(403).json({ error: 'Acceso denegado: Solo para alumnos.' });
      }

      const alumnoId = parseInt(req.user.alumnoId);
      const evaluationId = parseInt(req.params.evaluationId);
      const { respuestas } = req.body;

      if (isNaN(evaluationId) || !Array.isArray(respuestas) || respuestas.length === 0) {
        return res.status(400).json({ error: 'Datos de envío de evaluación inválidos.' });
      }

      const evaluacionAsignacion = await prisma.EvaluacionAsignacion.findUnique({
        where: {
          alumnoId_evaluacionId: { alumnoId, evaluacionId: evaluationId },
        },
      });

      if (!evaluacionAsignacion) {
        return res.status(404).json({ error: 'Evaluación no asignada al alumno o no encontrada.' });
      }

      if (evaluacionAsignacion.estado !== 'PENDIENTE') {
        return res.status(400).json({ error: 'Esta evaluación ya ha sido completada o está en un estado no editable.' });
      }

      // Transacción para guardar respuestas y calificar
      const result = await prisma.$transaction(async (prisma) => {
        let correctAnswersCount = 0;
        const preguntas = await prisma.Pregunta.findMany({
          where: { evaluacionId: evaluationId },
          include: { Opcion: true },
        });

        for (const respuesta of respuestas) {
          const { preguntaId, opcionElegidaId } = respuesta;

          const pregunta = preguntas.find(p => p.id === preguntaId);
          if (!pregunta) {
            throw new Error(`Pregunta con ID ${preguntaId} no encontrada.`);
          }

          const opcionCorrecta = pregunta.Opcion.find(o => o.es_correcta);
          if (opcionCorrecta && opcionElegidaId === opcionCorrecta.id) {
            correctAnswersCount++;
          }

          await prisma.RespuestaAlumno.create({
            data: {
              alumnoId: alumnoId,
              preguntaId: preguntaId,
              opcionElegidaId: opcionElegidaId,
            },
          });
        }

        const totalQuestions = preguntas.length;
        const score = totalQuestions > 0 ? Math.round((correctAnswersCount / totalQuestions) * 100) : 0;

        await prisma.EvaluacionAsignacion.update({
          where: { id: evaluacionAsignacion.id },
          data: { estado: 'REALIZADA' },
        });

        await prisma.CalificacionEvaluacion.create({
          data: {
            puntos: score, // Almacenar el score como puntos
            alumnoId: alumnoId,
            evaluacionAsignacionId: evaluacionAsignacion.id,
          },
        });

        return { score, correctAnswersCount, totalQuestions };
      });

      res.status(200).json({ message: 'Evaluación enviada con éxito.', score: result.score });

    } catch (error) {
      console.error('Error al enviar la evaluación del alumno:', error);
      res.status(500).json({ error: 'Error al procesar el envío de la evaluación', details: error.message });
    }
  });

  router.get('/alumnos/me/evaluaciones/:evaluationId/results', requireUser(prisma), async (req, res) => {
    try {
      if (!validateStudentAccess(req)) {
        return res.status(403).json({ error: 'Acceso denegado: Solo para alumnos.' });
      }

      const alumnoId = parseInt(req.user.alumnoId);
      const evaluationId = parseInt(req.params.evaluationId);

      if (isNaN(evaluationId)) {
        return res.status(400).json({ error: 'ID de evaluación inválido.' });
      }

      const evaluation = await prisma.Evaluacion.findUnique({
        where: { id: evaluationId },
        include: {
          Pregunta: {
            include: {
              Opcion: true,
            },
          },
        },
      });

      if (!evaluation) {
        return res.status(404).json({ error: 'Evaluación no encontrada.' });
      }
      const formattedEvaluation = {
        ...evaluation,
        Pregunta: evaluation.Pregunta.map(pregunta => ({
          ...pregunta,
          opciones: pregunta.Opcion, // Renombra Opcion a opciones
        })),
      };

      const studentResponses = await prisma.RespuestaAlumno.findMany({
        where: {
          alumnoId: alumnoId,
          Pregunta: {
            evaluacionId: evaluationId,
          },
        },
        include: {
          Opcion: true,
          Pregunta: true,
        },
      });

      let correctAnswersCount = 0;
      const totalQuestions = formattedEvaluation.Pregunta.length;
      const results = formattedEvaluation.Pregunta.map(pregunta => {
        const studentResponse = studentResponses.find(sr => sr.preguntaId === pregunta.id);
        const correctAnswer = pregunta.opciones.find(opt => opt.es_correcta === true);
        const isCorrect = studentResponse && correctAnswer && studentResponse.opcionElegidaId === correctAnswer.id;

        if (isCorrect) {
          correctAnswersCount++;
        }

        return {
          pregunta: pregunta.texto,
          seleccionada: studentResponse ? studentResponse.Opcion.texto : 'No respondida',
          es_correcta_alumno: isCorrect,
          correct_answer: correctAnswer ? correctAnswer.texto : 'N/A',
          opciones: pregunta.opciones.map(opt => ({
            texto: opt.texto,
            es_correcta: opt.es_correcta,
            seleccionada: studentResponse && studentResponse.opcionElegidaId === opt.id,
          })),
        };
      });

      const score = totalQuestions > 0 ? Math.round((correctAnswersCount / totalQuestions) * 100) : 0;

      res.json({ score, results });
    } catch (error) {
      console.error('Error al obtener resultados de la evaluación del alumno:', error);
      res.status(500).json({ error: 'Error al obtener resultados de la evaluación', details: error.message });
    }
  });

  router.get('/alumnos/me/evaluaciones/:id', requireUser(prisma), async (req, res) => {
    try {
      if (!validateStudentAccess(req)) {
        return res.status(403).json({ error: 'Acceso denegado: Solo para alumnos.' });
      }

      const alumnoId = parseInt(req.user.alumnoId);
      const evaluationId = parseInt(req.params.id);

      if (isNaN(evaluationId)) {
        return res.status(400).json({ error: 'ID de evaluación inválido.' });
      }

      const evaluation = await prisma.Evaluacion.findFirst({
        where: {
          id: evaluationId,
          EvaluacionAsignacion: {
            some: {
              alumnoId: alumnoId,
            },
          },
        },
        include: {
          Pregunta: {
            include: {
              Opcion: true,
            },
          },
          Catedra: {
            select: {
              id: true,
              nombre: true,
            },
          },
          EvaluacionAsignacion: {
            where: {
              alumnoId: alumnoId,
            },
            select: {
              id: true,
              estado: true,
            },
          },
        },
      });

      if (!evaluation) {
        return res.status(404).json({ error: 'Evaluación no encontrada o no asignada al alumno.' });
      }

      const formattedEvaluation = {
        ...evaluation,
        Pregunta: evaluation.Pregunta.map(pregunta => ({
          ...pregunta,
          opciones: pregunta.Opcion,
        })),
      };
      const { Pregunta, ...restOfEvaluation } = formattedEvaluation;
      res.json({ ...restOfEvaluation, preguntas: Pregunta });
    } catch (error) {
      console.error('Error al obtener la evaluación del alumno:', error);
      res.status(500).json({ error: 'Error al obtener la evaluación del alumno', details: error.message });
    }
  });

  router.get('/alumnos/me/publicaciones', requireUser(prisma), async (req, res) => {
    try {
      const alumnoId = parseInt(req.user.alumnoId);
      if (!validateStudentAccess(req)) {
        return res.status(403).json({ error: 'Acceso denegado: Solo para alumnos.' });
      }

      const catedrasAlumno = await prisma.CatedraAlumno.findMany({
        where: { alumnoId: alumnoId },
        select: { catedraId: true },
      });
      const catedrasIds = catedrasAlumno.map(ca => ca.catedraId);

      if (catedrasIds.length === 0) {
        return res.json([]);
      }

      const publicaciones = await prisma.Publicacion.findMany({
        where: {
          catedraId: { in: catedrasIds },
          OR: [
            { visibleToStudents: true },
            {
              tipo: 'TAREA',
              TareaMaestra: {
                TareaAsignacion: {
                  some: {
                    alumnoId: alumnoId,
                  },
                },
              },
            },
          ],
        },
        include: {
          Catedra: { select: { id: true, nombre: true } },
          autorDocente: { select: { id: true, nombre: true, apellido: true } },
          autorAlumno: { select: { id: true, nombre: true, apellido: true } },
          ComentarioPublicacion: {
            include: {
              autorAlumno: { select: { id: true, nombre: true, apellido: true } },
              autorDocente: { select: { id: true, nombre: true, apellido: true } },
            },
            orderBy: { created_at: 'asc' },
          },
          PublicacionInteraccion: {
            where: { alumnoId: alumnoId },
            select: { id: true },
          },
          _count: {
            select: { PublicacionInteraccion: true },
          },
          TareaMaestra: {
            select: {
              id: true,
              titulo: true,
              descripcion: true,
              fecha_entrega: true,
              multimedia_path: true,
              puntos_posibles: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
      });

      res.json(publicaciones);
    } catch (error) {
      console.error('Error al obtener las publicaciones del alumno:', error);
      res.status(500).json({ error: 'Error al obtener las publicaciones del alumno', details: error.message });
    }
  });

  // RUTA CON PARÁMETRO DINÁMICO - DEBE IR AL FINAL
  router.get('/alumnos/:alumnoId/tareas-asignadas', requireUser(prisma), async (req, res) => {
    try {
      if (!validateStudentAccess(req)) {
        return res.status(403).json({ error: 'Acceso denegado: Solo para alumnos.' });
      }

      const tokenAlumnoId = parseInt(req.user.alumnoId);
      const paramAlumnoId = parseInt(req.params.alumnoId);

      if (tokenAlumnoId !== paramAlumnoId) {
        return res.status(403).json({ error: 'Acceso denegado: El alumno no tiene permiso para ver estas tareas.' });
      }

      const tareas = await prisma.TareaAsignacion.findMany({
        where: {
          alumnoId: paramAlumnoId,
        },
        include: {
          TareaMaestra: {
            select: {
              id: true,
              titulo: true,
              descripcion: true,
              fecha_entrega: true,
              multimedia_path: true,
              puntos_posibles: true,
            },
          },
          TareaMaestra: {
            include: {
              Catedra: {
                select: {
                  id: true,
                  nombre: true,
                },
              },
            },
          },
        },
      });

      const formattedTareas = tareas.map(t => ({
        id: t.id,
        titulo: t.TareaMaestra.titulo,
        descripcion: t.TareaMaestra.descripcion,
        fecha_entrega: t.TareaMaestra.fecha_entrega,
        multimedia_path: t.TareaMaestra.multimedia_path,
        puntos_posibles: t.TareaMaestra.puntos_posibles,
        estado: t.estado,
        submission_path: t.submission_path,
        submission_date: t.submission_date,
        puntos_obtenidos: t.puntos_obtenidos,
        Catedra: {
          id: t.TareaMaestra.Catedra.id,
          nombre: t.TareaMaestra.Catedra.nombre,
        },
      }));

      res.json(formattedTareas);
    } catch (error) {
      console.error('Error al obtener las tareas del alumno:', error);
      res.status(500).json({ error: 'Error al obtener las tareas del alumno', details: error.message });
    }
  });

  // Subir entrega de tarea del alumno
  router.post('/tareas/:tareaAsignacionId/submit', requireUser(prisma), upload.single('file'), async (req, res) => {
    try {
      const tareaAsignacionId = parseInt(req.params.tareaAsignacionId);
      const { alumnoId, role } = req.user;

      if (!req.file) {
        return res.status(400).json({ error: 'No se adjuntó ningún archivo para la entrega.' });
      }

      const submissionPath = `/uploads/entregas/${req.file.filename}`;

      const tareaAsignacion = await prisma.TareaAsignacion.findUnique({ 
        where: { id: tareaAsignacionId } 
      });

      if (!tareaAsignacion) {
        fs.unlinkSync(req.file.path);
        return res.status(404).json({ error: 'Asignación de Tarea no encontrada.' });
      }

      if (tareaAsignacion.alumnoId !== alumnoId) {
        fs.unlinkSync(req.file.path);
        return res.status(403).json({ error: 'Acceso denegado: No autorizado para entregar esta tarea.' });
      }

      const updatedTareaAsignacion = await prisma.tareaAsignacion.update({
        where: { id: tareaAsignacionId },
        data: {
          estado: 'ENTREGADA',
          submission_path: submissionPath,
          submission_date: new Date(),
        },
      });

      res.status(200).json({ 
        message: 'Entrega subida con éxito', 
        tareaAsignacion: updatedTareaAsignacion 
      });
    } catch (error) {
      console.error('Error al subir entrega de tarea:', error);
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ error: 'Error al procesar la entrega de la tarea', details: error.message });
    }
  });

  // RUTA PÚBLICA - Listar alumnos (sin autenticación requerida)
  router.get('/alumnos', async (req, res) => {
    try {
      const alumnos = await prisma.Alumno.findMany({
        select: {
          id: true,
          nombre: true,
          apellido: true,
          email: true,
          instrumento: true,
        },
      });
      res.json(alumnos);
    } catch (error) {
      console.error('Error al listar alumnos:', error);
      res.status(500).json({ error: 'No se pudieron cargar los alumnos.' });
    }
  });


  router.get('/alumnos/me/contributions', requireUser(prisma), async (req, res) => {
    try {
      const { email: userEmail, role } = req.user;

      if (role.toLowerCase() !== 'alumno') {
        return res.status(403).json({ error: 'Acceso denegado: Solo para alumnos.' });
      }

      const contributions = await prisma.Composer.findMany({
        where: {
          is_student_contribution: true,
          email: userEmail,
        },
        orderBy: {
          created_at: 'desc',
        },
      });

      res.json(contributions);
    } catch (error) {
      console.error('Error al obtener las contribuciones del alumno:', error);
      res.status(500).json({ error: 'Error al obtener las contribuciones del alumno', details: error.message });
    }
  });

  router.get('/alumnos/contributing', requireUser(prisma), async (req, res) => {
    try {
      // Obtener compositores que son contribuciones de estudiantes
      const studentComposers = await prisma.Composer.findMany({
        where: {
          is_student_contribution: true,
          status: 'PUBLISHED', // Solo publicados para que sean elegibles
        },
        select: {
          id: true,
          student_first_name: true,
          student_last_name: true,
          email: true,
        },
      });

      // Obtener sugerencias de edición de alumnos que han sido aprobadas
      const approvedStudentSuggestions = await prisma.EditSuggestion.findMany({
        where: {
          is_student_contribution: true,
          status: 'APPLIED', // Solo sugerencias aplicadas
        },
        select: {
          suggester_email: true,
          student_first_name: true,
          student_last_name: true,
        },
      });

      const uniqueContributingStudents = new Map();

      // Procesar compositores estudiantes
      studentComposers.forEach(composer => {
        if (composer.email) {
          uniqueContributingStudents.set(composer.email, {
            id: composer.id, // ID del compositor
            nombre: composer.student_first_name,
            apellido: composer.student_last_name,
            email: composer.email,
            isComposer: true,
            tipoContribucion: 'COMPOSER',
          });
        }
      });

      // Procesar sugerencias de edición de estudiantes
      approvedStudentSuggestions.forEach(suggestion => {
        if (suggestion.suggester_email) {
          // Si ya existe un registro con este email, lo actualizamos o mantenemos el más completo
          // Para este caso, simplemente añadimos si no existe
          if (!uniqueContributingStudents.has(suggestion.suggester_email)) {
            uniqueContributingStudents.set(suggestion.suggester_email, {
              // No hay un ID directo de alumno/compositor aquí, pero el email es clave
              id: null, // Podríamos necesitar un id para el frontend, manejar con cautela
              nombre: suggestion.student_first_name,
              apellido: suggestion.student_last_name,
              email: suggestion.suggester_email,
              isComposer: true, // Indica que es un contribuyente
              tipoContribucion: 'SUGGESTION',
            });
          }
        }
      });

      res.status(200).json(Array.from(uniqueContributingStudents.values()));
    } catch (error) {
      console.error('Error al obtener alumnos contribuyentes:', error);
      res.status(500).json({ error: 'Error al obtener la lista de alumnos contribuyentes.', details: error.message });
    }
  });

  return router;
};