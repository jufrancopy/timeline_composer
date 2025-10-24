import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Eye, Target, Trash2 } from 'lucide-react';

const EvaluationCard = ({ 
  catedraId, 
  evaluacion, 
  onDeleteEvaluation, 
  showStatus = false, 
  showActions = false 
}) => {
  // Función para obtener el estado desde EvaluacionAsignacion
  const getEstado = () => {
    if (evaluacion.EvaluacionAsignacion && evaluacion.EvaluacionAsignacion.length > 0) {
      return evaluacion.EvaluacionAsignacion[0].estado;
    }
    return evaluacion.estado || 'PENDIENTE';
  };

  // Función para obtener el texto del estado
  const getEstadoText = (estado) => {
    switch(estado) {
      case 'PENDIENTE': return 'Pendiente';
      case 'VENCIDA': return 'Vencida';
      case 'REALIZADA': return 'Realizada';
      case 'CALIFICADA': return 'Calificada';
      default: return estado;
    }
  };

  // Función para obtener el color del estado
  const getEstadoColor = (estado) => {
    switch(estado) {
      case 'PENDIENTE': return 'bg-yellow-600/20 text-yellow-300 border-yellow-500/30';
      case 'VENCIDA': return 'bg-red-600/20 text-red-300 border-red-500/30';
      case 'REALIZADA': return 'bg-blue-600/20 text-blue-300 border-blue-500/30';
      case 'CALIFICADA': return 'bg-green-600/20 text-green-300 border-green-500/30';
      default: return 'bg-gray-600/20 text-gray-300 border-gray-500/30';
    }
  };

  const estado = getEstado();

  return (
    <div className="bg-white/5 backdrop-blur-lg p-4 rounded-lg shadow-xl mb-4 border border-slate-700">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-bold text-orange-300">{evaluacion.titulo}</h3>
        <div className="flex gap-2">
          <span className="px-2 py-1 text-xs leading-5 font-semibold rounded-full bg-blue-600/20 text-blue-300 border border-blue-500/30">
            <div className="inline-flex items-center gap-1">
              <Target size={14} />
              {evaluacion.preguntas?.length || 0} Preguntas
            </div>
          </span>
          {showStatus && (
            <span className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${getEstadoColor(estado)}`}>
              {getEstadoText(estado)}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-sm text-gray-400">
          <strong>Cátedra:</strong> {evaluacion.Catedra?.nombre || 'N/A'}
        </p>
        <p className="text-sm text-gray-400">
          <strong>Fecha de Creación:</strong> {format(new Date(evaluacion.created_at), 'dd/MM/yyyy')}
        </p>
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-700 flex items-center gap-2">
        {/* Botón para ver detalles (siempre visible) */}
        <Link 
          to={`/docente/catedra/${catedraId}/evaluation/${evaluacion.id}`} 
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 hover:text-purple-200 rounded-lg transition-all duration-200 border border-purple-500/30"
        >
          <Eye size={16} />
          <span className="text-sm font-medium">Ver Detalles</span>
        </Link>

        {/* Botón adicional de acciones (realizar evaluación para alumnos) */}
        {showActions && (
          <Link
            to={`/evaluacion/${evaluacion.id}`}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 hover:text-blue-200 rounded-lg transition-all duration-200 border border-blue-500/30"
          >
            <span className="text-sm font-medium">Realizar</span>
          </Link>
        )}

        {/* Botón de eliminar (solo si se pasa la función) */}
        {onDeleteEvaluation && (
          <button
            onClick={() => onDeleteEvaluation(evaluacion.id)}
            className="p-2 bg-red-600/20 text-red-300 hover:bg-red-600/30 hover:text-red-200 rounded-lg transition-all duration-200 border border-red-500/30 ml-auto"
            title="Eliminar Evaluación"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default EvaluationCard;