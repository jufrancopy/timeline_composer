const express = require('express');

// Helper function to calculate the grade scale
function calculateScale(notaFinal, porcentajeMinimoAprobacion) {
  let escalaNota;
  let estadoEscala;

  if (notaFinal < porcentajeMinimoAprobacion) {
    escalaNota = 1;
    estadoEscala = "Muy Malo - Reprobado";
  } else {
    // Rango de aprobación: porcentajeMinimoAprobacion a 100
    const rangoAprobacion = 100 - porcentajeMinimoAprobacion;
    // Dividir el rango de aprobación en 4 para las notas 2, 3, 4, 5
    const umbralPorNivel = rangoAprobacion / 4; 

    if (notaFinal >= porcentajeMinimoAprobacion && notaFinal < (porcentajeMinimoAprobacion + umbralPorNivel)) {
      escalaNota = 2;
      estadoEscala = "Malo - Poco Satisfactorio";
    } else if (notaFinal >= (porcentajeMinimoAprobacion + umbralPorNivel) && notaFinal < (porcentajeMinimoAprobacion + 2 * umbralPorNivel)) {
      escalaNota = 3;
      estadoEscala = "Regular - Aceptable";
    } else if (notaFinal >= (porcentajeMinimoAprobacion + 2 * umbralPorNivel) && notaFinal < (porcentajeMinimoAprobacion + 3 * umbralPorNivel)) {
      escalaNota = 4;
      estadoEscala = "Bueno - Satisfactorio";
    } else { // notaFinal >= (porcentajeMinimoAprobacion + 3 * umbralPorNivel)
      escalaNota = 5;
      estadoEscala = "Muy bueno - Excelente";
    }
  }

  return { escalaNota, estadoEscala };
}


const router = express.Router();
const prisma = require('../utils/prismaClient');
const requireDocente = require('../middlewares/requireDocente');
const requireAlumno = require('../middlewares/requireAlumno');

// ===== RUTAS DE CONFIGURACIÓN DE CALIFICACIÓN FINAL =====

