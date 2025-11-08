const express = require('express');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const requireUser = require('../middlewares/requireUser').requireUser;
const requireAdmin = require('../middlewares/requireAdmin');
const requireDocenteOrAdmin = require('../middlewares/requireDocenteOrAdmin');

module.exports = (prisma, transporter) => {
    console.log('[ComposerRoutes] Inicializando ComposerRouter...');
    const router = express.Router();
    router.use((req, res, next) => {
        console.log(`[ComposerRouter] Recibida solicitud: ${req.method} ${req.originalUrl}`);
        next();
    });

    // --- Endpoints de Admin para Sugerencias (movidas al principio para prioridad de enrutamiento) ---

    // Obtener todas las sugerencias pendientes (solo Admin)
    router.get('/admin/suggestions', requireAdmin, async (req, res) => {
        try {
            const suggestions = await prisma.EditSuggestion.findMany({
                where: { status: 'PENDING_REVIEW' },
                include: { Composer: true },
                orderBy: { created_at: 'desc' },
            });
            res.json(suggestions);
        } catch (error) {
            console.error('Error al obtener sugerencias pendientes:', error);
            res.status(500).json({ error: 'Error al obtener sugerencias pendientes' });
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

            const suggestion = await prisma.EditSuggestion.findUnique({
                where: { id: parsedId },
                include: { Composer: true },
            });

            if (!suggestion) {
                return res.status(404).json({ error: 'Sugerencia no encontrada.' });
            }

            // Obtener el compositor original
            const originalComposer = await prisma.Composer.findUnique({
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
            const updatedComposer = await prisma.Composer.update({
                where: { id: suggestion.composerId },
                data: composerUpdateData,
            });

            // Actualizar el estado de la sugerencia a 'APPLIED'
            const updatedSuggestion = await prisma.EditSuggestion.update({
                where: { id: parsedId },
                data: { status: 'APPLIED' }, // Cambiar a APPLIED
            });

            // Otorgar puntos al alumno que hizo la sugerencia
            if (suggestion.is_student_contribution && suggestion.suggester_email) { // Usar is_student_contribution del suggestion
                const alumno = await prisma.Alumno.findUnique({
                    where: { email: suggestion.suggester_email },
                    select: { id: true, CatedraAlumno: { select: { catedraId: true } } }
                });

                if (alumno) {
                    const points = calculatePointsFromComposer(updatedComposer);
                    await prisma.Puntuacion.create({
                        data: {
                            alumnoId: alumno.id,
                            catedraId: alumno.CatedraAlumno[0]?.catedraId || null, // Asignar a la primera cátedra del alumno o null
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

            const suggestion = await prisma.EditSuggestion.findUnique({
                where: { id: parsedId },
                include: { Composer: true }, // Incluir el compositor para los datos en el correo
            });

            if (!suggestion) {
                return res.status(404).json({ error: 'Sugerencia no encontrada.' });
            }

            const updatedSuggestion = await prisma.EditSuggestion.update({
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
                        <h2 style="color: #9f7aea; text-align: center;">Hola ${suggestion.student_first_name || 'Aportante'}!</h2>
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
            const { search, period, status, page = 1, limit = 100 } = req.query;
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

            const composers = await prisma.Composer.findMany({
                where,
                orderBy: { birth_year: 'asc' },
                skip,
                take: parseInt(limit),
                include: {
                    Rating: {
                        select: {
                            rating_value: true,
                        },
                    },
                },
            });
            console.log('[Backend] Compositores recuperados de la DB (antes de procesar): ', composers);

            const composersWithRatings = composers.map(composer => {
                const totalRatings = composer.ratings ? composer.ratings.length : 0;
                const sumRatings = (composer.ratings || []).reduce((sum, r) => sum + r.rating_value, 0);
                const rating_avg = totalRatings > 0 ? parseFloat((sumRatings / totalRatings).toFixed(1)) : 0.0;

                return {
                    ...composer,
                    rating_avg,
                    rating_count: totalRatings,
                    ratings: undefined, // Eliminar la array de ratings crudos para no enviarlos al frontend
                };
            });

            const totalComposers = await prisma.Composer.count({ where });

            console.log(`[Backend] Total de compositores encontrados: ${totalComposers}`);
            console.log(`[Backend] Enviando ${composersWithRatings.length} compositores al frontend.`);
            console.log('[Backend] Datos finales de la respuesta:', { data: composersWithRatings, total: totalComposers, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(totalComposers / parseInt(limit)) });

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
    router.get('/featured', async (req, res) => {});

    // Obtener un compositor aleatorio (Público)
    router.get('/random', async (req, res) => {
        try {
            const count = await prisma.Composer.count({ where: { status: 'PUBLISHED' } });
            if (count === 0) {
                return res.status(404).json({ error: 'No hay compositores publicados para seleccionar.' });
            }
            const skip = Math.floor(Math.random() * count);
            const [randomComposer] = await prisma.Composer.findMany({
                where: { status: 'PUBLISHED' },
                take: 1,
                skip: skip,
                include: {
                    Rating: {
                        select: {
                            rating_value: true,
                        },
                    },
                },
            });

            if (!randomComposer) {
                return res.status(404).json({ error: 'No se pudo obtener un compositor aleatorio.' });
            }

            const totalRatings = randomComposer.ratings.length;
            const sumRatings = randomComposer.ratings.reduce((sum, r) => sum + r.rating_value, 0);
            const rating_avg = totalRatings > 0 ? parseFloat((sumRatings / totalRatings).toFixed(1)) : 0.0;

            res.json({
                ...randomComposer,
                rating_avg,
                rating_count: totalRatings,
                ratings: undefined, // Eliminar la array de ratings crudos
            });

        } catch (error) {
            console.error('Error al obtener compositor aleatorio:', error);
            res.status(500).json({ error: 'Error al obtener compositor aleatorio', details: error.message });
        }
    });

    // Obtener compositor destacado (Público)
    router.get('/featured', async (req, res) => {
        try {
            const featured = await prisma.Composer.findFirst({
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
        console.log('[ComposerRoutes] Ruta GET /pending (compositores pendientes) activada.');
        try {
            const pendingComposers = await prisma.Composer.findMany({
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
    router.post('/', authenticateJWT, async (req, res) => {
        try {
            const { email: userEmail, role } = req.user || {}; // req.user puede ser undefined

            // Desestructurar todos los campos del formulario
            const {
                is_student_contribution,
                student_first_name,
                student_last_name,
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
                mainRole,
                photo_url,
                youtube_link,
                references,
                email,
            } = req.body;

            // Validaciones obligatorias
            if (!first_name?.trim() || !last_name?.trim()) {
                return res.status(400).json({ error: 'Nombres y apellidos del compositor son obligatorios.' });
            }

            if (!birth_year) {
                return res.status(400).json({ error: 'El año de nacimiento es obligatorio.' });
            }

            if (!bio?.trim() || !notable_works?.trim()) {
                return res.status(400).json({ error: 'Biografía y obras notables son obligatorias.' });
            }

            if (!mainRole || mainRole.length === 0) {
                return res.status(400).json({ error: 'Debe seleccionar al menos un rol principal.' });
            }

            if (!email?.trim()) {
                return res.status(400).json({ error: 'Email es obligatorio.' });
            }

            // Validar si es contribución de alumno
            if (is_student_contribution && (!student_first_name?.trim() || !student_last_name?.trim())) {
                return res.status(400).json({ error: 'Como alumno, debes proporcionar tu nombre y apellido.' });
            }

            // Determinar estado: ADMIN -> PUBLISHED, otros -> PENDING_REVIEW
            const calculatedStatus = (role && role.toLowerCase() === 'admin') ? 'PUBLISHED' : 'PENDING_REVIEW';

            console.log('[Composer POST /] Creando compositor:', {
                first_name,
                last_name,
                is_student_contribution,
                student_first_name,
                student_last_name,
                status: calculatedStatus,
            });

            // Crear el compositor
            const newComposer = await prisma.composer.create({
                data: {
                    first_name: first_name.trim(),
                    last_name: last_name.trim(),
                    birth_year: parseInt(birth_year, 10),
                    birth_month: birth_month ? parseInt(birth_month, 10) : null,
                    birth_day: birth_day ? parseInt(birth_day, 10) : null,
                    death_year: death_year ? parseInt(death_year, 10) : null,
                    death_month: death_month ? parseInt(death_month, 10) : null,
                    death_day: death_day ? parseInt(death_day, 10) : null,
                    bio: bio.trim(),
                    notable_works: notable_works.trim(),
                    period,
                    mainRole, // Array de roles
                    email: email.trim(),
                    photo_url: photo_url?.trim() || null,
                    youtube_link: youtube_link?.trim() || null,
                    references: references?.trim() || null,
                    is_student_contribution: is_student_contribution || false,
                    student_first_name: is_student_contribution ? student_first_name?.trim() : null,
                    student_last_name: is_student_contribution ? student_last_name?.trim() : null,
                    status: calculatedStatus,
                    created_at: new Date(),
                },
            });

            console.log('[Composer POST /] Compositor creado:', newComposer.id);

            // Enviar correo electrónico al aportante
            if (email) {
                const contributorName = is_student_contribution
                    ? `${student_first_name} ${student_last_name}`
                    : first_name;

                const mailOptions = {
                    from: `"HMPY (Historia de la Música PY - Academia)" <${process.env.EMAIL_USER}>`,
                    to: email,
                    subject: 'Tu aporte de compositor ha sido recibido y está en revisión',
                    html: `
                    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #ffffff; background-color: #1a202c; padding: 20px;">
                      <div style="max-width: 600px; margin: 0 auto; background-color: #2d3748; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.5); border-left: 4px solid #9f7aea;">
                        <h2 style="color: #9f7aea; text-align: center; margin-top: 0;">¡Gracias por tu contribución!</h2>
                        <p style="color: #e2e8f0;">Hola ${contributorName},</p>
                        <p style="color: #e2e8f0;">Hemos recibido tu aporte para el compositor <strong>${first_name} ${last_name}</strong>.</p>
                        
                        <div style="background-color: #1a202c; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <p style="color: #cbd5e0; margin: 0;"><strong style="color: #81C784;">✓ Estado:</strong> PENDIENTE DE REVISIÓN</p>
                        </div>
                        
                        <p style="color: #e2e8f0;">Tu contribución ha sido recibida y nuestro equipo editorial la revisará en breve.</p>
                        <p style="color: #e2e8f0;">Te notificaremos una vez que haya sido:</p>
                        <ul style="color: #e2e8f0;">
                            <li>✓ Publicada en la línea de tiempo colaborativa</li>
                            <li>✓ Rechazada (si requiere ajustes)</li>
                        </ul>
                        
                        <p style="color: #e2e8f0;">En tu panel de contribuciones podrás ver el estado de todos tus aportes.</p>
                        
                        <p style="color: #cbd5e0; font-size: 0.9em; margin-top: 30px;">¡Gracias por enriquecer el patrimonio musical paraguayo!</p>
                        <p style="color: #a0aec0; font-size: 0.85em; text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #4a5568;">
                            Atentamente, El Equipo de HMPY<br>
                            Historia de la Música Paraguaya - Academia Colaborativa
                        </p>
                      </div>
                    </div>
                `,
                };

                try {
                    await transporter.sendMail(mailOptions);
                    console.log(`[Composer POST /] Correo enviado a ${email}`);
                } catch (emailError) {
                    console.error(`[Composer POST /] Error al enviar correo a ${email}:`, emailError);
                    // No fallar la respuesta si hay error en email
                }
            }

            res.status(201).json(newComposer);
        } catch (error) {
            console.error('[Composer POST /] Error al crear compositor:', error);
            res.status(500).json({
                error: 'Error al crear el compositor',
                details: error.message
            });
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

            const updatedComposer = await prisma.Composer.update({
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

            const newComment = await prisma.Comment.create({
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
    
    // Añadir sugerencia de edición (permite anónimo; usa email del token si existe)
    // IMPORTANTE: Usar optionalAuthenticateJWT en lugar de authenticateJWT
    router.post('/:composerId/suggestions', optionalAuthenticateJWT, async (req, res) => {
        try {
            console.log('SUGGESTION ENDPOINT HIT - DEBUGGING');
            console.log('Body recibido:', req.body);
            console.log('Params:', req.params);

            const { composerId } = req.params;
            const parsedComposerId = parseInt(composerId);
            if (isNaN(parsedComposerId)) {
                return res.status(400).json({ error: 'ID de compositor inválido.' });
            }

            const {
                reason,
                suggester_email,
                is_student_contribution,
                student_first_name,
                student_last_name,
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
                mainRole,
                youtube_link,
                references,
                photo_url
            } = req.body;

            const suggester_ip = req.ip || req.connection.remoteAddress;
            const effectiveEmail = (suggester_email && String(suggester_email).trim()) || (req.user && req.user.email) || null;

            if (!reason || !effectiveEmail) {
                return res.status(400).json({
                    error: 'El motivo de la sugerencia y el email del sugerente son requeridos.',
                    received: { reason: !!reason, email: !!effectiveEmail }
                });
            }

            console.log(`[POST /:composerId/suggestions] Recibida sugerencia para compositor ID: ${parsedComposerId}`);

            const suggestionData = {
                composerId: parsedComposerId,
                reason,
                suggester_email: effectiveEmail,
                suggester_ip,
                status: 'PENDING_REVIEW',
                is_student_contribution: is_student_contribution || false,
                student_first_name: student_first_name || null,
                student_last_name: student_last_name || null,
                first_name: first_name || null,
                last_name: last_name || null,
                birth_year: birth_year ? parseInt(birth_year, 10) : null,
                birth_month: birth_month ? parseInt(birth_month, 10) : null,
                birth_day: birth_day ? parseInt(birth_day, 10) : null,
                death_year: death_year ? parseInt(death_year, 10) : null,
                death_month: death_month ? parseInt(death_month, 10) : null,
                death_day: death_day ? parseInt(death_day, 10) : null,
                bio: bio || null,
                notable_works: notable_works || null,
                period: period || null,
                mainRole: mainRole || null,
                youtube_link: youtube_link || null,
                references: references || null,
                photo_url: photo_url || null,
                photo_url: photo_url || null,
            };

            console.log('Datos a guardar:', suggestionData);

            const newSuggestion = await prisma.EditSuggestion.create({
                data: suggestionData,
            });

            console.log('Sugerencia creada exitosamente:', newSuggestion.id);

            // Enviar correo electrónico al sugerente
            if (effectiveEmail) {
                const mailOptions = {
                    from: `"HMPY (Historia de la Música PY - Academia)" <${process.env.EMAIL_USER}>`,
                    to: effectiveEmail,
                    subject: 'Tu sugerencia de edición ha sido recibida y está en revisión',
                    html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #ffffff; background-color: #1a202c; padding: 20px;">
                  <div style="max-width: 600px; margin: 0 auto; background-color: #2d3748; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);">
                    <h2 style="color: #9f7aea; text-align: center;">Hola ${student_first_name || 'Aportante'},</h2>
                    <p style="color: #e2e8f0;">Hemos recibido tu sugerencia de edición para el compositor <strong>${first_name || '[Compositor]'} ${last_name || ''}</strong>.</p>
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
                    console.log(`Correo de notificación de sugerencia enviado a ${effectiveEmail}.`);
                } catch (emailError) {
                    console.error(`Error al enviar correo de notificación de sugerencia a ${effectiveEmail}:`, emailError);
                    // No fallar la petición si el email falla
                }
            }

            res.status(201).json(newSuggestion);
        } catch (error) {
            console.error('Error al añadir sugerencia de edición:', error);
            res.status(500).json({
                error: 'Error al añadir sugerencia de edición',
                details: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
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

            const suggestions = await prisma.EditSuggestion.findMany({
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

    // Middleware de autenticación opcional (agregar al inicio del archivo)
    function optionalAuthenticateJWT(req, res, next) {
        const authHeader = req.headers.authorization;

        if (authHeader) {
            const token = authHeader.split(' ')[1];
            jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
                if (!err) {
                    req.user = user;
                }
                // Continuar incluso si el token es inválido
                next();
            });
        } else {
            // No hay token, continuar sin usuario
            next();
        }
    }

    // Obtener sugerencias de edición para un compositor (Público)
    router.get('/:composerId/suggestions', async (req, res) => {
        try {
            const { composerId } = req.params;
            const parsedComposerId = parseInt(composerId);
            if (isNaN(parsedComposerId)) {
                return res.status(400).json({ error: 'ID de compositor inválido.' });
            }

            const suggestions = await prisma.EditSuggestion.findMany({
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
                    await prisma.Composer.updateMany({
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
                const alumno = await prisma.Alumno.findUnique({
                    where: { email: updatedComposer.email },
                    select: { id: true, Catedra: { select: { catedraId: true } } }
                });

                if (alumno) {
                    const points = calculatePointsFromComposer(updatedComposer);
                    await prisma.Puntuacion.create({
                        data: {
                            alumnoId: alumno.id,
                            catedraId: alumno.Catedra[0]?.catedraId || null, // Asignar a la primera cátedra del alumno o null
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

            const updatedComposer = await prisma.Composer.update({
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
            const newComposer = await prisma.Composer.create({
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
            console.log('[Composer POST /admin-create] Created Composer object:', newComposer);
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

            const updatedComposer = await prisma.Composer.update({
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

    // Obtener un compositor por ID (Público)
    router.get('/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const parsedId = parseInt(id);
            if (isNaN(parsedId)) {
                return res.status(400).json({ error: 'ID de compositor inválido.' });
            }
            const composer = await prisma.Composer.findUnique({
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