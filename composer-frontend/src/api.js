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
      // Optionally, redirect to login page
      // window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

// ==== Endpoints para Alumnos ====
const api = {
  // ==== Endpoints para Alumnos ====
  getAlumnos: () => apiClient.get('/admin/alumnos'),
  getEnrollmentCandidates: () => apiClient.get('/api/admin/enrollment-candidates'), //CRUSH
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
  getComposerBySlug: (slug) => apiClient.get(`/composers/slug/${slug}`),
  addComposerAsAdmin: (data) => apiClient.post('/admin/composers', data),
  updateComposerStatus: (id, data) => apiClient.put(`/admin/composers/${id}/status`, data),
  reviewComposer: (id, data) => apiClient.post(`/admin/composers/${id}/review`, data),
  getPendingComposers: () => apiClient.get('/composers/pending'),
  resubmitContribution: (id, data) => apiClient.put(`/composers/resubmit/${id}`, data),

  // ==== Endpoints para Sugerencias de Edición ====
  submitEditSuggestion: (id, data) => apiClient.post(`/composers/${id}/suggest-edit`, data),
  getPendingSuggestions: () => apiClient.get('/composers/admin/suggestions'),
  approveSuggestion: (id) => apiClient.post(`/composers/admin/suggestions/${id}/approve`),
  rejectSuggestion: (id) => apiClient.post(`/composers/admin/suggestions/${id}/reject`),

  // ==== Endpoints para Ranking ====
  getRanking: () => apiClient.get('/ranking'),

  // ==== Endpoints de Autenticación de Usuario (Alumnos) ====
  requestOtp: (email) => apiClient.post('/request-otp', { email }),
  verifyOtp: (email, otp) => apiClient.post('/alumnos/verify-otp', { email, otp }),
  getAlumnoMe: () => apiClient.get('/alumnos/me'),
  getMyStudentContributions: () => apiClient.get('/alumnos/me/contributions'),
  getStudentCatedras: () => apiClient.get('/alumnos/me/catedras'),

  // ==== Endpoints para Tareas de Alumnos ====
  getAlumnoTareas: () => apiClient.get('/alumnos/me/tareas'),
  getTareaAsignacionById: (tareaAsignacionId) => apiClient.get(`/tareas/${tareaAsignacionId}`),
  submitTaskDelivery: (tareaAsignacionId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post(`/tareas/${tareaAsignacionId}/submit`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  // ==== Endpoints para Evaluaciones de Alumnos ====
  getMyEvaluations: () => apiClient.get('/alumnos/me/evaluaciones'),
  getEvaluationForStudent: (evaluationId) => apiClient.get(`/alumnos/me/evaluaciones/${evaluationId}`),
  submitEvaluation: (evaluationId, responses) => apiClient.post(`/alumnos/me/evaluaciones/${evaluationId}/submit`, { responses }),
  getEvaluationResultsForStudent: (evaluationId) => apiClient.get(`/alumnos/me/evaluaciones/${evaluationId}/results`),

  // ==== Endpoints para Publicaciones (Tablón) ====
  getPublicaciones: (catedraId) => apiClient.get(`/catedras/${catedraId}/publicaciones`),
  createPublicacion: (catedraId, data) => apiClient.post(`/catedras/${catedraId}/publicaciones`, data),
  updatePublicacion: (catedraId, publicacionId, data) => apiClient.put(`/catedras/${catedraId}/publicaciones/${publicacionId}`, data),
  deletePublicacion: (catedraId, publicacionId) => apiClient.delete(`/catedras/${catedraId}/publicaciones/${publicacionId}`),
  togglePublicacionVisibility: (publicacionId, catedraId) => apiClient.put(`/publicaciones/${publicacionId}/toggle-visibility`, { catedraId }),
  createComentario: (publicacionId, data) => apiClient.post(`/publicaciones/${publicacionId}/comentarios`, data),
  deleteComentario: (publicacionId, comentarioId) => apiClient.delete(`/publicaciones/${publicacionId}/comentarios/${comentarioId}`),
  interactWithPublicacion: (publicacionId, tipo) => apiClient.post(`/publicaciones/${publicacionId}/interacciones`, { tipo }),
  uninteractWithPublicacion: (publicacionId, tipo) => apiClient.delete(`/publicaciones/${publicacionId}/interacciones`, { data: { tipo } }),

  // ==== Endpoints para Admin (Tareas) ====
  getSubmittedTasks: () => apiClient.get('/admin/tareas/entregadas'),
  getGradedTasks: () => apiClient.get('/admin/tareas/calificadas'),
  gradeTask: (tareaAsignacionId, data) => apiClient.post(`/admin/tareas/${tareaAsignacionId}/calificar`, data),
  // ==== Endpoints para Admin (Dashboard Counts) ====
  getAdminDashboardCounts: () => apiClient.get('/admin/dashboard-counts'),

  // ==== Endpoints para Admin (Cátedras) ====
  getCatedras: () => apiClient.get('/admin/catedras'),
  getCatedra: (id) => apiClient.get(`/admin/catedras/${id}`),
  createCatedra: (data) => apiClient.post('/admin/catedras', data),
  updateCatedra: (id, data) => apiClient.put(`/admin/catedras/${id}`, data),
  deleteCatedra: (id) => apiClient.delete(`/admin/catedras/${id}`),

  // ==== Endpoints para Docentes (Cátedras) ====
  getDocenteCatedras: () => apiClient.get('/docente/me/catedras'),
  getDocenteDiasClase: (catedraId) => apiClient.get(`/docente/me/catedra/${catedraId}/diasclase`),
  getDocentePlanesDeClaseForCatedra: (catedraId) => apiClient.get(`/docente/me/catedra/${catedraId}/planes`),
  getDocenteCatedraDetalles: (catedraId) => apiClient.get(`/docente/me/catedra/${catedraId}`),

  // ==== Endpoints para Docentes (Evaluaciones) ====
  getDocenteEvaluacionesMaestras: (catedraId) => apiClient.get(`/docente/catedra/${catedraId}/evaluaciones-maestras`),
  generateDocenteEvaluation: (catedraId, data) => apiClient.post(`/docente/catedra/${catedraId}/generate-evaluation`, data),
  assignEvaluationToAlumnos: (catedraId, evaluationId, alumnoIds, fecha_limite) => apiClient.post(`/docente/catedra/${catedraId}/evaluaciones/${evaluationId}/assign`, { alumnoIds, fecha_limite }),
  getDocenteEvaluationById: (evaluationId) => apiClient.get(`/docente/evaluaciones/${evaluationId}`),
  deleteDocenteEvaluation: (catedraId, evaluationId) => apiClient.delete(`/docente/catedra/${catedraId}/evaluaciones/${evaluationId}`),
  // ==== Endpoints para Docentes (Autenticación) ====
  requestDocenteOtp: (email) => apiClient.post('/docente/request-otp', { email }),
  verifyDocenteOtp: (email, otp) => apiClient.post('/docente/verify-otp', { email, otp }),

  // ==== Endpoints para Docentes (Alumnos) ====
  getDocenteAlumnoPagos: (alumnoId) => apiClient.get(`/docente/alumnos/${alumnoId}/pagos`),
  // ==== Endpoints para Docentes (Asignacion de Tarea Maestra) ====
  assignTareaToAlumnos: (catedraId, tareaMaestraId, data) => apiClient.post(`/docente/catedra/${catedraId}/tareas-maestras/${tareaMaestraId}/assign`, data),


  // ==== Endpoints para Docentes (Alumno Detalles y Entregas) ====
  getEntregasForAlumno: (catedraId, alumnoId) => apiClient.get(`/docente/catedra/${catedraId}/alumnos/${alumnoId}/entregas`),
  getEvaluacionesForAlumno: (catedraId, alumnoId) => apiClient.get(`/docente/catedra/${catedraId}/alumnos/${alumnoId}/evaluaciones`),
  calificarTarea: (tareaAsignacionId, data) => apiClient.post(`/docente/tareasAsignaciones/${tareaAsignacionId}/calificar`, data),
  createTareaForDocenteCatedra: (catedraId, data) => apiClient.post(`/docente/catedra/${catedraId}/tareas`, data),
  updateTareaForDocenteCatedra: (catedraId, tareaMaestraId, data) => apiClient.put(`/docente/catedra/${catedraId}/tareas/${tareaMaestraId}`, data),
  deleteTareaForDocente: (catedraId, tareaMaestraId) => apiClient.delete(`/docente/catedra/${catedraId}/tareas/${tareaMaestraId}`),
  

  uploadTareaMultimedia: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/docente/upload/multimedia', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
export default api;