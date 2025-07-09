import React, { useState, useEffect } from 'react';
import apiClient from '../api';
import { Calendar } from 'lucide-react';

// Funciones de ayuda
const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  const videoIdMatch = url.match(/(?:v=)([^&?]+)/);
  return videoIdMatch ? `https://www.youtube.com/embed/${videoIdMatch[1]}` : null;
};

const formatLifespan = (composer) => {
  if (!composer) return '';
  const birthParts = [composer.birth_day, composer.birth_month, composer.birth_year].filter(Boolean);
  const birthText = birthParts.join('/');
  
  const deathParts = [composer.death_day, composer.death_month, composer.death_year].filter(Boolean);
  const deathText = composer.death_year ? deathParts.join('/') : 'Presente';

  return `${birthText} - ${deathText}`;
};

const ComposerOfTheDay = ({ onGoToComposer }) => {
  const [composer, setComposer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedComposer = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/composers/featured');
        setComposer(response.data);
        setError(null);
      } catch (err) {
        setError('No se pudo cargar el compositor del día.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedComposer();
  }, []);

  const handleCardClick = () => {
    if (composer && onGoToComposer) {
      onGoToComposer(composer.id);
    }
  };

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 animate-pulse h-full">
        <h2 className="text-2xl font-bold text-white mb-4">Compositor del Día</h2>
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-20 h-20 rounded-full bg-gray-700"></div>
          <div>
            <div className="h-6 bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
        <div className="h-4 bg-gray-700 rounded w-full mt-4"></div>
      </div>
    );
  }

  if (error || !composer) {
    return (
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 h-full">
        <h2 className="text-2xl font-bold text-white mb-4">Compositor del Día</h2>
        <p className="text-gray-300">{error || 'No hay compositor disponible para hoy.'}</p>
      </div>
    );
  }

  const embedUrl = getYouTubeEmbedUrl(composer.youtube_link);

  return (
    <div 
      onClick={handleCardClick}
      className="cursor-pointer bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 h-full hover:shadow-2xl hover:scale-105 transform"
    >
      <h2 className="text-2xl font-bold text-white mb-4">Compositor del Día</h2>
      <div className="flex items-center space-x-4 mb-4">
        {(composer.photo_url && composer.photo_url.startsWith('http')) ? (
          <img src={composer.photo_url} alt={composer.first_name} className="w-20 h-20 rounded-full object-cover" />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
            <span className="text-3xl font-bold text-white">
              {composer.first_name?.trim().charAt(0).toUpperCase()}
              {composer.last_name?.trim().charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div>
          <h3 className="text-xl font-bold text-white">{composer.first_name} {composer.last_name}</h3>
          <p className="text-purple-300">{composer.period}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 text-sm text-purple-300 mb-4">
        <Calendar className="w-4 h-4" />
        <span>{formatLifespan(composer)}</span>
      </div>

      {embedUrl && (
        <div className="mt-4 rounded-lg overflow-hidden">
          <div className="relative pb-[56.25%] h-0">
            <iframe
              src={embedUrl}
              title={`Video de ${composer.first_name}`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full"
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComposerOfTheDay;
