import api from '../api';
import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, XCircle, Award, TrendingUp } from 'lucide-react';

function AlumnosTable({ catedraId }) {
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAlumnos = async () => {
      try {
        const response = await api.fetchPublicCatedraById(catedraId);
        setAlumnos(response.data.alumnos);
        setLoading(false);
      } catch (err) {
        setError('Error al cargar la lista de alumnos.');
        console.error('Error fetching public catedra alumnos:', err);
        setLoading(false);
      }
    };
    fetchAlumnos();
  }, [catedraId]);

  const getEscalaNombre = (escala) => {
    const escalas = {
      1: 'Insuficiente',
      2: 'Regular',
      3: 'Bueno',
      4: 'Muy Bueno',
      5: 'Excelente'
    };
    return escalas[escala] || 'N/A';
  };

  const getEstadoColor = (estado) => {
    return estado === 'APROBADO' 
      ? 'bg-green-600 text-white' 
      : 'bg-red-600 text-white';
  };

  const getEscalaColor = (escala) => {
    if (escala >= 4) return 'text-green-400';
    if (escala === 3) return 'text-blue-400';
    if (escala === 2) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
        <p className="text-gray-300 mt-4">Cargando información de alumnos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900 border border-red-600 rounded-lg p-6 max-w-md mx-auto my-8">
        <h2 className="text-red-200 text-xl font-semibold mb-2">Error</h2>
        <p className="text-red-300">{error}</p>
      </div>
    );
  }

  if (!alumnos || alumnos.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
        <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <p className="text-gray-400">No hay alumnos registrados en esta cátedra</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-500 px-6 py-4">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-white" />
          <h2 className="text-xl font-bold text-white">Alumnos y Calificaciones</h2>
        </div>
      </div>

      {/* Tabla responsive */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-900 border-b border-gray-700">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Alumno
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Asistencias
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Calificación Final
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Escala
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Estado
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {alumnos.map((alumno, index) => (
              <tr 
                key={alumno.id} 
                className="hover:bg-gray-700/50 transition-colors duration-150"
              >
                {/* Nombre del alumno */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {alumno.nombre.charAt(0)}{alumno.apellido.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {alumno.nombre} {alumno.apellido}
                      </p>
                      <p className="text-gray-400 text-sm">{alumno.email}</p>
                    </div>
                  </div>
                </td>

                {/* Asistencias */}
                <td className="px-6 py-4">
                  {alumno.resumenAsistencia ? (
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-4 mb-1">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-green-400 font-semibold">
                            {alumno.resumenAsistencia.diasPresente}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <XCircle className="w-4 h-4 text-red-400" />
                          <span className="text-red-400 font-semibold">
                            {alumno.resumenAsistencia.diasAusente}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-400">
                          {alumno.resumenAsistencia.porcentajeAsistencia}%
                        </span>
                        <div className="w-24 mx-auto bg-gray-700 rounded-full h-2 mt-1">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${alumno.resumenAsistencia.porcentajeAsistencia}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-500 text-sm block text-center">Sin registros</span>
                  )}
                </td>

                {/* Calificación Final */}
                <td className="px-6 py-4 text-center">
                  {alumno.calificacionFinal !== null && alumno.calificacionFinal !== undefined ? (
                    <div>
                      <span className="text-2xl font-bold text-white">
                        {alumno.calificacionFinal.toFixed(2)}
                      </span>
                      <span className="text-gray-400 text-sm block">/ 100</span>
                    </div>
                  ) : (
                    <span className="text-gray-500 text-sm">N/A</span>
                  )}
                </td>

                {/* Escala */}
                <td className="px-6 py-4 text-center">
                  {alumno.escalaCalificacion ? (
                    <div className="inline-flex flex-col items-center gap-1">
                      <div className="flex items-center gap-1.5">
                        <Award className={`w-5 h-5 ${getEscalaColor(alumno.escalaCalificacion)}`} />
                        <span className={`text-lg font-bold ${getEscalaColor(alumno.escalaCalificacion)}`}>
                          {alumno.escalaCalificacion}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {getEscalaNombre(alumno.escalaCalificacion)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-500 text-sm">N/A</span>
                  )}
                </td>

                {/* Estado */}
                <td className="px-6 py-4 text-center">
                  {alumno.estadoAprobacion ? (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${getEstadoColor(alumno.estadoAprobacion)}`}>
                      {alumno.estadoAprobacion === 'APROBADO' ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Aprobado
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4" />
                          Reprobado
                        </>
                      )}
                    </span>
                  ) : (
                    <span className="text-gray-500 text-sm">N/A</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer con estadísticas */}
      <div className="bg-gray-900 px-6 py-4 border-t border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">
            Total de alumnos: <span className="text-white font-semibold">{alumnos.length}</span>
          </span>
          <span className="text-gray-400">
            Aprobados: <span className="text-green-400 font-semibold">
              {alumnos.filter(a => a.estadoAprobacion === 'APROBADO').length}
            </span>
            {' / '}
            Reprobados: <span className="text-red-400 font-semibold">
              {alumnos.filter(a => a.estadoAprobacion === 'REPROBADO').length}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

export default AlumnosTable;