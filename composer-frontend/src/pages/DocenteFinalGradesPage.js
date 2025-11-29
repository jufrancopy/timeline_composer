import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import api from '../api';
import { toast } from 'react-toastify';
import FinalGradeConfigForm from '../components/FinalGradeConfigForm';
import Modal from '../components/Modal';
import FinalGradeDisplay from '../components/FinalGradeDisplay';

const DocenteFinalGradesPage = () => {
  const { catedraId } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialAlumnoId = queryParams.get('alumnoId');
  const [targetAlumnoId, setTargetAlumnoId] = useState(initialAlumnoId);
  const [configs, setConfigs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [displayingConfigResults, setDisplayingConfigResults] = useState(null); // Nuevo estado para la config cuyos resultados se muestran
  const [currentResults, setCurrentResults] = useState([]);
  const [currentConfigIdForDisplay, setCurrentConfigIdForDisplay] = useState(null);
  const [currentPorcentajeMinimoAprobacion, setCurrentPorcentajeMinimoAprobacion] = useState(60.0);

  const fetchConfigs = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/docente/catedra/${catedraId}/calificacionFinal/configs`);
      setConfigs(response.data);
    } catch (error) {
      console.error('Error al obtener configuraciones de calificación final:', error);
      toast.error('Error al cargar las configuraciones.');
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
    setIsLoading(true);
    try {
      const response = await api.get(`/docente/catedra/${catedraId}/calificacionFinal/config/${config.id}/results`); // Esta ruta aún no está implementada en el backend
      setCurrentResults(response.data); // Asumiendo que el backend devuelve { alumnoNombre, alumnoApellido, alumnoEmail, notaFinal }
      setCurrentPorcentajeMinimoAprobacion(config.porcentajeMinimoAprobacion);
      setCurrentConfigIdForDisplay(config.id);
      setDisplayingConfigResults(config); // Almacenar la configuración para mostrar sus resultados
    } catch (error) {
      console.error('Error al obtener resultados de calificación final:', error);
      toast.error('Error al cargar los resultados. Asegúrate de que las calificaciones hayan sido calculadas.');
    } finally {
      setIsLoading(false);
    }
  };

  // Aquí necesitaríamos una función para eliminar configuración si se implementa en el backend
  // const handleDeleteConfig = async (configId) => { ... };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Cálculo de Calificaciones Finales</h1>
          <p className="text-gray-600">Crea y gestiona las configuraciones para calcular la nota final de tus alumnos.</p>
        </div>
        <Link to={`/docente/catedra/${catedraId}`} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md shadow-md">
          Volver a la Cátedra
        </Link>
      </div>

      <button
        onClick={handleCreateNewConfig}
        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md shadow-md mb-6"
      >
        Crear Nueva Configuración de Calificación Final
      </button>

      {isLoading && <p className="text-center text-gray-600">Cargando configuraciones...</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {configs.length > 0 ? (
          configs.map((config) => (
            <div key={config.id} className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <h2 className="text-xl font-bold mb-2 text-gray-800">{config.titulo}</h2>
              <p className="text-gray-600 text-sm mb-1">Creada el: {new Date(config.fechaCreacion).toLocaleDateString()}</p>
              <p className="text-gray-600 text-sm mb-4">% Mínimo de Aprobación: <span className="font-semibold">{config.porcentajeMinimoAprobacion}%</span></p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleEditConfig(config)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-3 rounded text-sm"
                >
                  Editar
                </button>
                <button
                  onClick={() => {
                    if (displayingConfigResults && displayingConfigResults.id === config.id) {
                      setDisplayingConfigResults(null); // Si ya se está mostrando, ocultar
                    } else {
                      handleViewResults(config); // Si no se muestra o es otra config, cargar y mostrar
                    }
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-3 rounded text-sm"
                >
                  Ver Resultados
                </button>
                {/* Botón para calcular calificaciones, útil si se desea recalcular */}
                <button
                  onClick={async () => {
                    // Lógica para recalcular directamente desde aquí
                    setIsLoading(true);
                    try {
                      await api.post(`/docente/catedra/${catedraId}/calificacionFinal/calcular`, { 
                        calificacionFinalConfigId: config.id, 
                        alumnoId: targetAlumnoId ? parseInt(targetAlumnoId) : undefined 
                      });
                      toast.success('Calificaciones recalculadas exitosamente!');
                      handleViewResults(config); // Recargar los resultados para mostrar la actualización
                    } catch (error) {
                      console.error('Error al recalcular calificaciones:', error);
                      toast.error('Error al recalcular calificaciones.');
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-3 rounded text-sm"
                  disabled={isLoading}
                >
                  Recalcular
                </button>
                {/* <button
                  onClick={() => handleDeleteConfig(config.id)}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-3 rounded text-sm"
                >
                  Eliminar
                </button> */}
              </div>
            </div>
          ))
        ) : (
          !isLoading && <p className="text-gray-600">No hay configuraciones de calificación final creadas para esta cátedra.</p>
        )}
      </div>

      <Modal isOpen={showConfigModal} onClose={() => setShowConfigModal(false)} title={editingConfig ? 'Editar Configuración de Calificación Final' : 'Crear Nueva Configuración de Calificación Final'}>
        <FinalGradeConfigForm
          config={editingConfig}
          onClose={() => setShowConfigModal(false)}
          onSaveSuccess={fetchConfigs}
          catedraId={catedraId}
          alumnoId={targetAlumnoId}
        />
      </Modal>

      {displayingConfigResults && (
        <div className="mt-8 bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Resultados de: {displayingConfigResults.titulo}</h2>
          <FinalGradeDisplay 
            results={currentResults} 
            porcentajeMinimoAprobacion={currentPorcentajeMinimoAprobacion} 
            selectedAlumnoId={targetAlumnoId ? parseInt(targetAlumnoId) : undefined} 
            configId={currentConfigIdForDisplay}
            catedraId={catedraId}
          />
           <button 
            onClick={() => setDisplayingConfigResults(null)}
            className="mt-4 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md shadow-md"
          >
            Ocultar Resultados
          </button>
        </div>
      )}
    </div>
  );
};

export default DocenteFinalGradesPage;
