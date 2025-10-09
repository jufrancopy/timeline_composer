const express = require('express');
const { requireUser } = require('./middlewares/requireUser');

module.exports = (prisma, transporter) => {
  const router = express.Router();

  // IMPORTANTE: Las rutas específicas (/me) deben ir ANTES que las rutas con parámetros (/:alumnoId)

  router.get('/alumnos/me', requireUser(prisma), async (req, res) => {
    try {
      const alumnoId = parseInt(req.user.alumnoId);
      const role = req.user.role;

      console.log('[GET /alumnos/me] req.user.role:', role);
      console.log('[GET /alumnos/me] req.user.alumnoId:', alumnoId);

      if (String(role).toLowerCase() !== 'alumno' || !alumnoId) {
        return res.status(403).json({ error: 'Acceso denegado: Solo para alumnos.' });
      }

      const alumno = await prisma.alumno.findUnique({
        where: { id: alumnoId },
        include: {
          catedras: {
            include: {
              catedra: true,
            },
          },
          asignacionesTareas: {
            include: {
              tareaMaestra: {
                include: {
                  catedra: {
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

  router.get('/alumnos/me/catedras', requireUser(prisma), async (req, res) => {
    try {
      console.log('[/me/catedras] req.user completo:', JSON.stringify(req.user, null, 2));
      console.log('[/me/catedras] alumnoId tipo:', typeof req.user?.alumnoId);
      console.log('[/me/catedras] alumnoId valor:', req.user?.alumnoId);

      if (
        !req.user ||
        !req.user.role ||
        String(req.user.role).toLowerCase() !== 'alumno' ||
        !req.user.alumnoId ||
        (typeof req.user.alumnoId !== 'number' && isNaN(parseInt(req.user.alumnoId))) ||
        parseInt(req.user.alumnoId) <= 0
      ) {
        console.error('[alumnoRoutes /me/catedras] FALLO DE ACCESO: Datos de usuario inválidos o ausentes. Role:', req.user?.role, 'AlumnoId:', req.user?.alumnoId);
        return res.status(403).json({ error: 'Acceso denegado: Solo para alumnos.' });
      }

      const alumnoId = parseInt(req.user.alumnoId);

      const alumnoCatedras = await prisma.catedraAlumno.findMany({
        where: {
          alumnoId: alumnoId,
        },
        include: {
          catedra: {
            select: {
              id: true,
              nombre: true,
              anio: true,
              institucion: true,
              turno: true,
              aula: true,
              dias: true,
              modalidad_pago: true,
            },
          },
        },
      });

      res.json(alumnoCatedras);
    } catch (error) {
      console.error('Error al obtener las cátedras del alumno:', error);
      res.status(500).json({ error: 'Error al obtener las cátedras del alumno', details: error.message });
    }
  });

  router.get('/alumnos/me/tareas', requireUser(prisma), async (req, res) => {
    try {
      console.log('[/me/tareas] req.user completo:', JSON.stringify(req.user, null, 2));
      console.log('[/me/tareas] alumnoId tipo:', typeof req.user?.alumnoId);
      console.log('[/me/tareas] alumnoId valor:', req.user?.alumnoId);

      if (
        !req.user ||
        !req.user.role ||
        String(req.user.role).toLowerCase() !== 'alumno' ||
        !req.user.alumnoId ||
        (typeof req.user.alumnoId !== 'number' && isNaN(parseInt(req.user.alumnoId))) ||
        parseInt(req.user.alumnoId) <= 0
      ) {
        console.error('[alumnoRoutes /me/tareas] FALLO DE ACCESO: Datos de usuario inválidos o ausentes. Role:', req.user?.role, 'AlumnoId:', req.user?.alumnoId);
        return res.status(403).json({ error: 'Acceso denegado: Solo para alumnos.' });
      }

      const alumnoId = parseInt(req.user.alumnoId);

      const tareas = await prisma.tareaAsignacion.findMany({
        where: {
          alumnoId: alumnoId,
        },
        include: {
          tareaMaestra: {
            select: {
              id: true,
              titulo: true,
              descripcion: true,
              fecha_entrega: true,
              multimedia_path: true,
              puntos_posibles: true,
              catedra: {  // ← Incluir catedra dentro de tareaMaestra
                select: {
                  id: true,
                  nombre: true,
                },
              },
            },
          },
        },
      });

      res.json(tareas);
    } catch (error) {
      console.error('Error al obtener las tareas del alumno:', error);
      res.status(500).json({ error: 'Error al obtener las tareas del alumno', details: error.message });
    }
  });

  router.get('/alumnos/me/evaluaciones', requireUser(prisma), async (req, res) => {
    try {
      console.log('[/me/evaluaciones] req.user completo:', JSON.stringify(req.user, null, 2));
      console.log('[/me/evaluaciones] alumnoId tipo:', typeof req.user?.alumnoId);
      console.log('[/me/evaluaciones] alumnoId valor:', req.user?.alumnoId);

      if (
        !req.user ||
        !req.user.role ||
        String(req.user.role).toLowerCase() !== 'alumno' ||
        !req.user.alumnoId ||
        (typeof req.user.alumnoId !== 'number' && isNaN(parseInt(req.user.alumnoId))) ||
        parseInt(req.user.alumnoId) <= 0
      ) {
        console.error('[alumnoRoutes /me/evaluaciones] FALLO DE ACCESO: Datos de usuario inválidos o ausentes. Role:', req.user?.role, 'AlumnoId:', req.user?.alumnoId);
        return res.status(403).json({ error: 'Acceso denegado: Solo para alumnos.' });
      }

      const alumnoId = parseInt(req.user.alumnoId);

      const evaluaciones = await prisma.evaluacion.findMany({
        where: {
          calificacionesEvaluacion: {
            some: {
              alumnoId: alumnoId,
            },
          },
        },
        include: {
          catedra: {
            select: {
              id: true,
              nombre: true,
            },
          },
          calificaciones: {
            where: {
              alumnoId: alumnoId,
            },
            select: {
              id: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      });

      const evaluacionesConEstado = evaluaciones.map(ev => ({
        ...ev,
        realizada: ev.calificaciones.length > 0,
      }));

      res.json(evaluacionesConEstado);
    } catch (error) {
      console.error('Error al obtener las evaluaciones del alumno:', error);
      res.status(500).json({ error: 'Error al obtener las evaluaciones del alumno', details: error.message });
    }
  });

  // Ruta con parámetro dinámico - DEBE IR AL FINAL después de todas las rutas /me
  router.get('/alumnos/:alumnoId/tareas-asignadas', requireUser(prisma), async (req, res) => {
    try {
      console.log('[/alumnos/:alumnoId/tareas] req.user completo:', JSON.stringify(req.user, null, 2));
      console.log('[/alumnos/:alumnoId/tareas] alumnoId tipo:', typeof req.user?.alumnoId);
      console.log('[/alumnos/:alumnoId/tareas] alumnoId valor:', req.user?.alumnoId);

      if (
        !req.user ||
        !req.user.role ||
        String(req.user.role).toLowerCase() !== 'alumno' ||
        !req.user.alumnoId ||
        (typeof req.user.alumnoId !== 'number' && isNaN(parseInt(req.user.alumnoId))) ||
        parseInt(req.user.alumnoId) <= 0
      ) {
        console.error('[alumnoRoutes /alumnos/:alumnoId/tareas] FALLO DE ACCESO: Datos de usuario inválidos o ausentes. Role:', req.user?.role, 'AlumnoId:', req.user?.alumnoId);
        return res.status(403).json({ error: 'Acceso denegado: Solo para alumnos.' });
      }

      const tokenAlumnoId = parseInt(req.user.alumnoId);
      const paramAlumnoId = parseInt(req.params.alumnoId);

      if (tokenAlumnoId !== paramAlumnoId) {
        console.error('[alumnoRoutes /alumnos/:alumnoId/tareas] Acceso denegado: ID de alumno en token no coincide con ID de parámetro. Token Alumno ID:', tokenAlumnoId, 'Param Alumno ID:', paramAlumnoId);
        return res.status(403).json({ error: 'Acceso denegado: El alumno no tiene permiso para ver estas tareas.' });
      }

      const tareas = await prisma.tareaAsignacion.findMany({
        where: {
          alumnoId: paramAlumnoId,
        },
        include: {
          tareaMaestra: {
            select: {
              id: true,
              titulo: true,
              descripcion: true,
              fecha_entrega: true,
              multimedia_path: true,
              puntos_maximos: true,
            },
          },
          catedra: {
            select: {
              id: true,
              nombre: true,
            },
          },
          entregas: {
            select: {
              id: true,
              fecha_entrega: true,
              ruta_archivo: true,
              calificacion: true,
              comentarios: true,
            },
          },
        },
      });

      res.json(tareas);
    } catch (error) {
      console.error('Error al obtener las tareas del alumno:', error);
      res.status(500).json({ error: 'Error al obtener las tareas del alumno', details: error.message });
    }
  });

  router.get('/alumnos/me/publicaciones', requireUser(prisma), async (req, res) => {
    try {
      console.log('[DEBUG - PublicacionRoutes] GET /alumnos/me/publicaciones route reached.');
      const alumnoId = parseInt(req.user.alumnoId);
      if (!alumnoId) {
        return res.status(403).json({ error: 'Acceso denegado: Solo para alumnos.' });
      }

      // 1. Obtener las Cátedras del alumno
      const catedrasAlumno = await prisma.catedraAlumno.findMany({
        where: { alumnoId: alumnoId },
        select: { catedraId: true },
      });
      const catedrasIds = catedrasAlumno.map(ca => ca.catedraId);
      console.log(`[DEBUG] Alumno ID: ${alumnoId} está buscando publicaciones en Cátedras IDs:`, catedrasIds);


      if (catedrasIds.length === 0) {
        return res.json([]);
      }

      // 2. Obtener las publicaciones de esas cátedras con la lógica correcta
      const publicaciones = await prisma.publicacion.findMany({
        where: {
          catedraId: { in: catedrasIds },
          OR: [
            { visibleToStudents: true }, // Anuncios generales
            { // O es una tarea que el alumno tiene asignada
              tipo: 'TAREA',
              tareaMaestra: {
                asignaciones: {
                  some: {
                    alumnoId: alumnoId,
                  },
                },
              },
            },
          ],
        },
        include: {
          catedra: { select: { id: true, nombre: true } },
          autorDocente: { select: { id: true, nombre: true, apellido: true } },
          autorAlumno: { select: { id: true, nombre: true, apellido: true } },
          comentarios: {
            include: {
              autorAlumno: { select: { id: true, nombre: true, apellido: true } },
              autorDocente: { select: { id: true, nombre: true, apellido: true } },
            },
            orderBy: { created_at: 'asc' },
          },
          interacciones: {
            where: { alumnoId: alumnoId },
            select: { id: true },
          },
          _count: {
            select: { interacciones: true },
          },
          // Incluir la TareaMaestra y la asignación específica del alumno
          tareaMaestra: {
            select: {
              id: true,
              titulo: true,
              descripcion: true,
              fecha_entrega: true,
              multimedia_path: true,
              puntos_posibles: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
      });
      res.json(publicaciones);
    } catch (error)
     {
      console.error('Error al obtener las publicaciones del alumno:', error);
      res.status(500).json({ error: 'Error al obtener las publicaciones del alumno', details: error.message });
    }
  });

  return router;
};