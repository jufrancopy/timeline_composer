import React, { useState, useEffect } from 'react';

const DocenteForm = ({ onSubmit, initialData, onCancel }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccion: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
      <div className="flex justify-end space-x-4 pt-4">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500">Cancelar</button>
        <button type="submit" className="px-4 py-2 bg-green-600 rounded hover:bg-green-500">{initialData ? 'Actualizar' : 'Crear'}</button>
      </div>
    </form>
  );
};

export default DocenteForm;