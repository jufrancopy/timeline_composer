import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Music, Palette, Camera, Pen, Award, Calendar, Star, Clock, ExternalLink } from 'lucide-react';
import apiClient from '../api'; // Importar apiClient

const Timeline = ({ composers = [], loading = false, newComposer = null, onNewComposerHandled = null, scrollToComposerId, onScrolled }) => {
  // Estados del componente
  const [selectedItem, setSelectedItem] = useState(null);
  const [visibleItems, setVisibleItems] = useState([]);
  const [internalComposers, setInternalComposers] = useState([]);
  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [newCommentName, setNewCommentName] = useState('');
  const [newRating, setNewRating] = useState(0);
  const [commentError, setCommentError] = useState(null);
  const [ratingError, setRatingError] = useState(null);
  const [commentSuccess, setCommentSuccess] = useState(false);
  const [ratingSuccess, setRatingSuccess] = useState(false);

  useEffect(() => {
    if (scrollToComposerId) {
      const cardElement = document.getElementById(`composer-card-${scrollToComposerId}`);
      if (cardElement) {
        console.log(`[Timeline] Encontrado card para ID: ${scrollToComposerId}`);
        setSelectedItem(scrollToComposerId);
        cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        onScrolled(); // Reset the scroll trigger
      } else {
        console.log(`[Timeline] No se encontró card para ID: ${scrollToComposerId}. Composers actuales:`, internalComposers.map(c => c.id));
      }
    }
  }, [scrollToComposerId, onScrolled, internalComposers]);

  // Datos de demostración cuando no hay composers
  const demoData = [
    {
      id: 1,
      birth_year: 1756,
      first_name: "Wolfgang Amadeus",
      last_name: "Mozart",
      mainRole: ["COMPOSER"],
      period: "COLONIAL",
      bio: "Genio musical austriaco que compuso más de 600 obras maestras",
      notable_works: "Sinfonía n.º 40, Réquiem",
      birth_day: 27,
      birth_month: 1,
      quality: "A",
      youtube_link: null,
      photo_url: null,
      references: "https://es.wikipedia.org/wiki/Wolfgang_Amadeus_Mozart",
      rating_avg: 4.5,
      rating_count: 10
    },
    {
      id: 2,
      birth_year: 1770,
      first_name: "Ludwig van",
      last_name: "Beethoven",
      mainRole: ["COMPOSER"],
      period: "COLONIAL",
      bio: "Compositor alemán que revolucionó la música clásica",
      notable_works: "9ª Sinfonía, Claro de Luna",
      birth_day: 16,
      birth_month: 12,
      quality: "A",
      youtube_link: null,
      photo_url: null,
      references: "https://es.wikipedia.org/wiki/Ludwig_van_Beethoven",
      rating_avg: 4.8,
      rating_count: 15
    },
    {
      id: 3,
      birth_year: 1820,
      first_name: "Frédéric",
      last_name: "Chopin",
      mainRole: ["COMPOSER"],
      period: "INDEPENDENCIA",
      bio: "Compositor y pianista polaco del período romántico",
      notable_works: "Nocturnos, Baladas",
      birth_day: 1,
      birth_month: 3,
      quality: "A",
      youtube_link: null,
      photo_url: null,
      references: "https://es.wikipedia.org/wiki/Frédéric_Chopin",
      rating_avg: 4.2,
      rating_count: 8
    },
    {
      id: 4,
      birth_year: 1885,
      first_name: "Vincent van",
      last_name: "Gogh",
      mainRole: ["PINTOR"],
      period: "POSGUERRA",
      bio: "Pintor postimpresionista holandés de obras emotivas",
      notable_works: "La Noche Estrellada, Los Girasoles",
      birth_day: 30,
      birth_month: 3,
      quality: "A",
      youtube_link: null,
      photo_url: null,
      references: "https://es.wikipedia.org/wiki/Vincent_van_Gogh",
      rating_avg: 4.7,
      rating_count: 12
    },
    {
      id: 5,
      birth_year: 1940,
      first_name: "José Asunción",
      last_name: "Flores",
      mainRole: ["COMPOSER"],
      period: "GUARANIA",
      bio: "Compositor paraguayo, creador de la guarania",
      notable_works: "India, Kerasy",
      birth_day: 27,
      birth_month: 8,
      quality: "A",
      youtube_link: null,
      photo_url: null,
      references: "https://es.wikipedia.org/wiki/José_Asunción_Flores",
      rating_avg: 4.9,
      rating_count: 20
    },
    {
      id: 6,
      birth_year: 1965,
      first_name: "Pablo",
      last_name: "Picasso",
      mainRole: ["PINTOR"],
      period: "DICTADURA",
      bio: "Artista español cofundador del cubismo",
      notable_works: "Guernica, Las Señoritas de Avignon",
      birth_day: 25,
      birth_month: 10,
      quality: "A",
      youtube_link: null,
      photo_url: null,
      references: "https://es.wikipedia.org/wiki/Pablo_Picasso",
      rating_avg: 4.6,
      rating_count: 18
    },
    {
      id: 7,
      birth_year: 1995,
      first_name: "John",
      last_name: "Williams",
      mainRole: ["COMPOSER"],
      period: "TRANSICION",
      bio: "Compositor estadounidense de bandas sonoras cinematográficas",
      notable_works: "Star Wars, Jurassic Park, Harry Potter",
      birth_day: 8,
      birth_month: 2,
      quality: "A",
      youtube_link: null,
      photo_url: null,
      references: "https://es.wikipedia.org/wiki/John_Williams",
      rating_avg: 4.9,
      rating_count: 25
    },
    {
      id: 8,
      birth_year: 2015,
      first_name: "Artista",
      last_name: "Contemporáneo",
      mainRole: ["PINTOR"],
      period: "ACTUALIDAD",
      bio: "Representante del arte contemporáneo actual",
      notable_works: "Obras digitales, Instalaciones",
      birth_day: 15,
      birth_month: 6,
      quality: "B",
      youtube_link: null,
      photo_url: null,
      references: "https://es.wikipedia.org/wiki/Arte_contemporáneo",
      rating_avg: 3.5,
      rating_count: 5
    }
  ];

  // Definición de períodos paraguayos
  const periodDefinitions = {
    'COLONIAL': {
      name: 'Período Colonial',
      years: '1600–1811',
      description: 'Época de colonización española',
      color: 'from-amber-600 to-orange-600',
      bgColor: 'bg-amber-100 text-amber-800 border-amber-200'
    },
    'INDEPENDENCIA': {
      name: 'Independencia y Nación',
      years: '1811–1870',
      description: 'Formación de la República del Paraguay',
      color: 'from-blue-600 to-indigo-600',
      bgColor: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    'POSGUERRA': {
      name: 'Posguerra y Reconstrucción',
      years: '1870–1930',
      description: 'Reconstrucción tras la Guerra de la Triple Alianza',
      color: 'from-green-600 to-teal-600',
      bgColor: 'bg-green-100 text-green-800 border-green-200'
    },
    'GUARANIA': {
      name: 'Época de Oro',
      years: '1930–1954',
      description: 'Florecimiento cultural y nacimiento de la guarania',
      color: 'from-yellow-600 to-orange-500',
      bgColor: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    },
    'DICTADURA': {
      name: 'Dictadura y Resistencia',
      years: '1954–1989',
      description: 'Período de dictadura de Stroessner',
      color: 'from-red-600 to-red-800',
      bgColor: 'bg-red-100 text-red-800 border-red-200'
    },
    'TRANSICION': {
      name: 'Transición y Diversificación',
      years: '1990–2010',
      description: 'Democratización y apertura cultural',
      color: 'from-purple-600 to-pink-600',
      bgColor: 'bg-purple-100 text-purple-800 border-purple-200'
    },
    'ACTUALIDAD': {
      name: 'Actualidad',
      years: '2010–hoy',
      description: 'Era digital y globalización cultural',
      color: 'from-cyan-600 to-blue-600',
      bgColor: 'bg-cyan-100 text-cyan-800 border-cyan-200'
    }
  };

  const sortComposersByBirthYear = useCallback((list) => [...list].sort((a, b) => (a.birth_year || 0) - (b.birth_year || 0)), []);

  useEffect(() => {
    const dataToUse = composers.length > 0 ? composers : demoData;
    setInternalComposers(sortComposersByBirthYear(dataToUse));
  }, [composers, sortComposersByBirthYear]);

  useEffect(() => {
    if (newComposer) {
      setInternalComposers(prev => {
        if (prev.some(c => c.id === newComposer.id)) return prev;
        return sortComposersByBirthYear([...prev, newComposer]);
      });
      onNewComposerHandled?.();
    }
  }, [newComposer, onNewComposerHandled, sortComposersByBirthYear]);
  
  // --- MAPEO Y HELPERS ---

  const categoryMap = useMemo(() => ({
    'COMPOSER': { icon: Music, color: "from-purple-500 to-pink-500", category: "Compositor" },
    'PINTOR': { icon: Palette, color: "from-yellow-500 to-orange-500", category: "Pintor" },
    'CINEASTA': { icon: Camera, color: "from-gray-600 to-gray-800", category: "Cineasta" },
    'ESCRITOR': { icon: Pen, color: "from-indigo-500 to-purple-500", category: "Escritor" },
    'DEFAULT': { icon: Award, color: "from-cyan-500 to-blue-500", category: "Creador" }
  }), []);

  const getPeriodColor = (period) => {
    return periodDefinitions[period]?.bgColor || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getQualityColor = (quality) => {
    const colors = {
      'A': 'text-green-500', 'B': 'text-yellow-500', 'C': 'text-orange-500', 'D': 'text-red-500'
    };
    return colors[quality] || 'text-gray-500';
  };
  
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /(?:https?:\/\/(?:www\.)?youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=)|https?:\/\/youtu\.be\/)([\w-]{11})(?:\S+)?/;
    const match = url.match(regExp);
    return match && match[1] ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  const formatLifespan = (composer) => {
    const birthParts = [composer.birth_day, composer.birth_month, composer.birth_year].filter(Boolean);
    const birthText = birthParts.join('/');
    
    const deathParts = [composer.death_day, composer.death_month, composer.death_year].filter(Boolean);
    const deathText = composer.death_year ? deathParts.join('/') : 'Presente';

    return `${birthText} - ${deathText}`;
  };

  // --- LÓGICA DE DATOS ---

  const timelineData = useMemo(() => internalComposers.map(composer => {
    const role = composer.mainRole && composer.mainRole.length > 0 ? composer.mainRole[0] : 'DEFAULT';
    const categoryInfo = categoryMap[role] || categoryMap.DEFAULT;
    return { ...composer, ...categoryInfo };
  }), [internalComposers, categoryMap]);

  // Agrupar por período y crear estructura con separadores
  const groupedTimeline = useMemo(() => {
    const grouped = {};
    const periodOrder = ['COLONIAL', 'INDEPENDENCIA', 'POSGUERRA', 'GUARANIA', 'DICTADURA', 'TRANSICION', 'ACTUALIDAD'];
    
    timelineData.forEach(item => {
      const period = item.period || 'ACTUALIDAD';
      if (!grouped[period]) {
        grouped[period] = [];
      }
      grouped[period].push(item);
    });

    // Ordenar cada grupo por año de nacimiento
    Object.keys(grouped).forEach(period => {
      grouped[period].sort((a, b) => (a.birth_year || 0) - (b.birth_year || 0));
    });

    return periodOrder.filter(period => grouped[period] && grouped[period].length > 0)
      .map(period => ({
        period,
        items: grouped[period],
        periodInfo: periodDefinitions[period]
      }));
  }, [timelineData]);

  useEffect(() => {
    if (groupedTimeline.length > 0) {
      const totalItems = groupedTimeline.reduce((acc, group) => acc + group.items.length, 0);
      const timer = setTimeout(() => {
        setVisibleItems(Array.from({ length: totalItems }, (_, i) => i));
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [groupedTimeline]);

  const stats = useMemo(() => {
    if (internalComposers.length === 0) return { creators: 0, centuries: 0, disciplines: 0 };
    const years = internalComposers.map(c => c.birth_year).filter(Boolean);
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    const centuries = Math.floor(maxYear / 100) - Math.floor(minYear / 100) + 1;
    const disciplines = new Set(internalComposers.flatMap(c => c.mainRole));
    return { creators: internalComposers.length, centuries, disciplines: disciplines.size };
  }, [internalComposers]);

  // --- Lógica de Comentarios y Calificaciones ---
  const fetchComments = useCallback(async (composerId) => {
    try {
      const response = await apiClient.get(`/composers/${composerId}/comments`);
      setComments(response.data);
    } catch (err) {
      console.error('Error al cargar comentarios:', err);
      setCommentError('Error al cargar comentarios.');
    }
  }, []);

  const handleSubmitComment = useCallback(async (composerId) => {
    setCommentError(null);
    setCommentSuccess(false);
    if (!newCommentName.trim() || !newCommentText.trim()) {
      setCommentError('Por favor, ingresa tu nombre y tu comentario.');
      return;
    }
    try {
      await apiClient.post(`/composers/${composerId}/comments`, {
        name: newCommentName,
        text: newCommentText,
      });
      setCommentSuccess(true);
      setNewCommentName('');
      setNewCommentText('');
      fetchComments(composerId); // Recargar comentarios
    } catch (err) {
      console.error('Error al enviar comentario:', err);
      setCommentError('Error al enviar comentario. Intenta de nuevo más tarde.');
    }
  }, [newCommentName, newCommentText, fetchComments]);

  const handleRateComposer = useCallback(async (composerId) => {
    setRatingError(null);
    setRatingSuccess(false);
    if (newRating === 0) {
      setRatingError('Por favor, selecciona una calificación.');
      return;
    }
    try {
      await apiClient.post(`/ratings`, {
        composerId,
        rating_value: newRating,
      });
      setRatingSuccess(true);
      setNewRating(0);
      // Para actualizar el promedio de calificación, necesitamos recargar los compositores en TimelinePage
      // Esto se maneja a través de la prop `onNewComposerHandled` que debería disparar un refetch en el padre.
      onNewComposerHandled?.(); 
    } catch (err) {
      console.error('Error al enviar calificación:', err);
      setRatingError(err.response?.data?.error || 'Error al enviar calificación. Ya calificaste este compositor o hubo un error.');
    }
  }, [newRating, onNewComposerHandled]);

  useEffect(() => {
    if (selectedItem) {
      fetchComments(selectedItem);
    } else {
      setComments([]); // Limpiar comentarios cuando no hay item seleccionado
      setNewCommentName('');
      setNewCommentText('');
      setNewRating(0);
      setCommentError(null);
      setRatingError(null);
      setCommentSuccess(false);
      setRatingSuccess(false);
    }
  }, [selectedItem, fetchComments]);

  // --- RENDERIZADO ---

  if (loading && internalComposers.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 sm:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
              Línea de Tiempo Creativa
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto">
              Un viaje a través de la historia de los grandes compositores y creadores que cambiaron el mundo
            </p>
          </div>
          <div className="flex items-center justify-center text-white pt-16">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mb-4"></div>
              <p className="text-xl">Cargando la historia...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            Línea de Tiempo Creativa
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto">
            Un viaje a través de la historia de los grandes compositores y creadores que cambiaron el mundo
          </p>
        </div>

        <div className="relative">
          {/* Línea principal - Oculta en móvil */}
          <div className="hidden sm:block absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-purple-500 to-pink-500 rounded-full opacity-30"></div>
          
          {/* Grupos de períodos */}
          <div className="space-y-16">
            {groupedTimeline.map((group, groupIndex) => {
              let itemIndex = 0;
              // Calcular el índice base para este grupo
              for (let i = 0; i < groupIndex; i++) {
                itemIndex += groupedTimeline[i].items.length;
              }

              return (
                <div key={group.period} className="relative">
                  {/* Separador de período */}
                  <div className="relative mb-12">
                    <div className="flex items-center justify-center">
                      <div className={`bg-gradient-to-r ${group.periodInfo.color} rounded-full p-1 shadow-2xl`}>
                        <div className="bg-white/10 backdrop-blur-lg rounded-full px-6 py-3 border border-white/20">
                          <div className="text-center">
                            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
                              {group.periodInfo.name}
                            </h2>
                            <p className="text-sm sm:text-base text-gray-300 font-medium">
                              {group.periodInfo.years}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-200 mt-1">
                              {group.periodInfo.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Línea decorativa del período */}
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent -z-10"></div>
                  </div>

                  {/* Elementos del período */}
                  <div className="space-y-8 sm:space-y-12">
                    {group.items.map((item, index) => {
                      const currentItemIndex = itemIndex + index;
                      const isExpanded = selectedItem === item.id;
                      const embedUrl = getYouTubeEmbedUrl(item.youtube_link);

                      return (
                        <div
                          id={`composer-card-${item.id}`}
                          key={item.id}
                          className={`flex items-center ${
                            // En móvil siempre columna, en desktop alternado
                            'flex-col sm:flex-row'
                          } ${
                            // Solo en desktop aplicar el reverse
                            index % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse'
                          } transition-all duration-700 transform ${
                            visibleItems.includes(currentItemIndex) ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
                          }`}
                          style={{ transitionDelay: `${currentItemIndex * 150}ms` }}
                        >
                          {/* Contenido */}
                          <div className={`w-full sm:w-5/12 ${
                            index % 2 === 0 ? 'sm:text-right sm:pr-8' : 'sm:text-left sm:pl-8'
                          } mb-4 sm:mb-0`}>
                            <div
                              className={`bg-white/5 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer hover:shadow-2xl ${
                                isExpanded ? 'ring-2 ring-purple-500 scale-105' : 'hover:scale-105'
                              }`}
                              onClick={() => setSelectedItem(isExpanded ? null : item.id)}
                            >
                              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                                {item.first_name} {item.last_name}
                              </h3>
                              <div className="flex flex-wrap items-center gap-2 mb-3">
                                <span className="text-xs sm:text-sm font-medium text-purple-300 bg-purple-500/20 px-3 py-1 rounded-full">
                                  {item.category}
                                </span>
                                <span className={`text-xs sm:text-sm font-medium ${getPeriodColor(item.period)} px-3 py-1 rounded-full border`}>
                                  {item.period}
                                </span>
                              </div>
                              
                              {isExpanded && (
                                <div className="mt-4 pt-4 border-t border-white/10 animate-fade-in-down">
                                  <p className="text-gray-300 text-sm sm:text-base mb-4 italic">"{item.bio}"</p>
                                  <div className="flex items-center gap-2 text-sm text-purple-300 mb-3">
                                    <Calendar className="w-4 h-4" />
                                    <span>{formatLifespan(item)}</span>
                                  </div>
                                  {item.notable_works && (
                                    <div className="mb-4">
                                      <h4 className="font-semibold text-sm mb-2 text-white">Obras Destacadas:</h4>
                                      <p className="text-gray-300 text-sm">{item.notable_works}</p>
                                    </div>
                                  )}
                                  {item.references && (
                                    <div className="mb-4">
                                      <h4 className="font-semibold text-sm mb-2 text-white">Referencias:</h4>
                                      <p className="text-gray-300 text-sm break-words">
                                        <a href={item.references} target="_blank" rel="noopener noreferrer" className="text-purple-300 hover:underline flex items-center gap-1">
                                          {item.references} <ExternalLink className="w-3 h-3" />
                                        </a>
                                      </p>
                                    </div>
                                  )}
                                  {embedUrl && (
                                    <div className="mt-4 rounded-lg overflow-hidden shadow-lg">
                                      <div className="relative pb-[56.25%] h-0">
                                        <iframe
                                          src={embedUrl}
                                          title={`Video de ${item.first_name}`}
                                          frameBorder="0"
                                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                          allowFullScreen
                                          className="absolute top-0 left-0 w-full h-full"
                                        ></iframe>
                                      </div>
                                    </div>
                                  )}
                                  <div className="mt-4 pt-4 border-t border-white/10" onClick={(e) => e.stopPropagation()}>
                                    <h4 className="font-semibold text-sm mb-2 text-white">Calificación:</h4>
                                    <div className="flex items-center gap-2 text-sm text-purple-300">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                          key={star}
                                          className={`w-5 h-5 cursor-pointer ${star <= (newRating || item.rating_avg) ? 'fill-current text-yellow-400' : 'text-gray-400'}`}
                                          onClick={(e) => { e.stopPropagation(); setNewRating(star); }}
                                        />
                                      ))}
                                      <span className="ml-2">{item.rating_avg ? item.rating_avg.toFixed(1) : 'N/A'} ({item.rating_count} votos)</span>
                                    </div>
                                    {ratingError && <p className="text-red-400 text-xs mt-1">{ratingError}</p>}
                                    {ratingSuccess && <p className="text-green-400 text-xs mt-1">¡Gracias por tu calificación!</p>}
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleRateComposer(item.id); }}
                                      className="mt-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold py-1 px-3 rounded-full transition-colors duration-200"
                                    >
                                      Calificar
                                    </button>
                                  </div>
                                  {/* Sección de Comentarios */}
                                  <div className="mt-4 pt-4 border-t border-white/10" onClick={(e) => e.stopPropagation()}>
                                    <h4 className="font-semibold text-sm mb-2 text-white">Comentarios:</h4>
                                    {comments.length === 0 ? (
                                      <p className="text-gray-400 text-sm">Sé el primero en comentar.</p>
                                    ) : (
                                      <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                                        {comments.map(comment => (
                                          <div key={comment.id} className="bg-white/5 p-3 rounded-lg border border-white/10">
                                            <p className="text-gray-200 text-sm">{comment.text}</p>
                                            <p className="text-gray-400 text-xs mt-1">- {comment.name} ({new Date(comment.created_at).toLocaleDateString()})</p>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                    <div className="mt-4">
                                      <h5 className="font-semibold text-sm mb-2 text-white">Añadir un comentario:</h5>
                                      <input
                                        type="text"
                                        placeholder="Tu nombre"
                                        value={newCommentName}
                                        onChange={(e) => { e.stopPropagation(); setNewCommentName(e.target.value); }}
                                        className="w-full p-2 mb-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                                      />
                                      <textarea
                                        placeholder="Escribe tu comentario aquí..."
                                        value={newCommentText}
                                        onChange={(e) => { e.stopPropagation(); setNewCommentText(e.target.value); }}
                                        rows="3"
                                        className="w-full p-2 mb-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                                      ></textarea>
                                      {commentError && <p className="text-red-400 text-xs mt-1">{commentError}</p>}
                                      {commentSuccess && <p className="text-green-400 text-xs mt-1">¡Comentario enviado con éxito!</p>}
                                      <button
                                        onClick={(e) => { e.stopPropagation(); handleSubmitComment(item.id); }}
                                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full transition-colors duration-200"
                                      >
                                        Enviar Comentario
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Punto central */}
                          <div className="relative z-10 mb-4 sm:mb-0">
                            <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-r ${item.color} flex items-center justify-center shadow-2xl border-4 border-white/20 hover:scale-110 transition-transform duration-300 overflow-hidden`}>
                              {(item.photo_url && item.photo_url.startsWith('http')) ? (
                                <img src={item.photo_url} alt={`${item.first_name} ${item.last_name}`} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
                                  <span className="text-xl sm:text-2xl font-bold text-white">
                                    {item.first_name?.trim().charAt(0).toUpperCase()}
                                    {item.last_name?.trim().charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
                              <span className="text-sm font-bold text-white">{item.birth_year}</span>
                            </div>
                            <div className={`absolute top-0 w-6 h-6 rounded-full bg-white/90 flex items-center justify-center shadow-lg ${
                              index % 2 === 0 ? 'sm:-right-2' : 'sm:-left-2'
                            } -right-2 sm:right-auto`}>
                              <Star className={`w-4 h-4 ${getQualityColor(item.quality)}`} />
                            </div>
                          </div>

                          {/* Espacio vacío del otro lado - Solo en desktop */}
                          <div className="hidden sm:block w-5/12"></div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Estadísticas */}
        <div className="mt-16 sm:mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-white/10 text-center">
            <h3 className="text-2xl font-bold text-white mb-2">{stats.creators}</h3>
            <p className="text-gray-300 text-sm">Creadores</p>
          </div>
          <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-white/10 text-center">
            <h3 className="text-2xl font-bold text-white mb-2">{stats.centuries}</h3>
            <p className="text-gray-300 text-sm">Siglos</p>
          </div>
          <div className="bg-gradient-to-r from-green-500/20 to-teal-500/20 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-white/10 text-center">
            <h3 className="text-2xl font-bold text-white mb-2">{stats.disciplines}</h3>
            <p className="text-gray-300 text-sm">Disciplinas</p>
          </div>
          <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-white/10 text-center">
            <h3 className="text-2xl font-bold text-white mb-2">∞</h3>
            <p className="text-gray-300 text-sm">Inspiración</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timeline;