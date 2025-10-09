import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Eye, Target, Trash2 } from 'lucide-react';

const EvaluationCard = ({ catedraId, evaluacion, onDeleteEvaluation }) => {
  return (
    <div className="bg-white/5 backdrop-blur-lg p-4 rounded-lg shadow-xl mb-4 border border-slate-700">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-bold text-orange-300">{evaluacion.titulo}</h3>
        <span className="px-2 py-1 text-xs leading-5 font-semibold rounded-full bg-blue-600/20 text-blue-300 border border-blue-500/30">
          <div className="inline-flex items-center gap-1">
            <Target size={14} />
            {evaluacion.preguntas?.length || 0} Preguntas
          </div>
        </span>
      </div>
      <p className="text-sm text-gray-400"><strong>Fecha de Creación:</strong> {format(new Date(evaluacion.created_at), 'dd/MM/yyyy')}</p>
      
      <div className="mt-4 pt-4 border-t border-slate-700 flex items-center gap-2">
        <Link 
          to={`/docente/catedra/${catedraId}/evaluation/${evaluacion.id}`} 
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 hover:text-purple-200 rounded-lg transition-all duration-200 border border-purple-500/30"
        >
          <Eye size={16} />
          <span className="text-sm font-medium">Ver Detalles</span>
        </Link>
        <button
          onClick={() => onDeleteEvaluation(evaluacion.id)}
          className="p-2 bg-red-600/20 text-red-300 hover:bg-red-600/30 hover:text-red-200 rounded-lg transition-all duration-200 border border-red-500/30"
          title="Eliminar Evaluación"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default EvaluationCard;