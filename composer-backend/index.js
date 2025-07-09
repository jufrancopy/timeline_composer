console.log('--- INICIANDO index.js - VERSION DEPURACION FINAL ---');
require('dotenv').config();
console.log('DATABASE_URL cargada:', process.env.DATABASE_URL);
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

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
  const checklistItems = campos.map(campo => {
    const isComplete = campo.value !== null && campo.value !== undefined && String(campo.value).trim() !== '';
    if (isComplete) score++;
    return `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${isComplete ? '✅' : '❌'}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${campo.label}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${isComplete ? '+1 pto' : '+0 ptos'}</td>
      </tr>
    `;
  }).join('');

  return `
    <h4 style="color: #333; margin-top: 20px; margin-bottom: 10px;">Detalle de tu Aporte:</h4>
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      ${checklistItems}
      <tr style="background-color: #f8f8f8;">
        <td colspan="2" style="padding: 12px; font-weight: bold; text-align: right;">Puntaje Total:</td>
        <td style="padding: 12px; font-weight: bold; text-align: right;">${score} / 10</td>
      </tr>
    </table>
  `;
};

const prisma = new PrismaClient();
const app = express();

// Configuración de CORS más específica
const allowedOrigins = [
  'http://localhost:3000', // Para desarrollo local
  'https://timeline.thepydeveloper.dev', // El dominio de producción
  'https://hmpy.thepydeveloper.dev' // El dominio de producción actual
];

const corsOptions = {
  origin: function (origin, callback) {
    // Permitir peticiones sin 'origin' (como las de Postman o apps móviles)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'La política de CORS para este sitio no permite acceso desde el origen especificado.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(express.json());

// --- Configuración de Nodemailer ---
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true,
  tls: {
    rejectUnauthorized: false // Añadido para ignorar errores de certificado (solo para depuración/certificados autofirmados)
  },
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// --- Middlewares de Autenticación ---

// Middleware para verificar token de Administrador
const requireAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Acceso denegado: No se proporcionó token' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Acceso denegado: Requiere rol de administrador' });
    }
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Acceso denegado: Token inválido' });
  }
};

// Middleware para verificar token de Usuario (para ver sus aportes)
const requireUser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Acceso denegado: No se proporcionó token' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Guarda el payload del token (ej. { email: '...' })
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Acceso denegado: Token inválido' });
  }
};


// --- Endpoints de Administración ---

// Login para administradores
app.post('/api/admin/login', async (req, res) => {
  const { password } = req.body;
  if (password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign({ role: 'ADMIN' }, process.env.JWT_SECRET, { expiresIn: '8h' });
    return res.json({ token });
  }
  return res.status(401).json({ error: 'Contraseña incorrecta' });
});

// Obtener compositores pendientes (solo admin)
app.get('/api/composers/pending', requireAdmin, async (req, res) => {
  try {
    const composers = await prisma.composer.findMany({
      where: { status: 'PENDING_REVIEW' },
      orderBy: { created_at: 'desc' },
    });
    res.json(composers);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener compositores pendientes' });
  }
});

const getContributorLevel = (count) => {
  let level = 'Principiante'; // Default for 0 contributions or if no condition met
  if (count >= 100) {
    level = 'Guardián del Patrimonio';
  } else if (count >= 50) {
    level = 'Curador de la Memoria Sonora';
  } else if (count >= 20) {
    level = 'Investigador Musical';
  } else if (count >= 10) {
    level = 'Colaborador Avanzado';
  } else if (count >= 5) {
    level = 'Colaborador Activo';
  } else if (count >= 1) {
    level = 'Colaborador Inicial';
  }
  return level;
};

