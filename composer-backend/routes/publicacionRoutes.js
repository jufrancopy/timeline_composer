const express = require('express');
const router = express.Router();
const requireDocenteOrAdmin = require('../middlewares/requireDocenteOrAdmin');
const requireDocente = require('../middlewares/requireDocente');
const { requireUser } = require('../middlewares/requireUser');

module.exports = (prisma, transporter) => {


    // Middleware para verificar si el docente pertenece a la cátedra (para rutas de modificación)
    const checkCatedraDocente = async (req, res, next) => {
        const { catedraId } = req.params;
        const docenteId = req.user.docenteId; // Obtenido del token por requireDocenteOrAdmin

        try {
            const catedra = await prisma.catedra.findUnique({
                where: { id: parseInt(catedraId) },
                select: { docenteId: true }
            });

            if (!catedra || catedra.docenteId !== docenteId) {
                return res.status(403).json({ error: 'Acceso denegado. No eres el docente de esta cátedra.' });
            }
            next();
        } catch (error) {
            console.error('Error in checkCatedraDocente middleware:', error);
            res.status(500).json({ error: 'Error interno del servidor.' });
        }
    };

    // Rutas de Publicaciones (Tablón)
    // Crear una nueva publicación en una cátedra
    router.post('/catedras/:catedraId/publicaciones', requireUser(prisma), async (req, res) => {
        const { catedraId } = req.params;
        const { titulo, contenido, tipo } = req.body;
        const { role, docenteId, alumnoId } = req.user;

        // Verificar permisos de acceso a la cátedra
        try {
            const catedra = await prisma.catedra.findUnique({
                where: { id: parseInt(catedraId) },
                select: { docenteId: true }
            });

            if (!catedra) {
                return res.status(404).json({ error: 'Cátedra no encontrada.' });
            }

            if (role === 'alumno') {
                const alumnoInscrito = await prisma.catedraAlumno.findUnique({
                    where: {
                        catedraId_alumnoId: {
                            alumnoId: alumnoId,
                            catedraId: parseInt(catedraId),
                        },
                    },
                });
                if (!alumnoInscrito) {
                    return res.status(403).json({ error: 'Acceso denegado: El alumno no está inscrito en esta cátedra.' });
                }
            } else if (role === 'docente') {
                if (catedra.docenteId !== docenteId) {
                    return res.status(403).json({ error: 'Acceso denegado: No eres el docente de esta cátedra.' });
                }
            } else if (role !== 'ADMIN') {
                return res.status(403).json({ error: 'Acceso denegado: Rol de usuario no válido para crear publicaciones.' });
            }
        } catch (error) {
            console.error('Error en la verificación de permisos para crear publicación:', error);
            return res.status(500).json({ error: 'Error interno del servidor al verificar permisos.' });
        }

        let autorDocenteId = null;
        let autorAlumnoId = null;

        if (role === 'docente') {
            autorDocenteId = docenteId;
        } else if (role === 'alumno') {
            autorAlumnoId = alumnoId;
        }

        // Si el usuario es un alumno, el tipo solo puede ser ANUNCIO u OTRO. Forzar a ANUNCIO si intenta otra cosa.
        let finalTipo = tipo;
        if (role === 'alumno' && !['ANUNCIO', 'OTRO'].includes(finalTipo)) {
            finalTipo = 'ANUNCIO';
        } else if (!finalTipo) { // Si no se especifica tipo (solo para docentes/admin si es que lo permiten)
            finalTipo = 'ANUNCIO';
        }

        try {
            const publicacion = await prisma.publicacion.create({
                data: {
                    titulo,
                    contenido,
                    catedraId: parseInt(catedraId),
                    autorDocenteId: autorDocenteId,
                    autorAlumnoId: autorAlumnoId,
                    tipo: finalTipo, // Usar el tipo final determinado
                },
            });
            res.status(201).json(publicacion);
        } catch (error) {
            console.error('Error al crear publicación:', error);
            res.status(500).json({ error: 'Error al crear la publicación.' });
        }
    });

    // Obtener todas las publicaciones de una cátedra
    router.get('/catedras/:catedraId/publicaciones', requireUser(prisma), async (req, res) => {
        console.log(`[DEBUG - PublicacionRoutes] GET /catedras/${req.params.catedraId}/publicaciones route reached.`);
        const { catedraId } = req.params;
        const { role, alumnoId, docenteId } = req.user; // Desestructurar role, alumnoId y docenteId de req.user
        console.log(`[DEBUG - PublicacionRoutes] User Role: ${role}, Alumno ID: ${alumnoId}, Docente ID: ${docenteId}, Catedra ID: ${catedraId}`);
        try {
            const publicaciones = await prisma.publicacion.findMany({
                where: {
                    catedraId: parseInt(catedraId),
                    AND: [
                        {
                            OR: [
                                { tipo: { not: 'TAREA' } },
                                ...(role === 'alumno' ? [{
                                    tipo: 'TAREA',
                                    visibleToStudents: true,
                                    TareaMaestra: {
                                        TareaAsignacion: {
                                            some: { alumnoId: alumnoId }
                                        }
                                    }
                                }, {
                                    tipo: 'EVALUACION',
                                    visibleToStudents: true,
                                    EvaluacionAsignacion: {
                                        some: { alumnoId: alumnoId }
                                    }
                                }] : [
                                    { tipo: 'TAREA' },
                                    { tipo: 'EVALUACION' }
                                ])
                            ]
                        }
                    ],
                },
                include: {
                    // Otras inclusiones
                    Evaluacion: { // Asegúrate de usar 'Evaluacion' aquí
                        include: {
                            Catedra: { select: { nombre: true } },
                        },
                    },
                    PublicacionInteraccion: role === 'alumno'
                        ? { where: { alumnoId: parseInt(alumnoId) } }
                        : true,
                    _count: {
                        select: {
                            PublicacionInteraccion: true,
                            ComentarioPublicacion: true  // Por si lo necesitás
                        }
                    },
                    // Otras inclusiones...
                },
                orderBy: {
                    created_at: 'desc',
                },
            });


            let filteredPublicaciones = publicaciones;

            // Mapear las publicaciones para añadir hasUserInteracted y totalInteracciones
            const publicacionesConInteracciones = filteredPublicaciones.map(publicacion => {
                const basePublicacion = {
                    ...publicacion,
                    hasUserInteracted: (publicacion.PublicacionInteraccion?.length || 0) > 0,
                    totalInteracciones: publicacion._count?.PublicacionInteraccion || 0,
                };

                if (role === 'alumno') {
                    if (publicacion.tipo === 'TAREA') {
                        const tareaAsignacion = publicacion.TareaMaestra?.TareaAsignacion?.[0];
                        return {
                            ...basePublicacion,
                            tareaMaestraId: publicacion.TareaMaestra?.id || null,
                            tareaAsignacionEstado: tareaAsignacion?.estado || null,
                            tareaAsignacionId: tareaAsignacion?.id || null,
                            tareaAsignacionSubmissionPath: tareaAsignacion?.submission_path || null,
                            tareaAsignacionSubmissionDate: tareaAsignacion?.submission_date || null,
                            tareaAsignacionPuntosObtenidos: tareaAsignacion?.puntos_obtenidos || null,
                            tareaMaestra: undefined,
                        };
                    } else if (publicacion.tipo === 'EVALUACION') {
                        const evaluacionAsignacion = publicacion.evaluacionAsignacion?.[0];
                        const evaluacionMaestra = publicacion.Evaluacion;
                        return {
                            ...basePublicacion,
                            evaluacionMaestraId: evaluacionMaestra?.id || null,
                            evaluacionMaestraTitulo: evaluacionMaestra?.titulo || null,
                            evaluacionAsignacionEstado: evaluacionAsignacion?.estado || null,
                            evaluacionAsignacionId: evaluacionAsignacion?.id || null,
                            Evaluacion: undefined,
                            evaluacionAsignacion: undefined,
                        };
                    }
                }

                // Para docentes/admins o publicaciones no asignables directamente a alumnos
                return { ...basePublicacion, tareaMaestra: undefined, evaluacionMaestra: undefined, evaluacionAsignacion: undefined };
            });

            res.json(publicacionesConInteracciones);
        } catch (error) {
            console.error(`[DEBUG - PublicacionRoutes] Error in GET /catedras/${req.params.catedraId}/publicaciones:`, error);
            res.status(500).json({ error: 'Error al obtener las publicaciones.' });
        }
    });

    router.get('/alumnos/me/publicaciones', requireUser(prisma), async (req, res) => {
        console.log(`[DEBUG - PublicacionRoutes] GET /alumnos/me/publicaciones route reached.`);
        const { alumnoId, role } = req.user;

        if (role !== 'alumno') {
            return res.status(403).json({ error: 'Acceso denegado. Solo los alumnos pueden acceder a esta ruta.' });
        }

        try {
            // Obtener todas las cátedras en las que el alumno está inscrito
            const catedrasInscritas = await prisma.catedraAlumno.findMany({
                where: { alumnoId: alumnoId },
                select: { catedraId: true },
            });

            const catedraIds = catedrasInscritas.map(ci => ci.catedraId);

            if (catedraIds.length === 0) {
                return res.json([]); // Si no está inscrito en ninguna cátedra, no hay publicaciones.
            }

            console.log(`[DEBUG] Alumno ID: ${alumnoId} está buscando publicaciones en Cátedras IDs:`, catedraIds);

            // Consulta 1: Obtener publicaciones que NO son tareas
            const nonTaskPublicaciones = await prisma.publicacion.findMany({
                where: {
                    catedraId: { in: catedraIds },
                    tipo: { not: 'TAREA' },
                },
                include: { /* ... includes necesarios ... */
                    autorDocente: { select: { id: true, nombre: true, apellido: true, email: true } },
                    autorAlumno: { select: { id: true, nombre: true, apellido: true, email: true } },
                    ComentarioPublicacion: { include: { autorAlumno: { select: { id: true, nombre: true, apellido: true, email: true } }, autorDocente: { select: { id: true, nombre: true, apellido: true, email: true } } }, orderBy: { created_at: 'asc' } },
                    interacciones: { where: { alumnoId: alumnoId }, select: { id: true } },
                    _count: { select: { interacciones: true } },
                },
            });

            // Consulta 2: Obtener publicaciones de TAREAS asignadas y visibles
            const taskPublicaciones = await prisma.publicacion.findMany({
                where: {
                    catedraId: { in: catedraIds },
                    tipo: 'TAREA',
                    visibleToStudents: true,
                    tareaMaestra: {
                        TareaAsignacion: {
                            some: { alumnoId: alumnoId },
                        },
                    },
                },
                include: { /* ... includes necesarios ... */
                    autorDocente: { select: { id: true, nombre: true, apellido: true, email: true } },
                    autorAlumno: { select: { id: true, nombre: true, apellido: true, email: true } },
                    ComentarioPublicacion: { include: { autorAlumno: { select: { id: true, nombre: true, apellido: true, email: true } }, autorDocente: { select: { id: true, nombre: true, apellido: true, email: true } } }, orderBy: { created_at: 'asc' } },
                    interacciones: { where: { alumnoId: alumnoId }, select: { id: true } },
                    _count: { select: { interacciones: true } },
                    tareaMaestra: {
                        include: {
                            TareaAsignacion: {
                                where: { alumnoId: alumnoId },
                                select: { id: true, estado: true, submission_path: true, submission_date: true, puntos_obtenidos: true },
                            },
                        },
                    },
                },
            });

            // Consulta 3: Obtener publicaciones de EVALUACIONES asignadas y visibles
            const evaluationPublicaciones = await prisma.publicacion.findMany({
                where: {
                    catedraId: { in: catedraIds },
                    tipo: 'EVALUACION',
                    visibleToStudents: true,
                    evaluacionMaestra: {
                        TareaAsignacion: {
                            some: { alumnoId: alumnoId },
                        },
                    },
                },
                include: {
                    autorDocente: { select: { id: true, nombre: true, apellido: true, email: true } },
                    autorAlumno: { select: { id: true, nombre: true, apellido: true, email: true } },
                    ComentarioPublicacion: { include: { autorAlumno: { select: { id: true, nombre: true, apellido: true, email: true } }, autorDocente: { select: { id: true, nombre: true, apellido: true, email: true } } }, orderBy: { created_at: 'asc' } },
                    interacciones: { where: { alumnoId: alumnoId }, select: { id: true } },
                    _count: { select: { interacciones: true } },
                    evaluacionMaestra: { select: { id: true, titulo: true, catedraId: true } },
                    evaluacionAsignacion: {
                        where: { alumnoId: alumnoId },
                        include: {
                            calificacion: true,
                        },
                    },
                },
            });

            // Unir y ordenar los resultados
            const publicaciones = [...nonTaskPublicaciones, ...taskPublicaciones, ...evaluationPublicaciones];
            publicaciones.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            console.log('[DEBUG] Publicaciones crudas obtenidas de la BD para el alumno:', JSON.stringify(publicaciones, null, 2));

            const publicacionesConInteracciones = publicaciones.map(publicacion => {
                const basePublicacion = {
                    ...publicacion,
                    hasUserInteracted: publicacion.interacciones.length > 0,
                    totalInteracciones: publicacion._count.interacciones,
                };

                if (publicacion.tipo === 'TAREA') {
                    const tareaAsignacion = publicacion.tareaMaestra?.asignaciones?.[0];
                    return {
                        ...basePublicacion,
                        tareaMaestraId: publicacion.tareaMaestra?.id || null,
                        tareaAsignacionEstado: tareaAsignacion?.estado || null,
                        tareaAsignacionId: tareaAsignacion?.id || null,
                        tareaAsignacionSubmissionPath: tareaAsignacion?.submission_path || null,
                        tareaAsignacionSubmissionDate: tareaAsignacion?.submission_date || null,
                        tareaAsignacionPuntosObtenidos: tareaAsignacion?.puntos_obtenidos || null,
                        tareaMaestra: undefined,
                    };
                } else if (publicacion.tipo === 'EVALUACION') {
                    const evaluacionAsignacion = publicacion.evaluacionAsignacion?.[0];
                    const evaluacionMaestra = publicacion.evaluacionMaestra;
                    let estadoFinal = evaluacionAsignacion?.estado || null;
                    if (evaluacionAsignacion?.calificacion) {
                        estadoFinal = 'CALIFICADA'; // Si tiene calificación, el estado es calificada
                    }

                    return {
                        ...basePublicacion,
                        evaluacionMaestraId: evaluacionMaestra?.id || null,
                        evaluacionMaestraTitulo: evaluacionMaestra?.titulo || null,
                        evaluacionAsignacionEstado: estadoFinal,
                        evaluacionAsignacionId: evaluacionAsignacion?.id || null,
                        evaluacionMaestra: undefined,
                        evaluacionAsignacion: undefined,
                    };
                }
                return { ...basePublicacion, tareaMaestra: undefined, evaluacionMaestra: undefined, evaluacionAsignacion: undefined };
            });

            console.log('[DEBUG] Publicaciones procesadas y enviadas al frontend:', JSON.stringify(publicacionesConInteracciones, null, 2));

            res.json(publicacionesConInteracciones);
        } catch (error) {
            console.error('Error al obtener publicaciones para el alumno:', error);
            res.status(500).json({ error: 'Error al obtener las publicaciones del alumno.' });
        }
    });

    // Actualizar una publicación (solo el docente que la creó o un admin)
    router.put('/catedras/:catedraId/publicaciones/:publicacionId', requireDocenteOrAdmin, checkCatedraDocente, async (req, res) => {
        const { publicacionId } = req.params;
        const { titulo, contenido } = req.body;
        const userId = req.user.docenteId; // ID del docente autenticado

        try {
            const publicacion = await prisma.publicacion.findUnique({
                where: { id: parseInt(publicacionId) },
                select: { autorDocenteId: true, autorAlumnoId: true }
            });

            if (!publicacion) {
                return res.status(404).json({ error: 'Publicación no encontrada.' });
            }

            // Permitir actualizar si el usuario es el docente que la creó, el alumno que la creó, o un admin
            if (publicacion.autorDocenteId === userId || publicacion.autorAlumnoId === req.user.id || req.user.role === 'ADMIN') {
                const updatedPublicacion = await prisma.publicacion.update({
                    where: { id: parseInt(publicacionId) },
                    data: { titulo, contenido },
                });
                res.json(updatedPublicacion);
            } else {
                return res.status(403).json({ error: 'No tienes permiso para editar esta publicación.' });
            }
        } catch (error) {
            console.error('Error al actualizar publicación:', error);
            res.status(500).json({ error: 'Error al actualizar la publicación.' });
        }
    });

    // Eliminar una publicación (solo el docente que la creó o un admin)
    router.delete('/catedras/:catedraId/publicaciones/:publicacionId', requireUser(prisma), async (req, res) => {
        const { publicacionId } = req.params;
        const { role, docenteId, alumnoId } = req.user;

        try {
            const publicacion = await prisma.publicacion.findUnique({
                where: { id: parseInt(publicacionId) },
                select: { autorDocenteId: true, autorAlumnoId: true }
            });

            if (!publicacion) {
                return res.status(404).json({ error: 'Publicación no encontrada.' });
            }

            const canDelete = (
                (role === 'alumno' && publicacion.autorAlumnoId === alumnoId) ||
                (role === 'docente' && publicacion.autorDocenteId === docenteId) ||
                (role === 'ADMIN')
            );

            if (!canDelete) {
                return res.status(403).json({ error: 'No tienes permiso para eliminar esta publicación.' });
            }

            // Eliminar interacciones asociadas
            await prisma.publicacionInteraccion.deleteMany({
                where: { publicacionId: parseInt(publicacionId) },
            });

            // Eliminar comentarios asociados
            await prisma.comentarioPublicacion.deleteMany({
                where: { publicacionId: parseInt(publicacionId) },
            });

            await prisma.publicacion.delete({
                where: { id: parseInt(publicacionId) },
            });
            return res.status(204).send(); // No Content

        } catch (error) {
            console.error('Error al eliminar publicación:', error);
            res.status(500).json({ error: 'Error al eliminar la publicación.' });
        }
    });

    // Rutas de Comentarios
    // Crear un comentario en una publicación
    router.post('/publicaciones/:publicacionId/comentarios', requireUser(prisma), async (req, res) => {
        const { publicacionId } = req.params;
        const { contenido } = req.body;

        let autorAlumnoId = null;
        let autorDocenteId = null;

        if (req.user.role === 'alumno' && req.user.alumnoId) { // Si es un alumno, usa su alumnoId
            autorAlumnoId = req.user.alumnoId;
        } else if (req.user.role === 'docente' && req.user.docenteId) { // Si es un docente, usa su docenteId
            autorDocenteId = req.user.docenteId;
        }

        if (!contenido) {
            return res.status(400).json({ error: 'El contenido del comentario es obligatorio.' });
        }

        if (!autorAlumnoId && !autorDocenteId) { // Usamos los IDs correctos para la validación
            return res.status(401).json({ error: 'Debe estar autenticado como alumno o docente para comentar.' });
        }

        try {
            const publicacion = await prisma.publicacion.findUnique({ where: { id: parseInt(publicacionId) } });
            if (!publicacion) {
                return res.status(404).json({ error: 'Publicación no encontrada.' });
            }

            const comentario = await prisma.comentarioPublicacion.create({
                data: {
                    texto: contenido,
                    publicacionId: parseInt(publicacionId),
                    autorAlumnoId: autorAlumnoId,
                    autorDocenteId: autorDocenteId,
                },
                include: {
                    autorAlumno: {
                        select: { id: true, nombre: true, apellido: true, email: true }
                    },
                    autorDocente: {
                        select: { id: true, nombre: true, apellido: true, email: true }
                    }
                }
            });
            res.status(201).json(comentario);
        } catch (error) {
            console.error('Error al crear comentario:', error);
            res.status(500).json({ error: 'Error al crear el comentario.' });
        }
    });




    // Rutas de Interacciones (Me gusta)
    // Dar "Me gusta" a una publicación
    router.post('/publicaciones/:publicacionId/interact', requireUser(prisma), async (req, res) => {
        console.log(`[PublicacionRoutes] POST /publicaciones/${req.params.publicacionId}/interact reached. User: ${JSON.stringify(req.user)}`);
        const { publicacionId } = req.params;
        const { role, docenteId, alumnoId } = req.user;

        if (!alumnoId && !docenteId && role !== 'ADMIN') {
            return res.status(401).json({ error: 'Debe estar autenticado como alumno o docente para interactuar.' });
        }

        try {
            const publicacion = await prisma.publicacion.findUnique({ where: { id: parseInt(publicacionId) } });
            if (!publicacion) {
                return res.status(404).json({ error: 'Publicación no encontrada.' });
            }

            let data = { publicacionId: parseInt(publicacionId) };
            if (role === 'alumno') {
                data.alumnoId = alumnoId;
            } else if (role === 'docente') {
                data.docenteId = docenteId;
            }

            const existingInteraction = await prisma.publicacionInteraccion.findFirst({
                where: {
                    publicacionId: parseInt(publicacionId),
                    OR: [
                        { alumnoId: alumnoId || undefined },
                        { docenteId: docenteId || undefined }
                    ]
                }
            });

            if (existingInteraction) {
                return res.status(409).json({ error: 'Ya has interactuado con esta publicación.' });
            }

            const interaction = await prisma.publicacionInteraccion.create({ data });
            res.status(201).json(interaction);
        } catch (error) {
            console.error('Error al añadir interacción:', error);
            res.status(500).json({ error: 'Error al procesar la interacción.' });
        }
    });

    // Quitar "Me gusta" a una publicación
    router.delete('/publicaciones/:publicacionId/interact', requireUser(prisma), async (req, res) => {
        console.log(`[PublicacionRoutes] DELETE /publicaciones/${req.params.publicacionId}/interact reached. User: ${JSON.stringify(req.user)}`);
        const { publicacionId } = req.params;
        const { role, docenteId, alumnoId } = req.user;

        if (!alumnoId && !docenteId && role !== 'ADMIN') {
            return res.status(401).json({ error: 'Debe estar autenticado como alumno o docente para interactuar.' });
        }

        try {
            const interactionWhere = {
                publicacionId: parseInt(publicacionId),
                AND: [
                    role === 'alumno' && alumnoId ? { alumnoId: alumnoId } : {},
                    role === 'docente' && docenteId ? { docenteId: docenteId } : {}
                ]
            };

            // Limpiar objetos vacíos en AND array
            interactionWhere.AND = interactionWhere.AND.filter(obj => Object.keys(obj).length > 0);

            const deletedInteraction = await prisma.publicacionInteraccion.deleteMany({
                where: interactionWhere
            });

            if (deletedInteraction.count === 0) {
                return res.status(404).json({ error: 'No se encontró ninguna interacción para eliminar.' });
            }

            res.status(204).send();
        } catch (error) {
            console.error('Error al eliminar interacción:', error);
            res.status(500).json({ error: 'Error al eliminar la interacción.' });
        }
    });

    router.put('/publicaciones/:publicacionId/toggle-visibility', requireDocenteOrAdmin, async (req, res) => {
        const { publicacionId } = req.params;
        const { catedraId } = req.body;

        try {
            const publicacion = await prisma.publicacion.findUnique({
                where: { id: parseInt(publicacionId) },
                select: { visibleToStudents: true, autorDocenteId: true, catedraId: true }
            });

            if (!publicacion) {
                return res.status(404).json({ error: 'Publicación no encontrada.' });
            }

            // Solo el docente autor o un admin pueden cambiar la visibilidad
            if (req.user.role === 'docente' && publicacion.autorDocenteId !== req.user.docenteId && publicacion.catedraId !== parseInt(catedraId)) {
                // También verificar si el docente actual está asignado a la cátedra de la publicación
                const isDocenteInCatedra = await prisma.catedra.findFirst({
                    where: {
                        id: publicacion.catedraId,
                        docenteId: req.user.docenteId
                    }
                });
                if (!isDocenteInCatedra) {
                    return res.status(403).json({ error: 'Acceso denegado: No eres el docente autorizado para esta publicación.' });
                }
            } else if (req.user.role !== 'ADMIN' && req.user.role !== 'docente') {
                return res.status(403).json({ error: 'Acceso denegado: Rol no autorizado para cambiar la visibilidad.' });
            }

            const updatedPublicacion = await prisma.publicacion.update({
                where: { id: parseInt(publicacionId) },
                data: {
                    visibleToStudents: !publicacion.visibleToStudents,
                },
            });

            res.json(updatedPublicacion);

        } catch (error) {
            console.error('Error al cambiar la visibilidad de la publicación:', error);
            res.status(500).json({ error: 'Error al cambiar la visibilidad de la publicación.' });
        }
    });

    return router;
};
