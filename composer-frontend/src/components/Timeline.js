import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Music, Palette, Camera, Pen, Award, Calendar, Star, Clock, ExternalLink, Edit, ChevronDown, ChevronUp } from 'lucide-react';
import Rating from './Rating';
import Comments from './Comments';

const Timeline = ({ composers = [], loading = false, newComposer = null, onNewComposerHandled = null, onSuggestEdit }) => {
  // Estados del componente
  const [selectedItem, setSelectedItem] = useState(null);
  const [visibleItems, setVisibleItems] = useState([]);
  const [internalComposers, setInternalComposers] = useState([]);
  const [expandedPeriods, setExpandedPeriods] = useState({});

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
      photo_url: null
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
      photo_url: null
    },
    {
      id: 3,
      birth_year: 1853,
      first_name: "Vincent van",
      last_name: "Gogh",
      mainRole: ["PINTOR"],
      period: "MODERNO",
      bio: "Pintor postimpresionista holandés de obras emotivas",
      notable_works: "La Noche Estrellada, Los Girasoles",
      birth_day: 30,
      birth_month: 3,
      quality: "A",
      youtube_link: null,
      photo_url: null
    },
    {
      id: 4,
      birth_year: 1881,
      first_name: "Pablo",
      last_name: "Picasso",
      mainRole: ["PINTOR"],
      period: "MODERNO",
      bio: "Artista español cofundador del cubismo",
      notable_works: "Guernica, Las Señoritas de Avignon",
      birth_day: 25,
      birth_month: 10,
      quality: "A",
      youtube_link: null,
      photo_url: null
    }
  ];

  const sortComposersByBirthYear = useCallback((list) => [...list].sort((a, b) => (a.birth_year || 0) - (b.birth_year || 0)), []);

  const PERIOD_ORDER = useMemo(() => [
    'COLONIAL', 'INDEPENDENCIA', 'POSGUERRA', 'MODERNO', 'CONTEMPORANEO'
  ], []);

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
    'POET': { icon: Pen, color: "from-yellow-600 to-orange-600", category: "Poeta" },
    'CONDUCTOR': { icon: Music, color: "from-green-500 to-blue-500", category: "Director" },
    'ARRANGER': { icon: Music, color: "from-red-500 to-pink-500", category: "Arreglista" },
    'PERFORMER': { icon: Star, color: "from-teal-500 to-green-500", category: "Intérprete" },
    'ENSEMBLE_ORCHESTRA': { icon: Music, color: "from-blue-700 to-indigo-700", category: "Agrupación/Orquesta" },
    'DEFAULT': { icon: Award, color: "from-cyan-500 to-blue-500", category: "Creador" }
  }), []);

  const groupedTimelineData = useMemo(() => {
    const grouped = internalComposers.reduce((acc, composer) => {
      const role = composer.mainRole && composer.mainRole.length > 0 ? composer.mainRole[0] : 'DEFAULT';
      const categoryInfo = categoryMap[role] || categoryMap.DEFAULT;
      const composerWithCategory = { ...composer, ...categoryInfo };
      
      const period = composer.period || 'UNKNOWN';
      if (!acc[period]) {
        acc[period] = [];
      }
      acc[period].push(composerWithCategory);
      return acc;
    }, {});

    // Ordenar los períodos según PERIOD_ORDER y luego ordenar compositores dentro de cada período por año de nacimiento
    const sortedGrouped = {};
    PERIOD_ORDER.forEach(period => {
      if (grouped[period]) {
        sortedGrouped[period] = grouped[period].sort((a, b) => (a.birth_year || 0) - (b.birth_year || 0));
      }
    });
    // Añadir períodos no definidos en PERIOD_ORDER al final
    Object.keys(grouped).forEach(period => {
      if (!PERIOD_ORDER.includes(period)) {
        sortedGrouped[period] = grouped[period].sort((a, b) => (a.birth_year || 0) - (b.birth_year || 0));
      }
    });

    return sortedGrouped;
  }, [internalComposers, categoryMap, PERIOD_ORDER]);

  const visibleItemsMap = useMemo(() => {
    const map = {};
    Object.values(groupedTimelineData).flat().forEach((item, index) => {
      map[item.id] = index;
    });
    return map;
  }, [groupedTimelineData]);

  useEffect(() => {
    if (Object.keys(groupedTimelineData).length > 0) {
      // Inicializa todos los períodos como expandidos por defecto
      const initialExpanded = Object.keys(groupedTimelineData).reduce((acc, period) => ({ ...acc, [period]: true }), {});
      setExpandedPeriods(initialExpanded);
      const timer = setTimeout(() => setVisibleItems(Object.values(groupedTimelineData).flat().map(item => item.id)), 100);
      return () => clearTimeout(timer);
    }
  }, [groupedTimelineData]);

  const togglePeriodExpansion = (period) => {
    setExpandedPeriods(prev => ({
      ...prev,
      [period]: !prev[period]
    }));
  };



  const getPeriodColor = (period) => {
    const colors = {
      'COLONIAL': 'bg-amber-100 text-amber-800 border-amber-200',
      'INDEPENDENCIA': 'bg-blue-100 text-blue-800 border-blue-200',
      'POSGUERRA': 'bg-green-100 text-green-800 border-green-200',
      'MODERNO': 'bg-purple-100 text-purple-800 border-purple-200',
      'CONTEMPORANEO': 'bg-pink-100 text-pink-800 border-pink-200'
    };
    return colors[period] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getQualityColor = (quality) => {
    const colors = {
      'A': 'text-green-500', 'B': 'text-yellow-500', 'C': 'text-orange-500', 'D': 'text-red-500'
    };
    return colors[quality] || 'text-gray-500';
  };
  
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const videoIdMatch = url.match(/(?:v=)([^&?]+)/);
    return videoIdMatch ? `https://www.youtube.com/embed/${videoIdMatch[1]}` : null;
  };

  const formatLifespan = (composer) => {
    const birth = `${composer.birth_day || ''}/${composer.birth_month || ''}/${composer.birth_year || ''}`;
    const death = composer.death_year ? `${composer.death_day || ''}/${composer.death_month || ''}/${composer.death_year}` : 'Presente';
    return `${birth} - ${death}`;
  };

  // --- LÓGICA DE DATOS ---



  const stats = useMemo(() => {
    if (internalComposers.length === 0) return { creators: 0, centuries: 0, disciplines: 0 };
    const years = internalComposers.map(c => c.birth_year).filter(Boolean);
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    const centuries = Math.floor(maxYear / 100) - Math.floor(minYear / 100) + 1;
    const disciplines = new Set(internalComposers.flatMap(c => c.mainRole));
    return { creators: internalComposers.length, centuries, disciplines: disciplines.size };
  }, [internalComposers]);

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
          
          {/* Elementos de la línea de tiempo */}
          <div className="space-y-8 sm:space-y-12">
            {Object.entries(groupedTimelineData).map(([period, items]) => (
              <div key={period} className="mb-16">
                <div className="flex items-center justify-center mb-8">
                  <button 
                    onClick={() => togglePeriodExpansion(period)}
                    className={`flex items-center gap-2 text-2xl sm:text-3xl font-extrabold px-6 py-3 rounded-full transition-all duration-300 transform
                      ${expandedPeriods[period] ? 'bg-purple-600/30 hover:bg-purple-600/50' : 'bg-gray-700/30 hover:bg-gray-600/50'}
                      border border-white/10
                    `}
                  >
                    <span className={`bg-clip-text text-transparent ${getPeriodColor(period).split(' ')[1].replace('text-','text-').replace('-800','').replace('text-gray-800','text-gray-300')}`}
                      style={{ backgroundImage: `linear-gradient(to right, ${getPeriodColor(period).split(' ')[0].replace('bg-','').replace('-100','').replace('bg-gray-100','#a78bfa')}, ${getPeriodColor(period).split(' ')[1].replace('text-','').replace('-800','').replace('text-gray-800','#d8b4fe')})` }}
                    >
                      {period.replace(/_/g, ' ').toUpperCase()}
                    </span>
                    {expandedPeriods[period] ? <ChevronUp className="w-6 h-6 text-white" /> : <ChevronDown className="w-6 h-6 text-white" />}
                  </button>
                </div>
                
                {expandedPeriods[period] && items.map((item, index) => {
              const isExpanded = selectedItem === item.id;
              const embedUrl = getYouTubeEmbedUrl(item.youtube_link);

              return (
                <div
                  key={item.id}
                  className={`flex items-center ${
                    // En móvil siempre columna, en desktop alternado
                    'flex-col sm:flex-row'
                  } ${
                    // Solo en desktop aplicar el reverse
                    index % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse'
                  } transition-all duration-700 transform ${
                    visibleItems.includes(item.id) ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
                  }`}
                  style={{ transitionDelay: `${visibleItemsMap[item.id] * 100}ms` }}
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
                      <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">
                        {item.first_name} {item.last_name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-xs sm:text-sm font-medium text-purple-300 bg-purple-500/20 px-3 py-1 rounded-full">
                          {item.category}
                        </span>
                        <span className="text-sm text-gray-400 font-medium">
                          ({item.birth_year || 'N/A'} - {item.death_year || 'Presente'})
                        </span>
                      </div>
                      
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-white/10 animate-fade-in-down">
                          <p className="text-gray-300 text-sm sm:text-base mb-4 italic">"{item.bio}"</p>
                          {item.notable_works && <p className="text-gray-300 text-sm mb-4"><strong className="font-semibold text-white">Obras Notables:</strong> {item.notable_works}</p>}
                          
                          {embedUrl && (
                            <div className="my-4 rounded-lg overflow-hidden aspect-video">
                              <iframe src={embedUrl} title={`Video de ${item.first_name}`} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full"></iframe>
                            </div>
                          )}

                          <Rating composerId={item.id} initialRating={item.rating_avg || 0} ratingCount={item.rating_count || 0} />
                          <Comments composerId={item.id} />

                          <div className="mt-4 flex justify-end">
                            <button onClick={() => onSuggestEdit(item)} className="flex items-center gap-2 text-sm text-cyan-300 hover:text-cyan-200 transition-colors">
                              <Edit className="w-4 h-4" />
                              Sugerir una mejora
                            </button>
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
            ))}
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