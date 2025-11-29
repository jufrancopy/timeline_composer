import React from 'react';
import { Calendar, BookOpen, Target, Lightbulb, ClipboardCheck } from 'lucide-react';

function PlanEstudiosTable({ planData, loading }) {

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
        <p className="text-gray-300 mt-4">Cargando plan de estudios...</p>
      </div>
    );
  }

  if (!planData || planData.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
        <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <p className="text-gray-400">No hay plan de estudios disponible</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-500 px-6 py-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-white" />
          <h2 className="text-xl font-bold text-white">Plan de Estudios - Cronograma</h2>
        </div>
      </div>

      {/* Tabla responsive */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-900 sticky top-0 z-10">
            <tr>
              <th className="border border-gray-700 px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider min-w-[120px]">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Mes/Horas
                </div>
              </th>
              <th className="border border-gray-700 px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider min-w-[250px]">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Unidades/Contenidos
                </div>
              </th>
              <th className="border border-gray-700 px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider min-w-[200px]">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Capacidad/es
                </div>
              </th>
              <th className="border border-gray-700 px-4 py-3 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider min-w-[90px]">
                Hs. Teóricas
              </th>
              <th className="border border-gray-700 px-4 py-3 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider min-w-[90px]">
                Hs. Prácticas
              </th>
              <th className="border border-gray-700 px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider min-w-[250px]">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  Estrategias Metodológicas
                </div>
              </th>
              <th className="border border-gray-700 px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider min-w-[250px]">
                <div className="flex items-center gap-2">
                  <ClipboardCheck className="w-4 h-4" />
                  Medios de Verificación/Evaluación
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {planData.map((item, index) => (
              <tr 
                key={index}
                className="hover:bg-gray-700/30 transition-colors duration-150"
              >
                {/* Mes/Horas */}
                <td className="border border-gray-700 px-4 py-4 align-top bg-gray-900/50">
                  <span className="text-white font-semibold text-sm">
                    {item.periodo}
                  </span>
                </td>

                {/* Unidades/Contenidos */}
                <td className="border border-gray-700 px-4 py-4 align-top">
                  <div className="space-y-2">
                    <ul className="space-y-2">
                      {item.contenidos.map((contenido, idx) => (
                        <li key={idx} className="text-gray-300 text-sm flex gap-2">
                          <span className="text-green-500 font-bold flex-shrink-0">•</span>
                          <span>{contenido}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </td>

                {/* Capacidades */}
                <td className="border border-gray-700 px-4 py-4 align-top">
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {item.capacidades}
                  </p>
                </td>

                {/* Horas Teóricas */}
                <td className="border border-gray-700 px-4 py-4 align-top text-center">
                  <div className="inline-flex items-center justify-center bg-blue-500/20 px-3 py-1.5 rounded-md">
                    <span className="text-blue-300 font-semibold text-sm">
                      {item.horasTeoricas}
                    </span>
                  </div>
                </td>

                {/* Horas Prácticas */}
                <td className="border border-gray-700 px-4 py-4 align-top text-center">
                  <div className="inline-flex items-center justify-center bg-purple-500/20 px-3 py-1.5 rounded-md">
                    <span className="text-purple-300 font-semibold text-sm">
                      {item.horasPracticas}
                    </span>
                  </div>
                </td>

                {/* Estrategias Metodológicas */}
                <td className="border border-gray-700 px-4 py-4 align-top">
                  <ul className="space-y-2">
                    {item.estrategias.map((estrategia, idx) => (
                      <li key={idx} className="text-gray-300 text-sm">
                        <span className="text-yellow-400 mr-2">→</span>
                        {estrategia}
                      </li>
                    ))}
                  </ul>
                </td>

                {/* Medios de Verificación */}
                <td className="border border-gray-700 px-4 py-4 align-top">
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {item.evaluacion}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 px-6 py-4 border-t border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">
            Total de unidades: <span className="text-white font-semibold">{planData.length}</span>
          </span>
          <span className="text-gray-400">
            Plan de estudios completo
          </span>
        </div>
      </div>
    </div>
  );
}

export default PlanEstudiosTable;
