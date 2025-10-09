import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import ComentarioForm from './ComentarioForm';
import Swal from 'sweetalert2';
import { MessageSquare, Heart } from 'lucide-react';
import toast from 'react-hot-toast';

const PublicacionCard = ({ publicacion, onAddComment, onDeletePublication, onDeleteComment, onEditPublication, onInteractToggle, userType, userId, docenteId, setActiveTab }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const navigate = useNavigate();

  const isAuthor = (authorAlumnoId, authorDocenteId) => {
    if (userType === 'alumno' && userId === authorAlumnoId) return true;
    if (userType === 'docente' && docenteId === authorDocenteId) return true;
    return false;
  };

  const handleAddCommentSubmit = async (publicacionId, commentData) => {
    setCommentLoading(true);
    try {
      await onAddComment(publicacionId, commentData);
      toast.success('Comentario añadido.');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al añadir el comentario.');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeletePublicationClick = async () => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "¡No podrás revertir esto! Se eliminará la publicación, todos sus comentarios y sus interacciones.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, ¡eliminarla!',
      cancelButtonText: 'Cancelar'
    });
    if (result.isConfirmed) {
      onDeletePublication(publicacion.id);
    }
  };

  const handleDeleteCommentClick = async (commentId) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "¡No podrás revertir esto! El comentario será eliminado.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, ¡eliminarlo!',
      cancelButtonText: 'Cancelar'
    });
    if (result.isConfirmed) {
      onDeleteComment(publicacion.id, commentId);
    }
  };

  const handleToggleInteraction = () => {
    onInteractToggle(publicacion.id, publicacion.hasUserInteracted);
  };

  const getAuthorName = (pub) => {
    if (pub.autorAlumno) {
      return `${pub.autorAlumno.nombre} ${pub.autorAlumno.apellido} (Alumno)`;
    } else if (pub.autorDocente) {
      return `${pub.autorDocente.nombre} ${pub.autorDocente.apellido} (Docente)`;
    } else {
      return 'Desconocido';
    }
  };

  const getCommentAuthorName = (comment) => {
    if (comment.autorAlumno) {
      return `${comment.autorAlumno.nombre} ${comment.autorAlumno.apellido} (Alumno)`;
    } else if (comment.autorDocente) {
      return `${comment.autorDocente.nombre} ${comment.autorDocente.apellido} (Docente)`;
    } else {
      return 'Desconocido';
    }
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md mb-4 border border-gray-700">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-xl font-bold text-white mb-1">
            {publicacion.titulo}
          </h4>
          <p className="text-sm text-gray-400">Publicado por {getAuthorName(publicacion)} el {format(new Date(publicacion.created_at), 'dd/MM/yyyy HH:mm')}</p>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mt-2">
            {publicacion.tipo}
          </span>
        </div>
        {isAuthor(publicacion.autorAlumnoId, publicacion.autorDocenteId) && (
          <div className="flex space-x-2 mt-1">
            <button onClick={() => onEditPublication(publicacion)} className="text-yellow-400 hover:text-yellow-300" title="Editar Publicación">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            </button>
            <button onClick={handleDeletePublicationClick} className="text-red-400 hover:text-red-300" title="Eliminar Publicación">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        )}
      </div>
      <div className="mt-4 text-gray-300">
        {publicacion.tipo === 'TAREA' && publicacion.tareaMaestraId ? (
          <div className="space-y-2">
            <div dangerouslySetInnerHTML={{ __html: publicacion.contenido }}></div>
            {publicacion.tareaMaestra?.fecha_entrega && (
              <p><strong>Fecha de Entrega:</strong> {format(new Date(publicacion.tareaMaestra.fecha_entrega), 'dd/MM/yyyy HH:mm')}</p>
            )}
            {/* Mostrar el estado de la tarea asignada y el enlace a "Mis Tareas" si es un alumno */}
            {userType === 'alumno' && publicacion.tareaAsignacionEstado && (
              <div className="mt-3">
                {publicacion.tareaAsignacionEstado === 'ASIGNADA' || (publicacion.tareaAsignacionEstado === 'VENCIDA' && !publicacion.tareaAsignacionSubmissionPath) ? (
                  <button
                    onClick={() => navigate('/my-contributions', { state: { activeTab: 'tareas', taskId: publicacion.tareaMaestraId } })}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 mt-2"
                  >
                    <span className="font-semibold">Estado: Pendiente - </span>Ir a Mis Tareas
                  </button>
                ) : publicacion.tareaAsignacionEstado === 'ENTREGADA' || (publicacion.tareaAsignacionEstado === 'VENCIDA' && publicacion.tareaAsignacionSubmissionPath) ? (
                  <button
                    onClick={() => navigate('/my-contributions', { state: { activeTab: 'tareas', taskId: publicacion.tareaMaestraId } })}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 mt-2"
                  >
                    <span className="font-semibold">Estado: Entregada - </span>Ver Mi Entrega
                  </button>
                ) : publicacion.tareaAsignacionEstado === 'CALIFICADA' ? (
                  <button
                    onClick={() => navigate('/my-contributions', { state: { activeTab: 'tareas', taskId: publicacion.tareaMaestraId } })}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mt-2"
                  >
                    <span className="font-semibold">Estado: Calificada - </span>Ver Calificación
                  </button>
                ) : null}
              </div>
            )}
          </div>
        ) : publicacion.tipo === 'EVALUACION' && publicacion.evaluacionAsignacionId ? (
          <div className="space-y-2">
            <p><strong>Evaluación:</strong> {publicacion.evaluacionMaestraTitulo}</p>
            <div dangerouslySetInnerHTML={{ __html: publicacion.contenido }}></div>
            {publicacion.fecha_entrega && (
              <p><strong>Fecha Límite:</strong> {format(new Date(publicacion.fecha_entrega), 'dd/MM/yyyy HH:mm')}</p>
            )}
            {userType === 'alumno' && publicacion.evaluacionAsignacionEstado && (
              <div className="mt-3">
                {publicacion.evaluacionAsignacionEstado === 'PENDIENTE' || publicacion.evaluacionAsignacionEstado === 'VENCIDA' ? (
                  <button
                    onClick={() => navigate(`/alumno/evaluaciones/${publicacion.evaluacionAsignacionId}`)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 mt-2"
                  >
                    <span>Estado: {publicacion.evaluacionAsignacionEstado === 'PENDIENTE' ? 'Pendiente' : 'Vencida'} - </span>Realizar Evaluación
                  </button>
                ) : publicacion.evaluacionAsignacionEstado === 'REALIZADA' ? (
                  <button
                    onClick={() => navigate(`/alumno/evaluaciones/${publicacion.evaluacionAsignacionId}/results`)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 mt-2"
                  >
                    <span>Estado: Realizada - </span>Ver Resultados
                  </button>
                ) : publicacion.evaluacionAsignacionEstado === 'CALIFICADA' ? (
                  <button
                    onClick={() => navigate(`/alumno/evaluaciones/${publicacion.evaluacionAsignacionId}/results`)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mt-2"
                  >
                    <span>Estado: Calificada - </span>Ver Calificación
                  </button>
                ) : null}
              </div>
            )}
          </div>
        ) : (
          <div dangerouslySetInnerHTML={{ __html: publicacion.contenido }}></div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-4 pt-4 border-t border-gray-700">
        <button
          onClick={handleToggleInteraction}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors
            ${publicacion.hasUserInteracted ? 'bg-pink-600 text-white hover:bg-pink-700' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
        >
          <Heart size={16} className={publicacion.hasUserInteracted ? 'fill-white' : 'fill-none'} />
          <span>{publicacion.totalInteracciones || 0}</span>
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors focus:outline-none"
        >
          <MessageSquare size={16} />
          <span>{publicacion.comentarios?.length || 0} Comentario{publicacion.comentarios?.length !== 1 ? 's' : ''}</span>
        </button>
      </div>

      {showComments && (
        <div className="mt-4 space-y-3">
          {publicacion.comentarios?.map(comment => (
            <div key={comment.id} className="bg-gray-700 p-3 rounded-lg flex justify-between items-start">
              <div>
                <p className="text-gray-200 text-sm" dangerouslySetInnerHTML={{ __html: comment.texto }}></p>
                <p className="text-xs text-gray-400 mt-1">Por {getCommentAuthorName(comment)} el {format(new Date(comment.created_at), 'dd/MM/yyyy HH:mm')}</p>
              </div>
              {isAuthor(comment.autorAlumnoId, comment.autorDocenteId) && (
                <button onClick={() => handleDeleteCommentClick(comment.id)} className="text-red-400 hover:text-red-300 ml-4" title="Eliminar Comentario">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              )}
            </div>
          ))}
          <ComentarioForm publicacionId={publicacion.id} onSubmit={handleAddCommentSubmit} loading={commentLoading} />
        </div>
      )}
    </div>
  );
};

PublicacionCard.propTypes = {
  publicacion: PropTypes.object.isRequired,
  onAddComment: PropTypes.func.isRequired,
  onDeletePublication: PropTypes.func,
  onDeleteComment: PropTypes.func.isRequired,
  onEditPublication: PropTypes.func,
  onInteractToggle: PropTypes.func.isRequired,
  userType: PropTypes.oneOf(['alumno', 'docente']).isRequired,
  userId: PropTypes.number,
  docenteId: PropTypes.number,
  setActiveTab: PropTypes.func,
};

export default PublicacionCard;