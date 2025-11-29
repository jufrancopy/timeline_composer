const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Ruta para obtener la vista pública de una cátedra
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const catedraData = await prisma.catedra.findUnique({
      where: { id: parseInt(id) },
      include: {
        Docente: true,
        PlanDeClases: {
          include: {
            UnidadPlan: {
              select: {
                id: true,
                periodo: true,
                contenido: true,
                capacidades: true,
                horasTeoricas: true,
                horasPracticas: true,
                estrategiasMetodologicas: true,
                mediosVerificacionEvaluacion: true,
              },
            },
          },
        },
        Publicacion: true, // Representa las "actividades"
        TareaMaestra: true, // Representa las "tareas"
        DiaClase: true, // Incluir los días de clase para el control de asistencia
        CatedraAlumno: {
          include: {
            Alumno: {
              include: {
                Asistencia: true,
                CalificacionFinalAlumno: {
                  include: {
                    CalificacionFinalConfig: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!catedraData) {
      return res.status(404).json({ error: 'Cátedra no encontrada' });
    }

    // Transformar los datos para que coincidan con las expectativas del frontend
    const catedra = {
      ...catedraData,
      docente: catedraData.Docente,
      planDeClases: catedraData.PlanDeClases.flatMap(plan =>
        plan.UnidadPlan.map(unidad => {
          console.log('[BACKEND] UnidadPlan data:', { 
            periodo: unidad.periodo,
            contenido: unidad.contenido,
            capacidades: unidad.capacidades,
            horasTeoricas: unidad.horasTeoricas,
            horasPracticas: unidad.horasPracticas,
            estrategiasMetodologicas: unidad.estrategiasMetodologicas,
            mediosVerificacionEvaluacion: unidad.mediosVerificacionEvaluacion,
          });
          return {
            periodo: unidad.periodo,
            unidad: unidad.contenido,
            contenidos: unidad.contenido ? unidad.contenido.split('\n').filter(c => c.trim() !== '') : [],
            capacidades: unidad.capacidades,
            horasTeoricas: unidad.horasTeoricas,
            horasPracticas: unidad.horasPracticas,
            estrategias: unidad.estrategiasMetodologicas ? unidad.estrategiasMetodologicas.split('\n').filter(e => e.trim() !== '') : [],
            evaluacion: unidad.mediosVerificacionEvaluacion,
          };
        })),
      actividades: catedraData.Publicacion,
      tareas: catedraData.TareaMaestra,
      diasClase: catedraData.DiaClase.map(dia => ({
        id: dia.id,
        fecha: dia.fecha.toISOString().split('T')[0], // Formato YYYY-MM-DD
        tipoDia: dia.tipoDia,
      })).sort((a, b) => new Date(a.fecha) - new Date(b.fecha)), // Ordenar por fecha
      alumnos: catedraData.CatedraAlumno
        .map(ca => {
          if (!ca.Alumno) return null;

          const registroAsistencia = {};
          let diasPresente = 0;
          let diasAusente = 0;
          let diasFeriadoAsuetoLluvia = 0;
          let diasClaseNormal = 0;

          catedraData.DiaClase.forEach(dia => {
            const fechaDia = dia.fecha.toISOString().split('T')[0];
            const asistenciaDelDia = ca.Alumno.Asistencia.find(
              asist => asist.diaClaseId === dia.id
            );

            if (dia.tipoDia === 'FERIADO' || dia.tipoDia === 'ASUETO' || dia.tipoDia === 'LLUVIA') {
              registroAsistencia[fechaDia] = dia.tipoDia;
              diasFeriadoAsuetoLluvia++;
            } else {
              diasClaseNormal++;
              if (asistenciaDelDia) {
                registroAsistencia[fechaDia] = asistenciaDelDia.presente ? 'PRESENTE' : 'AUSENTE';
                if (asistenciaDelDia.presente) {
                  diasPresente++;
                } else {
                  diasAusente++;
                }
              } else {
                registroAsistencia[fechaDia] = 'AUSENTE';
                diasAusente++;
              }
            }
          });

          const calificacionFinalData = ca.Alumno.CalificacionFinalAlumno && ca.Alumno.CalificacionFinalAlumno.length > 0
            ? ca.Alumno.CalificacionFinalAlumno[0]
            : null;
          
          let estadoAprobacion = 'N/A';
          let notaFinal = null;
          let escalaNota = null;
          let porcentajeAsistencia = 0;

          if (diasClaseNormal > 0) {
            porcentajeAsistencia = (diasPresente / diasClaseNormal) * 100;
          }

          if (calificacionFinalData) {
            notaFinal = calificacionFinalData.notaFinal;
            escalaNota = calificacionFinalData.escalaNota;
            const configAprobacion = calificacionFinalData.CalificacionFinalConfig;
            if (configAprobacion && notaFinal !== null) {
              estadoAprobacion = notaFinal >= configAprobacion.porcentajeMinimoAprobacion ? 'APROBADO' : 'REPROBADO';
            }
          }

          return {
            ...ca.Alumno,
            registroAsistencia: registroAsistencia,
            resumenAsistencia: {
              diasPresente,
              diasAusente,
              diasFeriadoAsuetoLluvia,
              diasClaseNormal,
              porcentajeAsistencia: porcentajeAsistencia.toFixed(2),
            },
            calificacionFinal: notaFinal,
            escalaCalificacion: escalaNota,
            estadoAprobacion: estadoAprobacion,
            CalificacionFinalAlumno: undefined,
          };
        })
        .filter(Boolean), // Eliminar nulos si no se encuentra un Alumno
    };

    // Limpiar los campos de relación originales
    delete catedra.Docente;
    delete catedra.PlanDeClases;
    delete catedra.Publicacion;
    delete catedra.TareaMaestra;
    delete catedra.CatedraAlumno;
    delete catedra.DiaClase; // Eliminar el campo original de DiaClase ya que se procesó en diasClase

    res.json(catedra);
  } catch (error) {
    console.error('Error al obtener la vista pública de la cátedra:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para listar todas las cátedras
router.get('/', async (req, res) => {
  try {
    const catedras = await prisma.catedra.findMany({
      include: {
        Docente: true, // Incluir el docente para mostrar su nombre
      }
    });
    res.json(catedras);
  } catch (error) {
    console.error('Error al listar las cátedras:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
