import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import {
  ArrowLeft, BookOpen, BookMarked, Target, Calendar,
  CheckCircle, XCircle, Clock, Award, Send, Loader,
  AlertCircle, Trophy, TrendingUp
} from 'lucide-react';

const RealizarEvaluacionPage = () => {
  const { evaluationId } = useParams();
  const navigate = useNavigate();
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [results, setResults] = useState(null);

  const getEstado = (evaluacion) => {
    if (evaluacion?.EvaluacionAsignacion && evaluacion.EvaluacionAsignacion.length > 0) {
      return evaluacion.EvaluacionAsignacion[0].estado;
    }
    return evaluacion?.estado || 'PENDIENTE';
  };

  const fetchResults = async () => {
    try {
      console.log("[FETCH RESULTS] Attempting to fetch results for evaluation ID:", evaluationId);
      const response = await api.getEvaluationResultsForStudent(evaluationId);
      console.log("[FETCH RESULTS] API response for results:", response.data);
      setScore(response.data.score);
      setResults(response.data.results);
      console.log("[FETCH RESULTS] Successfully set score and results.");
    } catch (err) {
      console.error('[FETCH RESULTS] Error al cargar los resultados de la evaluación:', err);
      if (err.response?.status !== 404) {
        toast.error('Error al cargar los resultados.');
      }
    }
  };

  const fetchEvaluation = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getEvaluationForStudent(evaluationId);
      setEvaluation(response.data);
      
      const studentEvalsResponse = await api.getMyEvaluations();
      const currentEvalStatus = studentEvalsResponse.data.find(ev => ev.id === parseInt(evaluationId));
      
      if (currentEvalStatus) {
        const estado = getEstado(currentEvalStatus);
        
        if (estado === 'REALIZADA' || estado === 'CALIFICADA') {
          setIsSubmitted(true);
          toast('Ya completaste esta evaluación. Cargando resultados...', { icon: 'ℹ️' });
          await fetchResults();
        }
      }
    } catch (err) {
      console.error('Error al cargar la evaluación:', err);
      setError('No se pudo cargar la evaluación. Por favor, inténtalo de nuevo.');
      toast.error('Error al cargar la evaluación.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvaluation();
    // eslint-disable-next-line
  }, [evaluationId]);

  const handleSubmit = async () => {
    if (isSubmitted) {
      toast.error('Ya enviaste esta evaluación.');
      return;
    }

    if (!evaluation || !evaluation.preguntas) {
      toast.error('No hay preguntas disponibles.');
      return;
    }

    if (Object.keys(selectedOptions).length !== evaluation.preguntas.length) {
      toast.error('Por favor, responde todas las preguntas antes de enviar.');
      return;
    }

    setLoading(true);
    try {
      const answers = Object.entries(selectedOptions).map(([preguntaId, opcionElegidaId]) => ({
        preguntaId: parseInt(preguntaId),
        opcionElegidaId: parseInt(opcionElegidaId),
      }));

      const response = await api.submitEvaluation(evaluationId, { respuestas: answers });
      setIsSubmitted(true);
      setScore(response.data.score);
      toast.success('¡Evaluación enviada y calificada con éxito!');
      await fetchResults();
    } catch (err) {
      console.error('[HANDLE SUBMIT] Error al enviar la evaluación:', err);
      setError(err.response?.data?.error || 'Error al enviar la evaluación.');
      toast.error(err.response?.data?.error || 'Error al enviar la evaluación.');
    } finally {
      setLoading(false);
    }
  };

  const handleOptionChange = (preguntaId, opcionId) => {
    setSelectedOptions(prev => ({
      ...prev,
      [preguntaId]: opcionId,
    }));
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'from-green-500 to-emerald-600';
    if (score >= 70) return 'from-blue-500 to-cyan-600';
    if (score >= 50) return 'from-yellow-500 to-orange-600';
    return 'from-red-500 to-pink-600';
  };

  const getScoreIcon = (score) => {
    if (score >= 90) return <Trophy className="text-yellow-300" size={48} />;
    if (score >= 70) return <Award className="text-blue-300" size={48} />;
    if (score >= 50) return <TrendingUp className="text-orange-300" size={48} />;
    return <AlertCircle className="text-red-300" size={48} />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-purple-600/30 rounded-full animate-spin border-t-purple-500"></div>
          </div>
          <p className="text-slate-300 text-lg font-medium">Cargando evaluación...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 max-w-md">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Error</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  if (!evaluation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
          <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Evaluación no encontrada</h2>
          <p className="text-slate-400 mb-6">No se pudo cargar la información de esta evaluación.</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  const answeredQuestions = Object.keys(selectedOptions).length;
  const totalQuestions = evaluation.preguntas?.length || 0;
  const progress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header con botón de volver */}
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
          <button
            onClick={() => {
              if (evaluation?.Catedra?.id) {
                navigate(`/alumno/catedra/${evaluation.Catedra.id}`);
              } else {
                navigate(-1);
              }
            }}
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Volver a la Cátedra
          </button>

          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <BookOpen className="text-white" size={32} />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
                {evaluation.titulo}
              </h1>
              <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <BookOpen size={16} className="text-emerald-400" />
                  <span>{evaluation.Catedra?.nombre || 'N/A'}</span>
                </div>
                {evaluation.UnidadPlan?.PlanDeClases?.titulo && (
                  <div className="flex items-center gap-2">
                    <BookMarked size={16} className="text-blue-400" />
                    <span>{evaluation.UnidadPlan.PlanDeClases.titulo}</span>
                  </div>
                )}
                {evaluation.UnidadPlan?.periodo && (
                  <div className="flex items-center gap-2">
                    <Target size={16} className="text-purple-400" />
                    <span>{evaluation.UnidadPlan.periodo}</span>
                  </div>
                )}
                {evaluation.fecha_limite && (
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-yellow-400" />
                    <span>Vence: {new Date(evaluation.fecha_limite).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Resultado de la evaluación */}
        {isSubmitted && score !== null && (
          <div className={`bg-gradient-to-r ${getScoreColor(score)} rounded-2xl p-8 text-white shadow-2xl`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-3xl font-bold mb-2">¡Evaluación Completada!</h3>
                <p className="text-white/90 text-lg">Has finalizado esta evaluación exitosamente</p>
              </div>
              <div className="text-center">
                {getScoreIcon(score)}
                <p className="text-5xl font-bold mt-2">{score}%</p>
                <p className="text-white/80 text-sm mt-1">Puntaje</p>
              </div>
            </div>
          </div>
        )}

        {/* Barra de progreso (solo si no está enviada) */}
        {!isSubmitted && totalQuestions > 0 && (
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-300 font-medium">Progreso</span>
              <span className="text-slate-400 text-sm">{answeredQuestions} de {totalQuestions} respondidas</span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Preguntas */}
        <div className="space-y-4">
          {evaluation.preguntas && evaluation.preguntas.length > 0 ? (
            evaluation.preguntas.map((pregunta, index) => {
              const questionResult = results?.find(r => r.pregunta === pregunta.texto);
              const selectedOptionText = questionResult?.opciones.find(opt => opt.seleccionada)?.texto;
              const isCorrect = questionResult?.es_correcta_alumno;

              return (
                <div 
                  key={pregunta.id} 
                  className={`bg-slate-900/50 backdrop-blur-xl rounded-2xl border p-6 transition-all ${
                    isSubmitted 
                      ? isCorrect 
                        ? 'border-green-500/50 bg-green-900/10' 
                        : 'border-red-500/50 bg-red-900/10'
                      : selectedOptions[pregunta.id]
                        ? 'border-purple-500/50'
                        : 'border-slate-700/50'
                  }`}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 font-bold ${
                      isSubmitted
                        ? isCorrect
                          ? 'bg-green-600/20 text-green-300 border border-green-500/30'
                          : 'bg-red-600/20 text-red-300 border border-red-500/30'
                        : selectedOptions[pregunta.id]
                          ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                          : 'bg-slate-700/50 text-slate-400 border border-slate-600/50'
                    }`}>
                      {index + 1}
                    </div>
                    <p className="text-lg text-white font-medium flex-1">{pregunta.texto}</p>
                    {isSubmitted && (
                      isCorrect 
                        ? <CheckCircle className="text-green-400 flex-shrink-0" size={24} />
                        : <XCircle className="text-red-400 flex-shrink-0" size={24} />
                    )}
                  </div>

                  <div className="space-y-3 ml-14">
                    {pregunta.opciones && pregunta.opciones.length > 0 ? (
                      pregunta.opciones.map(opcion => {
                        const isSelected = selectedOptions[pregunta.id] === opcion.id;
                        const isCorrectOption = questionResult?.correct_answer === opcion.texto;
                        
                        return (
                          <label 
                            key={opcion.id} 
                            className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              isSubmitted
                                ? isCorrectOption
                                  ? 'border-green-500/50 bg-green-900/20'
                                  : isSelected && !isCorrect
                                    ? 'border-red-500/50 bg-red-900/20'
                                    : 'border-slate-700/30 bg-slate-800/30'
                                : isSelected
                                  ? 'border-purple-500 bg-purple-900/20'
                                  : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600 hover:bg-slate-800/50'
                            } ${isSubmitted ? 'cursor-default' : ''}`}
                          >
                            <input
                              type="radio"
                              name={`pregunta-${pregunta.id}`}
                              value={opcion.id}
                              checked={isSelected}
                              onChange={() => handleOptionChange(pregunta.id, opcion.id)}
                              disabled={isSubmitted}
                              className="w-5 h-5 text-purple-600 bg-slate-700 border-slate-600 focus:ring-purple-500 focus:ring-2"
                            />
                            <span className="ml-3 text-slate-200 flex-1">{opcion.texto}</span>
                            {isSubmitted && isCorrectOption && (
                              <CheckCircle className="text-green-400 ml-2" size={20} />
                            )}
                          </label>
                        );
                      })
                    ) : (
                      <p className="text-slate-400 italic">No hay opciones disponibles para esta pregunta.</p>
                    )}
                  </div>

                  {isSubmitted && questionResult && (
                    <div className="mt-4 ml-14 pt-4 border-t border-slate-700/50">
                      <div className="flex items-start gap-2">
                        {isCorrect ? (
                          <CheckCircle className="text-green-400 flex-shrink-0 mt-0.5" size={18} />
                        ) : (
                          <XCircle className="text-red-400 flex-shrink-0 mt-0.5" size={18} />
                        )}
                        <div className="text-sm">
                          <p className={`font-semibold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                            Tu respuesta: {selectedOptionText || 'No respondida'}
                          </p>
                          {!isCorrect && (
                            <p className="text-yellow-400 mt-1">
                              Respuesta correcta: {questionResult.correct_answer}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-2xl p-8 text-center">
              <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <p className="text-yellow-300 text-lg font-medium">Esta evaluación no tiene preguntas configuradas.</p>
            </div>
          )}
        </div>

        {/* Botón de enviar */}
        {!isSubmitted && evaluation.preguntas && evaluation.preguntas.length > 0 && (
          <div className="sticky bottom-8 bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <div className="text-slate-300">
                <p className="font-medium">¿Listo para enviar?</p>
                <p className="text-sm text-slate-400">
                  {answeredQuestions === totalQuestions 
                    ? '¡Todas las preguntas respondidas!'
                    : `Faltan ${totalQuestions - answeredQuestions} preguntas por responder`
                  }
                </p>
              </div>
              <button
                onClick={handleSubmit}
                disabled={loading || answeredQuestions !== totalQuestions}
                className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-green-900/25 hover:shadow-xl hover:shadow-green-900/40 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send size={20} className="group-hover:translate-x-1 transition-transform" />
                    Enviar Evaluación
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Botón de volver al final (cuando está enviada) */}
        {isSubmitted && (
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 text-center">
            {evaluation?.Catedra?.id ? (
              <Link
                to={`/alumno/catedra/${evaluation.Catedra.id}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-purple-900/25 hover:shadow-xl hover:shadow-purple-900/40 hover:scale-105"
              >
                <ArrowLeft size={20} />
                Volver a la Cátedra
              </Link>
            ) : (
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-purple-900/25 hover:shadow-xl hover:shadow-purple-900/40 hover:scale-105"
              >
                <ArrowLeft size={20} />
                Volver
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RealizarEvaluacionPage;