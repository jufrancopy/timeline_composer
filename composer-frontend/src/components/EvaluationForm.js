import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';
import toast from 'react-hot-toast';

function EvaluationForm({ catedraId, onSubmit, loading, onCancel, initialData = null, isEditMode = false }) {
  const [prompt, setPrompt] = useState('');
  const [subject, setSubject] = useState('');
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const [numberOfOptions, setNumberOfOptions] = useState(4);
  const [selectedUnidadId, setSelectedUnidadId] = useState('');
  const [planesDeClases, setPlanesDeClases] = useState([]);
  const [unidadesDePlan, setUnidadesDePlan] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [unidadContent, setUnidadContent] = useState('');
  const [fechaLimite, setFechaLimite] = useState('');
  const [allUnitsSelected, setAllUnitsSelected] = useState(false);

  // Effect to load plans de clases when catedraId is available
  useEffect(() => {
    const fetchPlanesDeClases = async () => {
      if (!catedraId) return;
      try {
        const response = await api.getDocentePlanesDeClase(catedraId);
        setPlanesDeClases(response.data);
        if (isEditMode && initialData) {
          // En modo edición, solo cargamos subject y fecha_limite
          setSubject(initialData.titulo || '');
          setFechaLimite(initialData.fecha_limite ? new Date(initialData.fecha_limite).toISOString().split('T')[0] : '');
        } else if (initialData?.planDeClasesId) {
          setSelectedPlanId(initialData.planDeClasesId.toString());
        } else if (response.data.length > 0) {
          setSelectedPlanId(response.data[0].id.toString());
        }
      } catch (error) {
        toast.error('Error al cargar los planes de clases.');
        console.error('Error fetching planes de clases:', error);
      }
    };
    fetchPlanesDeClases();
  }, [catedraId, initialData, isEditMode]);

  // Effect to update unidades de plan when a plan is selected
  useEffect(() => {
    if (selectedPlanId && !isEditMode) { // Solo en modo creación
      const plan = planesDeClases.find(p => p.id.toString() === selectedPlanId);
      if (plan) {
        setUnidadesDePlan(plan.UnidadPlan);
        if (initialData?.unidadPlanId) {
          if (initialData.unidadPlanId === 'all') {
            setAllUnitsSelected(true);
            setSelectedUnidadId('all');
          } else {
            setSelectedUnidadId(initialData.unidadPlanId.toString());
            setAllUnitsSelected(false);
          }
        } else if (plan.UnidadPlan.length > 0) {
          setSelectedUnidadId(plan.UnidadPlan[0].id.toString());
          setAllUnitsSelected(false);
        } else {
          setSelectedUnidadId('');
          setAllUnitsSelected(false);
        }
      } else {
        setUnidadesDePlan([]);
        setSelectedUnidadId('');
        setAllUnitsSelected(false);
      }
    }
  }, [selectedPlanId, planesDeClases, initialData, isEditMode]);

  // Effect to fetch unidad content when a unidad or all units are selected
  const fetchAndSetUnidadContent = useCallback(async () => {
    if (allUnitsSelected && selectedPlanId && !isEditMode) {
      const plan = planesDeClases.find(p => p.id.toString() === selectedPlanId);
      if (plan && plan.UnidadPlan.length > 0) {
        const combinedContent = plan.UnidadPlan.map(u => u.contenido).join('\n\n---\n\n');
        setUnidadContent(combinedContent);
      } else {
        setUnidadContent('');
      }
    } else if (selectedUnidadId && selectedPlanId && catedraId && !isEditMode) {
      try {
        const response = await api.getUnidadContent(catedraId, selectedPlanId, selectedUnidadId);
        setUnidadContent(response.data.contenido);
      } catch (error) {
        toast.error('Error al cargar el contenido de la unidad.');
        console.error('Error fetching unidad content:', error);
        setUnidadContent('');
      }
    } else {
      setUnidadContent('');
    }
  }, [catedraId, selectedPlanId, selectedUnidadId, allUnitsSelected, planesDeClases, isEditMode]);

  useEffect(() => {
    if (!isEditMode) {
      fetchAndSetUnidadContent();
    }
  }, [fetchAndSetUnidadContent, isEditMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isEditMode) {
      // MODO EDICIÓN - Solo enviar Asunto y Fecha Límite
      if (!initialData || !initialData.id) {
        toast.error('Error: ID de evaluación no disponible para la edición.');
        return;
      }
      try {
        await api.updateDocenteEvaluation(initialData.id, {
          titulo: subject,
          fecha_limite: fechaLimite || null,
          // NO enviar unidadPlanId ni planDeClasesId en modo edición
        });
        toast.success('Evaluación actualizada exitosamente.');
        onSubmit(); // Indicar que la operación se completó
      } catch (error) {
        toast.error('Error al actualizar la evaluación.');
        console.error('Error updating evaluation:', error);
      }
    } else {
      // MODO CREACIÓN - Enviar todos los datos
      const unidadIdPayload = selectedUnidadId === 'all' ? null : (selectedUnidadId ? parseInt(selectedUnidadId, 10) : null);
      const planDeClasesIdPayload = selectedPlanId ? parseInt(selectedPlanId, 10) : null;

      if (prompt.trim() && subject.trim() && numberOfQuestions > 0 && numberOfOptions > 0) {
        onSubmit(prompt, subject, numberOfQuestions, numberOfOptions, unidadIdPayload, unidadContent, planDeClasesIdPayload, fechaLimite);
      }
    }
  };

  const renderNumberOptions = (min, max) => {
    const options = [];
    for (let i = min; i <= max; i++) {
      options.push(<option key={i} value={i}>{i}</option>);
    }
    return options;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {isEditMode ? (
        // MODO EDICIÓN - Solo mostrar Asunto y Fecha Límite
        <div className="space-y-6">
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-300">
              Asunto del Examen:
            </label>
            <input
              type="text"
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1 block w-full p-3 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:ring-purple-500 focus:border-purple-500"
              placeholder="Ej: Historia de la Música, Armonía I"
              required
            />
          </div>
          
          <div>
            <label htmlFor="fechaLimite" className="block text-sm font-medium text-gray-300">
              Fecha Límite:
            </label>
            <input
              type="date"
              id="fechaLimite"
              value={fechaLimite}
              onChange={(e) => setFechaLimite(e.target.value)}
              className="mt-1 block w-full p-3 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        </div>
      ) : (
        // MODO CREACIÓN - Mostrar formulario completo
        <>
          <div>
            <label htmlFor="planDeClases" className="block text-sm font-medium text-gray-300">
              Plan de Clases:
            </label>
            <select
              id="planDeClases"
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value)}
              className="mt-1 block w-full p-3 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:ring-purple-500 focus:border-purple-500"
              required
            >
              <option value="">Selecciona un Plan de Clases</option>
              {planesDeClases.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.titulo}
                </option>
              ))}
            </select>
          </div>

          {selectedPlanId && (
            <div>
              <label htmlFor="unidadPlan" className="block text-sm font-medium text-gray-300">
                Unidad del Plan:
              </label>
              <select
                id="unidadPlan"
                value={selectedUnidadId}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedUnidadId(value);
                  if (value !== 'all') {
                    setAllUnitsSelected(false);
                  }
                }}
                className="mt-1 block w-full p-3 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-800 disabled:text-gray-400"
                required
                disabled={allUnitsSelected}
              >
                <option value="">Selecciona una Unidad</option>
                {unidadesDePlan.map((unidad) => (
                  <option key={unidad.id} value={unidad.id}>
                    {unidad.periodo}
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedPlanId && unidadesDePlan.length > 0 && (
            <div className="flex items-center mt-4">
              <input
                type="checkbox"
                id="allUnitsCheckbox"
                checked={allUnitsSelected}
                onChange={(e) => setAllUnitsSelected(e.target.checked)}
                className="form-checkbox h-5 w-5 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
              />
              <label htmlFor="allUnitsCheckbox" className="ml-2 text-sm font-medium text-gray-300">
                Generar preguntas para todas las Unidades de este Plan
              </label>
            </div>
          )}

          {unidadContent && (
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Contenido de las {allUnitsSelected ? 'Unidades' : 'Unidad'} Seleccionadas:
              </label>
              <textarea
                id="unidadContent"
                value={unidadContent}
                onChange={(e) => setUnidadContent(e.target.value)}
                rows="5"
                className="mt-1 block w-full p-3 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:ring-purple-500 focus:border-purple-500 overflow-y-auto max-h-40"
                placeholder="El contenido de la unidad se cargará aquí. Puedes editarlo si es necesario."
              ></textarea>
            </div>
          )}

          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-300">
              Asunto del Examen:
            </label>
            <input
              type="text"
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1 block w-full p-3 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:ring-purple-500 focus:border-purple-500"
              placeholder="Ej: Historia de la Música, Armonía I"
              required
            />
          </div>

          <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-300">
              Prompt para la IA:
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows="5"
              className="mt-1 block w-full p-3 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:ring-purple-500 focus:border-purple-500"
              placeholder="Ej: Genera preguntas sobre el período barroco, enfocándose en Vivaldi y Bach."
              required
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="fechaLimite" className="block text-sm font-medium text-gray-300">
                Fecha Límite:
              </label>
              <input
                type="date"
                id="fechaLimite"
                value={fechaLimite}
                onChange={(e) => setFechaLimite(e.target.value)}
                className="mt-1 block w-full p-3 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div>
              <label htmlFor="numberOfQuestions" className="block text-sm font-medium text-gray-300">
                Cantidad de Preguntas:
              </label>
              <select
                id="numberOfQuestions"
                value={numberOfQuestions}
                onChange={(e) => setNumberOfQuestions(parseInt(e.target.value, 10))}
                className="mt-1 block w-full p-3 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:ring-purple-500 focus:border-purple-500"
                required
              >
                {renderNumberOptions(1, 50)}
              </select>
            </div>
            <div>
              <label htmlFor="numberOfOptions" className="block text-sm font-medium text-gray-300">
                Cantidad de Opciones por Pregunta:
              </label>
              <select
                id="numberOfOptions"
                value={numberOfOptions}
                onChange={(e) => setNumberOfOptions(parseInt(e.target.value, 10))}
                className="mt-1 block w-full p-3 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:ring-purple-500 focus:border-purple-500"
                required
              >
                {renderNumberOptions(2, 5)}
              </select>
            </div>
          </div>
        </>
      )}

      <div className="flex items-center justify-end space-x-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 bg-gray-600 rounded-md hover:bg-gray-500 text-white font-semibold"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-purple-600 rounded-md hover:bg-purple-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? (isEditMode ? 'Guardando...' : 'Generando...') : (isEditMode ? 'Guardar Cambios' : 'Generar Evaluación')}
        </button>
      </div>
    </form>
  );
}

export default EvaluationForm;