import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import { toast } from 'react-toastify';
import FinalGradeConfigForm from './FinalGradeConfigForm';
import Modal from './Modal';
import FinalGradeDisplay from './FinalGradeDisplay';
import { Plus, Edit, Eye, RefreshCw } from 'lucide-react';




const FinalGradesSection = () => {
  const { id: catedraId } = useParams();
  const [configs, setConfigs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [displayingConfigResults, setDisplayingConfigResults] = useState(null);
  const [currentResults, setCurrentResults] = useState(null);

  const fetchConfigs = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/docente/catedra/${catedraId}/calificacionFinal/configs`);
      setConfigs(response.data);
    } catch (error) {
      toast.error('Error al cargar las configuraciones de calificación final.');
      console.error('Error al obtener configuraciones:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, [catedraId]);

  const handleCreateNewConfig = () => {
    setEditingConfig(null);
    setShowConfigModal(true);
  };

  const handleEditConfig = (config) => {
    setEditingConfig(config);
    setShowConfigModal(true);
  };

  const handleViewResults = async (config) => {
    if (displayingConfigResults && displayingConfigResults.id === config.id) {
      setDisplayingConfigResults(null); // Ocultar si ya se está mostrando
      setCurrentResults(null);
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.get(`/docente/catedra/${catedraId}/calificacionFinal/config/${config.id}/results`);
      setCurrentResults(response.data);
      setDisplayingConfigResults(config);
    } catch (error) {
      toast.error('Error al cargar los resultados. Asegúrate de que las calificaciones hayan sido calculadas.');
      console.error('Error al obtener resultados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecalculate = async (config) => {
    setIsLoading(true);
    try {
      await api.post(`/docente/catedra/${catedraId}/calificacionFinal/calcular`, { 
        configId: config.id 
      });
      toast.success('Calificaciones recalculadas exitosamente!');
      // Si los resultados de esta config se están mostrando, recargarlos
      if (displayingConfigResults && displayingConfigResults.id === config.id) {
        handleViewResults(config);
      }
    } catch (error) {
      toast.error('Error al recalcular calificaciones.');
      console.error('Error al recalcular:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <button
          onClick={handleCreateNewConfig}
          className="group inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium rounded-xl transition-all duration-300 shadow-lg shadow-purple-900/25 hover:shadow-xl hover:shadow-purple-900/40 hover:scale-105"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
          <span>Crear Configuración</span>
        </button>
      </div>

      {isLoading && <p className="text-center text-slate-400">Cargando...</p>}

      <div className="space-y-4">
        {configs.length > 0 ? (
          configs.map((config) => (
            <div key={config.id} className="bg-slate-800/50 rounded-lg border border-slate-700/50">
              <div className="p-4 flex flex-col sm:flex-row justify-between items-center">
                <div>
                  <h4 className="text-lg font-bold text-white">{config.titulo}</h4>
                  <p className="text-sm text-slate-400">
                    Creada: {new Date(config.fechaCreacion).toLocaleDateString()} | Aprobación: {config.porcentajeMinimoAprobacion}%
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-3 sm:mt-0">
                  <button onClick={() => handleEditConfig(config)} className="p-2 bg-yellow-600/20 text-yellow-300 hover:bg-yellow-600/30 rounded-lg transition-colors border border-yellow-500/30" title="Editar">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleViewResults(config)} className="p-2 bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 rounded-lg transition-colors border border-blue-500/30" title="Ver/Ocultar Resultados">
                    <Eye size={16} />
                  </button>
                  <button onClick={() => handleRecalculate(config)} className="p-2 bg-green-600/20 text-green-300 hover:bg-green-600/30 rounded-lg transition-colors border border-green-500/30" title="Recalcular Calificaciones">
                    <RefreshCw size={16} />
                  </button>
                </div>
              </div>
              {displayingConfigResults && displayingConfigResults.id === config.id && (
                <div className="border-t border-slate-700/50 p-4">
                  {currentResults ? (
                    <FinalGradeDisplay 
                      results={currentResults.resultados} 
                      porcentajeMinimoAprobacion={displayingConfigResults.porcentajeMinimoAprobacion}
                      configId={displayingConfigResults.id}
                      catedraId={catedraId}
                    />
                  ) : (
                    <p className="text-center text-slate-400">Cargando resultados...</p>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          !isLoading && <p className="text-center text-slate-500 py-8">No hay configuraciones de calificación final creadas.</p>
        )}
      </div>

      <Modal isOpen={showConfigModal} onClose={() => setShowConfigModal(false)} title={editingConfig ? 'Editar Configuración' : 'Crear Configuración'}>
        <FinalGradeConfigForm
          config={editingConfig}
          onClose={() => setShowConfigModal(false)}
          onSaveSuccess={fetchConfigs}
          catedraId={catedraId}
        />
      </Modal>
    </>
  );
};

export default FinalGradesSection;
