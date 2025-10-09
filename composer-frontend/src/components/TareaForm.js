import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import api from '../api';

const TareaForm = ({ catedraId, onTareaCreated, onTareaUpdated, userType = 'admin', initialData = null, isEditMode = false }) => {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [puntos_posibles, setPuntosPosibles] = useState('');
  const [fecha_entrega, setFechaEntrega] = useState('');
  const [externalUrls, setExternalUrls] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [multimediaPath, setMultimediaPath] = useState(null); // To store existing multimedia path

  useEffect(() => {
    if (isEditMode && initialData) {
      setTitulo(initialData.titulo || '');
      setDescripcion(initialData.descripcion || '');
      setPuntosPosibles(initialData.puntos_posibles || '');
      setFechaEntrega(initialData.fecha_entrega ? new Date(initialData.fecha_entrega).toISOString().split('T')[0] : '');
      
      // Filter out multimedia_path from resources and set externalUrls
      if (initialData.recursos && Array.isArray(initialData.recursos)) {
        const existingExternalUrls = initialData.recursos.filter(url => 
          url !== initialData.multimedia_path && url.trim() !== ''
        ).join('\n');
        setExternalUrls(existingExternalUrls);
      } else {
        setExternalUrls('');
      }
      setMultimediaPath(initialData.multimedia_path || null);
    } else {
      // Reset form if not in edit mode or no initial data
      setTitulo('');
      setDescripcion('');
      setPuntosPosibles('');
      setFechaEntrega('');
      setExternalUrls('');
      setSelectedFile(null);
      setMultimediaPath(null);
    }
  }, [isEditMode, initialData]);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!titulo.trim() || !descripcion.trim() || !puntos_posibles) {
      toast.error('Por favor, completa todos los campos obligatorios.');
      return;
    }

    let finalMultimediaPath = multimediaPath; // Start with existing path

    if (selectedFile) {
      try {
        const response = await api.uploadTareaMultimedia(selectedFile);
        finalMultimediaPath = response.data.filePath; // Use filePath from backend
      } catch (error) {
        toast.error('Error al subir el archivo multimedia.');
        return;
      }
    } else if (isEditMode && !multimediaPath) {
        // If in edit mode and no new file selected, but there was an old one,
        // assume the old one was cleared if multimediaPath is null.
        // If a file was previously there and user clears it, multimediaPath will be null.
        // If user doesn't touch it, it should retain its value.
        // For now, if no new file and no old path, it remains null.
    }


    const externalUrlsArray = externalUrls.split('\n').filter(url => url.trim() !== '');
    const finalRecursos = finalMultimediaPath ? [...externalUrlsArray, finalMultimediaPath] : externalUrlsArray;

    const tareaData = {
      titulo,
      descripcion,
      puntos_posibles: parseInt(puntos_posibles, 10),
      fecha_entrega: fecha_entrega || null,
      recursos: finalRecursos,
      multimedia_path: finalMultimediaPath,
    };

    try {
      if (isEditMode) {
        await api.updateTareaForDocente(catedraId, initialData.id, tareaData);
        toast.success('Tarea actualizada exitosamente!');
        onTareaUpdated();
      } else {
        const apiFunction = userType === 'docente' ? api.createTareaForDocenteCatedra : api.createTareaForCatedra;
        const response = await apiFunction(catedraId, tareaData);

        onTareaCreated(response.data);
      }
      
    } catch (error) {
      toast.error(error.response?.data?.error || `No se pudo ${isEditMode ? 'actualizar' : 'crear'} la tarea.`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-gray-200">
      <div>
        <label htmlFor="titulo" className="block text-sm font-medium text-gray-300">Título</label>
        <input
          type="text"
          id="titulo"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:ring-purple-500 focus:border-purple-500"
          required
        />
      </div>
      <div>
        <label htmlFor="descripcion" className="block text-sm font-medium text-gray-300">Descripción (Texto Enriquecido)</label>
        <ReactQuill
          theme="snow"
          value={descripcion}
          onChange={setDescripcion}
          className="mt-1 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus-within:ring-purple-500 focus-within:border-purple-500"
        />
      </div>
      <div>
        <label htmlFor="puntos_posibles" className="block text-sm font-medium text-gray-300">Puntos Posibles</label>
        <input
          type="number"
          id="puntos_posibles"
          value={puntos_posibles}
          onChange={(e) => setPuntosPosibles(e.target.value)}
          className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:ring-purple-500 focus:border-purple-500"
          required
          min="1"
        />
      </div>
      <div>
        <label htmlFor="fecha_entrega" className="block text-sm font-medium text-gray-300">Fecha de Entrega (Opcional)</label>
        <input
          type="date"
          id="fecha_entrega"
          value={fecha_entrega}
          onChange={(e) => setFechaEntrega(e.target.value)}
          className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:ring-purple-500 focus:border-purple-500"
        />
      </div>
      <div>
        <label htmlFor="multimedia_file" className="block text-sm font-medium text-gray-300">Subir Archivo (PDF, imagen, etc.) {multimediaPath && <span className="text-sm text-gray-400"> (Actual: {multimediaPath.split('/').pop()})</span>}</label>
        <input
          type="file"
          id="multimedia_file"
          onChange={handleFileChange}
          className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white"
        />
      </div>
      <div>
        <label htmlFor="external_urls" className="block text-sm font-medium text-gray-300">URLs Externas (una por línea)</label>
        <textarea
          id="external_urls"
          value={externalUrls}
          onChange={(e) => setExternalUrls(e.target.value)}
          rows="3"
          className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:ring-purple-500 focus:border-purple-500"
        ></textarea>
      </div>
      <div className="flex justify-end space-x-4 pt-4">
        <button type="submit" className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-500 text-white">{isEditMode ? 'Actualizar Tarea' : 'Crear Tarea'}</button>
      </div>

    </form>
  );
};

export default TareaForm;