import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, AlertCircle, ArrowLeft, Award, TrendingUp } from 'lucide-react';
import api from '../api';

function DocenteEvaluationResultsPage() {
  const { catedraId, alumnoId, evaluationId } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showOnlyIncorrect, setShowOnlyIncorrect] = useState(false);

  const fetchResults = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.getDocenteEvaluationResults(catedraId, alumnoId, evaluationId);
      setResults(response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Error al cargar los resultados de la evaluación.';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [catedraId, alumnoId, evaluationId]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

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

  const filteredQuestions = showOnlyIncorrect
    ? results.questions.filter(q => q.alumnoAnswerId !== q.correctAnswerId)
    : results.questions;

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
              {results.evaluationTitle}
            </h1>
          </div>
          <p className="text-center text-gray-300 mb-4">
            Alumno: {results.alumnoNombre} {results.alumnoApellido}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {/* Score Card */}
            <div className={`p-4 rounded-xl text-center ${isPassing ? 'bg-green-500/20 border-2 border-green-500' : 'bg-red-500/20 border-2 border-red-500'}`}>
              <p className="text-sm text-gray-300 mb-1">Calificación</p>
              <p className="text-3xl font-bold">{percentage}%</p>
              <p className="text-sm text-gray-300 mt-1">
                {results.score} / {results.totalQuestions} preguntas correctas
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
              <TrendingUp className="w-8 h-8 mx-auto mb-2" />
              <p className="text-lg font-semibold">
                {isPassing ? '¡Aprobado!' : 'Requiere mejora'}
              </p>
            </div>
          </div>
        </div>

        {/* Filter Toggle */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => setShowOnlyIncorrect(!showOnlyIncorrect)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              showOnlyIncorrect
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            {showOnlyIncorrect ? 'Mostrar todas' : 'Solo incorrectas'}
          </button>
        </div>

        {/* Questions List */}
        <div className="space-y-6">
          {filteredQuestions.map((question, index) => {
            const isCorrectAnswer = question.alumnoAnswerId === question.correctAnswerId;
            const originalIndex = results.questions.indexOf(question);

            return (
              <div
                key={question.id}
                className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/20 hover:border-white/30 transition-all"
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
                      <span className="text-purple-400">#{originalIndex + 1}</span> {question.text}
                    </p>
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-2 ml-11">
                  {question.options.map((option) => {
                    const isCorrect = option.id === question.correctAnswerId;
                    const isAlumnoSelected = option.id === question.alumnoAnswerId;

                    let optionClass = 'bg-gray-800/30 border-gray-700';
                    let icon = null;

                    if (isAlumnoSelected && !isCorrect) {
                      optionClass = 'bg-red-900/30 border-red-600';
                      icon = <XCircle className="w-5 h-5 text-red-400" />;
                    } else if (isCorrect) {
                      optionClass = 'bg-green-900/30 border-green-600';
                      icon = <CheckCircle className="w-5 h-5 text-green-400" />;
                    }

                    return (
                      <div
                        key={option.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${optionClass}`}
                      >
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          checked={isAlumnoSelected || isCorrect}
                          disabled
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
                            Tu respuesta
                          </span>
                        )}
                      </div>
                    );
                  })}
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
            Volver a Evaluaciones
          </button>
        </div>
      </div>
    </div>
  );
}

export default DocenteEvaluationResultsPage;
