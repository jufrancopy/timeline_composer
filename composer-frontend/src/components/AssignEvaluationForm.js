import React, { useState, useEffect } from 'react';
import api from '../api';
import Swal from 'sweetalert2';
import { Target, UserCheck, Send, Loader, Calendar } from 'lucide-react';

function AssignEvaluationForm({ catedraId, onEvaluationAssigned, onCancel, initialEvaluationId = null }) {
  const [evaluations, setEvaluations] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedEvaluationId, setSelectedEvaluationId] = useState(initialEvaluationId || '');
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [fechaLimite, setFechaLimite] = useState(''); // New state for deadline
  const [loadingEvaluations, setLoadingEvaluations] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInitialData = async () => {
      // Fetch master evaluations
      try {
        setLoadingEvaluations(true);
        const evaluationsResponse = await api.getDocenteEvaluacionesMaestras(catedraId);
        setEvaluations(evaluationsResponse.data);
        // Pre-select the initialEvaluationId if provided
        if (initialEvaluationId) {
          setSelectedEvaluationId(initialEvaluationId);
        }
      } catch (err) {
        console.error("Error fetching evaluations:", err);
        setError("Error al cargar las evaluaciones.");
      } finally {
        setLoadingEvaluations(false);
      }

      // Fetch students
      try {
        setLoadingStudents(true);
        const studentsResponse = await api.getDocenteCatedra(catedraId);
        setStudents(studentsResponse.data.alumnos || []);
      } catch (err) {
        console.error("Error fetching students:", err);
        setError(prev => prev + " Error al cargar los alumnos.");
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchInitialData();
  }, [catedraId, initialEvaluationId]);

  const handleStudentSelection = (studentId) => {
    setSelectedStudentIds(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAllStudents = () => {
    if (selectedStudentIds.length === students.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(students.map(s => s.alumnoId));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!selectedEvaluationId || selectedStudentIds.length === 0) {
      setError('Por favor, selecciona una evaluación y al menos un alumno.');
      setIsSubmitting(false);
      return;
    }

    try {
      await api.assignEvaluationToAlumnos(catedraId, selectedEvaluationId, { alumnoIds: selectedStudentIds, fecha_limite: fechaLimite || null });
      Swal.fire(
        '¡Evaluación Asignada!',
        'La evaluación ha sido asignada a los alumnos seleccionados y se han enviado las notificaciones.',
        'success'
      );
      onEvaluationAssigned();
    } catch (err) {
      console.error('Error assigning evaluation:', err);
      Swal.fire(
        'Error',
        err.response?.data?.error || 'Error al asignar la evaluación.',
        'error'
      );
      setError(err.response?.data?.error || 'Error al asignar la evaluación.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedEvaluation = evaluations.find(evaluacion => evaluacion.id === parseInt(selectedEvaluationId));

  return (
    <div className="bg-slate-800/50 backdrop-blur-lg p-6 rounded-lg shadow-xl border border-slate-700/50 text-white">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="bg-red-500/20 text-red-300 border border-red-500/30 p-3 rounded-md">{error}</div>}

        {/* Evaluation Selection */}
        <div>
          <label htmlFor="evaluation" className="block text-sm font-medium text-slate-300 mb-2">
            <Target size={16} className="inline-block mr-2 text-purple-400" />
            Seleccionar Evaluación:
          </label>
          {loadingEvaluations ? (
            <div className="text-slate-400">Cargando evaluaciones...</div>
          ) : evaluations.length === 0 ? (
            <div className="text-slate-400">No hay evaluaciones maestras disponibles para asignar. Crea una evaluación primero.</div>
          ) : (
            <select
              id="evaluation"
              className="w-full p-3 bg-slate-700/70 border border-slate-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-slate-100"
              value={selectedEvaluationId}
              onChange={(e) => setSelectedEvaluationId(parseInt(e.target.value, 10))}
              disabled={isSubmitting || initialEvaluationId !== null}
            >
              {initialEvaluationId ? (
                <option value={selectedEvaluation?.id}>{selectedEvaluation?.titulo}</option>
              ) : (
                <option value="">-- Selecciona una evaluación --</option>
              )}
              {!initialEvaluationId && evaluations.map((evaluacion) => (
                <option key={evaluacion.id} value={evaluacion.id}>
                  {evaluacion.titulo}
                </option>
              ))}
            </select>
          )}
          {selectedEvaluation && (
            <p className="text-slate-400 text-sm mt-2">Preguntas: {selectedEvaluation._count?.preguntas || 'N/A'}</p>
          )}
        </div>

        {/* Fecha Límite */}
        <div>
          <label htmlFor="fechaLimite" className="block text-sm font-medium text-slate-300 mb-2">
            <Calendar size={16} className="inline-block mr-2 text-yellow-400" />
            Fecha Límite (Opcional):
          </label>
          <input
            type="date"
            id="fechaLimite"
            value={fechaLimite}
            onChange={(e) => setFechaLimite(e.target.value)}
            className="w-full p-3 bg-slate-700/70 border border-slate-600 rounded-lg focus:ring-yellow-500 focus:border-yellow-500 text-slate-100"
            disabled={isSubmitting}
          />
        </div>

        {/* Student Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            <UserCheck size={16} className="inline-block mr-2 text-blue-400" />
            Alumnos a asignar:
          </label>
          {loadingStudents ? (
            <div className="text-slate-400">Cargando alumnos...</div>
          ) : students.length === 0 ? (
            <div className="text-slate-400">No hay alumnos inscritos en esta cátedra.</div>
          ) : (
            <div className="bg-slate-700/70 border border-slate-600 rounded-lg p-4 max-h-60 overflow-y-auto">
              <div className="mb-3">
                <label className="inline-flex items-center text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-blue-500 rounded border-slate-500 bg-slate-600 focus:ring-blue-500"
                    checked={selectedStudentIds.length === students.length && students.length > 0}
                    onChange={handleSelectAllStudents}
                    disabled={isSubmitting}
                  />
                  <span className="ml-3 text-sm font-medium">Seleccionar todos</span>
                </label>
              </div>
              <div className="space-y-2">
                {students.map((inscripcion) => {
                  const alumno = inscripcion.alumno || inscripcion.composer;
                  if (!alumno) return null; // Should not happen if data is consistent
                  const studentId = inscripcion.alumnoId;
                  const studentName = `${alumno.nombre || alumno.first_name} ${alumno.apellido || alumno.last_name}`;
                  return (
                    <label key={studentId} className="inline-flex items-center text-slate-200 cursor-pointer w-full">
                      <input
                        type="checkbox"
                        className="form-checkbox h-5 w-5 text-purple-500 rounded border-slate-500 bg-slate-600 focus:ring-purple-500"
                        checked={selectedStudentIds.includes(studentId)}
                        onChange={() => handleStudentSelection(studentId)}
                        disabled={isSubmitting}
                      />
                      <span className="ml-3 text-sm font-medium">{studentName}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 rounded-lg text-slate-300 border border-slate-600 hover:border-slate-500 hover:text-white transition-colors duration-300"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="group inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium transition-all duration-300 shadow-lg shadow-blue-900/25 hover:shadow-xl hover:shadow-blue-900/40"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader size={20} className="animate-spin" />
            ) : (
              <Send size={20} className="group-hover:translate-x-1 transition-transform duration-300" />
            )}
            <span>{isSubmitting ? 'Asignando...' : 'Asignar Evaluación'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default AssignEvaluationForm;