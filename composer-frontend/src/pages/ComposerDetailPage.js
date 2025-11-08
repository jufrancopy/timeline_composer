import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api';
import Rating from '../components/Rating';
import Comments from '../components/Comments';
import { ArrowLeft, ExternalLink, Music, Award, Calendar } from 'lucide-react';

const ComposerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [composer, setComposer] = useState(null);
  const [suggestedComposers, setSuggestedComposers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchComposerDetails = useCallback(async (composerId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getComposerById(composerId);
      setComposer(response.data);
    } catch (err) {
      console.error('Error fetching composer details:', err);
      setError('No se pudo cargar la información del compositor.');
    }
  }, []);

  const fetchSuggestedComposers = useCallback(async () => {
    try {
      const promises = Array.from({ length: 3 }).map(() => apiClient.getRandomComposer());
      const responses = await Promise.all(promises);
      setSuggestedComposers(responses.map(res => res.data));
    } catch (err) {
      console.error('Error fetching suggested composers:', err);
      // No es un error crítico si las sugerencias no cargan
    }
  }, []);

  useEffect(() => {
    if (id) {
      fetchComposerDetails(id);
      fetchSuggestedComposers();
    }
    setLoading(false);
  }, [id, fetchComposerDetails, fetchSuggestedComposers]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        <p className="ml-4 text-white">Cargando compositor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-red-400 text-lg">
        {error}
      </div>
    );
  }

  if (!composer) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-gray-400 text-lg">
        Compositor no encontrado.
      </div>
    );
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case 'COMPOSER': return <Music size={18} />; 
      case 'CONDUCTOR': return <Award size={18} />; 
      default: return <Award size={18} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white py-12 px-4">
      <div className="max-w-4xl mx-auto bg-gray-800 rounded-lg shadow-xl p-6 sm:p-8 border border-purple-700/50">
        
        {/* Botón de Retorno */}
        <button
          onClick={() => navigate(-1)} // Vuelve a la página anterior
          className="flex items-center gap-2 text-purple-300 hover:text-purple-100 transition-colors mb-6"
        >
          <ArrowLeft size={20} />
          Volver
        </button>

        {/* Header del Compositor */}
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 pb-8 border-b border-gray-700">
          <div className="flex-shrink-0">
            {(composer.photo_url && composer.photo_url.startsWith('http')) ? (
              <img
                src={composer.photo_url}
                alt={`${composer.first_name} ${composer.last_name}`}
                className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-purple-500 shadow-md"
              />
            ) : (
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center border-4 border-purple-500 shadow-md">
                <span className="text-5xl font-bold text-white">
                  {composer.first_name?.trim().charAt(0).toUpperCase()}
                  {composer.last_name?.trim().charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div className="text-center sm:text-left flex-grow">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-purple-200 leading-tight">
              {composer.first_name} {composer.last_name}
            </h1>
            <p className="text-lg text-gray-400 mt-1">{composer.period}</p>
            <div className="flex justify-center sm:justify-start items-center gap-4 mt-3">
              <span className="flex items-center gap-1 text-sm text-gray-300">
                <Calendar size={16} /> {formatLifespan(composer)}
              </span>
              {composer.mainRole && composer.mainRole.length > 0 && (
                <span className="flex items-center gap-1 text-sm text-gray-300">
                  {getRoleIcon(composer.mainRole[0])} {composer.mainRole[0].replace(/_/g, ' ').toLowerCase()}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-purple-300 mb-4">Biografía</h2>
          <p className="text-gray-300 leading-relaxed text-justify mb-6">{composer.bio}</p>

          {composer.notable_works && (
            <>
              <h2 className="text-2xl font-bold text-purple-300 mb-4">Obras Notables</h2>
              <p className="text-gray-300 leading-relaxed mb-6">{composer.notable_works}</p>
            </>
          )}

          {composer.youtube_link && getYouTubeEmbedUrl(composer.youtube_link) && (
            <>
              <h2 className="text-2xl font-bold text-purple-300 mb-4">Videos</h2>
              <div className="relative aspect-video w-full rounded-lg overflow-hidden mb-6 shadow-lg">
                <iframe
                  src={getYouTubeEmbedUrl(composer.youtube_link)}
                  title={`Video de ${composer.first_name} ${composer.last_name}`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen
                  className="absolute top-0 left-0 w-full h-full"
                ></iframe>
              </div>
            </>
          )}

          {composer.references && (
            <>
              <h2 className="text-2xl font-bold text-purple-300 mb-4">Referencias</h2>
              <p className="text-gray-300 leading-relaxed mb-6">{composer.references}</p>
            </>
          )}

          <Rating composerId={composer.id} initialRating={composer.rating_avg || 0} ratingCount={composer.rating_count || 0} />
          <Comments composerId={composer.id} />

          {/* Botón para sugerir mejora, si aplica */}
          <div className="mt-8 text-right">
            <button
              onClick={() => console.log('Sugerir mejora para', composer.id)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sugerir una mejora
            </button>
          </div>
        </div>

        {/* Compositores Sugeridos */}
        {suggestedComposers.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-700">
            <h2 className="text-2xl font-bold text-purple-300 mb-6">Más Creadores para Explorar</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {suggestedComposers.map((suggested, index) => (
                <div
                  key={index}
                  className="bg-gray-700 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer p-4 flex items-center space-x-4"
                  onClick={() => navigate(`/composers/show/${suggested.id}`)}
                >
                  {(suggested.photo_url && suggested.photo_url.startsWith('http')) ? (
                    <img
                      src={suggested.photo_url}
                      alt={`${suggested.first_name}`}
                      className="w-16 h-16 rounded-full object-cover border-2 border-purple-400"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-white text-xl font-bold">
                      {suggested.first_name?.trim().charAt(0).toUpperCase()}
                      {suggested.last_name?.trim().charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-lg font-semibold text-white">
                      {suggested.first_name} {suggested.last_name}
                    </p>
                    <p className="text-purple-300 text-sm">{suggested.period}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComposerDetailPage;