// Actualizar estado y calidad de un compositor (solo admin)
app.put('/api/composers/:id/status', requireAdmin, async (req, res) => {
  try {
    const composerId = parseInt(req.params.id, 10);
    const { status, quality, photo_url } = req.body; // quality y photo_url son opcionales

    if (!composerId || !status) {
      return res.status(400).json({ error: 'ID y estado son obligatorios' });
    }

    const dataToUpdate = { status };
    if (quality) {
      dataToUpdate.quality = quality;
    }
    if (photo_url !== undefined) { // Usar undefined para permitir null como valor válido
      dataToUpdate.photo_url = photo_url;
    }

    const oldComposer = await prisma.composer.findUnique({ where: { id: composerId } });

    const composer = await prisma.composer.update({
      where: { id: composerId },
      data: dataToUpdate,
    });

    // Si el estado cambia a PUBLISHED y el email existe, enviar notificaci��n
    if (status === 'PUBLISHED' && oldComposer.status !== 'PUBLISHED' && composer.email) {
      const contributorEmail = composer.email;

      // Contar aportes publicados del usuario
      const publishedContributionsCount = await prisma.composer.count({
        where: {
          email: contributorEmail,
          status: 'PUBLISHED',
        },
      });

      const contributorLevel = getContributorLevel(publishedContributionsCount);
      const checklistHTML = generarChecklistHTML(composer);

      const mailOptions = {
        from: `"Aportes HMPY" <${process.env.EMAIL_USER}>`,
        to: contributorEmail,
        subject: '¡Tu aporte ha sido aprobado!',
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #28a745; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">¡Aporte Aprobado!</h1>
            </div>
            <div style="padding: 20px;">
              <p>¡Felicidades! Tu sugerencia para añadir a <strong>${composer.first_name} ${composer.last_name}</strong> ha sido revisada y aprobada.</p>
              <p>Con este aporte, ahora tienes <strong>${publishedContributionsCount}</strong> contribuciones publicadas.</p>
              <p>Tu nivel actual de colaborador es: <strong>${contributorLevel}</strong>.</p>
              
              ${checklistHTML}

              <p style="margin-top: 20px; font-size: 14px; color: #666;">
                ¡Gracias por tu valiosa contribución a la memoria musical!
              </p>
            </div>
            <div style="background-color: #f8f8f8; padding: 15px; text-align: center; font-size: 12px; color: #999;">
              Este es un correo automático, por favor no respondas a este mensaje.
            </div>
          </div>
        `,
      };
      transporter.sendMail(mailOptions);
    }

    res.json({ message: 'Compositor actualizado correctamente', composer });
  } catch (error) {
    console.error('Error al actualizar el compositor:', error); // Log completo en el servidor
    res.status(500).json({ 
      error: 'Error al actualizar el compositor', 
      details: error.message || 'No hay detalles adicionales',
      stack: error.stack
    });
  }
});

// Endpoint para actualizar todos los datos de un compositor (solo admin)
app.put('/api/composers/:id', requireAdmin, async (req, res) => {
  const composerId = parseInt(req.params.id, 10);
  const {
    first_name,
    last_name,
    birth_year,
    birth_month,
    birth_day,
    death_year,
    death_month,
    death_day,
    bio,
    notable_works,
    period,
    references,
    photo_url,
    youtube_link,
    status,
    quality,
  } = req.body;

  try {
    const updatedComposer = await prisma.composer.update({
      where: { id: composerId },
      data: {
        first_name,
        last_name,
        birth_year: Number(birth_year),
        birth_month: birth_month ? Number(birth_month) : null,
        birth_day: birth_day ? Number(birth_day) : null,
        death_year: death_year ? Number(death_year) : null,
        death_month: death_month ? Number(death_month) : null,
        death_day: death_day ? Number(death_day) : null,
        bio,
        notable_works,
        period,
        references,
        photo_url,
        youtube_link,
        status,
        quality,
      },
    });
    res.json({ message: 'Compositor actualizado con éxito', composer: updatedComposer });
  } catch (error) {
    console.error('Error al actualizar el compositor:', error);
    res.status(500).json({ error: 'No se pudo actualizar el compositor.' });
  }
});



// --- Endpoints Públicos y de Usuario ---

// Obtener compositores publicados para la línea de tiempo
app.get('/api/composers', async (req, res) => {
  try {
    const { search, period } = req.query;
    const whereClause = { status: 'PUBLISHED' };

    if (search) {
      whereClause.OR = [
        { first_name: { contains: search, mode: 'insensitive' } },
        { last_name: { contains: search, mode: 'insensitive' } },
        { bio: { contains: search, mode: 'insensitive' } },
        { notable_works: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (period) {
      whereClause.period = period;
    }

    const composers = await prisma.composer.findMany({
      where: whereClause,
      orderBy: { birth_year: 'asc' },
      select: { // Seleccionar explícitamente los campos que queremos, incluyendo photo_url
        id: true,
        first_name: true,
        last_name: true,
        birth_year: true,
        birth_month: true,
        birth_day: true,
        death_year: true,
        death_month: true,
        death_day: true,
        bio: true,
        notable_works: true,
        period: true,
        status: true,
        email: true,
        ip_address: true,
        references: true,
        quality: true,
        photo_url: true,
        youtube_link: true, // Ensure youtube_link is also selected
        mainRole: true, // Added mainRole
        created_at: true,
        updated_at: true,
        ratings: true,
      },
    });

    const composersWithRatings = composers.map(composer => {
      const rating_count = composer.ratings.length;
      const rating_avg = rating_count > 0
        ? composer.ratings.reduce((sum, r) => sum + r.rating_value, 0) / rating_count
        : 0;

      // Devolvemos todos los campos del compositor original y añadimos los calculados
      return {
        ...composer,
        rating_count,
        rating_avg: parseFloat(rating_avg.toFixed(2)),
      };
    });

    res.json(composersWithRatings);
  } catch (error) {
    console.error('Error al obtener compositores:', error); // Log completo en el servidor
    res.status(500).json({ 
      error: 'Error al obtener compositores', 
      details: error.message || 'No hay detalles adicionales',
      stack: error.stack
    });
  }
});

// Endpoint para verificar si un email corresponde a un alumno que ya ha aportado
app.post('/api/students/check-email', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'El email es obligatorio' });
  }

  try {
    const studentComposer = await prisma.composer.findFirst({
      where: {
        email: email,
        is_student_contribution: true,
      },
      select: {
        student_first_name: true,
        student_last_name: true,
      },
      orderBy: {
        created_at: 'desc', // Obtener la información más reciente
      },
    });

    if (studentComposer && studentComposer.student_first_name && studentComposer.student_last_name) {
      return res.json({
        isStudent: true,
        student_first_name: studentComposer.student_first_name,
        student_last_name: studentComposer.student_last_name,
      });
    } else {
      return res.json({ isStudent: false });
    }
  } catch (error) {
    console.error('Error al verificar email de alumno:', error);
    res.status(500).json({ error: 'Error interno del servidor al verificar email' });
  }
});

// --- Endpoints para Comentarios ---

// Obtener comentarios de un compositor
app.get('/api/composers/:id/comments', async (req, res) => {
  try {
    const composerId = parseInt(req.params.id, 10);
    const comments = await prisma.comment.findMany({
      where: { composerId },
      orderBy: { created_at: 'desc' },
    });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener comentarios' });
  }
});

// Añadir un comentario a un compositor
app.post('/api/composers/:id/comments', async (req, res) => {
  try {
    const composerId = parseInt(req.params.id, 10);
    const { text, name } = req.body;

    if (!text || !name) {
      return res.status(400).json({ error: 'El nombre y el texto del comentario son obligatorios' });
    }

    const ip_address = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    const comment = await prisma.comment.create({
      data: {
        text,
        name,
        composerId,
        ip_address,
      },
    });
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: 'Error al añadir comentario' });
  }
});

// Enviar nuevo compositor (aporte)
app.post('/api/composers', async (req, res) => {
  try {
    const {
      first_name, last_name,
      birth_year, birth_month, birth_day,
      death_year, death_month, death_day,
      bio, notable_works, period, email, references, photo_url, youtube_link, mainRole,
      is_student_contribution, student_first_name, student_last_name
    } = req.body;

    if (!first_name || !last_name || !birth_year || !bio || !notable_works || !period || !email) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    // Calcular el puntaje de completitud
    const fields = [first_name, last_name, birth_year, bio, notable_works, period, email, photo_url, youtube_link, references];
    const completeness_score = fields.filter(field => field !== null && field !== undefined && field !== '').length;

    const ip_address = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    const formattedPeriod = period.toUpperCase().replace(/\s+/g, '_');

    const composer = await prisma.composer.create({
      data: {
        first_name,
        last_name,
        birth_year: Number(birth_year),
        birth_month: birth_month ? Number(birth_month) : null,
        birth_day: birth_day ? Number(birth_day) : null,
        death_year: death_year ? Number(death_year) : null,
        death_month: death_month ? Number(death_month) : null,
        death_day: death_day ? Number(death_day) : null,
        bio,
        notable_works,
        period: formattedPeriod,
        email,
        references,
        photo_url,
        youtube_link,
        ip_address,
        completeness_score,
        mainRole: {
          set: Array.isArray(mainRole) ? mainRole : (mainRole ? [mainRole] : []),
        },
        status: 'PENDING_REVIEW',
        // Nuevos campos de estudiante
        is_student_contribution: !!is_student_contribution,
        student_first_name: is_student_contribution ? student_first_name : null,
        student_last_name: is_student_contribution ? student_last_name : null,
      },
    });

    // Enviar correo de confirmación
    const mailOptions = {
      from: `"Aportes HMPY" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Confirmación de tu aporte',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #4CAF50; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">¡Gracias por tu aporte!</h1>
          </div>
          <div style="padding: 20px;">
            <p>Hemos recibido tu sugerencia para añadir a <strong>${first_name} ${last_name}</strong> a la línea de tiempo musical. Nuestro equipo lo revisará pronto.</p>
            <p>Aquí tienes un resumen de la información que nos proporcionaste:</p>
            <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd; background-color: #f2f2f2; font-weight: bold;">Nombre Completo:</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${first_name} ${last_name}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd; background-color: #f2f2f2; font-weight: bold;">Años de Vida:</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${birth_year} - ${death_year || 'Presente'}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd; background-color: #f2f2f2; font-weight: bold;">Período:</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${period}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd; background-color: #f2f2f2; font-weight: bold;">Biografía:</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${bio}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd; background-color: #f2f2f2; font-weight: bold;">Obras Notables:</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${notable_works}</td>
              </tr>
              ${references ? `
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd; background-color: #f2f2f2; font-weight: bold;">Referencias:</td>
                <td style="padding: 8px; border: 1px solid #ddd;"><a href="${references}" style="color: #007bff; text-decoration: none;">${references}</a></td>
              </tr>
              ` : ''}
            </table>
            <p style="margin-top: 20px; font-size: 14px; color: #666;">
              Si tienes alguna pregunta, no dudes en contactarnos.
            </p>
          </div>
          <div style="background-color: #f8f8f8; padding: 15px; text-align: center; font-size: 12px; color: #999;">
            Este es un correo automático, por favor no respondas a este mensaje.
          </div>
        </div>
      `,
    };
    transporter.sendMail(mailOptions);

    res.status(201).json({ message: 'Aporte recibido y pendiente de revisión', composer });
  } catch (error) {
    console.error('Error al crear aporte:', error); // Log completo en el servidor
    res.status(500).json({ 
      error: 'Error al crear aporte', 
      details: error.message || 'No hay detalles adicionales' 
    });
  }
});

// Valorar un compositor
app.post('/api/ratings', async (req, res) => {
  try {
    const { composerId, rating_value } = req.body;
    const ip_address = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    const existingRating = await prisma.rating.findFirst({ where: { composerId, ip_address } });
    if (existingRating) {
      return res.status(400).json({ error: 'Ya valoraste este compositor' });
    }

    const rating = await prisma.rating.create({ data: { composerId, rating_value, ip_address } });
    res.status(201).json({ message: 'Valoración registrada', rating });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar valoración' });
  }
});

// --- Sistema de Consulta de Aportes por Email (OTP) ---

// 1. Solicitar código OTP
app.post('/api/request-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'El email es obligatorio' });
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString(); // Código de 6 dígitos
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // Expira en 10 minutos

  try {
    await prisma.otp.create({ data: { email, code, expiresAt } });

    const mailOptions = {
      from: `"Aportes HMPY" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Tu código de acceso para ver tus aportes',
      html: `<h1>Tu código de acceso</h1><p>Usa este código para ver tus aportes: <strong>${code}</strong></p><p>El código expira en 10 minutos.</p>`,
    };
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Código enviado a tu email' });
  } catch (error) {
    console.error('Error al enviar el código:', error); // Log detallado
    res.status(500).json({ error: 'Error al enviar el código' });
  }
});

// 2. Verificar código OTP y obtener token
app.post('/api/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ error: 'Email y código son obligatorios' });
  }

  try {
    const otpRecord = await prisma.otp.findFirst({
      where: { email, code: otp, expiresAt: { gte: new Date() } },
    });

    if (!otpRecord) {
      return res.status(400).json({ error: 'Código inválido o expirado' });
    }

    // El código es válido, eliminarlo para que no se reutilice
    await prisma.otp.delete({ where: { id: otpRecord.id } });

    // Generar un token JWT para el usuario
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: 'Verificación exitosa', token });

  } catch (error) {
    console.error('Error en la verificación de OTP:', error); // Log detallado
    res.status(500).json({ error: 'Error en la verificación' });
  }
});