// Crear nueva configuración
router.post('/docente/catedra/:catedraId/calificacionFinal/config', requireDocente, async (req, res) => {
  const { catedraId } = req.params;
  const { titulo, porcentajeMinimoAprobacion } = req.body;
  const docenteId = req.docente.docenteId;

  const elementosConfigurados = {
    diasClaseIds: req.body.elementosConfigurados?.diasClaseIds || [],
    tareaIds: req.body.elementosConfigurados?.tareaIds || [],
    evaluacionIds: req.body.elementosConfigurados?.evaluacionIds || [],
  };

  try {
    const nuevaConfiguracion = await prisma.calificacionFinalConfig.create({
      data: {
        titulo,
        Catedra: {
          connect: { id: parseInt(catedraId) },
        },
        Docente: {
          connect: { id: docenteId },
        },
        porcentajeMinimoAprobacion,
        elementosConfigurados,
      },
    });
    res.status(201).json(nuevaConfiguracion);
  } catch (error) {
    console.error('Error al crear configuración de calificación final:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// Obtener todas las configuraciones de una cátedra
router.get('/docente/catedra/:catedraId/calificacionFinal/configs', requireDocente, async (req, res) => {
  const { catedraId } = req.params;
  const docenteId = req.docente.docenteId;

  try {
    const configuraciones = await prisma.calificacionFinalConfig.findMany({
      where: {
        catedraId: parseInt(catedraId),
        docenteId,
      },
    });
    res.status(200).json(configuraciones);
  } catch (error) {
    console.error('Error al obtener configuraciones de calificación final:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// Actualizar configuración
router.put('/docente/catedra/:catedraId/calificacionFinal/config/:configId', requireDocente, async (req, res) => {
  const { catedraId, configId } = req.params;
  const { titulo, porcentajeMinimoAprobacion } = req.body;
  const docenteId = req.docente.docenteId;

  const elementosConfigurados = {
    diasClaseIds: req.body.elementosConfigurados?.diasClaseIds || [],
    tareaIds: req.body.elementosConfigurados?.tareaIds || [],
    evaluacionIds: req.body.elementosConfigurados?.evaluacionIds || [],
  };

  try {
    const configExistente = await prisma.calificacionFinalConfig.findUnique({
      where: { id: parseInt(configId) },
    });

    if (!configExistente || configExistente.catedraId !== parseInt(catedraId) || configExistente.docenteId !== docenteId) {
      return res.status(404).json({ error: 'Configuración de calificación final no encontrada o no autorizado.' });
    }

    const configuracionActualizada = await prisma.calificacionFinalConfig.update({
      where: { id: parseInt(configId) },
      data: {
        titulo,
        porcentajeMinimoAprobacion,
        elementosConfigurados,
      },
    });

    // Después de actualizar la configuración, recalcular las calificaciones finales para todos los alumnos afectados
    const recalculationResult = await recalculateFinalGradesForConfig(configId, catedraId, docenteId);
    if (!recalculationResult.success) {
      console.warn('Advertencia: Recálculo de calificaciones finales falló después de actualizar la configuración:', recalculationResult.message);
      // Aunque el recálculo haya fallado, la configuración se actualizó correctamente. Se notifica la advertencia.
    }

    res.status(200).json(configuracionActualizada);
  } catch (error) {
    console.error('Error al actualizar configuración de calificación final:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// Obtener resultados de una configuración
router.get('/docente/catedra/:catedraId/calificacionFinal/config/:configId/results', requireDocente, async (req, res) => {
  const { catedraId, configId } = req.params;
  const docenteId = req.docente.docenteId;

  try {
    const config = await prisma.calificacionFinalConfig.findUnique({
      where: {
        id: parseInt(configId),
        catedraId: parseInt(catedraId),
        docenteId,
      },
    });

    if (!config) {
      return res.status(404).json({ error: 'Configuración de calificación final no encontrada o no autorizado.' });
    }

    const resultados = await prisma.calificacionFinalAlumno.findMany({
      where: {
        calificacionFinalConfigId: parseInt(configId),
      },
      select: {
        id: true,
        notaFinal: true,
        porcentajeAsistencia: true,
        porcentajeTareas: true,
        porcentajeEvaluaciones: true,
        puntosObtenidosAsistencia: true,
        puntosPosiblesAsistencia: true,
        puntosObtenidosTareas: true,
        puntosPosiblesTareas: true,
        puntosObtenidosEvaluaciones: true,
        puntosPosiblesEvaluaciones: true,
        Alumno: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
          },
        },
      },
    });

      const resultadosProcesados = resultados.map(resultado => {
        const { escalaNota, estadoEscala } = calculateScale(resultado.notaFinal, config.porcentajeMinimoAprobacion);
        return {
          ...resultado,
          escalaNota,
          estadoEscala,
        };
      });

      res.status(200).json({ config, resultados: resultadosProcesados });
  } catch (error) {
    console.error('Error al obtener resultados de calificación final:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});


// Ruta para calcular y guardar la Calificación Final para los alumnos de una Catedra
async function recalculateFinalGradesForConfig(configId, catedraId, docenteId) {
  try {
    const config = await prisma.calificacionFinalConfig.findFirst({
      where: {
        id: parseInt(configId),
        catedraId: parseInt(catedraId),
        docenteId: docenteId,
      },
    });

    if (!config) {
      console.error('Configuración de calificación final no encontrada o no autorizado para el recálculo.');
      return { success: false, message: 'Configuración no encontrada o no autorizado.' };
    }

    const elementosConfigurados = {
      diasClaseIds: config.elementosConfigurados?.diasClaseIds || [],
      tareaIds: config.elementosConfigurados?.tareaIds || [],
      evaluacionIds: config.elementosConfigurados?.evaluacionIds || [],
    };
    const porcentajeMinimoAprobacion = config.porcentajeMinimoAprobacion;

    console.log('[RECALCULO] elementosConfigurados:', JSON.stringify(elementosConfigurados, null, 2));

    const alumnosCatedra = await prisma.catedraAlumno.findMany({
      where: {
        catedraId: parseInt(catedraId),
      },
      select: {
        alumnoId: true,
      },
    });

    const alumnoIds = alumnosCatedra.map(ac => ac.alumnoId);
    const resultadosFinalesAlumnos = [];

    for (const alumnoId of alumnoIds) {
      let totalPuntosObtenidos = 0;
      let totalPuntosPosibles = 0;

      let debug = {
        asistencia: { obtenidos: 0, posibles: 0 },
        tareas: { obtenidos: 0, posibles: 0 },
        evaluaciones: { obtenidos: 0, posibles: 0 },
      };

      // 1. Cálculo de puntos por asistencia
      if (elementosConfigurados.diasClaseIds && elementosConfigurados.diasClaseIds.length > 0) {
        const fechasDiasClase = elementosConfigurados.diasClaseIds;

        const diasClase = await prisma.diaClase.findMany({
          where: {
            catedraId: parseInt(catedraId),
            fecha: {
              in: fechasDiasClase.map(fecha => new Date(fecha))
            },
            NOT: {
              tipoDia: {
                in: ['FERIADO', 'ASUETO', 'LLUVIA'],
              },
            },
          },
          select: {
            id: true
          }
        });

        const diasClaseIdsReales = diasClase.map(dc => dc.id);

        if (diasClaseIdsReales.length > 0) {
          const asistenciasAlumno = await prisma.asistencia.count({
            where: {
              alumnoId: alumnoId,
              presente: true,
              diaClaseId: {
                in: diasClaseIdsReales,
              },
            },
          });
          debug.asistencia.obtenidos = asistenciasAlumno;
          debug.asistencia.posibles = diasClaseIdsReales.length;
          totalPuntosObtenidos += asistenciasAlumno;
          totalPuntosPosibles += diasClaseIdsReales.length;
        }
      }

      // 2. Cálculo de puntos por tareas
      if (elementosConfigurados.tareaIds && elementosConfigurados.tareaIds.length > 0) {
        const tareaIdsNumericos = elementosConfigurados.tareaIds.map(id => parseInt(id)).filter(id => !isNaN(id));

        if (tareaIdsNumericos.length > 0) {
          const tareasMaestras = await prisma.tareaMaestra.findMany({
            where: {
              id: { in: tareaIdsNumericos },
              catedraId: parseInt(catedraId),
            },
            select: {
              id: true,
              titulo: true,
              puntos_posibles: true,
            },
          });

          const puntosPosiblesTareas = tareasMaestras.reduce((acc, tarea) => acc + tarea.puntos_posibles, 0);
          totalPuntosPosibles += puntosPosiblesTareas;
          debug.tareas.posibles = puntosPosiblesTareas;

          const entregasAlumno = await prisma.tareaAsignacion.findMany({
            where: {
              alumnoId: alumnoId,
              tareaMaestraId: { in: tareaIdsNumericos },
            },
            select: {
              puntos_obtenidos: true,
            },
          });

          const puntosObtenidosAlumnoTareas = entregasAlumno.reduce((acc, entrega) => acc + (entrega.puntos_obtenidos || 0), 0);
          totalPuntosObtenidos += puntosObtenidosAlumnoTareas;
          debug.tareas.obtenidos = puntosObtenidosAlumnoTareas;
        }
      }

      // 3. Cálculo de puntos por evaluaciones
      if (elementosConfigurados.evaluacionIds && elementosConfigurados.evaluacionIds.length > 0) {
        const evaluacionIdsNumericos = elementosConfigurados.evaluacionIds.map(id =>
          typeof id === 'string' ? parseInt(id) : id
        ).filter(id => !isNaN(id));

        for (const evaluacionId of evaluacionIdsNumericos) {
          const totalPreguntasEvaluacion = await prisma.pregunta.count({
            where: {
              evaluacionId: evaluacionId,
            },
          });

          if (totalPreguntasEvaluacion > 0) {
            const respuestasCorrectasAlumno = await prisma.respuestaAlumno.count({
              where: {
                alumnoId: alumnoId,
                Pregunta: {
                  evaluacionId: evaluacionId,
                },
                Opcion: {
                  es_correcta: true,
                },
              },
            });

            debug.evaluaciones.obtenidos += respuestasCorrectasAlumno;
            debug.evaluaciones.posibles += totalPreguntasEvaluacion;
            totalPuntosObtenidos += respuestasCorrectasAlumno;
            totalPuntosPosibles += totalPreguntasEvaluacion;
          }
        }
      }

      let notaFinal = 0;
      if (totalPuntosPosibles > 0) {
        notaFinal = (totalPuntosObtenidos / totalPuntosPosibles) * 100;
      }

      const porcentajeAsistencia = debug.asistencia.posibles > 0 ? (debug.asistencia.obtenidos / debug.asistencia.posibles) * 100 : 0;
      const porcentajeTareas = debug.tareas.posibles > 0 ? (debug.tareas.obtenidos / debug.tareas.posibles) * 100 : 0;
      const porcentajeEvaluaciones = debug.evaluaciones.posibles > 0 ? (debug.evaluaciones.obtenidos / debug.evaluaciones.posibles) * 100 : 0;

      const { escalaNota, estadoEscala } = calculateScale(notaFinal, porcentajeMinimoAprobacion);

      await prisma.calificacionFinalAlumno.upsert({
        where: {
          calificacionFinalConfigId_alumnoId: {
            calificacionFinalConfigId: parseInt(configId),
            alumnoId: alumnoId,
          },
        },
        update: {
          notaFinal: notaFinal,
          fechaCalculo: new Date(),
          porcentajeAsistencia: parseFloat(porcentajeAsistencia.toFixed(2)),
          porcentajeTareas: parseFloat(porcentajeTareas.toFixed(2)),
          porcentajeEvaluaciones: parseFloat(porcentajeEvaluaciones.toFixed(2)),
          puntosObtenidosAsistencia: debug.asistencia.obtenidos,
          puntosPosiblesAsistencia: debug.asistencia.posibles,
          puntosObtenidosTareas: debug.tareas.obtenidos,
          puntosPosiblesTareas: debug.tareas.posibles,
          puntosObtenidosEvaluaciones: debug.evaluaciones.obtenidos,
          puntosPosiblesEvaluaciones: debug.evaluaciones.posibles,
          escalaNota: escalaNota,
        },
        create: {
          calificacionFinalConfigId: parseInt(configId),
          alumnoId: alumnoId,
          notaFinal: notaFinal,
          fechaCalculo: new Date(),
          porcentajeAsistencia: parseFloat(porcentajeAsistencia.toFixed(2)),
          porcentajeTareas: parseFloat(porcentajeTareas.toFixed(2)),
          porcentajeEvaluaciones: parseFloat(porcentajeEvaluaciones.toFixed(2)),
          puntosObtenidosAsistencia: debug.asistencia.obtenidos,
          puntosPosiblesAsistencia: debug.asistencia.posibles,
          puntosObtenidosTareas: debug.tareas.obtenidos,
          puntosPosiblesTareas: debug.tareas.posibles,
          puntosObtenidosEvaluaciones: debug.evaluaciones.obtenidos,
          puntosPosiblesEvaluaciones: debug.evaluaciones.posibles,
          escalaNota: escalaNota,
        },
      });

      resultadosFinalesAlumnos.push({
        alumnoId,
        notaFinal,
        aprobado: notaFinal >= porcentajeMinimoAprobacion,
        porcentajeAsistencia: parseFloat(porcentajeAsistencia.toFixed(2)),
        porcentajeTareas: parseFloat(porcentajeTareas.toFixed(2)),
        porcentajeEvaluaciones: parseFloat(porcentajeEvaluaciones.toFixed(2)),
        escalaNota,
        estadoEscala,
      });
    }
    return { success: true, resultados: resultadosFinalesAlumnos, message: 'Calificaciones finales recalculadas exitosamente.' };

  } catch (error) {
    console.error('Error en recalculateFinalGradesForConfig:', error);
    return { success: false, message: 'Error interno del servidor al recalcular la calificación final.' };
  }
}

// Ruta para calcular y guardar la Calificación Final para los alumnos de una Catedra
router.post('/docente/catedra/:catedraId/calificacionFinal/calcular', requireDocente, async (req, res) => {
  const { catedraId } = req.params;
  const { configId } = req.body;
  const docenteId = req.docente.docenteId;

  console.log('[CALIFICACION] docenteId:', docenteId);

  try {
    const result = await recalculateFinalGradesForConfig(configId, catedraId, docenteId);
    if (result.success) {
      res.status(200).json({ message: result.message, resultados: result.resultados });
    } else {
      res.status(500).json({ error: result.message });
    }
  } catch (error) {
    console.error('Error al invocar recalculateFinalGradesForConfig desde /calcular:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});


// ===== RUTAS DE DATOS PARA CONFIGURACIÓN =====

// Obtener días de clase
router.get('/docente/catedra/:catedraId/diasClase', requireDocente, async (req, res) => {
  const { catedraId } = req.params;
  const { startDate, endDate } = req.query;

  console.log(`[Backend - DiasClase] Recibida solicitud para catedraId: ${catedraId}, startDate: ${startDate}, endDate: ${endDate}`);

  try {
    const gteDate = new Date(`${startDate}T00:00:00.000Z`);
    const lteDate = new Date(`${endDate}T23:59:59.999Z`);
    console.log(`[Backend - DiasClase] Fechas procesadas: gteDate: ${gteDate.toISOString()}, lteDate: ${lteDate.toISOString()}`);

    const diasClase = await prisma.diaClase.findMany({
      where: {
        catedraId: parseInt(catedraId),
        fecha: {
          gte: gteDate,
          lte: lteDate,
        },
      },
      select: {
        id: true,
        fecha: true,
        tipoDia: true, // Incluir tipoDia
      },
      orderBy: {
        fecha: 'asc',
      },
    });
    console.log(`[Backend - DiasClase] Días de clase encontrados (${diasClase.length}):`, diasClase.map(d => d.fecha));
    res.status(200).json(diasClase);
  } catch (error) {
    console.error('Error al obtener días de clase:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// Obtener tareas
router.get('/docente/catedra/:catedraId/tareas', requireDocente, async (req, res) => {
  const { catedraId } = req.params;

  try {
    const tareas = await prisma.tareaMaestra.findMany({
      where: {
        catedraId: parseInt(catedraId),
      },
      select: {
        id: true,
        titulo: true,
        puntos_posibles: true,
        fecha_entrega: true,
      },
    });
    res.status(200).json(tareas);
  } catch (error) {
    console.error('Error al obtener tareas:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// Actualizar tipo de día de clase
router.put('/docente/catedra/:catedraId/diasClase/:diaClaseId/tipo', requireDocente, async (req, res) => {
  const { catedraId, diaClaseId } = req.params;
  const { tipoDia } = req.body; // NORMAL, FERIADO, ASUETO, LLUVIA
  const docenteId = req.docente.docenteId;

  if (!tipoDia || !['NORMAL', 'FERIADO', 'ASUETO', 'LLUVIA'].includes(tipoDia)) {
    return res.status(400).json({ error: 'Tipo de día inválido.' });
  }

  try {
    const diaClase = await prisma.diaClase.findFirst({
      where: {
        id: parseInt(diaClaseId),
        catedraId: parseInt(catedraId),
      },
      select: {
        id: true,
        fecha: true, // Necesario para el recálculo
      },
    });

    if (!diaClase) {
      return res.status(404).json({ error: 'Día de clase no encontrado o no pertenece a la cátedra.' });
    }

    const updatedDiaClase = await prisma.diaClase.update({
      where: { id: parseInt(diaClaseId) },
      data: { tipoDia: tipoDia },
    });

    // Trigger recalculo de calificaciones finales para todas las configuraciones que incluyan este dia de clase
    const configsToRecalculate = await prisma.calificacionFinalConfig.findMany({
      where: {
        catedraId: parseInt(catedraId),
        elementosConfigurados: {
          path: ['diasClaseIds'],
          array_contains: [diaClase.fecha.toISOString().split('T')[0]], // Comparar solo la fecha
        },
      },
      select: {
        id: true,
      },
    });

    for (const config of configsToRecalculate) {
      await recalculateFinalGradesForConfig(config.id.toString(), catedraId, docenteId);
    }

    res.status(200).json(updatedDiaClase);
  } catch (error) {
    console.error('Error al actualizar el tipo de día de clase:', error);
    res.status(500).json({ error: 'Error interno del servidor al actualizar el tipo de día de clase.' });
  }
});

// ===== RUTAS DE DATOS DE ALUMNOS PARA PRESELECCIÓN =====

// Obtener asistencias de alumno
router.get('/docente/catedra/:catedraId/alumno/:alumnoId/asistencias', requireDocente, async (req, res) => {
  const { catedraId, alumnoId } = req.params;
  const { startDate, endDate } = req.query;

  try {
    const asistencias = await prisma.asistencia.findMany({
      where: {
        alumnoId: parseInt(alumnoId),
        presente: true,
        DiaClase: {
          catedraId: parseInt(catedraId),
          fecha: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
      },
      select: {
        diaClaseId: true,
        DiaClase: {
          select: {
            fecha: true
          }
        }
      },
    });
    res.status(200).json(asistencias.map(a => ({ diaClaseId: a.diaClaseId, fecha: a.DiaClase.fecha })));
  } catch (error) {
    console.error('Error al obtener asistencias del alumno:', error);
    res.status(500).json({ error: 'Error interno del servidor al obtener asistencias del alumno.' });
  }
});

// Obtener tareas asignadas de alumno
router.get('/docente/catedra/:catedraId/alumno/:alumnoId/tareasAsignadas', requireDocente, async (req, res) => {
  const { catedraId, alumnoId } = req.params;

  try {
    const tareasAsignadas = await prisma.tareaAsignacion.findMany({
      where: {
        alumnoId: parseInt(alumnoId),
        TareaMaestra: {
          catedraId: parseInt(catedraId),
        },
        estado: 'CALIFICADA',
      },
      select: {
        tareaMaestraId: true,
      },
    });
    res.status(200).json(tareasAsignadas.map(t => t.tareaMaestraId));
  } catch (error) {
    console.error('Error al obtener tareas asignadas del alumno:', error);
    res.status(500).json({ error: 'Error interno del servidor al obtener tareas asignadas del alumno.' });
  }
});

// Obtener evaluaciones asignadas de alumno
router.get('/docente/catedra/:catedraId/alumno/:alumnoId/evaluacionesAsignadas', requireDocente, async (req, res) => {
  const { catedraId, alumnoId } = req.params;

  try {
    const evaluacionesAsignadas = await prisma.evaluacionAsignacion.findMany({
      where: {
        alumnoId: parseInt(alumnoId),
        Evaluacion: {
          catedraId: parseInt(catedraId),
        },
        estado: 'CALIFICADA',
      },
      select: {
        evaluacionId: true,
      },
    });
    res.status(200).json(evaluacionesAsignadas.map(e => e.evaluacionId));
  } catch (error) {
    console.error('Error al obtener evaluaciones asignadas del alumno:', error);
    res.status(500).json({ error: 'Error interno del servidor al obtener evaluaciones asignadas del alumno.' });
  }
});

console.log('Rutas de calificación registradas:');
console.log('POST /api/docente/catedra/:catedraId/calificacionFinal/calcular');

// ===== RUTA PARA ALUMNOS =====

// Obtener la calificación final de un alumno para una cátedra específica
router.get('/alumnos/me/catedra/:catedraId/calificacionFinal', requireAlumno, async (req, res) => {
  const { catedraId } = req.params;
  const alumnoId = req.alumno.alumnoId;

  console.log(`[ALUMNO-CALIFICACION] Buscando calificación final para Alumno ID: ${alumnoId} en Cátedra ID: ${catedraId}`);

  try {
    // 1. Buscar la calificación final más reciente para el alumno en esta cátedra
    const calificacion = await prisma.calificacionFinalAlumno.findFirst({
      where: {
        alumnoId: alumnoId,
        CalificacionFinalConfig: {
          catedraId: parseInt(catedraId),
        },
      },
      orderBy: {
        fechaCalculo: 'desc', // Obtener la calificación calculada más recientemente
      },
      include: { // Usamos include para obtener la configuración asociada
        CalificacionFinalConfig: {
          select: {
            id: true,
            titulo: true,
            porcentajeMinimoAprobacion: true,
            fechaCreacion: true,
          },
        },
        Alumno: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
          },
        },
      },
    });

    if (!calificacion) {
      console.log(`[ALUMNO-CALIFICACION] No se encontró una calificación final calculada para el alumno ${alumnoId} en la cátedra ${catedraId}.`);
      return res.status(200).json({ config: null, resultados: [] }); // Devuelve sin config y sin resultados
    }

    console.log(`[ALUMNO-CALIFICACION] Calificación encontrada (Config ID: ${calificacion.CalificacionFinalConfig.id}, calculada en: ${calificacion.fechaCalculo}) para el alumno ${alumnoId}.`);

    // Procesar el resultado para añadir la escala
    const { escalaNota, estadoEscala } = calculateScale(calificacion.notaFinal, calificacion.CalificacionFinalConfig.porcentajeMinimoAprobacion);
    const resultadoProcesado = {
      ...calificacion,
      escalaNota,
      estadoEscala,
    };

    // El frontend espera un objeto con 'config' y 'resultados' (que es un array)
    console.log(`[ALUMNO-CALIFICACION] Enviando calificación:`, resultadoProcesado);
    res.status(200).json({ config: calificacion.CalificacionFinalConfig, resultados: [resultadoProcesado] });

  } catch (error) {
    console.error(`[ALUMNO-CALIFICACION] Error al obtener la calificación final del alumno ${alumnoId}:`, error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});


module.exports = router;