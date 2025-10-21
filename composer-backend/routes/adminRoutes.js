const express = require('express');
const jwt = require('jsonwebtoken');
const { generateQuestionsWithAI } = require('../ai');
const requireAdmin = require('../middlewares/requireAdmin');

module.exports = (prisma, transporter) => {
  const router = express.Router();

  router.post('/login', async (req, res) => {
    console.log('[ADMIN LOGIN] Intento de login recibido:', req.body);
    const { password } = req.body;
    if (password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign({ role: 'ADMIN' }, process.env.JWT_SECRET, { expiresIn: '8h' });
      return res.json({ token });
    }

    return res.status(401).json({ error: 'Contraseña incorrecta' });
  });

  // --- Nueva Ruta para Estadísticas del Dashboard ---
  router.get('/dashboard-stats', requireAdmin, async (req, res) => {
    try {
      const totalAlumnos = await prisma.Alumno.count();
      const totalCatedras = await prisma.Catedra.count();
      const aportesPendientes = await prisma.Composer.count({
        where: { status: 'PENDING_REVIEW' },
      });
      const sugerenciasPendientes = await prisma.EditSuggestion.count({
        where: { status: 'PENDING_REVIEW' },
      });

      res.json({
        totalAlumnos,
        totalCatedras,
        aportesPendientes,
        sugerenciasPendientes,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({ error: 'Error al obtener las estadísticas del panel.' });
    }
  });

  // Admin management for Docentes
  router.get('/docentes', requireAdmin, async (req, res) => {
    try {
      const docentes = await prisma.Docente.findMany();
      res.status(200).json(docentes);
    } catch (error) {
      console.error('Error fetching docentes:', error);
      res.status(500).json({ error: 'Error al obtener docentes.' });
    }
  });

  router.post('/docentes', requireAdmin, async (req, res) => {
    const { email, nombre, apellido, telefono, direccion } = req.body;
    if (!email || !nombre || !apellido) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios: email, nombre, apellido.' });
    }
    try {
      const newDocente = await prisma.Docente.create({
        data: { email, nombre, apellido, telefono, direccion, otpEnabled: false },
      });
      res.status(201).json(newDocente);
    } catch (error) {
      console.error('Error creating docente:', error);
      res.status(500).json({ error: 'Error al crear docente.' });
    }
  });

  router.put('/docentes/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { email, nombre, apellido, otpEnabled, telefono, direccion } = req.body;
    try {
      const updatedDocente = await prisma.Docente.update({
        where: { id: parseInt(id) },
        data: { email, nombre, apellido, telefono, direccion, otpEnabled },
      });
      res.status(200).json(updatedDocente);
    } catch (error) {
      console.error('Error updating docente:', error);
      res.status(500).json({ error: 'Error al actualizar docente.' });
    }
  });

  router.delete('/docentes/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;
    try {
      await prisma.Docente.delete({
        where: { id: parseInt(id) },
      });
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting docente:', error);
      res.status(500).json({ error: 'Error al eliminar docente.' });
    }
  });

  // Admin: Get all submitted tasks
  router.get('/tasks/submitted', requireAdmin, async (req, res) => {
    try {
      const submittedTasks = await prisma.TareaAsignacion.findMany({
        where: {
          submission_path: {
            not: null,
          },
        },
        include: {
          TareaMaestra: {
            include: {
              Catedra: true,
            },
          },
          Alumno: true,
        },
        orderBy: {
          submission_date: 'desc',
        },
      });
      res.status(200).json(submittedTasks);
    } catch (error) {
      console.error('Error fetching submitted tasks:', error);
      res.status(500).json({ error: 'Error al obtener tareas entregadas.' });
    }
  });

  // Admin: Get all graded tasks
  router.get('/tasks/graded', requireAdmin, async (req, res) => {
    try {
      const gradedTasks = await prisma.TareaAsignacion.findMany({
        where: {
          puntos_obtenidos: {
            not: null,
          },
        },
        include: {
          TareaMaestra: {
            include: {
              Catedra: true,
            },
          },
          Alumno: true,
        },
        orderBy: {
          submission_date: 'desc',
        },
      });
      res.status(200).json(gradedTasks);
    } catch (error) {
      console.error('Error fetching graded tasks:', error);
      res.status(500).json({ error: 'Error al obtener tareas calificadas.' });
    }
  });

  // Admin: Generate evaluation for a catedra
  router.post('/catedras/:catedraId/generate-evaluation', requireAdmin, async (req, res) => {
    const { catedraId } = req.params;
    const { topic, subject, numberOfQuestions, numberOfOptions } = req.body;

    try {
      const catedra = await prisma.Catedra.findUnique({
        where: {
          id: parseInt(catedraId),
        }
      });

      if (!catedra) {
        return res.status(404).json({ error: 'Cátedra no encontrada.' });
      }

      const generatedQuestions = await generateQuestionsWithAI(topic, numberOfQuestions, numberOfOptions);

      let evaluationTitle = topic;
      evaluationTitle = evaluationTitle.replace(/^Genera preguntas (de seleccion multiple |de selección múltiple )?sobre /i, '');
      evaluationTitle = evaluationTitle.replace(/^Crea una evaluación sobre /i, '');
      evaluationTitle = evaluationTitle.replace(/\.$/, '');

      const newEvaluation = await prisma.evaluacion.create({
        data: {
          titulo: `Evaluación de ${evaluationTitle} para ${catedra.nombre}`,
          catedraId: parseInt(catedraId),
          Pregunta: {
            create: generatedQuestions.map(p => ({
              texto: p.texto,
              Opcion: {
                create: p.opciones,
              },
            })),
          },
        },
        include: {
          Pregunta: {
            include: {
              Opcion: true,
            },
          },
        },
      });

      // Fetch all students enrolled in the catedra to send notifications
      const enrolledStudents = await prisma.CatedraAlumno.findMany({
        where: { catedraId: parseInt(catedraId), alumnoId: { not: null } },
        include: {
          Alumno: {
            select: { email: true, nombre: true },
          },
        },
      });

      for (const enrollment of enrolledStudents) {
        if (enrollment.Alumno && enrollment.Alumno.email) {
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: enrollment.Alumno.email,
            subject: `¡Nueva Evaluación Disponible en ${catedra.nombre} (Admin)!`,
            html: `
              <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #ffffff; background-color: #1a202c; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #2d3748; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);">
                  <h2 style="color: #9f7aea; text-align: center;">¡Hola ${enrollment.Alumno.nombre}!</h2>
                  <p style="color: #e2e8f0;">El administrador ha creado una nueva evaluación para la cátedra de <strong>${catedra.nombre}</strong>.</p>
                  <p style="color: #e2e8f0;"><strong>Título de la Evaluación:</strong> ${newEvaluation.titulo}</p>
                  <p style="color: #e2e8f0;">Puedes acceder a ella y realizarla desde tu panel de "Mis Evaluaciones" en la plataforma.</p>
                  <p style="color: #e2e8f0;">¡Mucho éxito!</p>
                  <p style="color: #cbd5e0; font-size: 0.9em; text-align: center; margin-top: 20px;">Atentamente, El Equipo de HMPY</p>
                </div>
              </div>
            `,
          };
          try {
            await transporter.sendMail(mailOptions);
            console.log(`Notification email sent to ${enrollment.Alumno.email} (Admin).`);
          } catch (emailError) {
            console.error(`Error sending email to ${enrollment.Alumno.email} (Admin):`, emailError);
          }
        }
      }

      res.status(201).json({
        message: 'Evaluación generada y guardada exitosamente!',
        evaluation: newEvaluation,
      });
    } catch (error) {
      console.error('Error generating evaluation for admin:', error);
      res.status(500).json({ error: 'Failed to generate evaluation.', details: error.message });
    }
  });

  // Admin: Create a new task for a catedra
  router.post('/catedras/:catedraId/tareas', requireAdmin, async (req, res) => {
    const { catedraId } = req.params;
    const { titulo, descripcion, puntos_posibles, fecha_entrega, recursos, multimedia_path } = req.body;

    try {
      const catedra = await prisma.Catedra.findUnique({
        where: {
          id: parseInt(catedraId),
        },
      });

      if (!catedra) {
        return res.status(404).json({ error: 'Cátedra no encontrada.' });
      }

      const enrollments = await prisma.CatedraAlumno.findMany({
        where: { catedraId: parseInt(catedraId), alumnoId: { not: null } },
        select: { alumnoId: true },
      });

      if (enrollments.length === 0) {
        return res.status(404).json({ error: 'No hay alumnos inscritos en esta cátedra para asignar la tarea.' });
      }

      // Create master task first
      const masterTask = await prisma.tareaMaestra.create({
        data: {
          titulo,
          descripcion,
          puntos_posibles: parseInt(puntos_posibles),
          fecha_entrega: fecha_entrega ? new Date(fecha_entrega) : null,
          recursos: recursos || [],
          multimedia_path,
          Catedra: { connect: { id: parseInt(catedraId) } },
        },
      });

      // Create task assignments for each student
      const createdTasks = [];
      for (const enrollment of enrollments) {
        const newTareaAsignacion = await prisma.TareaAsignacion.create({
          data: {
            Alumno: { connect: { id: enrollment.alumnoId } },
            TareaMaestra: { connect: { id: masterTask.id } },
          },
        });
        createdTasks.push(newTareaAsignacion);
      }

      // Send email notifications to students
      const studentEmails = await prisma.CatedraAlumno.findMany({
        where: { catedraId: parseInt(catedraId), alumnoId: { not: null } },
        include: {
          Alumno: {
            select: { email: true, nombre: true },
          },
        },
      });

      for (const studentEnrollment of studentEmails) {
        if (studentEnrollment.Alumno && studentEnrollment.Alumno.email) {
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: studentEnrollment.Alumno.email,
            subject: `¡Nueva Tarea Asignada en ${catedra.nombre} (Admin)!`,
            html: `
              <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #ffffff; background-color: #1a202c; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #2d3748; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);">
                  <h2 style="color: #9f7aea; text-align: center;">¡Hola ${studentEnrollment.Alumno.nombre}!</h2>
                  <p style="color: #e2e8f0;">El administrador ha asignado una nueva tarea para la cátedra de <strong>${catedra.nombre}</strong>.</p>
                  <p style="color: #e2e8f0;"><strong>Título de la Tarea:</strong> ${titulo}</p>
                  <p style="color: #e2e8f0;"><strong>Descripción:</strong> ${descripcion}</p>
                  <p style="color: #e2e8f0;"><strong>Fecha de Entrega:</strong> ${fecha_entrega ? new Date(fecha_entrega).toLocaleDateString() : 'N/A'}</p>
                  <p style="color: #e2e8f0;">Puedes ver los detalles y realizar tu entrega en la plataforma.</p>
                  <p style="color: #cbd5e0; font-size: 0.9em; text-align: center; margin-top: 20px;">Atentamente, El Equipo de HMPY</p>
                </div>
              </div>
            `,
          };
          try {
            await transporter.sendMail(mailOptions);
            console.log(`Task notification email sent to ${studentEnrollment.Alumno.email} (Admin).`);
          } catch (emailError) {
            console.error(`Error sending task email to ${studentEnrollment.Alumno.email} (Admin):`, emailError);
          }
        }
      }

      res.status(201).json({ message: `Tareas creadas y asignadas a ${createdTasks.length} alumnos.`, tasks: createdTasks });
    } catch (error) {
      console.error('Error creating task for admin:', error);
      res.status(500).json({ error: 'Failed to create task.', details: error.message });
    }
  });

  // --- Rutas para la gestión de Pagos (Admin) ---

  router.put('/catedras/:catedraId/modalidadpago', requireAdmin, async (req, res) => {
    const { catedraId } = req.params;
    const { modalidad_pago } = req.body;

    if (!modalidad_pago) {
      return res.status(400).json({ error: 'La modalidad de pago es obligatoria.' });
    }

    if (!['PARTICULAR', 'INSTITUCIONAL'].includes(modalidad_pago)) {
      return res.status(400).json({ error: 'Modalidad de pago inválida. Debe ser PARTICULAR o INSTITUCIONAL.' });
    }

    try {
      const updatedCatedra = await prisma.Catedra.update({
        where: { id: parseInt(catedraId) },
        data: { modalidad_pago },
      });
      res.status(200).json(updatedCatedra);
    } catch (error) {
      console.error('Error al actualizar modalidad de pago de cátedra:', error);
      res.status(500).json({ error: 'Error al actualizar la modalidad de pago.' });
    }
  });

  router.put('/catedraalumno/:catedraAlumnoId/diacobro', requireAdmin, async (req, res) => {
    const { catedraAlumnoId } = req.params;
    const { dia_cobro } = req.body;

    if (dia_cobro === undefined) {
      return res.status(400).json({ error: 'El día de cobro es obligatorio.' });
    }

    if (dia_cobro !== null && (dia_cobro < 1 || dia_cobro > 31)) {
      return res.status(400).json({ error: 'El día de cobro debe ser entre 1 y 31, o null.' });
    }

    try {
      const updatedCatedraAlumno = await prisma.CatedraAlumno.update({
        where: { id: parseInt(catedraAlumnoId) },
        data: { dia_cobro },
      });
      res.status(200).json(updatedCatedraAlumno);
    } catch (error) {
      console.error('Error al actualizar día de cobro de CatedraAlumno:', error);
      res.status(500).json({ error: 'Error al actualizar el día de cobro.' });
    }
  });

  router.get('/catedraalumno/:catedraAlumnoId/infoPago', requireAdmin, async (req, res) => {
    const { catedraAlumnoId } = req.params;

    try {
      const catedraAlumno = await prisma.CatedraAlumno.findUnique({
        where: { id: parseInt(catedraAlumnoId) },
        include: {
          Alumno: {
            select: { nombre: true, apellido: true, email: true },
          },
          Catedra: {
            select: { nombre: true, modalidad_pago: true },
          },
        },
      });

      if (!catedraAlumno) {
        return res.status(404).json({ error: 'Inscripción de alumno en cátedra no encontrada.' });
      }

      res.status(200).json({
        id: catedraAlumno.id,
        alumno: catedraAlumno.Alumno,
        catedra: catedraAlumno.Catedra,
        dia_cobro: catedraAlumno.dia_cobro,
      });
    } catch (error) {
      console.error('Error al obtener información de pago de CatedraAlumno:', error);
      res.status(500).json({ error: 'Error al obtener la información de pago.' });
    }
  });

  // --- Rutas para la gestión de Costos de Cátedra (Admin) ---

  router.post('/catedras/:catedraId/costos', requireAdmin, async (req, res) => {
    const { catedraId } = req.params;
    const { monto_matricula, monto_cuota, es_gratuita } = req.body;

    try {
      const catedra = await prisma.Catedra.findUnique({
        where: { id: parseInt(catedraId) },
      });

      if (!catedra) {
        return res.status(404).json({ error: 'Cátedra no encontrada.' });
      }

      const upsertedCosto = await prisma.CostoCatedra.upsert({
        where: { catedraId: parseInt(catedraId) },
        update: {
          monto_matricula: monto_matricula !== undefined ? parseFloat(monto_matricula) : undefined,
          monto_cuota: monto_cuota !== undefined ? parseFloat(monto_cuota) : undefined,
          es_gratuita: es_gratuita !== undefined ? es_gratuita : undefined,
        },
        create: {
          catedraId: parseInt(catedraId),
          monto_matricula: monto_matricula !== undefined ? parseFloat(monto_matricula) : null,
          monto_cuota: monto_cuota !== undefined ? parseFloat(monto_cuota) : null,
          es_gratuita: es_gratuita !== undefined ? es_gratuita : false,
        },
      });
      res.status(200).json(upsertedCosto);
    } catch (error) {
      console.error('Error al definir/actualizar costos de cátedra:', error);
      res.status(500).json({ error: 'Error al definir o actualizar los costos de la cátedra.' });
    }
  });

  router.get('/catedras/:catedraId/costos', requireAdmin, async (req, res) => {
    const { catedraId } = req.params;

    try {
      const costos = await prisma.CostoCatedra.findUnique({
        where: { catedraId: parseInt(catedraId) },
      });

      if (!costos) {
        return res.status(404).json({ error: 'Costos de cátedra no encontrados.' });
      }

      res.status(200).json(costos);
    } catch (error) {
      console.error('Error al obtener costos de cátedra:', error);
      res.status(500).json({ error: 'Error al obtener los costos de la cátedra.' });
    }
  });

  router.get('/alumnos/:alumnoId/catedras/:catedraId/estadoPago', requireAdmin, async (req, res) => {
    const { alumnoId, catedraId } = req.params;

    try {
      const catedraAlumno = await prisma.CatedraAlumno.findUnique({
        where: {
          catedraId_alumnoId: {
            catedraId: parseInt(catedraId),
            alumnoId: parseInt(alumnoId),
          },
        },
        include: {
          Alumno: {
            select: { id: true, nombre: true, apellido: true, email: true },
          },
          Catedra: {
            select: { id: true, nombre: true, modalidad_pago: true, CostoCatedra: true },
          },
          Pago: {
            orderBy: { fecha_pago: 'desc' },
          },
        },
      });

      if (!catedraAlumno) {
        return res.status(404).json({ error: 'Inscripción de alumno en cátedra no encontrada.' });
      }

      const { Alumno: alumno, Catedra: catedra, dia_cobro, fecha_inscripcion, Pago: pagos } = catedraAlumno;
      const costosCatedra = catedra.CostoCatedra;

      const estadoPago = {
        alumno: {
          id: alumno.id,
          nombre: alumno.nombre,
          apellido: alumno.apellido,
          email: alumno.email,
        },
        catedra: {
          id: catedra.id,
          nombre: catedra.nombre,
          modalidad_pago: catedra.modalidad_pago,
        },
        fechaInscripcion: fecha_inscripcion,
        diaCobroMensual: dia_cobro,
        costos: costosCatedra,
        pagosRegistrados: pagos.map(p => ({
          id: p.id,
          fecha: p.fecha_pago,
          monto: p.monto_pagado,
          tipo: p.tipo_pago,
          periodo: p.periodo_cubierto,
          confirmadoPor: p.confirmadoPorId,
        })),
        estadoActual: 'DESCONOCIDO',
        deudaMatricula: 0,
        deudaCuotas: [],
      };

      if (costosCatedra && costosCatedra.es_gratuita) {
        estadoPago.estadoActual = 'GRATUITO';
      } else {
        if (costosCatedra && costosCatedra.monto_matricula) {
          const pagoMatricula = pagos.find(p => p.tipo_pago === 'MATRICULA');
          if (!pagoMatricula) {
            estadoPago.estadoActual = 'MATRÍCULA PENDIENTE';
            estadoPago.deudaMatricula = costosCatedra.monto_matricula;
          } else if (pagoMatricula.monto_pagado < costosCatedra.monto_matricula) {
            estadoPago.estadoActual = 'MATRÍCULA PARCIALMENTE PAGADA';
            estadoPago.deudaMatricula = costosCatedra.monto_matricula - pagoMatricula.monto_pagado;
          }
        }

        if (costosCatedra && costosCatedra.monto_cuota && dia_cobro) {
          const hoy = new Date();
          let mesActual = hoy.getMonth();
          let anoActual = hoy.getFullYear();

          const fechaInicioCuota = new Date(fecha_inscripcion);
          fechaInicioCuota.setDate(dia_cobro);

          let currentMonth = fechaInicioCuota.getMonth();
          let currentYear = fechaInicioCuota.getFullYear();

          while (currentYear < anoActual || (currentYear === anoActual && currentMonth <= mesActual)) {
            const tempDate = new Date(currentYear, currentMonth, dia_cobro);
            if (tempDate.getMonth() !== currentMonth) {
              tempDate.setDate(0);
              tempDate.setDate(dia_cobro);
            }

            const periodo = `${tempDate.toLocaleString('es-ES', { month: 'long' })} ${currentYear}`;
            const pagoCuota = pagos.find(p => p.tipo_pago === 'CUOTA' && p.periodo_cubierto === periodo);

            if (!pagoCuota) {
              if (hoy.getDate() > dia_cobro || (hoy.getMonth() > currentMonth && hoy.getFullYear() === currentYear) || hoy.getFullYear() > currentYear) {
                estadoPago.deudaCuotas.push({
                  periodo: periodo,
                  monto: costosCatedra.monto_cuota,
                  estado: 'PENDIENTE',
                });
              }
            } else if (pagoCuota.monto_pagado < costosCatedra.monto_cuota) {
              estadoPago.deudaCuotas.push({
                periodo: periodo,
                monto: costosCatedra.monto_cuota - pagoCuota.monto_pagado,
                estado: 'PAGO PARCIAL',
              });
            }

            currentMonth++;
            if (currentMonth > 11) {
              currentMonth = 0;
              currentYear++;
            }
            if (currentYear > anoActual || (currentYear === anoActual && currentMonth > mesActual)) break;
          }

          if (estadoPago.deudaMatricula === 0 && estadoPago.deudaCuotas.length === 0) {
            estadoPago.estadoActual = 'AL DÍA';
          } else if (estadoPago.deudaMatricula > 0 || estadoPago.deudaCuotas.length > 0) {
            estadoPago.estadoActual = 'EN MORA';
          }
        }
      }

      res.status(200).json(estadoPago);
    } catch (error) {
      console.error('Error al obtener el estado de pago del alumno:', error);
      res.status(500).json({ error: 'Error al obtener el estado de pago.' });
    }
  });

  // Admin: Get a specific catedra
  router.get('/catedras/:id', requireAdmin, async (req, res) => {
    console.log('[ADMIN] Fetching specific catedra with ID:', req.params.id);
    try {
      const catedraId = parseInt(req.params.id);

      const catedra = await prisma.Catedra.findUnique({
        where: { id: catedraId },
        include: {
          Evaluacion: true,
          TareaMaestra: true,
          CatedraAlumno: {
            include: {
              Alumno: true,
              Composer: true,
            },
          },
          DiaClase: {
            include: { Asistencia: true },
          },
          CatedraDiaHorario: true,
        },
      });

      if (!catedra) {
        return res.status(404).json({ error: 'Cátedra no encontrada.' });
      }
      res.status(200).json(catedra);
    } catch (error) {
      console.error('Error fetching specific catedra for admin:', error);
      res.status(500).json({ error: 'Error al obtener la cátedra.' });
    }
  });

  // Admin: CRUD Catedras
  router.get('/catedras', requireAdmin, async (req, res) => {
    console.log('[ADMIN] Fetching all catedras');
    try {
      const catedras = await prisma.Catedra.findMany({
        include: {
          CatedraAlumno: {
            include: {
              Alumno: true
            }
          },
          CatedraDiaHorario: true,
        },
      });
      res.status(200).json(catedras);
    } catch (error) {
      console.error('Error fetching all catedras for admin:', error);
      res.status(500).json({ error: 'Error al obtener las cátedras.' });
    }
  });

  router.post('/catedras', requireAdmin, async (req, res) => {
    const { nombre, anio, institucion, turno, aula, dias, docenteId, modalidad_pago, horariosPorDia } = req.body;
    if (isNaN(parseInt(anio))) {
      return res.status(400).json({ error: 'El año académico debe ser un número válido.' });
    }

    if (docenteId && isNaN(parseInt(docenteId))) {
      return res.status(400).json({ error: 'El ID del docente debe ser un número válido.' });
    }

    try {
      const newCatedra = await prisma.Catedra.create({
        data: {
          nombre,
          anio: parseInt(anio),
          institucion,
          turno,
          aula,
          dias: dias,
          modalidad_pago,
          Docente: docenteId ? { connect: { id: parseInt(docenteId) } } : undefined,
          CatedraDiaHorario: horariosPorDia && Array.isArray(horariosPorDia) && horariosPorDia.length > 0 ? {
            create: horariosPorDia.map(dh => ({
              dia_semana: dh.dia_semana,
              hora_inicio: dh.hora_inicio,
              hora_fin: dh.hora_fin,
            })),
          } : undefined,
        },
      });
      res.status(201).json(newCatedra);
    } catch (error) {
      console.error('Error al crear cátedra:', error);
      res.status(500).json({ error: 'Error al crear la cátedra.' });
    }
  });

  router.put('/catedras/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { nombre, anio, institucion, turno, aula, dias, docenteId, modalidad_pago, horariosPorDia } = req.body;

    if (isNaN(parseInt(anio))) {
      return res.status(400).json({ error: 'El año académico debe ser un número válido.' });
    }

    if (docenteId && isNaN(parseInt(docenteId))) {
      return res.status(400).json({ error: 'El ID del docente debe ser un número válido.' });
    }

    try {
      // Eliminar horarios existentes para reemplazarlos
      await prisma.catedraDiaHorario.deleteMany({
        where: { catedraId: parseInt(id) },
      });

      const updatedCatedra = await prisma.catedra.update({
        where: { id: parseInt(id) },
        data: {
          nombre,
          anio: parseInt(anio),
          institucion,
          turno,
          aula,
          dias: dias,
          modalidad_pago,
          docenteId: docenteId ? parseInt(docenteId) : null,
          CatedraDiaHorario: horariosPorDia && Array.isArray(horariosPorDia) && horariosPorDia.length > 0 ? {
            create: horariosPorDia.map(dh => ({
              dia_semana: dh.dia_semana,
              hora_inicio: dh.hora_inicio,
              hora_fin: dh.hora_fin,
            })),
          } : undefined,
        },
      });
      res.status(200).json(updatedCatedra);
    } catch (error) {
      console.error('Error al actualizar cátedra:', error);
      res.status(500).json({ error: 'Error al actualizar la cátedra.' });
    }
  });

  router.delete('/catedras/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;
    try {
      const catedraId = parseInt(id);

      // Eliminar Comentarios de Publicaciones relacionadas a esta cátedra
      await prisma.ComentarioPublicacion.deleteMany({
        where: {
          Publicacion: {
            catedraId: catedraId,
          },
        },
      });

      // Eliminar Publicaciones relacionadas a esta cátedra
      await prisma.Publicacion.deleteMany({
        where: {
          catedraId: catedraId,
        },
      });

      // Eliminar Respuestas de Alumnos relacionadas a Evaluaciones de esta cátedra
      await prisma.respuestaAlumno.deleteMany({
        where: {
          Pregunta: {
            Evaluacion: {
              catedraId: catedraId,
            },
          },
        },
      });

      // Eliminar Asistencias relacionadas a Días de Clase de esta cátedra
      await prisma.asistencia.deleteMany({
        where: {
          DiaClase: {
            catedraId: catedraId,
          },
        },
      });

      // Eliminar Días de Clase relacionados a esta cátedra
      await prisma.diaClase.deleteMany({
        where: {
          catedraId: catedraId,
        },
      });

      // Eliminar Opciones de Preguntas relacionadas a Evaluaciones de esta cátedra
      await prisma.opcion.deleteMany({
        where: {
          Pregunta: {
            Evaluacion: {
              catedraId: catedraId,
            },
          },
        },
      });

      // Eliminar Preguntas de Evaluaciones relacionadas a esta cátedra
      await prisma.pregunta.deleteMany({
        where: {
          Evaluacion: {
            catedraId: catedraId,
          },
        },
      });

      // Eliminar Calificaciones de Evaluaciones relacionadas a esta cátedra
      await prisma.calificacionEvaluacion.deleteMany({
        where: {
          Alumno: {
            CalificacionEvaluacion: {
              some: {
                // Relacionadas a evaluaciones de esta cátedra
              },
            },
          },
        },
      });

      // Eliminar Evaluaciones relacionadas a esta cátedra
      await prisma.evaluacion.deleteMany({
        where: {
          catedraId: catedraId,
        },
      });

      // Eliminar Tareas Maestras relacionadas a esta cátedra
      await prisma.TareaMaestra.deleteMany({
        where: {
          catedraId: catedraId,
        },
      });

      // Eliminar Puntuaciones relacionadas a esta cátedra
      await prisma.puntuacion.deleteMany({
        where: {
          catedraId: catedraId,
        },
      });

      // Eliminar Pagos relacionados a CatedraAlumno de esta cátedra
      const catedraAlumnos = await prisma.CatedraAlumno.findMany({
        where: { catedraId: catedraId },
        select: { id: true },
      });
      const catedraAlumnoIds = catedraAlumnos.map(ca => ca.id);

      await prisma.Pago.deleteMany({
        where: {
          catedraAlumnoId: {
            in: catedraAlumnoIds,
          },
        },
      });

      // Eliminar registros de CatedraAlumno relacionados a esta cátedra
      await prisma.CatedraAlumno.deleteMany({
        where: {
          catedraId: catedraId,
        },
      });

      // Eliminar CostosCatedra relacionados a esta cátedra
      await prisma.CostoCatedra.deleteMany({
        where: {
          catedraId: catedraId,
        },
      });

      // Eliminar HorariosPorDia relacionados a esta cátedra
      await prisma.CatedraDiaHorario.deleteMany({
        where: {
          catedraId: catedraId,
        },
      });

      // Finalmente, eliminar la cátedra
      await prisma.Catedra.delete({
        where: { id: catedraId },
      });

      res.status(204).send();
    } catch (error) {
      console.error('Error al eliminar cátedra y sus relaciones:', error);
      res.status(500).json({ error: 'Error al eliminar la cátedra y sus datos relacionados.' });
    }
  });

  // Admin: Get all students (Alumnos)
  router.get('/alumnos', requireAdmin, async (req, res) => {
    console.log('[ADMIN] Fetching all alumnos');
    try {
      const alumnos = await prisma.Alumno.findMany({
        orderBy: { apellido: 'asc' },
        include: {
          CatedraAlumno: true,
        },
      });
      res.status(200).json(alumnos);
    } catch (error) {
      console.error('Error fetching alumnos:', error);
      res.status(500).json({ error: 'Error al obtener la lista de alumnos.' });
    }
  });

  // Admin: Get all potential students for enrollment (Alumnos and Composers)

  // Admin: Desinscribir Alumno de Cátedra
  router.delete('/catedras/:catedraId/alumnos/:alumnoId/desinscribir', requireAdmin, async (req, res) => {
    const { catedraId, alumnoId } = req.params;
    try {
      await prisma.CatedraAlumno.delete({
        where: {
          catedraId_alumnoId: {
            catedraId: parseInt(catedraId),
            alumnoId: parseInt(alumnoId),
          },
        },
      });
      res.status(204).send();
    } catch (error) {
      console.error('Error al desinscribir alumno:', error);
      res.status(500).json({ error: 'Error al desinscribir al alumno.' });
    }
  });

  // Admin: Desinscribir Composer de Cátedra
  router.delete('/catedras/:catedraId/composers/:composerId/desinscribir', requireAdmin, async (req, res) => {
    const { catedraId, composerId } = req.params;
    try {
      await prisma.CatedraAlumno.delete({
        where: {
          catedraId_composerId: {
            catedraId: parseInt(catedraId),
            composerId: parseInt(composerId),
          },
        },
      });
      res.status(204).send();
    } catch (error) {
      console.error('Error al desinscribir composer:', error);
      res.status(500).json({ error: 'Error al desinscribir al compositor.' });
    }
  });

  router.get('/enrollment-candidates', requireAdmin, async (req, res) => {
    console.log('[ADMIN] Fetching all enrollment candidates');
    try {
      const alumnos = await prisma.Alumno.findMany({
        orderBy: { apellido: 'asc' },
      });

      const composers = await prisma.Composer.findMany({
        where: {
          student_first_name: {
            not: null,
          },
          student_last_name: {
            not: null,
          },
        },
        orderBy: {
          student_last_name: 'asc',
        },
      });

      const composerAlumnos = composers.map(composer => ({
        id: composer.id, // Usar el ID numérico del composer como ID principal
        nombre: composer.student_first_name,
        apellido: composer.student_last_name,
        email: `composer-${composer.id}@composer.com`, // Placeholder email
        isComposer: true,
        composerId: composer.id, // Mantener composerId para referencia en el frontend
      }));

      const allCandidates = [...alumnos, ...composerAlumnos];
      res.status(200).json(allCandidates);
    } catch (error) {
      console.error('Error fetching enrollment candidates:', error);
      res.status(500).json({ error: 'Error al obtener la lista de candidatos a inscripción.' });
    }
  });

  // Admin: Create a new student (Alumno)
  router.post('/alumnos', requireAdmin, async (req, res) => {
    const {
      nombre,
      apellido,
      email,
      telefono,
      direccion,
      instrumento,
      detalles_adicionales,
      vive_con_padres,
      nombre_tutor,
      telefono_tutor,
    } = req.body;

    if (!nombre || !apellido || !email) {
      return res.status(400).json({ error: 'Nombre, apellido y correo electrónico son obligatorios.' });
    }

    try {
      const newAlumno = await prisma.Alumno.create({
        data: {
          nombre,
          apellido,
          email,
          telefono,
          direccion,
          instrumento,
          detalles_adicionales,
          vive_con_padres,
          nombre_tutor: !vive_con_padres ? nombre_tutor : null,
          telefono_tutor: !vive_con_padres ? telefono_tutor : null,
        },
      });
      res.status(201).json(newAlumno);
    } catch (error) {
      if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
        return res.status(409).json({ error: 'El correo electrónico ya está en uso.' });
      }
      console.error('Error creating alumno:', error);
      res.status(500).json({ error: 'Error al crear alumno.' });
    }
  });

  // Admin: Get a specific student (Alumno)
  router.get('/alumnos/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;
    try {
      const alumno = await prisma.Alumno.findUnique({
        where: { id: parseInt(id) },
        include: {
          CatedraAlumno: true,
        },
      });
      if (!alumno) {
        return res.status(404).json({ error: 'Alumno no encontrado.' });
      }
      res.status(200).json(alumno);
    } catch (error) {
      console.error('Error fetching alumno:', error);
      res.status(500).json({ error: 'Error al obtener el alumno.' });
    }
  });

  // Admin: Update a student (Alumno)
  router.put('/alumnos/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;
    const {
      nombre,
      apellido,
      email,
      telefono,
      direccion,
      instrumento,
      detalles_adicionales,
      vive_con_padres,
      nombre_tutor,
      telefono_tutor,
    } = req.body;

    if (!nombre || !apellido || !email) {
      return res.status(400).json({ error: 'Nombre, apellido y correo electrónico son obligatorios.' });
    }

    try {
      const updatedAlumno = await prisma.Alumno.update({
        where: { id: parseInt(id) },
        data: {
          nombre,
          apellido,
          email,
          telefono,
          direccion,
          instrumento,
          detalles_adicionales,
          vive_con_padres,
          nombre_tutor: !vive_con_padres ? nombre_tutor : null,
          telefono_tutor: !vive_con_padres ? telefono_tutor : null,
        },
      });
      res.status(200).json(updatedAlumno);
    } catch (error) {
      console.error('Error updating alumno:', error);
      res.status(500).json({ error: 'Error al actualizar alumno.' });
    }
  });

  // Admin: Delete a student (Alumno)
  router.delete('/alumnos/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;
    try {
      await prisma.Alumno.delete({
        where: { id: parseInt(id) },
      });
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting alumno:', error);
      res.status(500).json({ error: 'Error al eliminar alumno.' });
    }
  });

  return router;
};
