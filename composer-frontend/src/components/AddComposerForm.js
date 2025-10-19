import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import composerAPI from '../api'; // Importar el API

const AddComposerForm = ({ onComposerAdded, isOpen, onClose }) => {
  const [formData, setFormData] = useState({
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
    period: 'CONTEMPORANEO',
    mainRole: [],
    photo_url: '',
    youtube_link: '',
    references: '',
    email: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

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
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      setError('Los nombres y apellidos del compositor son obligatorios.');
      return;
    }

    if (formData.is_student_contribution) {
      if (!formData.student_first_name.trim() || !formData.student_last_name.trim()) {
        setError('Como alumno, debes proporcionar tu nombre y apellido.');
        return;
      }
    }

    if (!formData.birth_year) {
      setError('El año de nacimiento es obligatorio.');
      return;
    }

    if (formData.mainRole.length === 0) {
      setError('Debes seleccionar al menos un rol principal.');
      return;
    }

    if (!formData.email.trim()) {
      setError('El email es obligatorio.');
      return;
    }

    if (!formData.bio.trim()) {
      setError('La biografía es obligatoria.');
      return;
    }

    if (!formData.notable_works.trim()) {
      setError('Las obras notables son obligatorias.');
      return;
    }

    // Preparar datos para enviar
    const dataToSend = {
      is_student_contribution: formData.is_student_contribution,
      student_first_name: formData.is_student_contribution ? formData.student_first_name.trim() : null,
      student_last_name: formData.is_student_contribution ? formData.student_last_name.trim() : null,
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      birth_year: parseInt(formData.birth_year, 10),
      birth_month: formData.birth_month ? parseInt(formData.birth_month, 10) : null,
      birth_day: formData.birth_day ? parseInt(formData.birth_day, 10) : null,
      death_year: formData.death_year ? parseInt(formData.death_year, 10) : null,
      death_month: formData.death_month ? parseInt(formData.death_month, 10) : null,
      death_day: formData.death_day ? parseInt(formData.death_day, 10) : null,
      bio: formData.bio.trim(),
      notable_works: formData.notable_works.trim(),
      period: formData.period,
      mainRole: formData.mainRole,
      photo_url: formData.photo_url.trim() || null,
      youtube_link: formData.youtube_link.trim() || null,
      references: formData.references.trim() || null,
      email: formData.email.trim(),
    };

    try {
      console.log('Attempting to add composer with data:', dataToSend);
      setLoading(true);
      // Usar la función del API centralizado
      const response = await composerAPI.addComposer(dataToSend);
      
      setSuccess('¡Compositor agregado con éxito! Hemos enviado un correo a tu dirección para el seguimiento de tu contribución. Gracias.');
      onComposerAdded(response.data);
      
      // Esperar 2 segundos antes de cerrar
      setTimeout(() => {
        resetForm();
        onClose();
      }, 2500);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.message ||
                          'Ocurrió un error al agregar el compositor. Revisa la consola para más detalles.';
      console.error('Full error object:', err);
      setError(errorMessage);
      console.error('Error al agregar compositor:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      is_student_contribution: false,
      student_first_name: '',
      student_last_name: '',
      first_name: '', last_name: '', birth_year: '', birth_month: '', birth_day: '',
      death_year: '', death_month: '', death_day: '', bio: '', notable_works: '',
      period: 'CONTEMPORANEO', mainRole: [], photo_url: '', youtube_link: '', references: '', email: '',
    });
    setActiveTab('basic');
    setError('');
    setSuccess('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 text-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col border border-purple-500 border-opacity-30">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gradient-to-r from-purple-900 to-purple-800">
          <h2 className="text-2xl font-bold">Agregar Nuevo Creador</h2>
          <button onClick={onClose} disabled={loading} className="p-1 hover:bg-gray-700 rounded-lg transition">
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-4 border-b border-gray-700">
          {[
            { id: 'basic', label: 'Información Básica' },
            { id: 'roles', label: 'Roles y Período' },
            { id: 'media', label: 'Multimedia' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-t-lg transition font-medium ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white'
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
            
            {/* Tab: Información Básica */}
            {activeTab === 'basic' && (
              <div className="space-y-4">
                {/* Sección: ¿Eres alumno? */}
                <div className="bg-gray-800 border border-purple-500 border-opacity-30 p-4 rounded-lg">
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
                      className="w-5 h-5 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-2 focus:ring-purple-500"
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
                          className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
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
                          className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Nombres *</label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      placeholder="Ej: Ludwig"
                      required
                      className="w-full bg-gray-800 border border-gray-700 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Apellidos *</label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      placeholder="Ej: van Beethoven"
                      required
                      className="w-full bg-gray-800 border border-gray-700 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Fecha de Nacimiento</label>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-gray-400">Año *</label>
                      <input 
                        type="number" 
                        name="birth_year" 
                        value={formData.birth_year} 
                        onChange={handleChange} 
                        placeholder="1770" 
                        required 
                        className="w-full bg-gray-800 border border-gray-700 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" 
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400">Mes (opcional)</label>
                      <input 
                        type="number" 
                        name="birth_month" 
                        value={formData.birth_month} 
                        onChange={handleChange} 
                        placeholder="1-12" 
                        min="1" 
                        max="12" 
                        className="w-full bg-gray-800 border border-gray-700 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" 
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400">Día (opcional)</label>
                      <input 
                        type="number" 
                        name="birth_day" 
                        value={formData.birth_day} 
                        onChange={handleChange} 
                        placeholder="1-31" 
                        min="1" 
                        max="31" 
                        className="w-full bg-gray-800 border border-gray-700 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" 
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Fecha de Fallecimiento (opcional)</label>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-gray-400">Año</label>
                      <input 
                        type="number" 
                        name="death_year" 
                        value={formData.death_year} 
                        onChange={handleChange} 
                        placeholder="1827" 
                        className="w-full bg-gray-800 border border-gray-700 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" 
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
                        className="w-full bg-gray-800 border border-gray-700 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" 
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
                        className="w-full bg-gray-800 border border-gray-700 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" 
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Biografía *</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Describe la vida y carrera del creador..."
                    required
                    rows="4"
                    className="w-full bg-gray-800 border border-gray-700 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Obras Notables *</label>
                  <textarea
                    name="notable_works"
                    value={formData.notable_works}
                    onChange={handleChange}
                    placeholder="Enumera las principales obras..."
                    required
                    rows="3"
                    className="w-full bg-gray-800 border border-gray-700 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition resize-none"
                  />
                </div>
              </div>
            )}

            {/* Tab: Roles y Período */}
            {activeTab === 'roles' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Roles Principales * (selecciona uno o más)</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {roles.map(role => (
                      <label key={role.value} className="flex items-center p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition cursor-pointer border border-gray-700">
                        <input
                          type="checkbox"
                          value={role.value}
                          checked={formData.mainRole.includes(role.value)}
                          onChange={handleRoleChange}
                          className="w-5 h-5 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-2 focus:ring-purple-500"
                        />
                        <span className="ml-3 font-medium">{role.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Período *</label>
                  <select
                    name="period"
                    value={formData.period}
                    onChange={handleChange}
                    className="w-full bg-gray-800 border border-gray-700 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                  >
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
                    className="w-full bg-gray-800 border border-gray-700 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
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
                    className="w-full bg-gray-800 border border-gray-700 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
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
                    className="w-full bg-gray-800 border border-gray-700 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email de Contacto *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="tu@email.com"
                    required
                    className="w-full bg-gray-800 border border-gray-700 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
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
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition font-medium disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition font-bold flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? '⏳ Guardando...' : '✓ Guardar Contribución'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddComposerForm;