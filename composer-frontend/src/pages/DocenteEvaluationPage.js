import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import EvaluationForm from '../components/EvaluationForm';
import api from '../api';

function DocenteEvaluationPage() {
  const { catedraId, evaluationId } = useParams();
  const navigate = useNavigate();
  const [evaluationData, setEvaluationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  const fetchEvaluation = async () => {
    try {
      const response = await api.getEvaluationById(evaluationId);
      const formattedEvaluation = {
        title: response.data.titulo,
        questions: response.data.preguntas.map(q => ({
          id: q.id,
          text: q.texto,
          options: q.opciones.map(o => ({
            id: o.id,
            text: o.texto
          })),
          correctAnswer: q.opciones.find(o => o.es_correcta)?.id || null,
        })),
      };
      setEvaluationData(formattedEvaluation);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar la evaluación.');
      toast.error(err.response?.data?.error || 'Error al cargar la evaluación.');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleGenerateEvaluation = async (prompt, subject, numberOfQuestions, numberOfOptions) => {
    setLoading(true);
    setError(null);
    setEvaluationData(null);

    if (!catedraId) {
      toast.error('ID de cátedra no disponible.');
      setLoading(false);
      return;
    }

    try {
      const response = await api.generateDocenteEvaluation(catedraId, {
        topic: prompt,
        subject: subject,
        numberOfQuestions,
        numberOfOptions,
      });
      toast.success(response.data.message || 'Evaluación generada exitosamente!');
      const formattedEvaluation = {
        title: response.data.evaluation.titulo,
        questions: response.data.evaluation.preguntas.map(q => ({
          id: q.id,
          text: q.texto,
          options: q.opciones.map(o => ({
            id: o.id,
            text: o.texto
          })),
          correctAnswer: q.opciones.find(o => o.es_correcta)?.id || null,
        })),
      };
      setEvaluationData(formattedEvaluation);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Error al generar la evaluación. Inténtalo de nuevo.';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (evaluationId) {
      fetchEvaluation();
    } else {
      setInitialLoading(false);
    }
  }, [evaluationId]);

  if (initialLoading) {
    return <div className="text-center p-8 text-white">Cargando evaluación...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate(`/docente/catedras/${catedraId}`)} className="mb-6 text-purple-400 hover:text-purple-300">
          &larr; Volver a la Cátedra
        </button>

        {!evaluationId && (
          <div className="bg-white/5 backdrop-blur-lg p-8 rounded-lg shadow-xl">
            <h1 className="text-3xl font-bold mb-6 text-center">Generar Evaluación por IA</h1>
            <p className="text-center text-gray-300 mb-8">
              Describe el tema sobre el cual la IA debe generar la evaluación. La IA creará 5 preguntas de opción múltiple con 4 opciones cada una.
            </p>
            <EvaluationForm onSubmit={handleGenerateEvaluation} loading={loading} onCancel={() => navigate(`/docente/catedras/${catedraId}`)} userType="docente" />
          </div>
        )}

        {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-md mt-8 text-center">{error}</p>}

        {evaluationData && (
          <div className="mt-8 p-8 bg-white/5 backdrop-blur-lg rounded-lg shadow-xl">
            <h2 className="text-2xl font-semibold mb-6 text-center">{evaluationData.title}</h2>
            {evaluationData.questions.map((question, index) => (
              <div key={question.id} className="mb-6 border-b border-gray-700 pb-6">
                <p className="font-medium mb-4 text-lg">{index + 1}. {question.text}</p>
                <div className="space-y-3 pl-4">
                  {question.options.map((option) => (
                    <div
                      key={option.id}
                      className={`flex items-center p-3 rounded-md transition-colors ${option.id === question.correctAnswer ? 'bg-green-800/50' : 'bg-gray-800/50'}`}
                    >
                      <label className="flex items-center w-full cursor-pointer">
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          value={option.id}
                          disabled
                          checked={option.id === question.correctAnswer}
                          className="h-4 w-4 text-purple-600 bg-gray-700 border-gray-600 focus:ring-purple-500"
                        />
                        <span className="ml-3 text-gray-300">{option.text}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
             <div className="mt-8 text-center">
                <button onClick={() => navigate(`/docente/catedras/${catedraId}`)} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg">
                    Volver a la Cátedra
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DocenteEvaluationPage;