// 3. Obtener los aportes del usuario autenticado
app.get('/api/my-contributions', requireUser, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const contributions = await prisma.composer.findMany({
      where: { email: userEmail },
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        birth_year: true,
        birth_month: true,
        birth_day: true,
        death_year: true,
        death_month: true,
        death_day: true,
        bio: true,
        notable_works: true,
        period: true,
        references: true,
        photo_url: true,
        youtube_link: true,
        mainRole: true,
        status: true,
        quality: true,
        email: true,
        is_student_contribution: true,
        student_first_name: true,
        student_last_name: true,
        rejection_reason: true,
        suggestion_reason: true,
        completeness_score: true,
        created_at: true,
        updated_at: true,
      },
    });

    // Obtener el nivel de contribuyente para el usuario
    const publishedContributionsCount = await prisma.composer.count({
      where: {
        email: userEmail,
        status: 'PUBLISHED',
      },
    });
    const userLevel = getContributorLevel(publishedContributionsCount);

    res.json({ contributions, userLevel });
  } catch (error) {
    console.error('Error al obtener los aportes del usuario:', error);
    res.status(500).json({ error: 'Error al obtener tus aportes' });
  }
});


// --- Ranking de Aportantes ---
app.get('/api/ranking', async (req, res) => {
  try {
    console.log('[DEBUG] Attempting to generate ranking with corrected query.');
    const contributors = await prisma.composer.groupBy({
      by: ['email'],
      _count: {
        email: true,
      },
      where: {
        status: 'PUBLISHED',
      },
      orderBy: {
        _count: {
          email: 'desc',
        },
      },
    });

    console.log('[RANKING DEBUG] Contribuyentes brutos:', JSON.stringify(contributors, null, 2));

    const ranking = await Promise.all(contributors.map(async (c) => {
      const count = c._count.email;
      let level = 'Principiante'; // Default for 0 contributions or if no condition met
      if (count >= 100) {
        level = 'Guardián del Patrimonio';
      } else if (count >= 50) {
        level = 'Curador de la Memoria Sonora';
      } else if (count >= 20) {
        level = 'Investigador Musical';
      } else if (count >= 10) {
        level = 'Colaborador Avanzado';
      } else if (count >= 5) {
        level = 'Colaborador Activo';
      } else if (count >= 1) {
        level = 'Colaborador Inicial';
      }

      // Buscar la información del alumno para este email
      const studentInfo = await prisma.composer.findFirst({
        where: {
          email: c.email,
          is_student_contribution: true,
        },
        select: {
          is_student_contribution: true,
          student_first_name: true,
          student_last_name: true,
        },
        orderBy: {
          created_at: 'desc', // Obtener la información más reciente
        },
      });
      
      return {
        email: c.email,
        contributions: count,
        level,
        is_student_contribution: studentInfo?.is_student_contribution || false,
        student_first_name: studentInfo?.student_first_name || null,
        student_last_name: studentInfo?.student_last_name || null,
      };
    }));

    console.log('[RANKING DEBUG] Ranking final:', JSON.stringify(ranking, null, 2));

    res.json(ranking);
  } catch (error) {
    console.error('[RANKING ERROR] Error al generar el ranking:', error); // Log completo en el servidor
    res.status(500).json({ error: 'Error al generar el ranking', details: error.message, stack: error.stack });
  }
});

