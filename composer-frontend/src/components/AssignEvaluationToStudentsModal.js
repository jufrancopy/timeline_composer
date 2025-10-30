import React, { useState, useMemo, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../api';
import Modal from './Modal';

const AssignEvaluationToStudentsModal = ({ catedraId, evaluation, students, onEvaluationAssigned, onClose, isOpen }) => {
  const [selectedAlumnoIds, setSelectedAlumnoIds] = useState([]);
  const [fechaEntrega, setFechaEntrega] = useState(''); 
  const [loadingAssignment, setLoadingAssignment] = useState(false);
  const [loadingInitialData, setLoadingInitialData] = useState(true); // New state for loading initial data

  // Reset selected students and date when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedAlumnoIds([]);
      setFechaEntrega('');
      setLoadingInitialData(true);
      const fetchAssignedStudents = async () => {
        try {
          const response = await api.getAssignedEvaluationStudents(catedraId, evaluation.id);
          setSelectedAlumnoIds(response.data.assignedAlumnoIds);
          setFechaEntrega(response.data.fecha_entrega || '');
        } catch (error) {
          toast.error('Error al cargar alumnos asignados previamente.');
          console.error('Error fetching assigned evaluation students:', error);
        } finally {
          setLoadingInitialData(false);
        }
      };
      fetchAssignedStudents();
    }
  }, [isOpen, catedraId, evaluation.id]);

  const alumnosInscritos = useMemo(() => {
    return (students || [])
      .filter(alumno => alumno !== null)
      .map(alumno => {
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
      toast.error('Debes seleccionar al menos un alumno para asignar la evaluación.');
      return;
    }
    if (!fechaEntrega) {
      toast.error('Debes seleccionar una fecha de entrega para la evaluación.');
      return;
    }

    setLoadingAssignment(true);
    try {
      await api.assignEvaluationToAlumnos(catedraId, evaluation.id, { alumnoIds: selectedAlumnoIds, fecha_entrega: fechaEntrega });
      toast.success('Evaluación asignada exitosamente a los alumnos seleccionados!');
      onEvaluationAssigned();
      onClose(); // Cerrar el modal después de una asignación exitosa
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al asignar la evaluación.');
    } finally {
      setLoadingAssignment(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen} // Ahora usa la prop isOpen recibida del padre
      onClose={onClose}
      title={`Asignar Evaluación: ${evaluation?.titulo || 'Sin Título'}`}
      showSubmitButton={false}
      showCancelButton={false}
    >
      <div className="p-4">
        <p className="mb-4 text-gray-300">Selecciona los alumnos a los que deseas asignar esta evaluación:</p>

        {loadingInitialData ? (
          <p className="text-gray-400">Cargando asignaciones anteriores...</p>
        ) : (
          <div className="mb-4">
            <label htmlFor="fechaEntrega" className="block text-sm font-medium text-gray-400 mb-2">Fecha de Entrega</label>
            <input
              type="date"
              id="fechaEntrega"
              value={fechaEntrega}
              onChange={(e) => setFechaEntrega(e.target.value)}
              className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        )}

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
            {loadingAssignment ? 'Asignando...' : 'Asignar Evaluación'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AssignEvaluationToStudentsModal;