import React from 'react';
import { Link } from 'react-router-dom';
import EvaluationCard from './EvaluationCard';

const EvaluationTable = ({ title, evaluations, getStatusColor, showStatus = true, showActions = false }) => {
  if (!evaluations || evaluations.length === 0) {
    return (
      <div className="mb-8">
        <h4 className="text-2xl font-bold mb-4 text-gray-300">{title}</h4>
        <p className="text-gray-400">No hay evaluaciones en esta categoría.</p>
      </div>
    );
  }

  // Función auxiliar para obtener el estado desde EvaluacionAsignacion
  const getEstado = (evaluation) => {
    if (evaluation.EvaluacionAsignacion && evaluation.EvaluacionAsignacion.length > 0) {
      return evaluation.EvaluacionAsignacion[0].estado;
    }
    return evaluation.estado || 'PENDIENTE'; // Fallback
  };

  // Función auxiliar para obtener el texto del estado
  const getEstadoText = (estado) => {
    switch(estado) {
      case 'PENDIENTE': return 'Pendiente';
      case 'VENCIDA': return 'Vencida';
      case 'REALIZADA': return 'Realizada';
      case 'CALIFICADA': return 'Calificada';
      default: return estado;
    }
  };

  return (
    <div className="mb-8">
      <h4 className="text-2xl font-bold mb-4 text-gray-300">{title}</h4>
      {/* Vista de tabla para pantallas grandes */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Título</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Cátedra</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Fecha de Creación</th>
              {showStatus && <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Estado</th>}
              {showActions && <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Acciones</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {evaluations.map((evaluation) => {
              const estado = getEstado(evaluation);
              return (
                <tr key={evaluation.id} className="hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">
                    {evaluation.titulo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {evaluation.Catedra?.nombre || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {new Date(evaluation.created_at).toLocaleDateString()}
                  </td>
                  {showStatus && (
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${getStatusColor(estado)}`}>
                      {getEstadoText(estado)}
                    </td>
                  )}
                  {showActions && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/evaluacion/${evaluation.id}`}
                        className="text-blue-400 hover:text-blue-500"
                      >
                        Realizar Evaluación
                      </Link>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Vista de tarjetas para pantallas pequeñas */}
      <div className="block md:hidden space-y-4">
        {evaluations.map((evaluation) => (
          <EvaluationCard 
            key={evaluation.id} 
            catedraId={evaluation.catedraId} 
            evaluacion={evaluation} 
            showStatus={showStatus}
            showActions={showActions}
          />
        ))}
      </div>
    </div>
  );
};

export default EvaluationTable;