import React, { useState, useEffect } from 'react';
import apiClient from '../api';

const EditSuggestionForm = ({ composer, onSuggestionSent, onCancel }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    birth_year: '',
    death_year: '',
    bio: '',
    notable_works: '',
    period: '',
    mainRole: [],
    photo_url: '',
    youtube_link: '',
    references: '',
    suggestion_reason: '',
    student_first_name: '',
    student_last_name: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const roles = ['COMPOSER', 'POET', 'CONDUCTOR', 'ARRANGER', 'PERFORMER'];

  useEffect(() => {
    if (composer) {
      setFormData({
        first_name: composer.first_name || '',
        last_name: composer.last_name || '',
        birth_year: composer.birth_year || '',
        death_year: composer.death_year || '',
        bio: composer.bio || '',
        notable_works: composer.notable_works || '',
        period: composer.period || 'CONTEMPORANEO',
        mainRole: composer.mainRole || [],
        photo_url: composer.photo_url || '',
        youtube_link: composer.youtube_link || '',
        references: composer.references || '',
        suggestion_reason: '',
        student_first_name: '',
        student_last_name: '',
      });
    }
  }, [composer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => {
      const newRoles = checked
        ? [...prev.mainRole, value]
        : prev.mainRole.filter(role => role !== value);
      return { ...prev, mainRole: newRoles };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.suggestion_reason.trim()) {
      setError('Por favor, explica brevemente el motivo de tu sugerencia.');
      return;
    }

    try {
      const response = await apiClient.post(`/suggestions/${composer.id}`, formData);
      setSuccess('¡Sugerencia enviada con éxito! Gracias por ayudar a mejorar la información.');
      setTimeout(() => {
        onSuggestionSent(response.data);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Ocurrió un error al enviar la sugerencia.');
    }
  };

  return (
    <div className="bg-gray-800 text-white p-6 rounded-lg shadow-xl w-full max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center text-purple-400">Sugerir una Mejora para {composer.first_name} {composer.last_name}</h2>
      
      <div className="max-h-[70vh] overflow-y-auto pr-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campos del formulario (similares a AddComposerForm) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} placeholder="Nombres" className="bg-gray-700 p-2 rounded-md" />
            <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} placeholder="Apellidos" className="bg-gray-700 p-2 rounded-md" />
          </div>
          <input type="number" name="birth_year" value={formData.birth_year} onChange={handleChange} placeholder="Año de Nacimiento" className="w-full bg-gray-700 p-2 rounded-md" />
          <input type="number" name="death_year" value={formData.death_year} onChange={handleChange} placeholder="Año de Fallecimiento (opcional)" className="w-full bg-gray-700 p-2 rounded-md" />
          <textarea name="bio" value={formData.bio} onChange={handleChange} placeholder="Biografía" rows="4" className="w-full bg-gray-700 p-2 rounded-md"></textarea>
          
          {/* Razón de la sugerencia */}
          <textarea name="suggestion_reason" value={formData.suggestion_reason} onChange={handleChange} placeholder="Motivo de la sugerencia (ej: corregir fecha, añadir obra, etc.)" required rows="2" className="w-full bg-gray-700 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"></textarea>
          
          {/* Datos del estudiante */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" name="student_first_name" value={formData.student_first_name} onChange={handleChange} placeholder="Tu Nombre (opcional)" className="bg-gray-700 p-2 rounded-md" />
            <input type="text" name="student_last_name" value={formData.student_last_name} onChange={handleChange} placeholder="Tu Apellido (opcional)" className="bg-gray-700 p-2 rounded-md" />
          </div>
        </form>
      </div>

      <div className="mt-6 text-center">
        <button type="submit" onClick={handleSubmit} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg">
          Enviar Sugerencia
        </button>
        <button onClick={onCancel} className="ml-4 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg">
          Cancelar
        </button>
        {error && <p className="text-red-400 mt-4">{error}</p>}
        {success && <p className="text-green-400 mt-4">{success}</p>}
      </div>
    </div>
  );
};

export default EditSuggestionForm;
