import React, { useState } from 'react';
import apiClient from '../api';
import { Star } from 'lucide-react';

const Rating = ({ composerId, initialRating, ratingCount }) => {
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);
  const [count, setCount] = useState(ratingCount);
  const [message, setMessage] = useState('');

  const handleRating = async (newRating) => {
    try {
      const response = await apiClient.post(`/ratings/${composerId}`, { rating: newRating });
      setRating(response.data.new_average_rating);
      setCount(response.data.total_ratings);
      setMessage('¡Gracias por tu valoración!');
      setTimeout(() => setMessage(''), 2000);
    } catch (error) {
      setMessage(error.response?.data?.error || 'No se pudo enviar la valoración.');
      setTimeout(() => setMessage(''), 2000);
    }
  };

  return (
    <div className="mt-4">
      <h4 className="font-semibold text-sm mb-2 text-white">Valoración de la Comunidad</h4>
      <div className="flex items-center gap-4">
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-6 h-6 cursor-pointer transition-colors duration-200 ${
                (hoverRating || rating) >= star ? 'text-yellow-400 fill-current' : 'text-gray-500'
              }`}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => handleRating(star)}
            />
          ))}
        </div>
        <div className="text-sm text-gray-300">
          {rating.toFixed(1)}/5.0 ({count} {count === 1 ? 'voto' : 'votos'})
        </div>
      </div>
      {message && <p className="text-xs text-purple-300 mt-2">{message}</p>}
    </div>
  );
};

export default Rating;
