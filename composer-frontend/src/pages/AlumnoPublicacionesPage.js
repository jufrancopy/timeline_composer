import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, BookMarked, Loader2 } from 'lucide-react';
import api from '../api'; // Asegúrate de que esta ruta sea correcta
import PublicacionCard from '../components/PublicacionCard'; // Asegúrate de que esta ruta sea correcta

const AlumnoPublicacionesPage = () => {
  const [publicaciones, setPublicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPublicaciones = async () => {
      try {
        setLoading(true);
        const response = await api.getMyPublicaciones();
        setPublicaciones(response.data);
      } catch (err) {
        console.error('Error fetching publicaciones:', err);
        setError('No se pudieron cargar las publicaciones. Intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchPublicaciones();
  }, []);

  const handlePublicacionClick = (publicacion) => {
    if (publicacion.tipo === 'TAREA' && publicacion.tareaAsignacionId) {
      navigate(`/alumnos/tareas/${publicacion.tareaAsignacionId}`);
    } else if (publicacion.tipo === 'EVALUACION' && publicacion.evaluacionAsignacionId) {
      navigate(`/alumnos/evaluaciones/${publicacion.evaluacionAsignacionId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-16 h-16 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <p className="text-red-500 text-xl">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 sm:p-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-6 flex items-center gap-3">
            <MessageSquare className="text-purple-400" size={32} />
            Tablón de Anuncios
          </h1>

          {publicaciones.length === 0 ? (
            <div className="text-center py-8">
              <BookMarked className="w-16 h-16 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-lg">No hay publicaciones disponibles en este momento.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {publicaciones.map((publicacion) => (
                <PublicacionCard
                  key={publicacion.id}
                  publicacion={publicacion}
                  onClick={() => handlePublicacionClick(publicacion)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlumnoPublicacionesPage;
