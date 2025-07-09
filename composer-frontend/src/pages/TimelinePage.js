import React, { useState, useEffect, useCallback } from 'react';
import Timeline from '../components/Timeline';
import AddComposerForm from '../components/AddComposerForm';
import apiClient from '../api';

const TimelinePage = () => {
  const [composers, setComposers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComposer, setNewComposer] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);

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

  useEffect(() => {
    if (newComposer) {
      setComposers(prev => sortComposersByBirthYear([...prev, newComposer]));
    }
  }, [newComposer, sortComposersByBirthYear]);

  const handleComposerAdded = (composer) => {
    setNewComposer(composer);
    setIsFormVisible(false);
  };

  const handleNewComposerHandled = () => {
    setNewComposer(null);
  };

  return (
    <div>
      {/* El formulario de contribución podría ir aquí si se desea */}
      <Timeline 
        composers={composers} 
        loading={loading}
        newComposer={newComposer} 
        onNewComposerHandled={handleNewComposerHandled} 
      />
    </div>
  );
};

export default TimelinePage;
