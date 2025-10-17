import React, { useState } from 'react';
import apiClient from '../api';

const AddComposerForm = ({ onComposerAdded }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    birth_year: '',
    birth_month: '',
    birth_day: '',
    death_year: '',
    death_month: '',
    death_day: '',
    bio: '',
    notable_works: '',
    period: 'CONTEMPORANEO',
    mainRole: [],
    photo_url: '',
    youtube_link: '',
    references: '',
    email: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const roles = ['COMPOSER', 'POET', 'CONDUCTOR', 'ARRANGER', 'PERFORMER', 'ENSEMBLE_ORCHESTRA'];

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

    if (formData.mainRole.length === 0) {
      setError('Debes seleccionar al menos un rol principal.');
      return;
    }

    // Convertir campos numéricos
    const dataToSend = {
      ...formData,
      birth_year: parseInt(formData.birth_year, 10),
      birth_month: formData.birth_month ? parseInt(formData.birth_month, 10) : null,
      birth_day: formData.birth_day ? parseInt(formData.birth_day, 10) : null,
      death_year: formData.death_year ? parseInt(formData.death_year, 10) : null,
      death_month: formData.death_month ? parseInt(formData.death_month, 10) : null,
      death_day: formData.death_day ? parseInt(formData.death_day, 10) : null,
    };

    try {
      const response = await apiClient.post('/composers', dataToSend);
      setSuccess('¡Compositor agregado con éxito! Gracias por tu contribución.');
      onComposerAdded(response.data);
      // Reset form after a delay
      setTimeout(() => {
        setFormData({
          first_name: '', last_name: '', birth_year: '', birth_month: '', birth_day: '',
          death_year: '', death_month: '', death_day: '', bio: '', notable_works: '',
          period: 'CONTEMPORANEO', mainRole: [], photo_url: '', youtube_link: '', references: '', email: '',
        });
        setSuccess('');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Ocurrió un error al agregar el compositor.');
    }
  };

  return (
    <div className="bg-gray-800 text-white p-6 rounded-lg shadow-xl w-full max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center text-purple-400">Agregar Nuevo Creador</h2>
      
      {/* Contenedor del formulario con scroll */}
      <div className="max-h-[70vh] overflow-y-auto pr-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Nombres */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} placeholder="Nombres" required className="bg-gray-700 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500" />
            <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} placeholder="Apellidos" required className="bg-gray-700 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>

          {/* Fechas de Nacimiento */}
          <fieldset className="border border-gray-600 p-4 rounded-md">
            <legend className="px-2 text-purple-400">Fecha de Nacimiento</legend>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input type="number" name="birth_year" value={formData.birth_year} onChange={handleChange} placeholder="Año" required className="bg-gray-700 p-2 rounded-md" />
              <input type="number" name="birth_month" value={formData.birth_month} onChange={handleChange} placeholder="Mes (opcional)" className="bg-gray-700 p-2 rounded-md" />
              <input type="number" name="birth_day" value={formData.birth_day} onChange={handleChange} placeholder="Día (opcional)" className="bg-gray-700 p-2 rounded-md" />
            </div>
          </fieldset>

          {/* Fechas de Fallecimiento */}
          <fieldset className="border border-gray-600 p-4 rounded-md">
            <legend className="px-2 text-purple-400">Fecha de Fallecimiento</legend>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input type="number" name="death_year" value={formData.death_year} onChange={handleChange} placeholder="Año (opcional)" className="bg-gray-700 p-2 rounded-md" />
              <input type="number" name="death_month" value={formData.death_month} onChange={handleChange} placeholder="Mes (opcional)" className="bg-gray-700 p-2 rounded-md" />
              <input type="number" name="death_day" value={formData.death_day} onChange={handleChange} placeholder="Día (opcional)" className="bg-gray-700 p-2 rounded-md" />
            </div>
          </fieldset>

          {/* Biografía y Obras */}
          <textarea name="bio" value={formData.bio} onChange={handleChange} placeholder="Biografía" required rows="4" className="w-full bg-gray-700 p-2 rounded-md"></textarea>
          <textarea name="notable_works" value={formData.notable_works} onChange={handleChange} placeholder="Obras notables" required rows="3" className="w-full bg-gray-700 p-2 rounded-md"></textarea>
          
          {/* Periodo */}
          <select name="period" value={formData.period} onChange={handleChange} className="w-full bg-gray-700 p-2 rounded-md">
            <option value="COLONIAL">Colonial</option>
            <option value="INDEPENDENCIA">Independencia</option>
            <option value="POSGUERRA">Posguerra</option>
            <option value="MODERNO">Moderno</option>
            <option value="CONTEMPORANEO">Contemporáneo</option>
          </select>

          {/* Roles */}
          <fieldset className="border border-gray-600 p-4 rounded-md">
            <legend className="px-2 text-purple-400">Roles Principales (uno o más)</legend>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {roles.map(role => (
                <label key={role} className="flex items-center space-x-2">
                  <input type="checkbox" value={role} checked={formData.mainRole.includes(role)} onChange={handleRoleChange} className="form-checkbox h-5 w-5 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500" />
                  <span>{
                    role === 'COMPOSER' ? 'Compositor' :
                    role === 'POET' ? 'Poeta' :
                    role === 'CONDUCTOR' ? 'Director' :
                    role === 'ARRANGER' ? 'Arreglista' :
                    role === 'PERFORMER' ? 'Intérprete' :
                    role === 'ENSEMBLE_ORCHESTRA' ? 'Agrupación/Orquesta' :
                    role
                  }</span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Multimedia y Referencias */}
          <input type="url" name="photo_url" value={formData.photo_url} onChange={handleChange} placeholder="URL de la foto (opcional)" className="w-full bg-gray-700 p-2 rounded-md" />
          <input type="url" name="youtube_link" value={formData.youtube_link} onChange={handleChange} placeholder="Enlace de YouTube (opcional)" className="w-full bg-gray-700 p-2 rounded-md" />
          <textarea name="references" value={formData.references} onChange={handleChange} placeholder="Referencias (opcional)" rows="2" className="w-full bg-gray-700 p-2 rounded-md"></textarea>
          
          {/* Email */}
          <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Tu email de contacto" required className="w-full bg-gray-700 p-2 rounded-md" />

        </form>
      </div>

      {/* Botón de envío y mensajes */}
      <div className="mt-6 text-center">
        <button type="submit" onClick={handleSubmit} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-300">
          Guardar Contribución
        </button>
        {error && <p className="text-red-400 mt-4">{error}</p>}
        {success && <p className="text-green-400 mt-4">{success}</p>}
      </div>
    </div>
  );
};

export default AddComposerForm;
