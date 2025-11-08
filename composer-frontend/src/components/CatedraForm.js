import React, { useState, useEffect } from 'react';
import api from '../api';

const CatedraForm = ({ onSubmit, initialData, onCancel }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    anio: new Date().getFullYear(),
    institucion: '',
    turno: 'Noche',
    aula: '',
    docenteId: '', // Nuevo campo para el docente
    modalidad_pago: 'PARTICULAR', // Nuevo campo para la modalidad de pago
  });
  const [schedules, setSchedules] = useState([]);

  const [docentes, setDocentes] = useState([]);
  const [loadingDocentes, setLoadingDocentes] = useState(true);
  const [errorDocentes, setErrorDocentes] = useState('');

  useEffect(() => {
    const fetchDocentes = async () => {
      try {
        const response = await api.getDocentes();
        setDocentes(response.data);
      } catch (err) {
        setErrorDocentes(err.response?.data?.message || 'Error al cargar docentes.');
      } finally {
        setLoadingDocentes(false);
      }
    };
    fetchDocentes();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({ ...initialData, docenteId: initialData.docenteId || '' });
      if (initialData.CatedraDiaHorario && initialData.CatedraDiaHorario.length > 0) {
        setSchedules(initialData.CatedraDiaHorario);
      } else {
        setSchedules([{ dia_semana: 'Lunes', hora_inicio: '', hora_fin: '' }]);
      }
    } else {
      setSchedules([{ dia_semana: 'Lunes', hora_inicio: '', hora_fin: '' }]);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleScheduleChange = (index, e) => {
    const { name, value } = e.target;
    const newSchedules = [...schedules];
    newSchedules[index] = { ...newSchedules[index], [name]: value };
    setSchedules(newSchedules);
  };

  const addSchedule = () => {
    setSchedules([...schedules, { dia_semana: 'Lunes', hora_inicio: '', hora_fin: '' }]);
  };

  const removeSchedule = (index) => {
    const newSchedules = schedules.filter((_, i) => i !== index);
    setSchedules(newSchedules);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalFormData = {
      ...formData,
      horariosPorDia: schedules,
      dias: [...new Set(schedules.map(s => s.dia_semana))].join(','), // Update dias based on schedules
    };
    onSubmit(finalFormData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-gray-200">
      <div>
        <label className="block mb-1 font-semibold">Nombre de la Cátedra</label>
        <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} className="w-full p-2 bg-gray-700 rounded" required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 font-semibold">Año Académico</label>
          <input type="number" name="anio" value={formData.anio} onChange={handleChange} className="w-full p-2 bg-gray-700 rounded" required />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Institución</label>
          <input type="text" name="institucion" value={formData.institucion} onChange={handleChange} className="w-full p-2 bg-gray-700 rounded" required />
        </div>
      </div>
      <div>
        <label className="block mb-1 font-semibold">Turno</label>
        <select name="turno" value={formData.turno} onChange={handleChange} className="w-full p-2 bg-gray-700 rounded">
          <option value="Mañana">Mañana</option>
          <option value="Tarde">Tarde</option>
          <option value="Noche">Noche</option>
        </select>
      </div>
      <div>
        <label className="block mb-1 font-semibold">Horarios de Clase</label>
        {schedules.map((schedule, index) => (
          <div key={index} className="grid grid-cols-4 gap-4 mb-2">
            <select
              name="dia_semana"
              value={schedule.dia_semana}
              onChange={(e) => handleScheduleChange(index, e)}
              className="w-full p-2 bg-gray-700 rounded"
              required
            >
              {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
            <input
              type="time"
              name="hora_inicio"
              value={schedule.hora_inicio}
              onChange={(e) => handleScheduleChange(index, e)}
              className="w-full p-2 bg-gray-700 rounded"
              required
            />
            <input
              type="time"
              name="hora_fin"
              value={schedule.hora_fin}
              onChange={(e) => handleScheduleChange(index, e)}
              className="w-full p-2 bg-gray-700 rounded"
              required
            />
            <button
              type="button"
              onClick={() => removeSchedule(index)}
              className="px-3 py-2 bg-red-600 rounded hover:bg-red-500 text-white"
            >
              Eliminar
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addSchedule}
          className="mt-2 px-4 py-2 bg-green-600 rounded hover:bg-green-500 text-white"
        >
          Agregar Horario
        </button>
      </div>
      <div>
        <label className="block mb-1 font-semibold">Sala/Aula</label>
        <input type="text" name="aula" value={formData.aula} onChange={handleChange} className="w-full p-2 bg-gray-700 rounded" />
      </div>

      <div>
        <label className="block mb-1 font-semibold">Modalidad de Pago</label>
        <select name="modalidad_pago" value={formData.modalidad_pago} onChange={handleChange} className="w-full p-2 bg-gray-700 rounded">
          <option value="PARTICULAR">Particular</option>
          <option value="INSTITUCIONAL">Institucional</option>
        </select>
      </div>

      <div>
        <label className="block mb-1 font-semibold">Docente Asignado</label>
        {loadingDocentes ? (
          <p>Cargando docentes...</p>
        ) : errorDocentes ? (
          <p className="text-red-500">Error: {errorDocentes}</p>
        ) : (
          <select
            name="docenteId"
            value={formData.docenteId}
            onChange={handleChange}
            className="w-full p-2 bg-gray-700 rounded"
          >
            <option value="">-- Seleccionar Docente --</option>
            {docentes.map((docente) => (
              <option key={docente.id} value={docente.id}>
                {docente.nombre} {docente.apellido} ({docente.email})
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="flex justify-end space-x-4 pt-4">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500">Cancelar</button>
        <button type="submit" className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-500">{initialData ? 'Actualizar' : 'Crear'}</button>
      </div>
    </form>
  );
};

export default CatedraForm;
