import React, { useState, useEffect } from 'react';
import api from '../api';
import Swal from 'sweetalert2';
import { Target, UserCheck, Send, Loader } from 'lucide-react';

function AssignTareaForm({ catedraId, onTareaAssigned, onCancel, userType, initialTaskId = null }) {
  const [tasks, setTasks] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState(initialTaskId || '');
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInitialData = async () => {
      // Fetch tasks only if not in initialTaskId mode
      if (!initialTaskId) {
        try {
          setLoadingTasks(true);
          const tasksResponse = await api.getDocenteTareasMaestras(catedraId);
          setTasks(tasksResponse.data);
        } catch (err) {
          console.error("Error fetching tasks:", err);
          setError("Error al cargar las tareas.");
        } finally {
          setLoadingTasks(false);
        }
      } else {
        // If initialTaskId is provided, fetch only that specific task to display its title and pre-select students
        const fetchSpecificTaskAndAssignments = async () => {
          try {
            setLoadingTasks(true);
            const response = await api.getTareaMaestraById(catedraId, initialTaskId);
            setTasks([response.data]); // Set only the specific task
            const assignedStudentIds = (response.data.asignaciones || []).map(a => a.alumnoId);
            setSelectedStudentIds(assignedStudentIds);
          } catch (err) {
            console.error("Error fetching specific task and assignments:", err);
            setError("Error al cargar la tarea especificada y sus asignaciones.");
          } finally {
            setLoadingTasks(false);
          }
        };
        fetchSpecificTaskAndAssignments();
      }

      // Fetch students
      try {
        setLoadingStudents(true);
        const studentsResponse = await api.getDocenteCatedra(catedraId);
        setStudents(studentsResponse.data.alumnos || []);
      } catch (err) {
        console.error("Error fetching students:", err);
        setError("Error al cargar los alumnos.");
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchInitialData();
  }, [catedraId]);

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

    if (!selectedTaskId || selectedStudentIds.length === 0) {
      setError('Por favor, selecciona una tarea y al menos un alumno.');
      setIsSubmitting(false);
      return;
    }

    try {
      await api.assignTareaToAlumnos(catedraId, selectedTaskId, { alumnoIds: selectedStudentIds });
      Swal.fire(
        '¡Tarea Asignada!',
        'La tarea ha sido asignada a los alumnos seleccionados.',
        'success'
      );
      onTareaAssigned();
    } catch (err) {
      console.error('Error assigning task:', err);
      Swal.fire(
        'Error',
        err.response?.data?.message || 'Error al asignar la tarea.',
        'error'
      );
      setError(err.response?.data?.message || 'Error al asignar la tarea.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedTask = tasks.find(task => task.id === selectedTaskId);

  return (
    <div className="bg-slate-800/50 backdrop-blur-lg p-6 rounded-lg shadow-xl border border-slate-700/50 text-white">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="bg-red-500/20 text-red-300 border border-red-500/30 p-3 rounded-md">{error}</div>}

        {/* Task Selection */}
        <div>
          <label htmlFor="task" className="block text-sm font-medium text-slate-300 mb-2">
            <Target size={16} className="inline-block mr-2 text-purple-400" />
            Seleccionar Tarea:
          </label>
          {loadingTasks ? (
            <div className="text-slate-400">Cargando tareas...</div>
          ) : tasks.length === 0 ? (
            <div className="text-slate-400">No hay tareas maestras disponibles para asignar. Crea una tarea primero.</div>
          ) : (
            <select
              id="task"
              className="w-full p-3 bg-slate-700/70 border border-slate-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-slate-100"
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              disabled={isSubmitting || initialTaskId !== null}
            >
              {initialTaskId ? (
                <option value={selectedTask?.id}>{selectedTask?.titulo}</option>
              ) : (
                <option value="">-- Selecciona una tarea --</option>
              )}
              {!initialTaskId && tasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.titulo}
                </option>
              ))}
            </select>
          )}
          {selectedTask && (
            <p className="text-slate-400 text-sm mt-2">Puntos posibles: {selectedTask.puntos_posibles || 'N/A'}</p>
          )}
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
            <span>{isSubmitting ? 'Asignando...' : 'Asignar Tarea'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default AssignTareaForm;