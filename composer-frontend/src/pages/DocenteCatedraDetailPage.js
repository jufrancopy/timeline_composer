import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { jwtDecode } from 'jwt-decode';
import Modal from '../components/Modal';
import DiaClaseForm from '../components/DiaClaseForm';
import AttendanceForm from '../components/AttendanceForm';
import PublicacionForm from '../components/PublicacionForm';
import PublicacionCard from '../components/PublicacionCard';
import PlanDeClasesForm from '../components/PlanDeClasesForm';
import PlanDeClasesTable from '../components/PlanDeClasesTable';
import UnidadPlanTable from '../components/UnidadPlanTable';
import UnidadContentManagement from '../components/UnidadContentManagement';
import TaskDetailsModal from '../components/TaskDetailsModal';
import AssignTaskToStudentsModal from '../components/AssignTaskToStudentsModal';
import AssignEvaluationToStudentsModal from '../components/AssignEvaluationToStudentsModal';
import Swal from 'sweetalert2';
import { format, parseISO } from 'date-fns';
import { Tooltip as TooltipComponent } from 'react-tooltip';
import { es } from 'date-fns/locale';
import { Toaster, toast } from 'react-hot-toast';
import { 
  ArrowLeft, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  Users, 
  Calendar, 
  Clock, 
  MapPin,
  BookOpen,
  AlertCircle,
  DollarSign,
  MessageSquare,
  UserMinus,
  ClipboardCheck
} from 'lucide-react';

