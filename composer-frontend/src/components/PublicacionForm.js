import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import the styles

const PublicacionForm = ({ catedraId: propCatedraId, onSubmit, initialData = {}, isEditMode = false, loading = false, onCancel, availableCatedras = [], userRole, isTablonCreation = false }) => {
  const [titulo, setTitulo] = useState(initialData.titulo || '');
  const [contenido, setContenido] = useState(initialData.contenido || '');
  const [tipo, setTipo] = useState(() => {
    if (userRole === 'ALUMNO' && initialData.tipo && !['ANUNCIO', 'OTRO'].includes(initialData.tipo)) {
      return 'ANUNCIO'; // Forzar a ANUNCIO si el alumno intenta editar una publicación no permitida
    } else if (userRole === 'ALUMNO') {
      return initialData.tipo || 'ANUNCIO'; // Alumno por defecto ANUNCIO
    }
    return initialData.tipo || 'ANUNCIO'; // Docente/Admin puede elegir
  });
  const [selectedCatedraId, setSelectedCatedraId] = useState(propCatedraId || '');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (isEditMode && initialData) {
      setTitulo(initialData.titulo || '');
      setContenido(initialData.contenido || '');
      setTipo(initialData.tipo || 'ANUNCIO');
      setSelectedCatedraId(initialData.catedraId || '');
    } else if (availableCatedras.length === 1) {
      setSelectedCatedraId(availableCatedras[0].id);
    }
  }, [isEditMode, initialData, availableCatedras]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormError('');

        if (!titulo.trim() || !contenido.trim() || (!isEditMode && !selectedCatedraId)) {
            setFormError('El título, el contenido y la cátedra son obligatorios.');
            return;
        }

    let finalTipo = tipo;
    if (userRole === 'ALUMNO' && !['ANUNCIO', 'OTRO'].includes(tipo)) {
      finalTipo = 'ANUNCIO'; // Si es alumno, solo puede ser ANUNCIO u OTRO. Si intenta otra cosa, forzar ANUNCIO.
    }

        if (isEditMode) {
            onSubmit(initialData.id, { titulo, contenido, tipo: finalTipo, catedraId: selectedCatedraId });
        } else {
            onSubmit(selectedCatedraId, { titulo, contenido, tipo: finalTipo });
        }
    };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet',
    'link', 'image'
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formError && <p className="text-red-500 text-sm">{formError}</p>}
      <div>
        <label htmlFor="titulo" className="block text-sm font-medium text-gray-300">Título</label>
        <input
          type="text"
          id="titulo"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-purple-500 focus:border-purple-500"
          required
        />
      </div>
      <div>
        <label htmlFor="contenido" className="block text-sm font-medium text-gray-300">Contenido</label>
        <ReactQuill 
          theme="snow"
          value={contenido}
          onChange={setContenido}
          modules={modules}
          formats={formats}
          className="mt-1 block w-full rounded-md shadow-sm text-white"
          placeholder="Escribe el contenido de la publicación..."
        />
      </div>
      
      {availableCatedras.length > 1 && !isEditMode && (
        <div>
          <label htmlFor="catedra" className="block text-sm font-medium text-gray-300">Cátedra</label>
          <select
            id="catedra"
            value={selectedCatedraId}
            onChange={(e) => setSelectedCatedraId(parseInt(e.target.value))}
            className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-purple-500 focus:border-purple-500"
            required
          >
            <option value="">Selecciona una cátedra</option>
            {availableCatedras.map(cat => (
              <option key={cat.Catedra.id} value={cat.Catedra.id}>{cat.Catedra.nombre} ({cat.Catedra.anio})</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="tipo" className="block text-sm font-medium text-gray-300">Tipo de Publicación</label>
        <select
          id="tipo"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-purple-500 focus:border-purple-500"
          disabled={(userRole === 'ALUMNO' && !isEditMode) || (isTablonCreation && !isEditMode)} // Deshabilitar para alumnos o si es creación en tablón
        >
          {(userRole === 'ALUMNO' || isTablonCreation) && !isEditMode ? (
            // Si es alumno o creación en tablón, solo ANUNCIO u OTRO para alumnos
            // Si es creación en tablón para docente/admin, solo ANUNCIO
            <option value="ANUNCIO">Anuncio</option>
          ) : (
            // Docente/Admin en modo edición o creación no-tablón puede elegir
            <>
              <option value="ANUNCIO">Anuncio</option>
              <option value="TAREA">Tarea</option>
              <option value="EVALUACION">Evaluación</option>
              <option value="OTRO">Otro</option>
            </>
          )}
        </select>
      </div>
      <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          disabled={loading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          disabled={loading}
        >
          {loading ? 'Guardando...' : (isEditMode ? 'Actualizar Publicación' : 'Crear Publicación')}
        </button>
      </div>
    </form>
  );
};

PublicacionForm.propTypes = {
  catedraId: PropTypes.number,
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.object,
  isEditMode: PropTypes.bool,
  loading: PropTypes.bool,
  onCancel: PropTypes.func.isRequired,
  availableCatedras: PropTypes.array,
  userRole: PropTypes.string,
  isTablonCreation: PropTypes.bool, // Nueva prop
};

export default PublicacionForm; 