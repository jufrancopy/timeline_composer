import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { BookOpen, BookMarked, Target, FileText, AlertCircle, Loader, ChevronRight } from 'lucide-react';

const MyEvaluationsPage = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchEvaluations = async () => {
    try {
      const response = await api.getMyEvaluations();
      setEvaluations(response.data);
      setError(null);
    } catch (error) {
      console.error('Error al cargar las evaluaciones:', error);
      setError('No se pudieron cargar tus evaluaciones. Intenta de nuevo más tarde.');
      toast.error('No se pudieron cargar tus evaluaciones.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvaluations();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <Loader className="animate-spin w-16 h-16 text-purple-500 mx-auto mb-4" />
          <p className="text-slate-300 text-lg font-medium">Cargando evaluaciones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Error</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <button
            onClick={fetchEvaluations}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 sm:p-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-6 flex items-center gap-3">
            <FileText className="text-orange-400" size={32} />
            Mis Evaluaciones
          </h1>

          {evaluations.length === 0 ? (
            <div className="text-center py-8">
              <BookMarked className="w-16 h-16 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-lg">No tienes evaluaciones asignadas en este momento. ¡A seguir aprendiendo!</p>
              <Link
                to="/alumno/dashboard"
                className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-all"
              >
                Volver al Dashboard
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {evaluations.map((ev) => (
                <div
                  key={ev.id}
                  className="group block bg-slate-800/30 rounded-xl p-5 border border-slate-700/50 hover:bg-slate-800/50 transition-colors duration-300 hover:scale-[1.02] relative"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-semibold text-white group-hover:text-orange-300 transition-colors pr-10">
                      {ev.titulo}
                    </h2>
                    {(() => {
                      let displayedStatus = ev.estado;
                      let statusClass = '';

                      if (ev.estado === 'REALIZADA' || ev.estado === 'CALIFICADA') {
                        displayedStatus = 'Calificada';
                        statusClass = 'bg-green-900/20 text-green-300 border-green-500/30';
                      } else if (ev.estado === 'PENDIENTE') {
                        displayedStatus = 'Pendiente de Calificación';
                        statusClass = 'bg-yellow-900/20 text-yellow-300 border-yellow-500/30';
                      } else {
                        statusClass = 'bg-gray-900/20 text-gray-300 border-gray-500/30';
                      }
                      return (
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusClass}`}>
                          {displayedStatus}
                        </span>
                      );
                    })()}
                  </div>
                  
                  <div className="flex flex-col space-y-1 text-sm text-gray-400 mb-3">
                    <div className="flex items-center gap-2">
                      <BookOpen size={16} className="text-emerald-400" />
                      <span><strong>Cátedra:</strong> {ev.Catedra?.nombre || 'N/A'}</span>
                    </div>
                    {ev.UnidadPlan?.PlanDeClases?.titulo && (
                      <div className="flex items-center gap-2">
                        <BookMarked size={16} className="text-blue-400" />
                        <span><strong>Plan:</strong> {ev.UnidadPlan.PlanDeClases.titulo}</span>
                      </div>
                    )}
                    {ev.UnidadPlan?.periodo && (
                      <div className="flex items-center gap-2">
                        <Target size={16} className="text-purple-400" />
                        <span><strong>Unidad:</strong> {ev.UnidadPlan.periodo}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-slate-500 text-sm line-clamp-2 mb-4">
                    Total de preguntas: {ev.Pregunta?.length || 0}
                  </p>
                  <div className="flex items-center justify-between text-slate-500 text-xs">
                    <div className="flex items-center gap-2">
                      <FileText size={14} />
                      <span>Fecha Límite: {ev.fecha_limite ? format(new Date(ev.fecha_limite), 'dd/MM/yyyy') : 'No especificada'}</span>
                    </div>
                    <Link
                      to={ev.realizada ? `/alumno/catedra/${ev.Catedra?.id}/evaluacion/${ev.id}/results` : `/evaluacion/${ev.id}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-all"
                    >
                      {ev.realizada ? 'Ver Resultados' : 'Realizar Evaluación'}
                      <ChevronRight size={18} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyEvaluationsPage;
