import React, { useState, useEffect } from 'react';


import { useParams } from 'react-router-dom';
import api from '../api';
import { toast } from 'react-toastify';
import AttendanceDaysSelector from './AttendanceDaysSelector';
import TaskSelector from './TaskSelector';
import EvaluationSelector from './EvaluationSelector';
import Modal from './Modal';

const FinalGradeConfigForm = ({ config, onClose, onSaveSuccess, catedraId, alumnoId }) => {

  const [titulo, setTitulo] = useState(config?.titulo || '');
  const [porcentajeMinimoAprobacion, setPorcentajeMinimoAprobacion] = useState(config?.porcentajeMinimoAprobacion || 60.0);
  const [selectedDays, setSelectedDays] = useState(config?.elementosConfigurados?.diasClaseIds || []);
  const [selectedTasks, setSelectedTasks] = useState(config?.elementosConfigurados?.tareaIds || []);
  const [selectedEvaluations, setSelectedEvaluations] = useState(config?.elementosConfigurados?.evaluacionIds || []);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmingCalculate, setIsConfirmingCalculate] = useState(false);

  useEffect(() => {
    if (config) {
      setTitulo(config.titulo);
      setPorcentajeMinimoAprobacion(config.porcentajeMinimoAprobacion);
      setSelectedDays(config.elementosConfigurados?.diasClaseIds || []);
      setSelectedTasks(config.elementosConfigurados?.tareaMaestraIds || []);
      setSelectedEvaluations(config.elementosConfigurados?.evaluacionIds || []);
    }
  }, [config]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const elementosConfigurados = {
        diasClaseIds: selectedDays,
        tareaIds: selectedTasks,
        evaluacionIds: selectedEvaluations,
      };

      const data = {
        titulo,
        porcentajeMinimoAprobacion: parseFloat(porcentajeMinimoAprobacion),
        elementosConfigurados,
      };

      if (config?.id) {
        // Es una actualización
        await api.put(`/docente/catedra/${catedraId}/calificacionFinal/config/${config.id}`, data);
        toast.success('Configuración de calificación final actualizada exitosamente.');
      } else {
        // Es una nueva creación
        await api.post(`/docente/catedra/${catedraId}/calificacionFinal/config`, data);
        toast.success('Configuración de calificación final creada exitosamente.');
      }
      onSaveSuccess();
      onClose();
    } catch (error) {
      console.error('Error al guardar la configuración de calificación final:', error);
      toast.error('Error al guardar la configuración.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCalculateFinalGrades = async () => {
    setIsConfirmingCalculate(false);
    setIsLoading(true);
    try {
      await api.post(`/docente/catedra/${catedraId}/calificacionFinal/calcular`, {
        calificacionFinalConfigId: config.id,
        ...(alumnoId && { alumnoId: parseInt(alumnoId) }),
      });
      toast.success('Calificaciones finales calculadas y guardadas.');
      onSaveSuccess();
    } catch (error) {
      console.error('Error al calcular calificaciones finales:', error);
      toast.error('Error al calcular las calificaciones finales.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">{config?.id ? 'Editar Configuración' : 'Crear Nueva Configuración'} de Calificación Final</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="titulo" className="block text-gray-700 text-sm font-bold mb-2">Título:</label>
          <input
            type="text"
            id="titulo"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="porcentajeMinimoAprobacion" className="block text-gray-700 text-sm font-bold mb-2">Porcentaje Mínimo de Aprobación (%):</label>
          <input
            type="number"
            id="porcentajeMinimoAprobacion"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={porcentajeMinimoAprobacion}
            onChange={(e) => setPorcentajeMinimoAprobacion(e.target.value)}
            min="0"
            max="100"
            step="0.1"
            required
          />
        </div>

        <AttendanceDaysSelector catedraId={catedraId} alumnoId={alumnoId} onDaysChange={setSelectedDays} initialSelectedDays={selectedDays} />
        <TaskSelector catedraId={catedraId} alumnoId={alumnoId} onTasksChange={setSelectedTasks} initialSelectedTasks={selectedTasks} />
        <EvaluationSelector catedraId={catedraId} alumnoId={alumnoId} onEvaluationsChange={setSelectedEvaluations} initialSelectedEvaluations={selectedEvaluations} />

        <div className="flex items-center justify-between mt-6">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={isLoading}
          >
            {isLoading ? 'Guardando...' : 'Guardar Configuración'}
          </button>
          {config?.id && (
            <button
              type="button"
              onClick={() => setIsConfirmingCalculate(true)}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-4"
              disabled={isLoading}
            >
              {isLoading ? 'Calculando...' : 'Calcular Calificaciones Finales'}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-4"
            disabled={isLoading}
          >
            Cancelar
          </button>
        </div>
      </form>

      <Modal
        isOpen={isConfirmingCalculate}
        onClose={() => setIsConfirmingCalculate(false)}
        title="Confirmar Cálculo de Calificaciones"
      >
        <p>¿Estás seguro de que deseas calcular las calificaciones finales con esta configuración? Esto actualizará las calificaciones existentes o creará nuevas.</p>
        <div className="flex justify-end mt-4">
          <button
            onClick={handleCalculateFinalGrades}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2"
          >
            Confirmar
          </button>
          <button
            onClick={() => setIsConfirmingCalculate(false)}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            Cancelar
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default FinalGradeConfigForm;
