import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';

const DocenteGenerateEvaluationPage = () => {
    const { catedraId } = useParams();
    const navigate = useNavigate();
    const [catedra, setCatedra] = useState(null);
    const [loadingCatedra, setLoadingCatedra] = useState(true);
    const [errorCatedra, setErrorCatedra] = useState('');

    const [topic, setTopic] = useState('');
    const [numberOfQuestions, setNumberOfQuestions] = useState(5);
    const [numberOfOptions, setNumberOfOptions] = useState(4);
    const [isGenerating, setIsGenerating] = useState(false);

    const fetchCatedra = useCallback(async () => {
        try {
            setLoadingCatedra(true);
            const response = await api.getDocenteCatedra(catedraId);
            setCatedra(response.data);
        } catch (err) {
            setErrorCatedra(err.response?.data?.message || 'Error al cargar los detalles de la cátedra.');
        } finally {
            setLoadingCatedra(false);
        }
    }, [catedraId]);

    useEffect(() => {
        fetchCatedra();
    }, [fetchCatedra]);

    const handleGenerateEvaluation = async (e) => {
        e.preventDefault();
        setIsGenerating(true);
        setErrorCatedra(''); // Clear previous errors

        try {
            const data = {
                topic,
                subject: catedra?.nombre, // Use catedra name as subject for AI context
                numberOfQuestions: parseInt(numberOfQuestions, 10),
                numberOfOptions: parseInt(numberOfOptions, 10),
            };
            await api.generateDocenteEvaluation(catedraId, data);
            toast.success('Evaluación generada y guardada exitosamente!');
            navigate(`/docente/catedras/${catedraId}`); // Go back to catedra detail page after generation
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error al generar la evaluación.');
            setErrorCatedra(err.response?.data?.error || 'Error al generar la evaluación.');
        } finally {
            setIsGenerating(false);
        }
    };

    if (loadingCatedra) {
        return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-8 flex items-center justify-center"><p className="text-center text-lg text-gray-300">Cargando cátedra...</p></div>;
    }

    if (errorCatedra) {
        return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-8 flex items-center justify-center"><p className="text-center text-red-400 text-lg">Error: {errorCatedra}</p></div>;
    }

    if (!catedra) {
        return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-8 flex items-center justify-center"><p className="text-center text-xl">Cátedra no encontrada.</p></div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-8">
            <div className="max-w-3xl mx-auto bg-white/5 backdrop-blur-lg p-8 rounded-lg shadow-xl">
                <h1 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
                    Generar Evaluación con IA para {catedra.nombre}
                </h1>

                <form onSubmit={handleGenerateEvaluation} className="space-y-6">
                    <div>
                        <label htmlFor="topic" className="block text-sm font-medium text-gray-300 mb-2">
                            Tema de la Evaluación: <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            id="topic"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            className="w-full p-3 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                            placeholder="Ej: Historia de la Música Barroca"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="numberOfQuestions" className="block text-sm font-medium text-gray-300 mb-2">
                            Número de Preguntas: <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="number"
                            id="numberOfQuestions"
                            value={numberOfQuestions}
                            onChange={(e) => setNumberOfQuestions(Math.max(1, parseInt(e.target.value, 10) || 1))}
                            min="1"
                            max="20"
                            className="w-full p-3 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="numberOfOptions" className="block text-sm font-medium text-gray-300 mb-2">
                            Número de Opciones por Pregunta: <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="number"
                            id="numberOfOptions"
                            value={numberOfOptions}
                            onChange={(e) => setNumberOfOptions(Math.max(2, Math.min(6, parseInt(e.target.value, 10) || 2)))}
                            min="2"
                            max="6"
                            className="w-full p-3 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                            required
                        />
                    </div>

                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-6 py-3 border border-gray-600 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 transition-colors duration-300"
                            disabled={isGenerating}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isGenerating}
                        >
                            {isGenerating ? (
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : null}
                            {isGenerating ? 'Generando...' : 'Generar Evaluación'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DocenteGenerateEvaluationPage;
