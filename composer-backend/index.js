console.log('[CRUSH DEBUG] Backend index.js cargado.');
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
const upload = require('./utils/multerConfig');
// const cors = require('cors');

const nodemailer = require('nodemailer');

const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
console.log('GoogleGenerativeAI inicializado correctamente.');

const requireAdmin = require('./middlewares/requireAdmin');
const { requireUser } = require('./middlewares/requireUser'); // Importar solo la función de fábrica
const { router: evaluationRoutes, setTransporter, setPrismaClient } = require('./routes/evaluationRoutes');
const docenteRoutes = require('./routes/docenteRoutes');
const adminRoutes = require('./routes/adminRoutes');
const requireDocente = require('./middlewares/requireDocente');
const requireDocenteOrAdmin = require('./middlewares/requireDocenteOrAdmin');
const publicacionRoutes = require('./routes/publicacionRoutes');
const composerRoutes = require('./routes/composerRoutes');
const alumnoRoutes = require('./routes/alumnoRoutes');
const { router: ratingRoutes, setPrismaClient: setPrismaClientForRatings } = require('./routes/ratingRoutes');

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

// Bloque de prueba de envío de correo
(async () => {
  try {
    const testMailOptions = {
      from: `"HMPY Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Envía un correo a ti mismo para probar
      subject: 'Test Email from HMPY Backend',
      html: '<p>This is a test email sent from your HMPY backend.</p>',
    };
    console.log('[DEBUG EMAIL] Intentando enviar correo de prueba...');
    const info = await transporter.sendMail(testMailOptions);
    console.log('[DEBUG EMAIL] Correo de prueba enviado exitosamente:', info.messageId);
  } catch (testError) {
    console.error('[DEBUG EMAIL] Error al enviar correo de prueba:', testError);
  }
})();
// Fin del bloque de prueba

setPrismaClient(prisma);
setTransporter(transporter);
// setPrismaClientForUserMiddleware(prisma); // Esta línea ya no es necesaria
setPrismaClientForRatings(prisma);

app.use(express.json());
app.use((req, res, next) => {
  console.log(`[GLOBAL REQUEST] ${req.method} ${req.originalUrl}`);
  next();
});
// // app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));



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
console.log('[DEBUG] composerRouter inicializado.');
const alumnoRouter = alumnoRoutes(prisma, transporter); 

app.use((err, req, res, next) => {
  if (err) {
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
  const publishedContributionsCount = await prisma.Composer.count({
    where: {
      email: userEmail,
      status: 'PUBLISHED',
    },
  });
  const publishedSuggestionsCount = await prisma.EditSuggestion.count({
    where: {
      suggester_email: userEmail,
      status: 'PUBLISHED',
    },
  });
  const totalContributions = publishedContributionsCount + publishedSuggestionsCount;
  return totalContributions;
};

// --- Endpoints de Administración ---
app.use('/api/admin', adminRouter);

// --- Endpoints de Autenticación de Usuario (OTP) ---

// Solicitar OTP para login de usuario
app.post('/api/request-otp', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email es requerido.' });
  }

  // Buscar si el email corresponde a un alumno
  const alumno = await prisma.Alumno.findUnique({ where: { email } });
  if (!alumno) {
    return res.status(404).json({ error: 'No se encontró un usuario con ese email.' });
  }

  const otp = crypto.randomInt(100000, 999999).toString(); // Generar un OTP de 6 dígitos
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP expira en 10 minutos

  try {
    // Guardar OTP en la base de datos
    await prisma.Otp.upsert({
      where: { email },
      update: { code: otp, expiresAt },
      create: { email, code: otp, expiresAt },
    });

    const mailOptions = {
      from: `"HMPY (Historia de la Música PY - Academia)" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Tu código de verificación HMPY',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #e0e0e0; background-color: #1a202c; padding: 20px; border-radius: 8px; max-width: 600px; margin: 20px auto; border: 1px solid #2d3748;">
          <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #2d3748;">
            <h2 style="color: #4CAF50; margin: 0; font-size: 28px;">Verificación de Acceso HMPY</h2>
            <p style="color: #a0aec0; font-size: 14px;">Tu plataforma educativa colaborativa</p>
          </div>
          <div style="padding: 20px 0;">
            <p style="font-size: 16px; margin-bottom: 15px;">Hola,</p>
            <p style="font-size: 16px; margin-bottom: 20px;">Hemos recibido una solicitud para iniciar sesión en tu cuenta de Alumno en HMPY. Utiliza el siguiente código para verificar tu identidad:</p>
            <p style="font-size: 36px; font-weight: bold; text-align: center; color: #81C784; background-color: #2d3748; padding: 15px 20px; border-radius: 10px; letter-spacing: 3px; margin: 30px 0;">${otp}</p>
            <p style="font-size: 14px; color: #cbd5e0; text-align: center; margin-top: 20px;">Este código es válido por <strong style="color: #90CAF9;">10 minutos</strong>.</p>
            <p style="font-size: 14px; color: #a0aec0; margin-top: 20px;">Si no solicitaste este código, puedes ignorar este correo electrónico de forma segura.</p>
            <p style="font-size: 14px; color: #a0aec0; margin-top: 10px;">Para cualquier consulta, no dudes en contactar a nuestro soporte.</p>
          </div>
          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #2d3748; margin-top: 30px; font-size: 12px; color: #718096;">
            <p>&copy; ${new Date().getFullYear()} HMPY - Historia de la Música PY. Todos los derechos reservados.</p>
            <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
          </div>
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

app.get('/api/alumnos/me', requireUser(prisma), async (req, res) => {
  try {
    const { alumnoId, role } = req.user;

    // console.log('[GET /api/alumnos/me] req.user.role:', role);
    // console.log('[GET /api/alumnos/me] req.user.alumnoId:', alumnoId);
    if (role !== 'alumno' || !alumnoId) {
      return res.status(403).json({ error: 'Acceso denegado: Solo para alumnos.' });
    }

    const alumno = await prisma.Alumno.findUnique({
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

    // Calcular la suma total de puntos del alumno
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

// Obtener contribuciones de compositores y sugerencias de edición de un alumno logueado

app.get('/api/alumnos/me/contributions', requireUser(prisma), async (req, res) => {
  try {
    const { email } = req.user;

    if (!email) {
      return res.status(403).json({ error: 'Acceso denegado: Email de alumno no disponible.' });
    }

    // Buscar compositores creados por el alumno
    const studentComposers = await prisma.Composer.findMany({
      where: {
        is_student_contribution: true,
        email: email, // Usar el email del alumno para filtrar
      },
      orderBy: { created_at: 'desc' },
    });

    // Buscar sugerencias de edición realizadas por el alumno
    const studentSuggestions = await prisma.EditSuggestion.findMany({
      where: {
        suggester_email: email,
      },
      include: {
        Composer: {
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
        Puntuacion: {
          select: {
            puntos: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    const ranking = alumnos.map(alumno => {
      console.log('Alumno para ranking:', alumno.id, alumno.nombre, alumno.apellido, alumno.Puntuacion); // Log para depuración
      const totalPuntos = alumno.Puntuacion.reduce((sum, p) => sum + p.puntos, 0);
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
app.get('/api/tareas/:tareaAsignacionId', requireUser(prisma), async (req, res) => {
  try {
    const tareaAsignacionId = parseInt(req.params.tareaAsignacionId);
    const { alumnoId, role } = req.user;

    const tareaAsignacion = await prisma.tareaAsignacion.findUnique({
      where: { id: tareaAsignacionId },
      include: {
        tareaMaestra: {
          include: {
            catedra: true,
          },
        },
      },
    });

    if (!tareaAsignacion) {
      return res.status(404).json({ error: 'Asignación de Tarea no encontrada.' });
    }

    // Verificar si el alumno logueado es el propietario de la asignación de tarea o un admin
    if (role !== 'admin' && tareaAsignacion.alumnoId !== alumnoId) {
      return res.status(403).json({ error: 'Acceso denegado: No autorizado para ver esta asignación de tarea.' });
    }

    res.json(tareaAsignacion);
  } catch (error) {
    console.error('Error al obtener asignación de tarea por ID:', error);
    res.status(500).json({ error: 'Error al obtener la asignación de tarea', details: error.message });
  }
});

// Subir entrega de tarea
app.post('/api/tareas/:tareaAsignacionId/submit', requireUser(prisma), upload.single('file'), async (req, res) => {
  try {
    const tareaAsignacionId = parseInt(req.params.tareaAsignacionId);
    const { alumnoId, role } = req.user;

    if (!req.file) {
      return res.status(400).json({ error: 'No se adjuntó ningún archivo para la entrega.' });
    }

    const submissionPath = `/uploads/entregas/${req.file.filename}`;

    const tareaAsignacion = await prisma.tareaAsignacion.findUnique({ where: { id: tareaAsignacionId } });

    if (!tareaAsignacion) {
      // Eliminar el archivo si la asignación de tarea no existe
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'Asignación de Tarea no encontrada.' });
    }

    // Verificar que el alumno que entrega es el asignado a la tarea o un admin
    if (role !== 'admin' && tareaAsignacion.alumnoId !== alumnoId) {
      fs.unlinkSync(req.file.path); // Eliminar el archivo si no está autorizado
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

    res.status(200).json({ message: 'Entrega subida con éxito', tareaAsignacion: updatedTareaAsignacion });
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
    const submittedTasks = await prisma.TareaAsignacion.findMany({
      where: { estado: 'ENTREGADA' },
      include: {
        Alumno: {
          select: {
            nombre: true,
            apellido: true,
            email: true,
          },
        },
        TareaMaestra: {
          select: {
            titulo: true,
            Catedra: {
              select: {
                nombre: true,
              },
            },
          },
        },
      },
      orderBy: {
        submission_date: 'desc',
      },
    });

    // Formatear la salida para incluir el título de la tarea maestra y el nombre de la cátedra
    const formattedTasks = submittedTasks.map(assignment => ({
      id: assignment.id,
      alumnoNombre: assignment.alumno.nombre,
      alumnoApellido: assignment.alumno.apellido,
      alumnoEmail: assignment.alumno.email,
      tareaTitulo: assignment.tareaMaestra.titulo,
      catedraNombre: assignment.tareaMaestra.catedra.nombre,
      submission_date: assignment.submission_date,
      submission_path: assignment.submission_path,
    }));

    res.json(formattedTasks);
  } catch (error) {
    console.error('Error al obtener tareas entregadas:', error);
    res.status(500).json({ error: 'Error al obtener tareas entregadas', details: error.message });
  }
});

app.get('/api/admin/tareas/calificadas', requireAdmin, async (req, res) => {
  try {
    const gradedTasks = await prisma.TareaAsignacion.findMany({
      where: { estado: 'CALIFICADA' },
      include: {
        Alumno: {
          select: {
            nombre: true,
            apellido: true,
            email: true,
          },
        },
        TareaMaestra: {
          select: {
            titulo: true,
            Catedra: {
              select: {
                nombre: true,
              },
            },
          },
        },
      },
      orderBy: {
        submission_date: 'desc', // O por fecha de calificación si se añade
      },
    });

    // Formatear la salida para incluir el título de la tarea maestra y el nombre de la cátedra
    const formattedTasks = gradedTasks.map(assignment => ({
      id: assignment.id,
      alumnoNombre: assignment.alumno.nombre,
      alumnoApellido: assignment.alumno.apellido,
      alumnoEmail: assignment.alumno.email,
      tareaTitulo: assignment.tareaMaestra.titulo,
      catedraNombre: assignment.tareaMaestra.catedra.nombre,
      submission_date: assignment.submission_date,
      puntos_obtenidos: assignment.puntos_obtenidos,
    }));

    res.json(formattedTasks);
  } catch (error) {
    console.error('Error al obtener tareas calificadas:', error);
    res.status(500).json({ error: 'Error al obtener tareas calificadas', details: error.message });
  }
});

// Calificar tarea (solo admin)
app.post('/api/admin/tareas/:tareaAsignacionId/calificar', requireAdmin, async (req, res) => {
  try {
    const tareaAsignacionId = parseInt(req.params.tareaAsignacionId);
    const { puntos_obtenidos } = req.body;

    if (puntos_obtenidos === undefined || puntos_obtenidos < 0) {
      return res.status(400).json({ error: 'Puntos obtenidos es requerido y debe ser un número no negativo.' });
    }

    const tareaAsignacion = await prisma.TareaAsignacion.findUnique({
      where: { id: tareaAsignacionId },
      include: {
        Alumno: true,
        TareaMaestra: {
          include: {
            Catedra: true,
          },
        },
      },
    });

    if (!tareaAsignacion) {
      return res.status(404).json({ error: 'Asignación de Tarea no encontrada.' });
    }

    if (puntos_obtenidos > tareaAsignacion.tareaMaestra.puntos_posibles) {
      return res.status(400).json({ error: `Los puntos obtenidos (${puntos_obtenidos}) no pueden ser mayores que los puntos posibles (${tareaAsignacion.tareaMaestra.puntos_posibles}).` });
    }

    // Actualizar la asignación de tarea y su estado
    const updatedTareaAsignacion = await prisma.TareaAsignacion.update({
      where: { id: tareaAsignacionId },
      data: {
        estado: 'CALIFICADA',
        puntos_obtenidos: parseInt(puntos_obtenidos, 10),
      },
    });

    // Añadir los puntos a la tabla de Puntuacion general
    await prisma.Puntuacion.create({
      data: {
        alumnoId: tareaAsignacion.alumnoId,
        catedraId: tareaAsignacion.tareaMaestra.catedraId,
        puntos: parseInt(puntos_obtenidos, 10),
        motivo: `Calificación de tarea: ${tareaAsignacion.tareaMaestra.titulo}`,
        tipo: 'TAREA',
      },
    });

    // Enviar correo de notificación al alumno
    if (tareaAsignacion.Alumno && tareaAsignacion.Alumno.email) {
      const mailOptions = {
        from: `"HMPY (Historia de la Música PY - Academia)" <${process.env.EMAIL_USER}>`,
        to: tareaAsignacion.Alumno.email,
        subject: `Tu tarea "${tareaAsignacion.TareaMaestra.titulo}" ha sido calificada`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>Tu Tarea Ha Sido Calificada</h2>
            <p>Hola ${tareaAsignacion.Alumno.nombre},</p>
            <p>Tu tarea <strong>"${tareaAsignacion.TareaMaestra.titulo}"</strong> en la cátedra <strong>"${tareaAsignacion.TareaMaestra.Catedra.nombre}"</strong> ha sido calificada.</p>
            <p>Has obtenido <strong>${puntos_obtenidos} de ${tareaAsignacion.TareaMaestra.puntos_posibles} puntos</strong>.</p>
            <p>Puedes revisar los detalles en tu panel de contribuciones.</p>
            <p>Atentamente,</p>
            <p>El equipo de HMPY</p>
          </div>
        `,
      };

      transporter.sendMail(mailOptions)
        .then((info) => console.log(`Email de calificación de tarea enviado a ${tareaAsignacion.Alumno.email}: ${info.messageId}`))
        .catch((error) => console.error(`Error al enviar email de calificación de tarea a ${tareaAsignacion.Alumno.email}:`, error));
    }

    res.json({ message: 'Tarea calificada y puntos asignados.', tareaAsignacion: updatedTareaAsignacion });
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
    const tareaAsignacionToDelete = await prisma.TareaAsignacion.findUnique({
      where: { id: tareaAsignacionId },
      include: {
        TareaMaestra: true, // Necesitamos el título de la TareaMaestra
      },
    });

    if (!tareaAsignacionToDelete) {
      return res.status(404).json({ error: 'Asignación de Tarea no encontrada.' });
    }

    // Eliminar los registros de Puntuacion asociados a esta asignación de tarea
    await prisma.puntuacion.deleteMany({
      where: {
        alumnoId: tareaAsignacionToDelete.alumnoId,
        catedraId: tareaAsignacionToDelete.tareaMaestra.catedraId,
        motivo: `Calificación de tarea: ${tareaAsignacionToDelete.tareaMaestra.titulo}`,
        tipo: 'TAREA',
      },
    });

    // Eliminar la asignación de tarea
    await prisma.TareaAsignacion.delete({
      where: { id: tareaAsignacionId },
    });

    res.status(200).json({ message: 'Tarea eliminada exitosamente.', status: 200 });
  } catch (error) {
    console.error('Error al eliminar tarea:', error);
    res.status(500).json({ error: 'Error al eliminar la tarea', details: error.message });
  }
});

app.use('/api/composers', composerRouter);
app.use('/api', adminRouter);
app.use('/api', docenteRouter);
app.use('/api', evaluationRoutes);
app.use('/api', publicacionRouter);
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
