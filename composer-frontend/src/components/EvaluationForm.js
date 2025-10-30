import React, { useState, useEffect } from 'react';
import api from '../api';
import toast from 'react-hot-toast';

function EvaluationForm({ catedraId, onSubmit, loading, onCancel, userType = 'admin', initialData = null, isEditMode = false }) {
  const [prompt, setPrompt] = useState('');
  const [subject, setSubject] = useState('');
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const [numberOfOptions, setNumberOfOptions] = useState(4);
  const [selectedUnidadId, setSelectedUnidadId] = useState('');

  useEffect(() => {
    if (initialData?.unidadPlanId) {
      setSelectedUnidadId(initialData.unidadPlanId);
    }
  }, [initialData]);


  const handleSubmit = (e) => {
    e.preventDefault();
    if (prompt.trim() && subject.trim() && numberOfQuestions > 0 && numberOfOptions > 0) {
      onSubmit(prompt, subject, numberOfQuestions, numberOfOptions, selectedUnidadId ? parseInt(selectedUnidadId, 10) : null);
    }
  };

  const renderNumberOptions = (min, max) => {
    const options = [];
    for (let i = min; i <= max; i++) {
      options.push(<option key={i} value={i}>{i}</option>);
    }
    return options;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-gray-300">
          Asunto del Examen:
        </label>
        <input
          type="text"
          id="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="mt-1 block w-full p-3 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:ring-purple-500 focus:border-purple-500"
          placeholder="Ej: Historia de la Música, Armonía I"
          required
        />
      </div>
      <div>
        <label htmlFor="prompt" className="block text-sm font-medium text-gray-300">
          Prompt para la IA:
        </label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows="5"
          className="mt-1 block w-full p-3 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:ring-purple-500 focus:border-purple-500"
          placeholder="Ej: Genera preguntas sobre el período barroco, enfocándose en Vivaldi y Bach."
          required
        ></textarea>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="numberOfQuestions" className="block text-sm font-medium text-gray-300">
            Cantidad de Preguntas:
          </label>
          <select
            id="numberOfQuestions"
            value={numberOfQuestions}
            onChange={(e) => setNumberOfQuestions(parseInt(e.target.value, 10))}
            className="mt-1 block w-full p-3 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:ring-purple-500 focus:border-purple-500"
            required
          >
            {renderNumberOptions(1, 50)}
          </select>
        </div>
        <div>
          <label htmlFor="numberOfOptions" className="block text-sm font-medium text-gray-300">
            Cantidad de Opciones por Pregunta:
          </label>
          <select
            id="numberOfOptions"
            value={numberOfOptions}
            onChange={(e) => setNumberOfOptions(parseInt(e.target.value, 10))}
            className="mt-1 block w-full p-3 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:ring-purple-500 focus:border-purple-500"
            required
          >
            {renderNumberOptions(2, 5)}
          </select>
        </div>
      </div>
      <div className="flex items-center justify-end space-x-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 bg-gray-600 rounded-md hover:bg-gray-500 text-white font-semibold"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-purple-600 rounded-md hover:bg-purple-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? 'Generando...' : 'Generar Evaluación'}
        </button>
      </div>
    </form>
  );
}

export default EvaluationForm;
