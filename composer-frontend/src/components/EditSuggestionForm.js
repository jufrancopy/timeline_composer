import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../api'; // Importar el API

const EditSuggestionForm = ({ composer, isOpen, onClose, onSuggestionAdded, onSuggestionSent, onCancel }) => {
  const [formData, setFormData] = useState({
    reason: '',
    is_student_contribution: false,
    student_first_name: '',
    student_last_name: '',
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
    period: '',
    mainRole: [],
    photo_url: '',
    youtube_link: '',
    references: '',
    suggester_email: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('reason');

  const roles = [
    { value: 'COMPOSER', label: 'Compositor' },
    { value: 'POET', label: 'Poeta' },
    { value: 'CONDUCTOR', label: 'Director' },
    { value: 'ARRANGER', label: 'Arreglista' },
    { value: 'PERFORMER', label: 'Intérprete' },
    { value: 'ENSEMBLE_ORCHESTRA', label: 'Agrupación/Orquesta' },
  ];

  const periods = [
    { value: 'COLONIAL', label: 'Colonial' },
    { value: 'INDEPENDENCIA', label: 'Independencia' },
    { value: 'POSGUERRA', label: 'Posguerra' },
    { value: 'MODERNO', label: 'Moderno' },
    { value: 'CONTEMPORANEO', label: 'Contemporáneo' },
  ];

  // Prellenar el formulario con los datos del compositor actual
  useEffect(() => {
    if (composer && isOpen) {
      setFormData(prev => ({
        ...prev,
        first_name: composer.first_name || '',
        last_name: composer.last_name || '',
        birth_year: composer.birth_year?.toString() || '',
        birth_month: composer.birth_month?.toString() || '',
        birth_day: composer.birth_day?.toString() || '',
        death_year: composer.death_year?.toString() || '',
        death_month: composer.death_month?.toString() || '',
        death_day: composer.death_day?.toString() || '',
        bio: composer.bio || '',
        notable_works: composer.notable_works || '',
        period: composer.period || '',
        mainRole: composer.mainRole || [],
        photo_url: composer.photo_url || '',
        youtube_link: composer.youtube_link || '',
        references: composer.references || '',
      }));
    }
  }, [composer, isOpen]);

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

    // Validaciones
    if (!formData.reason.trim()) {
      setError('El motivo de la sugerencia es obligatorio.');
      return;
    }

    if (!formData.suggester_email.trim()) {
      setError('El email de contacto es obligatorio.');
      return;
    }

    if (formData.is_student_contribution) {
      if (!formData.student_first_name.trim() || !formData.student_last_name.trim()) {
        setError('Como alumno, debes proporcionar tu nombre y apellido.');
        return;
      }
    }

    // Preparar datos para enviar
    const dataToSend = {
      reason: formData.reason.trim(),
      suggester_email: formData.suggester_email.trim(),
      is_student_contribution: formData.is_student_contribution,
      student_first_name: formData.is_student_contribution ? formData.student_first_name.trim() : null,
      student_last_name: formData.is_student_contribution ? formData.student_last_name.trim() : null,
      first_name: formData.first_name.trim() || null,
      last_name: formData.last_name.trim() || null,
      birth_year: formData.birth_year ? parseInt(formData.birth_year, 10) : null,
      birth_month: formData.birth_month ? parseInt(formData.birth_month, 10) : null,
      birth_day: formData.birth_day ? parseInt(formData.birth_day, 10) : null,
      death_year: formData.death_year ? parseInt(formData.death_year, 10) : null,
      death_month: formData.death_month ? parseInt(formData.death_month, 10) : null,
      death_day: formData.death_day ? parseInt(formData.death_day, 10) : null,
      bio: formData.bio.trim() || null,
      notable_works: formData.notable_works.trim() || null,
      period: formData.period || null,
      mainRole: formData.mainRole.length > 0 ? formData.mainRole : null,
      photo_url: formData.photo_url.trim() || null,
      youtube_link: formData.youtube_link.trim() || null,
      references: formData.references.trim() || null,
    };

    try {
      console.log('Attempting to add edit suggestion with data:', dataToSend);
      setLoading(true);
      
      // Llamar al endpoint de sugerencias
      const response = await api.submitEditSuggestion(composer.id, dataToSend);
      
      setSuccess('¡Sugerencia enviada con éxito! Hemos enviado un correo a tu dirección para el seguimiento. Gracias por tu contribución.');
      
      if (onSuggestionAdded) {
        onSuggestionAdded(response.data);
      }
      
      if (onSuggestionSent) {
        onSuggestionSent(response.data);
      }
      
      // Esperar 2.5 segundos antes de cerrar
      setTimeout(() => {
        resetForm();
        if (onClose) onClose();
        if (onCancel) onCancel();
      }, 2500);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.message ||
                          'Ocurrió un error al enviar la sugerencia. Revisa la consola para más detalles.';
      console.error('Full error object:', err);
      setError(errorMessage);
      console.error('Error al enviar sugerencia:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      reason: '',
      is_student_contribution: false,
      student_first_name: '',
      student_last_name: '',
      first_name: composer?.first_name || '',
      last_name: composer?.last_name || '',
      birth_year: composer?.birth_year?.toString() || '',
      birth_month: composer?.birth_month?.toString() || '',
      birth_day: composer?.birth_day?.toString() || '',
      death_year: composer?.death_year?.toString() || '',
      death_month: composer?.death_month?.toString() || '',
      death_day: composer?.death_day?.toString() || '',
      bio: composer?.bio || '',
      notable_works: composer?.notable_works || '',
      period: composer?.period || '',
      mainRole: composer?.mainRole || [],
      photo_url: composer?.photo_url || '',
      youtube_link: composer?.youtube_link || '',
      references: composer?.references || '',
      suggester_email: '',
    });
    setActiveTab('reason');
    setError('');
    setSuccess('');
  };

  const handleClose = () => {
    if (onClose) onClose();
    if (onCancel) onCancel();
  };

  if (!isOpen || !composer) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 text-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col border border-blue-500 border-opacity-30">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gradient-to-r from-blue-900 to-blue-800">
          <div>
            <h2 className="text-2xl font-bold">Sugerir Edición</h2>
            <p className="text-sm text-blue-200 mt-1">
              Compositor: {composer.first_name} {composer.last_name}
            </p>
          </div>
          <button onClick={handleClose} disabled={loading} className="p-1 hover:bg-gray-700 rounded-lg transition">
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-4 border-b border-gray-700">
          {[
            { id: 'reason', label: 'Motivo & Contacto' },
            { id: 'basic', label: 'Información Básica' },
            { id: 'roles', label: 'Roles y Período' },
            { id: 'media', label: 'Multimedia' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-t-lg transition font-medium ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Tab: Motivo & Contacto */}
            {activeTab === 'reason' && (
              <div className="space-y-4">
                <div className="bg-blue-900 bg-opacity-30 border border-blue-500 border-opacity-30 p-4 rounded-lg">
                  <p className="text-sm text-blue-200">
                    ℹ️ Puedes modificar cualquier campo del compositor. Solo completa los campos que deseas cambiar.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Motivo de la Sugerencia *</label>
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    placeholder="Explica qué información deseas corregir o agregar y por qué..."
                    required
                    rows="4"
                    className="w-full bg-gray-800 border border-gray-700 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
                  />
                </div>

                {/* Sección: ¿Eres alumno? */}
                <div className="bg-gray-800 border border-blue-500 border-opacity-30 p-4 rounded-lg">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_student_contribution}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        is_student_contribution: e.target.checked,
                        student_first_name: e.target.checked ? prev.student_first_name : '',
                        student_last_name: e.target.checked ? prev.student_last_name : '',
                      }))}
                      className="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="ml-3 font-medium text-lg">¿Eres alumno de la cátedra?</span>
                  </label>
                  
                  {/* Campos condicionales para alumnos */}
                  {formData.is_student_contribution && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-700">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Tu Nombre *</label>
                        <input
                          type="text"
                          value={formData.student_first_name}
                          onChange={(e) => setFormData(prev => ({ ...prev, student_first_name: e.target.value }))}
                          placeholder="Tu nombre"
                          required={formData.is_student_contribution}
                          className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Tu Apellido *</label>
                        <input
                          type="text"
                          value={formData.student_last_name}
                          onChange={(e) => setFormData(prev => ({ ...prev, student_last_name: e.target.value }))}
                          placeholder="Tu apellido"
                          required={formData.is_student_contribution}
                          className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email de Contacto *</label>
                  <input
                    type="email"
                    name="suggester_email"
                    value={formData.suggester_email}
                    onChange={handleChange}
                    placeholder="tu@email.com"
                    required
                    className="w-full bg-gray-800 border border-gray-700 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Te notificaremos cuando tu sugerencia sea revisada.
                  </p>
                </div>
              </div>
            )}

            {/* Tab: Información Básica */}
            {activeTab === 'basic' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Nombres</label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      placeholder="Ej: Ludwig"
                      className="w-full bg-gray-800 border border-gray-700 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Apellidos</label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      placeholder="Ej: van Beethoven"
                      className="w-full bg-gray-800 border border-gray-700 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Fecha de Nacimiento</label>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-gray-400">Año</label>
                      <input 
                        type="number" 
                        name="birth_year" 
                        value={formData.birth_year} 
                        onChange={handleChange} 
                        placeholder="1770" 
                        className="w-full bg-gray-800 border border-gray-700 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400">Mes</label>
                      <input 
                        type="number" 
                        name="birth_month" 
                        value={formData.birth_month} 
                        onChange={handleChange} 
                        placeholder="1-12" 
                        min="1" 
                        max="12" 
                        className="w-full bg-gray-800 border border-gray-700 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400">Día</label>
                      <input 
                        type="number" 
                        name="birth_day" 
                        value={formData.birth_day} 
                        onChange={handleChange} 
                        placeholder="1-31" 
                        min="1" 
                        max="31" 
                        className="w-full bg-gray-800 border border-gray-700 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Fecha de Fallecimiento</label>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-gray-400">Año</label>
                      <input 
                        type="number" 
                        name="death_year" 
                        value={formData.death_year} 
                        onChange={handleChange} 
                        placeholder="1827" 
                        className="w-full bg-gray-800 border border-gray-700 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400">Mes</label>
                      <input 
                        type="number" 
                        name="death_month" 
                        value={formData.death_month} 
                        onChange={handleChange} 
                        placeholder="1-12" 
                        min="1" 
                        max="12" 
                        className="w-full bg-gray-800 border border-gray-700 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400">Día</label>
                      <input 
                        type="number" 
                        name="death_day" 
                        value={formData.death_day} 
                        onChange={handleChange} 
                        placeholder="1-31" 
                        min="1" 
                        max="31" 
                        className="w-full bg-gray-800 border border-gray-700 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Biografía</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Describe la vida y carrera del creador..."
                    rows="4"
                    className="w-full bg-gray-800 border border-gray-700 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Obras Notables</label>
                  <textarea
                    name="notable_works"
                    value={formData.notable_works}
                    onChange={handleChange}
                    placeholder="Enumera las principales obras..."
                    rows="3"
                    className="w-full bg-gray-800 border border-gray-700 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
                  />
                </div>
              </div>
            )}

            {/* Tab: Roles y Período */}
            {activeTab === 'roles' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Roles Principales (selecciona uno o más)</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {roles.map(role => (
                      <label key={role.value} className="flex items-center p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition cursor-pointer border border-gray-700">
                        <input
                          type="checkbox"
                          value={role.value}
                          checked={formData.mainRole.includes(role.value)}
                          onChange={handleRoleChange}
                          className="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="ml-3 font-medium">{role.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Período</label>
                  <select
                    name="period"
                    value={formData.period}
                    onChange={handleChange}
                    className="w-full bg-gray-800 border border-gray-700 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  >
                    <option value="">Seleccionar período</option>
                    {periods.map(p => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Tab: Multimedia */}
            {activeTab === 'media' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">URL de Foto</label>
                  <input
                    type="url"
                    name="photo_url"
                    value={formData.photo_url}
                    onChange={handleChange}
                    placeholder="https://ejemplo.com/foto.jpg"
                    className="w-full bg-gray-800 border border-gray-700 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Enlace de YouTube</label>
                  <input
                    type="url"
                    name="youtube_link"
                    value={formData.youtube_link}
                    onChange={handleChange}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full bg-gray-800 border border-gray-700 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Referencias</label>
                  <textarea
                    name="references"
                    value={formData.references}
                    onChange={handleChange}
                    placeholder="Fuentes, enlaces, bibliografía..."
                    rows="3"
                    className="w-full bg-gray-800 border border-gray-700 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
                  />
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Messages */}
        {error && (
          <div className="px-6 py-3 bg-red-900 bg-opacity-50 border-t border-red-700 flex items-center gap-2">
            <AlertCircle size={20} className="text-red-400 flex-shrink-0" />
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="px-6 py-3 bg-green-900 bg-opacity-50 border-t border-green-700 flex items-center gap-2">
            <CheckCircle size={20} className="text-green-400 flex-shrink-0" />
            <p className="text-green-200 text-sm">{success}</p>
          </div>
        )}

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 bg-gray-800 flex justify-end gap-3">
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-6 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition font-medium disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition font-bold flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? '⏳ Enviando...' : '✓ Enviar Sugerencia'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditSuggestionForm;