import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import the styles

const PublicacionForm = ({ 
  catedraId: propCatedraId, 
  onSubmit, 
  initialData = {}, 
  isEditMode = false, 
  loading = false, 
  onCancel, 
  availableCatedras = [], 
  userRole, 
  isTablonCreation = false 
}) => {
  const [titulo, setTitulo] = useState(initialData.titulo || '');
  const [contenido, setContenido] = useState(initialData.contenido || '');
  const [tipo, setTipo] = useState(initialData.tipo || 'ANUNCIO');
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
    if (userRole === 'ALUMNO') {
      finalTipo = 'ANUNCIO'; // Los alumnos siempre publican ANUNCIOs
    } else if (!isEditMode && isTablonCreation) {
      finalTipo = 'ANUNCIO'; // En creación desde tablón, el docente/admin también publica ANUNCIOS por defecto
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

  // Determinar si mostrar el selector de tipo
  const mostrarSelectorTipo = userRole !== 'ALUMNO' && !(isTablonCreation && !isEditMode);

  return (
    <div className="bg-gray-800 rounded-xl shadow-2xl p-6 border border-gray-700">
      <style>
        {`
          .ql-editor.ql-blank::before {
            color: #9CA3AF !important;
            font-style: normal !important;
          }
          .ql-toolbar {
            background-color: #374151;
            border-top: 1px solid #4B5563;
            border-left: 1px solid #4B5563;
            border-right: 1px solid #4B5563;
            border-radius: 0.375rem 0.375rem 0 0;
          }
          .ql-container {
            background-color: #374151;
            border-bottom: 1px solid #4B5563;
            border-left: 1px solid #4B5563;
            border-right: 1px solid #4B5563;
            border-radius: 0 0 0.375rem 0.375rem;
            color: white;
            min-height: 150px;
          }
          .ql-editor {
            color: white;
            font-size: 1rem;
            line-height: 1.5;
          }
          .ql-stroke {
            stroke: #D1D5DB !important;
          }
          .ql-fill, .ql-stroke.ql-fill {
            fill: #D1D5DB !important;
          }
          .ql-picker-label {
            color: #D1D5DB !important;
          }
          .ql-picker-options {
            background-color: #374151 !important;
            border: 1px solid #4B5563 !important;
          }
          .ql-picker-item {
            color: white !important;
          }
          .ql-picker-item:hover {
            background-color: #4B5563 !important;
          }
        `}
      </style>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {formError && (
          <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-lg">
            {formError}
          </div>
        )}
        
        <div>
          <label htmlFor="titulo" className="block text-sm font-medium text-gray-200 mb-2">
            Título
          </label>
          <input
            type="text"
            id="titulo"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            placeholder="Escribe un título descriptivo..."
            required
          />
        </div>
        
        <div>
          <label htmlFor="contenido" className="block text-sm font-medium text-gray-200 mb-2">
            Contenido
          </label>
          <div className="bg-gray-700 rounded-lg overflow-hidden border border-gray-600">
            <ReactQuill 
              theme="snow"
              value={contenido}
              onChange={setContenido}
              modules={modules}
              formats={formats}
              placeholder="Escribe el contenido de la publicación..."
              className="bg-transparent"
            />
          </div>
        </div>
        
        {availableCatedras.length > 1 && !isEditMode && (
          <div>
            <label htmlFor="catedra" className="block text-sm font-medium text-gray-200 mb-2">
              Cátedra
            </label>
            <select
              id="catedra"
              value={selectedCatedraId}
              onChange={(e) => setSelectedCatedraId(parseInt(e.target.value))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              required
            >
              <option value="">Selecciona una cátedra</option>
              {availableCatedras.map(cat => (
                <option key={cat.Catedra.id} value={cat.Catedra.id}>
                  {cat.Catedra.nombre} ({cat.Catedra.anio})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Campo de tipo de publicación */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Tipo de Publicación
          </label>
          
          {userRole === 'ALUMNO' ? (
            <div className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-gray-300">
              Anuncio
            </div>
          ) : isTablonCreation && !isEditMode ? (
            <div className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-gray-300">
              Anuncio
            </div>
          ) : (
            <select
              id="tipo"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            >
              <option value="ANUNCIO">Anuncio</option>
              <option value="OTRO">Otro</option>
            </select>
          )}
          
          <p className="mt-2 text-sm text-gray-400">
            {userRole === 'ALUMNO' 
              ? "Como alumno, solo puedes publicar anuncios." 
              : isTablonCreation && !isEditMode 
                ? "Las publicaciones en el tablón general son siempre anuncios."
                : "Selecciona el tipo de publicación que deseas crear."}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-gray-200 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Guardando...' : (isEditMode ? 'Actualizar Publicación' : 'Crear Publicación')}
          </button>
        </div>
      </form>
    </div>
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
  isTablonCreation: PropTypes.bool,
};

export default PublicacionForm;