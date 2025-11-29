import React, { useState, useEffect } from 'react';
import api from '../api';
import { toast } from 'react-toastify';

const TaskSelector = ({ catedraId, alumnoId, onTasksChange, initialSelectedTasks }) => {
  const [availableTasks, setAvailableTasks] = useState([]);
  const [selectedTasks, setSelectedTasks] = useState(initialSelectedTasks || []);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialSelectedTasks) {
      setSelectedTasks(initialSelectedTasks);
    }
  }, [initialSelectedTasks]);

  useEffect(() => {
    const fetchTasksAndAssigned = async () => {
      if (!catedraId) return;
      setIsLoading(true);
      try {
        const response = await api.get(`/docente/catedra/${catedraId}/tareas`);
        setAvailableTasks(response.data);

        // Si estamos editando una configuración existente, initialSelectedTasks tendrá datos. Priorizarlos.
        if (initialSelectedTasks && initialSelectedTasks.length > 0) {
          setSelectedTasks(initialSelectedTasks);
          onTasksChange(initialSelectedTasks);
        } else if (alumnoId) {
          // Si no hay configuración inicial, pero hay un alumnoId, cargar sus tareas asignadas
          const assignedTasksResponse = await api.get(`/docente/catedra/${catedraId}/alumno/${alumnoId}/tareasAsignadas`);
          const assignedTaskIds = assignedTasksResponse.data;
          setSelectedTasks(assignedTaskIds);
          onTasksChange(assignedTaskIds);
        } else {
          // Si no hay configuración inicial ni alumnoId, dejar vacío
          setSelectedTasks([]);
          onTasksChange([]);
        }

      } catch (error) {
        console.error('Error al obtener tareas o tareas asignadas del alumno:', error);
        toast.error('Error al cargar las tareas o tareas asignadas.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasksAndAssigned();
  }, [catedraId, alumnoId]);

  const handleTaskToggle = (taskId) => {
    const newSelectedTasks = selectedTasks.includes(taskId)
      ? selectedTasks.filter((id) => id !== taskId)
      : [...selectedTasks, taskId];
    setSelectedTasks(newSelectedTasks);
    onTasksChange(newSelectedTasks);
  };

  const totalPossiblePoints = availableTasks.reduce((sum, task) => {
    if (selectedTasks.includes(task.id)) {
      return sum + task.puntos_posibles;
    }
    return sum;
  }, 0);

  return (
    <div className="mb-6 p-4 border rounded-lg shadow-sm bg-gray-50">
      <h3 className="text-xl font-semibold mb-3 text-gray-800">2. Selección de Tareas ({selectedTasks.length} tareas seleccionadas)</h3>
      {isLoading ? (
        <p className="text-center text-gray-600">Cargando tareas...</p>
      ) : ( 
        <div className="space-y-2">
          {availableTasks.length > 0 ? (
            availableTasks.map((task) => (
              <div key={task.id} className="flex items-center p-2 border rounded-md bg-white shadow-sm">
                <input
                  type="checkbox"
                  id={`task-${task.id}`}
                  checked={selectedTasks.includes(task.id)}
                  onChange={() => handleTaskToggle(task.id)}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <label htmlFor={`task-${task.id}`} className="ml-3 text-gray-700 flex-1">
                  {task.titulo} ({task.puntos_posibles} puntos posibles)
                </label>
              </div>
            ))
          ) : (
            <p className="text-gray-600">No hay tareas disponibles para esta cátedra.</p>
          )}
        </div>
      )}
      <div className="mt-4 p-3 bg-blue-100 border border-blue-200 rounded-md text-blue-800">
        Puntos posibles totales de tareas seleccionadas: <span className="font-bold">{totalPossiblePoints}</span>
      </div>
    </div>
  );
};

export default TaskSelector;