const DocenteCatedraDetailPage = () => {
  const { id } = useParams();
  const [catedra, setCatedra] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for DiaClase and Asistencia
  const [diasClase, setDiasClase] = useState([]);
  const [isDiaClaseModalOpen, setIsDiaClaseModalOpen] = useState(false);
  const [editingDiaClase, setEditingDiaClase] = useState(null);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [selectedDiaClaseForAttendance, setSelectedDiaClaseForAttendance] = useState(null);
  const [studentPaymentStatuses, setStudentPaymentStatuses] = useState({});
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [annualAttendanceData, setAnnualAttendanceData] = useState([]);

  // State for Publicaciones (Tablón)
  const [publicaciones, setPublicaciones] = useState([]);
  const [isPublicacionModalOpen, setIsPublicacionModalOpen] = useState(false);
  const [editingPublicacion, setEditingPublicacion] = useState(null);
  const [publicationLoading, setPublicationLoading] = useState(false);

  // State for Plan de Clases
  const [planesDeClase, setPlanesDeClase] = useState([]);
  const [isPlanDeClasesModalOpen, setIsPlanDeClasesModalOpen] = useState(false);
  const [editingPlanDeClases, setEditingPlanDeClases] = useState(null);
  const [selectedPlanDeClases, setSelectedPlanDeClases] = useState(null);
  const [viewingTask, setViewingTask] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedTaskForAssignment, setSelectedTaskForAssignment] = useState(null);
  const [isAssignEvaluationModalOpen, setIsAssignEvaluationModalOpen] = useState(false);
  const [selectedEvaluationForAssignment, setSelectedEvaluationForAssignment] = useState(null);

  const handleViewTask = (task) => {
    setViewingTask(task);
  };

  const handleAssignTask = (task) => {
    console.log("DocenteCatedraDetailPage - handleAssignTask called with task:", task);
    setSelectedTaskForAssignment(task);
    setIsAssignModalOpen(true);
    console.log("DocenteCatedraDetailPage - After state update: selectedTaskForAssignment=", task, "isAssignModalOpen=true");
  };

  const handleAssignEvaluation = (evaluation) => {
    console.log("DocenteCatedraDetailPage - handleAssignEvaluation called with evaluation:", evaluation);
    setSelectedEvaluationForAssignment(evaluation);
    setIsAssignEvaluationModalOpen(true);
    console.log("DocenteCatedraDetailPage - After state update: selectedEvaluationForAssignment=", evaluation, "isAssignEvaluationModalOpen=true");
  };


  // Stats para el dashboard
  const [stats, setStats] = useState({
    alumnosInscritos: 0
  });

  const fetchCatedra = useCallback(async () => {
    try {
      const response = await api.getDocenteCatedraDetalles(id);
      setCatedra(response.data);
      
      // Calcular estadísticas
      const alumnos = response.data.CatedraAlumno || [];
      
      setStats({
        alumnosInscritos: alumnos.length
      });

      if (response.data.CatedraAlumno && response.data.CatedraAlumno.length > 0) {
        fetchStudentPaymentStatuses(response.data.CatedraAlumno, response.data.id);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar los detalles de la cátedra.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchDiasClase = useCallback(async () => {
    try {
      const response = await api.getDocenteDiasClase(id);
      setDiasClase(response.data);
    } catch (err) {
      console.error("Error al cargar los días de clase:", err);
      setError(err.response?.data?.message || 'Error al cargar los días de clase.');
    }
  }, [id]);

  const fetchAnnualAttendance = useCallback(async () => {
    try {
      const response = await api.getAnnualAttendance(id, currentYear);
      setAnnualAttendanceData(response.data);
    } catch (err) {
      console.error("Error al cargar la asistencia anual:", err);
      toast.error("Error al cargar la asistencia anual.");
    }
  }, [id, currentYear]);

  const fetchStudentPaymentStatuses = useCallback(async (alumnos, currentCatedraId) => {
    console.log("[DOCENTE CATEDRA FRONTEND] Invocando fetchStudentPaymentStatuses.");
    const statuses = {};
    console.log(`[DOCENTE CATEDRA FRONTEND] Procesando ${alumnos.length} alumnos.`);
    for (const inscripcion of alumnos) {
      const studentIdentifier = inscripcion.alumnoId || inscripcion.composerId;
      if (studentIdentifier) {
        try {
          const response = await api.getDocenteAlumnoPagos(studentIdentifier);
          if (response.data && Array.isArray(response.data.pagosConsolidados)) {
            response.data.pagosConsolidados.forEach(pagoCatedra => {
              if (pagoCatedra.catedraId === currentCatedraId) {
                statuses[studentIdentifier] = pagoCatedra.estadoActual;
              }
            });
          } else {
            console.warn(`API getDocenteAlumnoPagos did not return expected structure for student ${studentIdentifier}:`, response.data);
          }
        } catch (error) {
          console.error(`Error fetching payment status for student ${studentIdentifier}:`, error);
          statuses[studentIdentifier] = 'ERROR_CARGA';
        }
      }
    }
    setStudentPaymentStatuses(statuses);
  }, []);

  const fetchPublicaciones = useCallback(async () => {
    try {
      const response = await api.getPublicaciones(id);
      setPublicaciones(response.data);
    } catch (err) {
      console.error("Error al cargar publicaciones:", err);
    }
  }, [id]);

  const fetchPlanesDeClase = useCallback(async () => {
    try {
      const response = await api.getDocentePlanesDeClase(id);
      setPlanesDeClase(response.data);
    } catch (err) {
      console.error("Error al cargar planes de clases:", err);
    }
  }, [id]);

  useEffect(() => {
    fetchCatedra();
    fetchDiasClase();
    fetchPublicaciones();
    fetchPlanesDeClase();
  }, [fetchCatedra, fetchDiasClase, fetchPublicaciones, fetchPlanesDeClase]);

  useEffect(() => {
    if (selectedPlanDeClases && planesDeClase.length > 0) {
      const updatedSelectedPlan = planesDeClase.find(plan => plan.id === selectedPlanDeClases.id);
      if (updatedSelectedPlan) {
        setSelectedPlanDeClases(updatedSelectedPlan);
      }
    }
  }, [planesDeClase, selectedPlanDeClases]);

  useEffect(() => {
    fetchAnnualAttendance();
  }, [fetchAnnualAttendance]);

  const handleDiaClaseCreated = () => {
    fetchDiasClase();
    fetchAnnualAttendance();
    setIsDiaClaseModalOpen(false);
  };

  const handleDiaClaseUpdated = () => {
    fetchDiasClase();
    fetchAnnualAttendance();
    setIsDiaClaseModalOpen(false);
    setEditingDiaClase(null);
  };

  const handleDeleteDiaClase = async (diaClaseId) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "¡Esta acción eliminará el día de clase y sus asistencias asociadas!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, ¡eliminarlo!',
      cancelButtonText: 'Cancelar'
    });
    if (result.isConfirmed) {
      try {
        await api.deleteDiaClase(catedra.id, diaClaseId);
        Swal.fire('¡Eliminado!', 'El día de clase ha sido eliminado.', 'success');
        fetchDiasClase();
        fetchAnnualAttendance();
      } catch (error) {
        Swal.fire('Error', error.response?.data?.error || 'Error al eliminar el día de clase.', 'error');
      }
    }
  };

  const openDiaClaseModal = (diaClase = null) => {
    setEditingDiaClase(diaClase);
    setIsDiaClaseModalOpen(true);
  };

  const openAttendanceModal = (diaClase) => {
    setSelectedDiaClaseForAttendance(diaClase);
    setIsAttendanceModalOpen(true);
  };

  const handleSaveAttendance = () => {
    fetchDiasClase();
    fetchAnnualAttendance();
    setIsAttendanceModalOpen(false);
    setSelectedDiaClaseForAttendance(null);
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'AL DÍA': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'EN MORA': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'MATRÍCULA PENDIENTE': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'MATRÍCULA PARCIALMENTE PAGADA': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'GRATUITO': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'ERROR_CARGA': return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getPaymentStatusDisplay = (status) => {
    switch (status) {
      case 'AL DÍA': return 'Al Día';
      case 'EN MORA': return 'En Mora';
      case 'MATRÍCULA PENDIENTE': return 'Matrícula Pendiente';
      case 'MATRÍCULA PARCIALMENTE PAGADA': return 'Matrícula Parcial';
      case 'GRATUITO': return 'Gratuito';
      case 'ERROR_CARGA': return 'Error al Cargar';
      default: return 'Desconocido';
    }
  };

  const getTareaStatusBadge = (status, count, titles) => {
    let colorClass = 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    let statusText = 'Desconocido';

    switch (status) {
      case 'ASIGNADA':
        colorClass = 'bg-orange-600/20 text-orange-300 border-orange-500/30';
        statusText = 'Asignada';
        break;
      case 'ENTREGADA':
        colorClass = 'bg-blue-600/20 text-blue-300 border-blue-500/30';
        statusText = 'Entregada';
        break;
      case 'CALIFICADA':
        colorClass = 'bg-green-600/20 text-green-300 border-green-500/30';
        statusText = 'Calificada';
        break;
      case 'REVISION':
        colorClass = 'bg-purple-600/20 text-purple-300 border-purple-500/30';
        statusText = 'En Revisión';
        break;
      case 'PENDIENTE':
        colorClass = 'bg-yellow-600/20 text-yellow-300 border-yellow-500/30';
        statusText = 'Pendiente';
        break;
      default:
        break;
    }

    const tooltipHtml = `
      <div class="p-2 text-xs text-white bg-slate-700 rounded-md shadow-lg max-w-xs break-words">
        <p class="font-semibold mb-1">${statusText} (${count}):</p>
        <ul class="list-disc list-inside space-y-0.5">
          ${titles.map(title => `<li>${title}</li>`).join('')}
        </ul>
      </div>
    `;

    return (
      <span
        key={status}
        className={`relative px-2.5 py-1 rounded-full text-xs font-medium cursor-help ${colorClass}`}
        data-tooltip-id="task-tooltip"
        data-tooltip-html={tooltipHtml}
      >
        {statusText} ({count})
      </span>
    );
  };


  const handleDesinscribir = async (inscripcion) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "Se eliminará la inscripción del alumno en esta cátedra.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, ¡desinscribir!',
      cancelButtonText: 'Cancelar'
    });
    if (result.isConfirmed) {
      try {
        const { alumnoId, composerId } = inscripcion;
        await api.desinscribirAlumnoForDocente(catedra.id, alumnoId, composerId);
        Swal.fire('¡Desinscrito!', 'El alumno ha sido desinscrito.', 'success');
        fetchCatedra();
      } catch (error) {
        Swal.fire('Error', error.response?.data?.error || 'Error al desinscribir.', 'error');
      }
    }
  };

  const handleCreatePublicacion = async (catedraId, data) => {
    setPublicationLoading(true);
    try {
      await api.createPublicacion(catedraId, data);
      Swal.fire('Publicación Creada', 'La publicación ha sido añadida al tablón.', 'success');
      setIsPublicacionModalOpen(false);
      fetchPublicaciones();
    } catch (error) {
      Swal.fire('Error', error.response?.data?.error || 'Error al crear la publicación.', 'error');
    } finally {
      setPublicationLoading(false);
    }
  };

  const handleEditPublicacion = async (publicacionId, data) => {
    setPublicationLoading(true);
    try {
      await api.updatePublicacion(id, publicacionId, data);
      Swal.fire('Publicación Actualizada', 'La publicación ha sido actualizada.', 'success');
      setIsPublicacionModalOpen(false);
      setEditingPublicacion(null);
      fetchPublicaciones();
    } catch (error) {
      Swal.fire('Error', error.response?.data?.error || 'Error al actualizar la publicación.', 'error');
    } finally {
      setPublicationLoading(false);
    }
  };

  const handleDeletePublicacion = async (publicacionId) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "¡No podrás revertir esto! Se eliminará la publicación y todos sus comentarios.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, ¡eliminarla!',
      cancelButtonText: 'Cancelar'
    });
    if (result.isConfirmed) {
      console.log(`[Frontend] Intentando eliminar publicación. Catedra ID: ${id}, Publicacion ID: ${publicacionId}`);
      try {
        await api.deletePublicacion(id, publicacionId);
        Swal.fire('Publicación Eliminada', 'La publicación ha sido eliminada.', 'success');
        fetchPublicaciones();
      } catch (error) {
        Swal.fire('Error', error.response?.data?.error || 'Error al eliminar la publicación.', 'error');
      }
    }
  };

  const handleAddComment = async (publicacionId, commentData) => {
    try {
      const token = localStorage.getItem('docenteToken');
      await api.createComentario(publicacionId, commentData, { headers: { Authorization: `Bearer ${token}` } });
      fetchPublicaciones();
      toast.success('Comentario añadido exitosamente!');
    } catch (error) {
      console.error("Error al añadir comentario:", error);
      toast.error(error.response?.data?.error || 'Error al añadir el comentario.');
    }
  };

  const handleInteractToggle = async (publicacionId, hasUserInteracted) => {
    try {
      if (hasUserInteracted) {
        await api.removeInteraction(publicacionId);
        toast.info('Interacción eliminada.');
      } else {
        await api.addInteraction(publicacionId);
        toast.success('¡Has interactuado con la publicación!');
      }
      fetchPublicaciones();
    } catch (error) {
      console.error("Error al interactuar con la publicación:", error);
      toast.error('Error al interactuar con la publicación.');
    }
  };

  const handleDeleteComment = async (publicacionId, commentId) => {
    try {
      await api.deleteComentario(publicacionId, commentId);
      Swal.fire('Comentario Eliminado', 'El comentario ha sido eliminado.', 'success');
      fetchPublicaciones();
    } catch (error) {
      Swal.fire('Error', error.response?.data?.error || 'Error al eliminar el comentario.', 'error');
    }
  };

  const openPublicacionModal = (publicacion = null) => {
    setEditingPublicacion(publicacion);
    setIsPublicacionModalOpen(true);
  };

  const handlePlanDeClasesCreated = () => {
    fetchPlanesDeClase();
    setIsPlanDeClasesModalOpen(false);
  };

  const handlePlanDeClasesUpdated = () => {
    fetchPlanesDeClase();
    setIsPlanDeClasesModalOpen(false);
    setEditingPlanDeClases(null);
  };

  const openPlanDeClasesModal = (plan = null) => {
    setEditingPlanDeClases(plan);
    setIsPlanDeClasesModalOpen(true);
  };

  const handleDeletePlanDeClases = async (planId) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "¡Esta acción eliminará el plan de clases y todas sus unidades asociadas!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, ¡eliminarlo!',
      cancelButtonText: 'Cancelar'
    });
    if (result.isConfirmed) {
      try {
        await api.deletePlanDeClases(planId);
        Swal.fire('¡Eliminado!', 'El plan de clases ha sido eliminado.', 'success');
        fetchPlanesDeClase();
      } catch (error) {
        Swal.fire('Error', error.response?.data?.error || 'Error al eliminar el plan de clases.', 'error');
      }
    }
  };

  const handleSelectPlanDeClases = (plan) => {
    console.log("[DocenteCatedraDetailPage] Selected Plan:", JSON.stringify(plan, null, 2));
    setSelectedPlanDeClases(plan);
  };

  const handleBackToPlanes = () => {
    setSelectedPlanDeClases(null);
  };

  // Extraer el ID del docente del token para usarlo en PublicacionCard
  const [currentDocenteId, setCurrentDocenteId] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('docenteToken');    
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setCurrentDocenteId(decoded.docenteId);
        setUserRole(decoded.role);
      } catch (error) {
        console.error('Error decodificando el token del docente:', error);
        setCurrentDocenteId(null);
      }
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-600/30 rounded-full animate-spin border-t-purple-500"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent rounded-full animate-ping border-t-purple-400"></div>
          </div>
          <p className="text-slate-300 mt-4 text-lg font-medium">Cargando cátedra...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950 flex items-center justify-center">
        <div className="text-center p-8">
          <AlertCircle size={64} className="text-red-500 mx-auto mb-4" />
          <p className="text-red-400 text-lg font-medium">{error}</p>
          <Link to="/docente/dashboard" className="inline-flex items-center gap-2 mt-4 text-purple-400 hover:text-purple-300 transition-colors">
            <ArrowLeft size={20} />
            Volver al Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!catedra) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950 flex items-center justify-center">
        <div className="text-center p-8">
          <BookOpen size={64} className="text-slate-500 mx-auto mb-4" />
          <p className="text-slate-400 text-lg font-medium">Cátedra no encontrada</p>
          <Link to="/docente/dashboard" className="inline-flex items-center gap-2 mt-4 text-purple-400 hover:text-purple-300 transition-colors">
            <ArrowLeft size={20} />
            Volver al Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster />
      <TooltipComponent id="task-tooltip" effect="solid" html="true" className="z-50 !opacity-100" />
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950">
        {/* Header Navigation */}
        <div className="bg-slate-950/50 backdrop-blur-xl border-b border-slate-800/50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <Link 
              to="/docente/dashboard" 
              className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-all duration-300 group"
            >
              <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                <ArrowLeft size={20} />
              </div>
              <span className="font-medium">Volver al Dashboard</span>
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-6 space-y-8">
          {/* Sección de Tablón */}
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-800/50 to-slate-800/30 p-6 border-b border-slate-700/50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-600/20 rounded-lg">
                    <MessageSquare className="text-green-400" size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Tablón de la Cátedra</h3>
                    <p className="text-slate-400">{publicaciones?.length || 0} publicaciones</p>
                  </div>
                </div>
                <button
                  onClick={() => openPublicacionModal()}
                  className="group inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-xl transition-all duration-300 shadow-lg shadow-green-900/25 hover:shadow-xl hover:shadow-green-900/40 hover:scale-105"
                >
                  <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                  <span>Crear Publicación</span>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {(publicaciones?.length === 0) ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-4 bg-slate-800/50 rounded-full flex items-center justify-center">
                    <MessageSquare className="text-slate-500" size={32} />
                  </div>
                  <p className="text-slate-400 text-lg font-medium">No hay publicaciones</p>
                  <p className="text-slate-500 text-sm mt-1">Comparte anuncios e información importante con tus estudiantes</p>
                </div>
              ) : (
                (currentDocenteId !== null && currentDocenteId !== undefined) ? (
                  <div className="space-y-6">
                    {publicaciones.map(publicacion => (
                      <PublicacionCard 
                        key={publicacion.id} 
                        publicacion={publicacion}
                        onAddComment={handleAddComment}
                        onDeletePublication={handleDeletePublicacion}
                        onDeleteComment={handleDeleteComment}
                        onEditPublication={() => openPublicacionModal(publicacion)}
                        onInteractToggle={handleInteractToggle}
                        userType="docente"
                        userId={currentDocenteId}
                        docenteId={currentDocenteId} 
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
          </div>

          {/* Header de la Cátedra */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900/80 via-purple-900/40 to-slate-900/80 backdrop-blur-xl border border-slate-700/50">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-600/5 to-purple-600/10"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-purple-500/20 to-transparent rounded-full blur-3xl"></div>
            
            <div className="relative z-10 p-8">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="space-y-4">
                  <h1 className="text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-white">
                    {catedra.nombre}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600/20 text-purple-200 rounded-full text-sm font-medium border border-purple-500/30">
                      <BookOpen size={16} />
                      {catedra.institucion}
                    </span>
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/20 text-blue-200 rounded-full text-sm font-medium border border-blue-500/30">
                      <Calendar size={16} />
                      {catedra.anio}
                    </span>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="text-pink-400" size={20} />
                      <span className="text-xs text-slate-400 font-medium">ALUMNOS</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{stats.alumnosInscritos}</div>
                  </div>
                </div>
              </div>

              {/* Info adicional de la cátedra */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
                  <div className="flex items-center gap-2 text-slate-300 mb-2">
                    <Clock size={18} />
                    <span className="font-medium">Turno</span>
                  </div>
                  <span className="text-white font-semibold text-lg">{catedra.turno}</span>
                </div>
                <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
                  <div className="flex items-center gap-2 text-slate-300 mb-2">
                    <Calendar size={18} />
                    <span className="font-medium">Horarios</span>
                  </div>
                  <div className="space-y-1">
                    {catedra.CatedraDiaHorario && catedra.CatedraDiaHorario.length > 0 ? (
                      catedra.CatedraDiaHorario.map((horario, index) => (
                        <div key={index} className="text-sm">
                          <span className="text-white font-semibold">{horario.dia_semana}:</span>
                          <span className="text-slate-300 ml-1">{horario.hora_inicio} - {horario.hora_fin}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-slate-400">No definido</span>
                    )}
                  </div>
                </div>
                <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
                  <div className="flex items-center gap-2 text-slate-300 mb-2">
                    <MapPin size={18} />
                    <span className="font-medium">Aula</span>
                  </div>
                  <span className="text-white font-semibold text-lg">{catedra.aula}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sección de Planes de Clase */}
          {selectedPlanDeClases ? (
            <UnidadPlanTable
              plan={selectedPlanDeClases}
              onBackToPlanes={handleBackToPlanes}
              fetchPlanesDeClase={fetchPlanesDeClase}
              onViewTask={handleViewTask}
              onAssignTask={handleAssignTask}
              onAssignEvaluation={handleAssignEvaluation}
            />
          ) : (
            <PlanDeClasesTable
              planesDeClase={planesDeClase}
              onEdit={openPlanDeClasesModal}
              onDelete={handleDeletePlanDeClases}
              onSelect={handleSelectPlanDeClases}
              onCreate={() => openPlanDeClasesModal()}
            />
          )}

          {/* Sección de Días de Clase */}
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-800/50 to-slate-800/30 p-6 border-b border-slate-700/50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600/20 rounded-lg">
                    <Calendar className="text-blue-400" size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Días de Clase</h3>
                    <p className="text-slate-400">{diasClase?.length || 0} días registrados</p>
                  </div>
                </div>
                <button
                  onClick={() => openDiaClaseModal()}
                  className="group inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl transition-all duration-300 shadow-lg shadow-blue-900/25 hover:shadow-xl hover:shadow-blue-900/40 hover:scale-105"
                >
                  <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                  <span>Nuevo Día de Clase</span>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {diasClase.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-4 bg-slate-800/50 rounded-full flex items-center justify-center">
                    <Calendar className="text-slate-500" size={32} />
                  </div>
                  <p className="text-slate-400 text-lg font-medium">No hay días de clase registrados</p>
                  <p className="text-slate-500 text-sm mt-1">Registra los días de clase para gestionar asistencias</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-slate-700/50">
                        <th className="text-left py-4 px-4 text-slate-300 font-semibold">Fecha</th>
                        <th className="text-left py-4 px-4 text-slate-300 font-semibold">Día</th>
                        <th className="text-left py-4 px-4 text-slate-300 font-semibold">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {diasClase.map((diaClase) => (
                        <tr key={diaClase.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                          <td className="py-4 px-4">
                            <div className="font-medium text-white">
                              {(() => {
                                const date = new Date(diaClase.fecha);
                                const userTimezoneOffset = date.getTimezoneOffset() * 60000;
                                const correctedDate = new Date(date.getTime() + userTimezoneOffset);
                                return format(correctedDate, 'dd/MM/yyyy');
                              })()}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-600/20 text-indigo-300 rounded-full text-sm border border-indigo-500/30">
                              {diaClase.dia_semana}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openDiaClaseModal(diaClase)}
                                className="p-2 bg-yellow-600/20 text-yellow-300 hover:bg-yellow-600/30 hover:text-yellow-200 rounded-lg transition-all duration-200 border border-yellow-500/30"
                                title="Editar Día de Clase"
                              >
                                <Edit3 size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteDiaClase(diaClase.id)}
                                className="p-2 bg-red-600/20 text-red-300 hover:bg-red-600/30 hover:text-red-200 rounded-lg transition-all duration-200 border border-red-500/30"
                                title="Eliminar Día de Clase"
                              >
                                <Trash2 size={16} />
                              </button>
                              <button
                                onClick={() => openAttendanceModal(diaClase)}
                                className="p-2 bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 hover:text-purple-200 rounded-lg transition-all duration-200 border border-purple-500/30"
                                title="Gestionar Asistencia"
                              >
                                <ClipboardCheck size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Sección de Asistencia Anual */}
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-800/50 to-slate-800/30 p-6 border-b border-slate-700/50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-600/20 rounded-lg">
                    <ClipboardCheck className="text-indigo-400" size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Asistencia Anual</h3>
                    <p className="text-slate-400">Visualiza la asistencia por año</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <label htmlFor="yearSelect" className="text-slate-400 text-sm">Año:</label>
                  <select
                    id="yearSelect"
                    value={currentYear}
                    onChange={(e) => setCurrentYear(parseInt(e.target.value))}
                    className="bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-1 text-sm focus:ring-purple-500 focus:border-purple-500"
                  >
                    {[...Array(5)].map((_, i) => {
                      const yearOption = new Date().getFullYear() - 2 + i;
                      return <option key={yearOption} value={yearOption}>{yearOption}</option>;
                    })}
                  </select>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {annualAttendanceData.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-4 bg-slate-800/50 rounded-full flex items-center justify-center">
                    <ClipboardCheck className="text-slate-500" size={32} />
                  </div>
                  <p className="text-slate-400 text-lg font-medium">No hay datos de asistencia para {currentYear}</p>
                  <p className="text-slate-500 text-sm mt-1">Registra días de clase y asistencias para ver el historial</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {annualAttendanceData.map(dia => (
                    <div key={dia.id} className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
                      <h4 className="text-lg font-semibold text-white mb-2">
                        {format(parseISO(dia.fecha), 'EEEE, dd MMMM yyyy', { locale: es })}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {dia.asistencias.length === 0 ? (
                          <span className="text-slate-400 text-sm">No hay asistencias registradas para este día.</span>
                        ) : (
                          dia.asistencias.map(asistencia => (
                            <span 
                              key={`${dia.id}-${asistencia.alumnoId || asistencia.composerId}`} 
                              className={`px-3 py-1 rounded-full text-xs font-medium ${asistencia.presente ? 'bg-green-600/20 text-green-300 border border-green-500/30' : 'bg-red-600/20 text-red-300 border border-red-500/30'}`}
                            >
                              {asistencia.nombreCompleto} {asistencia.presente ? '(P)' : '(A)'}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sección de Alumnos */}
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-800/50 to-slate-800/30 p-6 border-b border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-600/20 rounded-lg">
                  <Users className="text-pink-400" size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Alumnos Inscritos</h3>
                  <p className="text-slate-400">{catedra.CatedraAlumno?.length || 0} estudiantes</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {catedra.CatedraAlumno.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-4 bg-slate-800/50 rounded-full flex items-center justify-center">
                    <Users className="text-slate-500" size={32} />
                  </div>
                  <p className="text-slate-400 text-lg font-medium">No hay alumnos inscritos</p>
                  <p className="text-slate-500 text-sm mt-1">Los estudiantes aparecerán aquí cuando se inscriban</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-slate-700/50">
                        <th className="text-left py-4 px-4 text-slate-300 font-semibold">Estudiante</th>
                        <th className="text-left py-4 px-4 text-slate-300 font-semibold">Email</th>
                        <th className="text-left py-4 px-4 text-slate-300 font-semibold">Entregas</th>
                        <th className="text-left py-4 px-4 text-slate-300 font-semibold">Estado de Pagos</th>
                        <th className="text-left py-4 px-4 text-slate-300 font-semibold">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {catedra?.CatedraAlumno.map((inscripcion) => {
                        const nombre = inscripcion.Alumno 
                          ? `${inscripcion.Alumno.nombre} ${inscripcion.Alumno.apellido}` 
                          : inscripcion.Composer
                            ? `${inscripcion.Composer.student_first_name} ${inscripcion.Composer.student_last_name} (Contrib.)`
                            : 'Nombre Desconocido';
                        const email = inscripcion.Alumno 
                          ? inscripcion.Alumno.email 
                          : inscripcion.Composer
                            ? inscripcion.Composer.email
                            : 'N/A';
                        const studentIdentifier = inscripcion.alumnoId || inscripcion.composerId;
                        const paymentStatus = studentPaymentStatuses[studentIdentifier];
                        
                        return (
                          <tr key={inscripcion.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                  {nombre.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                                </div>
                                <div>
                                  <div className="font-medium text-white">{nombre}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-slate-300">{email}</td>
                            <td className="py-4 px-4 text-slate-300">
                              <div className="flex flex-wrap gap-2">
                                {(() => {
                                  const alumnoTareas = (inscripcion.Alumno?.TareaAsignacion || inscripcion.Composer?.TareaAsignacion || []);
                                  if (alumnoTareas.length === 0) {
                                    return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-600/20 text-gray-300 border border-gray-500/30">No hay tareas asignadas</span>;
                                  }

                                  const tareasAgrupadas = alumnoTareas.reduce((acc, tarea) => {
                                    if (tarea.TareaMaestra) {
                                      const status = tarea.estado;
                                      if (!acc[status]) {
                                        acc[status] = { count: 0, titles: [] };
                                      }
                                      acc[status].count++;
                                      acc[status].titles.push(tarea.TareaMaestra.titulo);
                                    }
                                    return acc;
                                  }, {});

                                  return Object.entries(tareasAgrupadas).map(([status, data]) => (
                                    getTareaStatusBadge(status, data.count, data.titles)
                                  ));
                                })()}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm border ${getPaymentStatusColor(paymentStatus)}`}>
                                <DollarSign size={14} />
                                {getPaymentStatusDisplay(paymentStatus)}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <Link 
                                  to={`/docente/catedra/${catedra.id}/alumno/${inscripcion.alumnoId || inscripcion.composerId}`}
                                  className="p-2 bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 hover:text-indigo-200 rounded-lg transition-all duration-200 border border-indigo-500/30"
                                  title="Ver Detalles"
                                >
                                  <Eye size={16} />
                                </Link>
                                <button
                                  onClick={() => handleDesinscribir(inscripcion)}
                                  className="p-2 bg-red-600/20 text-red-300 hover:bg-red-600/30 hover:text-red-200 rounded-lg transition-all duration-200 border border-red-500/30"
                                  title="Desinscribir"
                                >
                                  <UserMinus size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modales */}
      <Modal 
        isOpen={isDiaClaseModalOpen} 
        onClose={() => setIsDiaClaseModalOpen(false)} 
        title={editingDiaClase ? "Editar Día de Clase" : "Crear Nuevo Día de Clase"} 
        showSubmitButton={false} 
        showCancelButton={false}
      >
        <DiaClaseForm 
          catedraId={catedra?.id} 
          onDiaClaseCreated={handleDiaClaseCreated} 
          onDiaClaseUpdated={handleDiaClaseUpdated} 
          onCancel={() => setIsDiaClaseModalOpen(false)} 
          initialData={editingDiaClase} 
          isEditMode={!!editingDiaClase} 
          scheduledDays={catedra?.CatedraDiaHorario?.map(h => h.dia_semana)} 
        />
      </Modal>

      {selectedDiaClaseForAttendance && (
        <Modal 
          isOpen={isAttendanceModalOpen} 
          onClose={() => setIsAttendanceModalOpen(false)} 
          title={`Asistencia para ${(() => {
            const date = new Date(selectedDiaClaseForAttendance.fecha);
            const userTimezoneOffset = date.getTimezoneOffset() * 60000;
            const correctedDate = new Date(date.getTime() + userTimezoneOffset);
            return format(correctedDate, 'dd/MM/yyyy');
          })()} (${selectedDiaClaseForAttendance.dia_semana})`} 
          showSubmitButton={false} 
          showCancelButton={false}
        >
          <AttendanceForm 
            catedraId={catedra?.id} 
            diaClaseId={selectedDiaClaseForAttendance.id} 
            alumnos={catedra.CatedraAlumno}
            onSave={handleSaveAttendance} 
            onCancel={() => setIsAttendanceModalOpen(false)} 
          />
        </Modal>
      )}

      <Modal 
        isOpen={isPublicacionModalOpen} 
        onClose={() => setIsPublicacionModalOpen(false)} 
        title={editingPublicacion ? "Editar Publicación" : "Crear Nueva Publicación"} 
        showSubmitButton={false} 
        showCancelButton={false}
      >
        <PublicacionForm 
          catedraId={catedra?.id} 
          onSubmit={editingPublicacion ? handleEditPublicacion : handleCreatePublicacion} 
          initialData={editingPublicacion || {}} 
          isEditMode={!!editingPublicacion} 
          loading={publicationLoading} 
          onCancel={() => setIsPublicacionModalOpen(false)} 
          userRole={userRole}
          isTablonCreation={true}
        />
      </Modal>

      <Modal
        isOpen={isPlanDeClasesModalOpen}
        onClose={() => setIsPlanDeClasesModalOpen(false)}
        title={editingPlanDeClases ? "Editar Plan de Clases" : "Crear Nuevo Plan de Clases"}
        showSubmitButton={false}
        showCancelButton={false}
      >
        <PlanDeClasesForm
          catedraId={catedra?.id}
          onPlanCreated={handlePlanDeClasesCreated}
          onPlanUpdated={handlePlanDeClasesUpdated}
          onCancel={() => setIsPlanDeClasesModalOpen(false)}
          initialData={editingPlanDeClases}
          isEditMode={!!editingPlanDeClases}
        />
      </Modal>

      <TaskDetailsModal 
        isOpen={!!viewingTask} 
        onClose={() => setViewingTask(null)} 
        task={viewingTask} 
      />

      {selectedTaskForAssignment && (
        <AssignTaskToStudentsModal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          task={selectedTaskForAssignment}
          students={catedra?.CatedraAlumno?.map(ca => ca.Alumno || ca.Composer) || []}
          catedraId={catedra?.id}
          onTaskAssigned={() => {
            console.log('Tarea asignada, refrescando planes de clase...');
            fetchPlanesDeClase(); // Esto recargará todas las unidades y tareas
          }}
        />
      )}

      {selectedEvaluationForAssignment && (
        <AssignEvaluationToStudentsModal
          isOpen={isAssignEvaluationModalOpen}
          onClose={() => setIsAssignEvaluationModalOpen(false)}
          evaluation={selectedEvaluationForAssignment}
          students={catedra?.CatedraAlumno?.map(ca => ca.Alumno || ca.Composer) || []}
          catedraId={catedra?.id}
          onEvaluationAssigned={() => {
            console.log('Evaluación asignada, refrescando contenido de unidad...');
            fetchPlanesDeClase(); // Podría ser necesario un fetchContent más específico si solo afecta una unidad
          }}
        />
      )}
    </>
  );
};

export default DocenteCatedraDetailPage;