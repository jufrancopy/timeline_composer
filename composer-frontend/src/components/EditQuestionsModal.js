import React, { useState } from 'react';
import toast from 'react-hot-toast';

function EditQuestionsModal({ isOpen, onClose, evaluation, onSave, loading }) {
  const [questions, setQuestions] = useState(evaluation?.Pregunta || []);
  const [saving, setSaving] = useState(false);

  const handleQuestionChange = (questionIndex, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      [field]: value
    };
    setQuestions(updatedQuestions);
  };

  const handleOptionChange = (questionIndex, optionIndex, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].Opcion[optionIndex] = {
      ...updatedQuestions[questionIndex].Opcion[optionIndex],
      [field]: value
    };
    setQuestions(updatedQuestions);
  };

  const handleCorrectAnswerChange = (questionIndex, correctOptionId) => {
    const updatedQuestions = [...questions];
    
    // Reset all options to not correct
    updatedQuestions[questionIndex].Opcion = updatedQuestions[questionIndex].Opcion.map(option => ({
      ...option,
      es_correcta: option.id === correctOptionId
    }));
    
    setQuestions(updatedQuestions);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(questions);
      toast.success('Preguntas actualizadas exitosamente');
      onClose();
    } catch (error) {
      toast.error('Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Editar Preguntas y Respuestas</h2>
          <p className="text-gray-300 mt-2">{evaluation?.titulo}</p>
        </div>

        <div className="p-6">
          {questions.map((question, questionIndex) => (
            <div key={question.id} className="mb-8 p-4 bg-gray-700 rounded-lg">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Pregunta {questionIndex + 1}
                </label>
                <textarea
                  value={question.texto}
                  onChange={(e) => handleQuestionChange(questionIndex, 'texto', e.target.value)}
                  rows="3"
                  className="w-full p-3 bg-gray-600 border border-gray-500 rounded-md text-white focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Escribe la pregunta aquí..."
                />
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Opciones de respuesta:
                </label>
                {question.Opcion.map((option, optionIndex) => (
                  <div key={option.id} className="flex items-center space-x-3 p-3 bg-gray-600 rounded-md">
                    <input
                      type="radio"
                      name={`correct-answer-${questionIndex}`}
                      checked={option.es_correcta}
                      onChange={() => handleCorrectAnswerChange(questionIndex, option.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={option.texto}
                      onChange={(e) => handleOptionChange(questionIndex, optionIndex, 'texto', e.target.value)}
                      className="flex-1 p-2 bg-gray-500 border border-gray-400 rounded text-white focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Texto de la opción..."
                    />
                    <span className={`px-2 py-1 text-xs rounded ${
                      option.es_correcta 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-500 text-gray-300'
                    }`}>
                      {option.es_correcta ? 'Correcta' : 'Incorrecta'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-gray-700 flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 disabled:opacity-50 flex items-center"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Guardando...
              </>
            ) : (
              'Guardar Cambios'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditQuestionsModal;