import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import ComentarioForm from './ComentarioForm';
import Swal from 'sweetalert2';
import { 
  MessageSquare, 
  Heart, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Brain,
  Play,
  Eye,
  Calendar,
  Award
} from 'lucide-react';
import toast from 'react-hot-toast';

const PublicacionCard = ({ 
  publicacion, 
  onAddComment, 
  onDeletePublication, 
  onDeleteComment, 
  onEditPublication, 
  onInteractToggle, 
  userType, 
  userId, 
  docenteId, 
  onGoToTaskTab, 
  onGoToTab, 
  catedraNombre, 
  getStatusColor, 
  getTaskStatusDisplay 
}) => {
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
      return `Por ${comment.autorAlumno.nombre} ${comment.autorAlumno.apellido} (Alumno)`;
    } else if (comment.autorDocente) {
      return `Por ${comment.autorDocente.nombre} ${comment.autorDocente.apellido} (Docente)`;
    } else {
      return 'Por Desconocido';
    }
  };

  // NUEVO: Función mejorada para obtener el estado de la tarea asignada
  const getTaskAssignmentStatus = () => {
    if (!publicacion.tareaAsignacionEstado) return null;
    
    const estado = publicacion.tareaAsignacionEstado.toUpperCase();
    
    const statusConfig = {
      'ASIGNADA': {
        text: 'Pendiente de entrega',
        icon: Clock,
        color: 'bg-yellow-900/30 text-yellow-300 border-yellow-500/30',
        showButton: true,
        buttonText: 'Subir Entrega',
        buttonIcon: FileText,
        buttonAction: () => onGoToTab('tareas', publicacion.tareaAsignacionId),
        buttonClass: 'bg-yellow-600 hover:bg-yellow-700'
      },
      'ENTREGADA': {
        text: 'Entregada - Pendiente de corrección',
        icon: CheckCircle,
        color: 'bg-blue-900/30 text-blue-300 border-blue-500/30',
        showButton: false,
        completed: true
      },
      'CALIFICADA': {
        text: 'Calificada',
        icon: Award,
        color: 'bg-green-900/30 text-green-300 border-green-500/30',
        showButton: false, // Una tarea calificada no debería tener un botón de acción principal aquí
        completed: true,
        showPoints: true
      },
      'VENCIDA': {
        text: 'Vencida',
        icon: AlertCircle,
        color: 'bg-red-900/30 text-red-300 border-red-500/30',
        showButton: true,
        buttonText: 'Entregar (Fuera de plazo)',
        buttonIcon: FileText,
        buttonAction: () => onGoToTab('tareas', publicacion.tareaAsignacionId),
        buttonClass: 'bg-red-600 hover:bg-red-700'
      }
    };

    return statusConfig[estado] || null;
  };

  // NUEVO: Función mejorada para obtener el estado de la evaluación asignada
  const getEvaluationAssignmentStatus = () => {
    if (!publicacion.evaluacionAsignacionEstado) return null;

    const estado = publicacion.evaluacionAsignacionEstado.toUpperCase();

    const statusConfig = {
      'PENDIENTE': {
        text: 'Pendiente de realizar',
        icon: Clock,
        color: 'bg-orange-900/30 text-orange-300 border-orange-500/30',
        showButton: true,
        buttonText: 'Realizar Evaluación',
        buttonIcon: Play,
        buttonAction: () => navigate(`/evaluacion/${publicacion.evaluationMaestraId}`),
        buttonClass: 'bg-orange-600 hover:bg-orange-700'
      },
      'REALIZADA': {
        text: 'Calificada',
        icon: Award,
        color: 'bg-green-900/30 text-green-300 border-green-500/30',
        showButton: true,
        buttonText: 'Ver Resultados',
        buttonIcon: Eye,
        buttonAction: () => navigate(`/alumno/catedra/${publicacion.catedraId}/evaluacion/${publicacion.evaluationMaestraId}/results`),
        buttonClass: 'bg-green-600 hover:bg-green-700',
        completed: true,
        showPoints: true
      },
      'CALIFICADA': {
        text: 'Calificada',
        icon: Award,
        color: 'bg-green-900/30 text-green-300 border-green-500/30',
        showButton: true,
        buttonText: 'Ver Resultados',
        buttonIcon: Eye,
        buttonAction: () => navigate(`/alumno/catedra/${publicacion.catedraId}/evaluacion/${publicacion.evaluacionMaestraId}/results`),
        buttonClass: 'bg-green-600 hover:bg-green-700',
        completed: true,
        showPoints: true
      },
      'VENCIDA': {
        text: 'Vencida',
        icon: AlertCircle,
        color: 'bg-red-900/30 text-red-300 border-red-500/30',
        showButton: true,
        buttonText: 'Ver Detalles',
        buttonIcon: Eye,
        buttonAction: () => onGoToTab('evaluaciones', publicacion.Evaluacion?.id),
        buttonClass: 'bg-red-600 hover:bg-red-700'
      }
    };
    return statusConfig[estado] || null;
  };

  const taskStatus = publicacion.tipo === 'TAREA' && userType === 'alumno' ? getTaskAssignmentStatus() : null;
  const evaluationStatus = publicacion.tipo === 'EVALUACION' && userType === 'alumno' ? getEvaluationAssignmentStatus() : null;
  // NUEVO: Función para renderizar el botón de acción
  const renderActionButton = (status) => {
    if (!status?.showButton || !status.buttonAction) return null;

    const ButtonIcon = status.buttonIcon;

    return (
      <button
        onClick={status.buttonAction}
        className={`mt-2 w-full sm:w-auto px-4 py-2 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${status.buttonClass}`}
      >
        <ButtonIcon size={18} />
        {status.buttonText}
      </button>
    );
  };

  // NUEVO: Función para renderizar información de la tarea/evaluación
  const renderAssignmentInfo = () => {
    if (publicacion.tipo === 'TAREA' && publicacion.tareaMaestraId) {
      return (
        <div className="space-y-2">
          {publicacion.planDeClasesTitulo && publicacion.unidadPlanNombre && (
            <p className="text-sm text-gray-500">
              Pertenece a: <span className="font-semibold">{publicacion.planDeClasesTitulo}</span> / 
              Unidad: <span className="font-semibold">{publicacion.unidadPlanNombre}</span>
            </p>
          )}
          {publicacion.tareaMaestra?.fecha_entrega && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Calendar size={16} />
              <span>
                <strong>Fecha de Entrega:</strong> {format(new Date(publicacion.tareaMaestra.fecha_entrega), 'dd/MM/yyyy HH:mm')}
              </span>
            </div>
          )}
          {publicacion.tareaMaestra?.puntos_posibles && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Award size={16} />
              <span>
                <strong>Puntos:</strong> {publicacion.tareaMaestra.puntos_posibles}
              </span>
            </div>
          )}
        </div>
      );
    }

    if (publicacion.tipo === 'EVALUACION' && publicacion.evaluacionAsignacionId) {
      return (
        <div className="space-y-2">
          {publicacion.Evaluacion?.titulo && (
            <p><strong>Evaluación:</strong> {publicacion.Evaluacion.titulo}</p>
          )}
          {publicacion.Evaluacion?.UnidadPlan?.PlanDeClases?.titulo && publicacion.Evaluacion?.UnidadPlan?.periodo && (
            <p className="text-sm text-gray-500">
              Pertenece a: <span className="font-semibold">{publicacion.Evaluacion.UnidadPlan.PlanDeClases.titulo}</span> / 
              Unidad: <span className="font-semibold">{publicacion.Evaluacion.UnidadPlan.periodo}</span>
            </p>
          )}
          {publicacion.Evaluacion?.fecha_entrega && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Calendar size={16} />
              <span>
                <strong>Fecha Límite:</strong> {format(new Date(publicacion.Evaluacion.fecha_entrega), 'dd/MM/yyyy HH:mm')}
              </span>
            </div>
          )}
          {publicacion.Evaluacion?.duracion_minutos && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Clock size={16} />
              <span>
                <strong>Duración:</strong> {publicacion.Evaluacion.duracion_minutos} minutos
              </span>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-4 border border-gray-700 hover:border-gray-600 transition-colors">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h4 className="text-xl font-bold text-white">
              {publicacion.titulo}
            </h4>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              publicacion.tipo === 'TAREA' ? 'bg-blue-900/30 text-blue-300 border border-blue-500/30' :
              publicacion.tipo === 'EVALUACION' ? 'bg-orange-900/30 text-orange-300 border border-orange-500/30' :
              'bg-purple-900/30 text-purple-300 border border-purple-500/30'
            }`}>
              {publicacion.tipo}
            </span>
          </div>
          <p className="text-sm text-gray-400">
            Publicado por {getAuthorName(publicacion)} el {format(new Date(publicacion.created_at), 'dd/MM/yyyy HH:mm')} 
            {catedraNombre && <span> en <span className="font-semibold">{catedraNombre}</span></span>}
          </p>
        </div>
        {isAuthor(publicacion.autorAlumnoId, publicacion.autorDocenteId) && (
          <div className="flex space-x-2">
            <button 
              onClick={() => onEditPublication(publicacion)} 
              className="text-yellow-400 hover:text-yellow-300 p-1 rounded transition-colors" 
              title="Editar Publicación"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button 
              onClick={handleDeletePublicationClick} 
              className="text-red-400 hover:text-red-300 p-1 rounded transition-colors" 
              title="Eliminar Publicación"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="mt-4 text-gray-300">
        <div dangerouslySetInnerHTML={{ __html: publicacion.contenido }}></div>
        
        {/* Información específica de tarea/evaluación */}
        {renderAssignmentInfo()}

        {/* Estado y botones de acción para alumnos */}
        {(taskStatus || evaluationStatus) && (
          <div className={`mt-4 p-4 rounded-lg border ${taskStatus?.color || evaluationStatus?.color}`}>
            <div className="flex items-center gap-2 mb-2">
              {(taskStatus?.icon || evaluationStatus?.icon) && 
                React.createElement(taskStatus?.icon || evaluationStatus?.icon, { size: 20 })
              }
              <span className="font-semibold">{taskStatus?.text || evaluationStatus?.text}</span>
              
              {/* Mostrar check si está completada */}
              {(taskStatus?.completed || evaluationStatus?.completed) && (
                <CheckCircle size={16} className="text-green-400 ml-2" />
              )}
            </div>
            
            {/* Mostrar puntos si está calificada */}
            {(taskStatus?.showPoints || evaluationStatus?.showPoints) && publicacion.calificacion && (
              <div className="flex items-center gap-2 text-sm text-green-300 mb-2">
                <Award size={16} />
                <span>
                  <strong>Calificación:</strong> {publicacion.calificacion} puntos
                </span>
              </div>
            )}

            {/* Botón de acción */}
            {renderActionButton(taskStatus || evaluationStatus)}
          </div>
        )}
      </div>

      {/* Interacciones */}
      <div className="mt-4 flex items-center gap-4 pt-4 border-t border-gray-700">
        <button
          onClick={handleToggleInteraction}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors
            ${publicacion.hasUserInteracted ? 'bg-pink-600 text-white hover:bg-pink-700' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
        >
          <Heart size={16} className={publicacion.hasUserInteracted ? 'fill-white' : 'fill-none'} />
          <span>{publicacion.totalInteracciones || 0}</span>
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
        >
          <MessageSquare size={16} />
          <span>{publicacion.ComentarioPublicacion?.length || 0} Comentario{publicacion.ComentarioPublicacion?.length !== 1 ? 's' : ''}</span>
        </button>
      </div>

      {/* Comentarios */}
      {showComments && (
        <div className="mt-4 space-y-3">
          {publicacion.ComentarioPublicacion?.map(comment => (
            <div key={comment.id} className="bg-gray-700 p-3 rounded-lg flex justify-between items-start">
              <div className="flex-1">
                <p className="text-gray-200 text-sm" dangerouslySetInnerHTML={{ __html: comment.texto }}></p>
                <p className="text-xs text-gray-400 mt-1">
                  {getCommentAuthorName(comment)} el {format(new Date(comment.created_at), 'dd/MM/yyyy HH:mm')}
                </p>
              </div>
              {isAuthor(comment.autorAlumnoId, comment.autorDocenteId) && (
                <button 
                  onClick={() => handleDeleteCommentClick(comment.id)} 
                  className="text-red-400 hover:text-red-300 ml-4 p-1 rounded transition-colors" 
                  title="Eliminar Comentario"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          ))}
          <ComentarioForm 
            publicacionId={publicacion.id} 
            onSubmit={handleAddCommentSubmit} 
            loading={commentLoading} 
            userId={userId} 
            userType={userType} 
          />
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
  onGoToTaskTab: PropTypes.func,
  onGoToTab: PropTypes.func,
  catedraNombre: PropTypes.string,
  getStatusColor: PropTypes.func,
  getTaskStatusDisplay: PropTypes.func,
};

export default PublicacionCard;