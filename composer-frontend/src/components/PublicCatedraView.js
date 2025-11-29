import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import AlumnosTable from './AlumnosTable';
import PlanEstudiosTable from './PlanEstudiosTable';

function PublicCatedraView() {
  const { id } = useParams();
  const [catedra, setCatedra] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processedPlanData, setProcessedPlanData] = useState([]);

  // Helper function to strip HTML tags
  const stripHtmlTags = (htmlString) => {
    const doc = new DOMParser().parseFromString(htmlString, 'text/html');
    return doc.body.textContent || '';
  };

  useEffect(() => {
    const getCatedra = async () => {
      try {
        const { data } = await api.fetchPublicCatedraById(id);
        setCatedra(data);
      } catch (err) {
        // Guardar el objeto Error para poder mostrar err.message en el render
        setError(err);
        console.error('Error fetching public catedra by ID:', err);
      } finally {
        setLoading(false);
      }
    };

    getCatedra();
  }, [id]);

  // helper: normaliza distintos tipos a array de strings
  const toArray = (val) => {
    if (Array.isArray(val)) return val.map(v => (v == null ? '' : String(v))).filter(Boolean);
    if (val == null) return [];
    if (typeof val === 'string') return val.split('\n').map(s => s.trim()).filter(Boolean);
    // objeto u otro tipo -> convertir a string y devolver como único elemento
    return [String(val)].map(s => s.trim()).filter(Boolean);
  };

  useEffect(() => {
    if (catedra && catedra.planDeClases) {
      const transformedPlan = catedra.planDeClases.map(unidad => {
        const contenidoRaw = unidad.contenido ?? unidad.unidad;
        const estrategiasRaw = unidad.estrategias ?? unidad.estrategiasMetodologicas;
        const evaluacionRaw = unidad.evaluacion ?? unidad.mediosVerificacionEvaluacion ?? '';

        return {
          periodo: unidad.periodo,
          unidad: contenidoRaw ?? '',
          contenidos: toArray(contenidoRaw),
          capacidades: unidad.capacidades ?? '',
          horasTeoricas: unidad.horasTeoricas ?? '',
          horasPracticas: unidad.horasPracticas ?? '',
          estrategias: toArray(estrategiasRaw),
          // normalizar evaluación a string (si viene array lo unimos)
          evaluacion: Array.isArray(evaluacionRaw) ? evaluacionRaw.join('\n') : String(evaluacionRaw ?? ''),
        };
      });
      setProcessedPlanData(transformedPlan);
    }
  }, [catedra]);

  if (loading) return <div className="text-gray-200">Cargando detalles de la cátedra...</div>;
  if (error) return <div className="text-red-500">Error al cargar la cátedra: {error.message}</div>;
  if (!catedra) return <div className="text-gray-400">Cátedra no encontrada.</div>;

  return (
    <div className="container mx-auto p-4 bg-gray-800 text-white min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-green-400">{catedra.nombre} ({catedra.anio})</h1>
      
      {catedra.docente && (
        <h2 className="text-2xl font-semibold mb-6 text-blue-300">Docente: {catedra.docente.nombre} {catedra.docente.apellido}</h2>
      )}

      {/* Plan de Clases */}
      <section className="mb-8">
        <h3 className="text-3xl font-bold mb-4 text-purple-300">Plan de Clases</h3>
        {processedPlanData.length > 0 ? (
          <PlanEstudiosTable planData={processedPlanData} loading={loading} />
        ) : (
          <p className="text-gray-400">No hay plan de clases disponible para esta cátedra.</p>
        )}
      </section>

      {/* Actividades */}
      <section className="mb-8 p-6 bg-gray-700 rounded-lg shadow-lg">
        <h3 className="text-3xl font-bold mb-4 text-yellow-300">Actividades</h3>
        {catedra.actividades && catedra.actividades.length > 0 ? (
          <ul className="list-disc list-inside text-gray-300 ml-4">
            {catedra.actividades.map((actividad) => (
              <li key={actividad.id} className="mb-2">
                <span className="font-semibold text-lg">{actividad.titulo}:</span> {actividad.descripcion} (Fecha: {new Date(actividad.fecha).toLocaleDateString()})
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400">No hay actividades registradas para esta cátedra.</p>
        )}
      </section>

      {/* Tareas */}
      <section className="mb-8 p-6 bg-gray-700 rounded-lg shadow-lg">
        <h3 className="text-3xl font-bold mb-4 text-orange-300">Tareas</h3>
        {catedra.tareas && catedra.tareas.length > 0 ? (
          <ul className="list-disc list-inside text-gray-300 ml-4">
            {catedra.tareas.map((tarea) => (
              <li key={tarea.id} className="mb-2">
                <span className="font-semibold text-lg">{tarea.titulo}:</span> {stripHtmlTags(tarea.descripcion)} (Puntos posibles: {tarea.puntos_posibles})
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400">No hay tareas asignadas para esta cátedra.</p>
        )}
      </section>

      {/* Alumnos, Asistencia y Calificación Final */}
      <section className="mb-8">
        <AlumnosTable catedraId={id} />
      </section>
    </div>
  );
}

export default PublicCatedraView;
