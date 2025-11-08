import React from 'react';
import { Award } from 'lucide-react';

const ComposerOfTheDay = ({ composer, onComposerClick }) => {
  if (!composer) return null;

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
      <h2 className="text-2xl font-bold text-white mb-4">Compositor del Día</h2>
      <div className="flex items-center space-x-4 cursor-pointer hover:bg-white/10 p-2 rounded-lg transition-colors"
        onClick={() => onComposerClick(composer.id)}
      >
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
    </div>
  );
};

export default ComposerOfTheDay;
