import React, { useState, useEffect, useRef } from 'react';
import { format, startOfMonth, endOfMonth, isBefore, isAfter, parseISO } from 'date-fns';
import es from 'date-fns/locale/es';
import api from '../api';
import { toast } from 'react-toastify';

const parseBackendDateToLocalDate = (isoString) => {
  if (!isoString) return null;
  // Extraer solo la parte de la fecha (YYYY-MM-DD) ignorando la hora y zona horaria
  const dateOnly = isoString.split('T')[0];
  // Parsear como fecha local, no UTC
  const [year, month, day] = dateOnly.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const AttendanceDaysSelector = ({ catedraId, onDaysChange, initialSelectedDays }) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [availableDays, setAvailableDays] = useState([]);
  const [selectedDays, setSelectedDays] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Refs para controlar la inicialización y evitar bucles
  const isInitialized = useRef(false);
  const prevAvailableDays = useRef([]);

  // EFECTO 1: Inicializar rango de fechas (solo una vez al montar)
  useEffect(() => {
    if (isInitialized.current) return;
    
    if (initialSelectedDays && initialSelectedDays.length > 0) {
      const parsedInitialDates = initialSelectedDays.map(isoString => parseBackendDateToLocalDate(isoString));
      const minDate = new Date(Math.min(...parsedInitialDates.map(date => date.getTime())));
      const maxDate = new Date(Math.max(...parsedInitialDates.map(date => date.getTime())));
      setStartDate(startOfMonth(minDate));
      setEndDate(endOfMonth(maxDate));
      
      const formattedInitialDays = initialSelectedDays.map(isoString =>
        format(parseBackendDateToLocalDate(isoString), 'yyyy-MM-dd')
      );
      setSelectedDays(formattedInitialDays);
    } else {
      const initialStartDate = startOfMonth(new Date());
      const initialEndDate = endOfMonth(new Date());
      setStartDate(initialStartDate);
      setEndDate(initialEndDate);
    }
    
    isInitialized.current = true;
  }, []);

  // EFECTO 2: Cargar días disponibles cuando cambia el rango
  useEffect(() => {
    const fetchDaysInEvaluationRange = async () => {
      if (!catedraId || !startDate || !endDate) {
        setAvailableDays([]);
        return;
      }
      
      setIsLoading(true);
      try {
        const params = {
          startDate: format(startDate, 'yyyy-MM-dd'),
          endDate: format(endDate, 'yyyy-MM-dd'),
        };
        const response = await api.get(`/docente/catedra/${catedraId}/diasClase`, { params });
        
        const fetchedDays = response.data.map(day => {
          // Parsear fecha como local, no UTC
          const dateOnly = day.fecha.split('T')[0];
          const [year, month, dayNum] = dateOnly.split('-').map(Number);
          return { 
            id: day.id, 
            fecha: new Date(year, month - 1, dayNum),
            tipoDia: day.tipoDia, // Incluir tipoDia
          };
        });
        
        setAvailableDays(fetchedDays);
      } catch (error) {
        console.error('Error al obtener días de clase:', error);
        toast.error('Error al cargar los días de clase para el rango de evaluación.');
        setAvailableDays([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDaysInEvaluationRange();
  }, [catedraId, startDate, endDate]);

  // EFECTO 3: Seleccionar automáticamente los días cuando se cargan
  useEffect(() => {
    // Solo ejecutar si availableDays cambió realmente
    const availableDaysString = JSON.stringify(availableDays.map(d => d.id));
    const prevDaysString = JSON.stringify(prevAvailableDays.current.map(d => d.id));
    
    if (availableDaysString === prevDaysString) return;
    prevAvailableDays.current = availableDays;

    if (availableDays.length === 0) {
      setSelectedDays([]);
      onDaysChange([]);
      return;
    }

    // Filtrar días que están dentro del rango seleccionado Y son de tipo NORMAL
    const daysInRange = availableDays.filter(day => {
      if (startDate && isBefore(day.fecha, startDate)) return false;
      if (endDate && isAfter(day.fecha, endDate)) return false;
      return day.tipoDia === 'NORMAL'; // Solo días normales
    });

    // Si hay días iniciales, filtrar solo los que están disponibles Y dentro del rango
    if (initialSelectedDays && initialSelectedDays.length > 0) {
      const formattedInitialDays = initialSelectedDays.map(isoString =>
        format(parseBackendDateToLocalDate(isoString), 'yyyy-MM-dd')
      );
      
      const validInitialDays = formattedInitialDays.filter(initialDay =>
        daysInRange.some(ad => format(ad.fecha, 'yyyy-MM-dd') === initialDay)
      );
      
      setSelectedDays(validInitialDays);
      onDaysChange(validInitialDays);
    } else {
      // Si NO hay días iniciales, seleccionar TODOS los días disponibles DENTRO DEL RANGO
      const daysInRangeFormatted = daysInRange.map(day => format(day.fecha, 'yyyy-MM-dd'));
      setSelectedDays(daysInRangeFormatted);
      onDaysChange(daysInRangeFormatted);
    }
  }, [availableDays, startDate, endDate]);

  // Manejador para el cambio de los checkboxes individuales
  const handleCheckboxChange = (dayFormatted) => {
    const newSelectedDays = selectedDays.includes(dayFormatted)
      ? selectedDays.filter((d) => d !== dayFormatted)
      : [...selectedDays, dayFormatted];
    setSelectedDays(newSelectedDays);
    onDaysChange(newSelectedDays);
  };

  // Manejador para seleccionar todos los días disponibles DENTRO DEL RANGO y de tipo NORMAL
  const handleSelectAllDays = () => {
    const daysInRange = availableDays.filter(day => {
      if (startDate && isBefore(day.fecha, startDate)) return false;
      if (endDate && isAfter(day.fecha, endDate)) return false;
      return day.tipoDia === 'NORMAL'; // Solo días normales
    });
    const allAvailableDaysFormatted = daysInRange.map(day => format(day.fecha, 'yyyy-MM-dd'));
    setSelectedDays(allAvailableDaysFormatted);
    onDaysChange(allAvailableDaysFormatted);
  };

  // Manejador para deseleccionar todos los días
  const handleDeselectAllDays = () => {
    setSelectedDays([]);
    onDaysChange([]);
  };

  return (
    <div className="mb-6 p-4 border rounded-lg shadow-sm bg-gray-50">
      <h3 className="text-xl font-semibold mb-3 text-gray-800">
        1. Selección de Días de Asistencia ({selectedDays.length} días seleccionados)
      </h3>
      
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1">
          <label htmlFor="start-date" className="block text-gray-700 text-sm font-bold mb-2">
            Rango de Evaluación - Inicio:
          </label>
          <input
            type="date"
            id="start-date"
            value={startDate ? format(startDate, 'yyyy-MM-dd') : ''}
            onChange={(e) => setStartDate(e.target.value ? parseISO(e.target.value) : null)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="flex-1">
          <label htmlFor="end-date" className="block text-gray-700 text-sm font-bold mb-2">
            Rango de Evaluación - Fin:
          </label>
          <input
            type="date"
            id="end-date"
            value={endDate ? format(endDate, 'yyyy-MM-dd') : ''}
            onChange={(e) => setEndDate(e.target.value ? parseISO(e.target.value) : null)}
            min={startDate ? format(startDate, 'yyyy-MM-dd') : ''}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
      </div>

      <div className="mt-4">
        <h4 className="text-lg font-medium mb-2 text-gray-700">Días de Clase en el Rango:</h4>
        {isLoading ? (
          <p>Cargando días...</p>
        ) : availableDays.length > 0 ? (
          <>
            <div className="flex justify-end space-x-2 mb-3">
              <button
                type="button"
                onClick={handleSelectAllDays}
                className="px-3 py-1 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Seleccionar Todo
              </button>
              <button
                type="button"
                onClick={handleDeselectAllDays}
                className="px-3 py-1 text-sm font-medium text-indigo-700 bg-indigo-100 rounded-md hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Deseleccionar Todo
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-60 overflow-y-auto p-2 border rounded-md bg-white">
              {availableDays
                .filter(day => {
                  // Filtrar días que están dentro del rango seleccionado Y son de tipo NORMAL
                  if (startDate && isBefore(day.fecha, startDate)) return false;
                  if (endDate && isAfter(day.fecha, endDate)) return false;
                  return day.tipoDia === 'NORMAL'; // Solo días normales
                })
                .map((day) => {
                  const dayFormatted = format(day.fecha, 'yyyy-MM-dd');
                  const isSelected = selectedDays.includes(dayFormatted);
                  return (
                    <label key={day.id} className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                        checked={isSelected}
                        onChange={() => handleCheckboxChange(dayFormatted)}
                      />
                      <span className="ml-2 text-gray-700">{format(day.fecha, 'dd/MM/yyyy')}</span>
                    </label>
                  );
                })}
            </div>
          </>
        ) : (
          <p>No hay días de clase disponibles en el rango seleccionado.</p>
        )}
      </div>
    </div>
  );
};
    
export default AttendanceDaysSelector;