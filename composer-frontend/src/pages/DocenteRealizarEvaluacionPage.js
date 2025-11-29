import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useMatch } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import {
  ArrowLeft, BookOpen, BookMarked, Target, Calendar,
  CheckCircle, XCircle, Clock, Award, Send, Loader,
  AlertCircle, Trophy, TrendingUp
} from 'lucide-react';

const DocenteRealizarEvaluacionPage = () => {
  console.log("[DocenteRealizarEvaluacionPage] Componente cargado.");
  const { catedraId, alumnoId, evaluationId } = useParams();
  const navigate = useNavigate();
  const [evaluation, setEvaluation] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const isReviewMode = useMatch('/docente/catedra/:catedraId/alumno/:alumnoId/evaluacion/:evaluationId/realizar'); // O la ruta que definas para revisión

  const getEstado = (evaluacion) => {
    if (evaluacion?.EvaluacionAsignacion && evaluacion.EvaluacionAsignacion.length > 0) {
      return evaluacion.EvaluacionAsignacion[0].estado;
    }
    return evaluacion?.estado || 'PENDIENTE';
  };

  const fetchResults = async (currentCatedraId) => {
    try {
      console.log("[FETCH RESULTS] Attempting to fetch results for evaluation ID:", evaluationId);
      const response = await api.getDocenteEvaluationResults(currentCatedraId, alumnoId, evaluationId);
      console.log("[FETCH RESULTS] API response for results:", response.data);
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
      const response = await api.getEvaluationDetailForDocente(evaluationId);
      setEvaluation(response.data);
      console.log("[DocenteRealizarEvaluacionPage] Evaluación cargada:", response.data);
      console.log("[DEBUG] Contenido de evaluation.Pregunta:", response.data.Pregunta);

      const studentEvalsResponse = await api.getEvaluacionesForAlumno(catedraId, alumnoId);
      const currentEvalStatus = studentEvalsResponse.data.find(ev => ev.id === parseInt(evaluationId));

      if (currentEvalStatus) {
        const estado = currentEvalStatus.estado;

        if (estado === 'REALIZADA' || estado === 'CALIFICADA') {
          setIsSubmitted(true);
          // Fetch student's existing results
          try {
            const resultsResponse = await api.getDocenteEvaluationResults(catedraId, alumnoId, evaluationId);
            console.log("[FETCH RESULTS] API response for results:", resultsResponse.data);
            setScore(resultsResponse.data.score);
            setResults(resultsResponse.data.results);

            // Populate selectedOptions with student's previous answers
            // Populate selectedOptions with student's previous answers
            const initialSelected = {};
            if (resultsResponse.data.results && Array.isArray(resultsResponse.data.results)) {
              resultsResponse.data.results.forEach(qResult => {
                console.log("[DEBUG] Processing qResult:", qResult);
                const matchingQuestion = response.data.Pregunta.find(q => q.texto === qResult.pregunta);
                if (matchingQuestion) {
                  console.log("[DEBUG] Found matching question:", matchingQuestion);
                  // Find the option selected by the student using the stored alumnoAnswerId
                  const alumnoSelectedOptionId = qResult.alumnoAnswerId;
                  if (alumnoSelectedOptionId) {
                    const matchingOption = matchingQuestion.Opcion.find(o => o.id === alumnoSelectedOptionId);
                    if (matchingOption) {
                      initialSelected[matchingQuestion.id] = matchingOption.id;
                      console.log("[DEBUG] Mapping question ID to option ID:", matchingQuestion.id, matchingOption.id);
                    }
                  }
                }
              });
            }
            console.log("[DEBUG] Final initialSelected object:", initialSelected);
            setSelectedOptions(initialSelected);
            toast.success('Esta evaluación ya ha sido completada por el alumno o calificada. Mostrando sus respuestas para edición.');
          } catch (resultsError) {
            console.error('[FETCH RESULTS] Error al cargar los resultados de la evaluación:', resultsError);
            if (resultsError.response?.status !== 404) {
              toast.error('Error al cargar los resultados previos del alumno.');
            }
            setIsSubmitted(false); // If results can't be loaded, treat as not submitted for manual input
          }
        } else {
          setIsSubmitted(false);
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
  }, [evaluationId, catedraId, alumnoId]);

  const handleSubmit = async () => {
    // El docente está completando por el alumno, no se necesita verificar isSubmitted aquí.
    // Las preguntas siempre deben ser respondidas.
    if (!evaluation || !evaluation.Pregunta || evaluation.Pregunta.length === 0) {
      toast.error('No hay preguntas disponibles para esta evaluación.');
      return;
    }

    if (Object.keys(selectedOptions).length !== evaluation.Pregunta.length) {
      toast.error('Por favor, selecciona una respuesta para cada pregunta antes de guardar.');
      return;
    }
    setLoading(true);
    try {
      const response = await api.submitEvaluationManuallyByDocente(catedraId, alumnoId, evaluationId, selectedOptions);
      toast.success('¡Evaluación completada manualmente y guardada con éxito!');
      navigate(`/docente/catedra/${catedraId}/alumno/${alumnoId}`);
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
  const totalQuestions = evaluation.Pregunta?.length || 0;
  const progress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header con botón de volver */}
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
          <button
            onClick={() => {
              navigate(`/docente/catedra/${catedraId}/alumno/${alumnoId}`);
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

{/* La sección de resultados de evaluación no es necesaria para el flujo del docente */}
        {/* {!isSubmitted && totalQuestions > 0 && (
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
        )} */}



        {/* Preguntas */}
        <div className="space-y-4">
          {evaluation.Pregunta && evaluation.Pregunta.length > 0 ? (
            evaluation.Pregunta.map((pregunta, index) => {
              // Ya tenemos selectedOptions que guarda las respuestas del alumno.
              const selectedAnswerId = selectedOptions[pregunta.id];
              const correctAnswerId = pregunta.Opcion.find(o => o.es_correcta)?.id;
              const isCorrect = selectedAnswerId === correctAnswerId;

              return (
                <div 
                  key={pregunta.id} 
                  className={`bg-slate-900/50 backdrop-blur-xl rounded-2xl border p-6 transition-all ${
                    isSubmitted
                      ? (isCorrect
                        ? 'border-green-500/50 bg-green-900/10'
                        : selectedAnswerId
                          ? 'border-red-500/50 bg-red-900/10'
                          : 'border-slate-700/50')
                      : (selectedOptions[pregunta.id]
                        ? 'border-purple-500/50'
                        : 'border-slate-700/50')
                  }`}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 font-bold ${selectedOptions[pregunta.id]
                          ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                          : 'bg-slate-700/50 text-slate-400 border border-slate-600/50'
                    }`}>
                      {index + 1}
                    </div>
                    <p className="text-lg text-white font-medium flex-1">{pregunta.texto}</p>
                  </div>

                  <div className="space-y-3 ml-14">
                    {pregunta.Opcion && pregunta.Opcion.length > 0 ? (
                      pregunta.Opcion.map(opcion => {
                        const isSelected = selectedOptions[pregunta.id] === opcion.id;
                        const isCorrectOption = opcion.es_correcta;
                        
                        return (
                          <label 
                            key={opcion.id} 
                            className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              isSubmitted
                                ? (opcion.es_correcta
                                  ? 'border-green-500 bg-green-900/20' // Correct answer
                                  : (isSelected && !opcion.es_correcta
                                    ? 'border-red-500 bg-red-900/20' // Student's incorrect answer
                                    : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600 hover:bg-slate-800/50')) // Other options in submitted mode
                                : (isSelected
                                  ? 'border-purple-500 bg-purple-900/20' // Teacher's current selection (not submitted yet)
                                  : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600 hover:bg-slate-800/50') // Default for non-selected
                            }`}
                          >
                            <input
                              type="radio"
                              name={`pregunta-${pregunta.id}`}
                              value={opcion.id}
                              checked={isSelected}
                              onChange={() => handleOptionChange(pregunta.id, opcion.id)}
                              className="w-5 h-5 text-purple-600 bg-slate-700 border-slate-600 focus:ring-purple-500 focus:ring-2"
                            />
                            <span className="ml-3 text-slate-200 flex-1">
                              {opcion.texto}
                              {isSubmitted && opcion.es_correcta && (
                                <CheckCircle size={16} className="text-green-400 ml-2 inline-block" />
                              )}
                              {isSubmitted && isSelected && !opcion.es_correcta && (
                                <XCircle size={16} className="text-red-400 ml-2 inline-block" />
                              )}
                            </span>
                          </label>
                        );
                      })
                    ) : (
                      <p className="text-slate-400 italic">No hay opciones disponibles para esta pregunta.</p>
                    )}
                  </div>

                  {isSubmitted && (
                    <div className="mt-4 pt-4 border-t border-slate-700/50 ml-14">
                      <p className="text-sm font-medium text-slate-300 mb-2">Resultados:</p>
                      {selectedOptions[pregunta.id] === pregunta.Opcion.find(o => o.es_correcta)?.id ? (
                        <div className="flex items-center gap-2 text-green-400">
                          <CheckCircle size={18} />
                          <span>¡Correcto!</span>
                        </div>
                      ) : selectedOptions[pregunta.id] ? (
                        <>
                          <div className="flex items-center gap-2 text-red-400">
                            <XCircle size={18} />
                            <span>Incorrecto.</span>
                          </div>
                          <p className="text-sm text-slate-400 mt-2">
                            Tu respuesta: <span className="font-semibold text-red-300">
                              {pregunta.Opcion.find(o => o.id === selectedAnswerId)?.texto || 'N/A'}
                            </span>
                          </p>
                        </>
                      ) : null }
                      {pregunta.Opcion.find(o => o.es_correcta) && (
                        <p className="text-sm text-slate-400 mt-2">
                          Respuesta correcta: <span className="font-semibold text-emerald-300">{pregunta.Opcion.find(o => o.es_correcta)?.texto}</span>
                        </p>
                      )}
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
        {evaluation.Pregunta && evaluation.Pregunta.length > 0 && (
          <div className="sticky bottom-8 bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <div className="text-slate-300">
                <p className="font-medium">¿Listo para guardar?</p>
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
                    Guardando...
                  </>
                ) : (
                  <>
                    <Send size={20} className="group-hover:translate-x-1 transition-transform" />
                    Guardar Evaluación Manual
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocenteRealizarEvaluacionPage;