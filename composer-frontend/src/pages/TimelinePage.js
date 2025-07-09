import React, { useState, useEffect, useCallback } from 'react';
import Timeline from '../components/Timeline';
import AddComposerForm from '../components/AddComposerForm';
import apiClient from '../api';
import Modal from '../components/Modal'; // Importar Modal
import ComposerOfTheDay from '../components/ComposerOfTheDay';
import Ephemeris from '../components/Ephemeris';

const TimelinePage = () => {
  const [composers, setComposers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComposer, setNewComposer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scrollToComposerId, setScrollToComposerId] = useState(null);

  const handleGoToComposer = (id) => {
    setScrollToComposerId(id);
  };
  
  const sortComposersByBirthYear = useCallback((list) => [...list].sort((a, b) => (a.birth_year || 0) - (b.birth_year || 0)), []);

  const fetchComposers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/composers');
      if (!response.data || !Array.isArray(response.data)) throw new Error('Formato de datos inválido');
      setComposers(sortComposersByBirthYear(response.data));
    } catch (err) {
      console.error('Error al cargar compositores:', err);
    } finally {
      setLoading(false);
    }
  }, [sortComposersByBirthYear]);

  useEffect(() => {
    fetchComposers();
  }, [fetchComposers]);

  const handleComposerAdded = (composer) => {
    setNewComposer(composer);
    setIsModalOpen(false); // Cerrar el modal después de agregar
    fetchComposers(); // Recargar la lista para que incluya el nuevo
  };

  const handleNewComposerHandled = useCallback(() => {
    setNewComposer(null);
    fetchComposers();
  }, [fetchComposers]);

  return (
    <div className="relative">
      {/* Botón flotante para abrir el modal de agregar compositor */}
      <div className="fixed bottom-8 right-8 z-50">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-full py-3 px-6 shadow-lg transition-transform transform hover:scale-110 flex items-center gap-2"
          aria-label="Agregar nuevo creador"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline">Agregar Nuevo Autor</span>
        </button>
      </div>

      {/* Modal para el formulario */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Añadir Nuevo Creador"
        showSubmitButton={false} // Ocultamos el botón de submit del modal, el formulario tendrá el suyo
      >
        <AddComposerForm onComposerAdded={handleComposerAdded} onCancel={() => setIsModalOpen(false)} />
      </Modal>

      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <ComposerOfTheDay onGoToComposer={handleGoToComposer} />
          <Ephemeris composers={composers} onGoToComposer={handleGoToComposer} />
        </div>
      </div>

      <Timeline 
        composers={composers} 
        loading={loading}
        newComposer={newComposer} 
        onNewComposerHandled={handleNewComposerHandled}
        scrollToComposerId={scrollToComposerId}
        onScrolled={() => setScrollToComposerId(null)}
      />
    </div>
  );
};

export default TimelinePage;