// --- Compositor del Día ---
app.get('/api/composers/featured', async (req, res) => {
  try {
    const totalComposers = await prisma.composer.count({
      where: { status: 'PUBLISHED' },
    });

    if (totalComposers === 0) {
      return res.status(404).json({ error: 'No hay compositores publicados para destacar.' });
    }

    // Usar la fecha para generar un índice diario que sea consistente para todos
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    const index = dayOfYear % totalComposers;

    const featuredComposer = await prisma.composer.findFirst({
      where: { status: 'PUBLISHED' },
      skip: index,
      orderBy: { id: 'asc' }, // Ordenar por ID para consistencia
      select: { // Seleccionar explícitamente los campos que queremos, incluyendo photo_url
        id: true,
        first_name: true,
        last_name: true,
        birth_year: true,
        birth_month: true,
        birth_day: true,
        death_year: true,
        death_month: true,
        death_day: true,
        bio: true,
        notable_works: true,
        period: true,
        status: true,
        email: true,
        ip_address: true,
        references: true,
        quality: true,
        photo_url: true,
        youtube_link: true, // Ensure youtube_link is also selected
        mainRole: true, // Added mainRole
        created_at: true,
        updated_at: true,
        ratings: true,
      },
    });

    if (!featuredComposer) {
      return res.status(404).json({ error: 'No se pudo encontrar un compositor destacado.' });
    }

    res.json(featuredComposer);
  } catch (error) {
    console.error('Error al obtener compositor destacado:', error);
    res.status(500).json({ error: 'Error al obtener compositor destacado', details: error.message, stack: error.stack });
  }
});

