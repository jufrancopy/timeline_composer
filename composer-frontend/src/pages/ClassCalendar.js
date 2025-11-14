import React from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './ClassCalendar.css'; // Para estilos personalizados

const ClassCalendar = ({ classDays = [], recordedDates = [] }) => {
  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      // Marcar días de clase programados (Lunes, Martes, etc.)
      const day = date.getDay(); // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
      const dayOfWeek = day === 0 ? 7 : day; // Adjust to 1 for Monday, 7 for Sunday

      if (classDays.includes(dayOfWeek.toString())) {
        return 'highlight-class-day';
      }

      // Marcar fechas con días de clase registrados (fechas específicas)
      const dateString = date.toISOString().split('T')[0];
      if (recordedDates.includes(dateString)) {
        return 'highlight-recorded-date';
      }
    }
    return null;
  };

  return (
    <div className="class-calendar-container">
      <Calendar
        tileClassName={tileClassName}
        value={new Date()} // Puedes pasar una fecha inicial diferente si es necesario
        calendarType="US" // O "ISO 8601" si prefieres que la semana empiece en lunes
      />
    </div>
  );
};

export default ClassCalendar;
