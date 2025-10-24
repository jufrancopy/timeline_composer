import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Timeline from '../components/Timeline';
import AddComposerForm from '../components/AddComposerForm';
import EditSuggestionForm from '../components/EditSuggestionForm';
import Ephemeris from '../components/Ephemeris';
import ComposerOfTheDay from '../components/ComposerOfTheDay';
import apiClient from '../api';

const TimelinePage = () => {
  const [composers, setComposers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComposer, setNewComposer] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedComposerId, setSelectedComposerId] = useState(null);

  // Estados para el modal de edición
  const [editingComposer, setEditingComposer] = useState(null);
  const [isEditFormVisible, setIsEditFormVisible] = useState(false);

  // Estados para paginación
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const observer = useRef();

  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('ALL');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [sortBy, setSortBy] = useState('birth_year'); // birth_year, name, rating

  // Definir períodos disponibles
  const periods = useMemo(() => [
    { value: 'ALL', label: 'Todos los períodos' },
    { value: 'COLONIAL', label: 'Colonial (hasta 1811)' },
    { value: 'INDEPENDENCIA_Y_GUERRA_GRANDE', label: 'Independencia (1811-1870)' },
    { value: 'POSGUERRA', label: 'Posguerra (1870-1920)' },
    { value: 'GUERRA_DEL_CHACO_Y_GUARANIA', label: 'Guerra del Chaco (1920-1950)' },
    { value: 'DICTADURA', label: 'Dictadura (1950-1989)' },
    { value: 'TRANSICION', label: 'Transición (1989-2000)' },
    { value: 'ACTUALIDAD', label: 'Actualidad (2000-)' },
    { value: 'INDETERMINADO', label: 'Período indeterminado' }
  ], []);

  const roles = useMemo(() => [
    { value: 'ALL', label: 'Todos los roles' },
    { value: 'COMPOSER', label: 'Compositor' },
    { value: 'PERFORMER', label: 'Intérprete' },
    { value: 'CONDUCTOR', label: 'Director' },
    { value: 'POET', label: 'Poeta' }
  ], []);

  const sortComposersByBirthYear = useCallback((list) =>
    [...list].sort((a, b) => (a.birth_year || 0) - (b.birth_year || 0)),
    []);

  const sortComposers = useCallback((list, sortType) => {
    const sorted = [...list];
    switch (sortType) {
      case 'name':
        return sorted.sort((a, b) =>
          `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`)
        );
      case 'rating':
        return sorted.sort((a, b) => (b.rating_avg || 0) - (a.rating_avg || 0));
      case 'birth_year':
      default:
        return sorted.sort((a, b) => (a.birth_year || 0) - (b.birth_year || 0));
    }
  }, []);

  // Filtrar y ordenar compositores
  const filteredComposers = useMemo(() => {
    let filtered = composers;

    // Filtrar por búsqueda
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        `${c.first_name} ${c.last_name}`.toLowerCase().includes(search) ||
        c.bio?.toLowerCase().includes(search) ||
        c.notable_works?.toLowerCase().includes(search)
      );
    }

    // Filtrar por período
    if (selectedPeriod !== 'ALL') {
      filtered = filtered.filter(c => c.period === selectedPeriod);
    }

    // Filtrar por rol
    if (selectedRole !== 'ALL') {
      filtered = filtered.filter(c =>
        c.mainRole && c.mainRole.includes(selectedRole)
      );
    }

    // Ordenar
    return sortComposers(filtered, sortBy);
  }, [composers, searchTerm, selectedPeriod, selectedRole, sortBy, sortComposers]);

  const fetchComposers = useCallback(async (pageNum) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const response = await apiClient.getComposers(pageNum, 100);
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
    setComposers(prev => sortComposersByBirthYear([...prev, composer]));
    setIsFormVisible(false);
  };

  const handleNewComposerHandled = () => {
    setNewComposer(null);
  };

  const handleSuggestEdit = (composer) => {
    setEditingComposer(composer);
    setIsEditFormVisible(true);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedPeriod('ALL');
    setSelectedRole('ALL');
    setSortBy('birth_year');
  };

  const hasActiveFilters = searchTerm || selectedPeriod !== 'ALL' || selectedRole !== 'ALL' || sortBy !== 'birth_year';

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Efemérides y Compositor del Día */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Ephemeris composers={composers} onComposerClick={setSelectedComposerId} />
          <ComposerOfTheDay composers={composers} onComposerClick={setSelectedComposerId} />
        </div>
      </div>

      {/* Header con filtros */}
      <div className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col gap-4">
            {/* Título y estadísticas */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Línea de Tiempo de la Música Paraguaya
                </h1>
                <p className="text-sm text-gray-400 mt-1">
                  {filteredComposers.length} {filteredComposers.length === 1 ? 'creador' : 'creadores'}
                  {hasActiveFilters && ` (de ${composers.length} totales)`}
                </p>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors"
                >
                  Limpiar filtros
                </button>
              )}
            </div>

            {/* Barra de búsqueda */}
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por nombre, biografía u obras..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-10 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500"
              />
              <svg
                className="absolute left-3 top-3.5 h-5 w-5 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Filtros y ordenamiento */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
              >
                {periods.map(period => (
                  <option key={period.value} value={period.value}>
                    {period.label}
                  </option>
                ))}
              </select>

              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
              >
                {roles.map(role => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
              >
                <option value="birth_year">Ordenar por año</option>
                <option value="name">Ordenar por nombre</option>
                <option value="rating">Ordenar por valoración</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Timeline
          composers={filteredComposers}
          loading={loading}
          newComposer={newComposer}
          onNewComposerHandled={handleNewComposerHandled}
          onSuggestEdit={handleSuggestEdit}
          lastComposerElementRef={lastComposerElementRef}
          selectedComposerId={selectedComposerId}
        />

        {loadingMore && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            <span className="ml-3 text-white">Cargando más creadores...</span>
          </div>
        )}

        {!loading && filteredComposers.length === 0 && (
          <div className="text-center py-16">
            <svg className="mx-auto h-16 w-16 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-medium text-gray-400 mb-2">
              No se encontraron creadores
            </h3>
            <p className="text-gray-500">
              Intenta ajustar tus filtros de búsqueda
            </p>
          </div>
        )}
      </div>

      {/* Botón flotante para agregar */}
      <button
        onClick={() => setIsFormVisible(true)}
        className="fixed bottom-8 right-8 bg-purple-600 text-white p-4 rounded-full shadow-lg hover:bg-purple-700 transition-all transform hover:scale-110 z-50 group"
        aria-label="Agregar nuevo compositor"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-3 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Agregar creador
        </span>
      </button>

      {/* Modal para agregar compositor */}
      <AddComposerForm
        onComposerAdded={handleComposerAdded}
        isOpen={isFormVisible}
        onClose={() => setIsFormVisible(false)}
      />

      {/* Modal para sugerir edición */}
      <EditSuggestionForm
        composer={editingComposer}
        isOpen={isEditFormVisible}
        onClose={() => {
          setIsEditFormVisible(false);
          setEditingComposer(null);
        }}
        onSuggestionAdded={(suggestion) => {
          console.log('Sugerencia añadida:', suggestion);
          // Opcional: mostrar notificación de éxito
        }}
      />
    </div>
  );
};

export default TimelinePage;