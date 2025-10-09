import React from 'react';
import { Link } from 'react-router-dom';
import EvaluationCard from './EvaluationCard'; // Importar EvaluationCard

const EvaluationTable = ({ title, evaluations, getStatusColor, showStatus = true, showActions = false }) => {
  if (!evaluations || evaluations.length === 0) {
    return (
      <div className="mb-8">
        <h4 className="text-2xl font-bold mb-4 text-gray-300">{title}</h4>
        <p className="text-gray-400">No hay evaluaciones en esta categoría.</p>
      </div>
    );
  }

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
            {evaluations.map((evaluation) => (
              <tr key={evaluation.id} className="hover:bg-gray-700/50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">{evaluation.titulo}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{evaluation.catedra?.nombre || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {new Date(evaluation.created_at).toLocaleDateString()}
                </td>
                {showStatus && (
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${getStatusColor(evaluation.realizada ? 'Completado' : 'Pendiente')}`}>
                    {evaluation.realizada ? 'Completada' : 'Pendiente'}
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
            ))}
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
            // Puedes pasar otras props si son necesarias para la lógica dentro de EvaluationCard
          />
        ))}
      </div>
    </div>
  );
};

export default EvaluationTable;