// --- Efemérides ---
app.get('/api/efemerides', async (req, res) => {
  try {
    const today = new Date();
    const month = today.getMonth() + 1; // getMonth() es 0-indexado
    const day = today.getDate();

    console.log(`[EFEMERIDES DEBUG] Fecha actual: ${today.toISOString()}`);
    console.log(`[EFEMERIDES DEBUG] Mes calculado: ${month}, Día calculado: ${day}`);

    const whereClause = {
      status: 'PUBLISHED',
      OR: [
        {
          birth_month: month,
          birth_day: day,
        },
        {
          death_month: month,
          death_day: day,
        },
      ],
    };
    console.log('[EFEMERIDES DEBUG] Cláusula where:', JSON.stringify(whereClause, null, 2));

    const efemerides = await prisma.composer.findMany({
      where: whereClause,
      orderBy: {
        birth_year: 'asc',
      },
    });

    console.log(`[EFEMERIDES DEBUG] Compositores encontrados: ${efemerides.length}`);
    if (efemerides.length > 0) {
      console.log('[EFEMERIDES DEBUG] Primer compositor encontrado:', JSON.stringify(efemerides[0], null, 2));
    }

    res.json(efemerides);
  } catch (error) {
    console.error('[EFEMERIDES ERROR] Error al obtener efemérides:', error);
    res.status(500).json({ error: 'Error al obtener efemérides', details: error.message, stack: error.stack });
  }
});


app.get('/api/debug-composers', async (req, res) => {
  try {
    const composers = await prisma.composer.findMany({
      where: { status: 'PUBLISHED' },
      select: { id: true, first_name: true, last_name: true, birth_month: true, birth_day: true, death_month: true, death_day: true, status: true },
      orderBy: { id: 'asc' },
    });
    console.log('[DEBUG] Compositores publicados en la DB:', JSON.stringify(composers, null, 2));
    res.json(composers);
  } catch (error) {
    console.error('[DEBUG ERROR] Error al obtener compositores para depuración:', error);
    res.status(500).json({ error: 'Error al obtener compositores para depuración' });
  }
});

// Remitir para revisión (antes "Rechazar")
app.post('/api/composers/:id/review', requireAdmin, async (req, res) => {
  try {
    const composerId = parseInt(req.params.id, 10);
    const { reason } = req.body;

    if (!composerId || !reason) {
      return res.status(400).json({ error: 'ID del compositor y motivo de revisión son obligatorios' });
    }

    const composerToUpdate = await prisma.composer.findUnique({
      where: { id: composerId },
    });

    if (!composerToUpdate) {
      return res.status(404).json({ error: 'Compositor no encontrado' });
    }

    const checklistHTML = generarChecklistHTML(composerToUpdate);

    const updatedComposer = await prisma.composer.update({
      where: { id: composerId },
      data: {
        status: 'NEEDS_IMPROVEMENT',
        rejection_reason: reason,
      },
    });

    // Enviar correo de notificación
    if (composerToUpdate.email) {
      const mailOptions = {
        from: `"Aportes HMPY" <${process.env.EMAIL_USER}>`,
        to: composerToUpdate.email,
        subject: 'Sugerencias para mejorar tu aporte a HMPY',
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #fd7e14; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">Sugerencias para tu Aporte</h1>
            </div>
            <div style="padding: 20px;">
              <p>¡Hola! Primero que nada, <strong>muchas gracias por tu dedicación</strong> y por compartir tu conocimiento con la comunidad de la Música Paraguaya.</p>
              <p>Hemos revisado con mucho interés tu propuesta para añadir a <strong>${composerToUpdate.first_name} ${composerToUpdate.last_name}</strong>. Está muy cerca de ser publicada, solo necesita unos pequeños ajustes para alcanzar la calidad que buscamos para nuestro archivo.</p>
              
              ${checklistHTML}

              <h3 style="color: #555; margin-top: 25px;">Sugerencias del curador:</h3>
              <div style="background-color: #fff3e0; border-left: 4px solid #fd7e14; padding: 15px; margin-top: 10px;">
                <p style="margin: 0; font-style: italic;">${reason}</p>
              </div>
              <p style="margin-top: 25px;">
                Por favor, tómate un momento para revisar estos puntos. Una vez que los ajustes estén listos, puedes volver a enviar tu aporte desde el portal "Mis Aportes". ¡Estamos ansiosos por verlo publicado!
              </p>
            </div>
            <div style="background-color: #f8f8f8; padding: 15px; text-align: center; font-size: 12px; color: #999;">
              Este es un correo automático. Tu contribución es muy valiosa para nosotros.
            </div>
          </div>
        `,
      };
      transporter.sendMail(mailOptions);
    }

    res.json({ message: 'Aporte remitido para revisión', composer: updatedComposer });
  } catch (error) {
    console.error('Error al remitir el aporte:', error);
    res.status(500).json({ error: 'Error al remitir el aporte para revisión' });
  }
});

// Reenviar un aporte corregido (solo usuario dueño)
app.put('/api/composers/resubmit/:id', requireUser, async (req, res) => {
  try {
    const composerId = parseInt(req.params.id, 10);
    const userEmail = req.user.email;

    const composerToUpdate = await prisma.composer.findUnique({
      where: { id: composerId },
    });

    if (!composerToUpdate) {
      return res.status(404).json({ error: 'Compositor no encontrado' });
    }

    if (composerToUpdate.email !== userEmail) {
      return res.status(403).json({ error: 'No tienes permiso para editar este aporte' });
    }

    const {
      first_name, last_name, birth_year, death_year, bio, notable_works, period, references, photo_url, youtube_link, mainRole
    } = req.body;

    // Recalcular puntaje
    const fields = [first_name, last_name, birth_year, bio, notable_works, period, userEmail, photo_url, youtube_link, references];
    const completeness_score = fields.filter(field => field !== null && field !== undefined && String(field).trim() !== '').length;

    const updatedComposer = await prisma.composer.update({
      where: { id: composerId },
      data: {
        ...req.body,
        completeness_score,
        status: 'PENDING_REVIEW',
        rejection_reason: null, // Limpiar motivo de rechazo
      },
    });

    res.json({ message: 'Aporte reenviado con éxito', composer: updatedComposer });

  } catch (error) {
    console.error('Error al reenviar el aporte:', error);
    res.status(500).json({ error: 'Error al reenviar el aporte' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en puerto ${PORT}`);
});