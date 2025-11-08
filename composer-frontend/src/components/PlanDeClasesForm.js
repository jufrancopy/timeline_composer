import React, { useState, useEffect } from 'react';
import api from '../api';
import Swal from 'sweetalert2';
import { Plus, Edit3, Loader, XCircle, CheckCircle } from 'lucide-react';

const PlanDeClasesForm = ({ catedraId, onPlanCreated, onPlanUpdated, onCancel, initialData, isEditMode }) => {
  const [titulo, setTitulo] = useState('');
  const [tipoOrganizacion, setTipoOrganizacion] = useState('MES'); // Default to MES
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditMode && initialData) {
      setTitulo(initialData.titulo || '');
      setTipoOrganizacion(initialData.tipoOrganizacion || 'MES');
    } else {
      setTitulo('');
      setTipoOrganizacion('MES');
    }
  }, [isEditMode, initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!titulo.trim()) {
      setError('El título del plan de clases es obligatorio.');
      setLoading(false);
      return;
    }

    try {
      if (isEditMode) {
        console.log("Intentando actualizar plan de clases con ID:", initialData.id); // <-- Nueva línea
        await api.updatePlanDeClases(initialData.id, { titulo, tipoOrganizacion });
        Swal.fire('Actualizado!', 'El plan de clases ha sido actualizado.', 'success');
        onPlanUpdated();
      } else {
        await api.createPlanDeClases(catedraId, { titulo, tipoOrganizacion });
        Swal.fire('Creado!', 'El plan de clases ha sido creado.', 'success');
        onPlanCreated();
      }
    } catch (err) {
      console.error('Error al guardar el plan de clases:', err);
      Swal.fire('Error', err.response?.data?.message || 'Error al guardar el plan de clases.', 'error');
      setError(err.response?.data?.message || 'Error al guardar el plan de clases.');
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
        <label htmlFor="titulo" className="block text-sm font-medium text-slate-300 mb-2">
          Título del Plan <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="titulo"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-purple-500 focus:border-purple-500 transition-colors"
          placeholder="Ej: Plan Anual de Matemáticas"
          required
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="tipoOrganizacion" className="block text-sm font-medium text-slate-300 mb-2">
          Tipo de Organización <span className="text-red-500">*</span>
        </label>
        <select
          id="tipoOrganizacion"
          value={tipoOrganizacion}
          onChange={(e) => setTipoOrganizacion(e.target.value)}
          className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-purple-500 focus:border-purple-500 transition-colors"
          required
          disabled={loading}
        >
          <option value="MES">Por Mes</option>
          <option value="MODULO">Por Módulo</option>
        </select>
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
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
              {isEditMode ? 'Actualizar Plan' : 'Crear Plan'}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default PlanDeClasesForm;
