import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import TimelinePage from './pages/TimelinePage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminEvaluationPage from './pages/AdminEvaluationPage';
import MyContributionsPage from './pages/MyContributionsPage';
import RealizarEvaluacionPage from './pages/RealizarEvaluacionPage';
import MyEvaluationsPage from './pages/MyEvaluationsPage';
import GamificationPage from './pages/GamificationPage';
import AboutPage from './pages/AboutPage';
import CatedrasPage from './pages/CatedrasPage';
import CatedraDetailPage from './pages/CatedraDetailPage';
import AlumnosPage from './pages/AlumnosPage';
import DocentesPage from './pages/DocentesPage';
import DocenteLoginPage from './pages/DocenteLoginPage';
import AlumnoLoginPage from './pages/AlumnoLoginPage';
import DocenteDashboardPage from './pages/DocenteDashboardPage';
import AlumnoDashboardPage from './pages/AlumnoDashboardPage';
import DocenteCatedraDetailPage from './pages/DocenteCatedraDetailPage';
import DocenteAlumnoTareasPage from './pages/DocenteAlumnoTareasPage';
import DocenteTareaPage from './pages/DocenteTareaPage';
import DocenteEvaluationPage from './pages/DocenteEvaluationPage';
import DocenteGenerateEvaluationPage from './pages/DocenteGenerateEvaluationPage';
import DocenteEvaluationResultsPage from './pages/DocenteEvaluationResultsPage';
import Footer from './components/Footer';
import Header from './components/Header';
import PrivateRoute from './components/PrivateRoute';
import DocentePrivateRoute from './components/DocentePrivateRoute';
import AddComposerForm from './components/AddComposerForm';

function AppContent() {
  const [isAdmin, setIsAdmin] = useState(!!localStorage.getItem('adminToken'));
  const [isDocente, setIsDocente] = useState(!!localStorage.getItem('docenteToken'));
  const [isStudent, setIsStudent] = useState(!!localStorage.getItem('userToken'));
  const navigate = useNavigate();

  const handleAdminLogin = () => {
    setIsAdmin(true);
  };

  const handleDocenteLogin = () => {
    setIsDocente(true);
  };

  const handleStudentLogin = () => {
    setIsStudent(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('docenteToken');
    localStorage.removeItem('userToken');
    localStorage.removeItem('token');
    setIsAdmin(false);
    setIsDocente(false);
    setIsStudent(false);
    navigate('/');
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-900">
      <Header isAdmin={isAdmin} isDocente={isDocente} isStudent={isStudent} handleLogout={handleLogout} />
      {/* Spacer div para compensar la altura del header fijo */}
      <div className="h-18 sm:h-20 md:h-24"></div> {/* Ajusta estas alturas según el tamaño real de tu header */}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<TimelinePage />} />
          {/* Equivalente en Laravel->>Route::get('/about', [Controller::class, 'about']); */}
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contribute" element={<AddComposerForm />} />
          <Route path="/admin/login" element={<AdminLoginPage onLogin={handleAdminLogin} />} />
          <Route path="/docente/login" element={<DocenteLoginPage onLogin={handleDocenteLogin} />} />
          <Route path="/alumno/login" element={<AlumnoLoginPage onLogin={handleStudentLogin} />} />

          <Route 
            path="/alumnos/dashboard" 
            element={
              <PrivateRoute>
                <AlumnoDashboardPage />
              </PrivateRoute>
            } 
          />
          <Route path="/my-contributions" element={<MyContributionsPage handleLogout={handleLogout} onLogin={handleStudentLogin} />} />
          
          {/* Rutas de Administrador Protegidas */}
          <Route 
            path="/admin/dashboard" 
            element={isAdmin ? <AdminDashboardPage handleLogout={handleLogout} /> : <Navigate to="/admin/login" />} 
          />
          <Route 
            path="/admin/catedras" 
            element={isAdmin ? <CatedrasPage /> : <Navigate to="/admin/login" />} 
          />
          <Route 
            path="/admin/catedras/:id" 
            element={isAdmin ? <CatedraDetailPage /> : <Navigate to="/admin/login" />} 
          />
          <Route 
            path="/admin/alumnos" 
            element={isAdmin ? <AlumnosPage /> : <Navigate to="/admin/login" />} 
          />
          <Route 
            path="/admin/docentes" 
            element={isAdmin ? <DocentesPage /> : <Navigate to="/admin/login" />} 
          />
          <Route 
            path="/admin/catedras/:catedraId/evaluations/create" 
            element={isAdmin ? <AdminEvaluationPage /> : <Navigate to="/admin/login" />} 
          />

          {/* Rutas de Docente Protegidas */}
          <Route 
            path="/docente/dashboard" 
            element={
              <DocentePrivateRoute>
                <DocenteDashboardPage />
              </DocentePrivateRoute>
            } 
          />
          <Route 
            path="/docente/catedra/:id" 
            element={
              <DocentePrivateRoute>
                <DocenteCatedraDetailPage />
              </DocentePrivateRoute>
            } 
          />
          <Route 
            path="/docente/catedra/:catedraId/alumno/:alumnoId" 
            element={
              <DocentePrivateRoute>
                <DocenteAlumnoTareasPage />
              </DocentePrivateRoute>
            } 
          />
          <Route
            path="/docente/catedra/:catedraId/tareas/create"
            element={
              <DocentePrivateRoute>
                <DocenteTareaPage />
              </DocentePrivateRoute>
            }
          />
          <Route 
            path="/docente/catedra/:catedraId/generate-evaluation"
            element={
              <DocentePrivateRoute>
                <DocenteGenerateEvaluationPage />
              </DocentePrivateRoute>
            } 
          />
          <Route
            path="/docente/catedra/:catedraId/evaluations/create"
            element={
              <DocentePrivateRoute>
                <DocenteEvaluationPage />
              </DocentePrivateRoute>
            }
          />
          <Route
            path="/docente/catedra/:catedraId/evaluation/:evaluationId"
            element={
              <DocentePrivateRoute>
                <DocenteEvaluationPage />
              </DocentePrivateRoute>
            }
          />
          <Route
            path="/docente/catedra/:catedraId/alumnos/:alumnoId/evaluaciones/:evaluationId/results"
            element={
              <DocentePrivateRoute>
                <DocenteEvaluationResultsPage />
              </DocentePrivateRoute>
            }
          />
          <Route path="/my-contributions" element={<MyContributionsPage handleLogout={handleLogout} />} />
          <Route path="/gamification" element={<GamificationPage />} />

          {/* Rutas de Alumno Protegidas */}
          <Route 
            path="/my-evaluations" 
            element={
              <PrivateRoute>
                <MyEvaluationsPage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/evaluacion/:evaluationId" 
            element={
              <PrivateRoute>
                <RealizarEvaluacionPage />
              </PrivateRoute>
            } 
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default AppContent;