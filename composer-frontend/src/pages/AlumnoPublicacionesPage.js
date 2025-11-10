import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, BookMarked, Loader2 } from 'lucide-react';
import api from '../api'; // Asegúrate de que esta ruta sea correcta
import PublicacionCard from '../components/PublicacionCard'; // Asegúrate de que esta ruta sea correcta
import toast from 'react-hot-toast';
const AlumnoPublicacionesPage = () => {
  const [publicaciones, setPublicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alumnoId, setAlumnoId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [publicacionesResponse, alumnoMeResponse] = await Promise.all([
          api.getMyPublicaciones(),
          api.getAlumnoMe()
        ]);
        setPublicaciones(publicacionesResponse.data);
        setAlumnoId(alumnoMeResponse.data.id);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('No se pudieron cargar las publicaciones o la información del usuario. Intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddComment = async (publicacionId, commentData) => {
    try {
      const response = await api.createComentario(publicacionId, {
        ...commentData,
        autorAlumnoId: alumnoId,
        userType: 'alumno'
      });
      setPublicaciones(prevPublicaciones =>
        prevPublicaciones.map(pub =>
          pub.id === publicacionId
            ? { ...pub, ComentarioPublicacion: [...pub.ComentarioPublicacion, response.data] }
            : pub
        )
      );
    } catch (error) {
      console.error('Error al añadir comentario:', error);
      throw error;
    }
  };

  const handleDeleteComment = async (publicacionId, comentarioId) => {
    try {
      await api.deleteComentario(publicacionId, comentarioId);
      setPublicaciones(prevPublicaciones =>
        prevPublicaciones.map(pub =>
          pub.id === publicacionId
            ? {
                ...pub,
                ComentarioPublicacion: pub.ComentarioPublicacion.filter(
                  (comment) => comment.id !== comentarioId
                ),
              }
            : pub
        )
      );
      toast.success('Comentario eliminado.');
    } catch (error) {
      console.error('Error al eliminar comentario:', error);
      toast.error(error.response?.data?.error || 'Error al eliminar el comentario.');
      throw error;
    }
  };

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
                  onAddComment={handleAddComment}
                  onDeleteComment={handleDeleteComment}
                  userType="alumno"
                  userId={alumnoId}
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