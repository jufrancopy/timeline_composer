import React, { useEffect, useState } from 'react';
import api from '../api';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { MessageSquare, BookMarked, Loader2 } from 'lucide-react';
import PublicacionCard from '../components/PublicacionCard';

const DocenteDashboardPage = () => {
  const [catedras, setCatedras] = useState([]);
  const [publicaciones, setPublicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [docenteId, setDocenteId] = useState(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('docenteToken');
    navigate('/docente/login');
  };

  useEffect(() => {
    const token = localStorage.getItem('docenteToken');
    if (!token) {
      navigate('/docente/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [docenteMeResponse, catedrasResponse] = await Promise.all([
          api.getDocenteMe(),
          api.getDocenteCatedras(),
        ]);
        setDocenteId(docenteMeResponse.data.id);
        setCatedras(catedrasResponse.data);

        // Fetch publications for each catedra
        const allPublicaciones = [];
        for (const catedra of catedrasResponse.data) {
          const pubResponse = await api.getPublicaciones(catedra.id);
          const publicacionesConCatedraNombre = pubResponse.data.map(pub => ({...pub, catedraNombre: catedra.nombre}));
          allPublicaciones.push(...publicacionesConCatedraNombre);
        }
        setPublicaciones(allPublicaciones);

      } catch (err) {
        console.error('Error loading docente dashboard data:', err);
        if (err.response?.status === 401) {
          localStorage.removeItem('docenteToken');
          navigate('/docente/login');
          toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        } else {
          setError(err.response?.data?.message || 'Error al cargar el dashboard del docente.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const handleAddComment = async (publicacionId, commentData) => {
    try {
      const response = await api.createComentario(publicacionId, {
        ...commentData,
        autorDocenteId: docenteId,
        userType: 'docente'
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

  const onInteractToggle = async (publicacionId, hasUserInteracted) => {
    try {
      if (hasUserInteracted) {
        await api.removeInteraction(publicacionId);
        toast.success('Interacción eliminada.');
      } else {
        await api.addInteraction(publicacionId);
        toast.success('Interacción añadida.');
      }
      // Actualizar el estado de publicaciones para reflejar el cambio
      setPublicaciones(prevPublicaciones =>
        prevPublicaciones.map(pub =>
          pub.id === publicacionId
            ? {
                ...pub,
                hasUserInteracted: !hasUserInteracted,
                totalInteracciones: hasUserInteracted ? pub.totalInteracciones - 1 : pub.totalInteracciones + 1,
              }
            : pub
        )
      );
    } catch (error) {
      console.error('Error toggling interaction:', error);
      toast.error('Error al actualizar la interacción.');
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
        <p className="text-red-500 text-xl">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto bg-white/5 backdrop-blur-lg p-6 rounded-lg shadow-xl">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center text-center md:text-left mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Mi Dashboard de Docente
          </h1>
          <button
            onClick={handleLogout}
            className="bg-red-700 hover:bg-red-800 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 w-full md:w-auto mt-4 md:mt-0 shadow-lg"
          >
            Cerrar Sesión
          </button>
        </div>

        <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          Mis Cátedras Asignadas
        </h2>
        {catedras.length === 0 ? (
          <p className="text-center text-gray-400 text-lg mb-8">No tienes cátedras asignadas aún.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {catedras.map((catedra) => (
              <div key={catedra.id} className="bg-gray-800/50 hover:bg-gray-700/50 transition-colors duration-300 rounded-lg shadow-lg p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2 text-purple-300">{catedra.nombre} ({catedra.anio})</h3>
                  <p className="text-gray-300 mb-4">{catedra.institucion} - {catedra.turno}</p>
                  <p className="text-gray-200">Horario: {catedra.horario} ({catedra.dias})</p>
                  <p className="text-gray-200">Aula: {catedra.aula}</p>
                </div>
                <div className="mt-4">
                  <Link
                    to={`/docente/catedra/${catedra.id}`}
                    className="block bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 text-center"
                  >
                    Ver Detalles de Cátedra
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
          Tablón de Anuncios de Cátedras
        </h2>
        {publicaciones.length === 0 ? (
          <div className="text-center py-8">
            <BookMarked className="w-16 h-16 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-lg">No hay publicaciones disponibles en tus cátedras.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {publicaciones
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) // Sort by date, newest first
              .map((publicacion) => (
                <PublicacionCard
                  key={publicacion.id}
                  publicacion={publicacion}
                  onAddComment={handleAddComment}
                  onDeleteComment={handleDeleteComment}
                  onInteractToggle={onInteractToggle}
                  userType="docente"
                  docenteId={docenteId}
                  catedraNombre={publicacion.catedraNombre}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocenteDashboardPage;
