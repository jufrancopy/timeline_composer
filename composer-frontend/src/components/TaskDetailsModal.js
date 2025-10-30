import React from 'react';
import Modal from './Modal';
import { FileText, BookOpen, BookMarked, Target } from 'lucide-react';

const TaskDetailsModal = ({ task, isOpen, onClose }) => {
  if (!task) return null;

  const STATIC_ASSET_BASE_URL = process.env.REACT_APP_API_URL.endsWith('/api') 
    ? process.env.REACT_APP_API_URL.slice(0, -4) 
    : process.env.REACT_APP_API_URL;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Detalles de Tarea: ${task.titulo}`} 
      showSubmitButton={false} 
      cancelText="Cerrar"
    >
      <div className="p-4 text-slate-300 space-y-6">
        {/* Información de Cátedra, Plan y Unidad */}
        <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50 space-y-2">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-emerald-400" />
            <span className="text-white font-semibold">Cátedra:</span>
            <span>{task.Catedra?.nombre || 'N/A'}</span>
          </div>
          {task.UnidadPlan?.PlanDeClases?.titulo && (
            <div className="flex items-center gap-2">
              <BookMarked size={18} className="text-blue-400" />
              <span className="text-white font-semibold">Plan de Clases:</span>
              <span>{task.UnidadPlan.PlanDeClases.titulo}</span>
            </div>
          )}
          {task.UnidadPlan?.periodo && (
            <div className="flex items-center gap-2">
              <Target size={18} className="text-purple-400" />
              <span className="text-white font-semibold">Unidad:</span>
              <span>{task.UnidadPlan.periodo}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
            <span className="text-sm text-slate-400 font-medium">Puntos Posibles</span>
            <div className="text-2xl font-bold text-white mt-1">{task.puntos_posibles}</div>
          </div>
          <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
            <span className="text-sm text-slate-400 font-medium">Fecha de Entrega</span>
            <div className="text-lg font-semibold text-white mt-1">
              {task.fecha_entrega ? new Date(task.fecha_entrega).toLocaleDateString() : 'No definida'}
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
            dangerouslySetInnerHTML={{ __html: task.descripcion }}
          />
        </div>
        {(task.recursos && task.recursos.length > 0) && (
          <div>
            <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <FileText size={20} />
              Recursos Adjuntos
            </h4>
            <div className="grid gap-3">
              {task.recursos.map((recurso, resIndex) => {
                const fileName = recurso.split('/').pop();
                const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(fileName.split('.').pop().toLowerCase());
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
  );
};

export default TaskDetailsModal;
