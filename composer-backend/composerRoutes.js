const express = require('express');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const requireUser = require('./middlewares/requireUser').requireUser;
const requireAdmin = require('./middlewares/requireAdmin');
const requireDocenteOrAdmin = require('./middlewares/requireDocenteOrAdmin');

module.exports = (prisma, transporter) => {
  const router = express.Router();

  // Middleware para verificar JWT y obtener el rol (Permite pasar si no hay token)
  const authenticateJWT = (req, res, next) => {
      const authHeader = req.headers.authorization;

      if (authHeader) {
          const token = authHeader.split(' ')[1];

          jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
              if (err) {
                  console.error("JWT verification error:", err);
                  req.user = undefined; // Asegurarse de que req.user sea undefined en caso de token inválido
                  next(); // Permitir que la petición continúe
              } else {
                  req.user = user;
                  next();
              }
          });
      } else {
          next(); // Permite que las rutas públicas se ejecuten sin token
      }
  };


  // --- Funciones auxiliares para Composers ---
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


  // --- Endpoints para Composers (públicos y autenticados) ---

  // Obtener todos los compositores (Público, pero con información adicional si está autenticado)
  router.get('/', authenticateJWT, async (req, res) => {
      try {
          const { search, period, status, page = 1, limit = 10 } = req.query;
          const skip = (parseInt(page) - 1) * parseInt(limit);
          let where = {};
          console.log('[Backend] Recibido req.query:', req.query);

          if (search) {
              where.OR = [
                  { first_name: { contains: search, mode: 'insensitive' } },
                  { last_name: { contains: search, mode: 'insensitive' } },
                  { bio: { contains: search, mode: 'insensitive' } },
              ];
          }

          if (period) {
              where.period = period;
          }

          console.log('[Backend] User info:', req.user);

          // Apply status filter based on user role and provided status
          if (req.user && req.user.role === 'ADMIN') {
              if (status) {
                  where.status = status; // Admin can filter by any status
              }
              // If admin and no status is provided, no status filter is applied, showing all
          } else if (req.user && req.user.role === 'alumno') {
              // Alumnos ven publicados, y sus propias contribuciones pendientes de revisión
              where.OR = [
                  { status: 'PUBLISHED' },
                  { status: 'PENDING_REVIEW', email: req.user.email } // Solo las propias
              ];
          } else {
              // Usuarios no autenticados (o roles no especificados) solo ven publicados
              where.status = 'PUBLISHED';
          }

          console.log('[Backend] FINAL Construyendo cláusula where:', JSON.stringify(where, null, 2));
          const composers = await prisma.composer.findMany({
              where,
              orderBy: { last_name: 'asc' },
              skip,
              take: parseInt(limit),
              include: {
                  ratings: {
                      select: {
                          rating_value: true,
                      },
                  },
              },
          });

          const composersWithRatings = composers.map(composer => {
              const totalRatings = composer.ratings.length;
              const sumRatings = composer.ratings.reduce((sum, r) => sum + r.rating_value, 0);
              const rating_avg = totalRatings > 0 ? parseFloat((sumRatings / totalRatings).toFixed(1)) : 0.0;

              return {
                  ...composer,
                  rating_avg,
                  rating_count: totalRatings,
                  ratings: undefined, // Eliminar la array de ratings crudos para no enviarlos al frontend
              };
          });

          const totalComposers = await prisma.composer.count({ where });

          console.log(`[Backend] Total de compositores encontrados: ${totalComposers}`);
          console.log(`[Backend] Enviando ${composersWithRatings.length} compositores al frontend.`);

          res.json({
              data: composersWithRatings,
              total: totalComposers,
              page: parseInt(page),
              limit: parseInt(limit),
              totalPages: Math.ceil(totalComposers / parseInt(limit)),
          });
      } catch (error) {
          console.error('Error al obtener compositores:', error);
          res.status(500).json({ error: 'Error al obtener compositores', details: error.message });
      }
  });

  // Obtener compositor destacado (Público)
  router.get('/featured', async (req, res) => {
      try {
          const featured = await prisma.composer.findFirst({
              where: { is_featured: true, status: 'PUBLISHED' },
              orderBy: { updated_at: 'desc' },
          });
          res.json(featured);
      } catch (error) {
          console.error('Error al obtener compositor destacado:', error);
          res.status(500).json({ error: 'Error al obtener compositor destacado', details: error.message });
      }
  });

  // Obtener compositores pendientes de revisión (Solo Admin)
  router.get('/pending', requireAdmin, async (req, res) => {
      console.log('[Backend] Accediendo a /composers/pending');
      try {
          const pendingComposers = await prisma.composer.findMany({
              where: { status: 'PENDING_REVIEW' },
              orderBy: { created_at: 'desc' },
          });
          res.json(pendingComposers);
      } catch (error) {
          console.error('Error al obtener compositores pendientes:', error);
          res.status(500).json({ error: 'Error al obtener compositores pendientes', details: error.message });
      }
  });

  // Añadir nuevo compositor (Requiere usuario/alumno)
  router.post('/', requireUser, async (req, res) => {
      try {
          const { first_name, last_name, birth_year, bio, notable_works, period, photo_url, youtube_link, references } = req.body;
          const { email, is_student_contribution } = req.body; // Email y si es contribución de estudiante, vienen del body
          console.log('[Composer POST /] req.user at creation:', req.user);
          const calculatedStatus = req.user && req.user.role === 'ADMIN' ? 'PUBLISHED' : 'PENDING_REVIEW';
          console.log('[Composer POST /] Calculated status:', calculatedStatus);
          console.log('[Composer POST /] req.body.is_student_contribution:', req.body.is_student_contribution);
          console.log('[Composer POST /] is_student_contribution (variable desestructurada):', is_student_contribution);

          const newComposer = await prisma.composer.create({
              data: {
                  first_name,
                  last_name,
                  birth_year: parseInt(birth_year),
                  bio,
                  notable_works,
                  period,
                  email,
                  photo_url,
                  youtube_link,
                  references,
                  status: calculatedStatus,
                  is_student_contribution,
              },
          });
          console.log('[Composer POST /] Created Composer object:', newComposer);

          // Enviar correo electrónico al aportante
          console.log('[Composer POST /] Checking email sending conditions.');
          console.log('[Composer POST /] Email user:', process.env.EMAIL_USER);
          console.log('[Composer POST /] Transporter available:', !!transporter);
          console.log('[Composer POST /] is_student_contribution:', is_student_contribution, 'Email:', email);
          if (email) {
              const mailOptions = {
                  from: `"HMPY (Historia de la Música PY - Academia)" <${process.env.EMAIL_USER}>`,
                  to: email,
                  subject: 'Tu aporte de compositor ha sido recibido y está en revisión',
                  html: `
                    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #ffffff; background-color: #1a202c; padding: 20px;">
                      <div style="max-width: 600px; margin: 0 auto; background-color: #2d3748; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);">
                        <h2 style="color: #9f7aea; text-align: center;">Hola ${first_name},</h2>
                        <p style="color: #e2e8f0;">Hemos recibido tu aporte para el compositor <strong>${first_name} ${last_name}</strong>.</p>
                        <p style="color: #e2e8f0;">Tu contribución ha sido marcada como <strong>PENDIENTE DE REVISIÓN</strong> por nuestro equipo editorial.</p>
                        <p style="color: #e2e8f0;">Te notificaremos una vez que haya sido revisada y publicada (o si requiere modificaciones).</p>
                        <p style="color: #e2e8f0;">¡Gracias por tu valiosa contribución a HMPY!</p>
                        <p style="color: #cbd5e0; font-size: 0.9em; text-align: center; margin-top: 20px;">Atentamente, El Equipo de HMPY</p>
                      </div>
                    </div>
                  `,
              };

              try {
                  await transporter.sendMail(mailOptions);
                  console.log(`Correo de notificación de contribución enviado a ${email}.`);
              } catch (emailError) {
                  console.error(`Error al enviar correo de notificación a ${email}:`, emailError);
              }
          }

          res.status(201).json(newComposer);
      } catch (error) {
          console.error('Error al añadir compositor:', error);
          res.status(500).json({ error: 'Error al añadir compositor', details: error.message });
      }
  });

  // Re-enviar contribución de compositor (Requiere usuario/alumno)
  router.put('/resubmit/:id', requireUser, async (req, res) => {
      try {
          const { id } = req.params;
          const parsedId = parseInt(id);
          if (isNaN(parsedId)) {
              return res.status(400).json({ error: 'ID de compositor inválido.' });
          }
          const { first_name, last_name, birth_year, bio, notable_works, period, photo_url, youtube_link, references } = req.body;
          const userId = req.user.userId;

          // Verificar que el compositor existe y pertenece al usuario
          const existingComposer = await prisma.composer.findFirst({
              where: {
                  id: parsedId,
                  email: req.user.email,
                  is_student_contribution: true,
                  status: {
                      in: ['REJECTED', 'PENDING_REVIEW'] // Solo se puede reenviar si fue rechazado o está pendiente (para admins que lo editan)
                  }
              },
          });

          if (!existingComposer) {
              return res.status(404).json({ error: 'Contribución de compositor no encontrada o no tienes permisos para editarla.' });
          }

          const updatedComposer = await prisma.composer.update({
              where: { id: parsedId },
              data: {
                  first_name,
                  last_name,
                  birth_year: parseInt(birth_year),
                  bio,
                  notable_works,
                  period,
                  photo_url,
                  youtube_link,
                  references,
                  status: 'PENDING_REVIEW', // Al reenviar, vuelve a pendiente de revisión
                  rejection_reason: null, // Limpiar razón de rechazo
              },
          });
          res.json(updatedComposer);
      } catch (error) {
          console.error('Error al reenviar contribución:', error);
          res.status(500).json({ error: 'Error al reenviar contribución', details: error.message });
      }
  });


  // --- Endpoints para Comentarios (públicos y autenticados) ---

  // Obtener comentarios de un compositor (Público)
  router.get('/comments/:composerId', async (req, res) => {
      try {
          const { composerId } = req.params;
          const parsedComposerId = parseInt(composerId);
          if (isNaN(parsedComposerId)) {
              return res.status(400).json({ error: 'ID de compositor inválido.' });
          }
          const comments = await prisma.comment.findMany({
              where: { composerId: parsedComposerId },
              orderBy: { created_at: 'desc' },
          });
          res.json(comments);
      } catch (error) {
          console.error('Error al obtener comentarios:', error);
          res.status(500).json({ error: 'Error al obtener comentarios', details: error.message });
      }
  });

  // Añadir comentario a un compositor (Requiere usuario/alumno/docente)
  router.post('/comments/:composerId', async (req, res) => {
      try {
          const { composerId } = req.params;
          const parsedComposerId = parseInt(composerId);
          if (isNaN(parsedComposerId)) {
              return res.status(400).json({ error: 'ID de compositor inválido.' });
          }
          const { text, name } = req.body; // Extraer 'name'
          const ip_address = req.ip; // Obtener IP

          if (!text || !name) { // 'name' también es requerido
              return res.status(400).json({ error: 'El texto y el nombre del comentario son requeridos.' });
          }

          const newComment = await prisma.comment.create({
              data: {
                  text,
                  name, // Guardar el nombre
                  ip_address, // Guardar la IP
                  composerId: parsedComposerId,
              },
          });
          res.status(201).json(newComment);
      } catch (error) {
          console.error('Error al añadir comentario:', error);
          res.status(500).json({ error: 'Error al añadir comentario', details: error.message });
      }
  });


  // --- Endpoints para Sugerencias de Edición (autenticados) ---

  // Añadir sugerencia de edición
  router.post('/:composerId/suggestions', requireUser, async (req, res) => {
      try {
          const { composerId } = req.params;
          const parsedComposerId = parseInt(composerId);
          if (isNaN(parsedComposerId)) {
              return res.status(400).json({ error: 'ID de compositor inválido.' });
          }

          // Extraer todos los campos del body, incluyendo los del compositor y la razón/email
          const { reason, suggester_email, is_student_contribution, student_first_name, student_last_name, email, ...composerFields } = req.body;
          const suggester_ip = req.ip; // Obtener la IP del sugerente

          if (!reason || !suggester_email) {
              return res.status(400).json({ error: 'El motivo de la sugerencia y el email del sugerente son requeridos.' });
          }

          const newSuggestion = await prisma.editSuggestion.create({
              data: {
                  composerId: parsedComposerId,
                  ...composerFields, // Incluir todos los campos del compositor directamente
                  reason,
                  suggester_email,
                  suggester_ip, // Guardar la IP
                  status: 'PENDING_REVIEW',
                  is_student_contribution,
                  student_first_name,
                  student_last_name,
              },
          });

          // Enviar correo electrónico al sugerente
          if (suggester_email) {
              const mailOptions = {
                  from: `"HMPY (Historia de la Música PY - Academia)" <${process.env.EMAIL_USER}>`,
                  to: suggester_email,
                  subject: 'Tu sugerencia de edición ha sido recibida y está en revisión',
                  html: `
                    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #ffffff; background-color: #1a202c; padding: 20px;">
                      <div style="max-width: 600px; margin: 0 auto; background-color: #2d3748; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);">
                        <h2 style="color: #9f7aea; text-align: center;">Hola ${student_first_name || 'Aportante'},</h2>
                        <p style="color: #e2e8f0;">Hemos recibido tu sugerencia de edición para el compositor <strong>${composerFields.first_name || '[Compositor Desconocido]'} ${composerFields.last_name || ''}</strong>.</p>
                        <p style="color: #e2e8f0;">Tu sugerencia ha sido marcada como <strong>PENDIENTE DE REVISIÓN</strong> por nuestro equipo editorial.</p>
                        <p style="color: #e2e8f0;">Te notificaremos una vez que haya sido revisada.</p>
                        <p style="color: #e2e8f0;">¡Gracias por tu valiosa contribución a HMPY!</p>
                        <p style="color: #cbd5e0; font-size: 0.9em; text-align: center; margin-top: 20px;">Atentamente, El Equipo de HMPY</p>
                      </div>
                    </div>
                  `,
              };

              try {
                  await transporter.sendMail(mailOptions);
                  console.log(`Correo de notificación de sugerencia enviado a ${suggester_email}.`);
              } catch (emailError) {
                  console.error(`Error al enviar correo de notificación de sugerencia a ${suggester_email}:`, emailError);
              }
          }
          res.status(201).json(newSuggestion);
      } catch (error) {
          console.error('Error al añadir sugerencia de edición:', error);
          res.status(500).json({ error: 'Error al añadir sugerencia de edición', details: error.message });
      }
  });

  // Obtener sugerencias de edición para un compositor (Público)
  router.get('/:composerId/suggestions', async (req, res) => {
      try {
          const { composerId } = req.params;
          const parsedComposerId = parseInt(composerId);
          if (isNaN(parsedComposerId)) {
              return res.status(400).json({ error: 'ID de compositor inválido.' });
          }

          const suggestions = await prisma.editSuggestion.findMany({
              where: { composerId: parsedComposerId },
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
          res.json(suggestions);
      } catch (error) {
          console.error('Error al obtener sugerencias de edición:', error);
          res.status(500).json({ error: 'Error al obtener sugerencias de edición', details: error.message });
      }
  });


  // --- Endpoints para Calificaciones (autenticados) ---

  // Calificar un compositor (Requiere usuario/alumno/docente)
  router.post('/ratings', requireUser, async (req, res) => {
      try {
          const { composerId, rating_value } = req.body;
          const parsedComposerId = parseInt(composerId);
          if (isNaN(parsedComposerId)) {
              return res.status(400).json({ error: 'ID de compositor inválido.' });
          }
          const { userId, role, alumnoId, docenteId } = req.user;

          if (!composerId || !rating_value || rating_value < 1 || rating_value > 5) {
              return res.status(400).json({ error: 'ComposerId y rating_value (1-5) son requeridos.' });
          }

          const existingRating = await prisma.rating.findFirst({
              where: {
                  composerId: parsedComposerId,
                  authorId: userId,
              },
          });

          let rating;
          if (existingRating) {
              rating = await prisma.rating.update({
                  where: { id: existingRating.id },
                  data: { rating_value: parseInt(rating_value) },
              });
          } else {
              rating = await prisma.rating.create({
                  data: {
                      composerId: parsedComposerId,
                      rating_value: parseInt(rating_value),
                      authorId: userId,
                      ...(alumnoId && { autorAlumnoId: alumnoId }),
                      ...(docenteId && { autorDocenteId: docenteId }),
                  },
              });
          }
          res.status(201).json(rating);
      } catch (error) {
          console.error('Error al calificar compositor:', error);
          res.status(500).json({ error: 'Error al calificar compositor', details: error.message });
      }
  });


  // --- Endpoints de Admin para Composers y Sugerencias ---

  // Actualizar el estado de un compositor (Solo Admin)
  router.put('/:id/status', requireAdmin, async (req, res) => {
      try {
          const { id } = req.params;
          const parsedId = parseInt(id);
          if (isNaN(parsedId)) {
              return res.status(400).json({ error: 'ID de compositor inválido.' });
          }
          const { status, rejection_reason, suggestion_reason, is_featured } = req.body;

          const data = { status };
          if (rejection_reason !== undefined) data.rejection_reason = rejection_reason;
          if (suggestion_reason !== undefined) data.suggestion_reason = suggestion_reason;
          if (is_featured !== undefined) {
              // Si se marca como destacado, desmarcar otros destacados
              if (is_featured) {
                  await prisma.composer.updateMany({
                      where: { is_featured: true },
                      data: { is_featured: false },
                  });
              }
              data.is_featured = is_featured;
          }

          const updatedComposer = await prisma.composer.update({
              where: { id: parsedId },
              data,
          });

          // Si se aprueba un compositor de alumno, otorgar puntos
          if (updatedComposer.status === 'PUBLISHED' && updatedComposer.is_student_contribution && updatedComposer.email) {
              const alumno = await prisma.alumno.findUnique({
                  where: { email: updatedComposer.email },
                  select: { id: true, catedras: { select: { catedraId: true } } }
              });

              if (alumno) {
                  const points = calculatePointsFromComposer(updatedComposer);
                  await prisma.puntuacion.create({
                      data: {
                          alumnoId: alumno.id,
                          catedraId: alumno.catedras[0]?.catedraId || null, // Asignar a la primera cátedra del alumno o null
                          puntos: points,
                          motivo: `Contribución de compositor aprobada: ${updatedComposer.first_name} ${updatedComposer.last_name}`,
                          tipo: 'CONTRIBUCION',
                      },
                  });
              }
          }

          // Enviar correo electrónico al aportante cuando el compositor es aprobado
          if (updatedComposer.status === 'PUBLISHED' && updatedComposer.email) {
              const mailOptions = {
                  from: `"HMPY (Historia de la Música PY - Academia)" <${process.env.EMAIL_USER}>`,
                  to: updatedComposer.email,
                  subject: '¡Tu aporte de compositor ha sido aprobado y publicado!',
                  html: `
                    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #ffffff; background-color: #1a202c; padding: 20px;">
                      <div style="max-width: 600px; margin: 0 auto; background-color: #2d3748; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);">
                        <h2 style="color: #9f7aea; text-align: center;">¡Felicidades, ${updatedComposer.first_name}!</h2>
                        <p style="color: #e2e8f0;">Tu aporte para el compositor <strong>${updatedComposer.first_name} ${updatedComposer.last_name}</strong> ha sido <strong>aprobado y publicado</strong> en nuestra línea de tiempo.</p>
                        <p style="color: #e2e8f0;">Puedes verlo en:</p>
                        <p style="text-align: center; margin-top: 20px;"><a href="${process.env.FRONTEND_URL}/timeline/${updatedComposer.id}" style="display: inline-block; padding: 10px 20px; background-color: #6366f1; color: #ffffff; text-decoration: none; border-radius: 5px;">Ver Compositor Actualizado</a></p>
                        <p style="color: #e2e8f0; margin-top: 20px;">¡Gracias por tu valiosa contribución a HMPY!</p>
                        <p style="color: #cbd5e0; font-size: 0.9em; text-align: center; margin-top: 20px;">Atentamente, El Equipo de HMPY</p>
                      </div>
                    </div>
                  `,
              };

              try {
                  await transporter.sendMail(mailOptions);
                  console.log(`Correo de aprobación de compositor enviado a ${updatedComposer.email}.`);
              } catch (emailError) {
                  console.error(`Error al enviar correo de aprobación de compositor a ${updatedComposer.email}:`, emailError);
              }
          }

          res.json(updatedComposer);
      } catch (error) {
          console.error('Error al actualizar estado del compositor:', error);
          res.status(500).json({ error: 'Error al actualizar estado del compositor', details: error.message });
      }
  });

  // Actualizar datos de un compositor (Solo Admin)
  router.put('/:id', requireAdmin, async (req, res) => {
      try {
          const { id } = req.params;
          const parsedId = parseInt(id);
          if (isNaN(parsedId)) {
              return res.status(400).json({ error: 'ID de compositor inválido.' });
          }
          const { first_name, last_name, birth_year, bio, notable_works, period, photo_url, youtube_link, references, status, rejection_reason, suggestion_reason, is_featured } = req.body;

          const updatedComposer = await prisma.composer.update({
              where: { id: parsedId },
              data: {
                  first_name,
                  last_name,
                  birth_year: parseInt(birth_year),
                  bio,
                  notable_works,
                  period,
                  photo_url,
                  youtube_link,
                  references,
                  status,
                  rejection_reason,
                  suggestion_reason,
                  is_featured,
              },
          });
          res.json(updatedComposer);
      } catch (error) {
          console.error('Error al actualizar compositor:', error);
          res.status(500).json({ error: 'Error al actualizar compositor', details: error.message });
      }
  });

  // Añadir compositor como Admin (Solo Admin) - similar a POST /composers pero status PUBLISHED por defecto
  router.post('/admin-create', requireAdmin, async (req, res) => {
      try {
          const { first_name, last_name, birth_year, bio, notable_works, period, photo_url, youtube_link, references } = req.body;
          const newComposer = await prisma.composer.create({
              data: {
                  first_name,
                  last_name,
                  birth_year: parseInt(birth_year),
                  bio,
                  notable_works,
                  period,
                  email: req.user.email, // Admin es el creador
                  photo_url,
                  youtube_link,
                  references,
                  status: 'PUBLISHED',
                  is_student_contribution: false,
              },
          });
          res.status(201).json(newComposer);
      } catch (error) {
          console.error('Error al añadir compositor como admin:', error);
          res.status(500).json({ error: 'Error al añadir compositor como admin', details: error.message });
      }
  });

  // Revisar compositor (Solo Admin - para añadir razón de sugerencia o rechazo)
  router.post('/:id/review', requireAdmin, async (req, res) => {
      try {
          const { id } = req.params;
          const parsedId = parseInt(id);
          if (isNaN(parsedId)) {
              return res.status(400).json({ error: 'ID de compositor inválido.' });
          }
          const { reason, status } = req.body; // status puede ser 'REJECTED' o 'PENDING_REVIEW'

          if (!reason || !status) {
              return res.status(400).json({ error: 'Se requiere una razón y un estado para la revisión.' });
          }

          const updatedComposer = await prisma.composer.update({
              where: { id: parsedId },
              data: {
                  suggestion_reason: status === 'PENDING_REVIEW' ? reason : null,
                  rejection_reason: status === 'REJECTED' ? reason : null,
                  status: status,
              },
          });
          res.json(updatedComposer);
      } catch (error) {
          console.error('Error al revisar compositor:', error);
          res.status(500).json({ error: 'Error al revisar compositor', details: error.message });
      }
  });


  // Obtener sugerencias pendientes de revisión (Solo Admin)
  router.get('/admin/suggestions', requireAdmin, async (req, res) => {
      try {
          const pendingSuggestions = await prisma.editSuggestion.findMany({
              where: { status: 'PENDING_REVIEW' },
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
          res.json(pendingSuggestions);
      } catch (error) {
          console.error('Error al obtener sugerencias pendientes:', error);
          res.status(500).json({ error: 'Error al obtener sugerencias pendientes', details: error.message });
      }
  });

  // Aprobar sugerencia de edición (Solo Admin)
  router.post('/admin/suggestions/:id/approve', requireAdmin, async (req, res) => {
      try {
          const { id } = req.params;
          const parsedId = parseInt(id);
          if (isNaN(parsedId)) {
              return res.status(400).json({ error: 'ID de sugerencia inválido.' });
          }

          const suggestion = await prisma.editSuggestion.findUnique({
              where: { id: parsedId },
              include: { composer: true },
          });

          if (!suggestion) {
              return res.status(404).json({ error: 'Sugerencia no encontrada.' });
          }

          // Obtener el compositor original
          const originalComposer = await prisma.composer.findUnique({
              where: { id: suggestion.composerId },
          });

          if (!originalComposer) {
              return res.status(404).json({ error: 'Compositor original no encontrado.' });
          }

          // Construir los datos para la actualización del compositor principal
          const composerUpdateData = {};
          // Itera sobre los campos en la sugerencia que no son de metadatos
          for (const key in suggestion) {
              // Asegúrate de que el campo exista en el modelo Composer y que tenga un valor en la sugerencia
              if (originalComposer.hasOwnProperty(key) && suggestion[key] !== null && key !== 'id' && key !== 'composerId' && key !== 'reason' && key !== 'status' && key !== 'points' && key !== 'suggester_email' && key !== 'suggester_ip' && key !== 'created_at' && key !== 'updated_at' && key !== 'is_student_contribution' && key !== 'student_first_name' && key !== 'student_last_name') {
                  composerUpdateData[key] = suggestion[key];
              }
          }

          // Aplicar la sugerencia al compositor
          const updatedComposer = await prisma.composer.update({
              where: { id: suggestion.composerId },
              data: composerUpdateData,
          });

          // Actualizar el estado de la sugerencia a 'APPLIED'
          const updatedSuggestion = await prisma.editSuggestion.update({
              where: { id: parsedId },
              data: { status: 'APPLIED' }, // Cambiar a APPLIED
          });

          // Otorgar puntos al alumno que hizo la sugerencia
          if (suggestion.is_student_contribution && suggestion.suggester_email) { // Usar is_student_contribution del suggestion
              const alumno = await prisma.alumno.findUnique({
                  where: { email: suggestion.suggester_email },
                  select: { id: true, catedras: { select: { catedraId: true } } }
              });

              if (alumno) {
                  const points = calculatePointsFromComposer(updatedComposer);
                  await prisma.puntuacion.create({
                      data: {
                          alumnoId: alumno.id,
                          catedraId: alumno.catedras[0]?.catedraId || null, // Asignar a la primera cátedra del alumno o null
                          puntos: points,
                          motivo: `Sugerencia de edición aprobada para: ${updatedComposer.first_name} ${updatedComposer.last_name}`,
                          tipo: 'APORTE', // Cambiar tipo a APORTE
                      },
                  });
              }
          }

          // Enviar correo electrónico al sugerente
          if (suggestion.suggester_email) {
              const mailOptions = {
                  from: `"HMPY (Historia de la Música PY - Academia)" <${process.env.EMAIL_USER}>`,
                  to: suggestion.suggester_email,
                  subject: '¡Tu sugerencia de edición ha sido aprobada y aplicada!',
                  html: `
                    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #ffffff; background-color: #1a202c; padding: 20px;">
                      <div style="max-width: 600px; margin: 0 auto; background-color: #2d3748; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);">
                        <h2 style="color: #9f7aea; text-align: center;">¡Felicidades, ${suggestion.student_first_name || 'Aportante'}!</h2>
                        <p style="color: #e2e8f0;">Tu sugerencia de edición para el compositor <strong>${originalComposer.first_name} ${originalComposer.last_name}</strong> ha sido <strong>aprobada y aplicada</strong>.</p>
                        <p style="color: #e2e8f0;">Los cambios ya son visibles en la línea de tiempo.</p>
                        <p style="text-align: center; margin-top: 20px;"><a href="${process.env.FRONTEND_URL}/timeline/${originalComposer.id}" style="display: inline-block; padding: 10px 20px; background-color: #6366f1; color: #ffffff; text-decoration: none; border-radius: 5px;">Ver Compositor Actualizado</a></p>
                        <p style="color: #e2e8f0; margin-top: 20px;">¡Gracias por tu valiosa contribución a HMPY!</p>
                        <p style="color: #cbd5e0; font-size: 0.9em; text-align: center; margin-top: 20px;">Atentamente, El Equipo de HMPY</p>
                      </div>
                    </div>
                  `,
              };

              try {
                  await transporter.sendMail(mailOptions);
                  console.log(`Correo de aprobación de sugerencia enviado a ${suggestion.suggester_email}.`);
              } catch (emailError) {
                  console.error(`Error al enviar correo de aprobación de sugerencia a ${suggestion.suggester_email}:`, emailError);
              }
          }

          res.json({ updatedComposer, updatedSuggestion });
      } catch (error) {
          console.error('Error al aprobar sugerencia:', error);
          res.status(500).json({ error: 'Error al aprobar sugerencia', details: error.message });
      }
  });

  // Rechazar sugerencia de edición (Solo Admin)
  router.post('/admin/suggestions/:id/reject', requireAdmin, async (req, res) => {
      try {
          const { id } = req.params;
          const parsedId = parseInt(id);
          if (isNaN(parsedId)) {
              return res.status(400).json({ error: 'ID de sugerencia inválido.' });
          }
          const { reason } = req.body;

          if (!reason) {
              return res.status(400).json({ error: 'Se requiere una razón para rechazar la sugerencia.' });
          }

          const suggestion = await prisma.editSuggestion.findUnique({
              where: { id: parsedId },
              include: { composer: true }, // Incluir el compositor para los datos en el correo
          });

          if (!suggestion) {
              return res.status(404).json({ error: 'Sugerencia no encontrada.' });
          }

          const updatedSuggestion = await prisma.editSuggestion.update({
              where: { id: parsedId },
              data: { status: 'REJECTED', rejection_reason: reason },
          });

          // Enviar correo electrónico al sugerente notificando el rechazo
          if (suggestion.suggester_email) {
              const mailOptions = {
                  from: `"HMPY (Historia de la Música PY - Academia)" <${process.env.EMAIL_USER}>`,
                  to: suggestion.suggester_email,
                  subject: 'Tu sugerencia de edición ha sido rechazada',
                  html: `
                    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #ffffff; background-color: #1a202c; padding: 20px;">
                      <div style="max-width: 600px; margin: 0 auto; background-color: #2d3748; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);">
                        <h2 style="color: #9f7aea; text-align: center;">Hola ${suggestion.student_first_name || 'Aportante'},</h2>
                        <p style="color: #e2e8f0;">Lamentamos informarte que tu sugerencia de edición para el compositor <strong>${suggestion.composer.first_name || '[Compositor Desconocido]'} ${suggestion.composer.last_name || ''}</strong> ha sido <strong>rechazada</strong>.</p>
                        <p style="color: #e2e8f0;">Motivo del rechazo: <em>${reason}</em></p>
                        <p style="color: #e2e8f0;">Agradecemos tu interés y esperamos tus futuras contribuciones.</p>
                        <p style="color: #cbd5e0; font-size: 0.9em; text-align: center; margin-top: 20px;">Atentamente, El Equipo de HMPY</p>
                      </div>
                    </div>
                  `,
              };

              try {
                  await transporter.sendMail(mailOptions);
                  console.log(`Correo de rechazo de sugerencia enviado a ${suggestion.suggester_email}.`);
              } catch (emailError) {
                  console.error(`Error al enviar correo de rechazo de sugerencia a ${suggestion.suggester_email}:`, emailError);
              }
          }

          res.json(updatedSuggestion);
      } catch (error) {
          console.error('Error al rechazar sugerencia:', error);
          res.status(500).json({ error: 'Error al rechazar sugerencia', details: error.message });
      }
  });

  // Obtener un compositor por ID (Público)
  router.get('/:id', async (req, res) => {
      try {
          const { id } = req.params;
          const parsedId = parseInt(id);
          if (isNaN(parsedId)) {
              return res.status(400).json({ error: 'ID de compositor inválido.' });
          }
          const composer = await prisma.composer.findUnique({
              where: { id: parseInt(id) },
              include: {
                  comments: true,
                  editSuggestions: true,
                  // ratings: true // Incluir ratings si es necesario
              },
          });

          if (!composer) {
              return res.status(404).json({ error: 'Compositor no encontrado' });
          }

          // Si no es admin, solo permitir ver si está PUBLISHED o si es la propia contribución del alumno
          if (req.user && req.user.role !== 'ADMIN') {
              const isStudentContribution = composer.is_student_contribution && composer.email === req.user.email;
              if (composer.status !== 'PUBLISHED' && !isStudentContribution) {
                  return res.status(403).json({ error: 'Acceso denegado: Compositor no publicado o no es tu contribución.' });
              }
          }


          res.json(composer);
      } catch (error) {
          console.error('Error al obtener compositor:', error);
          res.status(500).json({ error: 'Error al obtener compositor', details: error.message });
      }
  });

  return router;
};