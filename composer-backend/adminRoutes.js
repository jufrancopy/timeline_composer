const express = require('express');
const jwt = require('jsonwebtoken');
const { generateQuestionsWithAI } = require('./ai');
const requireAdmin = require('./middlewares/requireAdmin');

module.exports = (prisma, transporter) => {
  const router = express.Router();

  router.post('/admin/login', async (req, res) => {
    const { password } = req.body;
    
    if (password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign({ role: 'ADMIN' }, process.env.JWT_SECRET, { expiresIn: '8h' });
      return res.json({ token });
    }
    
    return res.status(401).json({ error: 'Contraseña incorrecta' });
  });


  // Admin management for Docentes
  router.get('/admin/docentes', requireAdmin, async (req, res) => {
    try {
      const docentes = await prisma.docente.findMany();
      res.status(200).json(docentes);
    } catch (error) {
      console.error('Error fetching docentes:', error);
      res.status(500).json({ error: 'Error al obtener docentes.' });
    }
  });

  router.post('/admin/docentes', requireAdmin, async (req, res) => {
    const { email, nombre, apellido, telefono, direccion } = req.body;
    if (!email || !nombre || !apellido) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios: email, nombre, apellido.' });
    }
    try {
      const newDocente = await prisma.docente.create({
        data: { email, nombre, apellido, telefono, direccion, otpEnabled: false }, // OTP is not enabled by default for admin-created docentes
      });
      res.status(201).json(newDocente);
    } catch (error) {
      console.error('Error creating docente:', error);
      res.status(500).json({ error: 'Error al crear docente.' });
    }
  });

  router.put('/admin/docentes/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { email, nombre, apellido, otpEnabled, telefono, direccion } = req.body;
    try {
      const updatedDocente = await prisma.docente.update({
        where: { id: parseInt(id) },
        data: { email, nombre, apellido, telefono, direccion, otpEnabled },
      });
      res.status(200).json(updatedDocente);
    } catch (error) {
      console.error('Error updating docente:', error);
      res.status(500).json({ error: 'Error al actualizar docente.' });
    }
  });

  router.delete('/admin/docentes/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;
    try {
      await prisma.docente.delete({
        where: { id: parseInt(id) },
      });
      res.status(204).send(); // No content
    } catch (error) {
      console.error('Error deleting docente:', error);
      res.status(500).json({ error: 'Error al eliminar docente.' });
    }
  });

  // Admin: Get all submitted tasks
  router.get('/admin/tasks/submitted', requireAdmin, async (req, res) => {
    try {
      const submittedTasks = await prisma.tarea.findMany({
        where: {
          submission_path: {
            not: null,
          },
        },
        include: {
          catedra: true,
          alumno: true,
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

  router.get('/admin/tasks/graded', requireAdmin, async (req, res) => {
    try {
      const gradedTasks = await prisma.tarea.findMany({
        where: {
          puntos_obtenidos: {
            not: null,
          },
        },
        include: {
          catedra: true,
          alumno: true,
        },
        orderBy: {
          submission_date: 'desc', // Assuming graded tasks also have a submission date for ordering
        },
      });
      res.status(200).json(gradedTasks);
    } catch (error) {
      console.error('Error fetching graded tasks:', error);
      res.status(500).json({ error: 'Error al obtener tareas calificadas.' });
    }
  });

  router.get('/admin/tasks/graded', requireAdmin, async (req, res) => {
    try {
      const gradedTasks = await prisma.tarea.findMany({
        where: {
          puntos_obtenidos: {
            not: null,
          },
        },
        include: {
          catedra: true,
          alumno: true,
        },
        orderBy: {
          submission_date: 'desc', // Assuming graded tasks also have a submission date for ordering
        },
      });
      res.status(200).json(gradedTasks);
    } catch (error) {
      console.error('Error fetching graded tasks:', error);
      res.status(500).json({ error: 'Error al obtener tareas calificadas.' });
    }
  });

  // Admin: Generate evaluation for a catedra
  router.post('/admin/catedras/:catedraId/generate-evaluation', requireAdmin, async (req, res) => {
    const { catedraId } = req.params;
    const { topic, subject, numberOfQuestions, numberOfOptions } = req.body;

    try {
      const catedra = await prisma.catedra.findUnique({
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
          preguntas: {
            create: generatedQuestions.map(p => ({
              texto: p.texto,
              opciones: {
                create: p.opciones,
              },
            })),
          },
        },
        include: {
          preguntas: {
            include: {
              opciones: true,
            },
          },
        },
      });

      // Fetch all students enrolled in the catedra to send notifications
      const enrolledStudents = await prisma.catedraAlumno.findMany({
        where: { catedraId: parseInt(catedraId), alumnoId: { not: null } },
        include: {
          alumno: {
            select: { email: true, nombre: true },
          },
        },
      });

      for (const enrollment of enrolledStudents) {
        if (enrollment.alumno && enrollment.alumno.email) {
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: enrollment.alumno.email,
            subject: `¡Nueva Evaluación Disponible en ${catedra.nombre} (Admin)!`,
            html: `
              <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #ffffff; background-color: #1a202c; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #2d3748; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);">
                  <h2 style="color: #9f7aea; text-align: center;">¡Hola ${enrollment.alumno.nombre}!</h2>
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
            console.log(`Notification email sent to ${enrollment.alumno.email} (Admin).`);
          } catch (emailError) {
            console.error(`Error sending email to ${enrollment.alumno.email} (Admin):`, emailError);
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
  router.post('/admin/catedras/:catedraId/tareas', requireAdmin, async (req, res) => {
    const { catedraId } = req.params;
    const { titulo, descripcion, puntos_posibles, fecha_entrega, recursos, multimedia_path } = req.body;

    try {
      const catedra = await prisma.catedra.findUnique({
        where: {
          id: parseInt(catedraId),
        },
      });

      if (!catedra) {
        return res.status(404).json({ error: 'Cátedra no encontrada.' });
      }

      const enrollments = await prisma.catedraAlumno.findMany({
        where: { catedraId: parseInt(catedraId), alumnoId: { not: null } },
        select: { alumnoId: true },
      });

      if (enrollments.length === 0) {
        return res.status(404).json({ error: 'No hay alumnos inscritos en esta cátedra para asignar la tarea.' });
      }

      const createdTasks = [];
      for (const enrollment of enrollments) {
        const newTarea = await prisma.tarea.create({
          data: {
            titulo,
            descripcion,
            puntos_posibles: parseInt(puntos_posibles),
            fecha_entrega: fecha_entrega ? new Date(fecha_entrega) : null,
            recursos,
            multimedia_path,
            catedra: { connect: { id: parseInt(catedraId) } },
            alumno: { connect: { id: enrollment.alumnoId } },
          },
        });
        createdTasks.push(newTarea);
      }

      // Send email notifications to students
      const studentEmails = await prisma.catedraAlumno.findMany({
        where: { catedraId: parseInt(catedraId), alumnoId: { not: null } },
        include: {
          alumno: {
            select: { email: true, nombre: true },
          },
        },
      });

      for (const studentEnrollment of studentEmails) {
        if (studentEnrollment.alumno && studentEnrollment.alumno.email) {
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: studentEnrollment.alumno.email,
            subject: `¡Nueva Tarea Asignada en ${catedra.nombre} (Admin)!`,
            html: `
              <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #ffffff; background-color: #1a202c; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #2d3748; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);">
                  <h2 style="color: #9f7aea; text-align: center;">¡Hola ${studentEnrollment.alumno.nombre}!</h2>
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
            console.log(`Task notification email sent to ${studentEnrollment.alumno.email} (Admin).`);
          } catch (emailError) {
            console.error(`Error sending task email to ${studentEnrollment.alumno.email} (Admin):`, emailError);
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

  // PUT /admin/catedras/:catedraId/modalidadpago - Actualizar la modalidad de pago de una cátedra
  router.put('/admin/catedras/:catedraId/modalidadpago', requireAdmin, async (req, res) => {
    const { catedraId } = req.params;
    const { modalidad_pago } = req.body;

    if (!modalidad_pago) {
      return res.status(400).json({ error: 'La modalidad de pago es obligatoria.' });
    }

    if (!['PARTICULAR', 'INSTITUCIONAL'].includes(modalidad_pago)) {
      return res.status(400).json({ error: 'Modalidad de pago inválida. Debe ser PARTICULAR o INSTITUCIONAL.' });
    }

    try {
      const updatedCatedra = await prisma.catedra.update({
        where: { id: parseInt(catedraId) },
        data: { modalidad_pago },
      });
      res.status(200).json(updatedCatedra);
    } catch (error) {
      console.error('Error al actualizar modalidad de pago de cátedra:', error);
      res.status(500).json({ error: 'Error al actualizar la modalidad de pago.', details: error.message });
    }
  });

  // PUT /admin/catedraalumno/:catedraAlumnoId/diacobro - Actualizar el día de cobro de un alumno en una cátedra
  router.put('/admin/catedraalumno/:catedraAlumnoId/diacobro', requireAdmin, async (req, res) => {
    const { catedraAlumnoId } = req.params;
    const { dia_cobro } = req.body;

    if (dia_cobro === undefined) {
      return res.status(400).json({ error: 'El día de cobro es obligatorio.' });
    }

    if (dia_cobro !== null && (dia_cobro < 1 || dia_cobro > 31)) {
      return res.status(400).json({ error: 'El día de cobro debe ser entre 1 y 31, o null.' });
    }

    try {
      const updatedCatedraAlumno = await prisma.catedraAlumno.update({
        where: { id: parseInt(catedraAlumnoId) },
        data: { dia_cobro },
      });
      res.status(200).json(updatedCatedraAlumno);
    } catch (error) {
      console.error('Error al actualizar día de cobro de CatedraAlumno:', error);
      res.status(500).json({ error: 'Error al actualizar el día de cobro.', details: error.message });
    }
  });

  // GET /admin/catedraalumno/:catedraAlumnoId/infoPago - Obtener información de pago para un CatedraAlumno
  router.get('/admin/catedraalumno/:catedraAlumnoId/infoPago', requireAdmin, async (req, res) => {
    const { catedraAlumnoId } = req.params;

    try {
      const catedraAlumno = await prisma.catedraAlumno.findUnique({
        where: { id: parseInt(catedraAlumnoId) },
        include: {
          alumno: {
            select: { nombre: true, apellido: true, email: true },
          },
          catedra: {
            select: { nombre: true, modalidad_pago: true },
          },
        },
      });

      if (!catedraAlumno) {
        return res.status(404).json({ error: 'Inscripción de alumno en cátedra no encontrada.' });
      }

      res.status(200).json({
        id: catedraAlumno.id,
        alumno: catedraAlumno.alumno,
        catedra: catedraAlumno.catedra,
        dia_cobro: catedraAlumno.dia_cobro,
        // Aquí se podría añadir lógica para calcular el estado de pago, vencimientos, etc.
        // Por ahora, solo devolvemos la información directa de la BD.
      });
    } catch (error) {
      console.error('Error al obtener información de pago de CatedraAlumno:', error);
      res.status(500).json({ error: 'Error al obtener la información de pago.', details: error.message });
    }
  });

  // --- Rutas para la gestión de Costos de Cátedra (Admin) ---

  // POST /admin/catedras/:catedraId/costos - Definir o actualizar los costos de una cátedra
  router.post('/admin/catedras/:catedraId/costos', requireAdmin, async (req, res) => {
    const { catedraId } = req.params;
    const { monto_matricula, monto_cuota, es_gratuita } = req.body;

    try {
      const catedra = await prisma.catedra.findUnique({
        where: { id: parseInt(catedraId) },
      });

      if (!catedra) {
        return res.status(404).json({ error: 'Cátedra no encontrada.' });
      }

      const upsertedCosto = await prisma.costoCatedra.upsert({
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
      res.status(500).json({ error: 'Error al definir o actualizar los costos de la cátedra.', details: error.message });
    }
  });

  // GET /admin/catedras/:catedraId/costos - Obtener los costos de una cátedra
  router.get('/admin/catedras/:catedraId/costos', requireAdmin, async (req, res) => {
    const { catedraId } = req.params;

    try {
      const costos = await prisma.costoCatedra.findUnique({
        where: { catedraId: parseInt(catedraId) },
      });

      if (!costos) {
        return res.status(404).json({ error: 'Costos de cátedra no encontrados.' });
      }

      res.status(200).json(costos);
    } catch (error) {
      console.error('Error al obtener costos de cátedra:', error);
      res.status(500).json({ error: 'Error al obtener los costos de la cátedra.', details: error.message });
    }
  });

  // GET /admin/alumnos/:alumnoId/catedras/:catedraId/estadoPago - Obtener el estado actual de pago de un alumno en una cátedra
  router.get('/admin/alumnos/:alumnoId/catedras/:catedraId/estadoPago', requireAdmin, async (req, res) => {
    const { alumnoId, catedraId } = req.params;

    try {
      const catedraAlumno = await prisma.catedraAlumno.findUnique({
        where: {
          catedraId_alumnoId: {
            catedraId: parseInt(catedraId),
            alumnoId: parseInt(alumnoId),
          },
        },
        include: {
          alumno: {
            select: { nombre: true, apellido: true, email: true },
          },
          catedra: {
            select: { nombre: true, modalidad_pago: true, costos: true },
          },
          pagos: {
            orderBy: { fecha_pago: 'desc' },
          },
        },
      });

      if (!catedraAlumno) {
        return res.status(404).json({ error: 'Inscripción de alumno en cátedra no encontrada.' });
      }

      const { alumno, catedra, dia_cobro, fecha_inscripcion, pagos } = catedraAlumno;
      const costosCatedra = catedra.costos;

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
        estadoActual: 'DESCONOCIDO', // Lógica a continuación
        deudaMatricula: 0,
        deudaCuotas: [],
      };

      if (costosCatedra && costosCatedra.es_gratuita) {
        estadoPago.estadoActual = 'GRATUITO';
      } else {
        // Lógica para matrícula
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

        // Lógica para cuotas
        if (costosCatedra && costosCatedra.monto_cuota && dia_cobro) {
          const hoy = new Date();
          let mesActual = hoy.getMonth();
          let anoActual = hoy.getFullYear();

          const fechaInicioCuota = new Date(fecha_inscripcion);
          fechaInicioCuota.setDate(dia_cobro); // Establecer el día de cobro para la primera cuota

          let currentMonth = fechaInicioCuota.getMonth();
          let currentYear = fechaInicioCuota.getFullYear();

          // Asegurarse de que el día de cobro no exceda los días del mes actual
          while (currentYear < anoActual || (currentYear === anoActual && currentMonth <= mesActual)) {
            const tempDate = new Date(currentYear, currentMonth, dia_cobro);
            // Si el día de cobro es mayor que los días del mes, ajustarlo al último día del mes
            if (tempDate.getMonth() !== currentMonth) {
              tempDate.setDate(0); // Último día del mes anterior, luego se ajusta al mes actual en la siguiente línea
              tempDate.setDate(dia_cobro);
            }

            const periodo = `${tempDate.toLocaleString('es-ES', { month: 'long' })} ${currentYear}`;
            const pagoCuota = pagos.find(p => p.tipo_pago === 'CUOTA' && p.periodo_cubierto === periodo);

            if (!pagoCuota) {
              // Si la fecha de cobro para este mes ya pasó
              if (hoy.getDate() > dia_cobro || (hoy.getMonth() > currentMonth && hoy.getFullYear() === currentYear) || hoy.getFullYear() > currentYear) {
                estadoPago.deudaCuotas.push({
                  periodo: periodo,
                  monto: costosCatedra.monto_cuota,
                  estado: 'PENDIENTE',
                });
              } else {
                 // Si aún no ha llegado el día de cobro para este mes, se considera al día por ahora
                 // Se puede refinar esta lógica para "cuota próxima"
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
            if (currentYear > anoActual || (currentYear === anoActual && currentMonth > mesActual)) break; // Evitar cuotas futuras
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
      res.status(500).json({ error: 'Error al obtener el estado de pago.', details: error.message });
    }
  });

  // Admin: Get a specific catedra
  router.get('/admin/catedras/:id', requireAdmin, async (req, res) => {
    try {
      const catedraId = parseInt(req.params.id);

      const catedra = await prisma.catedra.findUnique({
        where: { id: catedraId },
        include: {
          evaluaciones: true,
          tareas: true,
          alumnos: {
            include: {
              alumno: true,
              composer: true,
            },
          },
          diasClase: { // Incluir la relación diasClase
            include: { asistencias: true }, // Incluir las asistencias de cada día de clase
          },
          horariosPorDia: true, // Incluir la nueva relación horariosPorDia
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
  router.get('/admin/catedras', requireAdmin, async (req, res) => {
    try {
      const catedras = await prisma.catedra.findMany({
        include: {
          alumnos: {
            select: { id: true }
          },
          horariosPorDia: true, // Incluir los horarios por día
        },
      });
      res.status(200).json(catedras);
    } catch (error) {
      console.error('Error fetching all catedras for admin:', error);
      res.status(500).json({ error: 'Error al obtener las cátedras.' });
    }
  });

  router.post('/admin/catedras', requireAdmin, async (req, res) => {
    const { nombre, anio, institucion, turno, aula, dias, docenteId, modalidad_pago, horariosPorDia } = req.body;

    console.log('[Catedra POST] Received horariosPorDia:', horariosPorDia);

    if (isNaN(parseInt(anio))) {
      return res.status(400).json({ error: 'El año académico debe ser un número válido.' });
    }

    if (docenteId && isNaN(parseInt(docenteId))) {
      return res.status(400).json({ error: 'El ID del docente debe ser un número válido.' });
    }

    try {
      const newCatedra = await prisma.catedra.create({
        data: {
          nombre,
          anio: parseInt(anio),
          institucion,
          turno,
          aula,
          dias: dias,
          modalidad_pago,
          docente: docenteId ? { connect: { id: parseInt(docenteId) } } : undefined,
          horariosPorDia: horariosPorDia && Array.isArray(horariosPorDia) && horariosPorDia.length > 0 ? {
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
      res.status(500).json({ error: 'Error al crear la cátedra.', details: error.message });
    }
  });

  router.put('/admin/catedras/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { nombre, anio, institucion, turno, aula, dias, docenteId, modalidad_pago, horariosPorDia } = req.body;

    console.log('[Catedra PUT] Received horariosPorDia:', horariosPorDia);

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
          horariosPorDia: horariosPorDia && Array.isArray(horariosPorDia) && horariosPorDia.length > 0 ? {
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
      console.error('Error al procesar horariosPorDia en actualización de cátedra:', error);

      console.error('Error al actualizar cátedra:', error);
      res.status(500).json({ error: 'Error al actualizar la cátedra.', details: error.message });
    }
  });

  router.delete('/admin/catedras/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;
    try {
      const catedraId = parseInt(id);

      // Eliminar Comentarios de Publicaciones relacionadas a esta cátedra
      await prisma.comentarioPublicacion.deleteMany({
        where: {
          publicacion: {
            catedraId: catedraId,
          },
        },
      });

      // Eliminar Publicaciones relacionadas a esta cátedra
      await prisma.publicacion.deleteMany({
        where: {
          catedraId: catedraId,
        },
      });

      // Eliminar Respuestas de Alumnos relacionadas a Evaluaciones de esta cátedra
      await prisma.respuestaAlumno.deleteMany({
        where: {
          pregunta: {
            evaluacion: {
              catedraId: catedraId,
            },
          },
        },
      });

      // Eliminar Asistencias relacionadas a Días de Clase de esta cátedra
      await prisma.asistencia.deleteMany({
        where: {
          diaClase: {
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
          pregunta: {
            evaluacion: {
              catedraId: catedraId,
            },
          },
        },
      });

      // Eliminar Preguntas de Evaluaciones relacionadas a esta cátedra
      await prisma.pregunta.deleteMany({
        where: {
          evaluacion: {
            catedraId: catedraId,
          },
        },
      });

      // Eliminar Calificaciones de Evaluaciones relacionadas a esta cátedra
      await prisma.calificacionEvaluacion.deleteMany({
        where: {
          evaluacion: {
            catedraId: catedraId,
          },
        },
      });

      // Eliminar Evaluaciones relacionadas a esta cátedra
      await prisma.evaluacion.deleteMany({
        where: {
          catedraId: catedraId,
        },
      });

      // Eliminar Tareas relacionadas a esta cátedra
      await prisma.tarea.deleteMany({
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
      const catedraAlumnos = await prisma.catedraAlumno.findMany({
        where: { catedraId: catedraId },
        select: { id: true },
      });
      const catedraAlumnoIds = catedraAlumnos.map(ca => ca.id);

      await prisma.pago.deleteMany({
        where: {
          catedraAlumnoId: {
            in: catedraAlumnoIds,
          },
        },
      });

      // Eliminar registros de CatedraAlumno relacionados a esta cátedra
      await prisma.catedraAlumno.deleteMany({
        where: {
          catedraId: catedraId,
        },
      });

      // Eliminar CostosCatedra relacionados a esta cátedra
      await prisma.costoCatedra.deleteMany({
        where: {
          catedraId: catedraId,
        },
      });

      // Eliminar HorariosPorDia relacionados a esta cátedra
      await prisma.catedraDiaHorario.deleteMany({
        where: {
          catedraId: catedraId,
        },
      });

      // Finalmente, eliminar la cátedra
      await prisma.catedra.delete({
        where: { id: catedraId },
      });

      res.status(204).send(); // No content
    } catch (error) {
      console.error('Error al eliminar cátedra y sus relaciones:', error);
      res.status(500).json({ error: 'Error al eliminar la cátedra y sus datos relacionados.', details: error.message });
    }
  });

  // Admin: Get all students (Alumnos)
  router.get('/admin/alumnos', requireAdmin, async (req, res) => {
    try {
      const alumnos = await prisma.alumno.findMany({
        orderBy: { apellido: 'asc' },
        include: {
          catedras: true,
        },
      });
      res.status(200).json(alumnos);
    } catch (error) {
      console.error('Error fetching alumnos:', error);
      res.status(500).json({ error: 'Error al obtener la lista de alumnos.' });
    }
  });

  // Admin: Create a new student (Alumno)
  router.post('/admin/alumnos', requireAdmin, async (req, res) => {
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
      const newAlumno = await prisma.alumno.create({
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
      res.status(500).json({ error: 'Error al crear alumno.', details: error.message });
    }
  });

  // Admin: Get a specific student (Alumno)
  router.get('/admin/alumnos/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;
    try {
      const alumno = await prisma.alumno.findUnique({
        where: { id: parseInt(id) },
        include: {
          catedras: true, // Assuming you want to include enrolled catedras
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
  router.put('/admin/alumnos/:id', requireAdmin, async (req, res) => {
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
      const updatedAlumno = await prisma.alumno.update({
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
      res.status(500).json({ error: 'Error al actualizar alumno.', details: error.message });
    }
  });

  // Admin: Delete a student (Alumno)
  router.delete('/admin/alumnos/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;
    try {
      await prisma.alumno.delete({
        where: { id: parseInt(id) },
      });
      res.status(204).send(); // No content
    } catch (error) {
      console.error('Error deleting alumno:', error);
      res.status(500).json({ error: 'Error al eliminar alumno.' });
    }
  });

  // Admin: Get all composers
  router.get('/admin/composers', requireAdmin, async (req, res) => {
    try {
      const composers = await prisma.composer.findMany({
        orderBy: {
          apellido: 'asc',
        },
      });
      res.status(200).json(composers);
    } catch (error) {
      console.error('Error fetching composers:', error);
      res.status(500).json({ error: 'Error al obtener los compositores.' });
    }
  });

  return router;
};
