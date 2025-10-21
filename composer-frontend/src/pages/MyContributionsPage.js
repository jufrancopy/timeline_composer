import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { jwtDecode } from 'jwt-decode';
import Modal from '../components/Modal';
import AddComposerForm from '../components/AddComposerForm';
import TaskTable from '../components/TaskTable';
import EvaluationTable from '../components/EvaluationTable';
import PublicacionForm from '../components/PublicacionForm';
import PublicacionCard from '../components/PublicacionCard';
import { 
  Mail, 
  Shield, 
  LogOut, 
  Star, 
  Award, 
  TrendingUp,
  FileText, 
  Brain, 
  MessageSquare,
  Plus,
  Edit3,
  CheckCircle,
  Clock,
  AlertCircle,
  Target,
  BookOpen,
  Users,
  Zap,
  Crown,
  Trophy,
  Medal,
  Sparkles
} from 'lucide-react';

// Helper function for gamification level
const getContributorLevel = (score) => {
  if (score >= 100) return { level: 'Nivel 6: Guardián del Patrimonio', color: 'from-yellow-400 to-orange-500', icon: Crown };
  if (score >= 50) return { level: 'Nivel 5: Curador de la Memoria Sonora', color: 'from-purple-400 to-pink-500', icon: Trophy };
  if (score >= 20) return { level: 'Nivel 4: Investigador Musical', color: 'from-blue-400 to-cyan-500', icon: Medal };
  if (score >= 10) return { level: 'Nivel 3: Colaborador Avanzado', color: 'from-green-400 to-emerald-500', icon: Award };
  if (score >= 5) return { level: 'Nivel 2: Colaborador Activo', color: 'from-indigo-400 to-purple-500', icon: Star };
  if (score >= 1) return { level: 'Nivel 1: Colaborador Inicial', color: 'from-cyan-400 to-blue-500', icon: Sparkles };
  return { level: 'Nivel 0: Explorador', color: 'from-gray-400 to-slate-500', icon: Target };
};

function MyContributionsPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [contributions, setContributions] = useState([]);
  const [studentTasks, setStudentTasks] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [userLevel, setUserLevel] = useState({});
  const [userScore, setUserScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentEditingContribution, setCurrentEditingContribution] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [taskToSubmit, setTaskToSubmit] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [activeTab, setActiveTab] = useState(contributions.length > 0 ? 'aportes' : 'tablon');
  const [publicaciones, setPublicaciones] = useState([]);
  const [studentCatedras, setStudentCatedras] = useState([]);
  const [currentAlumnoId, setCurrentAlumnoId] = useState(null);
  const [isPublicacionModalOpen, setIsPublicacionModalOpen] = useState(false);
  const [editingPublicacion, setEditingPublicacion] = useState(null);
  const [publicationLoading, setPublicationLoading] = useState(false);

  // Stats para el dashboard
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingEvaluations: 0,
    totalPublications: 0,
    totalContributions: 0
  });

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (token) {
      setLoggedIn(true);
      try {
        const decoded = jwtDecode(token);
        setCurrentAlumnoId(decoded.alumnoId);
      } catch (decodeError) {
        console.error('Error decoding user token:', decodeError);
        handleLogout();
      }
      fetchData(token);
    }
  }, []);

  const fetchData = async (token) => {
    setLoading(true);
    setError(null);
    try {
      const [alumnoMeResponse, contribResponse, evalsResponse, catedrasResponse] = await Promise.all([
        api.getAlumnoMe(),
        api.getMyStudentContributions().catch(err => {
          console.warn('No se pudieron cargar las contribuciones:', err);
          return { data: [] };
        }),
        api.getMyEvaluations().catch(err => {
          console.warn('No se pudieron cargar las evaluaciones:', err);
          return { data: [] };
        }),
        api.getStudentCatedras(token).catch(err => {
          console.warn('No se pudieron cargar las cátedras del alumno:', err);
          return { data: [] };
        }),
      ]);

      const userData = alumnoMeResponse.data;
      const contributionsData = contribResponse.data;
      const evaluationsData = evalsResponse.data;
      const studentCatedrasData = catedrasResponse.data;

      // Fetch publications for each enrolled catedra
      const allPublicaciones = [];
      for (const inscripcion of studentCatedrasData) {
        try {
          if (inscripcion.catedraId) {
            const pubResponse = await api.getPublicaciones(inscripcion.catedraId);
            allPublicaciones.push(...pubResponse.data.map(pub => ({ 
              ...pub, 
              catedraNombre: inscripcion.catedra.nombre 
            })));
          }
        } catch (pubError) {
          console.warn(`Error fetching publications for catedra ${inscripcion.catedraId}:`, pubError);
        }
      }

      // Calcular estadísticas
      const tasks = userData.tareas || [];
      const completedTasks = tasks.filter(t => t.estado === 'CALIFICADA').length;
      const pendingEvals = evaluationsData.filter(e => !e.realizada).length;
      
      setStats({
        totalTasks: tasks.length,
        completedTasks,
        pendingEvaluations: pendingEvals,
        totalPublications: allPublicaciones.length,
        totalContributions: contributionsData.length
      });

      setContributions(contributionsData);
      setStudentTasks(tasks);
      setUserScore(userData.totalPuntos || 0);
      setUserLevel(getContributorLevel(userData.totalPuntos || 0));
      setEvaluations(evaluationsData);
      setStudentCatedras(studentCatedrasData);
      setPublicaciones(allPublicaciones.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));

      if (pendingEvals > 0) {
        toast.custom((t) => (
          <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-gradient-to-r from-yellow-600 to-orange-600 shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-yellow-500/30 backdrop-blur-xl border border-yellow-400/20`}>
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-yellow-200" />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-white">
                    Evaluaciones Pendientes
                  </p>
                  <p className="mt-1 text-sm text-yellow-100">
                    Tienes {pendingEvals} evaluación{pendingEvals !== 1 ? 'es' : ''} pendiente{pendingEvals !== 1 ? 's' : ''} de completar
                  </p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-yellow-400/20">
              <button
                onClick={() => {
                  setActiveTab('evaluaciones');
                  toast.dismiss(t.id);
                }}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-yellow-100 hover:text-white hover:bg-yellow-700/50 transition-colors"
              >
                Ver
              </button>
            </div>
          </div>
        ), {
          duration: 5000,
          position: 'top-right',
        });
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Error al cargar los datos');
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (contribution) => {
    setCurrentEditingContribution(contribution);
    setIsEditModalOpen(true);
  };

  const handleResubmit = async (updatedData) => {
    try {
      const token = localStorage.getItem('userToken');
      await api.updateContribution(currentEditingContribution.id, updatedData);
      toast.success('Aporte reenviado exitosamente');
      setIsEditModalOpen(false);
      fetchData(token);
    } catch (error) {
      console.error('Error al reenviar aporte:', error);
      toast.error('Error al reenviar el aporte');
    }
  };

  const handleOpenSubmitModal = (task) => {
    setTaskToSubmit(task);
    setSelectedFile(null);
    setIsSubmitModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };

  const handleSubmitDelivery = async () => {
    if (!selectedFile || !taskToSubmit) {
      toast.error('Por favor selecciona un archivo');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);

      await api.submitTask(taskToSubmit.id, formData);
      toast.success('Entrega subida exitosamente');
      setIsSubmitModalOpen(false);
      setSelectedFile(null);

      const token = localStorage.getItem('userToken');
      fetchData(token);
    } catch (error) {
      console.error('Error al subir entrega:', error);
      toast.error('Error al subir la entrega');
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
    return task.estado;
  };

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    setLoggedIn(false);
    setContributions([]);
    setStudentTasks([]);
    setEvaluations([]);
    setPublicaciones([]);
    toast.success('Sesión cerrada');
  };

  const openPublicacionModal = (publicacion = null) => {
    setEditingPublicacion(publicacion);
    setIsPublicacionModalOpen(true);
  };

  const handleCreatePublicacion = async (publicacionData) => {
    try {
      setPublicationLoading(true);
      await api.createPublicacion(publicacionData);
      toast.success('Publicación creada exitosamente');
      setIsPublicacionModalOpen(false);

      const token = localStorage.getItem('userToken');
      fetchData(token);
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

      const token = localStorage.getItem('userToken');
      fetchData(token);
    } catch (error) {
      console.error('Error al actualizar publicación:', error);
      toast.error('Error al actualizar la publicación');
    } finally {
      setPublicationLoading(false);
    }
  };

  const handleDeletePublicacion = async (publicacionId) => {
    const result = await Swal.fire({
      title: '¿Eliminar publicación?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await api.deletePublicacion(publicacionId);
        toast.success('Publicación eliminada');
        const token = localStorage.getItem('userToken');
        fetchData(token);
      } catch (error) {
        console.error('Error al eliminar publicación:', error);
        toast.error('Error al eliminar la publicación');
      }
    }
  };

  const handleAddComment = async (publicacionId, comentario) => {
    try {
      await api.addComment(publicacionId, comentario);
      toast.success('Comentario agregado');
      const token = localStorage.getItem('userToken');
      fetchData(token);
    } catch (error) {
      console.error('Error al agregar comentario:', error);
      toast.error('Error al agregar el comentario');
    }
  };

  const handleDeleteComment = async (comentarioId) => {
    try {
      await api.deleteComment(comentarioId);
      toast.success('Comentario eliminado');
      const token = localStorage.getItem('userToken');
      fetchData(token);
    } catch (error) {
      console.error('Error al eliminar comentario:', error);
      toast.error('Error al eliminar el comentario');
    }
  };

  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">Iniciar Sesión</h2>
          <p className="text-slate-400 text-center mb-6">Accede a tu panel de contribuciones</p>
          {/* Aquí iría tu formulario de login */}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header con información del usuario */}
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-20 h-20 rounded-full bg-gradient-to-r ${userLevel.color} flex items-center justify-center`}>
                {userLevel.icon && <userLevel.icon className="text-white" size={36} />}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">{userLevel.level}</h1>
                <p className="text-slate-400">Puntos totales: <span className="text-purple-400 font-semibold">{userScore}</span></p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600/20 text-red-300 hover:bg-red-600/30 rounded-lg transition-all"
            >
              <LogOut size={20} />
              Cerrar Sesión
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <FileText className="text-blue-400" size={24} />
                <div>
                  <p className="text-slate-400 text-sm">Total Tareas</p>
                  <p className="text-white text-2xl font-bold">{stats.totalTasks}</p>
                </div>
              </div>
            </div>
            <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="text-green-400" size={24} />
                <div>
                  <p className="text-slate-400 text-sm">Completadas</p>
                  <p className="text-white text-2xl font-bold">{stats.completedTasks}</p>
                </div>
              </div>
            </div>
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <Brain className="text-yellow-400" size={24} />
                <div>
                  <p className="text-slate-400 text-sm">Evaluaciones</p>
                  <p className="text-white text-2xl font-bold">{stats.pendingEvaluations}</p>
                </div>
              </div>
            </div>
            <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <MessageSquare className="text-purple-400" size={24} />
                <div>
                  <p className="text-slate-400 text-sm">Publicaciones</p>
                  <p className="text-white text-2xl font-bold">{stats.totalPublications}</p>
                </div>
              </div>
            </div>
          </div>
        </div>



        {loading && (
          <div className="text-center py-12">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-purple-600/30 rounded-full animate-spin border-t-purple-500 mx-auto"></div>
              <div className="absolute inset-0 w-20 h-20 border-4 border-transparent rounded-full animate-ping border-t-purple-400"></div>
            </div>
            <p className="text-slate-300 mt-4 text-lg font-medium">Cargando tus datos...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <AlertCircle size={64} className="text-red-500 mx-auto mb-4" />
            <p className="text-red-400 text-lg font-medium">{error}</p>
          </div>
        )}

        {/* Pestañas de Navegación */}
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-800/50 to-slate-800/30 border-b border-slate-700/50">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('aportes')}
                className={`${
                  activeTab === 'aportes'
                    ? 'border-purple-400 text-purple-300 bg-purple-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'
                } group flex items-center gap-2 whitespace-nowrap py-4 px-3 border-b-2 font-medium text-lg transition-all duration-300 rounded-t-lg`}
              >
                <Users size={20} className="group-hover:scale-110 transition-transform duration-300" />
                Mis Aportes
                {stats.totalContributions > 0 && (
                  <span className="ml-2 bg-purple-600/20 text-purple-300 px-2 py-1 rounded-full text-xs font-semibold border border-purple-500/30">
                    {stats.totalContributions}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('tablon')}
                className={`${
                  activeTab === 'tablon'
                    ? 'border-purple-400 text-purple-300 bg-purple-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'
                } group flex items-center gap-2 whitespace-nowrap py-4 px-3 border-b-2 font-medium text-lg transition-all duration-300 rounded-t-lg`}
              >
                <MessageSquare size={20} className="group-hover:scale-110 transition-transform duration-300" />
                Tablón de Anuncios
                {stats.totalPublications > 0 && (
                  <span className="ml-2 bg-purple-600/20 text-purple-300 px-2 py-1 rounded-full text-xs font-semibold border border-purple-500/30">
                    {stats.totalPublications}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('tareas')}
                className={`${
                  activeTab === 'tareas'
                    ? 'border-purple-400 text-purple-300 bg-purple-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'
                } group flex items-center gap-2 whitespace-nowrap py-4 px-3 border-b-2 font-medium text-lg transition-all duration-300 rounded-t-lg`}
              >
                <FileText size={20} className="group-hover:scale-110 transition-transform duration-300" />
                Tareas
                {stats.totalTasks > 0 && (
                  <span className="ml-2 bg-blue-600/20 text-blue-300 px-2 py-1 rounded-full text-xs font-semibold border border-blue-500/30">
                    {stats.totalTasks}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('evaluaciones')}
                className={`${
                  activeTab === 'evaluaciones'
                    ? 'border-purple-400 text-purple-300 bg-purple-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'
                } group flex items-center gap-2 whitespace-nowrap py-4 px-3 border-b-2 font-medium text-lg transition-all duration-300 rounded-t-lg`}
              >
                <Brain size={20} className="group-hover:scale-110 transition-transform duration-300" />
                Evaluaciones
                {stats.pendingEvaluations > 0 && (
                  <span className="ml-2 bg-yellow-600/20 text-yellow-300 px-2 py-1 rounded-full text-xs font-semibold border border-yellow-500/30">
                    {stats.pendingEvaluations}
                  </span>
                )}
              </button>
            </nav>
          </div>

          {/* Contenido de las Pestañas */}
          <div className="p-6">
            {activeTab === 'aportes' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Mis Aportes</h3>
                  <p className="text-slate-400">Gestiona tus contribuciones de compositores</p>
                </div>
                {contributions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-4 bg-slate-800/50 rounded-full flex items-center justify-center">
                      <Users className="text-slate-500" size={32} />
                    </div>
                    <p className="text-slate-400 text-lg font-medium">No tienes aportes de compositores</p>
                    <p className="text-slate-500 text-sm mt-1">Crea tu primera contribución en la línea de tiempo</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-slate-700/50">
                          <th className="text-left py-4 px-4 text-slate-300 font-semibold">Compositor</th>
                          <th className="text-left py-4 px-4 text-slate-300 font-semibold">Estado</th>
                          <th className="text-left py-4 px-4 text-slate-300 font-semibold">Motivo/Sugerencia</th>
                          <th className="text-left py-4 px-4 text-slate-300 font-semibold">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contributions.map((c) => (
                          <tr key={c.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                  {c.first_name?.[0]}{c.last_name?.[0]}
                                </div>
                                <div>
                                  <div className="font-medium text-white">{c.first_name} {c.last_name}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm border ${getStatusColor(c.status)}`}>
                                {c.status === 'PENDING_REVIEW' && (
                                  <>
                                    <Clock size={14} />
                                    Pendiente de Revisión
                                  </>
                                )}
                                {c.status === 'PUBLISHED' && (
                                  <>
                                    <CheckCircle size={14} />
                                    Publicado
                                  </>
                                )}
                                {c.status === 'REJECTED' && (
                                  <>
                                    <AlertCircle size={14} />
                                    Rechazado
                                  </>
                                )}
                                {c.status === 'NEEDS_IMPROVEMENT' && (
                                  <>
                                    <Edit3 size={14} />
                                    Necesita Mejoras
                                  </>
                                )}
                                {c.status === 'APPLIED' && (
                                  <>
                                    <CheckCircle size={14} />
                                    Aporte Aprobado
                                  </>
                                )}
                              </span>
                              <p className="text-slate-500 text-xs mt-1">
                                {c.status === 'PENDING_REVIEW' && 'Tu aporte está siendo revisado por nuestro equipo.'}
                                {c.status === 'PUBLISHED' && '¡Felicidades! Tu aporte ha sido publicado en la línea de tiempo.'}
                                {c.status === 'REJECTED' && 'Tu aporte ha sido rechazado. Revisa el motivo para entender por qué.'}
                                {c.status === 'NEEDS_IMPROVEMENT' && 'Tu aporte requiere algunos cambios antes de ser publicado. Haz clic en Editar y Reenviar para modificarlos.'}
                                {c.status === 'APPLIED' && 'Tu aporte ha sido aprobado y está listo para ser publicado.'}
                              </p>
                            </td>
                            <td className="py-4 px-4">
                              <div className="max-w-xs">
                                <p className="text-slate-300 text-sm truncate">
                                  {c.rejection_reason || c.suggestion_reason || 'N/A'}
                                </p>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              {c.status === 'NEEDS_IMPROVEMENT' && (
                                <button
                                  onClick={() => handleEditClick(c)}
                                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 hover:text-blue-200 rounded-lg transition-all duration-200 border border-blue-500/30"
                                >
                                  <Edit3 size={16} />
                                  <span className="text-sm font-medium">Editar y Reenviar</span>
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* {activeTab === 'aportes' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Mis Aportes</h3>
                  <p className="text-slate-400">Gestiona tus contribuciones de compositores</p>
                </div>
                {contributions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-4 bg-slate-800/50 rounded-full flex items-center justify-center">
                      <Users className="text-slate-500" size={32} />
                    </div>
                    <p className="text-slate-400 text-lg font-medium">No tienes aportes de compositores</p>
                    <p className="text-slate-500 text-sm mt-1">Crea tu primera contribución en la línea de tiempo</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-slate-700/50">
                          <th className="text-left py-4 px-4 text-slate-300 font-semibold">Compositor</th>
                          <th className="text-left py-4 px-4 text-slate-300 font-semibold">Estado</th>
                          <th className="text-left py-4 px-4 text-slate-300 font-semibold">Motivo/Sugerencia</th>
                          <th className="text-left py-4 px-4 text-slate-300 font-semibold">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contributions.map((c) => (
                          <tr key={c.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                  {c.first_name?.[0]}{c.last_name?.[0]}
                                </div>
                                <div>
                                  <div className="font-medium text-white">{c.first_name} {c.last_name}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm border ${getStatusColor(c.status)}`}>
                                {c.status === 'PENDING_REVIEW' && (
                                  <>
                                    <Clock size={14} />
                                    Pendiente de Revisión
                                  </>
                                )}
                                {c.status === 'PUBLISHED' && (
                                  <>
                                    <CheckCircle size={14} />
                                    Publicado
                                  </>
                                )}
                                {c.status === 'REJECTED' && (
                                  <>
                                    <AlertCircle size={14} />
                                    Rechazado
                                  </>
                                )}
                                {c.status === 'NEEDS_IMPROVEMENT' && (
                                  <>
                                    <Edit3 size={14} />
                                    Necesita Mejoras
                                  </>
                                )}
                              </span>
                              <p className="text-slate-500 text-xs mt-1">
                                {c.status === 'PENDING_REVIEW' && 'Tu aporte está siendo revisado por nuestro equipo.'}
                                {c.status === 'PUBLISHED' && '¡Felicidades! Tu aporte ha sido publicado en la línea de tiempo.'}
                                {c.status === 'REJECTED' && 'Tu aporte ha sido rechazado. Revisa el motivo para entender por qué.'}
                                {c.status === 'NEEDS_IMPROVEMENT' && 'Tu aporte requiere algunos cambios antes de ser publicado. Haz clic en Editar y Reenviar para modificarlos.'}
                              </p>
                            </td>
                            <td className="py-4 px-4">
                              <div className="max-w-xs">
                                <p className="text-slate-300 text-sm truncate">
                                  {c.rejection_reason || c.suggestion_reason || 'N/A'}
                                </p>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              {c.status === 'NEEDS_IMPROVEMENT' && (
                                <button
                                  onClick={() => handleEditClick(c)}
                                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 hover:text-blue-200 rounded-lg transition-all duration-200 border border-blue-500/30"
                                >
                                  <Edit3 size={16} />
                                  <span className="text-sm font-medium">Editar y Reenviar</span>
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )} */}

            {activeTab === 'tablon' && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white">Tablón de Anuncios</h3>
                    <p className="text-slate-400">Mantente al día con las novedades de tus cátedras</p>
                  </div>
                  <button
                    onClick={() => openPublicacionModal()}
                    className="group inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-xl transition-all duration-300 shadow-lg shadow-green-900/25 hover:shadow-xl hover:shadow-green-900/40 hover:scale-105"
                  >
                    <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                    <span>Crear Publicación</span>
                  </button>
                </div>
                
                {publicaciones?.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-4 bg-slate-800/50 rounded-full flex items-center justify-center">
                      <MessageSquare className="text-slate-500" size={32} />
                    </div>
                    <p className="text-slate-400 text-lg font-medium">No hay publicaciones</p>
                    <p className="text-slate-500 text-sm mt-1">Sé el primero en compartir algo en el tablón</p>
                  </div>
                ) : (
                  currentAlumnoId !== null && currentAlumnoId !== undefined ? (
                    <div className="space-y-6">
                      {publicaciones.map(publicacion => (
                        <PublicacionCard
                          key={publicacion.id}
                          publicacion={publicacion}
                          onAddComment={handleAddComment}
                          onDeletePublication={handleDeletePublicacion}
                          onDeleteComment={handleDeleteComment}
                          onEditPublication={() => openPublicacionModal(publicacion)}
                          userType="alumno"
                          userId={currentAlumnoId}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 border-4 border-purple-600/30 rounded-full animate-spin border-t-purple-500 mx-auto"></div>
                      <p className="text-slate-400 mt-4">Cargando publicaciones...</p>
                    </div>
                  )
                )}
              </div>
            )}

            {activeTab === 'tareas' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Mis Tareas</h3>
                  <p className="text-slate-400">Gestiona tus asignaciones y entregas</p>
                </div>
                
                {studentTasks.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-4 bg-slate-800/50 rounded-full flex items-center justify-center">
                      <FileText className="text-slate-500" size={32} />
                    </div>
                    <p className="text-slate-400 text-lg font-medium">No tienes tareas asignadas</p>
                    <p className="text-slate-500 text-sm mt-1">Las nuevas tareas aparecerán aquí</p>
                  </div>
                ) : (
                  <>
                    <TaskTable
                      title="Pendientes de Entrega"
                      tasks={studentTasks.filter(task => task.estado === 'ASIGNADA' || (task.estado === 'VENCIDA' && !task.submission_path))}
                      getStatusColor={getStatusColor}
                      getTaskStatusDisplay={getTaskStatusDisplay}
                      handleOpenSubmitModal={handleOpenSubmitModal}
                      showActions={true}
                    />
                    <TaskTable
                      title="Entregadas (Pendiente de Corrección)"
                      tasks={studentTasks.filter(task => task.estado === 'ENTREGADA' || (task.estado === 'VENCIDA' && task.submission_path))}
                      getStatusColor={getStatusColor}
                      getTaskStatusDisplay={getTaskStatusDisplay}
                      showActions={false}
                    />
                    <TaskTable
                      title="Calificadas"
                      tasks={studentTasks.filter(task => task.estado === 'CALIFICADA')}
                      getStatusColor={getStatusColor}
                      getTaskStatusDisplay={getTaskStatusDisplay}
                      showActions={false}
                      showPoints={true}
                    />
                  </>
                )}
              </div>
            )}

            {activeTab === 'evaluaciones' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Mis Evaluaciones</h3>
                  <p className="text-slate-400">Completa tus evaluaciones y revisa tus resultados</p>
                </div>
                
                {evaluations.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-4 bg-slate-800/50 rounded-full flex items-center justify-center">
                      <Brain className="text-slate-500" size={32} />
                    </div>
                    <p className="text-slate-400 text-lg font-medium">No tienes evaluaciones</p>
                    <p className="text-slate-500 text-sm mt-1">Las evaluaciones aparecerán aquí cuando estén disponibles</p>
                  </div>
                ) : (
                  <>
                    <EvaluationTable
                      title="Pendientes"
                      evaluations={evaluations.filter(e => !e.realizada)}
                      getStatusColor={getStatusColor}
                      showActions={true}
                    />
                    <EvaluationTable
                      title="Completadas"
                      evaluations={evaluations.filter(e => e.realizada)}
                      getStatusColor={getStatusColor}
                    />
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Estado vacío general */}
        {!loading && !error && contributions.length === 0 && studentTasks.length === 0 && evaluations.length === 0 && publicaciones.length === 0 && (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 bg-slate-800/50 rounded-full flex items-center justify-center">
              <BookOpen className="text-slate-500" size={36} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">¡Bienvenido a tu panel!</h3>
            <p className="text-slate-400 text-lg">Aún no tienes actividades asignadas o contribuciones.</p>
            <p className="text-slate-500 mt-2">Cuando tengas tareas, evaluaciones, publicaciones o aportes, aparecerán aquí.</p>
          </div>
        )}
      </div>

      {/* Modales */}
      <div>
        {isEditModalOpen && (
          <Modal 
            isOpen={isEditModalOpen} 
            onClose={() => setIsEditModalOpen(false)} 
            title="Editar Aporte"
          >
            <AddComposerForm
              initialData={currentEditingContribution}
              onComposerAdded={handleResubmit}
              onCancel={() => setIsEditModalOpen(false)}
            />
          </Modal>
        )}
        
        {isSubmitModalOpen && (
          <Modal
            isOpen={isSubmitModalOpen}
            onClose={() => setIsSubmitModalOpen(false)}
            title={`Subir Entrega para: ${taskToSubmit?.titulo}`}
            onSubmit={handleSubmitDelivery}
            submitText="Subir Entrega"
            submitDisabled={!selectedFile || loading}
          >
            <div className="p-6 space-y-6">
              <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
                <p className="text-slate-300 mb-4 flex items-center gap-2">
                  <FileText size={20} />
                  Selecciona el archivo para tu entrega
                </p>
                
                <div className="relative">
                  <input 
                    type="file" 
                    onChange={handleFileChange} 
                    className="w-full p-3 border border-slate-600/50 rounded-xl bg-slate-700/50 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-700 transition-colors"
                  />
                </div>
                
                {selectedFile && (
                  <div className="mt-4 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                    <p className="text-green-300 flex items-center gap-2">
                      <CheckCircle size={16} />
                      Archivo seleccionado: <span className="font-semibold">{selectedFile.name}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Modal>
        )}

        <Modal 
          isOpen={isPublicacionModalOpen} 
          onClose={() => setIsPublicacionModalOpen(false)} 
          title={editingPublicacion ? "Editar Publicación" : "Crear Nueva Publicación"} 
          showSubmitButton={false} 
          showCancelButton={false}
        >
          {studentCatedras.length > 0 ? (
            <PublicacionForm 
              catedraId={editingPublicacion?.catedraId || (studentCatedras.length === 1 ? studentCatedras[0].catedraId : null)} 
              onSubmit={editingPublicacion ? handleEditPublicacion : handleCreatePublicacion} 
              initialData={editingPublicacion || {}} 
              isEditMode={!!editingPublicacion} 
              loading={publicationLoading} 
              onCancel={() => setIsPublicacionModalOpen(false)}
              availableCatedras={studentCatedras.map(insc => insc.catedra)}
            />
          ) : (
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-900/20 rounded-full flex items-center justify-center">
                <AlertCircle className="text-red-400" size={32} />
              </div>
              <p className="text-red-400 text-lg font-medium">No puedes crear publicaciones</p>
              <p className="text-slate-400 mt-2">Debes estar inscrito en al menos una cátedra para crear publicaciones.</p>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}

export default MyContributionsPage;