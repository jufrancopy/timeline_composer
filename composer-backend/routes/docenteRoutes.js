const express = require('express');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const { generateQuestionsWithAI } = require('../ai');
const requireDocente = require('../middlewares/requireDocente');
const upload = require('../utils/multerConfig'); // Import multer configuration
const path = require('path');

module.exports = (prisma, transporter) => {
  const router = express.Router();

  // Route for multimedia file upload
  router.post('/docente/upload/multimedia', requireDocente, upload.single('file'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó ningún archivo.' });
    }
    // El path se guarda como uploads/tareas/nombre_del_archivo.ext
    const filePath = `/uploads/tareas/${req.file.filename}`;
    console.log('[DOCENTE UPLOAD] Archivo subido exitosamente. Path:', filePath);
    res.status(200).json({ message: 'Archivo subido exitosamente.', filePath });
  });

  // Request OTP for Docente Login
  router.post('/docente/request-otp', async (req, res) => {
    console.log('[DOCENTE OTP] Solicitud de OTP recibida:', req.body);
    const { email } = req.body;
    console.log(`[DOCENTE OTP] Email recibido: ${email}`);

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    try {
      let docente = await prisma.docente.findUnique({ where: { email } });

      if (!docente) {
        docente = await prisma.docente.create({
          data: {
            email,
            nombre: email.split('@')[0],
            apellido: 'Docente',
            otpEnabled: false,
          },
        });
      }

      const secret = speakeasy.generateSecret({ length: 20 }).base32;
      const otp = speakeasy.totp({
        secret: secret,
        encoding: 'base32',
        step: 300, // OTP valid for 5 minutes
      });

      await prisma.docente.update({
        where: { id: docente.id },
        data: {
          otpSecret: secret,
          otpEnabled: true,
        },
      });

      const mailOptions = {
        from: `"HMPY (Historia de la Música PY - Academia)" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Tu código OTP para iniciar sesión como Docente en HMPY',
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #ffffff; background-color: #1a202c; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #2d3748; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);">
              <h2 style="color: #9f7aea; text-align: center;">Tu Código de Verificación (OTP) para Docentes</h2>
              <p style="color: #e2e8f0;">Tu código de un solo uso (OTP) para iniciar sesión en el portal de docentes de HMPY es:</p>
              <p style="font-size: 24px; font-weight: bold; text-align: center; color: #667eea; background-color: #4a5568; padding: 10px; border-radius: 4px;">${otp}</p>
              <p style="color: #e2e8f0;">Este código es válido por 5 minutos. Por favor, no lo compartas con nadie.</p>
              <p style="color: #e2e8f0;">Si no solicitaste este código, por favor ignora este correo electrónico.</p>
              <p style="color: #cbd5e0; font-size: 0.9em; text-align: center; margin-top: 20px;">Atentamente, El Equipo de HMPY</p>
            </div>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: 'OTP sent to email' });

    } catch (error) {
      console.error('Error requesting docente OTP:', error);
      res.status(500).json({ message: 'Internal server error', details: error.message });
    }
  });

  // Verify OTP and Login Docente
  router.post('/docente/verify-otp', async (req, res) => {
    console.log('[DOCENTE VERIFY] Verificación de OTP recibida:', req.body);
    const { email, otp } = req.body;
    console.log(`[DOCENTE VERIFY] Email recibido: ${email}, OTP recibido (parcial): ${otp ? otp.substring(0, 3) + '...' : 'VACÍO'}`);

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    try {
      const docente = await prisma.docente.findUnique({ where: { email } });

      if (!docente || !docente.otpSecret || !docente.otpEnabled) {
        return res.status(401).json({ message: 'Invalid email or OTP not requested' });
      }

      console.log(`[DOCENTE VERIFY] Secret del docente (parcial): ${docente.otpSecret ? docente.otpSecret.substring(0, 3) + '...' : 'NO CONFIGURADO'}`);
      const tokenValidates = speakeasy.totp.verify({
        secret: docente.otpSecret,
        encoding: 'base32',
        token: otp,
        window: 1, // Allow a 30-second leeway
        step: 300,
      });
      console.log(`[DOCENTE VERIFY] Resultado de la validación del OTP: ${tokenValidates}`);

      if (!tokenValidates) {
        return res.status(401).json({ message: 'Invalid OTP' });
      }

      // OTP is valid, generate JWT
      const jwtToken = jwt.sign(
        { docenteId: docente.id, email: docente.email, role: 'docente' },
        process.env.JWT_SECRET,
        { expiresIn: '8h' } // Token expires in 8 hours
      );

      res.status(200).json({ message: 'Login successful', token: jwtToken, docente });

    } catch (error) {
      console.error('Error verifying docente OTP:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Get catedras assigned to the logged-in docente
  router.get('/docente/me/catedras', requireDocente, async (req, res) => {
    try {
      const docenteId = req.docente.docenteId;
      console.log(`[DOCENTE CATEDRAS] Docente ID: ${docenteId}`);

      const catedras = await prisma.catedra.findMany({
        where: { docenteId: docenteId },
        include: {
          Evaluacion: true,
          TareaMaestra: {
            include: {
              _count: {
                select: { TareaAsignacion: true }
              }
            }
          }, // Incluir conteo de asignaciones
          CatedraAlumno: {
            include: {
              Alumno: true,
              Composer: true,
            },
          },
        },
      });
      res.status(200).json(catedras);
    } catch (error) {
      console.error('Error fetching docente catedras:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Get a specific catedra for the logged-in docente
  router.get('/docente/me/catedra/:id', requireDocente, async (req, res) => {
    try {
      const docenteId = req.docente.docenteId;
      const catedraId = parseInt(req.params.id);

      const catedra = await prisma.catedra.findUnique({
        where: { id: catedraId, docenteId: docenteId },
        include: {
          Evaluacion: true,
          TareaMaestra: {
            include: {
              TareaAsignacion: true, // Incluir asignaciones para obtener su estado
            },
          },
          CatedraAlumno: {
            include: {
              Alumno: true,
              Composer: true,
            },
          },
          DiaClase: { // Incluir la relación diasClase
            include: { Asistencia: true }, // Incluir las asistencias de cada día de clase
          },
          CatedraDiaHorario: true, // Incluir la nueva relación horariosPorDia
        },
      });

      if (!catedra) {
        return res.status(404).json({ message: 'Catedra not found or not assigned to this docente' });
      }
      res.status(200).json(catedra);
    } catch (error) {
      console.error('Error fetching specific docente catedra:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // GET /docente/me/catedra/:catedraId/planes - Obtener todos los planes de clases de una cátedra
  router.get('/docente/me/catedra/:catedraId/planes', requireDocente, async (req, res) => {
    const { catedraId } = req.params;
    const docenteId = req.docente.docenteId;

    try {
      const catedra = await prisma.catedra.findFirst({
        where: {
          id: parseInt(catedraId),
          docenteId: docenteId,
        },
      });

      if (!catedra) {
        return res.status(404).json({ error: 'Cátedra no encontrada o acceso denegado.' });
      }

      const planesDeClases = await prisma.planDeClases.findMany({
        where: {
          catedraId: parseInt(catedraId),
        },
        orderBy: { created_at: 'desc' },
      });

      res.status(200).json(planesDeClases);
    } catch (error) {
      console.error('Error al obtener planes de clases para docente:', error);
      res.status(500).json({ error: 'Error al obtener los planes de clases.', details: error.message });
    }
  });

  // Rutas para la gestión de días de clase
  router.post('/docente/catedra/:catedraId/diasclase', requireDocente, async (req, res) => {
    const { catedraId } = req.params;
    const { fecha } = req.body;
    console.log('Fecha recibida en POST para DiaClase:', fecha); // <--- LOG TEMPORAL
    const docenteId = req.docente.docenteId;

    if (!fecha) {
      return res.status(400).json({ error: 'Fecha es obligatoria.' });
    }

    // Calcular dia_semana a partir de la fecha
    const dateObj = new Date(fecha);
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const dia_semana = days[dateObj.getDay()];

    if (!dia_semana) {
        return res.status(400).json({ error: 'Día de la semana no válido para la fecha proporcionada.' });
    }

    try {
      const catedra = await prisma.catedra.findFirst({
        where: {
          id: parseInt(catedraId),
          docenteId: docenteId,
        },
      });

      if (!catedra) {
        return res.status(404).json({ error: 'Cátedra no encontrada o acceso denegado.' });
      }

      const newDiaClase = await prisma.diaClase.create({
        data: {
          catedraId: parseInt(catedraId),
          fecha: new Date(fecha),
          dia_semana,
        },
      });
      res.status(201).json(newDiaClase);
    } catch (error) {
      console.error('Error al crear día de clase para docente:', error);
      res.status(500).json({ error: 'Error al guardar el día de clase.', details: error.message });
    }
  });

  router.get('/docente/catedra/:catedraId/diasclase', requireDocente, async (req, res) => {
    const { catedraId } = req.params;
    const docenteId = req.docente.docenteId;

    try {
      const catedra = await prisma.catedra.findFirst({
        where: {
          id: parseInt(catedraId),
          docenteId: docenteId,
        },
      });

      if (!catedra) {
        return res.status(404).json({ error: 'Cátedra no encontrada o acceso denegado.' });
      }

      const diasClase = await prisma.diaClase.findMany({
        where: {
          catedraId: parseInt(catedraId),
        },
        include: {
          Asistencia: true, // Incluir asistencias para poder pre-cargar el estado
        },
        orderBy: { fecha: 'asc' },
      });

      res.status(200).json(diasClase);
    } catch (error) {
      console.error('Error al obtener días de clase para docente:', error);
      res.status(500).json({ error: 'Error al obtener los días de clase.', details: error.message });
    }
  });

  // PUT /docente/diasclase/:diaClaseId - Actualizar un día de clase
  router.put('/docente/catedra/:catedraId/diasclase/:diaClaseId', requireDocente, async (req, res) => {
    const { catedraId, diaClaseId } = req.params;
    const { fecha } = req.body;
    console.log('Fecha recibida en PUT para DiaClase:', fecha); // <--- LOG TEMPORAL
    const docenteId = req.docente.docenteId;

    if (!fecha) {
      return res.status(400).json({ error: 'Fecha es obligatoria.' });
    }

    // Calcular dia_semana a partir de la fecha
    const dateObj = new Date(fecha);
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const dia_semana = days[dateObj.getDay()];

    if (!dia_semana) {
        return res.status(400).json({ error: 'Día de la semana no válido para la fecha proporcionada.' });
    }

    try {
      const existingDiaClase = await prisma.diaClase.findFirst({
        where: { id: parseInt(diaClaseId), catedraId: parseInt(catedraId)  },
        include: { Catedra: true },
      });

      if (!existingDiaClase) {
        return res.status(404).json({ error: 'Día de clase no encontrado.' });
      }

      if (existingDiaClase.Catedra.docenteId !== docenteId) {
        return res.status(403).json({ error: 'No tiene permiso para editar este día de clase.' });
      }

      const updatedDiaClase = await prisma.diaClase.update({
        where: { id: parseInt(diaClaseId) },
        data: {
          fecha: new Date(fecha),
          dia_semana,
        },
      });
      res.status(200).json(updatedDiaClase);
    } catch (error) {
      console.error('Error al actualizar día de clase para docente:', error);
      res.status(500).json({ error: 'Error al actualizar el día de clase.', details: error.message });
    }
  });

  // DELETE /docente/diasclase/:diaClaseId - Eliminar un día de clase
  router.delete('/docente/catedra/:catedraId/diasclase/:diaClaseId', requireDocente, async (req, res) => {
    const { catedraId, diaClaseId } = req.params;
    const docenteId = req.docente.docenteId;

    if (isNaN(parseInt(diaClaseId))) {
      return res.status(400).json({ error: 'ID de día de clase no válido.' });
    }

    try {
      const deleteResult = await prisma.diaClase.deleteMany({
        where: {
          id: parseInt(diaClaseId),
          catedraId: parseInt(catedraId),
          Catedra: {
            docenteId: docenteId,
          },
        },
      });

      if (deleteResult.count === 0) {
        return res.status(404).json({ error: 'Día de clase no encontrado o no tiene permiso para eliminarlo.' });
      }

      res.status(200).json({ message: 'Día de clase eliminado con éxito.' });

      // Eliminar asistencias asociadas primero
      await prisma.Asistencia.deleteMany({
        where: { diaClaseId: parseInt(diaClaseId) },
      });

      await prisma.DiaClase.delete({
        where: { id: parseInt(diaClaseId) },
      });

      res.status(204).send();
    } catch (error) {
      console.error('Error al eliminar día de clase para docente:', error);
      res.status(500).json({ error: 'Error al eliminar el día de clase.', details: error.message });
    }
  });

    // GET /docente/catedra/:catedraId/diasclase/:diaClaseId/asistencias - Obtener asistencias para un día de clase
  router.get('/docente/catedra/:catedraId/diasclase/:diaClaseId/asistencias', requireDocente, async (req, res) => {
    const { catedraId, diaClaseId } = req.params;
    const docenteId = req.docente.docenteId;

    try {
      // Verificar que el día de clase y la cátedra pertenecen al docente
      const diaClase = await prisma.DiaClase.findFirst({
        where: {
          id: parseInt(diaClaseId),
          catedraId: parseInt(catedraId),
          Catedra: {
            docenteId: docenteId,
          },
        },
        include: {
          Asistencia: true, // Incluir asistencias existentes
        },
      });

      if (!diaClase) {
        return res.status(404).json({ error: 'Día de clase no encontrado en esta cátedra o acceso denegado.' });
      }

      res.status(200).json(diaClase.Asistencia);
    } catch (error) {
      console.error('Error al obtener asistencias para docente:', error);
      res.status(500).json({ error: 'Error al obtener las asistencias.', details: error.message });
    }
  });

    // GET /docente/catedra/:catedraId/asistencias/anual/:year - Obtener asistencias de un año para una cátedra
  router.get('/docente/catedra/:catedraId/asistencias/anual/:year', requireDocente, async (req, res) => {
    console.log(`[BACKEND] Ruta /docente/catedra/:catedraId/asistencias/anual/:year fue alcanzada para catedraId: ${req.params.catedraId}, year: ${req.params.year}`);
    const { catedraId, year } = req.params;
    const docenteId = req.docente.docenteId;

    try {
      const parsedCatedraId = parseInt(catedraId);
      const parsedYear = parseInt(year);

      if (isNaN(parsedCatedraId) || isNaN(parsedYear)) {
        return res.status(400).json({ error: 'ID de cátedra y año deben ser números válidos.' });
      }

      // Verificar que la cátedra pertenece al docente
      const catedra = await prisma.catedra.findFirst({
        where: {
          id: parsedCatedraId,
          docenteId: docenteId,
        },
      });

      if (!catedra) {
        return res.status(404).json({ error: 'Cátedra no encontrada o acceso denegado.' });
      }

      // Obtener todos los días de clase para la cátedra en el año especificado
      const diasClase = await prisma.diaClase.findMany({
        where: {
          catedraId: parsedCatedraId,
          fecha: {
            gte: new Date(`${parsedYear}-01-01T00:00:00.000Z`),
            lt: new Date(`${parsedYear + 1}-01-01T00:00:00.000Z`),
          },
        },
        include: {
          Asistencia: {
            include: {
              Alumno: {
                select: { id: true, nombre: true, apellido: true }
              },

            }
          },
        },
        orderBy: {
          fecha: 'asc',
        },
      });

      // Formatear los datos para el frontend
      const formattedAttendance = diasClase.map(dia => ({
        id: dia.id,
        fecha: dia.fecha,
        dia_semana: dia.dia_semana,
        asistencias: dia.Asistencia.map(asistencia => ({
          alumnoId: asistencia.alumnoId,
          composerId: asistencia.composerId,
          nombreCompleto: `${asistencia.Alumno.nombre} ${asistencia.Alumno.apellido}`,
          presente: asistencia.presente,
        })),
      }));

      res.status(200).json(formattedAttendance);
    } catch (error) {
      console.error('Error al obtener asistencias anuales para docente:', error);
      res.status(500).json({ error: 'Error al obtener las asistencias anuales.', details: error.message });
    }
  });

  // POST /docente/catedra/:catedraId/diasclase/:diaClaseId/toggle-asistencia - Marcar/desmarcar asistencia
  router.post('/docente/catedra/:catedraId/diasclase/:diaClaseId/toggle-asistencia', requireDocente, async (req, res) => {
    const { catedraId, diaClaseId } = req.params;
    const { alumnoId, presente } = req.body; // `presente` será true o false
    const docenteId = req.docente.docenteId;

    if (!alumnoId || typeof presente !== 'boolean') {
      return res.status(400).json({ error: 'ID de alumno y estado de asistencia son obligatorios.' });
    }

    try {
      // Verificar que el día de clase y la cátedra pertenecen al docente
      const catedra = await prisma.Catedra.findFirst({
        where: {
          id: parseInt(catedraId),
          docenteId: docenteId,
        },
      });

      if (!catedra) {
        return res.status(404).json({ error: 'Cátedra no encontrada o acceso denegado.' });
      }

      const diaClase = await prisma.DiaClase.findFirst({
        where: {
          id: parseInt(diaClaseId),
          catedraId: parseInt(catedraId),
        },
      });

      if (!diaClase) {
        return res.status(404).json({ error: 'Día de clase no encontrado en esta cátedra.' });
      }

      // Upsert la asistencia (crear si no existe, actualizar si existe)
      const asistencia = await prisma.Asistencia.upsert({
        where: {
          alumnoId_diaClaseId: {
            alumnoId: parseInt(alumnoId),
            diaClaseId: parseInt(diaClaseId),
          },
        },
        update: { presente },
        create: {
          alumnoId: parseInt(alumnoId),
          diaClaseId: parseInt(diaClaseId),
          presente,
        },
      });

      res.status(200).json(asistencia);
    } catch (error) {
      console.error('Error al actualizar asistencia para docente:', error);
      res.status(500).json({ error: 'Error al actualizar la asistencia.', details: error.message });
    }
  });

  // GET /docentes/catedras/:catedraId/tareas-maestras - Obtener todas las tareas maestras de una cátedra
  router.get('/docente/catedra/:catedraId/tareas-maestras', requireDocente, async (req, res) => {
    const { catedraId } = req.params;
    const docenteId = req.docente.docenteId;

    try {
      const catedra = await prisma.catedra.findFirst({
        where: {
          id: parseInt(catedraId),
          docenteId: docenteId,
        },
      });

      if (!catedra) {
        return res.status(404).json({ error: 'Cátedra no encontrada o acceso denegado.' });
      }

      const tareasMaestras = await prisma.tareaMaestra.findMany({
        where: {
          catedraId: parseInt(catedraId),
        },
        orderBy: {
          created_at: 'desc',
        },
      });

      res.status(200).json(tareasMaestras);
    } catch (error) {
      console.error('Error al obtener tareas maestras:', error);
      res.status(500).json({ error: 'Error al obtener las tareas maestras.', details: error.message });
    }
  });

  // GET /docentes/catedras/:catedraId/tareas-maestras/:tareaMaestraId - Obtener una tarea maestra específica de una cátedra
  router.get('/docente/catedra/:catedraId/tareas-maestras/:tareaMaestraId', requireDocente, async (req, res) => {
    const { catedraId, tareaMaestraId } = req.params;
    const docenteId = req.docente.docenteId;

    try {
      const catedra = await prisma.catedra.findFirst({
        where: {
          id: parseInt(catedraId),
          docenteId: docenteId,
        },
      });

      if (!catedra) {
        return res.status(404).json({ error: 'Cátedra no encontrada o acceso denegado.' });
      }

      const tareaMaestra = await prisma.tareaMaestra.findUnique({
        where: {
          id: parseInt(tareaMaestraId),
          catedraId: parseInt(catedraId),
        },
        include: {
          TareaAsignacion: {
            select: {
              alumnoId: true,
            },
          },
        },
      });

      if (!tareaMaestra) {
        return res.status(404).json({ error: 'Tarea maestra no encontrada o no pertenece a esta cátedra.' });
      }

      res.status(200).json(tareaMaestra);
    } catch (error) {
      console.error('Error al obtener tarea maestra específica:', error);
      res.status(500).json({ error: 'Error al obtener la tarea maestra.', details: error.message });
    }
  });


  // Create a new master task for a catedra
  router.post('/docente/catedra/:catedraId/tareas', requireDocente, async (req, res) => {
    const { catedraId } = req.params;
    const { titulo, descripcion, puntos_posibles, fecha_entrega, recursos, multimedia_path } = req.body;
    const docenteId = req.docente.docenteId;
    console.log('[DOCENTE TAREAS] Contenido de req.body:', req.body);
    console.log('[DOCENTE TAREAS] Título extraído de req.body:', titulo);

    try {
      // Verify the catedra belongs to the docente
      const catedra = await prisma.catedra.findFirst({
        where: {
          id: parseInt(catedraId),
          docenteId: docenteId,
        }
      });

      if (!catedra) {
        return res.status(404).json({ error: 'Cátedra not found or access denied.' });
      }

      // Create the master task
      const newTareaMaestra = await prisma.tareaMaestra.create({
        data: {
          titulo,
          descripcion,
          puntos_posibles: parseInt(puntos_posibles),
          fecha_entrega: fecha_entrega ? new Date(fecha_entrega) : null,
          recursos,
          multimedia_path,
          Catedra: { connect: { id: parseInt(catedraId) } },
        },
      });

      // Create a publicacion for the new master task in the catedra's board
      const publicacionTitle = `Nueva Tarea: ${titulo}`;
      const formattedFechaEntrega = fecha_entrega ? new Date(fecha_entrega).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) : 'No definida';

      const publicacionContent = `
      <p>Se ha creado una nueva tarea: <strong>${titulo}</strong>.</p>
      <p><strong>Descripción:</strong> ${descripcion || 'Sin descripción'}.</p>
      <p><strong>Fecha de Entrega:</strong> ${formattedFechaEntrega}.</p>
          `;

      const newPublicacion = await prisma.publicacion.create({
        data: {
          titulo: publicacionTitle,
          contenido: publicacionContent,
          tipo: 'TAREA',
          catedraId: parseInt(catedraId),
          autorDocenteId: docenteId,
          visibleToStudents: false, // Correctly set to false initially
          tareaMaestraId: newTareaMaestra.id, // Establish the crucial link here
        },
      });

      // Update the TareaMaestra with the publicacionId for the back-reference
      await prisma.tareaMaestra.update({
        where: { id: newTareaMaestra.id },
        data: { publicacionId: newPublicacion.id },
      });

      res.status(201).json({ message: `Tarea maestra \'${newTareaMaestra.titulo}\' creada exitosamente. Ahora puedes asignarla a los alumnos.`, tareaMaestra: newTareaMaestra });

    } catch (error) {
      console.error('Error creating master task for docente:', error);
      res.status(500).json({ error: 'Failed to create master task.', details: error.message });
    }
  });

  // New route to assign a master task to students
  router.post('/docente/catedra/:catedraId/tareas-maestras/:tareaMaestraId/assign', requireDocente, async (req, res) => {
    const { catedraId, tareaMaestraId } = req.params;
    const { alumnoIds } = req.body; // Array of alumno IDs
    const docenteId = req.docente.docenteId;

    if (!Array.isArray(alumnoIds) || alumnoIds.length === 0) {
      return res.status(400).json({ error: 'Se requiere una lista de IDs de alumnos para asignar la tarea.' });
    }

    try {
      const tareaMaestra = await prisma.TareaMaestra.findUnique({
        where: { id: parseInt(tareaMaestraId) },
        include: {
          Catedra: true,
          Publicacion: true, // Incluir publicacion para obtener su ID
        },
      });

      if (!tareaMaestra) {
        return res.status(404).json({ error: 'Tarea maestra no encontrada.' });
      }

      if (tareaMaestra.Catedra.docenteId !== docenteId) {
        return res.status(403).json({ error: 'No tiene permiso para asignar esta tarea maestra.' });
      }

      const assignedTasks = [];
      for (const alumnoId of alumnoIds) {
        const alumnoIdInt = parseInt(alumnoId);

        const alumno = await prisma.Alumno.findUnique({ where: { id: alumnoIdInt } });
        if (!alumno) {
          console.warn(`Alumno con ID ${alumnoId} no encontrado. Saltando asignación.`);
          continue;
        }

        // Check if the student is actually enrolled in the catedra
        const enrollment = await prisma.CatedraAlumno.findFirst({
          where: {
            catedraId: tareaMaestra.catedraId,
            alumnoId: alumnoIdInt,
          },
        });

        if (!enrollment) {
          console.warn(`Alumno ${alumnoId} no está inscrito en la cátedra ${tareaMaestra.catedraId}. Saltando asignación.`);
          continue;
        }

        const asignacion = await prisma.tareaAsignacion.upsert({
          where: {
            alumnoId_tareaMaestraId: {
              alumnoId: alumnoIdInt,
              tareaMaestraId: parseInt(tareaMaestraId),
            },
          },
          update: {},
          create: {
            alumnoId: alumnoIdInt,
            tareaMaestraId: parseInt(tareaMaestraId),
            estado: 'ASIGNADA', // Default state for new assignment
          },
        });
        assignedTasks.push(asignacion);

        // Send email notification to student
        if (alumno.email) {
          const mailOptions = {
            from: `"HMPY (Historia de la Música PY - Academia)" <${process.env.EMAIL_USER}>`,
            to: alumno.email,
            subject: `¡Nueva Tarea Asignada en ${tareaMaestra.Catedra.nombre}!`,
            html: `
              <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #ffffff; background-color: #1a202c; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #2d3748; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);">
                  <h2 style="color: #9f7aea; text-align: center;">¡Hola ${alumno.nombre}!</h2>
                  <p style="color: #e2e8f0;">Tu docente ha asignado una nueva tarea para la cátedra de <strong>${tareaMaestra.Catedra.nombre}</strong>.</p>
                  <p style="color: #e2e8f0;"><strong>Título de la Tarea:</strong> ${tareaMaestra.titulo}</p>
                  <p style="color: #e2e8f0;"><strong>Descripción:</strong> ${tareaMaestra.descripcion}</p>
                  <p style="color: #e2e8f0;"><strong>Fecha de Entrega:</strong> ${tareaMaestra.fecha_entrega ? new Date(tareaMaestra.fecha_entrega).toLocaleDateString() : 'N/A'}</p>
                  <p style="color: #e2e8f0;">Puedes ver los detalles y realizar tu entrega en la plataforma.</p>
                  <p style="color: #cbd5e0; font-size: 0.9em; text-align: center; margin-top: 20px;">Atentamente, El Equipo de HMPY</p>
                </div>
              </div>
            `,
          };
          try {
            await transporter.sendMail(mailOptions);
            console.log(`Task assignment notification email sent to ${alumno.email}.`);
          } catch (emailError) {
            console.error(`Error sending task assignment email to ${alumno.email}:`, emailError);
          }
        }
      }

      res.status(201).json({ message: `Tarea maestra asignada a ${assignedTasks.length} estudiantes.`, asignaciones: assignedTasks });

    } catch (error) {
      console.error('Error assigning master task to students:', error);
      res.status(500).json({ error: 'Failed to assign master task.', details: error.message });
    }
  });

  // Update a master task for a catedra (Docente only)
  router.put('/docente/catedra/:catedraId/tareas/:tareaMaestraId', requireDocente, async (req, res) => {
    const { catedraId, tareaMaestraId } = req.params;
    const { titulo, descripcion, puntos_posibles, fecha_entrega, recursos, multimedia_path } = req.body;
    const docenteId = req.docente.docenteId;

    try {
      // Verify the catedra belongs to the docente
      const catedra = await prisma.catedra.findFirst({
        where: {
          id: parseInt(catedraId),
          docenteId: docenteId,
        },
      });

      if (!catedra) {
        return res.status(404).json({ error: 'Cátedra not found or access denied.' });
      }

      // Verify the master task belongs to the catedra and exists
      const existingTareaMaestra = await prisma.tareaMaestra.findFirst({
        where: {
          id: parseInt(tareaMaestraId),
          catedraId: parseInt(catedraId),
        },
      });

      if (!existingTareaMaestra) {
        return res.status(404).json({ error: 'Tarea maestra no encontrada o no pertenece a esta cátedra.' });
      }

      const updatedTareaMaestra = await prisma.tareaMaestra.update({
        where: { id: parseInt(tareaMaestraId) },
        data: {
          titulo: titulo !== undefined ? titulo : existingTareaMaestra.titulo,
          descripcion: descripcion !== undefined ? descripcion : existingTareaMaestra.descripcion,
          puntos_posibles: puntos_posibles !== undefined ? parseInt(puntos_posibles) : existingTareaMaestra.puntos_posibles,
          fecha_entrega: fecha_entrega !== undefined ? new Date(fecha_entrega) : existingTareaMaestra.fecha_entrega,
          recursos: recursos !== undefined ? recursos : existingTareaMaestra.recursos,
          multimedia_path: multimedia_path !== undefined ? multimedia_path : existingTareaMaestra.multimedia_path,
        },
      });

      // Opcional: Actualizar la publicación si está asociada
      if (updatedTareaMaestra.publicacionId) {
        const publicacionTitle = updatedTareaMaestra.titulo && updatedTareaMaestra.titulo.trim() !== '' ? `Nueva Tarea: ${updatedTareaMaestra.titulo}` : 'Nueva Tarea Asignada';
        const formattedFechaEntrega = updatedTareaMaestra.fecha_entrega ? new Date(updatedTareaMaestra.fecha_entrega).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) : 'No definida';

        const publicacionContent = `
          Se ha actualizado la tarea: **${updatedTareaMaestra.titulo && updatedTareaMaestra.titulo.trim() !== '' ? updatedTareaMaestra.titulo : 'Sin título'}**.\n
          Descripción: ${updatedTareaMaestra.descripcion && updatedTareaMaestra.descripcion.trim() !== '' ? updatedTareaMaestra.descripcion : 'Sin descripción'}.\n
          Fecha de Entrega: ${formattedFechaEntrega}.\n
        `;

        await prisma.publicacion.update({
          where: { id: updatedTareaMaestra.publicacionId },
          data: {
            titulo: publicacionTitle,
            contenido: publicacionContent,
          },
        });
      }

      res.status(200).json(updatedTareaMaestra);
    } catch (error) {
      console.error('Error updating master task for docente:', error);
      res.status(500).json({ error: 'Failed to update master task.' });
    }
  });

  // Generate evaluation for a catedra
  router.post('/docente/catedra/:catedraId/generate-evaluation', requireDocente, async (req, res) => {
    console.log('[DOCENTE EVALUACION] Ruta de generación de evaluación accedida.');
    const { catedraId } = req.params;
    const { topic, subject, numberOfQuestions, numberOfOptions } = req.body;
    const docenteId = req.docente.docenteId;

    try {
      console.log(`[DOCENTE EVALUACION] Generando evaluación para catedraId: ${catedraId}, tema: ${topic}, preguntas: ${numberOfQuestions}, opciones: ${numberOfOptions}`);
      // Verify the catedra belongs to the docente
      const catedra = await prisma.catedra.findFirst({
        where: {
          id: parseInt(catedraId),
          docenteId: docenteId,
        }
      });

      if (!catedra) {
        console.warn('[DOCENTE EVALUACION] Cátedra no encontrada o acceso denegado.');
        return res.status(404).json({ error: 'Cátedra not found or access denied.' });
      }

      console.log('[DOCENTE EVALUACION] Llamando a generateQuestionsWithAI...');
      const generatedQuestions = await generateQuestionsWithAI(topic, numberOfQuestions, numberOfOptions);
      console.log('[DOCENTE EVALUACION] generateQuestionsWithAI completado. Preguntas generadas:', generatedQuestions.length);

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
          Pregunta: {  // ✅ Corregido
            include: {
              Opcion: true,  // ✅ Corregido
            },
          },
        },
      });

      // Create a publicacion for the new evaluation in the catedra's board
      const publicacionTitle = `Nueva Evaluación: ${newEvaluation.titulo}`;
      const publicacionContent = `Se ha generado una nueva evaluación: **${newEvaluation.titulo}**.\n
        Puedes encontrarla en la pestaña de evaluaciones para su revisión y asignación.`

      console.log('DEBUG: Publicacion title (Evaluation):', publicacionTitle);
      console.log('DEBUG: Publicacion content (Evaluation):', publicacionContent);

      const newPublicacion = await prisma.publicacion.create({
        data: {
          titulo: publicacionTitle,
          contenido: publicacionContent,
          tipo: 'EVALUACION',
          catedraId: parseInt(catedraId),
          autorDocenteId: docenteId,
          visibleToStudents: false,
          evaluacionMaestraId: newEvaluation.id,  // ✅ Cambiar de evaluacionId a evaluacionMaestraId
        },
      });

      console.log('DEBUG: New Publicacion created (Evaluation):', newPublicacion);

      // Fetch all students enrolled in the catedra to send notifications
      // const enrolledStudents = await prisma.catedraAlumno.findMany({
      //   where: { catedraId: parseInt(catedraId), alumnoId: { not: null } },
      //   include: {
      //     Alumno: {
      //       select: { email: true, nombre: true },
      //     },
      //   },
      // });

      // for (const enrollment of enrolledStudents) {
      //   if (enrollment.Alumno && enrollment.Alumno.email) {
      //     const mailOptions = {
      //       from: `"HMPY (Historia de la Música PY - Academia)" <${process.env.EMAIL_USER}>`,
      //       to: enrollment.Alumno.email,
      //       subject: `¡Nueva Evaluación Disponible en ${catedra.nombre}!`,
      //       html: `
      //         <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #ffffff; background-color: #1a202c; padding: 20px;">
      //           <div style="max-width: 600px; margin: 0 auto; background-color: #2d3748; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);">
      //             <h2 style="color: #9f7aea; text-align: center;">¡Hola ${enrollment.Alumno.nombre}!</h2>
      //             <p style="color: #e2e8f0;">Tu docente ha creado una nueva evaluación para la cátedra de <strong>${catedra.nombre}</strong>.</p>
      //             <p style="color: #e2e8f0;"><strong>Título de la Evaluación:</strong> ${newEvaluation.titulo}</p>
      //             <p style="color: #e2e8f0;">Puedes acceder a ella y realizarla desde tu panel de "Mis Evaluaciones" en la plataforma.</p>
      //             <p style="color: #e2e8f0;">¡Mucho éxito!</p>
      //             <p style="color: #cbd5e0; font-size: 0.9em; text-align: center; margin-top: 20px;">Atentamente, El Equipo de HMPY</p>
      //           </div>
      //         </div>
      //       `,
      //     };
      //     try {
      //       await transporter.sendMail(mailOptions);
      //       console.log(`Notification email sent to ${enrollment.Alumno.email} for new evaluation.`);
      //     } catch (emailError) {
      //       console.error(`Error sending email to ${enrollment.Alumno.email}:`, emailError);
      //     }
      //   }
      // }

      res.status(201).json({
        message: '¡Evaluación generada y guardada exitosamente!',
        evaluation: newEvaluation,
      });
    } catch (error) {
      console.error('[DOCENTE EVALUACION] Error generando evaluación para docente:', error);
      // Log the full error object for better debugging
      console.error('[DOCENTE EVALUACION] Full error details:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      res.status(500).json({ error: 'Failed to generate evaluation.', details: error.message });
    }
  });

  // GET /docentes/catedras/:catedraId/evaluaciones-maestras - Obtener todas las evaluaciones maestras de una cátedra
  router.get("/docente/catedra/:catedraId/evaluaciones-maestras", requireDocente, async (req, res) => {
    const { catedraId } = req.params;
    const docenteId = req.docente.docenteId;

    try {
      const catedra = await prisma.catedra.findFirst({
        where: {
          id: parseInt(catedraId),
          docenteId: docenteId,
        },
      });

      if (!catedra) {
        return res.status(404).json({ error: 'Cátedra no encontrada o acceso denegado.' });
      }

      const evaluacionesMaestras = await prisma.Evaluacion.findMany({
        where: {
          catedraId: parseInt(catedraId),
        },
        include: {
          _count: {
            select: { Pregunta: true },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      });

      res.status(200).json(evaluacionesMaestras);
    } catch (error) {
      console.error('Error al obtener evaluaciones maestras:', error);
      res.status(500).json({ error: 'Error al obtener las evaluaciones maestras.', details: error.message });
    }
  });

  // POST /docentes/catedras/:catedraId/evaluaciones/:evaluationId/assign - Asignar una evaluación a alumnos
  router.post('/docente/catedra/:catedraId/evaluaciones/:evaluationId/assign', requireDocente, async (req, res) => {
    const { catedraId, evaluationId } = req.params;
    const { alumnoIds, fecha_entrega } = req.body; // Array de IDs de alumnos y fecha límite
    const docenteId = req.docente.docenteId;

    if (!Array.isArray(alumnoIds) || alumnoIds.length === 0) {
      return res.status(400).json({ error: 'Se requiere una lista de IDs de alumnos para asignar la evaluación.' });
    }

    try {
      // 1. Verificar la cátedra y la evaluación
      const catedra = await prisma.catedra.findFirst({
        where: {
          id: parseInt(catedraId),
          docenteId: docenteId,
        },
      });

      if (!catedra) {
        return res.status(404).json({ error: 'Cátedra no encontrada o acceso denegado.' });
      }

      const evaluacionMaestra = await prisma.Evaluacion.findUnique({
        where: { id: parseInt(evaluationId) },
        include: {
          Publicacion: true, // Incluir la publicación asociada
        },
      });

      if (!evaluacionMaestra) {
        return res.status(404).json({ error: 'Evaluación maestra no encontrada.' });
      }

      if (evaluacionMaestra.catedraId !== parseInt(catedraId)) {
        return res.status(400).json({ error: 'La evaluación no pertenece a la cátedra especificada.' });
      }

      const assignedEvaluations = [];
      for (const alumnoId of alumnoIds) {
        const alumnoIdInt = parseInt(alumnoId);

        // Verificar que el alumno esté inscrito en la cátedra
        const enrollment = await prisma.catedraAlumno.findFirst({
          where: {
            catedraId: parseInt(catedraId),
            alumnoId: alumnoIdInt,
          },
          include: {
            Alumno: true,
          },
        });

        if (!enrollment || !enrollment.Alumno) {
          console.warn(`Alumno con ID ${alumnoId} no encontrado o no inscrito en la cátedra. Saltando asignación.`);
          continue;
        }

        // 2. Crear o actualizar EvaluacionAsignacion
        const asignacion = await prisma.evaluacionAsignacion.upsert({
          where: {
            alumnoId_evaluacionId: {
              alumnoId: alumnoIdInt,
              evaluacionId: parseInt(evaluationId),
            },
          },
          update: {
            fecha_entrega: fecha_entrega ? new Date(fecha_entrega) : null,
            estado: 'PENDIENTE', // Resetear a PENDIENTE si ya existía y se reasigna
            updated_at: new Date(),
          },
          create: {
            alumnoId: alumnoIdInt,
            evaluacionId: parseInt(evaluationId),
            fecha_entrega: fecha_entrega ? new Date(fecha_entrega) : null,
            estado: 'PENDIENTE',
            updated_at: new Date(),
          },
        });
        assignedEvaluations.push(asignacion);

        // 3. Enviar email de notificación
        if (enrollment.Alumno.email) {
          const mailOptions = {
            from: `"HMPY (Historia de la Música PY - Academia)" <${process.env.EMAIL_USER}>`,
            to: enrollment.Alumno.email,
            subject: `¡Nueva Evaluación Asignada en ${catedra.nombre}!`,
            html: `
              <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #ffffff; background-color: #1a202c; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #2d3748; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);">
                  <h2 style="color: #9f7aea; text-align: center;">¡Hola ${enrollment.Alumno.nombre}!</h2>
                  <p style="color: #e2e8f0;">Tu docente ha asignado una nueva evaluación para la cátedra de <strong>${catedra.nombre}</strong>.</p>
                  <p style="color: #e2e8f0;"><strong>Título de la Evaluación:</strong> ${evaluacionMaestra.titulo}</p>
                  ${fecha_entrega ? `<p style="color: #e2e8f0;"><strong>Fecha Límite:</strong> ${new Date(fecha_entrega).toLocaleDateString()}</p>` : ''}
                  <p style="color: #e2e8f0;">Puedes acceder a ella y realizarla desde tu panel de "Mis Evaluaciones" en la plataforma.</p>
                  <p style="color: #e2e8f0;">¡Mucho éxito!</p>
                  <p style="color: #cbd5e0; font-size: 0.9em; text-align: center; margin-top: 20px;">Atentamente, El Equipo de HMPY</p>
                </div>
              </div>
            `,
          };
          try {
            await transporter.sendMail(mailOptions);
            console.log(`Evaluation assignment notification email sent to ${enrollment.Alumno.email}.`);
          } catch (emailError) {
            console.error(`Error sending evaluation assignment email to ${enrollment.Alumno.email}:`, emailError);
          }
        }
      }

      res.status(201).json({ message: `Evaluación asignada a ${assignedEvaluations.length} estudiantes.`, asignaciones: assignedEvaluations });

    } catch (error) {
      console.error('Error assigning evaluation to students:', error);
      res.status(500).json({ error: 'Error al asignar la evaluación.', details: error.message });
    }
  });

  // DELETE /docentes/catedras/:catedraId/evaluaciones/:evaluationId - Eliminar una evaluación
  router.delete('/docente/catedra/:catedraId/evaluaciones/:evaluationId', requireDocente, async (req, res) => {
    const { catedraId, evaluationId } = req.params;
    const docenteId = req.docente.docenteId;

    try {
      // 1. Verify the catedra belongs to the docente
      const catedra = await prisma.catedra.findFirst({
        where: {
          id: parseInt(catedraId),
          docenteId: docenteId,
        },
      });

      if (!catedra) {
        return res.status(404).json({ error: 'Cátedra no encontrada o acceso denegado.' });
      }

      // 2. Verify the evaluation belongs to the catedra and exists
      const evaluationToDelete = await prisma.evaluacion.findFirst({
        where: {
          id: parseInt(evaluationId),
          catedraId: parseInt(catedraId),
        },
        include: {
          Publicacion: true, // Incluir la publicación asociada
          Pregunta: {
            include: {
              Opcion: true,
            },
          },
        },
      });

      if (!evaluationToDelete) {
        return res.status(404).json({ error: 'Evaluación no encontrada o no pertenece a esta cátedra.' });
      }

      // 3. Delete the associated Publicacion if it exists
      if (evaluationToDelete.Publicacion) {
        await prisma.publicacion.delete({
          where: { id: evaluationToDelete.Publicacion.id },
        });
        console.log(`[DEBUG] Publicación ${evaluationToDelete.Publicacion.id} eliminada.`);
      }

      // 4. Delete related CalificacionEvaluacion records first
      await prisma.calificacionEvaluacion.deleteMany({
        where: {
          EvaluacionAsignacion: {
            evaluacionId: parseInt(evaluationId),
          },
        },
      });

      // 5. Delete related RespuestasAlumno records and options
      for (const pregunta of evaluationToDelete.Pregunta) {
        await prisma.respuestaAlumno.deleteMany({
          where: {
            preguntaId: pregunta.id,
          },
        });

        // Delete options for each question
        await prisma.opcion.deleteMany({
          where: {
            preguntaId: pregunta.id,
          },
        });
      }

      // 6. Delete questions
      await prisma.pregunta.deleteMany({
        where: {
          evaluacionId: parseInt(evaluationId),
        },
      });

      // 7. Delete EvaluacionAsignacion records
      await prisma.evaluacionAsignacion.deleteMany({
        where: {
          evaluacionId: parseInt(evaluationId),
        },
      });

      // 8. Finally, delete the evaluation
      await prisma.evaluacion.delete({
        where: { id: parseInt(evaluationId) },
      });

      res.status(200).json({ message: 'Evaluación eliminada exitosamente.' });
    } catch (error) {
      console.error('Error deleting evaluation for docente:', error);
      res.status(500).json({ error: 'Failed to delete evaluation.', details: error.message });
    }
  });
  
  // GET /docentes/planes/:planId - Obtener un plan de clases específico
  router.get('/docente/me/planes/:planId', requireDocente, async (req, res) => {
    const { planId } = req.params;
    const docenteId = req.docente.docenteId;

    try {
      const planDeClases = await prisma.planDeClases.findUnique({
        where: {
          id: parseInt(planId),
        },
        include: {
          catedra: {
            select: { docenteId: true },
          },
          UnidadPlan: true,
        },
      });

      if (!planDeClases) {
        return res.status(404).json({ error: 'Plan de clases no encontrado.' });
      }

      if (planDeClases.catedra.docenteId !== docenteId) {
        return res.status(403).json({ error: 'No tiene permiso para ver este plan de clases.' });
      }

      res.status(200).json(planDeClases);
    } catch (error) {
      console.error('Error al obtener plan de clases:', error);
      res.status(500).json({ error: 'Error al obtener el plan de clases.', details: error.message });
    }
  });

  // PUT /docentes/planes/:planId - Actualizar un plan de clases
  router.put('/docente/me/planes/:planId', requireDocente, async (req, res) => {
    const { planId } = req.params;
    const { titulo, tipoOrganizacion } = req.body;
    const docenteId = req.docente.docenteId;

    try {
      const planDeClases = await prisma.planDeClases.findUnique({
        where: {
          id: parseInt(planId),
        },
        include: {
          catedra: {
            select: { docenteId: true },
          },
        },
      });

      if (!planDeClases) {
        return res.status(404).json({ error: 'Plan de clases no encontrado.' });
      }

      if (planDeClases.catedra.docenteId !== docenteId) {
        return res.status(403).json({ error: 'No tiene permiso para actualizar este plan de clases.' });
      }

      const updatedPlanDeClases = await prisma.planDeClases.update({
        where: { id: parseInt(planId) },
        data: {
          titulo: titulo || undefined,
          tipoOrganizacion: tipoOrganizacion || undefined,
        },
      });

      res.status(200).json(updatedPlanDeClases);
    } catch (error) {
      console.error('Error al actualizar plan de clases:', error);
      res.status(500).json({ error: 'Error al actualizar el plan de clases.', details: error.message });
    }
  });

  // DELETE /docentes/planes/:planId - Eliminar un plan de clases
  router.delete('/docente/me/planes/:planId', requireDocente, async (req, res) => {
    const { planId } = req.params;
    const docenteId = req.docente.docenteId;

    try {
      const planDeClases = await prisma.planDeClases.findUnique({
        where: {
          id: parseInt(planId),
        },
        include: {
          catedra: {
            select: { docenteId: true },
          },
          UnidadPlan: true, // Para verificar si hay unidades asociadas
        },
      });

      if (!planDeClases) {
        return res.status(404).json({ error: 'Plan de clases no encontrado.' });
      }

      if (planDeClases.catedra.docenteId !== docenteId) {
        return res.status(403).json({ error: 'No tiene permiso para eliminar este plan de clases.' });
      }

      // Eliminar todas las unidades asociadas primero
      await prisma.unidadPlan.deleteMany({
        where: { planDeClasesId: parseInt(planId) },
      });

      await prisma.planDeClases.delete({
        where: { id: parseInt(planId) },
      });

      res.status(204).send(); // No content
    } catch (error) {
      console.error('Error al eliminar plan de clases:', error);
      res.status(500).json({ error: 'Error al eliminar el plan de clases.', details: error.message });
    }
  });

  // --- Rutas para la gestión de Unidades del Plan de Clases ---

  // POST /docentes/planes/:planId/unidades - Crear una nueva unidad de plan
  router.post('/docente/me/planes/:planId/unidades', requireDocente, async (req, res) => {
    const { planId } = req.params;
    const { periodo, contenido, capacidades, horasTeoricas, horasPracticas, estrategiasMetodologicas, mediosVerificacionEvaluacion, recursos } = req.body;
    const docenteId = req.docente.docenteId;

    if (!periodo || !contenido || capacidades === undefined || horasTeoricas === undefined || horasPracticas === undefined || estrategiasMetodologicas === undefined || mediosVerificacionEvaluacion === undefined) {
      return res.status(400).json({ error: 'Todos los campos de la unidad son obligatorios.' });
    }

    try {
      const planDeClases = await prisma.planDeClases.findUnique({
        where: {
          id: parseInt(planId),
        },
        include: {
          catedra: {
            select: { docenteId: true },
          },
        },
      });

      if (!planDeClases) {
        return res.status(404).json({ error: 'Plan de clases no encontrado.' });
      }

      if (planDeClases.catedra.docenteId !== docenteId) {
        return res.status(403).json({ error: 'No tiene permiso para añadir unidades a este plan de clases.' });
      }

      const newUnidadPlan = await prisma.unidadPlan.create({
        data: {
          planDeClasesId: parseInt(planId),
          periodo,
          contenido,
          capacidades,
          horasTeoricas: parseInt(horasTeoricas),
          horasPracticas: parseInt(horasPracticas),
          estrategiasMetodologicas,
          mediosVerificacionEvaluacion,
          recursos: recursos || [],
        },
      });

      res.status(201).json(newUnidadPlan);
    } catch (error) {
      console.error('Error al crear unidad de plan:', error);
      res.status(500).json({ error: 'Error al crear la unidad del plan de clases.', details: error.message });
    }
  });

  // PUT /docentes/unidades/:unidadId - Actualizar una unidad de plan
  router.put('/docente/me/unidades/:unidadId', requireDocente, async (req, res) => {
    const { unidadId } = req.params;
    const { periodo, contenido, capacidades, horasTeoricas, horasPracticas, estrategiasMetodologicas, mediosVerificacionEvaluacion, recursos } = req.body;
    const docenteId = req.docente.docenteId;

    try {
      const unidadPlan = await prisma.unidadPlan.findUnique({
        where: {
          id: parseInt(unidadId),
        },
        include: {
          planDeClases: {
            include: {
              catedra: {
                select: { docenteId: true },
              },
            },
          },
        },
      });

      if (!unidadPlan) {
        return res.status(404).json({ error: 'Unidad de plan no encontrada.' });
      }

      if (unidadPlan.planDeClases.catedra.docenteId !== docenteId) {
        return res.status(403).json({ error: 'No tiene permiso para actualizar esta unidad de plan.' });
      }

      const updatedUnidadPlan = await prisma.unidadPlan.update({
        where: { id: parseInt(unidadId) },
        data: {
          periodo: periodo || undefined,
          contenido: contenido || undefined,
          capacidades: capacidades || undefined,
          horasTeoricas: horasTeoricas !== undefined ? parseInt(horasTeoricas) : undefined,
          horasPracticas: horasPracticas !== undefined ? parseInt(horasPracticas) : undefined,
          estrategiasMetodologicas: estrategiasMetodologicas || undefined,
          mediosVerificacionEvaluacion: mediosVerificacionEvaluacion || undefined,
          recursos: recursos || undefined,
        },
      });

      res.status(200).json(updatedUnidadPlan);
    } catch (error) {
      console.error('Error al actualizar unidad de plan:', error);
      res.status(500).json({ error: 'Error al actualizar la unidad del plan de clases.', details: error.message });
    }
  });

  // DELETE /docentes/unidades/:unidadId - Eliminar una unidad de plan
  router.delete('/docente/me/unidades/:unidadId', requireDocente, async (req, res) => {
    const { unidadId } = req.params;
    const docenteId = req.docente.docenteId;

    try {
      const unidadPlan = await prisma.unidadPlan.findUnique({
        where: {
          id: parseInt(unidadId),
        },
        include: {
          planDeClases: {
            include: {
              catedra: {
                select: { docenteId: true },
              },
            },
          },
        },
      });

      if (!unidadPlan) {
        return res.status(404).json({ error: 'Unidad de plan no encontrada.' });
      }

      if (unidadPlan.planDeClases.catedra.docenteId !== docenteId) {
        return res.status(403).json({ error: 'No tiene permiso para eliminar esta unidad de plan.' });
      }

      // Eliminar registros de asistencia asociados primero
      await prisma.unidadPlan.delete({
        where: { id: parseInt(unidadId) },
      });

      res.status(204).send(); // No content
    } catch (error) {
      console.error('Error al eliminar unidad de plan:', error);
      res.status(500).json({ error: 'Error al eliminar la unidad del plan de clases.', details: error.message });
    }
  });

  // Admin: CRUD de Docentes (solo accesible por Admin)
  router.get('/docente', requireDocente, async (req, res) => {
    try {
      const docentes = await prisma.docente.findMany({
        where: {
          otpEnabled: true, // Solo docentes que han completado el proceso de verificación OTP
          NOT: {
            // Excluir docentes con nombre y apellido por defecto, que son creados automáticamente
            // pero que no han completado el registro.
            nombre: { startsWith: prisma.docente.fields.email.name.split('@')[0] }, // Heuristic: filter by default name creation
            apellido: 'Docente',
          },
        },
        select: {
          id: true,
          nombre: true,
          apellido: true,
          email: true,
          telefono: true,
          direccion: true,
        },
        orderBy: { nombre: 'asc' },
      });
      res.json(docentes);
    } catch (error) {
      console.error('Error al obtener docentes:', error);
      res.status(500).json({ error: 'Error al obtener la lista de docentes', details: error.message });
    }
  });

  router.post('/docente', requireDocente, async (req, res) => {
    const { nombre, apellido, email, telefono, direccion } = req.body;
    try {
      const newDocente = await prisma.docente.create({
        data: {
          nombre,
          apellido,
          email,
          telefono,
          direccion,
        },
      });
      res.status(201).json(newDocente);
    } catch (error) {
      console.error('Error al crear docente:', error);
      res.status(500).json({ error: 'Error al crear el docente', details: error.message });
    }
  });

  router.put('/docente/:id', requireDocente, async (req, res) => {
    const { id } = req.params;
    const { nombre, apellido, email, telefono, direccion } = req.body;
    try {
      const updatedDocente = await prisma.docente.update({
        where: { id: parseInt(id) },
        data: {
          nombre,
          apellido,
          email,
          telefono,
          direccion,
        },
      });
      res.json(updatedDocente);
    } catch (error) {
      console.error('Error al actualizar docente:', error);
      res.status(500).json({ error: 'Error al actualizar el docente', details: error.message });
    }
  });

  router.delete('/docente/:id', requireDocente, async (req, res) => {
    const { id } = req.params;
    try {
      await prisma.docente.delete({
        where: { id: parseInt(id) },
      });
      res.status(204).send();
    } catch (error) {
      console.error('Error al eliminar docente:', error);
      res.status(500).json({ error: 'Error al eliminar el docente', details: error.message });
    }
  });

  // Delete a master task from a catedra (Docente only)
  router.delete('/docente/catedra/:catedraId/tareas/:tareaMaestraId', requireDocente, async (req, res) => {
    const { catedraId, tareaMaestraId } = req.params;
    const docenteId = req.docente.docenteId;

    try {
      // Verify the catedra belongs to the docente
      const catedra = await prisma.catedra.findFirst({
        where: {
          id: parseInt(catedraId),
          docenteId: docenteId,
        },
      });

      if (!catedra) {
        return res.status(404).json({ error: 'Cátedra not found or access denied.' });
      }

      // Verify the master task belongs to the catedra and exists
      const tareaMaestraToDelete = await prisma.tareaMaestra.findFirst({
        where: {
          id: parseInt(tareaMaestraId),
          catedraId: parseInt(catedraId),
        },
        include: { TareaAsignacion: true, Publicacion: true },
      });

      if (!tareaMaestraToDelete) {
        return res.status(404).json({ error: 'Tarea maestra no encontrada o no pertenece a esta cátedra.' });
      }

      // 1. Eliminar los registros de Puntuacion asociados a las TareaAsignacion de esta TareaMaestra
      // Esto requiere iterar por cada asignación para encontrar las puntuaciones relacionadas
      for (const asignacion of tareaMaestraToDelete.TareaAsignacion) {
        await prisma.puntuacion.deleteMany({
          where: {
            alumnoId: asignacion.alumnoId,
            catedraId: catedra.id,
            motivo: `Calificación de tarea: ${tareaMaestraToDelete.titulo}`,
            tipo: 'TAREA',
          },
        });
      }

      // 2. Eliminar todas las TareaAsignacion asociadas a esta TareaMaestra
      await prisma.tareaAsignacion.deleteMany({
        where: {
          tareaMaestraId: parseInt(tareaMaestraId),
        },
      });

      // 3. Eliminar la Publicacion asociada si existe
      if (tareaMaestraToDelete.Publicacion) {
        const publicacionId = tareaMaestraToDelete.Publicacion.id;

        // Eliminar interacciones asociadas a la publicación
        await prisma.publicacionInteraccion.deleteMany({
          where: { publicacionId: publicacionId },
        });

        // Eliminar comentarios asociados a la publicación
        await prisma.comentarioPublicacion.deleteMany({
          where: { publicacionId: publicacionId },
        });

        // Ahora eliminar la publicación
        await prisma.publicacion.deleteMany({
          where: { id: publicacionId },
        });
      }

      // 4. Finalmente, eliminar la TareaMaestra
      await prisma.tareaMaestra.delete({
        where: { id: parseInt(tareaMaestraId) },
      });

      res.status(200).json({ message: 'Tarea maestra y sus asignaciones eliminadas exitosamente.' });
    } catch (error) {
      console.error('Error deleting master task for docente:', error);
      res.status(500).json({ error: 'Failed to delete master task.', details: error.message });
    }
  });

  // Unenroll an alumno or composer from a catedra (Docente only)
  router.delete('/docente/catedra/:catedraId/desinscribir', requireDocente, async (req, res) => {
    const { catedraId } = req.params;
    const { alumnoId, composerId } = req.body;
    const docenteId = req.docente.docenteId;

    try {
      if (!alumnoId && !composerId) {
        return res.status(400).json({ error: 'Se requiere alumnoId o composerId para desinscribir.' });
      }

      // Verify the catedra belongs to the docente
      const catedra = await prisma.catedra.findFirst({
        where: {
          id: parseInt(catedraId),
          docenteId: docenteId,
        },
      });

      if (!catedra) {
        return res.status(404).json({ error: 'Cátedra no encontrada o acceso denegado.' });
      }

      const whereClause = {
        catedraId: parseInt(catedraId, 10),
        ...(alumnoId && { alumnoId: parseInt(alumnoId, 10) }),
        ...(composerId && { composerId: parseInt(composerId, 10) }),
      };

      // Eliminar las TareaAsignacion del alumno en esta cátedra
      if (alumnoId) {
        await prisma.tareaAsignacion.deleteMany({
          where: {
            alumnoId: parseInt(alumnoId),
            tareaMaestra: {
              catedraId: parseInt(catedraId),
            },
          },
        });
      }

      const deleteResult = await prisma.catedraAlumno.deleteMany({
        where: whereClause,
      });

      if (deleteResult.count === 0) {
        return res.status(404).json({ error: 'Inscripción no encontrada en esta cátedra.' });
      }

      res.json({ message: 'Desinscripción exitosa.' });
    } catch (error) {
      console.error('Error al desinscribir alumno/compositor para docente:', error);
      res.status(500).json({ error: 'Error al desinscribir alumno/compositor.', details: error.message });
    }
  });

  // Get all tasks and submissions for a specific student in a catedra
  router.get('/docente/catedra/:catedraId/alumnos/:alumnoId/entregas', requireDocente, async (req, res) => {
    const { catedraId, alumnoId } = req.params;
    const docenteId = req.docente.docenteId;

    try {
      // 1. Verify the docente owns the catedra
      const catedra = await prisma.catedra.findFirst({
        where: {
          id: parseInt(catedraId),
          docenteId: docenteId,
        },
        include: {
          CatedraAlumno: { // Correct relation name
            where: { alumnoId: parseInt(alumnoId) },
            include: { Alumno: true } // Correct model name
          }
        }
      });

      if (!catedra || catedra.CatedraAlumno.length === 0) {
        return res.status(404).json({ error: 'Cátedra no encontrada, acceso denegado o el alumno no está inscrito.' });
      }

      const alumno = catedra.CatedraAlumno[0].Alumno;

      // 2. Get all task assignments for the specific student in this catedra
      const asignacionesDelAlumno = await prisma.tareaAsignacion.findMany({
        where: {
          alumnoId: parseInt(alumnoId),
          TareaMaestra: {
            catedraId: parseInt(catedraId),
          },
        },
        include: {
          TareaMaestra: true,
        },
        orderBy: {
          TareaMaestra: {
            fecha_entrega: 'asc',
          },
        },
      });

      // 3. Format the results
      const resultado = asignacionesDelAlumno.map(asignacion => ({
        id: asignacion.id, // ID de la asignación
        titulo: asignacion.TareaMaestra.titulo,
        descripcion: asignacion.TareaMaestra.descripcion,
        fecha_entrega: asignacion.TareaMaestra.fecha_entrega,
        puntos_posibles: asignacion.TareaMaestra.puntos_posibles,
        recursos: asignacion.TareaMaestra.recursos,
        multimedia_path: asignacion.TareaMaestra.multimedia_path,
        estado: asignacion.estado,
        submission_path: asignacion.submission_path,
        submission_date: asignacion.submission_date,
        puntos_obtenidos: asignacion.puntos_obtenidos,
        catedraId: asignacion.TareaMaestra.catedraId,
        alumnoId: asignacion.alumnoId,
        tareaMaestraId: asignacion.tareaMaestraId,
      }));

      res.json({
        alumno: alumno,
        tareasConEntregas: resultado,
      });

    } catch (error) {
      console.error('Error fetching student submissions for docente:', error);
      res.status(500).json({ error: 'Error al obtener las entregas del alumno.' });
    }
  });

  // Grade a student's submission by updating the TareaAsignacion record
  router.post('/docente/tareasAsignaciones/:tareaAsignacionId/calificar', requireDocente, async (req, res) => {
    const { tareaAsignacionId } = req.params;
    const { puntos_obtenidos, comentario_docente } = req.body;
    const docenteId = req.docente.docenteId;

    if (puntos_obtenidos === undefined) {
      return res.status(400).json({ error: 'Los puntos obtenidos son requeridos.' });
    }

    const puntos = parseInt(puntos_obtenidos);

    try {
      // 1. Find the task assignment and include related data for validation
      const asignacion = await prisma.TareaAsignacion.findUnique({
        where: { id: parseInt(tareaAsignacionId) },
        include: {
          TareaMaestra: {
            include: {
              Catedra: true,
            },
          },
        },
      });

      if (!asignacion) {
        return res.status(404).json({ error: 'Asignación de tarea no encontrada.' });
      }

      // 2. Verify the docente owns the catedra this task belongs to
      if (asignacion.TareaMaestra.Catedra.docenteId !== docenteId) {
        return res.status(403).json({ error: 'No tiene permiso para calificar esta asignación de tarea.' });
      }

      if (puntos > asignacion.TareaMaestra.puntos_posibles) {
        return res.status(400).json({ error: `La calificación no puede exceder los ${asignacion.TareaMaestra.puntos_posibles} puntos posibles.` });
      }

      // 3. Update the task assignment with the grade and set status to CALIFICADA
      const asignacionCalificada = await prisma.TareaAsignacion.update({
        where: { id: parseInt(tareaAsignacionId) },
        data: {
          puntos_obtenidos: puntos,
          estado: 'CALIFICADA',
          // Add comentario_docente here if you add it to the prisma schema
        },
      });

      // 4. Create or update the Puntuacion record
      const motivo = `Calificación de tarea: ${asignacion.TareaMaestra.titulo}`;

      const puntuacionExistente = await prisma.Puntuacion.findFirst({
        where: {
          alumnoId: asignacion.alumnoId,
          catedraId: asignacion.TareaMaestra.catedraId,
          motivo: motivo,
          tipo: 'TAREA',
        }
      });

      if (puntuacionExistente) {
        await prisma.Puntuacion.update({
          where: { id: puntuacionExistente.id },
          data: { puntos: puntos },
        });
      } else {
        await prisma.Puntuacion.create({
          data: {
            puntos: puntos,
            motivo: motivo,
            tipo: 'TAREA',
            Alumno: { connect: { id: asignacion.alumnoId } },
            Catedra: { connect: { id: asignacion.TareaMaestra.catedraId } },
          },
        });
      }

      res.json(asignacionCalificada);

    } catch (error) {
      console.error('Error grading submission:', error);
      res.status(500).json({ error: 'Error al calificar la entrega.' });
    }
  });

  // GET /docentes/alumnos/:alumnoId/pagos - Obtener el estado de pagos consolidados para un alumno específico
  router.get('/docente/alumnos/:alumnoId/pagos', requireDocente, async (req, res) => {
    const { alumnoId } = req.params;
    const docenteId = req.docente.docenteId;

    try {
      let student = null;
      let isComposer = false;

      // Try to find as Alumno first
      student = await prisma.Alumno.findUnique({
        where: { id: parseInt(alumnoId) },
        include: {
          CatedraAlumno: {
            include: {
              Catedra: {
                include: {
                  CostoCatedra: true,
                },
              },
              Pago: true,
            },
          },
        },
      });

      if (!student) {
        // If not found as Alumno, try to find as Composer
        student = await prisma.Composer.findUnique({
          where: { id: parseInt(alumnoId) },
          include: {
            CatedraAlumno: {
              include: {
                Catedra: {
                  include: {
                    CostoCatedra: true,
                  },
                },
                Pago: true,
              },
            },
          },
        });
        if (student) {
          isComposer = true;
        }
      }

      if (!student) {
        console.log(`[DOCENTE PAGOS] Alumno o Composer ${alumnoId} no encontrado.`);
        return res.status(404).json({ error: 'Alumno o Composer no encontrado.' });
      }

      console.log(`[DOCENTE PAGOS] ${isComposer ? 'Composer' : 'Alumno'} encontrado: ${student.nombre || student.student_first_name} ${student.apellido || student.student_last_name}`);

      const pagosConsolidados = {};

      for (const inscripcion of student.CatedraAlumno) {
        const catedra = inscripcion.Catedra;
        if (!catedra) {
          console.warn(`[DOCENTE PAGOS] Inscripción sin cátedra asociada para estudiante ${alumnoId}. Saltando.`);
          continue;
        }
        console.log(`[DOCENTE PAGOS] Procesando inscripción en cátedra: ${catedra.nombre} (ID: ${catedra.id})`);

        // Only fetch payments for catedras the current docente is associated with
        if (catedra.docenteId !== docenteId) {
          console.warn(`[DOCENTE PAGOS] Docente ${docenteId} intentó acceder a información de pago para estudiante ${alumnoId} en cátedra ${catedra.id} que no imparte. Acceso denegado.`);
          continue;
        }

        const catedraId = catedra.id;
        let estadoActual = 'MATRÍCULA PENDIENTE';

        if (isComposer) {
          estadoActual = 'GRATUITO'; // Composers are assumed to be free for now
          console.log(`[DOCENTE PAGOS] Cátedra ${catedraId} - Es gratuita (Composer).`);
        } else {
          const costoCatedra = catedra.CostoCatedra;
          const allPagos = inscripcion.Pago || [];

          if (costoCatedra && costoCatedra.es_gratuita) {
            estadoActual = 'GRATUITO';
            console.log(`[DOCENTE PAGOS] Cátedra ${catedraId} - Es gratuita.`);
          } else {
            const matriculaPagos = allPagos.filter(p => p.tipo_pago === 'MATRICULA');
            const montoMatriculaPagado = matriculaPagos.reduce((sum, p) => sum + p.monto_pagado, 0);
            const costoMatricula = costoCatedra ? (costoCatedra.monto_matricula || 0) : 0;

            if (costoMatricula > 0) {
              if (montoMatriculaPagado >= costoMatricula) {
                estadoActual = 'AL DÍA';
              } else if (montoMatriculaPagado > 0) {
                estadoActual = 'MATRÍCULA PARCIALMENTE PAGADA';
              } else {
                estadoActual = 'MATRÍCULA PENDIENTE';
              }
            } else {
              // No matricula cost, so it's considered paid regarding matricula.
              estadoActual = 'AL DÍA';
            }

            console.log(`[DOCENTE PAGOS] Cátedra ${catedraId} - Estado de matrícula: ${estadoActual}`);

            if (estadoActual === 'AL DÍA') {
              // Basic check for monthly payments. A more sophisticated check would be needed for a real scenario.
              const cuotaPagos = allPagos.filter(p => p.tipo_pago === 'CUOTA');
              console.log(`[DOCENTE PAGOS] Cátedra ${catedraId} - Pagos de cuotas encontrados: ${cuotaPagos.length}`);
              // This part of the logic can be improved to check if payments are up to date based on month.
              // For now, if matricula is paid, we consider it "AL DÍA" regarding this simplified check.
            }
          }
        }

        pagosConsolidados[catedraId] = {
          catedraId: catedraId,
          nombreCatedra: catedra.nombre,
          estadoActual: estadoActual,
        };
        console.log(`[DOCENTE PAGOS] Estado final consolidado para catedra ${catedraId}: ${estadoActual}`);
      }

      console.log(`[DOCENTE PAGOS] Respondiendo con pagos consolidados para alumno ${alumnoId}:`, Object.values(pagosConsolidados));
      res.status(200).json({ alumnoId: parseInt(alumnoId), pagosConsolidados: Object.values(pagosConsolidados) });

    } catch (error) {
      console.error('[DOCENTE PAGOS] Error al obtener el estado de pagos del alumno para docente:', error);
      console.error('[DOCENTE PAGOS] Detalles del error:', error.message, error.stack);
      res.status(500).json({ error: 'Error al obtener el estado de pagos del alumno.', details: error.message });
    }
  });

  // Get all evaluations for a specific student in a catedra (Docente only)
  router.get('/docente/catedra/:catedraId/alumnos/:alumnoId/evaluaciones', requireDocente, async (req, res) => {
    const { catedraId, alumnoId } = req.params;
    const docenteId = req.docente.docenteId;

    try {
      // 1. Verify the docente owns the catedra
      const catedra = await prisma.catedra.findFirst({
        where: {
          id: parseInt(catedraId),
          docenteId: docenteId,
        },
        include: {
          CatedraAlumno: {
            where: { alumnoId: parseInt(alumnoId) },
            include: { Alumno: true }
          }
        }
      });

      if (!catedra || catedra.CatedraAlumno.length === 0) {
        return res.status(404).json({ error: 'Cátedra no encontrada, acceso denegado o el alumno no está inscrito.' });
      }

      // 2. Get all evaluations for this catedra
      const evaluations = await prisma.evaluacion.findMany({
        where: {
          catedraId: parseInt(catedraId),
        },
        include: {
          EvaluacionAsignacion: { // Usar la relación correcta
            where: { alumnoId: parseInt(alumnoId) },
            select: {
              estado: true,
              created_at: true, // created_at de EvaluacionAsignacion
              CalificacionEvaluacion: { // Incluir la calificación relacionada
                select: { puntos: true } // Seleccionar los puntos de la calificación
              }
            }
          }
        },
        orderBy: { created_at: 'desc' },
      });

      // 3. Map evaluations to include status for the specific student
      const evaluationsWithStatus = evaluations.map(evaluation => ({
        id: evaluation.id,
        titulo: evaluation.titulo,
        created_at: evaluation.created_at,
        catedraId: evaluation.catedraId,
        puntos_obtenidos: evaluation.EvaluacionAsignacion.length > 0 && evaluation.EvaluacionAsignacion[0].CalificacionEvaluacion ? evaluation.EvaluacionAsignacion[0].CalificacionEvaluacion.puntos : null,
        estado: evaluation.EvaluacionAsignacion.length > 0 ? evaluation.EvaluacionAsignacion[0].estado : 'PENDIENTE',
      }));

      res.json(evaluationsWithStatus);

    } catch (error) {
      console.error('Error fetching student evaluations for docente:', error);
      res.status(500).json({ error: 'Error al obtener las evaluaciones del alumno.' });
    }
  });

  // Get evaluation results for a specific student in a catedra (Docente only)
  router.get('/docente/catedra/:catedraId/alumnos/:alumnoId/evaluaciones/:evaluationId/results', requireDocente, async (req, res) => {
    const { catedraId, alumnoId, evaluationId } = req.params;
    const docenteId = req.docente.docenteId;

    try {
      // 1. Verify the docente owns the catedra and the student is enrolled
      const catedra = await prisma.catedra.findFirst({
        where: {
          id: parseInt(catedraId),
          docenteId: docenteId,
        },
        include: {
          alumnos: {
            where: { alumnoId: parseInt(alumnoId) },
            include: { alumno: true },
          },
        },
      });

      if (!catedra || catedra.alumnos.length === 0) {
        return res.status(404).json({ error: 'Cátedra no encontrada, acceso denegado o el alumno no está inscrito.' });
      }

      const alumno = catedra.CatedraAlumno[0].Alumno;

      // 2. Fetch the evaluation with questions and options
      const evaluation = await prisma.evaluacion.findUnique({
        where: { id: parseInt(evaluationId) },
        include: {
          preguntas: {
            include: {
              opciones: true,
            },
          },
          calificaciones: {
            where: { alumnoId: parseInt(alumnoId) },
            select: { id: true, puntos: true, respuestas: true, created_at: true },
          },
        },
      });

      if (!evaluation) {
        return res.status(404).json({ error: 'Evaluación no encontrada.' });
      }

      if (evaluation.catedraId !== parseInt(catedraId)) {
        return res.status(400).json({ error: 'La evaluación no pertenece a esta cátedra.' });
      }

      const studentScore = evaluation.calificaciones.length > 0 ? evaluation.calificaciones[0].puntos : 0;
      const studentAnswers = evaluation.calificaciones.length > 0 ? JSON.parse(evaluation.calificaciones[0].respuestas) : {};

      let totalPossiblePoints = 0;
      const formattedQuestions = evaluation.preguntas.map(question => {
        const correctAnswer = question.opciones.find(opt => opt.es_correcta);
        totalPossiblePoints += 1; // Each question is 1 point
        return {
          id: question.id,
          text: question.texto,
          options: question.opciones.map(option => ({
            id: option.id,
            text: option.texto,
          })),
          correctAnswerId: correctAnswer ? correctAnswer.id : null,
          alumnoAnswerId: studentAnswers[question.id] || null,
        };
      });

      res.json({
        evaluationTitle: evaluation.titulo,
        alumnoNombre: alumno.nombre,
        alumnoApellido: alumno.apellido,
        score: studentScore,
        totalPoints: totalPossiblePoints,
        questions: formattedQuestions,
      });

    } catch (error) {
      console.error('Error fetching evaluation results for docente:', error);
      res.status(500).json({ error: 'Error al obtener los resultados de la evaluación.' });
    }
  });

  // Get a specific evaluation by ID for the logged-in docente
  router.get('/docente/evaluaciones/:evaluationId', requireDocente, async (req, res) => {
    const { evaluationId } = req.params;
    const docenteId = req.docente.docenteId;

    try {
      const evaluation = await prisma.Evaluacion.findUnique({
        where: { id: parseInt(evaluationId) },
        include: {
          Catedra: {
            select: { docenteId: true }
          },
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

      // Verify the catedra of the evaluation belongs to the docente
      if (!evaluation.Catedra || evaluation.Catedra.docenteId !== docenteId) {
        return res.status(403).json({ error: 'No tiene permiso para ver esta evaluación.' });
      }

      res.json(evaluation);

    } catch (error) {
      console.error('Error fetching evaluation for docente:', error);
      res.status(500).json({ error: 'Error al obtener la evaluación.' });
    }
  });

  // --- Rutas para la gestión de Días de Clase ---

  // POST /docentes/catedras/:catedraId/diasclase - Crear un nuevo día de clase
  router.post('/docente/me/catedra/:catedraId/diasclase', requireDocente, async (req, res) => {
    const { catedraId } = req.params;
    const { fecha, dia_semana } = req.body;
    const docenteId = req.docente.docenteId;

    if (!fecha || !dia_semana) {
      return res.status(400).json({ error: 'Fecha y día de la semana son obligatorios.' });
    }

    try {
      // La cadena 'YYYY-MM-DD' se interpreta como medianoche UTC, que es lo correcto.
      const fechaUTC = new Date(fecha);

      const catedra = await prisma.catedra.findFirst({
        where: {
          id: parseInt(catedraId),
          docenteId: docenteId,
        },
      });

      if (!catedra) {
        return res.status(404).json({ error: 'Cátedra no encontrada o acceso denegado.' });
      }

      const newDiaClase = await prisma.diaClase.create({
        data: {
          fecha: fechaUTC,
          dia_semana,
          catedraId: parseInt(catedraId),
        },
      });

      res.status(201).json(newDiaClase);
    } catch (error) {
      console.error('Error al crear día de clase:', error);
      res.status(500).json({ error: 'Error al crear el día de clase.', details: error.message });
    }
  });

  // GET /docentes/catedras/:catedraId/diasclase - Obtener todos los días de clase de una cátedra
  router.get('/docente/me/catedra/:catedraId/diasclase', requireDocente, async (req, res) => {
    const { catedraId } = req.params;
    const docenteId = req.docente.docenteId;

    try {
      const catedra = await prisma.catedra.findFirst({
        where: {
          id: parseInt(catedraId),
          docenteId: docenteId,
        },
      });

      if (!catedra) {
        return res.status(404).json({ error: 'Cátedra no encontrada o acceso denegado.' });
      }

      const diasClase = await prisma.diaClase.findMany({
        where: {
          catedraId: parseInt(catedraId),
        },
        orderBy: {
          fecha: 'asc',
        },
      });

      res.status(200).json(diasClase);
    } catch (error) {
      console.error('Error al obtener días de clase:', error);
      res.status(500).json({ error: 'Error al obtener los días de clase.', details: error.message });
    }
  });

  // GET /docentes/diasclase/:diaClaseId - Obtener un día de clase específico
  router.get('/docente/me/diasclase/:diaClaseId', requireDocente, async (req, res) => {
    const { diaClaseId } = req.params;
    const docenteId = req.docente.docenteId;

    try {
      const diaClase = await prisma.diaClase.findUnique({
        where: {
          id: parseInt(diaClaseId),
        },
        include: {
          catedra: {
            select: { docenteId: true },
          },
        },
      });

      if (!diaClase) {
        return res.status(404).json({ error: 'Día de clase no encontrado.' });
      }

      if (diaClase.catedra.docenteId !== docenteId) {
        return res.status(403).json({ error: 'No tiene permiso para ver este día de clase.' });
      }

      res.status(200).json(diaClase);
    } catch (error) {
      console.error('Error al obtener día de clase:', error);
      res.status(500).json({ error: 'Error al obtener el día de clase.', details: error.message });
    }
  });

  // PUT /docentes/diasclase/:diaClaseId - Actualizar un día de clase
  router.put('/docente/me/diasclase/:diaClaseId', requireDocente, async (req, res) => {
    const { diaClaseId } = req.params;
    const { fecha, dia_semana } = req.body;
    const docenteId = req.docente.docenteId;

    try {
      const diaClase = await prisma.diaClase.findUnique({
        where: {
          id: parseInt(diaClaseId),
        },
        include: {
          catedra: {
            select: { docenteId: true },
          },
        },
      });

      if (!diaClase) {
        return res.status(404).json({ error: 'Día de clase no encontrado.' });
      }

      if (diaClase.catedra.docenteId !== docenteId) {
        return res.status(403).json({ error: 'No tiene permiso para actualizar este día de clase.' });
      }

      let fechaUTC;
      if (fecha) {
        // La cadena 'YYYY-MM-DD' se interpreta como medianoche UTC.
        fechaUTC = new Date(fecha);
      }

      const updatedDiaClase = await prisma.diaClase.update({
        where: { id: parseInt(diaClaseId) },
        data: {
          fecha: fechaUTC, // Usar la fecha UTC o undefined si no se proveyó
          dia_semana: dia_semana || undefined,
        },
      });

      res.status(200).json(updatedDiaClase);
    } catch (error) {
      console.error('Error al actualizar día de clase:', error);
      res.status(500).json({ error: 'Error al actualizar el día de clase.', details: error.message });
    }
  });

  // DELETE /docentes/diasclase/:diaClaseId - Eliminar un día de clase
  router.delete('/docente/me/diasclase/:diaClaseId', requireDocente, async (req, res) => {
    const { diaClaseId } = req.params;
    const docenteId = req.docente.docenteId;

    try {
      const diaClase = await prisma.diaClase.findUnique({
        where: {
          id: parseInt(diaClaseId),
        },
        include: {
          catedra: {
            select: { docenteId: true },
          },
        },
      });

      if (!diaClase) {
        return res.status(404).json({ error: 'Día de clase no encontrado.' });
      }

      if (diaClase.catedra.docenteId !== docenteId) {
        return res.status(403).json({ error: 'No tiene permiso para eliminar este día de clase.' });
      }

      // Eliminar registros de asistencia asociados primero
      await prisma.asistencia.deleteMany({
        where: { diaClaseId: parseInt(diaClaseId) },
      });

      await prisma.diaClase.delete({
        where: { id: parseInt(diaClaseId) },
      });

      res.status(204).send(); // No content
    } catch (error) {
      console.error('Error al eliminar día de clase:', error);
      res.status(500).json({ error: 'Error al eliminar el día de clase.', details: error.message });
    }
  });

  // --- Rutas para la gestión de Asistencia ---

  // POST /docentes/diasclase/:diaClaseId/asistencias - Registrar la asistencia de alumnos para un día de clase
  router.post('/docente/me/diasclase/:diaClaseId/asistencias', requireDocente, async (req, res) => {
    const { diaClaseId } = req.params;
    const { asistencias } = req.body; // [{ alumnoId: 1, presente: true }, { alumnoId: 2, presente: false }]
    const docenteId = req.docente.docenteId;

    if (!Array.isArray(asistencias) || asistencias.length === 0) {
      return res.status(400).json({ error: 'Se requiere una lista de asistencias válida.' });
    }

    try {
      const diaClase = await prisma.diaClase.findUnique({
        where: {
          id: parseInt(diaClaseId),
        },
        include: {
          catedra: {
            select: { docenteId: true },
          },
        },
      });

      if (!diaClase) {
        return res.status(404).json({ error: 'Día de clase no encontrado.' });
      }

      if (diaClase.catedra.docenteId !== docenteId) {
        return res.status(403).json({ error: 'No tiene permiso para registrar asistencia en este día de clase.' });
      }

      const results = [];

      // Borrar asistencias existentes para este día de clase antes de registrar las nuevas
      await prisma.asistencia.deleteMany({
        where: {
          diaClaseId: parseInt(diaClaseId),
        },
      });

      for (const asistencia of asistencias) {
        const { alumnoId, presente } = asistencia;
        const newAsistencia = await prisma.asistencia.create({
          data: {
            diaClaseId: parseInt(diaClaseId),
            alumnoId: parseInt(alumnoId),
            presente,
          },
        });
        results.push(newAsistencia);
      }

      res.status(201).json(results);
    } catch (error) {
      console.error('Error al registrar asistencias:', error);
      res.status(500).json({ error: `Error al registrar la asistencia: ${error.message}` });
    }
  });

  // GET /docentes/diasclase/:diaClaseId/asistencias - Obtener asistencias para un día de clase específico
  router.get('/docente/me/diasclase/:diaClaseId/asistencias', requireDocente, async (req, res) => {
    const { diaClaseId } = req.params;
    const docenteId = req.docente.docenteId;

    try {
      const diaClase = await prisma.diaClase.findUnique({
        where: {
          id: parseInt(diaClaseId),
        },
        include: {
          catedra: {
            select: { docenteId: true, id: true },
          },
          Asistencia: {
            include: {
              alumno: {
                select: { id: true, nombre: true, apellido: true },
              },
            },
          },
        },
      });

      if (!diaClase) {
        return res.status(404).json({ error: 'Día de clase no encontrado.' });
      }

      if (diaClase.catedra.docenteId !== docenteId) {
        return res.status(403).json({ error: 'No tiene permiso para ver las asistencias de este día de clase.' });
      }

      // Obtener todos los alumnos inscritos en la cátedra para ese día de clase,
      // y fusionar con las asistencias registradas.
      const alumnosInscritos = await prisma.catedraAlumno.findMany({
        where: {
          catedraId: diaClase.catedra.id,
        },
        include: {
          Alumno: {
            select: { id: true, nombre: true, apellido: true },
          },
        },
      });

      const asistenciasMap = new Map();
      diaClase.Asistencia.forEach(asist => {
        asistenciasMap.set(asist.alumnoId, asist.presente);
      });

      const alumnosConEstadoAsistencia = alumnosInscritos.map(inscripcion => ({
        id: inscripcion.Alumno.id,
        nombre: inscripcion.Alumno.nombre,
        apellido: inscripcion.Alumno.apellido,
        presente: asistenciasMap.has(inscripcion.Alumno.id) ? asistenciasMap.get(inscripcion.Alumno.id) : false, // Por defecto, ausente si no está registrado
      }));

      res.status(200).json(alumnosConEstadoAsistencia);
    } catch (error) {
      console.error('Error al obtener asistencias para día de clase:', error);
      res.status(500).json({ error: `Error al obtener las asistencias: ${error.message}` });
    }
  });

  // DELETE /docentes/catedras/:catedraId/tarea/:tareaMaestraId - Eliminar una tarea maestra
  router.delete('/docente/catedra/:catedraId/tarea/:tareaMaestraId', requireDocente, async (req, res) => {
    const { catedraId, tareaMaestraId } = req.params;
    const docenteId = req.docente.docenteId;

    try {
      const catedra = await prisma.catedra.findFirst({
        where: {
          id: parseInt(catedraId),
          docenteId: docenteId,
        },
      });

      if (!catedra) {
        return res.status(404).json({ error: 'Cátedra no encontrada o acceso denegado.' });
      }

      const tareaMaestra = await prisma.tareaMaestra.findFirst({
        where: {
          id: parseInt(tareaMaestraId),
          catedraId: parseInt(catedraId),
        },
        include: {
          TareaAsignacion: true,
          publicacion: true,
        },
      });

      if (!tareaMaestra) {
        return res.status(404).json({ error: 'Tarea maestra no encontrada o no pertenece a esta cátedra.' });
      }

      // 1. Eliminar Puntuaciones asociadas a las TareaAsignacion de esta TareaMaestra
      for (const asignacion of tareaMaestra.TareaAsignacion) {
        await prisma.puntuacion.deleteMany({
          where: {
            alumnoId: asignacion.alumnoId,
            catedraId: catedra.id,
            motivo: `Calificación de tarea: ${tareaMaestra.titulo}`,
            tipo: 'TAREA',
          },
        });
      }

      // 2. Eliminar todas las TareaAsignacion asociadas a esta TareaMaestra
      await prisma.tareaAsignacion.deleteMany({
        where: {
          tareaMaestraId: parseInt(tareaMaestraId),
        },
      });

      // 3. Eliminar la Publicacion asociada (si existe)
      if (tareaMaestra.publicacion) {
        await prisma.publicacion.delete({
          where: { id: tareaMaestra.publicacion.id },
        });
      }

      // 4. Finalmente, eliminar la TareaMaestra
      await prisma.tareaMaestra.delete({
        where: { id: parseInt(tareaMaestraId) },
      });

      res.status(200).json({ message: 'Tarea maestra eliminada exitosamente.' });
    } catch (error) {
      console.error('Error al eliminar tarea maestra:', error);
      res.status(500).json({ error: 'Error al eliminar la tarea maestra.', details: error.message });
    }
  });

  return router;
};
