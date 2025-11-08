import React, { useState, memo, useEffect } from 'react';
import apiClient from '../api';
import api from '../api';
import { Star } from 'lucide-react';

const Rating = ({ composerId, initialRating, ratingCount }) => {
  const [rating, setRating] = useState(initialRating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [count, setCount] = useState(ratingCount || 0);
  const [message, setMessage] = useState('');

  // ✅ ACTUALIZAR EL ESTADO CUANDO CAMBIAN LAS PROPS
  useEffect(() => {
    setRating(initialRating || 0);
    setCount(ratingCount || 0);

    const fetchUserRating = async () => {
      try {
        const response = await api.getRatingForComposer(composerId);
        if (response.data && response.data.rating_value) {
          setRating(response.data.rating_value);
        }
      } catch (error) {
        console.error("Error fetching user's rating:", error);
      }
    };

    fetchUserRating();
  }, [composerId, initialRating, ratingCount]);

  const handleRating = async (newRating) => {
    console.log('Attempting to rate composer:', composerId, 'with rating:', newRating);
    try {
      const response = await api.postRating(composerId, newRating);
      console.log('Backend response for rating:', response.data);
      
      // ✅ ACTUALIZAR EL ESTADO CON LOS DATOS DEL BACKEND
      if (response.data.average_rating !== undefined) {
        setRating(response.data.average_rating);
      }
      if (response.data.total_ratings !== undefined) {
        setCount(response.data.total_ratings);
      }
      
      setMessage('¡Gracias por tu valoración!');
      setTimeout(() => setMessage(''), 2000);
      
    } catch (error) {
      console.error('Rating error:', error);
      setMessage(error.response?.data?.error || 'No se pudo enviar la valoración.');
      setTimeout(() => setMessage(''), 2000);
    }
  };

  const displayRating = rating || 0;
  const displayCount = count || 0;

  return (
    <div className="mt-4">
      <h4 className="font-semibold text-sm mb-2 text-white">Valoración de la Comunidad</h4>
      <div className="flex items-center gap-4">
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-6 h-6 cursor-pointer transition-colors duration-200 ${
                (hoverRating || displayRating) >= star ? 'text-yellow-400 fill-current' : 'text-gray-500'
              }`}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={(e) => {
                e.stopPropagation();
                handleRating(star);
              }}
            />
          ))}
        </div>
        <div className="text-sm text-gray-300">
          {displayRating.toFixed(1)}/5.0 ({displayCount} {displayCount === 1 ? 'voto' : 'votos'})
        </div>
      </div>
      {message && <p className="text-xs text-purple-300 mt-2">{message}</p>}
    </div>
  );
};

export default memo(Rating);