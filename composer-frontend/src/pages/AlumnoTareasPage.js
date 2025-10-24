import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import { FileText, ChevronRight, AlertCircle, Loader, BookMarked } from 'lucide-react';

const AlumnoTareasPage = () => {
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTareas();
  }, []);

  const fetchTareas = async () => {
    try {
      setLoading(true);
      const response = await api.getAlumnoTareas();
      const pendientes = response.data.filter(t => t.estado === 'ASIGNADA' || t.estado === 'PENDIENTE');
      setTareas(pendientes);
      setError(null);
    } catch (err) {
      console.error('Error al cargar las tareas:', err);
      setError('No se pudieron cargar las tareas. Intenta de nuevo más tarde.');
      toast.error('Error al cargar las tareas.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'ASIGNADA':
        return 'bg-blue-900/20 text-blue-300 border-blue-500/30';
      case 'PENDIENTE':
        return 'bg-yellow-900/20 text-yellow-300 border-yellow-500/30';
      case 'ENTREGADA':
        return 'bg-green-900/20 text-green-300 border-green-500/30';
      case 'RECHAZADA':
        return 'bg-red-900/20 text-red-300 border-red-500/30';
      default:
        return 'bg-slate-900/20 text-slate-300 border-slate-500/30';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <Loader className="animate-spin w-16 h-16 text-purple-500 mx-auto mb-4" />
          <p className="text-slate-300 text-lg font-medium">Cargando tareas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Error</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <button
            onClick={fetchTareas}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 sm:p-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-6 flex items-center gap-3">
            <FileText className="text-blue-400" size={32} />
            Mis Tareas Asignadas
          </h1>

          {tareas.length === 0 ? (
            <div className="text-center py-8">
              <BookMarked className="w-16 h-16 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-lg">No tienes tareas pendientes. ¡Excelente trabajo!</p>
              <Link
                to="/alumno/dashboard"
                className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-all"
              >
                Volver al Dashboard
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {tareas.map((tarea) => (
                <Link
                  key={tarea.id}
                  to={`/alumno/tarea/${tarea.id}`}
                  className="group block bg-slate-800/30 rounded-xl p-5 border border-slate-700/50 hover:bg-slate-800/50 transition-colors duration-300 hover:scale-[1.02] relative"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-semibold text-white group-hover:text-blue-300 transition-colors pr-10">
                      {tarea.TareaMaestra.titulo}
                    </h2>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(tarea.estado)}`}>
                      {tarea.estado === 'ASIGNADA' ? 'Asignada' : 'Pendiente'}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm mb-3">
                    Cátedra: {tarea.TareaMaestra.Catedra?.nombre || 'N/A'} - {tarea.TareaMaestra.Catedra?.anio || 'N/A'}
                  </p>
                  <p className="text-slate-500 text-sm line-clamp-2 mb-4">
                    {tarea.TareaMaestra.descripcion}
                  </p>
                  <div className="flex items-center justify-between text-slate-500 text-xs">
                    <div className="flex items-center gap-2">
                      <FileText size={14} />
                      <span>Fecha Límite: {tarea.TareaMaestra.fecha_entrega ? new Date(tarea.TareaMaestra.fecha_entrega).toLocaleDateString() : 'No especificada'}</span>
                    </div>
                    <ChevronRight className="text-slate-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlumnoTareasPage;
