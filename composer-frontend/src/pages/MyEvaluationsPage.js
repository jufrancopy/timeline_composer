import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const MyEvaluationsPage = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchEvaluations = async () => {
    try {
      // This endpoint will need to be created in the backend and api.js
      const response = await api.getMyEvaluations(); 
      setEvaluations(response.data);
    } catch (error) {
      toast.error('No se pudieron cargar tus evaluaciones.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvaluations();
  }, []);

  if (loading) return <div className="text-center p-8">Cargando...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-4xl font-bold">Mis Evaluaciones</h2>
        </div>

        <div className="bg-white/5 backdrop-blur-lg p-6 rounded-lg shadow-xl">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Título</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Cátedra</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Fecha Límite</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {evaluations.map((ev) => (
                  <tr key={ev.id} className="hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-200">{ev.titulo}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">{ev.catedra.nombre}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">{ev.estadoAsignacion}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">{ev.fecha_entrega ? format(new Date(ev.fecha_entrega), 'dd/MM/yyyy') : 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {(ev.estadoAsignacion === 'PENDIENTE' || ev.estadoAsignacion === 'VENCIDA') ? (
                        <button
                          onClick={() => navigate(`/alumno/evaluaciones/${ev.asignacionId}`)}
                          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                        >
                          Realizar Evaluación
                        </button>
                      ) : (
                        <button
                          onClick={() => navigate(`/alumno/evaluaciones/${ev.asignacionId}/results`)}
                          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                        >
                          Ver Resultados
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyEvaluationsPage;
