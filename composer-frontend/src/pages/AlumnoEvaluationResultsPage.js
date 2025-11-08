import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api';

function AlumnoEvaluationResultsPage() {
  const { catedraId, evaluationId } = useParams(); // AlumnoId will be fetched from context
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        // We will need a new API endpoint for students to get their own results
        // For now, let's assume `api.getAlumnoEvaluationResults` exists
        const response = await api.getAlumnoEvaluationResults(catedraId, evaluationId);
        setResults(response.data);
      } catch (err) {
        const errorMessage = err.response?.data?.error || 'Error al cargar los resultados de la evaluación.';
        setError(errorMessage);
        toast.error(errorMessage);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [catedraId, evaluationId]);

  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-8">Cargando resultados...</div>;
  }

  if (error) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-8 text-red-400 text-center">{error}</div>;
  }

  if (!results) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-8 text-center">No se encontraron resultados para esta evaluación.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate(-1)} className="mb-6 text-purple-400 hover:text-purple-300">
          &larr; Volver
        </button>

        <div className="bg-white/5 backdrop-blur-lg p-8 rounded-lg shadow-xl">
          <h1 className="text-3xl font-bold mb-6 text-center">Resultados de Evaluación: {results.evaluationTitle}</h1>
          <p className="text-center text-gray-300 mb-8">
            Calificación: {results.score} / {results.totalPoints}
          </p>

          {results.questions.map((question, index) => (
            <div key={question.id} className="mb-8 border-b border-gray-700 pb-6">
              <p className="font-medium mb-4 text-lg">
                {index + 1}. {question.text}
              </p>
              <div className="space-y-3 pl-4">
                {question.options.map((option) => {
                  const isCorrect = option.id === question.correctAnswerId;
                  const isAlumnoSelected = option.id === question.alumnoAnswerId;

                  let optionClass = 'bg-gray-800/50';
                  if (isAlumnoSelected && !isCorrect) {
                    optionClass = 'bg-red-800/50'; // Alumno eligió incorrecta
                  } else if (isCorrect) {
                    optionClass = 'bg-green-800/50'; // Respuesta correcta
                  }

                  return (
                    <div
                      key={option.id}
                      className={`flex items-center p-3 rounded-md transition-colors ${optionClass}`}
                    >
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={option.id}
                        checked={isAlumnoSelected || isCorrect} // Mostrar la del alumno o la correcta
                        disabled
                        className="h-4 w-4 text-purple-600 bg-gray-700 border-gray-600 focus:ring-purple-500"
                      />
                      <span className="ml-3 text-gray-300">
                        {option.text}
                        {isCorrect && <span className="ml-2 text-green-400">(Correcta)</span>}
                        {isAlumnoSelected && !isCorrect && <span className="ml-2 text-red-400">(Tu respuesta)</span>}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="mt-8 text-center">
            <button onClick={() => navigate(-1)} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg">
              Volver
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AlumnoEvaluationResultsPage;
