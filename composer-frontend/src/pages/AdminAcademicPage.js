import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { LoadingSpinner, ErrorMessage } from './AdminDashboardPage';
import TaskTable from '../components/TaskTable';

const AdminAcademicPage = ({ handleLogout, initialSubTab }) => {
  const [submittedTasks, setSubmittedTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [gradedTasks, setGradedTasks] = useState([]);
  const [loadingGradedTasks, setLoadingGradedTasks] = useState(false);
  const [activeAcademicTab, setActiveAcademicTab] = useState(initialSubTab || 'overview');
  
  // Modal states for grading
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [taskToGrade, setTaskToGrade] = useState(null);
  const [gradePoints, setGradePoints] = useState(0);
  const [gradeFeedback, setGradeFeedback] = useState('');
  
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

  useEffect(() => {
    if (initialSubTab && initialSubTab !== activeAcademicTab) {
      setActiveAcademicTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Load data based on active tab
  useEffect(() => {
    switch (activeAcademicTab) {
      case 'pendingTasks':
        loadSubmittedTasks();
        break;
      case 'gradedTasks':
        loadGradedTasks();
        break;
      default:
        break;
    }
  }, [activeAcademicTab, loadSubmittedTasks, loadGradedTasks]);

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

  // Academic Tab Navigation Component
  const AcademicTabNavigation = () => {
    const tabs = [
      { id: 'overview', label: 'Resumen Académico' },
      { id: 'pendingTasks', label: 'Tareas Pendientes' },
      { id: 'gradedTasks', label: 'Tareas Calificadas' },
    ];

    return (
      <div className="mb-6 border-b border-gray-700">
        <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveAcademicTab(tab.id)}
              className={`${
                activeAcademicTab === tab.id
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

  // Render academic content based on active tab
  const renderAcademicContent = () => {
    switch (activeAcademicTab) {
      case 'overview':
        return (
          <div className="bg-white/5 backdrop-blur-lg p-6 rounded-lg shadow-xl text-center">
            <h3 className="text-2xl font-bold mb-6">Gestión Académica</h3>
            <p className="text-gray-400 mb-8">Administre las cátedras y estudiantes del sistema.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <button 
                onClick={() => navigate('/admin/catedras')} 
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Gestionar Cátedras
              </button>
              <button 
                onClick={() => navigate('/admin/alumnos')} 
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-2.239" />
                </svg>
                Gestionar Alumnos
              </button>
              <button 
                onClick={() => navigate('/admin/docentes')} 
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors shadow-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h2v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2h2m3-4H9m10-4a5 5 0 00-5-5H7a5 5 0 00-5 5v4h16v-4z" />
                </svg>
                Gestionar Docentes
              </button>
              <button 
                onClick={() => navigate('/admin/pagos')} 
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 transition-colors shadow-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Gestión de Pagos
              </button>
            </div>
          </div>
        );
        
      case 'pendingTasks':
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

      case 'gradedTasks':
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
    <div>
      <h3 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
        Módulo Académico
      </h3>
      
      <AcademicTabNavigation />
      {renderAcademicContent()}
      
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
    </div>
  );
};

export default AdminAcademicPage;