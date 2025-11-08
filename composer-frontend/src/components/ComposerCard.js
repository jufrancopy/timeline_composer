import React, { useMemo } from 'react';
import { Music, Palette, Camera, Pen, Award, Star, Edit } from 'lucide-react';
import Rating from './Rating';
import Comments from './Comments';
import PropTypes from 'prop-types';

const ComposerCard = React.memo(({ composer, onSuggestEdit, isExpanded, onToggleExpansion }) => {

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

  const role = composer.mainRole && composer.mainRole.length > 0 ? composer.mainRole[0] : 'DEFAULT';
  const categoryInfo = categoryMap[role] || categoryMap.DEFAULT;

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

  const embedUrl = getYouTubeEmbedUrl(composer.youtube_link);

  return (
    <div
      className={`bg-white/5 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer hover:shadow-2xl ${isExpanded ? 'ring-2 ring-purple-500 scale-105' : 'hover:scale-105'
        }`}
      onClick={onToggleExpansion}
    >
      <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">
        {composer.first_name} {composer.last_name}
      </h3>
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className="text-xs sm:text-sm font-medium text-purple-300 bg-purple-500/20 px-3 py-1 rounded-full">
          {categoryInfo.category}
        </span>
        <span className="text-sm text-gray-400 font-medium">
          ({composer.birth_year || 'N/A'} - {composer.death_year || 'Presente'})
        </span>
      </div>

      {isExpanded && (
        <div
          className="mt-4 pt-4 border-t border-white/10 animate-fade-in-down"
          onClick={(e) => e.stopPropagation()} // ✅ Detiene la propagación
        >
          <p className="text-gray-300 text-sm sm:text-base mb-4 italic">"{composer.bio}"</p>
          {composer.notable_works && <p className="text-gray-300 text-sm mb-4"><strong className="font-semibold text-white">Obras Notables:</strong> {composer.notable_works}</p>}

          {embedUrl && (
            <div className="my-4 rounded-lg overflow-hidden aspect-video">
              <iframe src={embedUrl} title={`Video de ${composer.first_name}`} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full"></iframe>
            </div>
          )}

          <Rating composerId={composer.id} initialRating={composer.rating_avg || 0} ratingCount={composer.rating_count || 0} />
          <Comments composerId={composer.id} />

          <div className="mt-4 flex justify-end">
            <button onClick={() => onSuggestEdit(composer)} className="flex items-center gap-2 text-sm text-cyan-300 hover:text-cyan-200 transition-colors">
              <Edit className="w-4 h-4" />
              Sugerir una mejora
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

ComposerCard.propTypes = {
  composer: PropTypes.object.isRequired,
  onSuggestEdit: PropTypes.func.isRequired,
  isExpanded: PropTypes.bool.isRequired,
  onToggleExpansion: PropTypes.func.isRequired,
};

export default ComposerCard;
