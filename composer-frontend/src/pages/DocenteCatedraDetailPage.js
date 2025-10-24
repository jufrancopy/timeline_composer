import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { jwtDecode } from 'jwt-decode';
import Modal from '../components/Modal';
import TareaForm from '../components/TareaForm';
import EvaluationForm from '../components/EvaluationForm';
import DiaClaseForm from '../components/DiaClaseForm';
import AttendanceForm from '../components/AttendanceForm';
import PublicacionForm from '../components/PublicacionForm';
import PublicacionCard from '../components/PublicacionCard';
import EvaluationCard from '../components/EvaluationCard';
import PlanDeClasesForm from '../components/PlanDeClasesForm';
import PlanDeClasesTable from '../components/PlanDeClasesTable';
import Swal from 'sweetalert2';
import TaskTable from '../components/TaskTable';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Toaster, toast } from 'react-hot-toast'; // Importar Toaster y toast
import AssignTareaForm from '../components/AssignTareaForm'; // Import the new component
import AssignEvaluationForm from '../components/AssignEvaluationForm'; // Import the new component
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
  Award,
  CheckCircle,
  AlertCircle,
  DollarSign,
  MessageSquare,
  Star,
  TrendingUp,
  Activity,
  FileText,
  Brain,
  UserMinus,
  Target,
  ClipboardCheck
} from 'lucide-react';

