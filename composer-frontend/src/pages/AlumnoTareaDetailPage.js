import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import { FileText, BookOpen, BookMarked, Target, AlertCircle, Loader } from 'lucide-react';

const AlumnoTareaDetailPage = () => {
  const { tareaAsignacionId } = useParams();
  const [tareaAsignacion, setTareaAsignacion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const STATIC_ASSET_BASE_URL = process.env.REACT_APP_API_URL.endsWith('/api') 
    ? process.env.REACT_APP_API_URL.slice(0, -4) 
    : process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchTareaDetails = async () => {
      try {
        setLoading(true);
        const response = await api.getTareaAsignacionById(tareaAsignacionId);
        setTareaAsignacion(response.data);
        setError(null);
      } catch (err) {
        console.error('Error al cargar los detalles de la tarea:', err);
        setError('No se pudo cargar los detalles de la tarea. Intenta de nuevo más tarde.');
        toast.error('Error al cargar los detalles de la tarea.');
      } finally {
        setLoading(false);
      }
    };

    fetchTareaDetails();
  }, [tareaAsignacionId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <Loader className="animate-spin w-16 h-16 text-purple-500 mx-auto mb-4" />
          <p className="text-slate-300 text-lg font-medium">Cargando detalles de la tarea...</p>
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
          <Link 
            to="/alumno/tareas"
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Volver a Mis Tareas
          </Link>
        </div>
      </div>
    );
  }

  if (!tareaAsignacion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Tarea no encontrada</h2>
          <p className="text-slate-400 mb-6">La tarea solicitada no existe o no tienes permiso para verla.</p>
          <Link 
            to="/alumno/tareas"
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Volver a Mis Tareas
          </Link>
        </div>
      </div>
    );
  }

  const { TareaMaestra, estado, submission_path, submission_date, puntos_obtenidos } = tareaAsignacion;


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 sm:p-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-6 flex items-center gap-3">
            <FileText className="text-blue-400" size={32} />
            {TareaMaestra.titulo}
          </h1>

          {/* Información de Cátedra, Plan y Unidad */}
          <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50 space-y-2 mb-6">
            <div className="flex items-center gap-2">
              <BookOpen size={18} className="text-emerald-400" />
              <span className="text-white font-semibold">Cátedra:</span>
              <span>{TareaMaestra.Catedra?.nombre || 'N/A'} - {TareaMaestra.Catedra?.anio || 'N/A'}</span>
            </div>
            {TareaMaestra.UnidadPlan?.PlanDeClases?.titulo && (
              <div className="flex items-center gap-2">
                <BookMarked size={18} className="text-blue-400" />
                <span className="text-white font-semibold">Plan de Clases:</span>
                <span>{TareaMaestra.UnidadPlan.PlanDeClases.titulo}</span>
              </div>
            )}
            {TareaMaestra.UnidadPlan?.periodo && (
              <div className="flex items-center gap-2">
                <Target size={18} className="text-purple-400" />
                <span className="text-white font-semibold">Unidad:</span>
                <span>{TareaMaestra.UnidadPlan.periodo}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
              <span className="text-sm text-slate-400 font-medium">Puntos Posibles</span>
              <div className="text-2xl font-bold text-white mt-1">{TareaMaestra.puntos_posibles}</div>
            </div>
            <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
              <span className="text-sm text-slate-400 font-medium">Fecha de Entrega</span>
              <div className="text-lg font-semibold text-white mt-1">
                {TareaMaestra.fecha_entrega ? new Date(TareaMaestra.fecha_entrega).toLocaleDateString() : 'No definida'}
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <FileText size={20} />
              Descripción
            </h4>
            <div 
              className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50 prose prose-invert max-w-none" 
              dangerouslySetInnerHTML={{ __html: TareaMaestra.descripcion }}
            />
          </div>

          {(TareaMaestra.recursos && TareaMaestra.recursos.length > 0) && (
            <div className="mt-6">
              <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <FileText size={20} />
                Recursos Adjuntos
              </h4>
              <div className="grid gap-3">
                {TareaMaestra.recursos.map((recurso, resIndex) => {
                  const fileName = recurso.split('/').pop();
                  const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(fileName.split('.').pop().toLowerCase());
                  const fullRecursoUrl = `${STATIC_ASSET_BASE_URL}/${recurso}`;
                  return (
                    <div key={resIndex} className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
                      {isImage ? (
                        <img 
                          src={fullRecursoUrl} 
                          alt="Recurso" 
                          className="max-w-full h-auto rounded-lg shadow-lg" 
                        />
                      ) : (
                        <a 
                          href={fullRecursoUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors font-medium"
                        >
                          <FileText size={16} />
                          {fileName}
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sección de Entrega (solo si la tarea no ha sido entregada o está en estado pendiente) */}
          {tareaAsignacion.estado?.toUpperCase() === 'ASIGNADA' && puntos_obtenidos === null ? (
            <div className="mt-8 text-center">
              <Link 
                to={`/alumno/submit-tarea/${tareaAsignacionId}`} // Ruta para subir la entrega
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-all"
              >
                Subir Entrega
              </Link>
            </div>
          ) : (
            <div className="mt-8">
              <h4 className="text-lg font-semibold text-white mb-3">Estado de la Entrega:</h4>
              <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
                <p className="text-white">Estado: <span className="font-bold">{estado}</span></p>
                {submission_date && <p className="text-white">Fecha de Entrega: {new Date(submission_date).toLocaleDateString()}</p>}
                {puntos_obtenidos !== null && <p className="text-white">Puntos Obtenidos: <span className="font-bold">{puntos_obtenidos}</span></p>}
                {(submission_path && submission_path.length > 0) && (
                  <div className="text-white">
                    <h5 className="font-semibold mb-2">Archivos Entregados:</h5>
                    <div className="grid gap-2">
                      {submission_path.map((path, index) => {
                        const fileName = path.split('/').pop();
                        return (
                          <a
                            key={index}
                            href={`${STATIC_ASSET_BASE_URL}${path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors font-medium"
                          >
                            <FileText size={16} />
                            {fileName}
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-8 text-center">
            <Link 
              to="/alumno/tareas"
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-all"
            >
              Volver a Mis Tareas
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AlumnoTareaDetailPage;
