import React, { useState, useEffect } from 'react';
import api from '../api';
import Swal from 'sweetalert2';
import { format } from 'date-fns';

const DiaClaseForm = ({ catedraId, onDiaClaseCreated, onDiaClaseUpdated, onCancel, initialData = {}, isEditMode = false, scheduledDays = [] }) => {
  const [fecha, setFecha] = useState('');
  const [diaSemana, setDiaSemana] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditMode && initialData) {
      setFecha(format(new Date(initialData.fecha), 'yyyy-MM-dd'));
      setDiaSemana(initialData.dia_semana);
    } else {
      // For creation mode, set initial date to the next scheduled day
      if (scheduledDays.length > 0) {
        const today = new Date();
        const nextDay = getNextScheduledDate(today, scheduledDays[0]); // Suggest the first scheduled day
        setFecha(format(nextDay, 'yyyy-MM-dd'));
        setDiaSemana(scheduledDays[0]);
      } else {
        setFecha('');
        setDiaSemana('');
      }
    }
  }, [isEditMode, initialData, scheduledDays]);

  const getNextScheduledDate = (currentDate, targetDayName) => {
    const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const targetDayIndex = daysOfWeek.indexOf(targetDayName);
    if (targetDayIndex === -1) return currentDate; // Should not happen with filtered days

    let nextDate = new Date(currentDate);
    nextDate.setDate(currentDate.getDate() + 1); // Start checking from tomorrow

    while (daysOfWeek[nextDate.getDay()] !== targetDayName) {
      nextDate.setDate(nextDate.getDate() + 1);
    }
    return nextDate;
  };

  const handleDiaSemanaChange = (e) => {
    const selectedDay = e.target.value;
    setDiaSemana(selectedDay);
    // When day changes, suggest the next date for that day
    if (!isEditMode && selectedDay) {
      const today = new Date();
      const nextDay = getNextScheduledDate(today, selectedDay);
      setFecha(format(nextDay, 'yyyy-MM-dd'));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = {
        fecha: fecha, // Enviar la fecha en formato YYY-MM-DD directamente
        dia_semana: diaSemana,
      };

      if (isEditMode) {
        console.log('DiaClaseForm: Updating diaClaseId:', initialData.id, 'with data:', data);
        await api.updateDiaClase(catedraId, Number(initialData.id), data);
        Swal.fire('¡Actualizado!', 'Día de clase actualizado exitosamente.', 'success');
        onDiaClaseUpdated();
      } else {
        await api.createDiaClase(catedraId, data);
        Swal.fire('¡Creado!', 'Día de clase creado exitosamente.', 'success');
        onDiaClaseCreated();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar el día de clase.');
      Swal.fire('Error', error, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4">
      {error && <div className="bg-red-500 text-white p-3 rounded mb-4">{error}</div>}
      <div className="mb-4">
        <label htmlFor="fecha" className="block text-gray-300 text-sm font-bold mb-2">Fecha:</label>
        <input
          type="date"
          id="fecha"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="diaSemana" className="block text-gray-300 text-sm font-bold mb-2">Día de la Semana:</label>
        <select
          id="diaSemana"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={diaSemana}
          onChange={handleDiaSemanaChange}
          required
        >
          <option value="">Selecciona un día</option>
          {scheduledDays.map(day => (
            <option key={day} value={day}>{day}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-end space-x-4 space-y-3 sm:space-y-0">
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          disabled={loading}
        >
          {loading ? 'Guardando...' : (isEditMode ? 'Actualizar Día de Clase' : 'Crear Día de Clase')}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          disabled={loading}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
};

export default DiaClaseForm;
