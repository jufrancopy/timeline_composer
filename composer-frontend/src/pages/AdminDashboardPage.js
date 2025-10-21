import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import AddComposerForm from '../components/AddComposerForm';

// --- Constants ---
const FIELD_LABELS = {
  first_name: 'Nombre',
  last_name: 'Apellido',
  birth_year: 'Año de Nacimiento',
  birth_month: 'Mes de Nacimiento',
  birth_day: 'Día de Nacimiento',
  death_year: 'Año de Fallecimiento',
  death_month: 'Mes de Fallecimiento',
  death_day: 'Día de Fallecimiento',
  bio: 'Biografía',
  notable_works: 'Obras Notables',
  period: 'Período',
  photo_url: 'Foto',
  youtube_link: 'YouTube',
  references: 'Referencias',
  mainRole: 'Rol Principal',
};

const ALL_FIELDS = Object.keys(FIELD_LABELS).map(key => ({ key, label: FIELD_LABELS[key] }));

const TABS = {
  CONTRIBUTIONS: 'contributions',
  SUGGESTIONS: 'suggestions',
  ADD: 'add',
  ACADEMIC: 'academic',
  SUBMITTED_TASKS: 'submittedTasks',
  GRADED_TASKS: 'gradedTasks',
};

// --- Helper Function for Scoring and Missing Fields ---
const evaluateContribution = (contribution) => {
  if (!contribution) return { score: 0, total: 0, missing: [] };

  let scorableFields = [...ALL_FIELDS];
  
  // If no death year, exclude death fields from scoring
  if (!contribution.death_year) {
    scorableFields = ALL_FIELDS.filter(f => !f.key.startsWith('death_'));
  }

  const missingFields = scorableFields.filter(field => {
    const value = contribution[field.key];
    return value === null || 
           value === undefined || 
           value === '' || 
           (Array.isArray(value) && value.length === 0);
  });

  return {
    score: scorableFields.length - missingFields.length,
    total: scorableFields.length,
    missing: missingFields.map(f => f.label)
  };
};

// --- Loading Component ---
const LoadingSpinner = ({ message = "Cargando..." }) => (
  <div className="flex items-center justify-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mr-3"></div>
    <span className="text-gray-300">{message}</span>
  </div>
);

// --- Error Component ---
const ErrorMessage = ({ message, onRetry }) => (
  <div className="text-center py-8">
    <p className="text-red-400 mb-4">{message}</p>
    {onRetry && (
      <button 
        onClick={onRetry}
        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition-colors"
      >
        Reintentar
      </button>
    )}
  </div>
);

