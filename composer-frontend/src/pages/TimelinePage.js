import React, { useState, useEffect, useCallback, useRef } from 'react';
import Timeline from '../components/Timeline';
import AddComposerForm from '../components/AddComposerForm';
import EditSuggestionForm from '../components/EditSuggestionForm';
import apiClient from '../api';

const TimelinePage = () => {
  const [composers, setComposers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComposer, setNewComposer] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  
  // Estados para el modal de edición
  const [editingComposer, setEditingComposer] = useState(null);
  const [isEditFormVisible, setIsEditFormVisible] = useState(false);

  // Estados para paginación
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const observer = useRef();

  const sortComposersByBirthYear = useCallback((list) => [...list].sort((a, b) => (a.birth_year || 0) - (b.birth_year || 0)), []);

  const fetchComposers = useCallback(async (pageNum) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);
    
    try {
      const response = await apiClient.get(`/composers?page=${pageNum}&limit=10`);
      if (!response.data || !Array.isArray(response.data.data)) throw new Error('Formato de datos inválido');
      
      setComposers(prev => {
        const existingIds = new Set(prev.map(c => c.id));
        const newComposers = response.data.data.filter(c => !existingIds.has(c.id));
        return sortComposersByBirthYear([...prev, ...newComposers]);
      });
      setTotalPages(response.data.totalPages);

    } catch (err) {
      console.error('Error al cargar compositores:', err);
    } finally {
      if (pageNum === 1) setLoading(false);
      else setLoadingMore(false);
    }
  }, [sortComposersByBirthYear]);

  useEffect(() => {
    fetchComposers(1);
  }, [fetchComposers]);

  const lastComposerElementRef = useCallback(node => {
    if (loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && page < totalPages) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loadingMore, page, totalPages]);

  useEffect(() => {
    if (page > 1) {
      fetchComposers(page);
    }
  }, [page, fetchComposers]);

  const handleComposerAdded = (composer) => {
    setNewComposer(composer);
    setIsFormVisible(false);
  };

  const handleNewComposerHandled = () => {
    setNewComposer(null);
  };

  // Handlers para el formulario de edición
  const handleSuggestEdit = (composer) => {
    setEditingComposer(composer);
    setIsEditFormVisible(true);
  };

  const handleSuggestionSent = () => {
    setIsEditFormVisible(false);
    setEditingComposer(null);
    // Opcional: mostrar un toast/notificación de éxito
  };

  return (
    <div className="relative">
      <Timeline 
        composers={composers} 
        loading={loading}
        newComposer={newComposer} 
        onNewComposerHandled={handleNewComposerHandled}
        onSuggestEdit={handleSuggestEdit}
        lastComposerElementRef={lastComposerElementRef}
      />
      {loadingMore && <div className="text-center text-white py-4">Cargando más creadores...</div>}
      
      <button
        onClick={() => setIsFormVisible(true)}
        className="fixed bottom-8 right-8 bg-purple-600 text-white p-4 rounded-full shadow-lg hover:bg-purple-700 transition-transform transform hover:scale-110 z-50"
        aria-label="Agregar nuevo compositor"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {isFormVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="relative bg-gray-900 p-2 rounded-lg shadow-xl w-full max-w-2xl my-8">
            <AddComposerForm onComposerAdded={handleComposerAdded} />
            <button 
              onClick={() => setIsFormVisible(false)}
              className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full text-sm"
              aria-label="Cerrar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {isEditFormVisible && editingComposer && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="relative bg-gray-900 p-2 rounded-lg shadow-xl w-full max-w-2xl my-8">
            <EditSuggestionForm 
              composer={editingComposer}
              onSuggestionSent={handleSuggestionSent}
              onCancel={() => setIsEditFormVisible(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TimelinePage;