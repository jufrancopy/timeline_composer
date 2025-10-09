import React, { useState, useEffect } from 'react';
import api from '../api';
import Swal from 'sweetalert2';

const AttendanceForm = ({ catedraId, diaClaseId, alumnos, onSave, onCancel }) => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.getAttendanceByDiaClase(diaClaseId);
        const existingAttendanceMap = new Map(response.data.map(rec => [rec.alumnoId, rec]));

        const initialRecords = alumnos.map(inscripcion => {
          const alumno = inscripcion.alumno || inscripcion.composer; // Puede ser alumno o composer
          const existing = existingAttendanceMap.get(alumno.id);
          return {
            alumnoId: alumno.id,
            nombre: alumno.nombre || alumno.first_name,
            apellido: alumno.apellido || alumno.last_name,
            presente: existing ? existing.presente : false,
            id: existing ? existing.id : null, // ID del registro de asistencia si ya existe
          };
        });
        setAttendanceRecords(initialRecords);
      } catch (err) {
        setError(err.response?.data?.error || 'Error al cargar la asistencia.');
        Swal.fire('Error', error, 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [diaClaseId, alumnos]);

  const handleCheckboxChange = (alumnoId, isPresent) => {
    console.log(`Cambiando asistencia para alumnoId: ${alumnoId} a presente: ${isPresent}`);
    setAttendanceRecords(prevRecords => {
      const updatedRecords = prevRecords.map(record =>
        record.alumnoId === alumnoId ? { ...record, presente: isPresent } : record
      );
      console.log('Estado de attendanceRecords después del cambio:', updatedRecords);
      return updatedRecords;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const recordsToSubmit = attendanceRecords.map(({ alumnoId, presente }) => ({
        alumnoId,
        presente,
      }));
      await api.registerAttendance(diaClaseId, { asistencias: recordsToSubmit });
      Swal.fire('¡Guardado!', 'Asistencia registrada exitosamente.', 'success');
      onSave(); // Notificar al componente padre que se guardó la asistencia
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar la asistencia.');
      Swal.fire('Error', error, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4 text-center text-gray-300">Cargando asistencia...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="p-4">
      {error && <div className="bg-red-500 text-white p-3 rounded mb-4">{error}</div>}
      <div className="mb-4 max-h-80 overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800 sticky top-0">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Alumno</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-300 uppercase">Presente</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {attendanceRecords.map((record) => (
              <tr key={record.alumnoId} className="hover:bg-gray-700/50">
                <td className="px-4 py-2 whitespace-nowrap text-gray-200">{record.nombre} {record.apellido}</td>
                <td className="px-4 py-2 whitespace-nowrap text-center">
                  <input
                    type="checkbox"
                    checked={record.presente}
                    onChange={(e) => handleCheckboxChange(record.alumnoId, e.target.checked)}
                    className="form-checkbox h-5 w-5 text-purple-600"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {attendanceRecords.length === 0 && <p className="text-center py-4 text-gray-400">No hay alumnos en esta cátedra.</p>}
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-between mt-6 space-y-3 sm:space-y-0">
        <button
          type="submit"
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          disabled={loading}
        >
          {loading ? 'Guardando...' : 'Guardar Asistencia'}
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

export default AttendanceForm;
