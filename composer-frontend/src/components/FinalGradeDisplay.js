import React, { useState, useEffect } from 'react';
import api from '../api';
import { toast } from 'react-toastify';

const FinalGradeDisplay = ({ results: backendResults, porcentajeMinimoAprobacion, selectedAlumnoId, configId, catedraId, allowCalculation = false }) => {
  const [displayResults, setDisplayResults] = useState([]);
  const [isLoadingCalculation, setIsLoadingCalculation] = useState(false);

  useEffect(() => {
    // La prop 'backendResults' ahora contiene directamente el array de resultados
    const results = backendResults || [];
    if (selectedAlumnoId) {
      setDisplayResults(results.filter(r => r.Alumno.id === parseInt(selectedAlumnoId)));
    } else {
      setDisplayResults(results);
    }
  }, [backendResults, selectedAlumnoId]);


  const handleCalculateForStudent = async () => {
    if (!configId || !catedraId || !selectedAlumnoId) {
      toast.error("Faltan datos para calcular la calificación final del alumno.");
      return;
    }
    setIsLoadingCalculation(true);
    try {
      await api.post(`/docente/catedra/${catedraId}/calificacionFinal/calcular`, {
        configId: configId, // ← CAMBIA AQUÍ: "configId" en lugar de "calificacionFinalConfigId"
        alumnoId: parseInt(selectedAlumnoId),
      });
      toast.success("Calificación final del alumno recalculada exitosamente!");
      // Opcional: Volver a cargar los resultados después de la recalculación
      // Esto requeriría pasar una función `onRecalculate` desde `DocenteFinalGradesPage`
    } catch (error) {
      console.error("Error al recalcular calificación final del alumno:", error);
      toast.error("Error al recalcular la calificación final del alumno.");
    } finally {
      setIsLoadingCalculation(false);
    }
  };

  if (!displayResults || displayResults.length === 0) {
    return (
      <div className="text-center text-gray-600">
        <p>No hay calificaciones finales para mostrar.</p>
        {allowCalculation && selectedAlumnoId && configId && catedraId && (
          <button
            onClick={handleCalculateForStudent}
            disabled={isLoadingCalculation}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md shadow-md"
          >
            {isLoadingCalculation ? "Calculando..." : "Calcular Calificación para este Alumno"}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white shadow-md rounded-lg p-4">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Resultados de Calificación Final</h3>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Alumno
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Asistencia
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tareas
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Evaluaciones
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
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {displayResults.map((result) => (
            <tr key={result.alumnoId}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{result.Alumno.nombre} {result.Alumno.apellido}</div>
                <div className="text-sm text-gray-500">{result.Alumno.email}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                  {result.puntosObtenidosAsistencia ?? 0} / {result.puntosPosiblesAsistencia ?? 0}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                  {result.puntosObtenidosTareas ?? 0} / {result.puntosPosiblesTareas ?? 0}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                  {result.puntosObtenidosEvaluaciones ?? 0} / {result.puntosPosiblesEvaluaciones ?? 0}
                </span>
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FinalGradeDisplay;
