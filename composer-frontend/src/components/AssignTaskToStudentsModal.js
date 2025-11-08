import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import api from '../api';
import Modal from './Modal';

const AssignTaskToStudentsModal = ({ catedraId, task, students, onTaskAssigned, onClose, isOpen }) => {
  const [selectedAlumnoIds, setSelectedAlumnoIds] = useState([]);
  const [loadingAssignment, setLoadingAssignment] = useState(false);

  // Efecto para cargar alumnos ya asignados cuando el modal se abre o la tarea/cátedra cambia
  useEffect(() => {
    const fetchAssignedStudents = async () => {
      if (isOpen && catedraId && task?.id) {
        try {
          const response = await api.getAssignedTaskStudents(catedraId, task.id);
          setSelectedAlumnoIds(response.data.assignedAlumnoIds);
        } catch (error) {
          toast.error('Error al cargar alumnos asignados.');
          console.error('Error fetching assigned task students:', error);
        }
      } else if (!isOpen) {
        // Resetear el estado cuando el modal se cierra
        setSelectedAlumnoIds([]);
      }
    };

    fetchAssignedStudents();
  }, [isOpen, catedraId, task?.id]);

  const alumnosInscritos = useMemo(() => {
    return (students || [])
      .filter(alumno => alumno !== null)
      .map(alumno => {
        // Determinar si es un alumno o un composer directamente del objeto alumno
        const isComposer = alumno.student_first_name !== undefined; 
        const id = alumno.id;
        const nombreCompleto = isComposer
          ? `${alumno.student_first_name || alumno.first_name || ''} ${alumno.student_last_name || alumno.last_name || ''} (Contribuyente)`
          : `${alumno.nombre} ${alumno.apellido}`;
        return { id, nombreCompleto, isComposer };
      });
  }, [students]);

  const handleCheckboxChange = (alumnoId) => {
    setSelectedAlumnoIds(prev =>
      prev.includes(alumnoId)
        ? prev.filter(id => id !== alumnoId)
        : [...prev, alumnoId]
    );
  };

  const handleAssignAll = () => {
    setSelectedAlumnoIds(alumnosInscritos.map(alumno => alumno.id));
  };

  const handleUnassignAll = () => {
    setSelectedAlumnoIds([]);
  };

  const handleAssignSubmit = async () => {
    if (selectedAlumnoIds.length === 0) {
      toast.error('Debes seleccionar al menos un alumno para asignar la tarea.');
      return;
    }

    setLoadingAssignment(true);
    try {
      await api.assignTareaToAlumnos(catedraId, task.id, { alumnoIds: selectedAlumnoIds });
      toast.success('Tarea asignada exitosamente a los alumnos seleccionados!');
      onTaskAssigned();
      onClose(); // Cerrar el modal después de una asignación exitosa
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al asignar la tarea.');
    } finally {
      setLoadingAssignment(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen} // Ahora usa la prop isOpen recibida del padre
      onClose={onClose}
      title="Asignar Tarea a Alumnos"
      showSubmitButton={false}
      showCancelButton={false}
    >
      <div className="p-4">
        <p className="mb-4 text-gray-300">Selecciona los alumnos a los que deseas asignar esta tarea:</p>
        <div className="flex justify-end mb-4 space-x-2">
          <button onClick={handleAssignAll} className="px-3 py-1 bg-purple-600 rounded text-sm hover:bg-purple-700">Seleccionar Todos</button>
          <button onClick={handleUnassignAll} className="px-3 py-1 bg-gray-600 rounded text-sm hover:bg-gray-700">Deseleccionar Todos</button>
        </div>
        <div className="max-h-60 overflow-y-auto custom-scrollbar border border-gray-700 rounded-md p-3">
          {alumnosInscritos.length === 0 ? (
            <p className="text-gray-400">No hay alumnos inscritos en esta cátedra.</p>
          ) : (
            <ul className="space-y-2">
              {alumnosInscritos.map(alumno => (
                <li key={alumno.id} className="flex items-center bg-gray-800/50 p-2 rounded-md">
                  <input
                    type="checkbox"
                    id={`alumno-${alumno.id}`}
                    checked={selectedAlumnoIds.includes(alumno.id)}
                    onChange={() => handleCheckboxChange(alumno.id)}
                    className="form-checkbox h-5 w-5 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                  />
                  <label htmlFor={`alumno-${alumno.id}`} className="ml-3 text-gray-200 cursor-pointer">
                    {alumno.nombreCompleto}
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={handleAssignSubmit}
            disabled={loadingAssignment}
            className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingAssignment ? 'Asignando...' : 'Asignar Tarea'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AssignTaskToStudentsModal;
