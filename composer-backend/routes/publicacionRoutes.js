const express = require('express');
const router = express.Router();
console.log('[DEBUG] publicacionRoutes cargado y router inicializado.');
const requireDocenteOrAdmin = require('../middlewares/requireDocenteOrAdmin');
const requireDocente = require('../middlewares/requireDocente');
const { requireUser } = require('../middlewares/requireUser');

module.exports = (prisma, transporter) => {

    // ============================================
    // RUTAS DE COMENTARIOS (más específicas primero)
    // ============================================
    
    // Crear un comentario en una publicación
    router.post('/publicaciones/:publicacionId/comentarios', requireUser(prisma), async (req, res) => {
        console.log(`[DEBUG] POST /publicaciones/${req.params.publicacionId}/comentarios invoked.`);
        const { publicacionId } = req.params;
        const { role: authenticatedRole, alumnoId: authenticatedAlumnoId, docenteId: authenticatedDocenteId } = req.user;

        if (!contenido || contenido.trim() === '') {
            return res.status(400).json({ error: 'El contenido del comentario no puede estar vacío.' });
        }

        let autorAlumnoId = null;
        let autorDocenteId = null;

        // Validar que el userId y userType enviados coincidan con el usuario autenticado
        if (userType === 'alumno' && authenticatedRole === 'alumno' && userId === authenticatedAlumnoId) {
            autorAlumnoId = userId;
        } else if (userType === 'docente' && authenticatedRole === 'docente' && userId === authenticatedDocenteId) {
            autorDocenteId = userId;
        } else {
            return res.status(403).json({ error: 'Acceso denegado: userId o userType no coinciden con el usuario autenticado.' });
        }

        try {
            const publicacion = await prisma.publicacion.findUnique({
                where: { id: parseInt(publicacionId) },
            });

            if (!publicacion) {
                return res.status(404).json({ error: 'Publicación no encontrada.' });
            }

            const comentario = await prisma.comentarioPublicacion.create({
                data: {
                    texto: contenido,
                    publicacionId: parseInt(publicacionId),
                    autorAlumnoId,
                    autorDocenteId,
                    updated_at: new Date(),
                },
            });
            const comentarioConAutor = await prisma.comentarioPublicacion.findUnique({
                where: { id: comentario.id },
                include: {
                    Alumno: { select: { id: true, nombre: true, apellido: true } },
                    Docente: { select: { id: true, nombre: true, apellido: true } },
                },
            });
            res.status(201).json(comentarioConAutor);
        } catch (error) {
            console.error('Error al crear comentario:', error);
            res.status(500).json({ error: 'Error interno del servidor al crear el comentario.' });
        }
    });

    // Eliminar un comentario de una publicación
    router.delete('/publicaciones/:publicacionId/comentarios/:comentarioId', requireUser(prisma), async (req, res) => {
        const { publicacionId, comentarioId } = req.params;
        const { role: authenticatedRole, alumnoId: authenticatedAlumnoId, docenteId: authenticatedDocenteId } = req.user;

        try {
            const comentario = await prisma.comentarioPublicacion.findUnique({
                where: { id: parseInt(comentarioId) },
            });

            if (!comentario) {
                return res.status(404).json({ error: 'Comentario no encontrado.' });
            }

            // Verificar si el usuario autenticado es el autor del comentario o un ADMIN/Docente de la catedra
            let isAuthorized = false;
            if (authenticatedRole === 'ADMIN') {
                isAuthorized = true;
            } else if (authenticatedRole === 'alumno' && comentario.autorAlumnoId === authenticatedAlumnoId) {
                isAuthorized = true;
            } else if (authenticatedRole === 'docente' && comentario.autorDocenteId === authenticatedDocenteId) {
                isAuthorized = true;
            } else if (authenticatedRole === 'docente') {
                // Un docente puede borrar cualquier comentario en una publicación de su cátedra
                const publicacion = await prisma.publicacion.findUnique({
                    where: { id: parseInt(publicacionId) },
                    select: { catedraId: true },
                });

                if (publicacion) {
                    const catedra = await prisma.catedra.findFirst({
                        where: { id: publicacion.catedraId, docenteId: authenticatedDocenteId },
                    });
                    if (catedra) {
                        isAuthorized = true;
                    }
                }
            }

            if (!isAuthorized) {
                return res.status(403).json({ error: 'Acceso denegado: No tienes permiso para eliminar este comentario.' });
            }

            await prisma.comentarioPublicacion.delete({
                where: { id: parseInt(comentarioId) },
            });

            res.status(204).send(); // No Content
        } catch (error) {
            console.error('Error al eliminar comentario:', error);
            res.status(500).json({ error: 'Error interno del servidor al eliminar el comentario.' });
        }
    });

    // ============================================
    // RUTAS DE INTERACCIONES
    // ============================================
    
    // Agregar una interacción a una publicación (Like/Dislike)
    router.post('/publicaciones/:publicacionId/interacciones', requireUser(prisma), async (req, res) => {
        console.log(`[DEBUG] POST /publicaciones/${req.params.publicacionId}/interacciones invoked.`);
        const { publicacionId } = req.params;
        const { role, alumnoId, docenteId } = req.user;

        let data = { publicacionId: parseInt(publicacionId) };
        if (role === 'alumno') {
            data.alumnoId = alumnoId;
        } else if (role === 'docente') {
            data.docenteId = docenteId;
        } else {
            return res.status(403).json({ error: 'Acceso denegado: Rol no autorizado para interactuar.' });
        }

        try {
            const publicacion = await prisma.publicacion.findUnique({
                where: { id: parseInt(publicacionId) },
            });

            if (!publicacion) {
                return res.status(404).json({ error: 'Publicación no encontrada.' });
            }

            // Verificar si ya existe una interacción del mismo usuario
            const existingInteraction = await prisma.publicacionInteraccion.findFirst({
                where: {
                    publicacionId: parseInt(publicacionId),
                    ...(role === 'alumno' && { alumnoId: alumnoId }),
                    ...(role === 'docente' && { docenteId: docenteId }),
                },
            });

            if (existingInteraction) {
                return res.status(409).json({ error: 'Ya has interactuado con esta publicación.' });
            }

            const interaction = await prisma.publicacionInteraccion.create({
                data: data,
            });
            res.status(201).json(interaction);
        } catch (error) {
            console.error('Error al agregar interacción:', error);
            res.status(500).json({ error: 'Error interno del servidor al agregar interacción.' });
        }
    });

    // Eliminar una interacción de una publicación (Unlike/Undislike)
    router.delete('/publicaciones/:publicacionId/interacciones', requireUser(prisma), async (req, res) => {
        const { publicacionId } = req.params;
        const { role, alumnoId, docenteId } = req.user;

        try {
            const publicacion = await prisma.publicacion.findUnique({
                where: { id: parseInt(publicacionId) },
            });

            if (!publicacion) {
                return res.status(404).json({ error: 'Publicación no encontrada.' });
            }

            const whereClause = {
                publicacionId: parseInt(publicacionId),
                ...(role === 'alumno' && { alumnoId: alumnoId }),
                ...(role === 'docente' && { docenteId: docenteId }),
            };

            const existingInteraction = await prisma.publicacionInteraccion.findFirst({ where: whereClause });

            if (!existingInteraction) {
                return res.status(404).json({ error: 'No se encontró interacción para eliminar.' });
            }

            await prisma.publicacionInteraccion.deleteMany({
                where: whereClause,
            });
            res.status(204).send();
        } catch (error) {
            console.error('Error al eliminar interacción:', error);
            res.status(500).json({ error: 'Error interno del servidor al eliminar interacción.' });
        }
    });


    // ============================================
    // RUTAS DE PUBLICACIONES
    // ============================================
    
    // Cambiar visibilidad de publicación
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

            if (req.user.role === 'docente' && publicacion.autorDocenteId !== req.user.docenteId && publicacion.catedraId !== parseInt(catedraId)) {
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

    // Crear una nueva publicación en una cátedra
    router.post('/catedras/:catedraId/publicaciones', requireUser(prisma), async (req, res) => {
        const { catedraId } = req.params;
        const { titulo, contenido, tipo } = req.body;
        const { role, docenteId, alumnoId } = req.user;

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

        let finalTipo = tipo;
        if (role === 'alumno') {
            finalTipo = 'ANUNCIO'; // Los alumnos solo pueden crear publicaciones de tipo ANUNCIO
        } else if (!finalTipo) {
            finalTipo = 'ANUNCIO'; // Por defecto es ANUNCIO si no se especifica y no es alumno
        }

        try {
            const publicacion = await prisma.publicacion.create({
                data: {
                    titulo,
                    contenido,
                    catedraId: parseInt(catedraId),
                    autorDocenteId: autorDocenteId,
                    autorAlumnoId: autorAlumnoId,
                    tipo: finalTipo,
                    updated_at: new Date(),
                },
            });
            res.status(201).json(publicacion);
        } catch (error) {
            console.error('Error al crear publicación:', error);
            res.status(500).json({ error: 'Error al crear la publicación.' });
        }
    });

    // Obtener todas las publicaciones de una cátedra
    router.get('/publicaciones/catedra/:catedraId', requireUser(prisma), async (req, res) => {
        console.log(`[DEBUG - PublicacionRoutes] GET /catedra/${req.params.catedraId} invoked.`);
        const { catedraId } = req.params;
        console.log(`[DEBUG - PublicacionRoutes] Received catedraId: ${catedraId}`);
        const { role, alumnoId, docenteId } = req.user;

        let whereClause = {
            catedraId: parseInt(catedraId),
        };

        if (role === 'alumno') {
            whereClause.OR = [
                { visibleToStudents: true },
                {
                    tipo: 'TAREA',
                    TareaMaestra: {
                        TareaAsignacion: {
                            some: { alumnoId: alumnoId },
                        },
                    },
                },
                {
                    tipo: 'EVALUACION',
                    Evaluacion: {
                        EvaluacionAsignacion: {
                            some: { alumnoId: alumnoId },
                        },
                    },
                },
            ];
        }

        try {
            const publicaciones = await prisma.Publicacion.findMany({
                where: whereClause,
                include: {
                    Docente: { select: { id: true, nombre: true, apellido: true, email: true } },
                    Alumno: { select: { id: true, nombre: true, apellido: true, email: true } },
                    ComentarioPublicacion: { 
                        include: { 
                            Alumno: { select: { id: true, nombre: true, apellido: true } }, 
                            Docente: { select: { id: true, nombre: true, apellido: true } } 
                        }, 
                        orderBy: { created_at: 'asc' } 
                    },
                    PublicacionInteraccion: role === 'alumno'
                        ? { where: { alumnoId: parseInt(alumnoId) } }
                        : (role === 'docente' ? { where: { docenteId: parseInt(docenteId) } } : undefined),
                    _count: {
                        select: {
                            PublicacionInteraccion: true,
                            ComentarioPublicacion: true
                        }
                    },
                    TareaMaestra: {
                        include: {
                            UnidadPlan: {
                                include: {
                                    PlanDeClases: true
                                }
                            },
                            TareaAsignacion: { where: { alumnoId: alumnoId || undefined } }
                        }
                    },
                    Evaluacion: {
                        include: {
                            UnidadPlan: {
                                include: {
                                    PlanDeClases: true
                                }
                            },
                            EvaluacionAsignacion: { where: { alumnoId: alumnoId || undefined } }
                        }
                    },
                },
                orderBy: {
                    created_at: 'desc',
                },
            });

            console.log('[DEBUG - PublicacionRoutes] Publicaciones encontradas por findMany:', publicaciones.length);
            console.log('[DEBUG - PublicacionRoutes] Publicaciones con interacciones y comentarios para catedraId:', JSON.stringify(publicaciones[0]?.ComentarioPublicacion, null, 2));
            const publicacionesConInteracciones = publicaciones.map(publicacion => {
                const basePublicacion = {
                    ...publicacion,
                    catedraId: publicacion.catedraId,
                    hasUserInteracted: (publicacion.PublicacionInteraccion?.length || 0) > 0,
                    totalInteracciones: publicacion._count?.PublicacionInteraccion || 0,
                    PublicacionInteraccion: undefined,
                    autorDocente: publicacion.Docente,
                    autorAlumno: publicacion.Alumno,
                    // Incluir comentarios y asegurar que los autores estén presentes
                    ComentarioPublicacion: publicacion.ComentarioPublicacion.map(comment => ({
                        ...comment,
                        autorAlumno: comment.Alumno, // Asegurar que el objeto Alumno esté aquí
                        autorDocente: comment.Docente, // Asegurar que el objeto Docente esté aquí
                    })),
                };

                if (role === 'alumno') {
                    if (publicacion.tipo === 'TAREA') {
                        const tareaAsignacion = publicacion.TareaMaestra?.TareaAsignacion?.[0];
                        const unidadPlan = publicacion.TareaMaestra?.UnidadPlan;
                        const planDeClases = unidadPlan?.PlanDeClases;
                        return {
                            ...basePublicacion,
                            catedraId: publicacion.catedraId, // Aseguramos que catedraId esté presente
                            tareaMaestraId: publicacion.TareaMaestra?.id || null,
                            tareaAsignacionEstado: tareaAsignacion?.estado || null,
                            tareaAsignacionId: tareaAsignacion?.id || null,
                            tareaAsignacionSubmissionPath: tareaAsignacion?.submission_path || null,
                            tareaAsignacionSubmissionDate: tareaAsignacion?.submission_date || null,
                            tareaAsignacionPuntosObtenidos: tareaAsignacion?.puntos_obtenidos || null,
                            unidadPlanNombre: unidadPlan?.periodo || null,
                            planDeClasesTitulo: planDeClases?.titulo || null,
                            tareaMaestra: undefined,
                            ComentarioPublicacion: publicacion.ComentarioPublicacion.map(comment => ({
                                ...comment,
                                autorAlumno: comment.Alumno,
                                autorDocente: comment.Docente,
                            })),
                        };
                    } else if (publicacion.tipo === 'EVALUACION') {
                        const evaluacionAsignacion = publicacion.Evaluacion?.EvaluacionAsignacion?.[0];
                        const evaluacionMaestra = publicacion.Evaluacion;
                        const unidadPlan = evaluacionMaestra?.UnidadPlan;
                        const planDeClases = unidadPlan?.PlanDeClases;
                        let estadoFinal = evaluacionAsignacion?.estado || null; // Usar el estado directamente de la asignación

                        // Si hay una calificación, y el estado no es ya CALIFICADA, podemos inferir que ha sido calificada.
                        // Sin embargo, para consistencia con el enum, lo ideal es que el estado en DB se actualice a CALIFICADA.
                        // Si el estado ya viene como CALIFICADA del backend, este bloque no cambia nada.
                        if (evaluacionAsignacion?.CalificacionEvaluacion && estadoFinal !== 'CALIFICADA') {
                            estadoFinal = 'CALIFICADA';
                        }
                        return {
                            ...basePublicacion,
                            evaluacionMaestraId: evaluacionMaestra?.id || null,
                            evaluacionMaestraTitulo: evaluacionMaestra?.titulo || null,
                            evaluacionAsignacionEstado: estadoFinal,
                            evaluacionAsignacionId: evaluacionAsignacion?.id || null,
                            unidadPlanNombre: unidadPlan?.periodo || null,
                            planDeClasesTitulo: planDeClases?.titulo || null,
                            Evaluacion: undefined,
                            evaluacionAsignacion: undefined,
                            ComentarioPublicacion: publicacion.ComentarioPublicacion.map(comment => ({
                                ...comment,
                                autorAlumno: comment.Alumno,
                                autorDocente: comment.Docente,
                            })),
                        };
                    }
                }

                return {
                    ...basePublicacion,
                    TareaMaestra: publicacion.TareaMaestra ? { id: publicacion.TareaMaestra.id, titulo: publicacion.TareaMaestra.titulo } : undefined,
                    Evaluacion: publicacion.Evaluacion ? { id: publicacion.Evaluacion.id, titulo: publicacion.Evaluacion.titulo } : undefined,
                    ComentarioPublicacion: publicacion.ComentarioPublicacion.map(comment => ({
                        ...comment,
                        autorAlumno: comment.Alumno,
                        autorDocente: comment.Docente,
                    })),
                };
            });

            res.json(publicacionesConInteracciones);
        } catch (error) {
            console.error(`[DEBUG - PublicacionRoutes] Error in GET /catedras/${req.params.catedraId}/publicaciones:`, error);
            res.status(500).json({ error: 'Error al obtener las publicaciones.' });
        }
    });

    // Obtener publicaciones del alumno actual
    router.get('/alumnos/me/publicaciones', requireUser(prisma), async (req, res) => {
        console.log(`[DEBUG - PublicacionRoutes] GET /alumnos/me/publicaciones route reached.`);
        const { alumnoId, role } = req.user;

        if (role !== 'alumno') {
            return res.status(403).json({ error: 'Acceso denegado. Solo los alumnos pueden acceder a esta ruta.' });
        }

        try {
            const catedrasInscritas = await prisma.catedraAlumno.findMany({
                where: { alumnoId: alumnoId },
                select: { catedraId: true },
            });

            const catedraIds = catedrasInscritas.map(ci => ci.catedraId);

            if (catedraIds.length === 0) {
                return res.json([]);
            }

            console.log(`[DEBUG] Alumno ID: ${alumnoId} está buscando publicaciones en Cátedras IDs:`, catedraIds);

            const nonTaskPublicaciones = await prisma.publicacion.findMany({
                where: {
                    catedraId: { in: catedraIds },
                    tipo: { not: 'TAREA' },
                },
                include: {
                    Docente: { select: { id: true, nombre: true, apellido: true, email: true } },
                    Alumno: { select: { id: true, nombre: true, apellido: true, email: true } },
                    ComentarioPublicacion: { 
                        include: { 
                            Alumno: { select: { id: true, nombre: true, apellido: true } }, 
                            Docente: { select: { id: true, nombre: true, apellido: true } } 
                        }, 
                        orderBy: { created_at: 'asc' } 
                    },
                    PublicacionInteraccion: { where: { alumnoId: alumnoId }, select: { id: true } },
                    _count: { select: { PublicacionInteraccion: true } },
                },
            });

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
                include: {
                    Docente: { select: { id: true, nombre: true, apellido: true, email: true } },
                    Alumno: { select: { id: true, nombre: true, apellido: true, email: true } },
                    ComentarioPublicacion: { 
                        include: { 
                            Alumno: { select: { id: true, nombre: true, apellido: true } }, 
                            Docente: { select: { id: true, nombre: true, apellido: true } } 
                        }, 
                        orderBy: { created_at: 'asc' } 
                    },
                    PublicacionInteraccion: { where: { alumnoId: alumnoId }, select: { id: true } },
                    _count: { select: { PublicacionInteraccion: true } },
                    tareaMaestra: {
                        include: {
                            UnidadPlan: {
                                include: {
                                    PlanDeClases: true
                                }
                            },
                            TareaAsignacion: {
                                where: { alumnoId: alumnoId },
                                select: { id: true, estado: true, submission_path: true, submission_date: true, puntos_obtenidos: true },
                            },
                        },
                    },
                },
            });

            const evaluationPublicaciones = await prisma.publicacion.findMany({
                where: {
                    catedraId: { in: catedraIds },
                    tipo: 'EVALUACION',
                    visibleToStudents: true,
                    evaluacionMaestra: {
                        EvaluacionAsignacion: {
                            some: { alumnoId: alumnoId },
                        },
                    },
                },
                include: {
                    Docente: { select: { id: true, nombre: true, apellido: true, email: true } },
                    Alumno: { select: { id: true, nombre: true, apellido: true, email: true } },
                    ComentarioPublicacion: { 
                        include: { 
                            Alumno: { select: { id: true, nombre: true, apellido: true } }, 
                            Docente: { select: { id: true, nombre: true, apellido: true } } 
                        }, 
                        orderBy: { created_at: 'asc' } 
                    },
                    PublicacionInteraccion: { where: { alumnoId: alumnoId }, select: { id: true } },
                    _count: { select: { PublicacionInteraccion: true } },
                    evaluacionMaestra: {
                        select: { id: true, titulo: true, catedraId: true, UnidadPlan: { include: { PlanDeClases: true } } },
                    },
                    evaluacionAsignacion: {
                        where: { alumnoId: alumnoId },
                        include: {
                            calificacion: true,
                        },
                    },
                },
            });

            const publicaciones = [...nonTaskPublicaciones, ...taskPublicaciones, ...evaluationPublicaciones];
            publicaciones.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            console.log('[DEBUG] Publicaciones crudas obtenidas de la BD para el alumno:', JSON.stringify(publicaciones, null, 2));
            console.log('[DEBUG - PublicacionRoutes] Publicaciones con interacciones y comentarios para alumno/me:', JSON.stringify(publicaciones[0]?.ComentarioPublicacion, null, 2));

            console.log('[DEBUG - PublicacionRoutes] Publicaciones encontradas por findMany:', publicaciones.length);
            const publicacionesConInteracciones = publicaciones.map(publicacion => {
                const basePublicacion = {
                    ...publicacion,
                    hasUserInteracted: publicacion.PublicacionInteraccion.length > 0,
                    totalInteracciones: publicacion._count.PublicacionInteraccion,
                    autorDocente: publicacion.Docente, // Incluir el objeto Docente completo
                    autorAlumno: publicacion.Alumno,   // Incluir el objeto Alumno completo
                    ComentarioPublicacion: publicacion.ComentarioPublicacion.map(comment => ({
                        ...comment,
                        autorAlumno: comment.Alumno, // Asegurar que el objeto Alumno esté aquí
                        autorDocente: comment.Docente, // Asegurar que el objeto Docente esté aquí
                    })),
                };

                if (publicacion.tipo === 'TAREA') {
                    const tareaAsignacion = publicacion.tareaMaestra?.TareaAsignacion?.[0];
                    const unidadPlan = publicacion.tareaMaestra?.UnidadPlan;
                    const planDeClases = unidadPlan?.PlanDeClases;
                    return {
                        ...basePublicacion,
                        tareaMaestraId: publicacion.tareaMaestra?.id || null,
                        tareaAsignacionEstado: tareaAsignacion?.estado || null,
                        tareaAsignacionId: tareaAsignacion?.id || null,
                        tareaAsignacionSubmissionPath: tareaAsignacion?.submission_path || null,
                        tareaAsignacionSubmissionDate: tareaAsignacion?.submission_date || null,
                        tareaAsignacionPuntosObtenidos: tareaAsignacion?.puntos_obtenidos || null,
                        unidadPlanNombre: unidadPlan?.periodo || null,
                        planDeClasesTitulo: planDeClases?.titulo || null,
                        tareaMaestra: undefined,
                        ComentarioPublicacion: publicacion.ComentarioPublicacion.map(comment => ({
                            ...comment,
                            autorAlumno: comment.Alumno,
                            autorDocente: comment.Docente,
                        })),
                    };
                } else if (publicacion.tipo === 'EVALUACION') {
                    const evaluacionAsignacion = publicacion.evaluacionAsignacion?.[0];
                    const evaluacionMaestra = publicacion.evaluacionMaestra;
                    const unidadPlan = evaluacionMaestra?.UnidadPlan;
                    const planDeClases = unidadPlan?.PlanDeClases;
                    let estadoFinal = evaluacionAsignacion?.estado || null; // Usar el estado directamente de la asignación

                    // Si hay una calificación, y el estado no es ya CALIFICADA, podemos inferir que ha sido calificada.
                    // Sin embargo, para consistencia con el enum, lo ideal es que el estado en DB se actualice a CALIFICADA.
                    // Si el estado ya viene como CALIFICADA del backend, este bloque no cambia nada.
                    if (evaluacionAsignacion?.calificacion && estadoFinal !== 'CALIFICADA') {
                        estadoFinal = 'CALIFICADA';
                    }
                    return {
                        ...basePublicacion,
                        evaluacionMaestraId: evaluacionMaestra?.id || null,
                        evaluacionMaestraTitulo: evaluacionMaestra?.titulo || null,
                        evaluacionAsignacionEstado: estadoFinal,
                        evaluacionAsignacionId: evaluacionAsignacion?.id || null,
                        unidadPlanNombre: unidadPlan?.periodo || null,
                        planDeClasesTitulo: planDeClases?.titulo || null,
                        Evaluacion: undefined,
                        evaluacionAsignacion: undefined,
                        ComentarioPublicacion: publicacion.ComentarioPublicacion.map(comment => ({
                            ...comment,
                            autorAlumno: comment.Alumno,
                            autorDocente: comment.Docente,
                        })),
                    };
                }
                return { ...basePublicacion, tareaMaestra: undefined, evaluacionMaestra: undefined, evaluacionAsignacion: undefined, ComentarioPublicacion: publicacion.ComentarioPublicacion.map(comment => ({
                    ...comment,
                    autorAlumno: comment.Alumno,
                    autorDocente: comment.Docente,
                })) }; // Ensure comments are included
            });

            res.json(publicacionesConInteracciones);
        } catch (error) {
            console.error('Error al obtener publicaciones para el alumno:', error);
            res.status(500).json({ error: 'Error al obtener las publicaciones del alumno.' });
        }
    });

    return router;
};