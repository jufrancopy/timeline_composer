import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import {
  ArrowLeft, BookOpen, FileText, Brain, MessageSquare,
  CheckCircle, Clock, AlertCircle, Calendar, User,
  Plus, Edit3, Trash2, TrendingUp, Award, Target, X
} from 'lucide-react';
import PublicacionCard from '../components/PublicacionCard';
import PublicacionForm from '../components/PublicacionForm';
import TaskTable from '../components/TaskTable';
import EvaluationTable from '../components/EvaluationTable';
import Modal from '../components/Modal';

const AlumnoCatedraDetailPage = () => {
  const { catedraId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [catedra, setCatedra] = useState(null);
  const [activeTab, setActiveTab] = useState('tablon');
  const [currentAlumnoId, setCurrentAlumnoId] = useState(null);
  const location = useLocation();

  // Estados para Tablón
  const [publicaciones, setPublicaciones] = useState([]);
  const [isPublicacionModalOpen, setIsPublicacionModalOpen] = useState(false);
  const [editingPublicacion, setEditingPublicacion] = useState(null);
  const [publicationLoading, setPublicationLoading] = useState(false);

  // Estados para Tareas - MODIFICADO PARA MÚLTIPLES ARCHIVOS
  const [tareas, setTareas] = useState([]);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [taskToSubmit, setTaskToSubmit] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]); // CAMBIO: Array en lugar de un solo archivo

  // Estados para Evaluaciones
  const [evaluaciones, setEvaluaciones] = useState([]);

  const handleGoToTaskTab = (catedraId, taskId) => {
    handleGoToTab('tareas', taskId);
  };

  // Stats
  const [stats, setStats] = useState({
    totalPublicaciones: 0,
    totalTareas: 0,
    tareasPendientes: 0,
    tareasCompletadas: 0,
    totalEvaluaciones: 0,
    evaluacionesPendientes: 0,
    evaluacionesCompletadas: 0
  });

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        setCurrentAlumnoId(decoded.alumnoId);
      } catch (err) {
        console.error('Error decoding token:', err);
      }
    }

    // Check for state from navigation
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }

    fetchCatedraData();
  }, [catedraId, location.state]);

  // Handlers para Tareas - MODIFICADO PARA MÚLTIPLES ARCHIVOS
  const handleOpenSubmitModal = (task) => {
    setTaskToSubmit(task);
    setSelectedFiles([]); // CAMBIO: Limpiar array de archivos
    setIsSubmitModalOpen(true);
  };

  // NUEVO: Handler para múltiples archivos
  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);
  };

  // NUEVO: Handler para eliminar un archivo específico
  const handleRemoveFile = (indexToRemove) => {
    setSelectedFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
  };

  // Handlers para Publicaciones
  const handleInteractToggle = async (publicacionId, alumnoId) => {
    console.log(`Interactuando con publicación ${publicacionId} por alumno ${alumnoId}`);
    // Implementar lógica de interacción (like/unlike, etc.)
  };

  const handleGoToTab = (tabName, idToHighlight = null) => {
    setActiveTab(tabName);
    if (idToHighlight) {
      navigate(location.pathname, { replace: true, state: { ...location.state, highlightId: idToHighlight, activeTab: tabName } });
    } else {
      // If no ID to highlight, ensure previous highlight is cleared from state
      navigate(location.pathname, { replace: true, state: { ...location.state, highlightId: undefined, activeTab: tabName } });
    }
  };

  useEffect(() => {
    if (!loading && catedra && location.state?.highlightId && location.state?.activeTab === 'tareas') {
      const taskToHighlightId = location.state.highlightId;
      const task = tareas.find(t => t.id === taskToHighlightId);
      if (task) {
        handleOpenSubmitModal(task);
      }
      navigate(location.pathname, { replace: true, state: { ...location.state, highlightId: undefined } });
    } else if (!loading && catedra && location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
      // Clear activeTab from state after setting it to prevent re-triggering on subsequent renders
      navigate(location.pathname, { replace: true, state: { ...location.state, activeTab: undefined } });
    }
  }, [loading, catedra, tareas, location.state?.highlightTask]);

  const fetchCatedraData = async () => {
    // Validación mejorada del catedraId
    const parsedCatedraId = parseInt(catedraId);

    console.log('Raw catedraId from params:', catedraId);
    console.log('Parsed catedraId:', parsedCatedraId);

    if (!catedraId || isNaN(parsedCatedraId) || parsedCatedraId <= 0) {
      console.error('Invalid catedraId:', catedraId);
      toast.error('ID de cátedra inválido.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching data for catedraId:', parsedCatedraId);

      // Fetch info de la cátedra
      const studentCatedrasResponse = await api.getStudentCatedras();
      const studentCatedras = studentCatedrasResponse.data;

      console.log('Student catedras:', studentCatedras);

      // Buscar la cátedra usando catedraId
      const foundCatedraRaw = studentCatedras.find(c => {
        // Intentar con ambos campos por si acaso
        return c.catedraId === parsedCatedraId || c.id === parsedCatedraId;
      });

      if (foundCatedraRaw) {
        // Normalizar la estructura
        setCatedra({
          ...foundCatedraRaw,
          id: foundCatedraRaw.catedraId || foundCatedraRaw.id
        });
        console.log('Catedra found:', foundCatedraRaw);
      } else {
        setCatedra(null);
        console.log('Catedra not found for ID:', parsedCatedraId);
        toast.error('Cátedra no encontrada');
        setLoading(false);
        return;
      }

      // Fetch publicaciones de esta cátedra
      const pubResponse = await api.getPublicaciones(parsedCatedraId);
      const pubs = pubResponse.data.sort((a, b) =>
        new Date(b.created_at) - new Date(a.created_at)
      );
      setPublicaciones(pubs);
      console.log('Publicaciones fetched:', pubs);

      // Fetch tareas del alumno
      const tareasResponse = await api.getAlumnoTareas();
      const tareasCatedra = tareasResponse.data.filter(
        t => t.TareaMaestra?.Catedra?.id === parsedCatedraId
      );
      setTareas(tareasCatedra);
      console.log('Tareas fetched and filtered:', tareasCatedra);

      // Fetch evaluaciones del alumno
      const evalsResponse = await api.getMyEvaluations();
      const allEvals = evalsResponse.data;
      const evalsCatedra = allEvals.filter(
        e => e.Catedra?.id === parsedCatedraId
      );
      setEvaluaciones(evalsCatedra);
      console.log('Evaluaciones fetched:', evalsCatedra);
      console.log('First evaluation in evalsCatedra:', evalsCatedra[0]);

      // Enriquecer publicaciones con el estado de la asignación de evaluación si es de tipo EVALUACION
      const enrichedPubs = pubs.map(pub => {
        if (pub.tipo === 'EVALUACION' && pub.evaluacionAsignacionId) {
          const assignedEval = allEvals.find(e => e.id === pub.evaluacionAsignacionId);
          if (assignedEval) {
            return { ...pub, evaluacionAsignacionEstado: assignedEval.estado };
          }
        }
        return pub;
      });
      setPublicaciones(enrichedPubs);

      // Calcular stats
      const tareasPendientes = tareasCatedra.filter(
        t => t.estado === 'ASIGNADA' || (t.estado === 'VENCIDA' && !t.submission_path)
      ).length;
      const tareasCompletadas = tareasCatedra.filter(
        t => t.estado === 'CALIFICADA'
      ).length;
      const getEstadoForStats = (evaluacion) => {
        if (evaluacion.EvaluacionAsignacion && evaluacion.EvaluacionAsignacion.length > 0) {
          return evaluacion.EvaluacionAsignacion[0].estado;
        }
        return evaluacion.estado || 'PENDIENTE';
      };

      const evaluacionesPendientes = evalsCatedra.filter(
        e => {
          const estado = getEstadoForStats(e);
          return estado === 'PENDIENTE' || estado === 'VENCIDA';
        }
      ).length;
      const evaluacionesCompletadas = evalsCatedra.filter(
        e => {
          const estado = getEstadoForStats(e);
          return estado === 'REALIZADA' || estado === 'CALIFICADA';
        }
      ).length;

      setStats({
        totalPublicaciones: pubs.length,
        totalTareas: tareasCatedra.length,
        tareasPendientes,
        tareasCompletadas,
        totalEvaluaciones: evalsCatedra.length,
        evaluacionesPendientes,
        evaluacionesCompletadas
      });

    } catch (err) {
      console.error('Error fetching cátedra data:', err);
      toast.error('Error al cargar los datos de la cátedra');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePublicacion = async (publicacionData) => {
    try {
      setPublicationLoading(true);
      await api.createPublicacion(parseInt(catedraId), publicacionData);
      toast.success('Publicación creada exitosamente');
      setIsPublicacionModalOpen(false);
      fetchCatedraData();
    } catch (error) {
      console.error('Error al crear publicación:', error);
      toast.error('Error al crear la publicación');
    } finally {
      setPublicationLoading(false);
    }
  };

  const handleEditPublicacion = async (publicacionData) => {
    try {
      setPublicationLoading(true);
      await api.updatePublicacion(editingPublicacion.id, publicacionData);
      toast.success('Publicación actualizada exitosamente');
      setIsPublicacionModalOpen(false);
      setEditingPublicacion(null);
      fetchCatedraData();
    } catch (error) {
      console.error('Error al actualizar publicación:', error);
      toast.error('Error al actualizar la publicación');
    } finally {
      setPublicationLoading(false);
    }
  };

  const handleDeletePublicacion = async (publicacionId) => {
    if (!window.confirm('¿Estás seguro de eliminar esta publicación?')) return;

    try {
      await api.deletePublicacion(publicacionId);
      toast.success('Publicación eliminada');
      fetchCatedraData();
    } catch (error) {
      console.error('Error al eliminar publicación:', error);
      toast.error('Error al eliminar la publicación');
    }
  };

  const handleAddComment = async (publicacionId, comentario) => {
    try {
      await api.addComment(publicacionId, comentario);
      toast.success('Comentario agregado');
      fetchCatedraData();
    } catch (error) {
      console.error('Error al agregar comentario:', error);
      toast.error('Error al agregar el comentario');
    }
  };

  const handleDeleteComment = async (comentarioId) => {
    try {
      await api.deleteComment(comentarioId);
      toast.success('Comentario eliminado');
      fetchCatedraData();
    } catch (error) {
      console.error('Error al eliminar comentario:', error);
      toast.error('Error al eliminar el comentario');
    }
  };

  // MODIFICADO: Handler para enviar múltiples archivos
  const handleSubmitDelivery = async () => {
    if (selectedFiles.length === 0 || !taskToSubmit) {
      toast.error('Por favor selecciona al menos un archivo');
      return;
    }

    try {
      setLoading(true);
      
      // DEBUG: Ver la estructura completa de la tarea
      console.log('=== DEBUG TASK SUBMIT ===');
      console.log('Full taskToSubmit object:', taskToSubmit);
      console.log('taskToSubmit.id:', taskToSubmit.id);
      console.log('taskToSubmit.tareaId:', taskToSubmit.tareaId);
      console.log('taskToSubmit.TareaMaestraId:', taskToSubmit.TareaMaestraId);
      console.log('taskToSubmit.TareaMaestra?.id:', taskToSubmit.TareaMaestra?.id);
      console.log('Selected files:', selectedFiles);
      console.log('========================');
      
      // La función api.submitTaskDelivery espera (tareaAsignacionId, files[])
      // donde files es un array de archivos
      await api.submitTaskDelivery(taskToSubmit.id, selectedFiles);

      toast.success(`${selectedFiles.length} archivo(s) subido(s) exitosamente`);
      setIsSubmitModalOpen(false);
      setSelectedFiles([]);
      fetchCatedraData();
    } catch (error) {
      console.error('Error al subir entrega:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Error al subir la entrega');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'PENDING_REVIEW': 'bg-yellow-900/20 text-yellow-300 border-yellow-500/30',
      'PUBLISHED': 'bg-green-900/20 text-green-300 border-green-500/30',
      'REJECTED': 'bg-red-900/20 text-red-300 border-red-500/30',
      'NEEDS_IMPROVEMENT': 'bg-blue-900/20 text-blue-300 border-blue-500/30',
      'ASIGNADA': 'bg-blue-900/20 text-blue-300 border-blue-500/30',
      'ENTREGADA': 'bg-purple-900/20 text-purple-300 border-purple-500/30',
      'CALIFICADA': 'bg-green-900/20 text-green-300 border-green-500/30',
      'VENCIDA': 'bg-red-900/20 text-red-300 border-red-500/30'
    };
    return colors[status] || 'bg-slate-900/20 text-slate-300 border-slate-500/30';
  };

  const getTaskStatusDisplay = (task) => {
    if (task.estado === 'CALIFICADA') return 'Calificada';
    if (task.estado === 'ENTREGADA') return 'Entregada';
    if (task.estado === 'VENCIDA') return task.submission_path ? 'Vencida (Entregada)' : 'Vencida';
    if (task.estado === 'ASIGNADA') return 'Asignada';
    return task.estado || 'Desconocido';
  };

  // NUEVO: Función para formatear tamaño de archivo
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-purple-600/30 rounded-full animate-spin border-t-purple-500"></div>
          </div>
          <p className="text-slate-300 text-lg font-medium">Cargando cátedra...</p>
        </div>
      </div>
    );
  }

  if (!catedra) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Cátedra no encontrada</h2>
          <p className="text-slate-400 mb-4">No se pudo cargar la información de la cátedra.</p>
          <button
            onClick={() => navigate('/alumnos/dashboard')}
            className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header con info de la cátedra */}
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 sm:p-8">
          <button
            onClick={() => navigate('/alumnos/dashboard')}
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            Volver al Dashboard
          </button>

          <div className="flex items-start gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center flex-shrink-0">
              <BookOpen className="text-white" size={36} />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                Cátedra: {catedra.Catedra?.nombre || 'Nombre no disponible'}
              </h1>
              <div className="flex flex-wrap gap-4 text-slate-400">
                <div className="flex items-center gap-2">
                  <Calendar size={18} />
                  <span>Año {catedra.Catedra?.anio || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User size={18} />
                  <span>{catedra.Catedra?.institucion || 'Institución no especificada'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-8">
            <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-4">
              <MessageSquare className="text-purple-400 mb-2" size={24} />
              <p className="text-slate-400 text-xs">Publicaciones</p>
              <p className="text-white text-2xl font-bold">{stats.totalPublicaciones}</p>
            </div>
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
              <FileText className="text-blue-400 mb-2" size={24} />
              <p className="text-slate-400 text-xs">Total Tareas</p>
              <p className="text-white text-2xl font-bold">{stats.totalTareas}</p>
            </div>
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-4">
              <Clock className="text-yellow-400 mb-2" size={24} />
              <p className="text-slate-400 text-xs">Pendientes</p>
              <p className="text-white text-2xl font-bold">{stats.tareasPendientes}</p>
            </div>
            <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4">
              <CheckCircle className="text-green-400 mb-2" size={24} />
              <p className="text-slate-400 text-xs">Completadas</p>
              <p className="text-white text-2xl font-bold">{stats.tareasCompletadas}</p>
            </div>
            <div className="bg-orange-900/20 border border-orange-500/30 rounded-xl p-4">
              <Brain className="text-orange-400 mb-2" size={24} />
              <p className="text-slate-400 text-xs">Eval. Pend.</p>
              <p className="text-white text-2xl font-bold">{stats.evaluacionesPendientes}</p>
            </div>
            <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-xl p-4">
              <Award className="text-emerald-400 mb-2" size={24} />
              <p className="text-slate-400 text-xs">Eval. Hechas</p>
              <p className="text-white text-2xl font-bold">{stats.evaluacionesCompletadas}</p>
            </div>
          </div>
        </div>

        {/* Pestañas */}
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-800/50 to-slate-800/30 border-b border-slate-700/50">
            <nav className="flex space-x-4 overflow-x-auto px-4 sm:space-x-8 sm:px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('tablon')}
                className={`${activeTab === 'tablon'
                    ? 'border-emerald-400 text-emerald-300 bg-emerald-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'
                  } group flex items-center gap-2 whitespace-nowrap py-4 px-3 border-b-2 font-medium text-lg transition-all duration-300 rounded-t-lg`}
              >
                <MessageSquare size={20} />
                Tablón de Anuncios
                {stats.totalPublicaciones > 0 && (
                  <span className="ml-2 bg-emerald-600/20 text-emerald-300 px-2 py-1 rounded-full text-xs font-semibold border border-emerald-500/30">
                    {stats.totalPublicaciones}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('tareas')}
                className={`${activeTab === 'tareas'
                    ? 'border-emerald-400 text-emerald-300 bg-emerald-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'
                  } group flex items-center gap-2 whitespace-nowrap py-4 px-3 border-b-2 font-medium text-lg transition-all duration-300 rounded-t-lg`}
              >
                <FileText size={20} />
                Tareas
                {stats.totalTareas > 0 && (
                  <span className="ml-2 bg-yellow-600/20 text-yellow-300 px-2 py-1 rounded-full text-xs font-semibold border border-yellow-500/30">
                    {stats.totalTareas}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('evaluaciones')}
                className={`${activeTab === 'evaluaciones'
                    ? 'border-emerald-400 text-emerald-300 bg-emerald-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'
                  } group flex items-center gap-2 whitespace-nowrap py-4 px-3 border-b-2 font-medium text-lg transition-all duration-300 rounded-t-lg`}
              >
                <Brain size={20} />
                Evaluaciones
                {stats.totalEvaluaciones > 0 && (
                  <span className="ml-2 bg-orange-600/20 text-orange-300 px-2 py-1 rounded-full text-xs font-semibold border border-orange-500/30">
                    {stats.totalEvaluaciones}
                  </span>
                )}
              </button>
            </nav>
          </div>

          {/* Contenido de las pestañas */}
          <div className="p-6">
            {/* TAB: Tablón de Anuncios */}
            {activeTab === 'tablon' && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white">Tablón de Anuncios</h3>
                    <p className="text-slate-400">Novedades y anuncios de esta cátedra</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingPublicacion(null);
                      setIsPublicacionModalOpen(true);
                    }}
                    className="group inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-xl transition-all duration-300 shadow-lg shadow-green-900/25 hover:shadow-xl hover:shadow-green-900/40 hover:scale-105"
                  >
                    <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                    <span>Nueva Publicación</span>
                  </button>
                </div>

                {publicaciones.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-4 bg-slate-800/50 rounded-full flex items-center justify-center">
                      <MessageSquare className="text-slate-500" size={32} />
                    </div>
                    <p className="text-slate-400 text-lg font-medium">No hay publicaciones aún</p>
                    <p className="text-slate-500 text-sm mt-1">Sé el primero en publicar algo</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {publicaciones.map(pub => (
                      <PublicacionCard
                        key={pub.id}
                        publicacion={pub}
                        onAddComment={handleAddComment}
                        onDeletePublication={handleDeletePublicacion}
                        onDeleteComment={handleDeleteComment}
                        onEditPublication={() => {
                          setEditingPublicacion(pub);
                          setIsPublicacionModalOpen(true);
                        }}
                        onInteractToggle={handleInteractToggle}
                        userType="alumno"
                        userId={currentAlumnoId}
                        onGoToTaskTab={handleGoToTaskTab}
                        onGoToTab={handleGoToTab}
                        getStatusColor={getStatusColor}
                        getTaskStatusDisplay={getTaskStatusDisplay}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: Tareas */}
            {activeTab === 'tareas' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Tareas de la Cátedra</h3>
                  <p className="text-slate-400">Gestiona tus asignaciones y entregas</p>
                </div>

                {tareas.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-4 bg-slate-800/50 rounded-full flex items-center justify-center">
                      <FileText className="text-slate-500" size={32} />
                    </div>
                    <p className="text-slate-400 text-lg font-medium">No hay tareas en esta cátedra</p>
                  </div>
                ) : (
                  <>
                    <TaskTable
                      title="Pendientes de Entrega"
                      tasks={tareas.filter(t => t.estado === 'ASIGNADA' || (t.estado === 'VENCIDA' && !t.submission_path))}
                      getStatusColor={getStatusColor}
                      getTaskStatusDisplay={getTaskStatusDisplay}
                      handleOpenSubmitModal={handleOpenSubmitModal}
                      showActions={true}
                    />
                    <TaskTable
                      title="Entregadas (Pendiente de Corrección)"
                      tasks={tareas.filter(t => t.estado === 'ENTREGADA' || (t.estado === 'VENCIDA' && t.submission_path))}
                      getStatusColor={getStatusColor}
                      getTaskStatusDisplay={getTaskStatusDisplay}
                      showActions={false}
                    />
                    <TaskTable
                      title="Calificadas"
                      tasks={tareas.filter(t => t.estado === 'CALIFICADA')}
                      getStatusColor={getStatusColor}
                      getTaskStatusDisplay={getTaskStatusDisplay}
                      showActions={false}
                      showPoints={true}
                    />
                  </>
                )}
              </div>
            )}

            {/* TAB: Evaluaciones */}
            {activeTab === 'evaluaciones' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Evaluaciones de la Cátedra</h3>
                  <p className="text-slate-400">Completa tus evaluaciones y revisa resultados</p>
                </div>

                {evaluaciones.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-4 bg-slate-800/50 rounded-full flex items-center justify-center">
                      <Brain className="text-slate-500" size={32} />
                    </div>
                    <p className="text-slate-400 text-lg font-medium">No hay evaluaciones en esta cátedra</p>
                  </div>
                ) : (
                  <>
                    {/* Helper function para obtener el estado */}
                    {(() => {
                      const getEstado = (evaluacion) => {
                        if (evaluacion.EvaluacionAsignacion && evaluacion.EvaluacionAsignacion.length > 0) {
                          return evaluacion.EvaluacionAsignacion[0].estado;
                        }
                        return evaluacion.estado || 'PENDIENTE';
                      };

                      // Filtrar evaluaciones pendientes (PENDIENTE o VENCIDA)
                      const pendientes = evaluaciones.filter(e => {
                        const estado = getEstado(e);
                        return estado === 'PENDIENTE' || estado === 'VENCIDA';
                      });

                      // Filtrar evaluaciones completadas (REALIZADA o CALIFICADA)
                      const completadas = evaluaciones.filter(e => {
                        const estado = getEstado(e);
                        return estado === 'REALIZADA' || estado === 'CALIFICADA';
                      });

                      return (
                        <>
                          <EvaluationTable
                            title="Pendientes"
                            evaluations={pendientes}
                            getStatusColor={getStatusColor}
                            showActions={true}
                          />
                          <EvaluationTable
                            title="Completadas"
                            evaluations={completadas}
                            getStatusColor={getStatusColor}
                          />
                        </>
                      );
                    })()}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modales */}
      <Modal
        isOpen={isPublicacionModalOpen}
        onClose={() => {
          setIsPublicacionModalOpen(false);
          setEditingPublicacion(null);
        }}
        title={editingPublicacion ? "Editar Publicación" : "Nueva Publicación"}
        showSubmitButton={false}
        showCancelButton={false}
      >
        <PublicacionForm
          catedraId={parseInt(catedraId)}
          onSubmit={editingPublicacion ? handleEditPublicacion : handleCreatePublicacion}
          initialData={editingPublicacion || {}}
          isEditMode={!!editingPublicacion}
          loading={publicationLoading}
          onCancel={() => {
            setIsPublicacionModalOpen(false);
            setEditingPublicacion(null);
          }}
          availableCatedras={[catedra]}
        />
      </Modal>

      {/* MODAL MODIFICADO PARA MÚLTIPLES ARCHIVOS */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => {
          setIsSubmitModalOpen(false);
          setSelectedFiles([]);
        }}
        title="Subir Entrega"
        onSubmit={handleSubmitDelivery}
        submitText="Subir Entrega"
        submitDisabled={selectedFiles.length === 0 || loading}
      >
        <div className="p-6 space-y-6">
          {/* Información de la tarea */}
          <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-xl p-5 border border-purple-500/30 space-y-3">
            <h3 className="text-xl font-bold text-purple-300 flex items-center gap-2">
              <FileText size={24} />
              {taskToSubmit?.TareaMaestra?.titulo}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-slate-300">
                <BookOpen size={16} className="text-emerald-400" />
                <span><strong>Cátedra:</strong> {taskToSubmit?.TareaMaestra?.Catedra?.nombre || 'N/A'}</span>
              </div>
              
              {taskToSubmit?.TareaMaestra?.UnidadPlan?.PlanDeClases?.titulo && (
                <div className="flex items-center gap-2 text-slate-300">
                  <BookOpen size={16} className="text-blue-400" />
                  <span><strong>Plan:</strong> {taskToSubmit.TareaMaestra.UnidadPlan.PlanDeClases.titulo}</span>
                </div>
              )}
              
              {taskToSubmit?.TareaMaestra?.UnidadPlan?.periodo && (
                <div className="flex items-center gap-2 text-slate-300">
                  <Target size={16} className="text-purple-400" />
                  <span><strong>Unidad:</strong> {taskToSubmit.TareaMaestra.UnidadPlan.periodo}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-slate-300">
                <Calendar size={16} className="text-yellow-400" />
                <span><strong>Vence:</strong> {taskToSubmit?.TareaMaestra?.fecha_entrega ? new Date(taskToSubmit.TareaMaestra.fecha_entrega).toLocaleDateString() : 'N/A'}</span>
              </div>
              
              <div className="flex items-center gap-2 text-slate-300">
                <Award size={16} className="text-green-400" />
                <span><strong>Puntos:</strong> {taskToSubmit?.TareaMaestra?.puntos_posibles || 0}</span>
              </div>
            </div>

            {taskToSubmit?.TareaMaestra?.descripcion && (
              <div className="pt-3 border-t border-slate-700/50">
                <p className="text-xs text-slate-400 mb-1 font-semibold">Descripción:</p>
                <div 
                  className="text-sm text-slate-300 max-h-32 overflow-y-auto prose prose-sm prose-invert"
                  dangerouslySetInnerHTML={{ __html: taskToSubmit.TareaMaestra.descripcion }}
                />
              </div>
            )}
          </div>

          {/* Sección de carga de archivos - MODIFICADA PARA MÚLTIPLES */}
          <div className="bg-slate-800/30 rounded-xl p-5 border border-slate-700/50 space-y-4">
            <p className="text-slate-300 font-medium flex items-center gap-2">
              <FileText size={20} className="text-purple-400" />
              Selecciona los archivos para tu entrega
            </p>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="w-full p-3 border border-slate-600/50 rounded-xl bg-slate-700/50 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-700 transition-colors cursor-pointer"
            />
            
            {/* Lista de archivos seleccionados */}
            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-slate-400 font-medium">
                  {selectedFiles.length} archivo(s) seleccionado(s):
                </p>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedFiles.map((file, index) => (
                    <div 
                      key={index}
                      className="p-3 bg-green-900/20 border border-green-500/30 rounded-lg flex items-center justify-between gap-3 animate-in fade-in duration-200"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <CheckCircle size={18} className="text-green-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-green-300 font-medium truncate">{file.name}</p>
                          <p className="text-green-400/70 text-xs">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className="p-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/40 text-red-400 hover:text-red-300 transition-colors flex-shrink-0"
                        title="Eliminar archivo"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-slate-700/50">
                  <p className="text-sm text-slate-400">
                    <strong>Tamaño total:</strong> {formatFileSize(selectedFiles.reduce((acc, file) => acc + file.size, 0))}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Alerta informativa */}
          <div className="flex items-start gap-3 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <AlertCircle size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-slate-300">
              <p className="font-medium text-blue-300 mb-1">Importante:</p>
              <p>Asegúrate de que todos los archivos sean correctos antes de subirlos. Una vez enviados, no podrás modificar tu entrega sin la autorización del docente.</p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AlumnoCatedraDetailPage;