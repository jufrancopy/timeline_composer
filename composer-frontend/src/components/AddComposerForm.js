import React, { useState, useEffect } from 'react';
import apiClient from '../api';
import toast from 'react-hot-toast';

// Debounce utility function
const debounce = (func, delay) => {
  let timeout;
  const debounced = function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), delay);
  };
  debounced.cancel = () => {
    clearTimeout(timeout);
  };
  return debounced;
};

const AddComposerForm = ({ onComposerAdded, onCancel }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    birth_year: '',
    birth_month: '',
    birth_day: '',
    death_year: '',
    death_month: '',
    death_day: '',
    period: '',
    bio: '',
    notable_works: '',
    email: '',
    references: '',
    photo_url: '',
    youtube_link: '',
    mainRole: ['COMPOSER'],
    is_student_contribution: false,
    student_first_name: '',
    student_last_name: '',
  });
  
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleRoleChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => {
      const roles = prev.mainRole;
      if (checked) {
        return { ...prev, mainRole: [...roles, value] };
      } else {
        return { ...prev, mainRole: roles.filter(role => role !== value) };
      }
    });
  };

  useEffect(() => {
    const checkStudentEmail = debounce(async (email) => {
      if (email && email.includes('@') && email.includes('.')) { // Basic email validation
        try {
          const response = await apiClient.post('/students/check-email', { email });
          if (response.data.isStudent) {
            setFormData(prev => ({
              ...prev,
              is_student_contribution: true,
              student_first_name: response.data.student_first_name,
              student_last_name: response.data.student_last_name,
            }));
            toast.success('¡Datos de alumno precargados!');
          } else {
            // If email is not a student, ensure student fields are cleared
            setFormData(prev => ({
              ...prev,
              is_student_contribution: false,
              student_first_name: '',
              student_last_name: '',
            }));
          }
        } catch (error) {
          console.error('Error checking student email:', error);
          // Do not show error toast for this, as it's a background check
          // Just ensure student fields are reset if there's an error
          setFormData(prev => ({
            ...prev,
            is_student_contribution: false,
            student_first_name: '',
            student_last_name: '',
          }));
        }
      } else {
        // Clear student fields if email is empty or invalid
        setFormData(prev => ({
          ...prev,
          is_student_contribution: false,
          student_first_name: '',
          student_last_name: '',
        }));
      }
    }, 500); // Debounce for 500ms

    checkStudentEmail(formData.email);

    // Cleanup function for useEffect
    return () => {
      checkStudentEmail.cancel && checkStudentEmail.cancel(); // If debounce has a cancel method
    };
  }, [formData.email]); // Dependency array: re-run when formData.email changes

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setLoading(true);

    if (!formData.first_name || !formData.last_name || !formData.birth_year || !formData.email || !formData.period) {
      toast.error('Por favor, completa los campos obligatorios (*).');
      setLoading(false);
      return;
    }
    if (formData.is_student_contribution && (!formData.student_first_name || !formData.student_last_name)) {
      toast.error('Por favor, completa el nombre y apellido del alumno.');
      setLoading(false);
      return;
    }

    try {
      const dataToSend = {
        ...formData,
        birth_year: parseInt(formData.birth_year, 10),
        birth_month: formData.birth_month ? parseInt(formData.birth_month, 10) : null,
        birth_day: formData.birth_day ? parseInt(formData.birth_day, 10) : null,
        death_year: formData.death_year ? parseInt(formData.death_year, 10) : null,
        death_month: formData.death_month ? parseInt(formData.death_month, 10) : null,
        death_day: formData.death_day ? parseInt(formData.death_day, 10) : null,
      };

      const response = await apiClient.post('/composers', dataToSend);
      toast.success('¡Gracias por tu aporte! Ha sido enviado para revisión.');
      
      if (onComposerAdded) {
        onComposerAdded(response.data.composer);
      }

      setFormData({
        first_name: '', last_name: '', birth_year: '', birth_month: '', birth_day: '',
        death_year: '', death_month: '', death_day: '', period: '', bio: '', notable_works: '',
        email: '', references: '', photo_url: '', youtube_link: '', mainRole: ['COMPOSER'],
        is_student_contribution: false, student_first_name: '', student_last_name: '',
      });

    } catch (err) {
      toast.error(err.response?.data?.error || 'Ocurrió un error al enviar el formulario.');
    } finally {
      setLoading(false);
    }
  };

  const availableRoles = [
    { value: 'COMPOSER', label: 'Compositor' },
    { value: 'POET', label: 'Poeta' },
    { value: 'CONDUCTOR', label: 'Director' },
    { value: 'ARRANGER', label: 'Arreglista' },
    { value: 'PERFORMER', label: 'Intérprete' },
  ];

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg mb-12 animate-fade-in-down">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Añadir un Nuevo Compositor</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <input name="first_name" value={formData.first_name} onChange={handleChange} placeholder="Nombre (*)" className="w-full p-3 border border-gray-300 rounded-lg"/>
          <input name="last_name" value={formData.last_name} onChange={handleChange} placeholder="Apellido (*)" className="w-full p-3 border border-gray-300 rounded-lg"/>
        </div>

        <fieldset className="border border-gray-300 p-4 rounded-lg mb-4">
          <legend className="text-sm font-medium text-gray-600 px-2">Fecha de Nacimiento</legend>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <input name="birth_day" type="number" value={formData.birth_day} onChange={handleChange} placeholder="Día" className="w-full p-3 border border-gray-300 rounded-lg"/>
            <input name="birth_month" type="number" value={formData.birth_month} onChange={handleChange} placeholder="Mes" className="w-full p-3 border border-gray-300 rounded-lg"/>
            <input name="birth_year" type="number" value={formData.birth_year} onChange={handleChange} placeholder="Año (*)" className="w-full p-3 border border-gray-300 rounded-lg"/>
          </div>
        </fieldset>

        <fieldset className="border border-gray-300 p-4 rounded-lg mb-4">
          <legend className="text-sm font-medium text-gray-600 px-2">Fecha de Fallecimiento</legend>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <input name="death_day" type="number" value={formData.death_day} onChange={handleChange} placeholder="Día" className="w-full p-3 border border-gray-300 rounded-lg"/>
            <input name="death_month" type="number" value={formData.death_month} onChange={handleChange} placeholder="Mes" className="w-full p-3 border border-gray-300 rounded-lg"/>
            <input name="death_year" type="number" value={formData.death_year} onChange={handleChange} placeholder="Año" className="w-full p-3 border border-gray-300 rounded-lg"/>
          </div>
        </fieldset>

        <div className="mb-4">
          <select name="period" id="musicPeriodSelector" value={formData.period} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg">
            <option value="">-- Seleccione un período -- (*)</option>
            <option value="COLONIAL">Periodo Colonial (1600–1811)</option>
            <option value="INDEPENDENCIA">Independencia y Nación (1811–1870)</option>
            <option value="POSGUERRA">Posguerra y Reconstrucción (1870–1930)</option>
            <option value="GUARANIA">Época de Oro (1930–1954)</option>
            <option value="DICTADURA">Dictadura y Resistencia (1954–1989)</option>
            <option value="TRANSICION">Transición y Diversificación (1990–2010)</option>
            <option value="ACTUALIDAD">Actualidad (2010–hoy)</option>
          </select>
        </div>

        <fieldset className="border border-gray-300 p-4 rounded-lg mb-4">
            <legend className="text-sm font-medium text-gray-600 px-2">Roles (*)</legend>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {availableRoles.map(role => (
                    <div key={role.value} className="flex items-center">
                        <input type="checkbox" id={`role-${role.value}`} name="mainRole" value={role.value} checked={formData.mainRole.includes(role.value)} onChange={handleRoleChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded"/>
                        <label htmlFor={`role-${role.value}`} className="ml-2 block text-sm text-gray-900">{role.label}</label>
                    </div>
                ))}
            </div>
        </fieldset>

        <div className="mb-4"><textarea name="bio" value={formData.bio} onChange={handleChange} placeholder="Biografía (*)" className="w-full p-3 border border-gray-300 rounded-lg" rows="4" /></div>
        <div className="mb-4"><textarea name="notable_works" value={formData.notable_works} onChange={handleChange} placeholder="Obras Notables (*)" className="w-full p-3 border border-gray-300 rounded-lg" rows="3" /></div>
        <div className="mb-4"><input name="photo_url" value={formData.photo_url} onChange={handleChange} placeholder="URL de la Foto" className="w-full p-3 border border-gray-300 rounded-lg" /></div>
        {formData.photo_url && (<div className="my-4 text-center"><p className="text-sm font-medium text-gray-600 mb-2">Vista Previa:</p><img src={formData.photo_url} alt="Vista previa" className="rounded-lg shadow-md max-w-xs mx-auto"/></div>)}
        <div className="mb-4"><input name="youtube_link" value={formData.youtube_link} onChange={handleChange} placeholder="Enlace de YouTube" className="w-full p-3 border border-gray-300 rounded-lg" /></div>
        <div className="mb-4"><input name="references" value={formData.references} onChange={handleChange} placeholder="Referencias (URL)" className="w-full p-3 border border-gray-300 rounded-lg" /></div>
        
        <div className="mb-6"><input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Tu Email de Contacto (*)" className="w-full p-3 border border-gray-300 rounded-lg" /></div>
        
        <fieldset className="border border-gray-300 p-4 rounded-lg mb-4">
          <div className="flex items-center">
            <input type="checkbox" id="is_student_contribution" name="is_student_contribution" checked={formData.is_student_contribution} onChange={handleChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded"/>
            <label htmlFor="is_student_contribution" className="ml-2 block text-sm text-gray-900 font-medium">Soy alumno de Historia de la Música</label>
          </div>
          {formData.is_student_contribution && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 animate-fade-in-down">
              <input name="student_first_name" value={formData.student_first_name} onChange={handleChange} placeholder="Nombre del Alumno (*)" className="w-full p-3 border border-gray-300 rounded-lg"/>
              <input name="student_last_name" value={formData.student_last_name} onChange={handleChange} placeholder="Apellido del Alumno (*)" className="w-full p-3 border border-gray-300 rounded-lg"/>
            </div>
          )}
        </fieldset>
        
        

        <div className="flex items-center justify-end gap-4">
          <button type="button" onClick={onCancel} className="text-gray-600 hover:text-gray-800 font-medium">Cancelar</button>
          <button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg">{loading ? 'Enviando...' : 'Enviar Aporte'}</button>
        </div>
      </form>
    </div>
  );
};

export default AddComposerForm;