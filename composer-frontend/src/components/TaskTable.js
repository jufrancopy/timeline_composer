import React, { useEffect, useRef } from 'react';
import TaskCard from './TaskCard'; // Importar TaskCard

import { UserPlus } from 'lucide-react';

function TaskTable({ title, tasks, getStatusColor, getTaskStatusDisplay, handleOpenSubmitModal, showActions, showPoints, onEditTask, onDeleteTask, onViewTask, onAssignTask, onToggleVisibility, docenteView = false, highlightedTaskId = null }) {
  const taskRefs = useRef({});

  useEffect(() => {
    if (highlightedTaskId && taskRefs.current[highlightedTaskId]) {
      taskRefs.current[highlightedTaskId].scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Optionally, remove highlight after some time
      // const timer = setTimeout(() => setHighlightedTaskId(null), 3000);
      // return () => clearTimeout(timer);
    }
  }, [highlightedTaskId, tasks]);

  return (
    <div className="overflow-x-auto mb-10 p-4 bg-gray-800/50 rounded-lg shadow-inner">
      <h4 className="text-xl font-bold mb-4 text-white">{title} ({tasks.length})</h4>
      {tasks.length === 0 ? (
        <p className="text-gray-400">No hay tareas en esta categoría.</p>
      ) : (
        <>
          {/* Vista de tabla para pantallas grandes */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  {!docenteView && <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Cátedra</th>}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Tarea</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Plan de Clases</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Módulo (Unidad)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Descripción</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Puntos Posibles</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Fecha de Entrega</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Estado</th>
                  {showPoints && <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Mis Puntos</th>}
                  {showActions && <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {tasks.map((task) => (
                  <tr key={task.id} ref={el => taskRefs.current[task.id] = el} className={`hover:bg-gray-700/50 ${highlightedTaskId === task.id ? 'bg-yellow-800/50 border-l-4 border-yellow-400' : ''}`}>
                    {!docenteView && <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">{task.TareaMaestra.Catedra?.nombre} ({task.TareaMaestra.Catedra?.anio})</td>}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">
                      {docenteView ? (
                        <button onClick={(e) => { e.stopPropagation(); onViewTask(task); }} className="text-blue-400 hover:text-blue-300 font-semibold text-left">
                          {task.titulo}
                        </button>
                      ) : (
                        task.TareaMaestra.titulo
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {docenteView 
                        ? (task.UnidadPlan?.PlanDeClases?.titulo || 'N/A')
                        : (task.TareaMaestra?.UnidadPlan?.PlanDeClases?.titulo || 'N/A')
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {docenteView 
                        ? (task.UnidadPlan?.periodo || 'N/A')
                        : (task.TareaMaestra?.UnidadPlan?.periodo || 'N/A')
                      }
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300 max-w-xs truncate"
                      dangerouslySetInnerHTML={{ __html: docenteView ? task.descripcion : task.TareaMaestra.descripcion }}></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{docenteView ? task.puntos_posibles : task.TareaMaestra.puntos_posibles}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{(docenteView ? task.fecha_entrega : task.TareaMaestra.fecha_entrega) ? new Date(docenteView ? task.fecha_entrega : task.TareaMaestra.fecha_entrega).toLocaleDateString() : 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(task)}`}>
                        {getTaskStatusDisplay(task)}
                      </span>
                    </td>
                    {showPoints && <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-400">{task.puntos_obtenidos !== null ? task.puntos_obtenidos : 'N/A'}</td>}
                    {showActions && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {(task.estado === 'ASIGNADA' || task.estado === 'VENCIDA') && !task.submission_path && !docenteView && (
                          <button
                            onClick={() => handleOpenSubmitModal(task)}
                            className="text-indigo-400 hover:text-indigo-500 mr-4"
                          >
                            Subir Entrega
                          </button>
                        )}
                        {docenteView && (
                          <div className="flex space-x-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); onEditTask(task); }}
                              className="text-yellow-400 hover:text-yellow-500"
                            >
                              Editar
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); onDeleteTask(task.id); }}
                              className="text-red-400 hover:text-red-500"
                            >
                              Eliminar
                            </button>
                            <button
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                onAssignTask(task);
                              }}
                              className="text-blue-400 hover:text-blue-500 flex items-center gap-1"
                            >
                              <UserPlus size={16} /> Asignar
                            </button>

                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Vista de tarjetas para pantallas pequeñas */}
          <div className="block md:hidden space-y-4">
            {tasks.map((task) => {
                const taskCardProps = docenteView ? task : { ...task, TareaMaestra: task.TareaMaestra };

                return (
                  <div key={task.id} ref={el => taskRefs.current[task.id] = el} className={`${highlightedTaskId === task.id ? 'bg-yellow-800/50 border-l-4 border-yellow-400' : ''}`}>
                    <TaskCard 
                      task={taskCardProps} 
                      getStatusColor={getStatusColor} 
                      getTaskStatusDisplay={getTaskStatusDisplay}
                      handleOpenSubmitModal={handleOpenSubmitModal}
                      showActions={showActions}
                      showPoints={showPoints}
                      onEditTask={onEditTask}
                      onDeleteTask={onDeleteTask}
                      onViewTask={onViewTask}
                      onAssignTask={onAssignTask}
                      onToggleVisibility={onToggleVisibility}
                      docenteView={docenteView}
                    />
                  </div>
                );
              })}
          </div>
        </>
      )}    </div>
  );
}

export default TaskTable;