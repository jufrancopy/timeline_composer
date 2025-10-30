import React, { useState, useEffect, useCallback } from 'react';
import Modal from './Modal';
import TareaForm from './TareaForm';
import EvaluationForm from './EvaluationForm';
import TaskTable from './TaskTable';
import EvaluationCard from './EvaluationCard'; // Or a similar component for listing evaluations
import { ArrowLeft, Plus, FileText, Brain } from 'lucide-react';
import api from '../api';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';

const UnidadContentManagement = ({ catedraId, planDeClasesId, unidadId, unidadPeriodo, onBackToUnidades, onViewTask, onAssignTask, onAssignEvaluation }) => {
  const [loading, setLoading] = useState(true);
  const [tareas, setTareas] = useState([]);
  const [evaluaciones, setEvaluaciones] = useState([]);

  const [isTareaModalOpen, setIsTareaModalOpen] = useState(false);
  const [isEditTareaModalOpen, setIsEditTareaModalOpen] = useState(false);
  const [editingTarea, setEditingTarea] = useState(null);
  const [isTaskDetailModalOpen, setIsTaskDetailModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const [isEvaluationModalOpen, setIsEvaluationModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchContent = useCallback(async () => {
    setLoading(true);
    try {
      const tareasResponse = await api.getTareasMaestrasPorUnidad(catedraId, unidadId);
      setTareas(tareasResponse.data);

      const evaluacionesResponse = await api.getEvaluacionesPorUnidad(catedraId, unidadId);
      setEvaluaciones(evaluacionesResponse.data);
    } catch (error) {
      toast.error('Error al cargar el contenido de la unidad.');
      console.error('Error fetching unidad content:', error);
    } finally {
      setLoading(false);
    }
  }, [catedraId, unidadId]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const handleTareaCreated = () => {
    fetchContent();
    setIsTareaModalOpen(false);
    toast.success('Tarea creada exitosamente.');
  };

  const handleTareaUpdated = () => {
    fetchContent();
    setIsEditTareaModalOpen(false);
    setEditingTarea(null);
    toast.success('Tarea actualizada exitosamente.');
  };

  const handleDeleteTarea = async (tareaId) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "¡No podrás revertir esto!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, ¡eliminarla!',
      cancelButtonText: 'Cancelar'
    });
    if (result.isConfirmed) {
      try {
        await api.deleteTareaForDocente(catedraId, tareaId);
        Swal.fire('¡Eliminada!', 'La tarea ha sido eliminada.', 'success');
        fetchContent();
      } catch (error) {
        Swal.fire('Error', error.response?.data?.error || 'Error al eliminar la tarea.', 'error');
      }
    }
  };

  const handleEditTarea = (tarea) => {
    setEditingTarea(tarea);
    setIsEditTareaModalOpen(true);
  };

  const openTaskDetailModal = (task) => {
    setSelectedTask(task);
    setIsTaskDetailModalOpen(true);
  };

  const handleGenerateEvaluation = async (topic, subject, numberOfQuestions, numberOfOptions, selectedUnidadId) => {
    setIsGenerating(true);
    try {
      await api.generateDocenteEvaluation(catedraId, { topic, subject, numberOfQuestions, numberOfOptions, unidadPlanId: selectedUnidadId });
      Swal.fire({
        title: '¡Éxito!',
        text: 'La evaluación ha sido generada y guardada correctamente.',
        icon: 'success',
        timer: 3000,
        showConfirmButton: false
      });
      setIsEvaluationModalOpen(false);
      fetchContent();
    } catch (error) {
      let errorMessage = error.response?.data?.error || 'No se pudo generar la evaluación.';
      if (errorMessage.includes('The model is overloaded')) {
        errorMessage = 'El modelo de IA está sobrecargado. Por favor, inténtalo de nuevo más tarde.';
      }
      Swal.fire('Error', errorMessage, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEvaluationUpdated = async (evaluationId, updatedEvaluationData) => {
    try {
      await api.updateDocenteEvaluation(evaluationId, updatedEvaluationData);
      toast.success('Evaluación actualizada exitosamente.');
      fetchContent();
      // Additional logic if needed, e.g., closing a modal
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al actualizar la evaluación.');
      console.error('Error al actualizar la evaluación:', error);
    }
  };

  const handleDeleteEvaluation = async (evaluationId) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "¡Esta acción eliminará la evaluación y todas sus preguntas/opciones asociadas!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, ¡eliminarla!',
      cancelButtonText: 'Cancelar'
    });
    if (result.isConfirmed) {
      try {
        await api.deleteDocenteEvaluation(catedraId, evaluationId);
        Swal.fire('¡Eliminada!', 'La evaluación ha sido eliminada.', 'success');
        fetchContent();
      } catch (error) {
        Swal.fire('Error', error.response?.data?.error || 'Error al eliminar la evaluación.', 'error');
      }
    }
  };

  // Helper functions for TaskTable (assuming they are still needed or moved here)
  const getStatusColor = (taskOrEstado) => {
    if (typeof taskOrEstado === 'object' && taskOrEstado !== null) {
      return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
    }
    switch (taskOrEstado) {
      case 'ASIGNADA': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'ENTREGADA': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'CALIFICADA': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'VENCIDA': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getTaskStatusDisplay = (taskOrEstado) => {
    if (typeof taskOrEstado === 'object' && taskOrEstado !== null) {
      if (taskOrEstado.TareaAsignacion && taskOrEstado.TareaAsignacion.length > 0) {
        return 'Maestra (Asignada)';
      } else {
        return 'Maestra (Sin Asignar)';
      }
    }
    switch (taskOrEstado) {
      case 'ASIGNADA': return 'Asignada';
      case 'ENTREGADA': return 'Entregada';
      case 'CALIFICADA': return 'Calificada';
      case 'VENCIDA': return 'Vencida';
      default: return taskOrEstado;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 border-b border-slate-700/50 pb-6 mb-6">
        <button
          onClick={onBackToUnidades}
          className="group inline-flex items-center gap-2 text-slate-300 hover:text-white transition-all duration-300"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform duration-300" />
          <span className="font-medium">Volver a Unidades</span>
        </button>
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-300 to-white">
          Gestión de Contenido: {unidadPeriodo}
        </h2>
      </div>

      {/* Sección de Tareas */}
      <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-800/50 to-slate-800/30 p-6 border-b border-slate-700/50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-600/20 rounded-lg">
                <FileText className="text-purple-400" size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Tareas de la Unidad</h3>
                <p className="text-slate-400">{tareas?.length || 0} tareas en esta unidad</p>
              </div>
            </div>
            <button
              onClick={() => setIsTareaModalOpen(true)}
              className="group inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium rounded-xl transition-all duration-300 shadow-lg shadow-purple-900/25 hover:shadow-xl hover:shadow-purple-900/40 hover:scale-105"
            >
              <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
              <span>Crear Nueva Tarea</span>
            </button>
          </div>
        </div>
        <div className="p-6">
          {loading ? (
            <p className="text-slate-400">Cargando tareas...</p>
          ) : (tareas.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 bg-slate-800/50 rounded-full flex items-center justify-center">
                <FileText className="text-slate-500" size={32} />
              </div>
              <p className="text-slate-400 text-lg font-medium">No hay tareas definidas para esta unidad.</p>
              <p className="text-slate-500 text-sm mt-1">Crea la primera tarea para tus estudiantes en este módulo.</p>
            </div>
          ) : (
            <TaskTable 
              tasks={tareas} 
              onEditTask={handleEditTarea} 
              onDeleteTask={handleDeleteTarea} 
              onViewTask={onViewTask} 
              onAssignTask={onAssignTask}
              docenteView={true} // Always docenteView true in this context
              getStatusColor={getStatusColor}
              getTaskStatusDisplay={getTaskStatusDisplay}
              showActions={true}
              showPoints={false}
            />
          ))}
        </div>
      </div>

      {/* Sección de Evaluaciones */}
      <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-800/50 to-slate-800/30 p-6 border-b border-slate-700/50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-600/20 rounded-lg">
                <Brain className="text-green-400" size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Evaluaciones de la Unidad</h3>
                <p className="text-slate-400">{evaluaciones?.length || 0} evaluaciones en esta unidad</p>
              </div>
            </div>
            <button
              onClick={() => setIsEvaluationModalOpen(true)}
              className="group inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-xl transition-all duration-300 shadow-lg shadow-green-900/25 hover:shadow-xl hover:shadow-green-900/40 hover:scale-105"
            >
              <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
              <span>Generar Evaluación con IA</span>
            </button>
          </div>
        </div>
        <div className="p-6">
          {loading ? (
            <p className="text-slate-400">Cargando evaluaciones...</p>
          ) : (evaluaciones.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 bg-slate-800/50 rounded-full flex items-center justify-center">
                <Brain className="text-slate-500" size={32} />
              </div>
              <p className="text-slate-400 text-lg font-medium">No hay evaluaciones definidas para esta unidad.</p>
              <p className="text-slate-500 text-sm mt-1">Genera la primera evaluación para tus estudiantes en este módulo.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {evaluaciones.map(evaluacion => (
                <EvaluationCard 
                  key={evaluacion.id} 
                  catedraId={catedraId} 
                  evaluacion={evaluacion} 
                  onDeleteEvaluation={handleDeleteEvaluation}
                  onEditEvaluation={() => { /* Implement edit evaluation modal */ }}
                  onAssignEvaluation={onAssignEvaluation}
                  showActions={true} 
                  docenteView={true} 
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Modales para Tareas */}
      <Modal 
        isOpen={isTareaModalOpen} 
        onClose={() => setIsTareaModalOpen(false)} 
        title="Crear Nueva Tarea" 
        showSubmitButton={false} 
        showCancelButton={false}
      >
        <TareaForm 
          catedraId={catedraId} 
          onTareaCreated={handleTareaCreated} 
          onCancel={() => setIsTareaModalOpen(false)} 
          userType="docente" 
          initialData={{ unidadPlanId: unidadId, planDeClasesId: planDeClasesId }} // Pass unit and plan for pre-selection
          isEditMode={false}
        />
      </Modal>

      <Modal 
        isOpen={isEditTareaModalOpen} 
        onClose={() => setIsEditTareaModalOpen(false)} 
        title="Editar Tarea" 
        showSubmitButton={false} 
        showCancelButton={false}
      >
        <TareaForm 
          catedraId={catedraId} 
          onTareaUpdated={handleTareaUpdated} 
          onCancel={() => setIsEditTareaModalOpen(false)} 
          userType="docente" 
          initialData={editingTarea} 
          isEditMode={true} 
        />
      </Modal>

      {/* Modal para Detalles de Tarea */}
      {selectedTask && (
        <Modal 
          isOpen={isTaskDetailModalOpen} 
          onClose={() => setIsTaskDetailModalOpen(false)} 
          title={`Detalles de Tarea: ${selectedTask.titulo}`} 
          showSubmitButton={false} 
          cancelText="Cerrar"
        >
          <div className="p-4 text-slate-300 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
                <span className="text-sm text-slate-400 font-medium">Puntos Posibles</span>
                <div className="text-2xl font-bold text-white mt-1">{selectedTask.puntos_posibles}</div>
              </div>
              <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
                <span className="text-sm text-slate-400 font-medium">Fecha de Entrega</span>
                <div className="text-lg font-semibold text-white mt-1">
                  {selectedTask.fecha_entrega ? new Date(selectedTask.fecha_entrega).toLocaleDateString() : 'No definida'}
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <FileText size={20} />
                Descripción
              </h4>
              <div 
                className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50 prose prose-invert max-w-none" 
                dangerouslySetInnerHTML={{ __html: selectedTask.descripcion }}
              />
            </div>
            {(selectedTask.recursos && selectedTask.recursos.length > 0) && (
              <div>
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <FileText size={20} />
                  Recursos Adjuntos
                </h4>
                <div className="grid gap-3">
                  {selectedTask.recursos.map((recurso, resIndex) => {
                    const fileName = recurso.split('/').pop();
                    const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(fileName.split('.').pop().toLowerCase());
                    const STATIC_ASSET_BASE_URL = process.env.REACT_APP_API_URL.endsWith('/api') ? process.env.REACT_APP_API_URL.slice(0, -4) : process.env.REACT_APP_API_URL;
                    const fullRecursoUrl = `${STATIC_ASSET_BASE_URL}/${recurso}`;
                    return (
                      <div key={resIndex} className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
                        {isImage ? (
                          <img 
                            src={fullRecursoUrl} 
                            alt="Recurso" 
                            className="max-w-full h-auto rounded-lg shadow-lg" 
                          />
                        ) : (
                          <a 
                            href={fullRecursoUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors font-medium"
                          >
                            <FileText size={16} />
                            {fileName}
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Modales para Evaluaciones */}
      <Modal 
        isOpen={isEvaluationModalOpen} 
        onClose={() => setIsEvaluationModalOpen(false)} 
        title="Generar Nueva Evaluación con IA"
      >
        <EvaluationForm 
          catedraId={catedraId} // Pass catedraId to form
          onSubmit={handleGenerateEvaluation} 
          loading={isGenerating} 
          onCancel={() => setIsEvaluationModalOpen(false)} 
          userType="docente" 
          initialData={{ unidadPlanId: unidadId, planDeClasesId: planDeClasesId }} // Pass unit and plan for pre-selection
        />
      </Modal>

    </div>
  );
};

export default UnidadContentManagement;
