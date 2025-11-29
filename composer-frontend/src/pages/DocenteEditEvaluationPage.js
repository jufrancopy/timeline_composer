import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, AlertCircle, ArrowLeft, Award, Save, Loader } from 'lucide-react';
import api from '../api';

function DocenteEditEvaluationPage() {
  const { catedraId, alumnoId: studentId, asignacionId } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [modifiedAnswers, setModifiedAnswers] = useState({});

  const fetchResults = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.getDocenteEvaluationResultsByAssignmentId(asignacionId);
      setResults(response.data);
      
      // Inicializar modifiedAnswers con las respuestas actuales del alumno
      const initialAnswers = {};
      response.data.questions.forEach(question => {
        initialAnswers[question.id] = question.alumnoAnswerId;
      });
      setModifiedAnswers(initialAnswers);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Error al cargar los resultados de la evaluación.';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [catedraId, studentId, asignacionId]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const handleAnswerChange = (questionId, answerId) => {
    setModifiedAnswers(prev => ({
      ...prev,
      [questionId]: answerId
    }));
  };

  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      
      // Preparar datos para enviar
      const updates = Object.entries(modifiedAnswers).map(([questionId, answerId]) => ({
        questionId: parseInt(questionId),
        answerId: answerId
      }));

      await api.updateAlumnoEvaluationAnswers(asignacionId, studentId, updates);

      toast.success('¡Respuestas actualizadas correctamente!');
      
      // Recargar los resultados para reflejar los cambios
      fetchResults();
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Error al guardar los cambios.';
      toast.error(errorMessage);
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = () => {
    if (!results) return false;
    
    return results.questions.some(question => {
      return modifiedAnswers[question.id] !== question.alumnoAnswerId;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mb-4"></div>
          <p className="text-lg">Cargando resultados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-8">
        <div className="max-w-2xl mx-auto text-center">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Error al cargar resultados</h2>
          <p className="text-red-400 mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-8">
        <div className="max-w-2xl mx-auto text-center">
          <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Sin resultados</h2>
          <p className="text-gray-300 mb-6">No se encontraron resultados para esta evaluación.</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  const percentage = ((results.score / results.totalQuestions) * 100).toFixed(1);
  const isPassing = percentage >= 60;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Volver</span>
        </button>

        {/* Results Summary Card */}
        <div className="bg-white/10 backdrop-blur-xl p-6 md:p-8 rounded-2xl shadow-2xl mb-6 border border-white/20">
          <div className="flex items-center justify-center mb-4">
            <Award className="w-10 h-10 text-yellow-400 mr-3" />
            <h1 className="text-2xl md:text-3xl font-bold text-center">
              Editando Respuestas: {results.evaluationTitle}
            </h1>
          </div>
          <p className="text-center text-gray-300 mb-4">
            Alumno: {results.alumnoNombre} {results.alumnoApellido}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {/* Score Card */}
            <div className={`p-4 rounded-xl text-center ${isPassing ? 'bg-green-500/20 border-2 border-green-500' : 'bg-red-500/20 border-2 border-red-500'}`}>
              <p className="text-sm text-gray-300 mb-1">Calificación Actual</p>
              <p className="text-3xl font-bold">{percentage}%</p>
              <p className="text-sm text-gray-300 mt-1">
                {results.score} / {results.totalQuestions} correctas
              </p>
            </div>

            {/* Aciertos Card */}
            <div className="bg-blue-500/20 border-2 border-blue-500 p-4 rounded-xl text-center">
              <p className="text-sm text-gray-300 mb-1">Aciertos</p>
              <p className="text-3xl font-bold">
                {results.score}/{results.totalQuestions}
              </p>
              <p className="text-sm text-gray-300 mt-1">
                {((results.score / results.totalQuestions) * 100).toFixed(0)}% correctas
              </p>
            </div>

            {/* Status Card */}
            <div className="bg-purple-500/20 border-2 border-purple-500 p-4 rounded-xl text-center flex flex-col justify-center">
              <p className="text-lg font-semibold mb-2">
                {isPassing ? '¡Aprobado!' : 'Requiere mejora'}
              </p>
              <p className="text-sm text-gray-300">
                Editando respuestas
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mb-6 flex justify-between items-center">
          <div className="text-sm text-gray-300">
            {hasChanges() ? (
              <span className="text-yellow-400">• Tienes cambios sin guardar</span>
            ) : (
              <span>• Todas las respuestas están guardadas</span>
            )}
          </div>
          <button
            onClick={handleSaveChanges}
            disabled={!hasChanges() || saving}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            {saving ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Guardar Cambios
              </>
            )}
          </button>
        </div>

        {/* Questions List */}
        <div className="space-y-6">
          {results.questions.map((question, index) => {
            const currentAnswer = modifiedAnswers[question.id];
            const isCorrectAnswer = currentAnswer === question.correctAnswerId;
            const wasOriginallyCorrect = question.alumnoAnswerId === question.correctAnswerId;
            const hasChanged = currentAnswer !== question.alumnoAnswerId;

            return (
              <div
                key={question.id}
                className={`bg-white/10 backdrop-blur-xl p-6 rounded-2xl shadow-xl border transition-all ${
                  hasChanged ? 'border-yellow-400/50' : 'border-white/20'
                } hover:border-white/30`}
              >
                {/* Question Header */}
                <div className="flex items-start gap-3 mb-4">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    isCorrectAnswer ? 'bg-green-500' : 'bg-red-500'
                  }`}>
                    {isCorrectAnswer ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <XCircle className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-lg leading-relaxed">
                      <span className="text-purple-400">#{index + 1}</span> {question.text}
                    </p>
                    {hasChanged && (
                      <div className="mt-2 flex items-center gap-2 text-yellow-400 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>Respuesta modificada</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-2 ml-11">
                  {question.options.map((option) => {
                    const isCorrect = option.id === question.correctAnswerId;
                    const isAlumnoSelected = option.id === currentAnswer;
                    const wasOriginallySelected = option.id === question.alumnoAnswerId;

                    let optionClass = 'bg-gray-800/30 border-gray-700';
                    let icon = null;

                    if (isAlumnoSelected && !isCorrect) {
                      optionClass = 'bg-red-900/30 border-red-600';
                      icon = <XCircle className="w-5 h-5 text-red-400" />;
                    } else if (isCorrect) {
                      optionClass = 'bg-green-900/30 border-green-600';
                      icon = <CheckCircle className="w-5 h-5 text-green-400" />;
                    } else if (isAlumnoSelected) {
                      optionClass = 'bg-blue-900/30 border-blue-600';
                    }

                    return (
                      <div
                        key={option.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all cursor-pointer ${optionClass} ${
                          isAlumnoSelected ? 'ring-2 ring-blue-400' : ''
                        }`}
                        onClick={() => handleAnswerChange(question.id, option.id)}
                      >
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          checked={isAlumnoSelected}
                          onChange={() => handleAnswerChange(question.id, option.id)}
                          className="h-4 w-4 text-purple-600"
                        />
                        <span className="flex-1 text-gray-200">{option.text}</span>
                        {icon && <span className="flex-shrink-0">{icon}</span>}
                        {isCorrect && (
                          <span className="text-xs font-semibold text-green-400 bg-green-900/50 px-2 py-1 rounded">
                            Correcta
                          </span>
                        )}
                        {isAlumnoSelected && !isCorrect && (
                          <span className="text-xs font-semibold text-red-400 bg-red-900/50 px-2 py-1 rounded">
                            Seleccionada
                          </span>
                        )}
                        {wasOriginallySelected && hasChanged && (
                          <span className="text-xs font-semibold text-yellow-400 bg-yellow-900/50 px-2 py-1 rounded">
                            Original
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Answer Summary */}
                <div className="mt-4 ml-11 text-sm text-gray-300">
                  <p>
                    <strong>Respuesta original:</strong> {
                      question.options.find(opt => opt.id === question.alumnoAnswerId)?.text || 'No respondida'
                    }
                  </p>
                  {hasChanged && (
                    <p className="text-yellow-400">
                      <strong>Respuesta actual:</strong> {
                        question.options.find(opt => opt.id === currentAnswer)?.text
                      }
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate(-1)}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all transform hover:scale-105"
          >
            Volver a Resultados
          </button>
        </div>
      </div>
    </div>
  );
}

export default DocenteEditEvaluationPage;