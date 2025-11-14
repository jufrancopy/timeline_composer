const path = require('path');
const fs = require('fs');

process.on('uncaughtException', (err) => {
  console.error('ERROR FATAL NO CAPTURADO:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('ERROR FATAL (PROMESA RECHAZADA) NO MANEJADO:', reason, promise);
  process.exit(1);
});

process.on('exit', (code) => {
  console.log(`Proceso de Node.js terminado con código de salida: ${code}`);
});

console.log('--- INICIANDO index.js - VERSION DEPURACION FINAL ---');

require('dotenv').config({ path: path.resolve(__dirname, '.env') });
console.log('DATABASE_URL cargada:', process.env.DATABASE_URL ? '*****' : 'NO CONFIGURADA');
console.log('GEMINI_API_KEY cargada:', process.env.GEMINI_API_KEY ? '*****' : 'NO CONFIGURADA');
console.log('ADMIN_PASSWORD cargada (parcial):', process.env.ADMIN_PASSWORD ? process.env.ADMIN_PASSWORD.substring(0, 3) + '...' : 'NO CONFIGURADA');
console.log('JWT_SECRET cargada:', process.env.JWT_SECRET ? '*****' : 'NO CONFIGURADA');
console.log(`Entorno Node.js: ${process.env.NODE_ENV}`);
const express = require('express');
// const cors = require('cors');

const nodemailer = require('nodemailer');

const jwt = require('jsonwebtoken');
const multer = require('multer');
const crypto = require('crypto');

const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
console.log('GoogleGenerativeAI inicializado correctamente.');

const uploadDir = path.join(__dirname, 'uploads/tareas');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const requireAdmin = require('./middlewares/requireAdmin');
const { requireUser } = require('./middlewares/requireUser'); // Importar solo la función de fábrica
const { router: evaluationRoutes, setTransporter, setPrismaClient } = require('./evaluationRoutes');
const docenteRoutes = require('./docenteRoutes');
const adminRoutes = require('./adminRoutes');
const requireDocente = require('./middlewares/requireDocente');
const requireDocenteOrAdmin = require('./middlewares/requireDocenteOrAdmin');
const publicacionRoutes = require('./publicacionRoutes');
const composerRoutes = require('./composerRoutes');
const alumnoRoutes = require('./alumnoRoutes');
const { router: ratingRoutes, setPrismaClient: setPrismaClientForRatings } = require('./ratingRoutes');


const prisma = require('./utils/prismaClient');
const app = express();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

setPrismaClient(prisma);
setTransporter(transporter);
// setPrismaClientForUserMiddleware(prisma); // Esta línea ya no es necesaria
setPrismaClientForRatings(prisma);

app.use(express.json());



// Configuración de Multer para la subida de archivos de tareas
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

app.post('/api/upload/tarea-multimedia', requireDocenteOrAdmin, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se adjuntó ningún archivo.' });
  }
  const filePath = `/uploads/tareas/${req.file.filename}`;
  res.status(200).json({ message: 'Archivo subido con éxito', filePath });
});

// Endpoint para verificar si un email corresponde a un alumno
app.post('/api/students/check-email', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email es requerido.' });
    }

    const alumno = await prisma.alumno.findUnique({
      where: { email },
      select: { nombre: true, apellido: true },
    });

    if (alumno) {
      res.json({ isStudent: true, student_first_name: alumno.nombre, student_last_name: alumno.apellido });
    } else {
      res.json({ isStudent: false });
    }
  } catch (error) {
    console.error('Error al verificar email de estudiante:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// Middleware para servir archivos estáticos desde el directorio de uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Instanciar los routers una sola vez
const docenteRouter = docenteRoutes(prisma, transporter);
const adminRouter = adminRoutes(prisma, transporter);
const publicacionRouter = publicacionRoutes(prisma, transporter);
const composerRouter = composerRoutes(prisma, transporter);
const alumnoRouter = alumnoRoutes(prisma, transporter); // AQUI EL CAMBIO

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error("Multer error:", err);
    return res.status(400).json({ error: err.message });
  } else if (err) {
    console.error("Unknown error during file upload:", err);
    return res.status(500).json({ error: 'Error desconocido al subir archivo.' });
  }
  next();
});

