import React, { useState, useEffect } from 'react';
import api from '../api';
import { toast } from 'react-toastify';

const AlumnoFinalGradeDisplay = ({ backendResults, porcentajeMinimoAprobacion, selectedAlumnoId, configId, catedraId, allowCalculation = false }) => {
  const [displayResults, setDisplayResults] = useState([]);
  const [isLoadingCalculation, setIsLoadingCalculation] = useState(false);
  const [expandedRows, setExpandedRows] = useState({});

  useEffect(() => {
    const results = backendResults || [];
    setDisplayResults(results);
    console.log('[AlumnoFinalGradeDisplay] Resultados para mostrar:', results);
  }, [backendResults, selectedAlumnoId]);

  const toggleRow = (alumnoId) => {
    setExpandedRows(prev => ({
      ...prev,
      [alumnoId]: !prev[alumnoId]
    }));
  };

  // handleCalculateForStudent no es necesario en la vista de alumno, se puede eliminar si nunca se usa.
  // Pero lo mantendré comentado por si acaso se decide habilitar una opción de recálculo manual para el alumno en el futuro.
  /*
  const handleCalculateForStudent = async () => {
    if (!configId || !catedraId || !selectedAlumnoId) {
      toast.error("Faltan datos para calcular la calificación final del alumno.");
      return;
    }
    setIsLoadingCalculation(true);
    try {
      await api.post(`/docente/catedra/${catedraId}/calificacionFinal/calcular`, {
        configId: configId,
        alumnoId: parseInt(selectedAlumnoId),
      });
      toast.success("Calificación final del alumno recalculada exitosamente!");
    } catch (error) {
      console.error("Error al recalcular calificación final del alumno:", error);
      toast.error("Error al recalcular la calificación final del alumno.");
    } finally {
      setIsLoadingCalculation(false);
    }
  };
  */

  if (!displayResults || displayResults.length === 0) {
    return (
      <div className="text-center text-gray-600">
        <p>No hay calificaciones finales para mostrar.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white shadow-md rounded-lg p-4">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Resultados de Calificación Final</h3>
      {displayResults.length > 0 && (
        <div className="bg-purple-50 border-l-4 border-purple-400 text-purple-700 p-4 mb-4" role="alert">
          <p className="font-bold">Calificación General:</p>
          <p className="text-sm">
            <span className="font-semibold">{displayResults[0].escalaNota}</span>
            <span> ({displayResults[0].estadoEscala})</span>
          </p>
        </div>
      )}
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Alumno
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Escala
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nota Final
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {/* Icono de expansión */}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {displayResults.map((result) => (
            <React.Fragment key={result.alumnoId}>
              <tr
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => toggleRow(result.alumnoId)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{result.Alumno.nombre} {result.Alumno.apellido}</div>
                  <div className="text-sm text-gray-500">{result.Alumno.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                    {result.escalaNota} ({result.estadoEscala})
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${result.notaFinal >= porcentajeMinimoAprobacion ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {result.notaFinal.toFixed(2)}%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${result.notaFinal >= porcentajeMinimoAprobacion ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {result.notaFinal >= porcentajeMinimoAprobacion ? 'Aprobado' : 'Reprobado'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {expandedRows[result.alumnoId] ? '▲' : '▼'}
                </td>
              </tr>
              {expandedRows[result.alumnoId] && (
                <tr className="bg-gray-50">
                  <td colSpan="5" className="px-6 py-4">
                    <div className="flex justify-around text-sm text-gray-700">
                      <div>
                        <strong>Asistencia:</strong> {result.puntosObtenidosAsistencia ?? 0} / {result.puntosPosiblesAsistencia ?? 0}
                      </div>
                      <div>
                        <strong>Tareas:</strong> {result.puntosObtenidosTareas ?? 0} / {result.puntosPosiblesTareas ?? 0}
                      </div>
                      <div>
                        <strong>Evaluaciones:</strong> {result.puntosObtenidosEvaluaciones ?? 0} / {result.puntosPosiblesEvaluaciones ?? 0}
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AlumnoFinalGradeDisplay;
