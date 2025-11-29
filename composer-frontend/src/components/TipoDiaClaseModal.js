import React, { useState, useEffect } from 'react';

const TipoDiaClaseModal = ({ isOpen, onClose, diaClase, onSave }) => {
  const [selectedTipoDia, setSelectedTipoDia] = useState(diaClase?.tipoDia || 'NORMAL');

  useEffect(() => {
    if (diaClase) {
      setSelectedTipoDia(diaClase.tipoDia || 'NORMAL');
    }
  }, [diaClase]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (diaClase) {
      onSave(diaClase.id, selectedTipoDia);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg p-6 w-full max-w-sm border border-slate-700 shadow-xl animate-in zoom-in-90 duration-300">
        <h3 className="text-xl font-bold text-white mb-4">Modificar Tipo de Día</h3>
        {diaClase && (
          <p className="text-slate-300 mb-4">Día: {new Date(diaClase.fecha).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        )}

        <div className="mb-4">
          <label htmlFor="tipoDiaSelect" className="block text-sm font-medium text-slate-400 mb-2">Tipo de Día:</label>
          <select
            id="tipoDiaSelect"
            value={selectedTipoDia}
            onChange={(e) => setSelectedTipoDia(e.target.value)}
            className="block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="NORMAL">Normal</option>
            <option value="FERIADO">Feriado</option>
            <option value="ASUETO">Asueto</option>
            <option value="LLUVIA">Lluvia</option>
          </select>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default TipoDiaClaseModal;
