import React, { useState, useEffect } from 'react';
import api from '../api';
import { toast } from 'react-toastify';

const EvaluationSelector = ({ catedraId, alumnoId, onEvaluationsChange, initialSelectedEvaluations }) => {
  const [availableEvaluations, setAvailableEvaluations] = useState([]);
  const [selectedEvaluations, setSelectedEvaluations] = useState(initialSelectedEvaluations || []);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialSelectedEvaluations) {
      setSelectedEvaluations(initialSelectedEvaluations);
    }
  }, [initialSelectedEvaluations]);

  useEffect(() => {
    const fetchEvaluationsAndAssigned = async () => {
      if (!catedraId) return;
      setIsLoading(true);
      try {
        const response = await api.get(`/docente/catedra/${catedraId}/evaluaciones`);
        setAvailableEvaluations(response.data);

        // Si estamos editando una configuración existente, initialSelectedEvaluations tendrá datos. Priorizarlos.
        if (initialSelectedEvaluations && initialSelectedEvaluations.length > 0) {
          setSelectedEvaluations(initialSelectedEvaluations);
          onEvaluationsChange(initialSelectedEvaluations);
        } else if (alumnoId) {
          // Si no hay configuración inicial, pero hay un alumnoId, cargar sus evaluaciones asignadas
          const assignedEvaluationsResponse = await api.get(`/docente/catedra/${catedraId}/alumno/${alumnoId}/evaluacionesAsignadas`);
          const assignedEvaluationIds = assignedEvaluationsResponse.data;
          setSelectedEvaluations(assignedEvaluationIds);
          onEvaluationsChange(assignedEvaluationIds);
        } else {
          // Si no hay configuración inicial ni alumnoId, dejar vacío
          setSelectedEvaluations([]);
          onEvaluationsChange([]);
        }

      } catch (error) {
        console.error('Error al obtener evaluaciones o evaluaciones asignadas del alumno:', error);
        toast.error('Error al cargar las evaluaciones o evaluaciones asignadas.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvaluationsAndAssigned();
  }, [catedraId, alumnoId]);

  const handleEvaluationToggle = (evaluationId) => {
    const newSelectedEvaluations = selectedEvaluations.includes(evaluationId)
      ? selectedEvaluations.filter((id) => id !== evaluationId)
      : [...selectedEvaluations, evaluationId];
    setSelectedEvaluations(newSelectedEvaluations);
    onEvaluationsChange(newSelectedEvaluations);
  };

  return (
    <div className="mb-6 p-4 border rounded-lg shadow-sm bg-gray-50">
      <h3 className="text-xl font-semibold mb-3 text-gray-800">3. Selección de Evaluaciones ({selectedEvaluations.length} evaluaciones seleccionadas)</h3>
      {isLoading ? (
        <p className="text-center text-gray-600">Cargando evaluaciones...</p>
      ) : (
        <div className="space-y-2">
          {availableEvaluations.length > 0 ? (
            availableEvaluations.map((evaluation) => (
              <div key={evaluation.id} className="flex items-center p-2 border rounded-md bg-white shadow-sm">
                <input
                  type="checkbox"
                  id={`evaluation-${evaluation.id}`}
                  checked={selectedEvaluations.includes(evaluation.id)}
                  onChange={() => handleEvaluationToggle(evaluation.id)}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <label htmlFor={`evaluation-${evaluation.id}`} className="ml-3 text-gray-700 flex-1">
                  {evaluation.titulo} ({evaluation._count.Pregunta} puntos posibles)
                </label>
              </div>
            ))
          ) : (
            <p className="text-gray-600">No hay evaluaciones disponibles para esta cátedra.</p>
          )}
        </div>
      )}
      <div className="mt-4 p-3 bg-blue-100 border border-blue-200 rounded-md text-blue-800">
        Puntos posibles totales de evaluaciones seleccionadas: <span className="font-bold">{
          availableEvaluations.reduce((sum, evaluation) => {
            if (selectedEvaluations.includes(evaluation.id)) {
              return sum + (evaluation._count.Pregunta || 0);
            }
            return sum;
          }, 0)
        }</span>
      </div>
    </div>
  );
};

export default EvaluationSelector;