const DocenteCatedraDetailPage = () => {
  const { id } = useParams();
  const [catedra, setCatedra] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State variables for modals/forms
  const [isTareaModalOpen, setIsTareaModalOpen] = useState(false);
  const [isEvaluationModalOpen, setIsEvaluationModalOpen] = useState(false);
  const [isEditTareaModalOpen, setIsEditTareaModalOpen] = useState(false);
  const [editingTarea, setEditingTarea] = useState(null);
  const [isTaskDetailModalOpen, setIsTaskDetailModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const [isAssignTareaModalOpen, setIsAssignTareaModalOpen] = useState(false); // New state for assign task modal
  const [selectedTareaToAssign, setSelectedTareaToAssign] = useState(null); // New state to hold task ID for assignment
  const [isAssignEvaluationModalOpen, setIsAssignEvaluationModalOpen] = useState(false);
  const [selectedEvaluationToAssign, setSelectedEvaluationToAssign] = useState(null);

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
  const [processedTareasMaestras, setProcessedTareasMaestras] = useState([]);
  const [isPublicacionModalOpen, setIsPublicacionModalOpen] = useState(false);
  const [editingPublicacion, setEditingPublicacion] = useState(null);
  const [publicationLoading, setPublicationLoading] = useState(false);

  // State for Plan de Clases
  const [planesDeClase, setPlanesDeClase] = useState([]);
  const [isPlanDeClasesModalOpen, setIsPlanDeClasesModalOpen] = useState(false);
  const [editingPlanDeClases, setEditingPlanDeClases] = useState(null);
  const [selectedPlanDeClases, setSelectedPlanDeClases] = useState(null);

  // Stats para el dashboard
  const [stats, setStats] = useState({
    tareasAsignadas: 0,
    tareasEntregadas: 0,
    evaluacionesCreadas: 0,
    alumnosInscritos: 0
  });

  const fetchCatedra = useCallback(async () => {
    try {
      const response = await api.getDocenteCatedraDetalles(id);
      setCatedra(response.data);
      
      // Calcular estadísticas
      const tareasMaestras = response.data.TareaMaestra || [];
      const evaluacionesMaestras = response.data.Evaluacion || [];
      const alumnos = response.data.CatedraAlumno || [];
      
      setStats({
        tareasAsignadas: tareasMaestras.length,
        tareasEntregadas: tareasMaestras.reduce((acc, tarea) => {
          const entregadasYCalificadas = tarea.TareaAsignacion.filter(asig => asig.estado === 'ENTREGADA' || asig.estado === 'CALIFICADA').length;
          return acc + entregadasYCalificadas;
        }, 0),
        evaluacionesCreadas: evaluacionesMaestras.length,
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
  }, [id]);

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
      const response = await api.getDocentePlanesDeClaseForCatedra(id);
      setPlanesDeClase(response.data);
    } catch (err) {
      console.error("Error al cargar planes de clases:", err);
    }
  }, [id]);

  // Helper functions for TaskTable
  const getStatusColor = (taskOrEstado) => {
    if (typeof taskOrEstado === 'object' && taskOrEstado !== null) {
      // This is a TareaMaestra object, not a TareaAsignacion status
      // For master tasks, we might want a generic color or derive from overall assignment status
      // For now, let's return a default for master tasks
      return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'; // A distinct color for master tasks
    }
    // If it's a string, it's a TareaAsignacion status
    switch (taskOrEstado) {
      case 'ASIGNADA': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'ENTREGADA': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'CALIFICADA': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'VENCIDA': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getTaskStatusDisplay = (taskOrEstado) => {
    if (typeof taskOrEstado === 'object' && taskOrEstado !== null) {
      // This is a TareaMaestra object
      // We can display a generic status or check if it has any assignments
      if (taskOrEstado.TareaAsignacion && taskOrEstado.TareaAsignacion.length > 0) {
        // If there are assignments, we could summarize, but for simplicity, let's say 'Maestra con Asignaciones'
        return 'Maestra (Asignada)'; 
      } else {
        return 'Maestra (Sin Asignar)';
      }
    }
    // If it's a string, it's a TareaAsignacion status
    switch (taskOrEstado) {
      case 'ASIGNADA': return 'Asignada';
      case 'ENTREGADA': return 'Entregada';
      case 'CALIFICADA': return 'Calificada';
      case 'VENCIDA': return 'Vencida';
      default: return taskOrEstado;
    }
  };

  useEffect(() => {
    fetchCatedra();
    fetchDiasClase();
    fetchPublicaciones();
    fetchPlanesDeClase();
  }, [id, fetchCatedra, fetchDiasClase, fetchPublicaciones, fetchPlanesDeClase]);

  useEffect(() => {
    fetchAnnualAttendance();
  }, [fetchAnnualAttendance]);

  useEffect(() => {
    if (catedra?.TareaMaestra) {
      const processed = catedra.TareaMaestra.map(tarea => ({ ...tarea }));
      setProcessedTareasMaestras(processed);
    }
  }, [catedra]);

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

  const handleTareaCreated = async (createdTarea) => {
    fetchCatedra();
    setIsTareaModalOpen(false);
    toast.success(`Tarea '${createdTarea.titulo}' creada exitosamente. Asígnala para publicarla en el tablón.`);
    fetchPublicaciones(); // Actualizar el tablón de publicaciones después de crear una tarea
  };

  const handleAssignTarea = (tarea) => {
    setSelectedTareaToAssign(tarea);
    setIsAssignTareaModalOpen(true);
  };

  const handleTareaAssigned = () => {
    fetchCatedra();
    setIsAssignTareaModalOpen(false);
    setSelectedTareaToAssign(null);
    toast.success('Tarea asignada a los alumnos con éxito.');
    fetchPublicaciones(); // Actualizar el tablón de publicaciones también
  };

  const handleAssignEvaluation = (evaluationId) => {
    setSelectedEvaluationToAssign(evaluationId);
    setIsAssignEvaluationModalOpen(true);
  };

  const handleEvaluationAssigned = () => {
    fetchCatedra();
    setIsAssignEvaluationModalOpen(false);
    setSelectedEvaluationToAssign(null);
    toast.success('Evaluación asignada a los alumnos con éxito.');
    fetchPublicaciones(); // Refetch publications to update tablón visibility
  };

  const handleTareaUpdated = async (tareaMaestraId, updatedTareaData) => {
    try {
      await api.updateTareaForDocenteCatedra(catedra.id, tareaMaestraId, updatedTareaData);
      toast.success('Tarea maestra actualizada exitosamente.');
      fetchCatedra();
      fetchPublicaciones(); // Para actualizar cualquier cambio en la publicación asociada
      setIsEditTareaModalOpen(false);
      setEditingTarea(null);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al actualizar la tarea maestra.');
      console.error('Error al actualizar la tarea maestra:', error);
    }
  };

  const handleDeleteTarea = async (tareaId) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "¡No podrás revertir esto!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, ¡eliminarla!',
      cancelButtonText: 'Cancelar'
    });
    if (result.isConfirmed) {
      try {
        await api.deleteTareaForDocente(catedra.id, tareaId);
        Swal.fire('¡Eliminada!', 'La tarea ha sido eliminada.', 'success');
        fetchCatedra();
        fetchPublicaciones(); // Actualizar el tablón de publicaciones también
      } catch (error) {
        Swal.fire('Error', error.response?.data?.error || 'Error al eliminar la tarea.', 'error');
      }
    }
  };

  const handleEditTarea = (tarea) => {
    setEditingTarea(tarea);
    setIsEditTareaModalOpen(true);
  };

  const handleGenerateEvaluation = async (topic, subject, numberOfQuestions, numberOfOptions) => {
    setIsGenerating(true);
    try {
      const response = await api.generateDocenteEvaluation(id, { topic, subject, numberOfQuestions, numberOfOptions });
      const createdEvaluation = response.data;
      Swal.fire({
        title: '¡Éxito!',
        text: 'La evaluación ha sido generada y guardada correctamente. Asígnala para publicarla en el tablón.',
        icon: 'success',
        timer: 3000,
        showConfirmButton: false
      });
      setIsEvaluationModalOpen(false);
      fetchCatedra();
      fetchPublicaciones(); // Actualizar el tablón de publicaciones después de crear una evaluación
    } catch (error) {
      let errorMessage = error.response?.data?.error || 'No se pudo generar la evaluación.';
      if (errorMessage.includes('The model is overloaded')) {
        errorMessage = 'El modelo de IA está sobrecargado. Por favor, inténtalo de nuevo más tarde.';
      }
      Swal.fire('Error', errorMessage, 'error');
    } finally {
      setIsGenerating(false);
    }
  };


  const openTaskDetailModal = (task) => {
    setSelectedTask(task);
    setIsTaskDetailModalOpen(true);
  };

  const handleToggleVisibility = async (publicacionId, catedraId) => {
    try {
      await api.togglePublicacionVisibility(publicacionId, catedraId);
      toast.success('Visibilidad de la tarea actualizada.');
      fetchPublicaciones();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al cambiar la visibilidad.');
    }
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
      fetchPublicaciones(); // Refrescar publicaciones para actualizar conteo y estado
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

  const handleDeleteEvaluation = async (evaluationId) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "¡Esta acción eliminará la evaluación y todas sus preguntas/opciones asociadas!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, ¡eliminarla!',
      cancelButtonText: 'Cancelar'
    });
    if (result.isConfirmed) {
      try {
        await api.deleteDocenteEvaluation(id, evaluationId);
        Swal.fire('¡Eliminada!', 'La evaluación ha sido eliminada.', 'success');
        fetchCatedra();
      } catch (error) {
        Swal.fire('Error', error.response?.data?.error || 'Error al eliminar la evaluación.', 'error');
      }
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
    setSelectedPlanDeClases(plan);
  };

  const handleBackToPlanes = () => {
    setSelectedPlanDeClases(null);
  };

  const API_BASE_URL = process.env.REACT_APP_API_URL;
  const STATIC_ASSET_BASE_URL = API_BASE_URL.endsWith('/api') ? API_BASE_URL.slice(0, -4) : API_BASE_URL;

  // Extraer el ID del docente del token para usarlo en PublicacionCard
  const [currentDocenteId, setCurrentDocenteId] = useState(null);
  const [userRole, setUserRole] = useState(null); // Nuevo estado para el rol del usuario

  useEffect(() => {
    const token = localStorage.getItem('docenteToken');    
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setCurrentDocenteId(decoded.docenteId);
        setUserRole(decoded.role); // Extraer el rol del token
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
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:min-w-0 lg:flex-shrink-0">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="text-blue-400" size={20} />
                      <span className="text-xs text-slate-400 font-medium">TAREAS</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{stats.tareasAsignadas}</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="text-green-400" size={20} />
                      <span className="text-xs text-slate-400 font-medium">ENTREGADAS</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{stats.tareasEntregadas}</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="text-purple-400" size={20} />
                      <span className="text-xs text-slate-400 font-medium">EVALUACIONES</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{stats.evaluacionesCreadas}</div>
                  </div>
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

          {/* Sección de Tareas */}
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-800/50 to-slate-800/30 p-6 border-b border-slate-700/50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-600/20 rounded-lg">
                    <FileText className="text-purple-400" size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Tareas del Curso</h3>
                    <p className="text-slate-400">{catedra.TareaMaestra?.length || 0} tareas asignadas</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsTareaModalOpen(true)}
                  className="group inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium rounded-xl transition-all duration-300 shadow-lg shadow-purple-900/25 hover:shadow-xl hover:shadow-purple-900/40 hover:scale-105"
                >
                  <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                  <span>Crear Nueva Tarea</span>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {(catedra.TareaMaestra?.length || 0) === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-4 bg-slate-800/50 rounded-full flex items-center justify-center">
                    <FileText className="text-slate-500" size={32} />
                  </div>
                  <p className="text-slate-400 text-lg font-medium">No hay tareas asignadas</p>
                  <p className="text-slate-500 text-sm mt-1">Crea la primera tarea para tus estudiantes</p>
                </div>
              ) : (
                <TaskTable 
                  tasks={processedTareasMaestras} 
                  onEditTask={handleEditTarea} 
                  onDeleteTask={handleDeleteTarea} 
                  onViewTask={openTaskDetailModal} 
                  onAssignTask={handleAssignTarea} // Pass the new handler
                  onToggleVisibility={handleToggleVisibility}
                  docenteView={true}
                  getStatusColor={getStatusColor}
                  getTaskStatusDisplay={getTaskStatusDisplay}
                  showActions={true}
                />
              )}
            </div>
          </div>

          {/* Sección de Evaluaciones */}
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-800/50 to-slate-800/30 p-6 border-b border-slate-700/50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-600/20 rounded-lg">
                    <Brain className="text-green-400" size={24} />
                  </div>
                  <div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">Evaluaciones</h3>
                    <p className="text-slate-400">{(catedra.Evaluacion?.length || 0)} evaluaciones creadas</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEvaluationModalOpen(true)}
                  className="group inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-xl transition-all duration-300 shadow-lg shadow-green-900/25 hover:shadow-xl hover:shadow-green-900/40 hover:scale-105"
                >
                  <Brain size={20} className="group-hover:scale-110 transition-transform duration-300" />
                  <span>Generar con IA</span>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {(catedra.Evaluacion?.length || 0) === 0 ? (                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-4 bg-slate-800/50 rounded-full flex items-center justify-center">
                    <Brain className="text-slate-500" size={32} />
                  </div>
                  <p className="text-slate-400 text-lg font-medium">No hay evaluaciones</p>
                  <p className="text-slate-500 text-sm mt-1">Usa IA para generar evaluaciones automáticamente</p>
                </div>
              ) : (
                <>
                  {/* Vista de tabla para pantallas grandes */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-slate-700/50">
                          <th className="text-left py-4 px-4 text-slate-300 font-semibold">Título</th>
                          <th className="text-left py-4 px-4 text-slate-300 font-semibold">Preguntas</th>
                          <th className="text-left py-4 px-4 text-slate-300 font-semibold">Fecha</th>
                          <th className="text-left py-4 px-4 text-slate-300 font-semibold">Publicada</th>
                          <th className="text-left py-4 px-4 text-slate-300 font-semibold">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {catedra.Evaluacion.map((evaluacion, index) => (
                          <tr key={evaluacion.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                            <td className="py-4 px-4">
                              <div className="font-medium text-white">{evaluacion.titulo}</div>
                            </td>
                            <td className="py-4 px-4">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-600/20 text-blue-300 rounded-full text-sm border border-blue-500/30">
                                <Target size={14} />
                                {evaluacion.Pregunta?.length || 0}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-slate-300">
                              {new Date(evaluacion.created_at).toLocaleDateString()}
                            </td>
                            <td className="py-4 px-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm border ${evaluacion.Publicacion?.visibleToStudents ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'}`}>
                                {
                                  evaluacion.Publicacion && typeof evaluacion.Publicacion.visibleToStudents === 'boolean'
                                    ? (evaluacion.Publicacion.visibleToStudents ? 'Sí' : 'No')
                                    : 'N/A'
                                }
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <Link 
                                  to={`/docente/catedra/${catedra.id}/evaluation/${evaluacion.id}`} 
                                  className="p-2 bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 hover:text-purple-200 rounded-lg transition-all duration-200 border border-purple-500/30"
                                  title="Ver Detalles"
                                >
                                  <Eye size={16} />
                                </Link>
                                <button
                                  onClick={() => handleAssignEvaluation(evaluacion.id)}
                                  className="p-2 bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 hover:text-blue-200 rounded-lg transition-all duration-200 border border-blue-500/30"
                                  title="Asignar Evaluación"
                                >
                                  <Users size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteEvaluation(evaluacion.id)}
                                  className="p-2 bg-red-600/20 text-red-300 hover:bg-red-600/30 hover:text-red-200 rounded-lg transition-all duration-200 border border-red-500/30"
                                  title="Eliminar Evaluación"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Vista de tarjetas para pantallas pequeñas */}
                  <div className="block md:hidden space-y-4">
                    {catedra.Evaluacion.map(evaluacion => (
                      <EvaluationCard 
                        key={evaluacion.id} 
                        catedraId={catedra.id} 
                        evaluacion={evaluacion} 
                        onDeleteEvaluation={handleDeleteEvaluation}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

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
                              {/* FIX: Ajustar la fecha para la zona horaria local antes de formatear */}
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
                                onClick={() => {
                                  console.log('DiaClase ID to delete:', diaClase.id);
                                  handleDeleteDiaClase(diaClase.id);
                                }}
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
                                <CheckCircle size={16} />
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

          {/* Sección de Plan de Clases */}
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-800/50 to-slate-800/30 p-6 border-b border-slate-700/50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-600/20 rounded-lg">
                    <BookOpen className="text-indigo-400" size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Plan de Clases</h3>
                    <p className="text-slate-400">{planesDeClase?.length || 0} planes creados</p>
                  </div>
                </div>
                <button
                  onClick={() => openPlanDeClasesModal()}
                  className="group inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-medium rounded-xl transition-all duration-300 shadow-lg shadow-indigo-900/25 hover:shadow-xl hover:shadow-indigo-900/40 hover:scale-105"
                >
                  <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                  <span>Crear Nuevo Plan</span>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {selectedPlanDeClases ? (
                <PlanDeClasesTable 
                  plan={selectedPlanDeClases} 
                  onBackToPlanes={handleBackToPlanes} 
                  fetchPlanesDeClase={fetchPlanesDeClase}
                />
              ) : (
                planesDeClase.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-4 bg-slate-800/50 rounded-full flex items-center justify-center">
                      <BookOpen className="text-slate-500" size={32} />
                  </div>
                    <p className="text-slate-400 text-lg font-medium">No hay planes de clases creados</p>
                    <p className="text-slate-500 text-sm mt-1">Comienza creando el primer plan para tu cátedra</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-slate-700/50">
                          <th className="text-left py-4 px-4 text-slate-300 font-semibold">Título</th>
                          <th className="text-left py-4 px-4 text-slate-300 font-semibold">Organización</th>
                          <th className="text-left py-4 px-4 text-slate-300 font-semibold">Fecha Creación</th>
                          <th className="text-left py-4 px-4 text-slate-300 font-semibold">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {planesDeClase.map((plan) => (
                          <tr key={plan.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                            <td className="py-4 px-4">
                              <div className="font-medium text-white">{plan.titulo}</div>
                            </td>
                            <td className="py-4 px-4">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-600/20 text-purple-300 rounded-full text-sm border border-purple-500/30">
                                {plan.tipoOrganizacion === 'MES' ? 'Por Mes' : 'Por Módulo'}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-slate-300">
                              {new Date(plan.created_at).toLocaleDateString()}
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleSelectPlanDeClases(plan)} // This will open the PlanDeClasesTable view
                                  className="p-2 bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 hover:text-indigo-200 rounded-lg transition-all duration-200 border border-indigo-500/30"
                                  title="Ver Detalles del Plan"
                                >
                                  <Eye size={16} />
                                </button>
                                <button
                                  onClick={() => openPlanDeClasesModal(plan)}
                                  className="p-2 bg-yellow-600/20 text-yellow-300 hover:bg-yellow-600/30 hover:text-yellow-200 rounded-lg transition-all duration-200 border border-yellow-500/30"
                                  title="Editar Plan"
                                >
                                  <Edit3 size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeletePlanDeClases(plan.id)}
                                  className="p-2 bg-red-600/20 text-red-300 hover:bg-red-600/30 hover:text-red-200 rounded-lg transition-all duration-200 border border-red-500/30"
                                  title="Eliminar Plan"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
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
                            : 'Nombre Desconocido'; // Fallback
                        const email = inscripcion.Alumno 
                          ? inscripcion.Alumno.email 
                          : inscripcion.Composer
                            ? inscripcion.Composer.email
                            : 'N/A'; // Fallback
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
                                  title="Revisar Tareas"
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
                        onToggleVisibility={(publicacionId) => handleToggleVisibility(publicacionId, catedra.id)} // Nueva prop
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
        </div>
      </div>

      {/* Modales */}
        <Modal 
          isOpen={isTareaModalOpen} 
          onClose={() => setIsTareaModalOpen(false)} 
          title="Crear Nueva Tarea" 
          showSubmitButton={false} 
          showCancelButton={false}
        >
          <TareaForm 
            catedraId={catedra?.id} 
            onTareaCreated={handleTareaCreated} 
            onCancel={() => setIsTareaModalOpen(false)} 
            userType="docente" 
          />
        </Modal>

        <Modal 
          isOpen={isEditTareaModalOpen} 
          onClose={() => setIsEditTareaModalOpen(false)} 
          title="Editar Tarea" 
          showSubmitButton={false} 
          showCancelButton={false}
        >
          <TareaForm 
            catedraId={catedra?.id} 
            onTareaUpdated={handleTareaUpdated} 
            onCancel={() => setIsEditTareaModalOpen(false)} 
            userType="docente" 
            initialData={editingTarea} 
            isEditMode={true} 
          />
        </Modal>

        <Modal 
          isOpen={isEvaluationModalOpen} 
          onClose={() => setIsEvaluationModalOpen(false)} 
          title="Generar Nueva Evaluación con IA"
        >
          <EvaluationForm 
            onSubmit={handleGenerateEvaluation} 
            loading={isGenerating} 
            onCancel={() => setIsEvaluationModalOpen(false)} 
            userType="docente" 
          />
        </Modal>

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

        {isTaskDetailModalOpen && selectedTask && (
          <Modal 
            isOpen={isTaskDetailModalOpen} 
            onClose={() => setIsTaskDetailModalOpen(false)} 
            title={`Detalles de Tarea: ${selectedTask.titulo}`} 
            showSubmitButton={false} 
            cancelText="Cerrar"
          >
            <div className="p-4 text-slate-300 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
                  <span className="text-sm text-slate-400 font-medium">Puntos Posibles</span>
                  <div className="text-2xl font-bold text-white mt-1">{selectedTask.puntos_posibles}</div>
                </div>
                <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
                  <span className="text-sm text-slate-400 font-medium">Fecha de Entrega</span>
                  <div className="text-lg font-semibold text-white mt-1">
                    {selectedTask.fecha_entrega ? new Date(selectedTask.fecha_entrega).toLocaleDateString() : 'No definida'}
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
                  dangerouslySetInnerHTML={{ __html: selectedTask.descripcion }}
                />
              </div>

              {(selectedTask.recursos && selectedTask.recursos.length > 0) && (
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Activity size={20} />
                    Recursos Adjuntos
                  </h4>
                  <div className="grid gap-3">
                    {selectedTask.recursos.map((recurso, resIndex) => {
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
            </div>
          </Modal>
        )}

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

        <Modal 
          isOpen={isAssignTareaModalOpen} 
          onClose={() => setIsAssignTareaModalOpen(false)} 
          title="Asignar Tarea a Alumnos" 
          showSubmitButton={false} 
          showCancelButton={false}
        >
          <AssignTareaForm 
            catedraId={catedra?.id} 
            onTareaAssigned={handleTareaAssigned} 
            onCancel={() => setIsAssignTareaModalOpen(false)} 
            userType="docente" 
            initialTask={selectedTareaToAssign}
          />
        </Modal>

        <Modal 
          isOpen={isAssignEvaluationModalOpen} 
          onClose={() => setIsAssignEvaluationModalOpen(false)} 
          title="Asignar Evaluación a Alumnos" 
          showSubmitButton={false} 
          showCancelButton={false}
        >
          <AssignEvaluationForm 
            catedraId={catedra?.id} 
            onEvaluationAssigned={handleEvaluationAssigned} 
            onCancel={() => setIsAssignEvaluationModalOpen(false)} 
            initialEvaluationId={selectedEvaluationToAssign}
          />
        </Modal>
    </>
  );
};

export default DocenteCatedraDetailPage;

<Toaster />