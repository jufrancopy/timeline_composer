import React, { useState, useEffect } from 'react';
import api from '../api';
import Swal from 'sweetalert2';
import { Plus, Edit3, Loader, XCircle, FileText, Globe, Youtube } from 'lucide-react';

const UnidadPlanForm = ({ planDeClasesId, onUnidadCreated, onUnidadUpdated, onCancel, initialData, isEditMode }) => {
  const [periodo, setPeriodo] = useState('');
  const [contenido, setContenido] = useState('');
  const [capacidades, setCapacidades] = useState('');
  const [horasTeoricas, setHorasTeoricas] = useState(0);
  const [horasPracticas, setHorasPracticas] = useState(0);
  const [estrategiasMetodologicas, setEstrategiasMetodologicas] = useState('');
  const [mediosVerificacionEvaluacion, setMediosVerificacionEvaluacion] = useState('');
  const [recursos, setRecursos] = useState([]);
  const [newRecursoValue, setNewRecursoValue] = useState('');
  const [newRecursoType, setNewRecursoType] = useState('url');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditMode && initialData) {
      setPeriodo(initialData.periodo || '');
      setContenido(initialData.contenido || '');
      setCapacidades(initialData.capacidades || '');
      setHorasTeoricas(initialData.horasTeoricas || 0);
      setHorasPracticas(initialData.horasPracticas || 0);
      setEstrategiasMetodologicas(initialData.estrategiasMetodologicas || '');
      setMediosVerificacionEvaluacion(initialData.mediosVerificacionEvaluacion || '');
      setRecursos(initialData.recursos || []);
    } else {
      setPeriodo('');
      setContenido('');
      setCapacidades('');
      setHorasTeoricas(0);
      setHorasPracticas(0);
      setEstrategiasMetodologicas('');
      setMediosVerificacionEvaluacion('');
      setRecursos([]);
      setNewRecursoValue('');
      setNewRecursoType('url');
    }
  }, [isEditMode, initialData]);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleAddRecurso = async () => {
    if (newRecursoType === 'file') {
      if (selectedFile) {
        setUploadingFile(true);
        try {
          const response = await api.uploadTareaMultimedia(selectedFile);
          const uploadedFilePath = response.data.filePath; // Asume que el backend devuelve { filePath: 'ruta' }
          setRecursos([...recursos, { type: 'file', value: uploadedFilePath }]);
          setSelectedFile(null);
          setNewRecursoType('url');
          Swal.fire('¡Archivo Subido!', 'El archivo se ha subido exitosamente.', 'success');
        } catch (uploadError) {
          console.error('Error al subir archivo:', uploadError);
          Swal.fire('Error', uploadError.response?.data?.message || 'Error al subir el archivo.', 'error');
        } finally {
          setUploadingFile(false);
        }
      } else {
        setError('Por favor, seleccione un archivo para subir.');
      }
    } else if (newRecursoValue.trim()) {
      setRecursos([...recursos, { type: newRecursoType, value: newRecursoValue.trim() }]);
      setNewRecursoValue('');
      setNewRecursoType('url'); // Reset to default
    }
  };

  const handleRemoveRecurso = (index) => {
    setRecursos(recursos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!periodo.trim() || !contenido.trim() || !capacidades.trim() || horasTeoricas < 0 || horasPracticas < 0) {
      setError('Por favor, complete todos los campos obligatorios y asegure que las horas no sean negativas.');
      setLoading(false);
      return;
    }

    let finalRecursos = [...recursos];
    if (newRecursoValue.trim()) {
      finalRecursos.push({ type: newRecursoType, value: newRecursoValue.trim() });
    }

    const data = {
      periodo,
      contenido,
      capacidades,
      horasTeoricas: parseInt(horasTeoricas, 10),
      horasPracticas: parseInt(horasPracticas, 10),
      estrategiasMetodologicas,
      mediosVerificacionEvaluacion,
      recursos: finalRecursos,
    };

    try {
      if (isEditMode) {
        await api.updateUnidadPlan(initialData.id, data);
        Swal.fire('Actualizada!', 'La unidad del plan de clases ha sido actualizada.', 'success');
        onUnidadUpdated();
      } else {
        await api.createUnidadPlan(planDeClasesId, data);
        Swal.fire('Creada!', 'La unidad del plan de clases ha sido creada.', 'success');
        onUnidadCreated();
      }
    } catch (err) {
      console.error('Error al guardar la unidad del plan de clases:', err);
      Swal.fire('Error', err.response?.data?.message || 'Error al guardar la unidad del plan de clases.', 'error');
      setError(err.response?.data?.message || 'Error al guardar la unidad del plan de clases.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6 bg-slate-800/60 rounded-xl border border-slate-700">
      {error && (
        <div className="bg-red-900/30 text-red-300 border border-red-400 rounded-lg p-3 flex items-center gap-2">
          <XCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label htmlFor="periodo" className="block text-sm font-medium text-slate-300 mb-2">
          Período/Módulo <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="periodo"
          value={periodo}
          onChange={(e) => setPeriodo(e.target.value)}
          className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          placeholder="Ej: Mes de Abril, Módulo 1: Introducción"
          required
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="contenido" className="block text-sm font-medium text-slate-300 mb-2">
          Contenido <span className="text-red-500">*</span>
        </label>
        <textarea
          id="contenido"
          value={contenido}
          onChange={(e) => setContenido(e.target.value)}
          rows="5"
          className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          placeholder="Detalle del contenido para este período o módulo."
          required
          disabled={loading}
        ></textarea>
      </div>

      <div>
        <label htmlFor="capacidades" className="block text-sm font-medium text-slate-300 mb-2">
          Capacidades
        </label>
        <textarea
          id="capacidades"
          value={capacidades}
          onChange={(e) => setCapacidades(e.target.value)}
          rows="3"
          className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          placeholder="Capacidades o resultados de aprendizaje esperados."
          disabled={loading}
        ></textarea>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="horasTeoricas" className="block text-sm font-medium text-slate-300 mb-2">
            Horas Teóricas <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="horasTeoricas"
            value={horasTeoricas}
            onChange={(e) => setHorasTeoricas(e.target.value)}
            className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            required
            min="0"
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="horasPracticas" className="block text-sm font-medium text-slate-300 mb-2">
            Horas Prácticas <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="horasPracticas"
            value={horasPracticas}
            onChange={(e) => setHorasPracticas(e.target.value)}
            className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            required
            min="0"
            disabled={loading}
          />
        </div>
      </div>

      <div>
        <label htmlFor="estrategiasMetodologicas" className="block text-sm font-medium text-slate-300 mb-2">
          Estrategias Metodológicas
        </label>
        <textarea
          id="estrategiasMetodologicas"
          value={estrategiasMetodologicas}
          onChange={(e) => setEstrategiasMetodologicas(e.target.value)}
          rows="3"
          className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          placeholder="Métodos y técnicas de enseñanza."
          disabled={loading}
        ></textarea>
      </div>

      <div>
        <label htmlFor="mediosVerificacionEvaluacion" className="block text-sm font-medium text-slate-300 mb-2">
          Medios de Verificación/Evaluación
        </label>
        <textarea
          id="mediosVerificacionEvaluacion"
          value={mediosVerificacionEvaluacion}
          onChange={(e) => setMediosVerificacionEvaluacion(e.target.value)}
          rows="3"
          className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          placeholder="Criterios e instrumentos para evaluar el aprendizaje."
          disabled={loading}
        ></textarea>
      </div>

      <div>
        <label htmlFor="newRecursoValue" className="block text-sm font-medium text-slate-300 mb-2">
          Recursos Adicionales
        </label>
        <div className="flex flex-col sm:flex-row gap-2 mb-2">
          <select
            id="newRecursoType"
            value={newRecursoType}
            onChange={(e) => setNewRecursoType(e.target.value)}
            className="flex-shrink-0 w-full sm:w-auto px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            disabled={loading}
          >
            <option value="url">Enlace (URL)</option>
            <option value="youtube">Video de YouTube</option>
            <option value="file">Archivo (subir)</option>
          </select>
          {newRecursoType === 'file' ? (
            <input
              type="file"
              id="newRecursoFile"
              onChange={handleFileChange}
              className="flex-grow px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-indigo-500 focus:border-indigo-500 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
              disabled={loading}
            />
          ) : (
            <input
              type="text"
              id="newRecursoValue"
              value={newRecursoValue}
              onChange={(e) => setNewRecursoValue(e.target.value)}
              className="flex-grow px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder={newRecursoType === 'youtube' ? 'ID o URL de YouTube' : (newRecursoType === 'file' ? 'Nombre del archivo (ej: documento.pdf)' : 'URL de recurso (ej: https://ejemplo.com/doc.pdf)')}
              disabled={loading}
            />
          )}
          <button
            type="button"
            onClick={handleAddRecurso}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || uploadingFile || (newRecursoType !== 'file' && !newRecursoValue.trim()) || (newRecursoType === 'file' && !selectedFile)}
          >
            {uploadingFile ? <Loader size={20} className="animate-spin" /> : <Plus size={20} />}
          </button>
        </div>
        <div className="space-y-2">
          {recursos.map((recurso, index) => (
            <div key={index} className="flex items-center gap-2 bg-slate-700/50 border border-slate-600 rounded-lg p-2 text-slate-300">
              {recurso.type === 'youtube' ? <Youtube size={16} className="flex-shrink-0 text-red-500" /> : (recurso.type === 'file' ? <FileText size={16} className="flex-shrink-0 text-purple-400" /> : <Globe size={16} className="flex-shrink-0" />)}
              <span className="flex-grow text-white truncate">{recurso.value} ({recurso.type})</span>
              <button
                type="button"
                onClick={() => handleRemoveRecurso(index)}
                className="p-1 text-red-400 hover:text-red-300 transition-colors"
                disabled={loading}
              >
                <XCircle size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-2 px-4 py-2 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-700/50 transition-colors"
          disabled={loading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader size={20} className="animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              {isEditMode ? <Edit3 size={20} /> : <Plus size={20} />}
              {isEditMode ? 'Actualizar Unidad' : 'Crear Unidad'}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default UnidadPlanForm;