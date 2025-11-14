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
    const [unidadContent, setUnidadContent] = useState('');
    const [selectedUnidades, setSelectedUnidades] = useState([]);
    const [planesDeClase, setPlanesDeClase] = useState([]);

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

    const fetchPlanesDeClase = useCallback(async () => {
        try {
            const response = await api.getDocentePlanesDeClase(catedraId);
            setPlanesDeClase(response.data);
        } catch (err) {
            toast.error('Error al cargar los planes de clase.');
            console.error('Error fetching planes de clase:', err);
        }
    }, [catedraId]);

    useEffect(() => {
        fetchCatedra();
        fetchPlanesDeClase();
    }, [fetchCatedra, fetchPlanesDeClase]);

    useEffect(() => {
        const content = selectedUnidades
            .map(unidad => unidad.contenido)
            .filter(Boolean) // Filtrar contenidos nulos o vacíos
            .join('\n\n--- NUEVA UNIDAD ---\n\n');
        setUnidadContent(content);
    }, [selectedUnidades]);

    const handleSelectUnidad = (unidad) => {
        setSelectedUnidades(prev =>
            prev.some(u => u.id === unidad.id)
                ? prev.filter(u => u.id !== unidad.id)
                : [...prev, unidad]
        );
    };

    const handleGenerateEvaluation = async (e) => {
        e.preventDefault();
        console.log('[DEBUG] handleGenerateEvaluation called. Current state:', { topic, numberOfQuestions, numberOfOptions, unidadContent, selectedUnidades });
        setIsGenerating(true);
        setErrorCatedra(''); // Clear previous errors

        const data = {
            topic,
            subject: catedra?.nombre, // Use catedra name as subject for AI context
            numberOfQuestions: parseInt(numberOfQuestions, 10),
            numberOfOptions: parseInt(numberOfOptions, 10),
            unidadContent, // Añadir el contenido de las unidades
        };

        try {
            console.log('[FRONTEND] Sending generate evaluation request with data:', data);
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

                    <div className="bg-gray-800 p-4 rounded-md shadow-inner">
                        <h3 className="text-xl font-semibold text-gray-200 mb-4">Unidades del Plan de Clases</h3>
                        {planesDeClase.length > 0 ? (
                            planesDeClase.map(plan => (
                                <div key={plan.id} className="mb-6">
                                    <h4 className="text-lg font-medium text-green-400 mb-3">Plan: {plan.titulo} ({plan.tipoOrganizacion})</h4>
                                    {plan.UnidadPlan && plan.UnidadPlan.length > 0 ? (
                                        <div className="space-y-2">
                                            {plan.UnidadPlan.map(unidad => (
                                                <div
                                                    key={unidad.id}
                                                    className={`flex items-center p-3 rounded-md cursor-pointer transition-all duration-200 ${selectedUnidades.some(u => u.id === unidad.id) ? 'bg-green-700 hover:bg-green-600 shadow-md' : 'bg-gray-700 hover:bg-gray-600'}`}
                                                    onClick={() => handleSelectUnidad(unidad)}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedUnidades.some(u => u.id === unidad.id)}
                                                        readOnly
                                                        className="form-checkbox h-5 w-5 text-green-500 rounded border-gray-500 bg-gray-600 cursor-pointer"
                                                    />
                                                    <span className={`ml-3 text-sm font-medium ${selectedUnidades.some(u => u.id === unidad.id) ? 'text-white' : 'text-gray-200'}`}>
                                                        Unidad {unidad.periodo}: {unidad.contenido.substring(0, 100)}...
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-400">No hay unidades para este plan.</p>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-400">No se encontraron planes de clase con unidades.</p>
                        )}
                        {selectedUnidades.length > 0 && (
                            <div className="mt-4 p-3 bg-green-800/30 rounded-md">
                                <h5 className="text-md font-semibold text-green-200 mb-2">Contenido de Unidades Seleccionadas (para IA):</h5>
                                <p className="text-sm text-green-100 italic max-h-40 overflow-y-auto custom-scrollbar">{unidadContent || 'Ningún contenido de unidad seleccionado.'}</p>
                            </div>
                        )}
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
