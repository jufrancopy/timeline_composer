import React, { useState, useEffect } from 'react';
import apiClient from '../api';
import { useNavigate } from 'react-router-dom';
import { X, ExternalLink } from 'lucide-react'; // Iconos para cerrar y enlace externo

const SuggestedComposerFloating = () => {
  const [composer, setComposer] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {

    const fetchRandomComposer = async () => {
      try {
        const response = await apiClient.getRandomComposer();
        setComposer(response.data);
        setIsVisible(true);
      } catch (error) {
        console.error('Error fetching random composer:', error);
        setIsVisible(false); // Hide if there's an error
      }
    };

    fetchRandomComposer();

    // Reset visibility if it's a new day or after a certain period, optional
    // For now, it stays hidden for the session if closed.
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleReadMore = () => {
    if (composer) {
      navigate(`/composers/show/${composer.id}`); // Nueva página de detalle para compositores
      handleClose(); // Close after navigating
    }
  };

  const handleGoToTimeline = () => {
    navigate('/'); // Redirigir al home
    handleClose(); // Close after navigating
  };

  if (!isVisible || !composer) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 p-4 bg-gray-800 rounded-lg shadow-lg max-w-sm border border-purple-500 animate-fade-in-up transition-transform duration-300 ease-out hover:scale-[1.01]">
      <button
        onClick={handleClose}
        className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-700"
        aria-label="Cerrar sugerencia"
      >
        <X size={18} />
      </button>

      <h3 className="text-lg font-bold text-white mb-2 flex items-center">
        Compositor Sugerido
      </h3>
      
      <div className="flex items-center space-x-3 mb-3">
        {(composer.photo_url && composer.photo_url.startsWith('http')) ? (
            <img src={composer.photo_url} alt={composer.first_name} className="w-16 h-16 rounded-full object-cover border-2 border-purple-400" />
        ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-700 to-purple-900 flex items-center justify-center text-white text-xl font-bold">
                {composer.first_name?.trim().charAt(0).toUpperCase()}
                {composer.last_name?.trim().charAt(0).toUpperCase()}
            </div>
        )}
        <div>
          <p className="text-white font-semibold text-md">{composer.first_name} {composer.last_name}</p>
          <p className="text-purple-300 text-sm">{composer.period}</p>
        </div>
      </div>

      <p className="text-gray-300 text-sm mb-4 line-clamp-3">
        {composer.bio || 'Sin biografía disponible.'}
      </p>

      <div className="flex flex-col space-y-2">
        <button
          onClick={handleReadMore}
          className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm font-medium"
        >
          <ExternalLink size={16} className="mr-2" /> Leer más sobre {composer.first_name}
        </button>
        <button
          onClick={handleGoToTimeline}
          className="w-full flex items-center justify-center px-4 py-2 bg-gray-700 text-gray-200 rounded-md hover:bg-gray-600 transition-colors text-sm font-medium"
        >
          Explorar la línea de tiempo
        </button>
      </div>
    </div>
  );
};

export default SuggestedComposerFloating;
