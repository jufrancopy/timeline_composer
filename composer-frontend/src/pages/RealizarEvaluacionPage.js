import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';

const RealizarEvaluacionPage = () => {

  const { evaluationId } = useParams();
  const navigate = useNavigate();
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({}); // { preguntaId: opcionId }
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [results, setResults] = useState(null);

  // Función helper para obtener el estado desde EvaluacionAsignacion
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
      // No mostrar error si es 404, es normal que no existan resultados para evaluaciones pendientes
      if (err.response?.status !== 404) {
        toast.error('Error al cargar los resultados.');
      }
    }
  };

  // Mover fetchEvaluation fuera del useEffect
  const fetchEvaluation = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getEvaluationForStudent(evaluationId);

      setEvaluation(response.data);
      
      // Check if the student has already submitted this evaluation
      const studentEvalsResponse = await api.getMyEvaluations();
      const currentEvalStatus = studentEvalsResponse.data.find(ev => ev.id === parseInt(evaluationId));
      

      
      if (currentEvalStatus) {
        const estado = getEstado(currentEvalStatus);

        
        // Si está REALIZADA o CALIFICADA, cargar resultados
        if (estado === 'REALIZADA' || estado === 'CALIFICADA') {

          setIsSubmitted(true);
          toast('Ya completaste esta evaluación. Cargando resultados...', { icon: 'ℹ️' });
          await fetchResults();
        } else {
        }
      } else {
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
      console.error('[HANDLE SUBMIT] Error al enviar la evaluación. Full error object:', err);
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

  if (loading) return <div className="text-center p-8 text-white">Cargando evaluación...</div>;
  if (error) {

    return <div className="text-center p-8 text-red-400">{error}</div>;
  }
  if (!evaluation) {

    return <div className="text-center p-8 text-white">No se encontró la evaluación.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-lg p-8 rounded-lg shadow-xl">
        <h2 className="text-4xl font-bold text-center mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          {evaluation.titulo}
        </h2>
        <p className="text-center text-lg text-gray-300 mb-8">Cátedra: {evaluation.Catedra ? evaluation.Catedra.nombre : 'N/A'}</p>

        {isSubmitted && score !== null && (
          <div className="bg-green-700/30 p-4 rounded-md mb-6 text-center">
            <h3 className="text-2xl font-bold text-green-300">¡Evaluación Completada!</h3>
            <p className="text-xl">Tu puntaje: <span className="font-bold">{score}%</span></p>
          </div>
        )}

        {evaluation.preguntas && evaluation.preguntas.length > 0 ? (
          evaluation.preguntas.map((pregunta, index) => (
            <div key={pregunta.id} className="mb-8 p-6 bg-gray-800 rounded-lg shadow-md border border-gray-700">
              <p className="text-xl font-semibold mb-4 text-purple-300">{index + 1}. {pregunta.texto}</p>
              <div className="space-y-3">
                {pregunta.opciones && pregunta.opciones.length > 0 ? (
                  pregunta.opciones.map(opcion => (
                    <label key={opcion.id} className="flex items-center text-lg cursor-pointer">
                      <input
                        type="radio"
                        name={`pregunta-${pregunta.id}`}
                        value={opcion.id}
                        checked={selectedOptions[pregunta.id] === opcion.id}
                        onChange={() => handleOptionChange(pregunta.id, opcion.id)}
                        disabled={isSubmitted}
                        className="form-radio h-5 w-5 text-purple-600 bg-gray-700 border-gray-600 focus:ring-purple-500"
                      />
                      <span className="ml-3 text-gray-200">{opcion.texto}</span>
                    </label>
                  ))
                ) : (
                  <p className="text-gray-400">No hay opciones disponibles para esta pregunta.</p>
                )}
              </div>

              {isSubmitted && results && results.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  {(() => {
                    const questionResult = results.find(r => r.pregunta === pregunta.texto);
                    if (questionResult) {
                      const selectedOptionText = questionResult.opciones.find(opt => opt.seleccionada)?.texto;
                      const isCorrect = questionResult.es_correcta_alumno;

                      return (
                        <div className="text-sm">
                          <p className={`font-semibold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                            Tu respuesta: {selectedOptionText || 'No respondida'} {isCorrect ? '✅' : '❌'}
                          </p>
                          {!isCorrect && (
                            <p className="text-yellow-400">Correcta: {questionResult.correct_answer}</p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center p-8 bg-yellow-600/20 rounded-lg border border-yellow-500/30">
            <p className="text-yellow-300 text-lg">Esta evaluación no tiene preguntas configuradas.</p>
          </div>
        )}

        {!isSubmitted && evaluation.preguntas && evaluation.preguntas.length > 0 && (
          <div className="mt-8 text-center">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 text-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Enviando...' : 'Enviar Evaluación'}
            </button>
          </div>
        )}

        {isSubmitted && (
          <div className="mt-8 text-center">
            <button
              onClick={() => navigate(-1)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 text-xl"
            >
              Volver a Mis Evaluaciones
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealizarEvaluacionPage;