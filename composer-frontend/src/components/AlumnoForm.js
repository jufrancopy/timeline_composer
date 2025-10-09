import React, { useState, useEffect } from 'react';

const AlumnoForm = ({ onSubmit, initialData, onCancel }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccion: '',
    instrumento: '',
    detalles_adicionales: '',
    es_menor: false,
    nombre_tutor: '',
    telefono_tutor: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        es_menor: initialData.es_menor || false,
      }));
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => {
      let newState = { ...prev, [name]: type === 'checkbox' ? checked : value };

      if (name === 'es_menor' && !checked) {
        newState.nombre_tutor = '';
        newState.telefono_tutor = '';
        newState.vive_con_padres = false;
      }
      return newState;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-gray-200">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 font-semibold">Nombre</label>
          <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} className="w-full p-2 bg-gray-700 rounded" required />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Apellido</label>
          <input type="text" name="apellido" value={formData.apellido} onChange={handleChange} className="w-full p-2 bg-gray-700 rounded" required />
        </div>
      </div>
      <div>
        <label className="block mb-1 font-semibold">Correo Electrónico</label>
        <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-2 bg-gray-700 rounded" required />
      </div>
      <div>
        <label className="block mb-1 font-semibold">Teléfono</label>
        <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} className="w-full p-2 bg-gray-700 rounded" />
      </div>
      <div>
        <label className="block mb-1 font-semibold">Dirección</label>
        <input type="text" name="direccion" value={formData.direccion} onChange={handleChange} className="w-full p-2 bg-gray-700 rounded" />
      </div>
      <div>
        <label className="block mb-1 font-semibold">Instrumento</label>
        <input type="text" name="instrumento" value={formData.instrumento} onChange={handleChange} className="w-full p-2 bg-gray-700 rounded" />
      </div>
      <div>
        <label className="block mb-1 font-semibold">Detalles Adicionales</label>
        <textarea name="detalles_adicionales" value={formData.detalles_adicionales} onChange={handleChange} className="w-full p-2 bg-gray-700 rounded" rows="3"></textarea>
      </div>

      <div className="flex items-center">
        <input type="checkbox" name="es_menor" checked={formData.es_menor} onChange={handleChange} className="mr-2" />
        <label className="font-semibold">Es menor de edad</label>
      </div>

      {formData.es_menor && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-semibold">Nombre del Tutor/Encargado</label>
              <input type="text" name="nombre_tutor" value={formData.nombre_tutor} onChange={handleChange} className="w-full p-2 bg-gray-700 rounded" required={formData.es_menor} />
            </div>
            <div>
              <label className="block mb-1 font-semibold">Teléfono del Tutor/Encargado</label>
              <input type="text" name="telefono_tutor" value={formData.telefono_tutor} onChange={handleChange} className="w-full p-2 bg-gray-700 rounded" required={formData.es_menor} />
            </div>
          </div>
        </>
      )}
      <div className="flex justify-end space-x-4 pt-4">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500">Cancelar</button>
        <button type="submit" className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-500">{initialData ? 'Actualizar' : 'Crear'}</button>
      </div>
    </form>
  );
};

export default AlumnoForm;