// --- Función Auxiliar para Checklist de Completitud ---
const generarChecklistHTML = (composer) => {
  const campos = [
    { key: 'first_name', label: 'Nombre', value: composer.first_name },
    { key: 'last_name', label: 'Apellido', value: composer.last_name },
    { key: 'birth_year', label: 'Año de Nacimiento', value: composer.birth_year },
    { key: 'bio', label: 'Biografía', value: composer.bio },
    { key: 'notable_works', label: 'Obras Notables', value: composer.notable_works },
    { key: 'period', label: 'Período Musical', value: composer.period },
    { key: 'email', label: 'Email de Contacto', value: composer.email },
    { key: 'photo_url', label: 'Foto del Creador', value: composer.photo_url },
    { key: 'youtube_link', label: 'Video de YouTube', value: composer.youtube_link },
    { key: 'references', label: 'Referencias', value: composer.references },
  ];

  let score = 0;
  campos.forEach(campo => {
    const isComplete = campo.value !== null && campo.value !== undefined && String(campo.value).trim() !== '';
    if (isComplete) score++;
  });

  return `
    <h4 style="color: #333; margin-top: 20px; margin-bottom: 10px;">Detalle de tu Aporte:</h4>
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      
      <tr style="background-color: #f8f8f8;">
        <td colspan="2" style="padding: 12px; font-weight: bold; text-align: right;">Puntaje Total:</td>
        <td style="padding: 12px; font-weight: bold; text-align: right;">${score} / ${campos.length}</td>
      </tr>
    </table>
  `;
};

const getContributorLevel = (score) => {
  let level = 'Principiante'; // Default for 0 contributions or if no condition met
  if (score >= 100) {
    level = 'Guardián del Patrimonio';
  } else if (score >= 50) {
    level = 'Curador de la Memoria Sonora';
  } else if (score >= 20) {
    level = 'Investigador Musical';
  } else if (score >= 10) {
    level = 'Colaborador Avanzado';
  } else if (score >= 5) {
    level = 'Colaborador Activo';
  } else if (score >= 1) {
    level = 'Colaborador Inicial';
  }
  return level;
};

const calculatePointsFromComposer = (composer) => {
  const fields = [
    composer.first_name,
    composer.last_name,
    composer.birth_year,
    composer.bio,
    composer.notable_works,
    composer.period,
    composer.email,
    composer.photo_url,
    composer.youtube_link,
    composer.references,
  ];
  
  let score = 0;
  fields.forEach(field => {
    if (field !== null && field !== undefined && String(field).trim() !== '') {
      score++;
    }
  });
  return score;
};

// Definición de la función calculateContributionScore
const calculateContributionScore = async (userEmail) => {
  const publishedContributionsCount = await prisma.composer.count({
    where: {
      email: userEmail,
      status: 'PUBLISHED',
    },
  });
  const publishedSuggestionsCount = await prisma.editSuggestion.count({
    where: {
      suggester_email: userEmail,
      status: 'PUBLISHED',
    },
  });
  const totalContributions = publishedContributionsCount + publishedSuggestionsCount;
  return totalContributions;
};

// --- Endpoints de Dashboard para Admin ---
app.get('/api/admin/dashboard-counts', requireAdmin, async (req, res) => {
  try {
    const totalCatedras = await prisma.catedra.count();
    const totalAlumnos = await prisma.alumno.count();
    const totalTareasMaestras = await prisma.tareaMaestra.count(); // Nuevo: Total de tareas maestras
    const totalAsignacionesTareas = await prisma.tareaAsignacion.count(); // Nuevo: Total de asignaciones de tareas
    const pendingTaskAssignments = await prisma.tareaAsignacion.count({ where: { estado: 'ENTREGADA' } }); // Contar asignaciones entregadas
    const gradedTaskAssignments = await prisma.tareaAsignacion.count({ where: { estado: 'CALIFICADA' } }); // Contar asignaciones calificadas
    const pendingContributions = await prisma.composer.count({ where: { status: 'PENDING_REVIEW' } });
    const pendingSuggestions = await prisma.editSuggestion.count({ where: { status: 'PENDING_REVIEW' } });

    res.json({
      totalCatedras,
      totalAlumnos,
      totalTareasMaestras, // Nuevo
      totalAsignacionesTareas, // Nuevo
      pendingTaskAssignments, // Nuevo
      gradedTaskAssignments, // Nuevo
      pendingContributions,
      pendingSuggestions,
    });
  } catch (error) {
    console.error('[DASHBOARD] Error al obtener los conteos del dashboard:', error);
    res.status(500).json({ error: 'Error al obtener los conteos del dashboard', details: error.message });
  }
});

// Obtener todas las cátedras
app.get('/api/docentes', requireAdmin, async (req, res) => {
  try {
    const docentes = await prisma.docente.findMany({
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

app.post('/api/docentes', requireAdmin, async (req, res) => {
  try {
    const { nombre, apellido, email, telefono, direccion } = req.body;
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

app.put('/api/docentes/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, email, telefono, direccion } = req.body;
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

app.delete('/api/docentes/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.docente.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar docente:', error);
    res.status(500).json({ error: 'Error al eliminar el docente', details: error.message });
  }
});

app.post('/api/catedras', requireAdmin, async (req, res) => {
  try {
    const { nombre, anio, institucion, turno, aula, dias, docenteId, modalidad_pago, horariosPorDia } = req.body; // Remove 'horario'
    
    if (isNaN(parseInt(anio))) {
      return res.status(400).json({ error: 'El año académico debe ser un número válido.' });
    }

    if (docenteId && isNaN(parseInt(docenteId))) {
      return res.status(400).json({ error: 'El ID del docente debe ser un número válido.' });
    }

    const newCatedra = await prisma.catedra.create({
      data: {
        nombre,
        anio: parseInt(anio), // Parse anio to Int
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
    console.error('Error creating catedra:', error);
    res.status(500).json({ error: 'Error al crear la cátedra', details: error.message });
  }
});

app.put('/api/catedras/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { nombre, anio, institucion, turno, aula, dias, docenteId, modalidad_pago, horariosPorDia } = req.body;

  if (isNaN(parseInt(anio))) {
    return res.status(400).json({ error: 'El año académico debe ser un número válido.' });
  }

  if (docenteId && isNaN(parseInt(docenteId))) {
    return res.status(400).json({ error: 'El ID del docente debe ser un número válido.' });
  }

  try {
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
    console.error('Error al actualizar cátedra:', error);
    res.status(500).json({ error: 'Error al actualizar la cátedra.', details: error.message });
  }
});

app.get('/api/catedras', requireAdmin, async (req, res) => {
  try {
    const catedras = await prisma.catedra.findMany({
      include: {
        _count: {
          select: { alumnos: true },
        },
      },
      orderBy: { nombre: 'asc' },
    });
    res.json(catedras);
  } catch (error) {
    console.error('Error al obtener cátedras:', error);
    res.status(500).json({ error: 'Error al obtener las cátedras', details: error.message });
  }
});




// Nuevo endpoint para obtener todos los alumnos, para ser usado como "student contributors"
app.get('/api/composers/students', requireAdmin, async (req, res) => {
  try {
    const students = await prisma.alumno.findMany({
      orderBy: { nombre: 'asc' },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
      }
    });
    res.json(students);
  } catch (error) {
    console.error('Error al obtener student composers:', error);
    res.status(500).json({ error: 'Error al obtener la lista de student composers', details: error.message });
  }
});

// Inscribir alumno o compositor en una cátedra
app.post('/api/catedras/:catedraId/inscribir', requireAdmin, async (req, res) => {
  try {
    const { catedraId } = req.params;
    const { alumnoId, composerId } = req.body;

    if (!alumnoId && !composerId) {
      return res.status(400).json({ error: 'Se requiere alumnoId o composerId para inscribir.' });
    }

    const data = {
      catedraId: parseInt(catedraId, 10),
      assignedBy: req.user.email || 'Admin', // Asignar por el usuario autenticado (admin)
    };

    if (alumnoId) {
      data.alumnoId = parseInt(alumnoId, 10);
    } else if (composerId) {
      data.composerId = parseInt(composerId, 10);
    }

    // Verificar si ya está inscrito
    const existingEnrollment = await prisma.catedraAlumno.findFirst({
      where: {
        catedraId: data.catedraId,
        ...(data.alumnoId && { alumnoId: data.alumnoId }),
        ...(data.composerId && { composerId: data.composerId }),
      },
    });

    if (existingEnrollment) {
      return res.status(409).json({ error: 'El alumno o compositor ya está inscrito en esta cátedra.' });
    }

    const inscripcion = await prisma.catedraAlumno.create({ data });
    res.status(201).json({ message: 'Inscripción exitosa', inscripcion });
  } catch (error) {
    console.error('Error al inscribir alumno/compositor:', error);
    res.status(500).json({ error: 'Error al inscribir alumno/compositor', details: error.message });
  }
});

// Desinscribir alumno o compositor de una cátedra
app.delete('/api/catedras/:catedraId/desinscribir', requireAdmin, async (req, res) => {
  try {
    const { catedraId } = req.params;
    const { alumnoId, composerId } = req.body;

    if (!alumnoId && !composerId) {
      return res.status(400).json({ error: 'Se requiere alumnoId o composerId para desinscribir.' });
    }

    const whereClause = {
      catedraId: parseInt(catedraId, 10),
      ...(alumnoId && { alumnoId: parseInt(alumnoId, 10) }),
      ...(composerId && { composerId: parseInt(composerId, 10) }),
    };

    const deleteResult = await prisma.catedraAlumno.deleteMany({
      where: whereClause,
    });

    if (deleteResult.count === 0) {
      return res.status(404).json({ error: 'Inscripción no encontrada.' });
    }

    res.json({ message: 'Desinscripción exitosa' });
  } catch (error) {
    console.error('Error al desinscribir alumno/compositor:', error);
    res.status(500).json({ error: 'Error al desinscribir alumno/compositor', details: error.message });
  }
});

// --- Endpoints de Administración ---

// Login para administradores


// --- Endpoints de Autenticación de Usuario (OTP) ---

// Solicitar OTP para login de usuario
app.post('/api/request-otp', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email es requerido.' });
  }

  // Buscar si el email corresponde a un alumno
  const alumno = await prisma.alumno.findUnique({ where: { email } });
  if (!alumno) {
    return res.status(404).json({ error: 'No se encontró un usuario con ese email.' });
  }

  const otp = crypto.randomInt(100000, 999999).toString(); // Generar un OTP de 6 dígitos
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP expira en 10 minutos

  try {
    // Guardar OTP en la base de datos
    await prisma.otp.upsert({
      where: { email },
      update: { code: otp, expiresAt },
      create: { email, code: otp, expiresAt },
    });

    const mailOptions = {
      from: `"HMPY (Historia de la Música PY - Academia)" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Tu código de verificación HMPY',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Código de Verificación</h2>
          <p>Hola,</p>
          <p>Tu código de verificación para acceder a Aportes HMPY es:</p>
          <p style="font-size: 24px; font-weight: bold; color: #5a189a;">${otp}</p>
          <p>Este código es válido por 10 minutos.</p>
          <p>Si no solicitaste este código, puedes ignorar este correo.</p>
        </div>
        <div style="background-color: #f8f8f8; padding: 15px; text-align: center; font-size: 12px; color: #999;">
          Este es un correo automático, por favor no respondas a este mensaje.
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Código OTP enviado a tu email.' });
  } catch (error) {
    console.error('Error al solicitar OTP:', error);
    res.status(500).json({ error: 'Error al enviar el OTP', details: error.message });
  }
});

// Verificar OTP y loguear usuario
app.post('/api/alumnos/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: 'Email y OTP son obligatorios.' });
  }

  try {
    const storedOtp = await prisma.otp.findUnique({ where: { email } });

    if (!storedOtp || storedOtp.code !== otp || storedOtp.expiresAt < new Date()) {
      return res.status(401).json({ error: 'OTP inválido o expirado.' });
    }

    // OTP es válido, generar token JWT para el alumno
    const alumno = await prisma.alumno.findUnique({ where: { email } });
    if (!alumno) {
      return res.status(404).json({ error: 'Alumno no encontrado.' });
    }

    // El rol de alumno se asigna aquí
    const token = jwt.sign(
      { userId: alumno.id, email: alumno.email, role: 'alumno', alumnoId: alumno.id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' } // Token válido por 24 horas
    );

    // Eliminar OTP después de un uso exitoso
    await prisma.otp.delete({ where: { email } });

    res.json({ token, alumnoId: alumno.id, role: 'alumno' });
  } catch (error) {
    console.error('Error al verificar OTP:', error);
    res.status(500).json({ error: 'Error al verificar el OTP', details: error.message });
  }
});

// app.get('/api/alumnos/me', requireUser(prisma), async (req, res) => {
//   try {
//     const { alumnoId, role } = req.user;

//     console.log('[GET /api/alumnos/me] req.user.role:', role);
//     console.log('[GET /api/alumnos/me] req.user.alumnoId:', alumnoId);
//     if (role !== 'alumno' || !alumnoId) {
//       return res.status(403).json({ error: 'Acceso denegado: Solo para alumnos.' });
//     }

//     const alumno = await prisma.alumno.findUnique({
//       where: { id: alumnoId },
//       include: {
//         catedras: {
//           include: {
//             catedra: true,
//           },
//         },
//         asignacionesTareas: {
//           include: {
//             tareaMaestra: {
//               include: {
//                 catedra: {
//                   select: {
//                     nombre: true,
//                     anio: true
//                   }
//                 }
//               }
//             }
//           }
//         }
//       }
//     });

//     if (!alumno) {
//       return res.status(404).json({ error: 'Alumno no encontrado.' });
//     }

//     // Calcular la suma total de puntos del alumno
//     const totalPuntos = await prisma.puntuacion.aggregate({
//       where: { alumnoId: alumno.id },
//       _sum: {
//         puntos: true,
//       },
//     });

//     res.json({ ...alumno, totalPuntos: totalPuntos._sum.puntos || 0 });
//   } catch (error) {
//     console.error('Error al obtener perfil del alumno:', error);
//     res.status(500).json({ error: 'Error al obtener el perfil del alumno', details: error.message });
//   }
// });

// Obtener contribuciones de compositores y sugerencias de edición de un alumno logueado

app.get('/api/alumnos/me/contributions', requireUser(prisma), async (req, res) => {
  try {
    const { email } = req.user;

    if (!email) {
      return res.status(403).json({ error: 'Acceso denegado: Email de alumno no disponible.' });
    }

    // Buscar compositores creados por el alumno
    const studentComposers = await prisma.composer.findMany({
      where: {
        is_student_contribution: true,
        email: email, // Usar el email del alumno para filtrar
      },
      orderBy: { created_at: 'desc' },
    });

    // Buscar sugerencias de edición realizadas por el alumno
    const studentSuggestions = await prisma.editSuggestion.findMany({
      where: {
        suggester_email: email,
      },
      include: {
        composer: {
          select: {
            first_name: true,
            last_name: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    // Combinar y formatear los resultados
    const formattedContributions = [
      ...studentComposers.map(c => ({
        id: c.id,
        first_name: c.first_name,
        last_name: c.last_name,
        status: c.status,
        type: 'Composer',
        rejection_reason: c.rejection_reason,
        suggestion_reason: c.suggestion_reason, // This field is actually `reason` for Composer, but using `suggestion_reason` for consistency in frontend
      })),
      ...studentSuggestions.map(s => ({
        id: s.id,
        first_name: s.first_name || s.composer.first_name,
        last_name: s.last_name || s.composer.last_name,
        status: s.status,
        type: 'EditSuggestion',
        rejection_reason: s.rejection_reason,
        suggestion_reason: s.reason,
      })),
    ];

    res.json(formattedContributions);
  } catch (error) {
    console.error('Error al obtener las contribuciones del alumno:', error);
    res.status(500).json({ error: 'Error al obtener las contribuciones del alumno', details: error.message });
  }
});

// Obtener ranking de alumnos por puntos
app.get('/api/ranking', async (req, res) => {
  try {
    const alumnos = await prisma.alumno.findMany({
      include: {
        puntuaciones: {
          select: {
            puntos: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    const ranking = alumnos.map(alumno => {
      console.log('Alumno para ranking:', alumno.id, alumno.nombre, alumno.apellido, alumno.puntuaciones); // Log para depuración
      const totalPuntos = alumno.puntuaciones.reduce((sum, p) => sum + p.puntos, 0);
      return {
        id: alumno.id,
        nombre: alumno.nombre,
        apellido: alumno.apellido,
        email: alumno.email,
        totalPuntos: totalPuntos,
      };
    }).sort((a, b) => b.totalPuntos - a.totalPuntos);

    res.json(ranking);
  } catch (error) {
    console.error('Error al obtener el ranking:', error);
    res.status(500).json({ error: 'Error al obtener el ranking', details: error.message });
  }
});

// Obtener todas las tareas de un alumno


// Obtener una tarea específica por ID
app.get('/api/tareas/:tareaId', requireUser(prisma), async (req, res) => {
  try {
    const tareaId = parseInt(req.params.tareaId);
    const { alumnoId, role } = req.user;

    const tarea = await prisma.tarea.findUnique({
      where: { id: tareaId },
      include: {
        catedra: true,
        alumno: true,
      },
    });

    if (!tarea) {
      return res.status(404).json({ error: 'Tarea no encontrada.' });
    }

    // Verificar si el alumno logueado es el propietario de la tarea o un admin
    if (role !== 'admin' && tarea.alumnoId !== alumnoId) {
      return res.status(403).json({ error: 'Acceso denegado: No autorizado para ver esta tarea.' });
    }

    res.json(tarea);
  } catch (error) {
    console.error('Error al obtener tarea por ID:', error);
    res.status(500).json({ error: 'Error al obtener la tarea', details: error.message });
  }
});


// Subir entrega de tarea
app.post('/api/tareas/:tareaId/submit', requireUser(prisma), upload.single('file'), async (req, res) => {
  try {
    const tareaId = parseInt(req.params.tareaId);
    const { alumnoId, role } = req.user;

    if (!req.file) {
      return res.status(400).json({ error: 'No se adjuntó ningún archivo para la entrega.' });
    }

    const submissionPath = `/uploads/entregas/${req.file.filename}`;

    const tarea = await prisma._originalClient.tarea.findUnique({ where: { id: tareaId } });

    if (!tarea) {
      // Eliminar el archivo si la tarea no existe
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'Tarea no encontrada.' });
    }

    // Verificar que el alumno que entrega es el asignado a la tarea o un admin
    if (role !== 'admin' && tarea.alumnoId !== alumnoId) {
      fs.unlinkSync(req.file.path); // Eliminar el archivo si no está autorizado
      return res.status(403).json({ error: 'Acceso denegado: No autorizado para entregar esta tarea.' });
    }

    const updatedTarea = await prisma._originalClient.tarea.update({
      where: { id: tareaId },
      data: {
        estado: 'ENTREGADA',
        submission_path: submissionPath,
        submission_date: new Date(),
      },
    });

    res.status(200).json({ message: 'Entrega subida con éxito', tarea: updatedTarea });
  } catch (error) {
    console.error('Error al subir entrega de tarea:', error);
    if (req.file) {
      fs.unlinkSync(req.file.path); // Asegurarse de eliminar el archivo en caso de error
    }
    res.status(500).json({ error: 'Error al procesar la entrega de la tarea', details: error.message });
  }
});

app.get('/api/admin/tareas/entregadas', requireAdmin, async (req, res) => {
  try {
    const submittedTasks = await prisma.tarea.findMany({
      where: { estado: 'ENTREGADA' },
      include: {
        alumno: {
          select: {
            nombre: true,
            apellido: true,
            email: true,
          },
        },
        catedra: {
          select: {
            nombre: true,
          },
        },
      },
      orderBy: {
        submission_date: 'desc',
      },
    });
    res.json(submittedTasks);
  } catch (error) {
    console.error('Error al obtener tareas entregadas:', error);
    res.status(500).json({ error: 'Error al obtener tareas entregadas', details: error.message });
  }
});

app.get('/api/admin/tareas/calificadas', requireAdmin, async (req, res) => {
  try {
    const gradedTasks = await prisma.tarea.findMany({
      where: { estado: 'CALIFICADA' },
      include: {
        alumno: {
          select: {
            nombre: true,
            apellido: true,
            email: true,
          },
        },
        catedra: {
          select: {
            nombre: true,
          },
        },
      },
      orderBy: {
        submission_date: 'desc', // O por fecha de calificación si se añade
      },
    });
    res.json(gradedTasks);
  } catch (error) {
    console.error('Error al obtener tareas calificadas:', error);
    res.status(500).json({ error: 'Error al obtener tareas calificadas', details: error.message });
  }
});

// Calificar tarea (solo admin)
app.post('/api/admin/tareas/:tareaId/calificar', requireAdmin, async (req, res) => {
  try {
    const tareaId = parseInt(req.params.tareaId);
    const { puntos_obtenidos } = req.body;

    if (puntos_obtenidos === undefined || puntos_obtenidos < 0) {
      return res.status(400).json({ error: 'Puntos obtenidos es requerido y debe ser un número no negativo.' });
    }

    const tarea = await prisma.tarea.findUnique({
      where: { id: tareaId },
      include: {
        alumno: true,
        catedra: true,
      },
    });

    if (!tarea) {
      return res.status(404).json({ error: 'Tarea no encontrada.' });
    }

    if (puntos_obtenidos > tarea.puntos_posibles) {
      return res.status(400).json({ error: `Los puntos obtenidos (${puntos_obtenidos}) no pueden ser mayores que los puntos posibles (${tarea.puntos_posibles}).` });
    }

    // Actualizar la tarea y su estado
    const updatedTarea = await prisma._originalClient.tarea.update({
      where: { id: tareaId },
      data: {
        estado: 'ENTREGADA',
        puntos_obtenidos: parseInt(puntos_obtenidos, 10),
      },
    });

    // Añadir los puntos a la tabla de Puntuacion general
    await prisma.puntuacion.create({
      data: {
        alumnoId: tarea.alumnoId,
        catedraId: tarea.catedraId,
        puntos: parseInt(puntos_obtenidos, 10),
        motivo: `Calificación de tarea: ${tarea.titulo}`,
        tipo: 'TAREA',
      },
    });

    // Enviar correo de notificación al alumno
    if (tarea.alumno && tarea.alumno.email) {
      const mailOptions = {
        from: `"HMPY (Historia de la Música PY - Academia)" <${process.env.EMAIL_USER}>`,
        to: tarea.alumno.email,
        subject: `Tu tarea "${tarea.titulo}" ha sido calificada`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>Tu Tarea Ha Sido Calificada</h2>
            <p>Hola ${tarea.alumno.nombre},</p>
            <p>Tu tarea <strong>"${tarea.titulo}"</strong> en la cátedra <strong>"${tarea.catedra.nombre}"</strong> ha sido calificada.</p>
            <p>Has obtenido <strong>${puntos_obtenidos} de ${tarea.puntos_posibles} puntos</strong>.</p>
            <p>Puedes revisar los detalles en tu panel de contribuciones.</p>
            <p>Atentamente,</p>
            <p>El equipo de HMPY</p>
          </div>
        `,
      };

      transporter.sendMail(mailOptions)
        .then((info) => console.log(`Email de calificación de tarea enviado a ${tarea.alumno.email}: ${info.messageId}`))
        .catch((error) => console.error(`Error al enviar email de calificación de tarea a ${tarea.alumno.email}:`, error));
    }

    res.json({ message: 'Tarea calificada y puntos asignados.', tarea: updatedTarea });
  } catch (error) {
    console.error('Error al calificar tarea:', error);
    res.status(500).json({ error: 'Error al calificar la tarea', details: error.message });
  }
});

// Eliminar tarea (solo admin)
app.delete('/api/admin/tareas/:tareaId', requireAdmin, async (req, res) => {
  try {
    const tareaId = parseInt(req.params.tareaId);

    // Obtener la tarea para eliminar los puntos asociados en Puntuacion
    const tareaToDelete = await prisma.tarea.findUnique({
      where: { id: tareaId },
      select: { alumnoId: true, catedraId: true, titulo: true },
    });

    if (!tareaToDelete) {
      return res.status(404).json({ error: 'Tarea no encontrada.' });
    }

    // Eliminar los registros de Puntuacion asociados a esta tarea
    await prisma.puntuacion.deleteMany({
      where: {
        alumnoId: tareaToDelete.alumnoId,
        catedraId: tareaToDelete.catedraId,
        motivo: `Calificación de tarea: ${tareaToDelete.titulo}`,
        tipo: 'TAREA',
      },
    });

    // Eliminar la tarea
    await prisma.tarea.delete({
      where: { id: tareaId },
    });

    res.status(200).json({ message: 'Tarea eliminada exitosamente.' });
  } catch (error) {
    console.error('Error al eliminar tarea:', error);
    res.status(500).json({ error: 'Error al eliminar la tarea', details: error.message });
  }
});

app.use('/api', docenteRouter);
app.use('/api', evaluationRoutes);
app.use('/api', adminRouter);
app.use('/api', publicacionRouter);
app.use('/api/composers', composerRouter);
app.use('/api/ratings', ratingRoutes);
app.use('/api', alumnoRouter);

app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../composer-frontend/build', 'index.html'));
});

const PORT = process.env.PORT || 4000;

console.log('Intentando iniciar servidor...');
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
    console.log('Servidor iniciado correctamente.');

    console.log(`FRONTEND_URL: ${process.env.FRONTEND_URL}`);
    console.log(`EMAIL_USER: ${process.env.EMAIL_USER}`);
});

console.log('Fin del archivo index.js. El servidor Express debería estar escuchando.');