// --- Tab Navigation Component ---
const TabNavigation = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: TABS.CONTRIBUTIONS, label: 'Aportes Pendientes' },
    { id: TABS.SUGGESTIONS, label: 'Sugerencias de Edición' },
    { id: TABS.ADD, label: 'Añadir Compositor' },
    { id: TABS.ACADEMIC, label: 'Módulo Académico' },
    { id: TABS.SUBMITTED_TASKS, label: 'Tareas Pendientes' },
    { id: TABS.GRADED_TASKS, label: 'Tareas Calificadas' },
  ];

  return (
    <div className="mb-6 border-b border-gray-700">
      <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`${
              activeTab === tab.id
                ? 'border-purple-400 text-purple-300'
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

// --- Suggestions Manager Component ---
const SuggestionsManager = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [isRejectModalOpenForSuggestion, setIsRejectModalOpenForSuggestion] = useState(false);
  const [currentSuggestionToReject, setCurrentSuggestionToReject] = useState(null);
  const [rejectionReasonForSuggestion, setRejectionReasonForSuggestion] = useState('');

  const loadSuggestions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getPendingSuggestions();
      console.log("Sugerencias pendientes recibidas:", response.data);
      setSuggestions(response.data);
    } catch (err) {
      setError('No se pudieron cargar las sugerencias.');
      console.error('Error loading suggestions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSuggestions();
  }, [loadSuggestions]);

  const handleApprove = useCallback(async (id) => {
    try {
      await api.approveSuggestion(id);
      toast.success('Sugerencia aprobada!');
      setSuggestions(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      toast.error('Error al aprobar la sugerencia');
      console.error('Error approving suggestion:', error);
    }
  }, []);

  const openRejectSuggestionModal = useCallback((suggestion) => {
    setCurrentSuggestionToReject(suggestion);
    setIsRejectModalOpenForSuggestion(true);
  }, []);

  const handleRejectSuggestionSubmit = useCallback(async () => {
    if (!rejectionReasonForSuggestion.trim()) {
      toast.error('Por favor, ingrese un motivo para rechazar la sugerencia.');
      return;
    }
    try {
      await api.rejectSuggestion(currentSuggestionToReject.id, { reason: rejectionReasonForSuggestion });
      toast.success('Sugerencia rechazada exitosamente!');
      setSuggestions(prev => prev.filter(s => s.id !== currentSuggestionToReject.id));
      setIsRejectModalOpenForSuggestion(false);
      setRejectionReasonForSuggestion('');
      setCurrentSuggestionToReject(null);
    } catch (error) {
      toast.error('Error al rechazar la sugerencia');
      console.error('Error rejecting suggestion:', error);
    }
  }, [currentSuggestionToReject, rejectionReasonForSuggestion]);

  const openDetailModal = useCallback((suggestion) => {
    setSelectedSuggestion(suggestion);
    setIsDetailModalOpen(true);
  }, []);

  const getChangedFields = useMemo(() => {
    if (!selectedSuggestion) return [];
    
    const { Composer, ...suggestionData } = selectedSuggestion;
    const changed = [];

    ALL_FIELDS.forEach(field => {
      const key = field.key;
      const originalValue = Composer[key];
      const suggestedValue = suggestionData[key];

      const isOriginalEmpty = originalValue === null || originalValue === undefined || (Array.isArray(originalValue) && originalValue.length === 0) || originalValue === '';
      const isSuggestedPresent = suggestedValue !== null && suggestedValue !== undefined && (!(Array.isArray(suggestedValue)) || suggestedValue.length > 0) && suggestedValue !== '';
      
      // Compare if suggestedValue is present and different from originalValue (or if originalValue was empty)
      if (isSuggestedPresent && (isOriginalEmpty || String(originalValue) !== String(suggestedValue))) {
        changed.push({
          field: FIELD_LABELS[key] || key,
          original: isOriginalEmpty ? 'No especificado' : (Array.isArray(originalValue) ? originalValue.join(', ') : originalValue),
          suggested: Array.isArray(suggestedValue) ? suggestedValue.join(', ') : suggestedValue,
          isPhoto: key === 'photo_url',
        });
      }
    });
    return changed;
  }, [selectedSuggestion]);

  if (loading) return <LoadingSpinner message="Cargando sugerencias..." />;
  if (error) return <ErrorMessage message={error} onRetry={loadSuggestions} />;

  return (
    <>
      <div className="bg-white/5 backdrop-blur-lg p-6 rounded-lg shadow-xl mt-10">
        <h3 className="text-2xl font-bold mb-4">Sugerencias de Edición Pendientes</h3>
        {suggestions.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No hay sugerencias pendientes.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Compositor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Sugerido por</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Motivo</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {suggestions.map(suggestion => (
                  <tr key={suggestion.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">
                      {suggestion.Composer.first_name} {suggestion.Composer.last_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {suggestion.is_student_contribution ? (
                        <span className="font-bold text-green-400">
                          Alumno: {suggestion.student_first_name} {suggestion.student_last_name}
                        </span>
                      ) : (
                        <span className="text-gray-400">{suggestion.suggester_email}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300 max-w-xs">
                      <div className="truncate" title={suggestion.reason}>
                        {suggestion.reason}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button 
                        onClick={() => openDetailModal(suggestion)} 
                        className="text-blue-400 hover:text-blue-500 transition-colors"
                      >
                        Ver Detalles
                      </button>
                      <button 
                        onClick={() => handleApprove(suggestion.id)} 
                        className="text-green-400 hover:text-green-500 transition-colors"
                      >
                        Aprobar
                      </button>
                      <button 
                        onClick={() => openRejectSuggestionModal(suggestion)} 
                        className="text-red-400 hover:text-red-500 transition-colors"
                      >
                        Rechazar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedSuggestion && (
        <Modal 
          isOpen={isDetailModalOpen} 
          onClose={() => setIsDetailModalOpen(false)} 
          title={`Sugerencia para ${selectedSuggestion.Composer.first_name} ${selectedSuggestion.Composer.last_name}`}
          showSubmitButton={false}
          cancelText="Cerrar"
        >
          <div className="text-gray-300">
            <div className="mb-6 p-4 bg-purple-900/30 border border-purple-700 rounded-lg">
              <p className="font-bold text-purple-400 mb-2">Motivo de la sugerencia:</p>
              <p className="text-gray-200">{selectedSuggestion.reason}</p>
            </div>
            
            {getChangedFields.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-600">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Campo</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Valor Original</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Valor Sugerido</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {getChangedFields.map((change, index) => (
                      <tr key={index} className="bg-gray-800/50">
                        <td className="px-4 py-3 font-semibold text-purple-300 align-top">{change.field}</td>
                        {change.isPhoto ? (
                          <>
                            <td className="px-4 py-3 text-red-400">
                              {change.original !== 'No especificado' ? (
                                <img src={change.original} alt="Original" className="h-24 w-24 object-cover rounded-md shadow-md"/>
                              ) : (
                                <span className="italic">{change.original}</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-green-400">
                              {change.suggested ? (
                                <img src={change.suggested} alt="Sugerida" className="h-24 w-24 object-cover rounded-md shadow-md"/>
                              ) : (
                                <span className="italic">No sugerida</span>
                              )}
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-4 py-3 text-red-400">
                              <span className="line-through">{change.original}</span>
                            </td>
                            <td className="px-4 py-3 text-green-400 font-medium">{change.suggested}</td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-400 text-center py-4">No se detectaron cambios específicos.</p>
            )}
          </div>
        </Modal>
      )}

      {/* Reject Suggestion Modal */}
      {isRejectModalOpenForSuggestion && currentSuggestionToReject && (
        <Modal
          isOpen={isRejectModalOpenForSuggestion}
          onClose={() => {
            setIsRejectModalOpenForSuggestion(false);
            setRejectionReasonForSuggestion('');
            setCurrentSuggestionToReject(null);
          }}
          onSubmit={handleRejectSuggestionSubmit}
          title={`Rechazar Sugerencia para ${currentSuggestionToReject.Composer.first_name} ${currentSuggestionToReject.Composer.last_name}`}
          submitText="Confirmar Rechazo"
          cancelText="Cancelar"
          showSubmitButton={true}
        >
          <div className="space-y-4">
            <p className="text-gray-300">
              Especifique el motivo por el cual esta sugerencia de edición será rechazada.
            </p>
            <textarea
              value={rejectionReasonForSuggestion}
              onChange={(e) => setRejectionReasonForSuggestion(e.target.value)}
              placeholder="Ejemplo: Información incorrecta, no se proporcionan fuentes, duplicado, etc."
              className="w-full p-3 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              rows="4"
              required
            />
          </div>
        </Modal>
      )}
    </>
  );
};

// --- Add Composer Manager Component ---
const AddComposerManager = ({ onComposerAdded, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddComposer = useCallback(async (composerData) => {
    try {
      setIsSubmitting(true);
      await api.addComposerAsAdmin(composerData);
      toast.success('Compositor añadido y publicado exitosamente!');
      onComposerAdded?.();
    } catch (error) {
      console.error('Error al añadir compositor:', error);
      toast.error(error.response?.data?.error || 'No se pudo añadir el compositor.');
    } finally {
      setIsSubmitting(false);
    }
  }, [onComposerAdded]);

  return (
    <div className="bg-white/5 backdrop-blur-lg p-6 rounded-lg shadow-xl mt-10">
      <div className="mb-4">
        <h3 className="text-2xl font-bold text-white">Añadir Nuevo Compositor</h3>
        <p className="text-gray-400 mt-2">Los compositores añadidos por administradores se publican automáticamente.</p>
      </div>
      
      {isSubmitting && <LoadingSpinner message="Añadiendo compositor..." />}
      
      <AddComposerForm 
        onComposerAdded={handleAddComposer} 
        onCancel={onCancel} 
        initialData={{ isAdminAdd: true }}
        disabled={isSubmitting}
      />
    </div>
  );
};

// --- Task Table Component ---
const TaskTable = ({ 
  tasks, 
  loading, 
  onGradeTask, 
  showGradeAction = false, 
  emptyMessage = "No hay tareas disponibles." 
}) => {
  if (loading) return <LoadingSpinner message="Cargando tareas..." />;
  
  if (tasks.length === 0) {
    return <p className="text-gray-400 text-center py-8">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Cátedra</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Tarea</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Alumno</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Fecha</th>
            {showGradeAction ? (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Entrega</th>
            ) : (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Puntuación</th>
            )}
            {showGradeAction && (
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Acciones</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {tasks.map(task => (
            <tr key={task.id} className="hover:bg-gray-700/30 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">
                {task.catedra.nombre} ({task.catedra.anio})
              </td>
              <td className="px-6 py-4 text-sm font-medium text-gray-200 max-w-xs">
                <div className="truncate" title={task.titulo}>
                  {task.titulo}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {task.alumno.nombre} {task.alumno.apellido}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {task.alumno.email}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {new Date(task.submission_date).toLocaleDateString()}
              </td>
              {showGradeAction ? (
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <a 
                    href={`${process.env.REACT_APP_BACKEND_URL}${task.submission_path}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-400 hover:text-blue-500 transition-colors"
                  >
                    Ver Archivo
                  </a>
                </td>
              ) : (
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className="font-bold text-green-400">
                    {task.puntos_obtenidos} / {task.puntos_posibles}
                  </span>
                </td>
              )}
              {showGradeAction && (
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={() => onGradeTask(task)} 
                    className="text-green-400 hover:text-green-500 transition-colors"
                  >
                    Calificar
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// --- Main Component ---
function AdminDashboardPage({ handleLogout }) {
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(TABS.CONTRIBUTIONS);
  const [submittedTasks, setSubmittedTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [gradedTasks, setGradedTasks] = useState([]);
  const [loadingGradedTasks, setLoadingGradedTasks] = useState(false);
  
  // Modal states
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [taskToGrade, setTaskToGrade] = useState(null);
  const [gradePoints, setGradePoints] = useState(0);
  const [gradeFeedback, setGradeFeedback] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [currentContribution, setCurrentContribution] = useState(null);
  
  const navigate = useNavigate();

  // Check authentication
  const checkAuth = useCallback(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      handleLogout();
      return false;
    }
    return true;
  }, [handleLogout]);

  // Generic error handler
  const handleApiError = useCallback((error, defaultMessage) => {
    console.error(error);
    
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      handleLogout();
      return;
    }
    
    const message = error.response?.data?.error || defaultMessage;
    toast.error(message);
    return message;
  }, [handleLogout]);

  // Load contributions
  const loadContributions = useCallback(async () => {
    if (!checkAuth()) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await api.getPendingComposers();
      setContributions(response.data);
    } catch (err) {
      const errorMessage = handleApiError(err, 'No se pudieron cargar los aportes.');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [checkAuth, handleApiError]);

  // Load submitted tasks
  const loadSubmittedTasks = useCallback(async () => {
    if (!checkAuth()) return;
    
    try {
      setLoadingTasks(true);
      const response = await api.getSubmittedTasks();
      setSubmittedTasks(response.data);
    } catch (err) {
      handleApiError(err, 'No se pudieron cargar las tareas entregadas.');
    } finally {
      setLoadingTasks(false);
    }
  }, [checkAuth, handleApiError]);

  // Load graded tasks
  const loadGradedTasks = useCallback(async () => {
    if (!checkAuth()) return;
    
    try {
      setLoadingGradedTasks(true);
      const response = await api.getGradedTasks();
      setGradedTasks(response.data);
    } catch (err) {
      handleApiError(err, 'No se pudieron cargar las tareas calificadas.');
    } finally {
      setLoadingGradedTasks(false);
    }
  }, [checkAuth, handleApiError]);

  // Load data based on active tab
  useEffect(() => {
    switch (activeTab) {
      case TABS.CONTRIBUTIONS:
        loadContributions();
        break;
      case TABS.SUBMITTED_TASKS:
        loadSubmittedTasks();
        break;
      case TABS.GRADED_TASKS:
        loadGradedTasks();
        break;
      default:
        break;
    }
  }, [activeTab, loadContributions, loadSubmittedTasks, loadGradedTasks]);

  // Handlers
  const handleApprove = useCallback(async (id) => {
    try {
      await api.updateComposerStatus(id, { status: 'PUBLISHED' });
      toast.success('Aporte aprobado exitosamente!');
      setContributions(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      handleApiError(error, 'Error al aprobar el aporte.');
    }
  }, [handleApiError]);

  const openReviewModal = useCallback((contribution) => {
    setCurrentContribution(contribution);
    setIsReviewModalOpen(true);
  }, []);

  const handleReviewSubmit = useCallback(async () => {
    if (!rejectionReason.trim()) {
      toast.error('Por favor ingrese un motivo para la revisión.');
      return;
    }

    try {
      await api.reviewComposer(currentContribution.id, rejectionReason);
      toast.success('Aporte remitido para revisión!');
      setContributions(prev => prev.filter(c => c.id !== currentContribution.id));
      setIsReviewModalOpen(false);
      setRejectionReason('');
      setCurrentContribution(null);
    } catch (error) {
      handleApiError(error, 'Error al remitir el aporte.');
    }
  }, [currentContribution, rejectionReason, handleApiError]);

  const openGradeModal = useCallback((task) => {
    setTaskToGrade(task);
    setGradePoints(task.puntos_posibles);
    setGradeFeedback('');
    setIsGradeModalOpen(true);
  }, []);

  const handleGradeSubmit = useCallback(async () => {
    if (gradePoints < 0 || gradePoints > taskToGrade.puntos_posibles) {
      toast.error(`Los puntos deben estar entre 0 y ${taskToGrade.puntos_posibles}.`);
      return;
    }

    try {
      await api.gradeTask(taskToGrade.id, { 
        puntos_obtenidos: gradePoints, 
        feedback: gradeFeedback.trim() 
      });
      
      toast.success('Tarea calificada exitosamente!');
      
      // Update state
      const gradedTask = { 
        ...taskToGrade, 
        puntos_obtenidos: gradePoints, 
        feedback: gradeFeedback, 
        estado: 'CALIFICADA' 
      };
      
      setSubmittedTasks(prev => prev.filter(t => t.id !== taskToGrade.id));
      setGradedTasks(prev => [gradedTask, ...prev].sort((a, b) => 
        new Date(b.submission_date) - new Date(a.submission_date)
      ));
      
      // Close modal and reset state
      setIsGradeModalOpen(false);
      setTaskToGrade(null);
      setGradePoints(0);
      setGradeFeedback('');
    } catch (error) {
      handleApiError(error, 'Error al calificar la tarea.');
    }
  }, [taskToGrade, gradePoints, gradeFeedback, handleApiError]);

  const openDetailModal = useCallback((contribution) => {
    setCurrentContribution(contribution);
    setIsDetailModalOpen(true);
  }, []);

  // Computed values
  const currentMissingFields = useMemo(() => {
    return currentContribution ? evaluateContribution(currentContribution).missing : [];
  }, [currentContribution]);

  // Render main content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case TABS.CONTRIBUTIONS:
        return (
          <div className="bg-white/5 backdrop-blur-lg p-6 rounded-lg shadow-xl">
            <h3 className="text-2xl font-bold mb-6">Aportes Pendientes de Revisión</h3>
            
            {loading && <LoadingSpinner message="Cargando aportes..." />}
            {error && <ErrorMessage message={error} onRetry={loadContributions} />}
            
            {!loading && !error && (
              <>
                {contributions.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No hay aportes pendientes.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                      <thead className="bg-gray-800">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Compositor</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Aportante</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Puntaje</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800">
                        {contributions.map((contribution) => {
                          const { score, total, missing } = evaluateContribution(contribution);
                          return (
                            <tr 
                              key={contribution.id} 
                              className="hover:bg-gray-700/30 cursor-pointer transition-colors" 
                              onClick={() => openDetailModal(contribution)}
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">
                                {contribution.first_name} {contribution.last_name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                {contribution.is_student_contribution ? (
                                  <span className="font-bold text-green-400">
                                    Alumno: {contribution.student_first_name} {contribution.student_last_name}
                                  </span>
                                ) : (
                                  <span className="text-gray-400">Público General</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                {contribution.email}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-mono" title={`Campos faltantes: ${missing.join(', ')}`}>
                                <div className="flex items-center space-x-2">
                                  <span className={score === total ? 'text-green-400' : 'text-yellow-400'}>
                                    {score} / {total}
                                  </span>
                                  {missing.length > 0 && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-900/30 text-red-400 border border-red-700">
                                      Faltan: {missing.length}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2" onClick={(e) => e.stopPropagation()}>
                                <button 
                                  onClick={() => handleApprove(contribution.id)} 
                                  className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
                                >
                                  Aprobar
                                </button>
                                <button 
                                  onClick={() => openReviewModal(contribution)} 
                                  className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
                                >
                                  Remitir
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        );

      case TABS.SUGGESTIONS:
        return <SuggestionsManager />;
        
      case TABS.ADD:
        return (
          <AddComposerManager 
            onComposerAdded={() => setActiveTab(TABS.CONTRIBUTIONS)}
            onCancel={() => setActiveTab(TABS.CONTRIBUTIONS)}
          />
        );

      case TABS.ACADEMIC:
        return (
          <div className="bg-white/5 backdrop-blur-lg p-6 rounded-lg shadow-xl text-center">
            <h3 className="text-2xl font-bold mb-6">Gestión Académica</h3>
            <p className="text-gray-400 mb-8">Administre las cátedras y estudiantes del sistema.</p>
            <div className="flex justify-center gap-6">
              <button 
                onClick={() => navigate('/admin/catedras')} 
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Gestionar Cátedras
              </button>
              <button 
                onClick={() => navigate('/admin/alumnos')} 
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-2.239" />
                </svg>
                Gestionar Alumnos
              </button>
            </div>
          </div>
        );

      case TABS.SUBMITTED_TASKS:
        return (
          <div className="bg-white/5 backdrop-blur-lg p-6 rounded-lg shadow-xl">
            <h3 className="text-2xl font-bold mb-6">Tareas Entregadas para Calificar</h3>
            <TaskTable
              tasks={submittedTasks}
              loading={loadingTasks}
              onGradeTask={openGradeModal}
              showGradeAction={true}
              emptyMessage="No hay tareas entregadas pendientes de calificación."
            />
          </div>
        );

      case TABS.GRADED_TASKS:
        return (
          <div className="bg-white/5 backdrop-blur-lg p-6 rounded-lg shadow-xl">
            <h3 className="text-2xl font-bold mb-6">Tareas Calificadas</h3>
            <TaskTable
              tasks={gradedTasks}
              loading={loadingGradedTasks}
              showGradeAction={false}
              emptyMessage="No hay tareas calificadas aún."
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Panel de Administración
              </h2>
              <p className="text-gray-400 mt-2">Gestione aportes, sugerencias y tareas académicas</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right text-sm text-gray-400">
                <p>Sesión activa</p>
                <p>Administrador</p>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Tab Content */}
          {renderTabContent()}
        </div>
      </div>

      {/* Modals */}
      
      {/* Review Modal */}
      <Modal 
        isOpen={isReviewModalOpen} 
        onClose={() => {
          setIsReviewModalOpen(false);
          setRejectionReason('');
          setCurrentContribution(null);
        }} 
        onSubmit={handleReviewSubmit} 
        title="Remitir Aporte para Revisión"
        submitText="Enviar para Revisión"
        cancelText="Cancelar"
      >
        <div className="space-y-4">
          <p className="text-gray-300">
            Especifique el motivo por el cual este aporte necesita revisión por parte del contribuyente.
          </p>
          <textarea 
            value={rejectionReason} 
            onChange={(e) => setRejectionReason(e.target.value)} 
            placeholder="Ejemplo: Faltan referencias bibliográficas, la biografía necesita más detalles, etc..." 
            className="w-full p-3 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500" 
            rows="4"
            required
          />
          <p className="text-xs text-gray-400">
            El contribuyente recibirá un correo con estas observaciones y podrá realizar las correcciones necesarias.
          </p>
        </div>
      </Modal>

      {/* Detail Modal */}
      {currentContribution && (
        <Modal 
          isOpen={isDetailModalOpen} 
          onClose={() => {
            setIsDetailModalOpen(false);
            setCurrentContribution(null);
          }} 
          showSubmitButton={false} 
          cancelText="Cerrar" 
          title={`Detalles del Aporte: ${currentContribution.first_name} ${currentContribution.last_name}`}
        >
          <div className="text-gray-300 space-y-6 max-h-96 overflow-y-auto">
            {/* Missing Fields Alert */}
            {currentMissingFields.length > 0 && (
              <div className="p-4 bg-red-900/30 border border-red-700 rounded-lg">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="font-bold text-red-400 mb-2">Campos Faltantes ({currentMissingFields.length}):</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {currentMissingFields.map((field, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-800/30 text-red-300 border border-red-600">
                          {field}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Contribution Details */}
            <div className="grid gap-4">
              {Object.entries(currentContribution)
                .filter(([key]) => !['id', 'created_at', 'updated_at', 'status', 'ip_address', 'rejection_reason', 'suggestion_reason'].includes(key))
                .map(([key, value]) => (
                  <div key={key} className="border-b border-gray-700 pb-2">
                    <div className="flex justify-between items-start">
                      <p className="font-semibold text-purple-400 capitalize text-sm">
                        {FIELD_LABELS[key] || key.replace(/_/g, ' ')}:
                      </p>
                      <div className="max-w-xs text-right">
                        {value && (Array.isArray(value) ? value.length > 0 : true) ? (
                          <p className="text-gray-200">
                            {Array.isArray(value) ? value.join(', ') : value}
                          </p>
                        ) : (
                          <p className="text-red-400 italic">No especificado</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {/* Metadata */}
            <div className="pt-4 border-t border-gray-600 text-xs text-gray-400">
              <p>Fecha de creación: {new Date(currentContribution.created_at).toLocaleString()}</p>
              {currentContribution.updated_at && (
                <p>Última actualización: {new Date(currentContribution.updated_at).toLocaleString()}</p>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Grade Task Modal */}
      {isGradeModalOpen && taskToGrade && (
        <Modal
          isOpen={isGradeModalOpen}
          onClose={() => {
            setIsGradeModalOpen(false);
            setTaskToGrade(null);
            setGradePoints(0);
            setGradeFeedback('');
          }}
          title={`Calificar Tarea: ${taskToGrade.titulo}`}
          onSubmit={handleGradeSubmit}
          submitText="Guardar Calificación"
          cancelText="Cancelar"
          showSubmitButton={true}
        >
          <div className="space-y-6">
            {/* Student Info */}
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <h4 className="font-semibold text-purple-400 mb-2">Información del Estudiante</h4>
              <p className="text-gray-300">
                <span className="font-medium">Alumno:</span> {taskToGrade.alumno.nombre} {taskToGrade.alumno.apellido}
              </p>
              <p className="text-gray-300">
                <span className="font-medium">Email:</span> {taskToGrade.alumno.email}
              </p>
              <p className="text-gray-300">
                <span className="font-medium">Cátedra:</span> {taskToGrade.catedra.nombre} ({taskToGrade.catedra.anio})
              </p>
            </div>

            {/* Task Info */}
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <h4 className="font-semibold text-purple-400 mb-2">Información de la Tarea</h4>
              <p className="text-gray-300 mb-2">{taskToGrade.descripcion}</p>
              <p className="text-sm text-gray-400">
                <span className="font-medium">Puntos Posibles:</span> {taskToGrade.puntos_posibles}
              </p>
              <p className="text-sm text-gray-400">
                <span className="font-medium">Fecha de Entrega:</span> {new Date(taskToGrade.submission_date).toLocaleString()}
              </p>
            </div>

            {/* Grading Form */}
            <div className="space-y-4">
              <div>
                <label htmlFor="gradePoints" className="block text-sm font-medium text-gray-300 mb-2">
                  Puntos Obtenidos: <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="gradePoints"
                    value={gradePoints}
                    onChange={(e) => setGradePoints(Math.max(0, Math.min(taskToGrade.puntos_posibles, parseInt(e.target.value, 10) || 0)))}
                    min="0"
                    max={taskToGrade.puntos_posibles}
                    className="w-full p-3 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    placeholder="0"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-400 text-sm">/ {taskToGrade.puntos_posibles}</span>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="gradeFeedback" className="block text-sm font-medium text-gray-300 mb-2">
                  Comentarios y Retroalimentación:
                </label>
                <textarea
                  id="gradeFeedback"
                  value={gradeFeedback}
                  onChange={(e) => setGradeFeedback(e.target.value)}
                  rows="4"
                  className="w-full p-3 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  placeholder="Proporcione comentarios constructivos sobre el trabajo del estudiante..."
                />
              </div>
            </div>

            <div className="bg-blue-900/30 border border-blue-700 p-3 rounded-lg">
              <p className="text-xs text-blue-300">
                <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                El estudiante recibirá automáticamente una notificación por correo electrónico con su calificación y comentarios.
              </p>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

export default AdminDashboardPage;