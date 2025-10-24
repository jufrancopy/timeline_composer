import React, { useMemo } from 'react';
import { Calendar } from 'lucide-react';

const Ephemeris = ({ composers, onComposerClick }) => {
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth() + 1; // JS months are 0-indexed

  const events = useMemo(() => {
    if (!composers) return [];
    return composers.filter(c => 
      (c.birth_day === currentDay && c.birth_month === currentMonth) ||
      (c.death_day === currentDay && c.death_month === currentMonth)
    );
  }, [composers, currentDay, currentMonth]);

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
      <h2 className="text-2xl font-bold text-white mb-4">Efemérides</h2>
      {events.length > 0 ? (
        <ul className="space-y-3">
          {events.map(event => {
            const isBirthday = event.birth_day === currentDay && event.birth_month === currentMonth;
            const year = isBirthday ? event.birth_year : event.death_year;
            const age = isBirthday ? today.getFullYear() - event.birth_year : today.getFullYear() - event.death_year;

            return (
              <li key={event.id} className="flex items-center space-x-3 cursor-pointer hover:bg-white/10 p-2 rounded-lg transition-colors"
                onClick={() => onComposerClick(event.id)}
              >
                <Calendar className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-white font-semibold">{event.first_name} {event.last_name}</p>
                  <p className="text-sm text-gray-400">
                    {isBirthday ? `Nacimiento` : `Fallecimiento`} en {year} (hace {age} años)
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-gray-300">No hay efemérides para hoy.</p>
      )}
    </div>
  );
};

export default Ephemeris;
