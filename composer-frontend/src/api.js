import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('docenteToken') || localStorage.getItem('adminToken') || localStorage.getItem('userToken') || localStorage.getItem('token'); // Priorizar docenteToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});


apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.log("401 Unauthorized received, clearing tokens.");
      localStorage.removeItem('docenteToken');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('userToken');
      localStorage.removeItem('token');
      if (localStorage.getItem('adminToken')) {
        window.location.href = '/admin-login';
      } else if (localStorage.getItem('docenteToken')) {
        window.location.href = '/docente-login';
      } else if (localStorage.getItem('userToken')) {
        window.location.href = '/alumno-login';
      } else {
        window.location.href = '/login'; // Default login page
      }
    }
    return Promise.reject(error);
  }
);

// ==== Endpoints para Alumnos ====
const api = {
  get: (...args) => apiClient.get(...args),
  post: (...args) => apiClient.post(...args),
  put: (...args) => apiClient.put(...args),
  delete: (...args) => apiClient.delete(...args),
  submitEvaluationManuallyByDocente: (catedraId, alumnoId, evaluationId, selectedAnswers) => apiClient.post(`/docente/catedra/${catedraId}/alumnos/${alumnoId}/evaluaciones/${evaluationId}/manual-submit`, { selectedAnswers }),

  // ==== Endpoints para Alumnos ====
  getAlumnos: () => apiClient.get('/admin/alumnos'),
  getEnrollmentCandidates: () => apiClient.get('/admin/enrollment-candidates'), //CRUSH
  getAlumno: (id) => apiClient.get(`/alumnos/${id}`),
  createAlumno: (data) => apiClient.post('/alumnos', data),
  updateAlumno: (id, data) => apiClient.put(`/alumnos/${id}`, data),
  deleteAlumno: (id) => apiClient.delete(`/alumnos/${id}`),
  getContributingStudents: () => apiClient.get('/api/alumnos/contributing'),// CRUSH


  // ==== Endpoints para Compositores ====
  getComposers: (page = 1, limit = 10) => apiClient.get(`/composers?page=${page}&limit=${limit}`),
  getComposerById: (id) => apiClient.get(`/composers/${id}`),
  addComposer: (data) => apiClient.post('/composers', data),
  updateComposer: (id, data) => apiClient.put(`/composers/${id}`, data),
  deleteComposer: (id) => apiClient.delete(`/composers/${id}`),
  searchComposers: (query) => apiClient.get(`/composers/search?query=${query}`),
  getRandomComposer: () => apiClient.get('/composers/random'),
  getComposerOfTheDay: () => apiClient.get('/composers/day'),
  getComposerBySlug: (slug) => apiClient.get(`/composers/slug/${slug}`),
  addComposerAsAdmin: (data) => apiClient.post('/composers/admin-create', data),
  updateComposerStatus: (id, data) => apiClient.put(`/composers/${id}/status`, data),
  reviewComposer: (id, data) => apiClient.post(`/admin/composers/${id}/review`, data),
  getPendingComposers: () => apiClient.get('/composers/pending'),
  resubmitContribution: (id, data) => apiClient.put(`/composers/resubmit/${id}`, data),

  // ==== Endpoints para Sugerencias de Edición ====
  submitEditSuggestion: (id, data) => apiClient.post(`/${id}/suggestions`, data),
  getPendingSuggestions: () => apiClient.get('/composers/admin/suggestions'),
  approveSuggestion: (id) => apiClient.post(`/composers/admin/suggestions/${id}/approve`),
  rejectSuggestion: (id, data) => apiClient.post(`/composers/admin/suggestions/${id}/reject`, data),

  // ==== Endpoints para Ranking ====
  getRanking: () => apiClient.get('/ranking'),

  // ==== Endpoints para Ratings ====
  postRating: (composerId, rating_value) => apiClient.post('/ratings', { composerId, rating_value }),
  getRatingForComposer: (composerId) => apiClient.get(`/ratings/${composerId}`),

  // ==== Endpoints para Comentarios de Compositores ====
  getComposerComments: (composerId) => apiClient.get(`/composers/comments/${composerId}`),
  addComposerComment: (composerId, text, name) => apiClient.post(`/composers/comments/${composerId}`, { text, name }),

  // ==== Endpoints de Autenticación de Usuario (Alumnos) ====
  requestOtp: (email) => apiClient.post('/request-otp', { email }),
  verifyOtp: (email, otp) => apiClient.post('/alumnos/verify-otp', { email, otp }),
  getAlumnoMe: () => apiClient.get('/alumnos/me'),

  getStudentCatedras: () => apiClient.get('/alumnos/me/catedras'),

  // ==== Endpoints para Tareas de Alumnos ====
  getAlumnoTareas: () => apiClient.get('/alumnos/me/tareas'),
  getTareaAsignacionById: (tareaAsignacionId) => apiClient.get(`/tareas/${tareaAsignacionId}`),
  submitTaskDelivery: (tareaAsignacionId, files) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file); // Usa 'files' como nombre de campo para el backend
    });
    return apiClient.post(`tareas/${tareaAsignacionId}/submit`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  // ==== Endpoints para Evaluaciones de Alumnos ====
  getMyEvaluations: () => apiClient.get('/alumnos/me/evaluaciones'),
  getEvaluationForStudent: (evaluationId) => apiClient.get(`/alumnos/me/evaluaciones/${evaluationId}`),
  submitEvaluation: (evaluationId, data) => apiClient.post(`/alumnos/me/evaluaciones/${evaluationId}/submit`, data),
  getAlumnoEvaluationResults: (catedraId, evaluationId) => apiClient.get(`/alumnos/me/catedra/${catedraId}/evaluaciones/${evaluationId}/results`),

  // NUEVO ENDPOINT - Obtener Calificación Final del Alumno
  getAlumnoFinalGrade: (catedraId) => apiClient.get(`/alumnos/me/catedra/${catedraId}/calificacionFinal`),

  // ==== NUEVO ENDPOINT - Resultados de evaluación de alumno para docente ===
  getDocenteEvaluationResults: (catedraId, alumnoId, evaluationId) => apiClient.get(`/docente/catedras/${catedraId}/alumnos/${alumnoId}/evaluaciones/${evaluationId}/results`),
  gradeEvaluation: (catedraId, alumnoId, evaluationAssignmentId, data) => apiClient.put(`/docente/catedras/${catedraId}/alumnos/${alumnoId}/evaluaciones/${evaluationAssignmentId}/grade`, data),
  getAlumnoResponsesForEvaluation: (catedraId, alumnoId, evaluationId) => apiClient.get(`/docente/catedra/${catedraId}/alumnos/${alumnoId}/evaluaciones/${evaluationId}/responses`),
  
  updateAlumnoEvaluationAnswers: (asignacionId, studentId, respuestas) => 
  apiClient.put(`/docente/evaluaciones/asignacion/${asignacionId}/respuestas`, { studentId, respuestas }),

  // NUEVO ENDPOINT - Resultados de evaluación por asignacionId para docente
  getDocenteEvaluationResultsByAssignmentId: (asignacionId) => apiClient.get(`/docente/evaluaciones/asignacion/${asignacionId}/results`),

  // ==== Endpoints para Publicaciones (Tablón) ====
  fetchPublicCatedras: () => apiClient.get('/public/catedras'),
  fetchPublicCatedraById: (id) => apiClient.get(`/public/catedras/${id}`),
  getPublicaciones: (catedraId) => apiClient.get(`/publicaciones/catedra/${catedraId}`),
  getMyPublicaciones: () => apiClient.get('/alumnos/me/publicaciones'),
  createPublicacion: (catedraId, data) => apiClient.post(`/catedras/${catedraId}/publicaciones`, data),
  updatePublicacion: (catedraId, publicacionId, data) => apiClient.put(`/catedras/${catedraId}/publicaciones/${publicacionId}`, data),
  deletePublicacion: (catedraId, publicacionId) => apiClient.delete(`/catedras/${catedraId}/publicaciones/${publicacionId}`),
  togglePublicacionVisibility: (publicacionId, catedraId) => apiClient.put(`/publicaciones/${publicacionId}/toggle-visibility`, { catedraId }),
  createComentario: (publicacionId, data) => apiClient.post(`/publicaciones/${publicacionId}/comentarios`, data),
  deleteComentario: (publicacionId, comentarioId) => apiClient.delete(`/publicaciones/${publicacionId}/comentarios/${comentarioId}`),
  addInteraction: (publicacionId) => apiClient.post(`/publicaciones/${publicacionId}/interacciones`),
  removeInteraction: (publicacionId) => apiClient.delete(`/publicaciones/${publicacionId}/interacciones`),

  // ==== Endpoints para Admin (Tareas) ====
  getSubmittedTasks: () => apiClient.get('/admin/tareas/entregadas'),
  getGradedTasks: () => apiClient.get('/admin/tareas/calificadas'),
  gradeTask: (tareaAsignacionId, data) => apiClient.post(`/admin/tareas/${tareaAsignacionId}/calificar`, data),
  // ==== Endpoints para Admin (Dashboard Counts) ====
  getAdminDashboardCounts: () => apiClient.get('/admin/dashboard-counts'),

  // ==== Endpoints para Admin (Docentes) ====
  getDocentes: () => apiClient.get('/admin/docentes'),

  // ==== Endpoints para Admin (Cátedras) ====
  getCatedras: () => apiClient.get('/admin/catedras'),
  getCatedra: (id) => apiClient.get(`/admin/catedras/${id}`),
  createCatedra: (data) => apiClient.post('/admin/catedras', data),
  updateCatedra: (id, data) => apiClient.put(`/admin/catedras/${id}`, data),
  deleteCatedra: (id) => apiClient.delete(`/admin/catedras/${id}`),
  inscribirAlumno: (catedraId, alumnoId, composerId, diaCobro) => apiClient.post(`/admin/catedras/${catedraId}/inscribir`, { alumnoId, composerId, diaCobro }),
  // Nueva función para desinscribir alumno
  desinscribirAlumno: (catedraId, alumnoId, composerId) => {
    if (alumnoId) {
      return apiClient.delete(`/admin/catedras/${catedraId}/alumnos/${alumnoId}/desinscribir`);
    } else if (composerId) {
      return apiClient.delete(`/admin/catedras/${catedraId}/composers/${composerId}/desinscribir`);
    }
    return Promise.reject(new Error('Se requiere alumnoId o composerId para desinscribir.'));
  },
  updateCatedraAlumno: (catedraAlumnoId, data) => apiClient.put(`/admin/catedraalumnos/${catedraAlumnoId}`, data),

  // ==== Endpoints para Docentes (Cátedras) ====
  getDocenteCatedras: () => apiClient.get('/docente/me/catedras'),
  getDocentePlanesDeClase: (catedraId) => apiClient.get(`/docente/me/catedra/${catedraId}/planes`),
  getDocenteCatedraDetalles: (catedraId) => apiClient.get(`/docente/me/catedra/${catedraId}`),
  createDiaClase: (catedraId, data) => apiClient.post(`/docente/catedra/${catedraId}/diasclase`, data),
  getDocenteDiasClase: (catedraId) => apiClient.get(`/docente/catedra/${catedraId}/diasclase`),
  updateDiaClase: (catedraId, diaClaseId, data) => apiClient.put(`/docente/catedra/${catedraId}/diasclase/${Number(diaClaseId)}`, data),
  deleteDiaClase: (catedraId, diaClaseId) => apiClient.delete(`/docente/catedra/${catedraId}/diasclase/${Number(diaClaseId)}`),
  toggleAsistencia: (catedraId, diaClaseId, alumnoId, presente) => apiClient.post(`/docente/catedra/${catedraId}/diasclase/${diaClaseId}/toggle-asistencia`, { alumnoId, presente }),

  // ==== Endpoints para Docentes (Evaluaciones) ====
  getDocenteEvaluacionesMaestras: (catedraId) => apiClient.get(`/docente/catedra/${catedraId}/evaluaciones-maestras`),
  generateDocenteEvaluation: (catedraId, data) => apiClient.post(`/docente/catedra/${catedraId}/generate-evaluation`, data),

  getEvaluationDetailForDocente: (evaluationId) => apiClient.get(`/docente/evaluaciones/${evaluationId}`),
  assignEvaluationToAlumnos: (catedraId, evaluationId, data) => apiClient.post(`/docente/catedra/${catedraId}/evaluaciones/${evaluationId}/assign`, data),
  getAssignedEvaluationStudents: (catedraId, evaluationId) => apiClient.get(`/docente/catedra/${catedraId}/evaluaciones/${evaluationId}/assignments`),

  deleteDocenteEvaluation: (catedraId, evaluationId) => apiClient.delete(`/docente/catedra/${catedraId}/evaluaciones/${evaluationId}`),
  //Edición de preguntas de evaluación
  updateEvaluationQuestions: (evaluationId, data) => apiClient.put(`/docente/evaluaciones/${evaluationId}/preguntas`, data),
  updateDocenteEvaluation: (evaluationId, data) => apiClient.put(`/docente/evaluaciones/${evaluationId}`, data),

  // ==== NUEVO ENDPOINT - Detalles completos de evaluación para docente ====
  getEvaluationDetail: (evaluationId) => apiClient.get(`/docente/evaluaciones/${evaluationId}`),

  // ==== Endpoints para Docentes (Autenticación) ====
  requestDocenteOtp: (email) => apiClient.post('/docente/request-otp', { email }),
  verifyDocenteOtp: (email, otp) => apiClient.post('/docente/verify-otp', { email, otp }),
  getDocenteMe: () => apiClient.get('/docente/me'),

  // ==== Endpoints para Docentes (Alumnos) ====
  getDocenteAlumnoPagos: (alumnoId) => apiClient.get(`/docente/alumnos/${alumnoId}/pagos`),
  getAttendanceByDiaClase: (catedraId, diaClaseId) => apiClient.get(`/docente/catedra/${catedraId}/diasclase/${diaClaseId}/asistencias`),
  getAnnualAttendance: (catedraId, year) => apiClient.get(`/docente/catedra/${catedraId}/asistencias/anual/${year}`),

  // ==== Endpoints para Docentes (Planes de Clase) ====
  createPlanDeClases: (catedraId, data) => apiClient.post(`/docente/catedra/${catedraId}/planes`, data),
  updatePlanDeClases: (planId, data) => apiClient.put(`/docente/me/planes/${planId}`, data),
  deletePlanDeClases: (planId) => apiClient.delete(`/docente/me/planes/${planId}`),
  createUnidadPlan: (planId, data) => apiClient.post(`/docente/me/planes/${planId}/unidades`, data),
  getUnidadesPlanPorPlan: (planId) => apiClient.get(`/docente/me/planes/${planId}/unidades-plan`),
  updateUnidadPlan: (unidadId, data) => apiClient.put(`/docente/me/unidades/${unidadId}`, data),
  deleteUnidadPlan: (unidadId) => apiClient.delete(`/docente/me/unidades/${unidadId}`),

  // ==== Endpoints para Docentes (Asignacion de Tarea Maestra) ====
  assignTareaToAlumnos: (catedraId, tareaMaestraId, data) => apiClient.post(`/docente/catedra/${catedraId}/tareas-maestras/${tareaMaestraId}/assign`, data),
  getAssignedTaskStudents: (catedraId, tareaMaestraId) => apiClient.get(`/docente/catedra/${catedraId}/tareas-maestras/${tareaMaestraId}/assignments`),

  // ==== Endpoints para Docentes (Alumno Detalles y Entregas) ====
  getEntregasForAlumno: (catedraId, alumnoId) => apiClient.get(`/docente/catedra/${catedraId}/alumnos/${alumnoId}/entregas`),
  getEvaluacionesForAlumno: (catedraId, alumnoId) => apiClient.get(`/docente/catedra/${catedraId}/alumnos/${alumnoId}/evaluaciones`),
  calificarTarea: (tareaAsignacionId, data) => apiClient.post(`/docente/tareasAsignaciones/${tareaAsignacionId}/calificar`, data),
  createTareaForDocenteCatedra: (catedraId, data) => apiClient.post(`/docente/catedra/${catedraId}/tareas`, data),
  updateTareaForDocenteCatedra: (catedraId, tareaMaestraId, data) => apiClient.put(`/docente/catedra/${catedraId}/tareas/${tareaMaestraId}`, data),
  deleteTareaForDocente: (catedraId, tareaMaestraId) => apiClient.delete(`/docente/catedra/${catedraId}/tareas/${tareaMaestraId}`),

  getTareasMaestrasPorUnidad: (catedraId, unidadId) => apiClient.get(`/docente/catedra/${catedraId}/unidad/${unidadId}/tareas-maestras`),
  getEvaluacionesPorUnidad: (catedraId, unidadId) => apiClient.get(`/docente/catedra/${catedraId}/unidad/${unidadId}/evaluaciones`),
  getUnidadContent: (catedraId, planDeClasesId, unidadId) => apiClient.get(`/docente/me/catedra/${catedraId}/plan/${planDeClasesId}/unidad/${unidadId}/contenido`),

  uploadTareaMultimedia: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/docente/upload/multimedia', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
export default api;