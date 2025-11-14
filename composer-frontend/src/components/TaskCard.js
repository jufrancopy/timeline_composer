import React from 'react';
import { format } from 'date-fns';
import { FileText, BookOpen, BookMarked, Target } from 'lucide-react';

const TaskCard = ({ task, getStatusColor, getTaskStatusDisplay, handleOpenSubmitModal, showActions, showPoints, onEditTask, onDeleteTask, onViewTask, onAssignTask, onToggleVisibility, docenteView = false }) => {
  // ARREGLO: Verificar correctamente si tiene archivos entregados
  const hasSubmission = task.submission_path && 
                        (Array.isArray(task.submission_path) 
                          ? task.submission_path.length > 0 
                          : true);
  
  // ARREGLO: Normalizar el estado
  const estadoNormalizado = task.estado?.toString().trim().toUpperCase();
  
  // ARREGLO: Condición mejorada para mostrar el botón
  const puedeSubirEntrega = (estadoNormalizado === 'ASIGNADA' || estadoNormalizado === 'VENCIDA') && 
                            !hasSubmission && 
                            !docenteView;

  return (
    <div className="bg-white/5 backdrop-blur-lg p-4 rounded-lg shadow-xl mb-4 border border-gray-700">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-bold text-purple-300">{docenteView ? task.titulo : task.TareaMaestra.titulo}</h3>
        <span className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${getStatusColor(task.estado)}`}>
          {getTaskStatusDisplay(task)}
        </span>
      </div>
      <p className="text-sm text-gray-400 mb-2" dangerouslySetInnerHTML={{ __html: docenteView ? task.descripcion : task.TareaMaestra.descripcion }}></p>
      <div className="flex flex-col space-y-1 text-sm text-gray-400 mt-2">
        <div className="flex items-center gap-2">
          <BookOpen size={16} className="text-emerald-400" />
          <span><strong>Cátedra:</strong> {docenteView ? task.Catedra?.nombre : task.TareaMaestra.Catedra?.nombre}</span>
        </div>
        {task.TareaMaestra?.UnidadPlan?.PlanDeClases?.titulo && (
          <div className="flex items-center gap-2">
            <BookMarked size={16} className="text-blue-400" />
            <span><strong>Plan:</strong> {task.TareaMaestra.UnidadPlan.PlanDeClases.titulo}</span>
          </div>
        )}
        {task.TareaMaestra?.UnidadPlan?.periodo && (
          <div className="flex items-center gap-2">
            <Target size={16} className="text-purple-400" />
            <span><strong>Unidad:</strong> {task.TareaMaestra.UnidadPlan.periodo}</span>
          </div>
        )}
      </div>
      <p className="text-sm text-gray-400 mt-2"><strong>Puntos Posibles:</strong> {docenteView ? task.puntos_posibles : task.TareaMaestra.puntos_posibles}</p>
      <p className="text-sm text-gray-400"><strong>Vence:</strong> {(docenteView ? task.fecha_entrega : task.TareaMaestra.fecha_entrega) ? format(new Date(docenteView ? task.fecha_entrega : task.TareaMaestra.fecha_entrega), 'dd/MM/yyyy') : 'N/A'}</p>
      {showPoints && task.puntos_obtenidos !== null && (
        <p className="text-sm font-bold text-green-400 mt-1"><strong>Mis Puntos:</strong> {task.puntos_obtenidos}</p>
      )}
      
      {showActions && (
        <div className="mt-4 flex flex-wrap gap-2">
          {puedeSubirEntrega && (
            <button
              onClick={() => handleOpenSubmitModal(task)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 px-3 rounded"
            >
              Subir Entrega
            </button>
          )}
          {docenteView && (
            <>
              <button
                onClick={() => onViewTask(task)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-3 rounded"
              >
                Ver
              </button>
              <button
                onClick={() => onEditTask(task)}
                className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-bold py-2 px-3 rounded"
              >
                Editar
              </button>
              <button
                onClick={() => onDeleteTask(task.id)}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 px-3 rounded"
              >
                Eliminar
              </button>
              <button
                onClick={() => onAssignTask(task)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-3 rounded"
              >
                Asignar
              </button>
              {task.publicacionId && (
                <button
                  onClick={() => onToggleVisibility(task.publicacionId, task.catedraId)}
                  className={`${task.visibleToStudents ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white text-xs font-bold py-2 px-3 rounded`}
                >
                  {task.visibleToStudents ? 'Ocultar en Tablón' : 'Publicar en Tablón'}
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskCard;