import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import { 
  Home, Award, BookOpen, Users, Clock, CalendarCheck,
  TrendingUp, FileText, MessageSquare, CheckCircle,
  AlertCircle, Target, Crown, Trophy, Medal, Star,
  Sparkles, Edit3, LogOut, ChevronRight, BookMarked
} from 'lucide-react';

// Helper para niveles de gamificación
const getContributorLevel = (score) => {
  if (score >= 100) return { level: 'Nivel 6: Guardián del Patrimonio', color: 'from-yellow-400 to-orange-500', icon: Crown };
  if (score >= 50) return { level: 'Nivel 5: Curador de la Memoria Sonora', color: 'from-purple-400 to-pink-500', icon: Trophy };
  if (score >= 20) return { level: 'Nivel 4: Investigador Musical', color: 'from-blue-400 to-cyan-500', icon: Medal };
  if (score >= 10) return { level: 'Nivel 3: Colaborador Avanzado', color: 'from-green-400 to-emerald-500', icon: Award };
  if (score >= 5) return { level: 'Nivel 2: Colaborador Activo', color: 'from-indigo-400 to-purple-500', icon: Star };
  if (score >= 1) return { level: 'Nivel 1: Colaborador Inicial', color: 'from-cyan-400 to-blue-500', icon: Sparkles };
  return { level: 'Nivel 0: Explorador', color: 'from-gray-400 to-slate-500', icon: Target };
};

const AlumnoDashboardPage = () => {
  const [alumno, setAlumno] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState(null); // 'contributor' | 'student' | 'both'
  
  // Estados para aportantes
  const [contributions, setContributions] = useState([]);
  const [userLevel, setUserLevel] = useState({});
  const [userScore, setUserScore] = useState(0);
  
  // Estados para estudiantes de cátedras
  const [catedras, setCatedras] = useState([]);
  const [tareasPendientes, setTareasPendientes] = useState([]);
  const [evaluacionesPendientes, setEvaluacionesPendientes] = useState([]);
  const [publicaciones, setPublicaciones] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch datos del alumno/aportante
      const alumnoResponse = await api.getAlumnoMe();
      const userData = alumnoResponse.data;
      setAlumno(userData);
      
      // Fetch contribuciones al Timeline
      const contribResponse = await api.getMyStudentContributions().catch(() => ({ data: [] }));
      const contributionsData = contribResponse.data;
      setContributions(contributionsData);
      
      // Calcular puntos y nivel de contribuciones
      const contributionScore = userData.totalPuntos || 0;
      setUserScore(contributionScore);
      setUserLevel(getContributorLevel(contributionScore));
      
      // Fetch cátedras inscritas
      const catedrasResponse = await api.getStudentCatedras().catch(() => ({ data: [] }));
      const catedrasData = catedrasResponse.data;
      setCatedras(catedrasData);
      
      // Determinar tipo de usuario
      const hasContributions = contributionsData.length > 0;
      const hasCatedras = catedrasData.length > 0;
      
      if (hasContributions && hasCatedras) {
        setUserType('both');
      } else if (hasContributions) {
        setUserType('contributor');
      } else if (hasCatedras) {
        setUserType('student');
      } else {
        setUserType('new'); // Usuario nuevo sin actividad
      }
      
      // Si tiene cátedras, cargar datos relacionados
      if (hasCatedras) {
        // Fetch tareas
        const tareasResponse = await api.getAlumnoTareas().catch(() => ({ data: [] }));
        const pendientes = tareasResponse.data.filter(t => 
          t.estado === 'ASIGNADA' || t.estado === 'PENDIENTE'
        );
        setTareasPendientes(pendientes);
        
        // Fetch evaluaciones
        const evalsResponse = await api.getMyEvaluations().catch(() => ({ data: [] }));
        const evPendientes = evalsResponse.data.filter(e => !e.realizada);
        setEvaluacionesPendientes(evPendientes);
        
        // Fetch publicaciones de todas las cátedras
        const allPubs = [];
        for (const inscripcion of catedrasData) {
          try {
            if (inscripcion.catedraId) {
              const pubResponse = await api.getPublicaciones(inscripcion.catedraId);
              allPubs.push(...pubResponse.data.slice(0, 3)); // Solo las 3 más recientes
            }
          } catch (err) {
            console.warn('Error fetching publications:', err);
          }
        }
        setPublicaciones(allPubs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5));
      }
      
    } catch (err) {
      console.error('Error al cargar dashboard:', err);
      toast.error('Error al cargar los datos del dashboard');
      
      if (err.response?.status === 401) {
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    window.location.href = '/';
    toast.success('Sesión cerrada');
  };

  const getStatusColor = (status) => {
    const colors = {
      'PENDING_REVIEW': 'bg-yellow-900/20 text-yellow-300 border-yellow-500/30',
      'PUBLISHED': 'bg-green-900/20 text-green-300 border-green-500/30',
      'REJECTED': 'bg-red-900/20 text-red-300 border-red-500/30',
      'NEEDS_IMPROVEMENT': 'bg-blue-900/20 text-blue-300 border-blue-500/30',
      'APPLIED': 'bg-emerald-900/20 text-emerald-300 border-emerald-500/30',
    };
    return colors[status] || 'bg-slate-900/20 text-slate-300 border-slate-500/30';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-purple-600/30 rounded-full animate-spin border-t-purple-500"></div>
            <div className="absolute inset-0 border-4 border-transparent rounded-full animate-ping border-t-purple-400"></div>
          </div>
          <p className="text-slate-300 text-lg font-medium">Cargando tu dashboard...</p>
        </div>
      </div>
    );
  }

  if (!alumno) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Error al cargar datos</h2>
          <p className="text-slate-400 mb-6">No se encontraron datos de usuario</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Volver al Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Principal */}
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 sm:p-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                ¡Bienvenido, {alumno.nombre || 'Usuario'}!
              </h1>
              <p className="text-slate-400 text-lg">
                {userType === 'both' && 'Estudiante y Colaborador del Timeline'}
                {userType === 'student' && 'Estudiante Activo'}
                {userType === 'contributor' && 'Colaborador del Timeline'}
                {userType === 'new' && 'Comienza tu viaje musical'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600/20 text-red-300 hover:bg-red-600/30 rounded-lg transition-all"
            >
              <LogOut size={20} />
              Cerrar Sesión
            </button>
          </div>
        </div>

        {/* Sección de Aportes al Timeline */}
        {(userType === 'contributor' || userType === 'both') && (
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${userLevel.color} flex items-center justify-center`}>
                  {userLevel.icon && <userLevel.icon className="text-white" size={28} />}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{userLevel.level}</h2>
                  <p className="text-slate-400">
                    Puntos: <span className="text-purple-400 font-semibold">{userScore}</span>
                  </p>
                </div>
              </div>
              <Link
                to="/my-contributions"
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all"
              >
                Ver Todos
                <ChevronRight size={18} />
              </Link>
            </div>

            {/* Mini resumen de contribuciones */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <Clock className="text-yellow-400" size={24} />
                  <div>
                    <p className="text-slate-400 text-sm">En Revisión</p>
                    <p className="text-white text-2xl font-bold">
                      {contributions.filter(c => c.status === 'PENDING_REVIEW').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-green-400" size={24} />
                  <div>
                    <p className="text-slate-400 text-sm">Publicados</p>
                    <p className="text-white text-2xl font-bold">
                      {contributions.filter(c => c.status === 'PUBLISHED' || c.status === 'APPLIED').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <Edit3 className="text-blue-400" size={24} />
                  <div>
                    <p className="text-slate-400 text-sm">Necesitan Mejora</p>
                    <p className="text-white text-2xl font-bold">
                      {contributions.filter(c => c.status === 'NEEDS_IMPROVEMENT').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Últimas contribuciones */}
            {contributions.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-white mb-3">Últimos Aportes</h3>
                <div className="space-y-2">
                  {contributions.slice(0, 3).map((contrib) => (
                    <div
                      key={contrib.id}
                      className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-slate-700/50 hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {contrib.first_name?.[0]}{contrib.last_name?.[0]}
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {contrib.first_name} {contrib.last_name}
                          </p>
                          <p className="text-slate-400 text-sm">
                            {new Date(contrib.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(contrib.status)}`}>
                        {contrib.status === 'PENDING_REVIEW' && 'En Revisión'}
                        {contrib.status === 'PUBLISHED' && 'Publicado'}
                        {contrib.status === 'APPLIED' && 'Aprobado'}
                        {contrib.status === 'NEEDS_IMPROVEMENT' && 'Necesita Mejora'}
                        {contrib.status === 'REJECTED' && 'Rechazado'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sección de Cátedras */}
        {(userType === 'student' || userType === 'both') && (
          <>
            {/* Stats de Cátedras */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-5">
                <div className="flex items-center gap-3">
                  <BookOpen className="text-emerald-400" size={28} />
                  <div>
                    <p className="text-slate-400 text-sm">Cátedras</p>
                    <p className="text-white text-2xl font-bold">{catedras.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-5">
                <div className="flex items-center gap-3">
                  <FileText className="text-blue-400" size={28} />
                  <div>
                    <p className="text-slate-400 text-sm">Tareas Pendientes</p>
                    <p className="text-white text-2xl font-bold">{tareasPendientes.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-5">
                <div className="flex items-center gap-3">
                  <CalendarCheck className="text-yellow-400" size={28} />
                  <div>
                    <p className="text-slate-400 text-sm">Evaluaciones</p>
                    <p className="text-white text-2xl font-bold">{evaluacionesPendientes.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-5">
                <div className="flex items-center gap-3">
                  <MessageSquare className="text-purple-400" size={28} />
                  <div>
                    <p className="text-slate-400 text-sm">Publicaciones</p>
                    <p className="text-white text-2xl font-bold">{publicaciones.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mis Cátedras */}
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <BookMarked className="text-emerald-400" />
                Mis Cátedras
              </h2>
              {catedras.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {catedras.map((inscripcion) => {
                    const cat = inscripcion.catedra || inscripcion.Catedra;
                    if (!cat) return null;
                    
                    return (
                      <Link
                        key={cat.id}
                        to={`/alumno/catedra/${cat.id}`}
                        className="group block bg-gradient-to-br from-emerald-900/20 to-teal-900/20 backdrop-blur-sm rounded-xl p-6 border border-emerald-500/30 hover:border-emerald-400 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/20"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                            <BookOpen className="text-white" size={24} />
                          </div>
                          <ChevronRight className="text-emerald-400 group-hover:translate-x-1 transition-transform" size={20} />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-emerald-300 transition-colors">
                          {cat.nombre}
                        </h3>
                        <p className="text-slate-400 text-sm mb-3">Año: {cat.anio}</p>
                        <div className="flex items-center gap-2 text-slate-500 text-xs">
                          <Home size={14} />
                          {cat.institucion || 'No especificada'}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">No estás inscrito en ninguna cátedra</p>
                </div>
              )}
            </div>

            {/* Actividad Reciente */}
            {(tareasPendientes.length > 0 || evaluacionesPendientes.length > 0 || publicaciones.length > 0) && (
              <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <TrendingUp className="text-purple-400" />
                  Actividad Reciente
                </h2>
                <div className="space-y-3">
                  {tareasPendientes.length > 0 && (
                    <Link
                      to="/my-contributions"
                      className="flex items-center justify-between p-4 bg-blue-900/20 border border-blue-500/30 rounded-xl hover:bg-blue-900/30 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="text-blue-400" size={24} />
                        <div>
                          <p className="text-white font-medium">Tareas Pendientes</p>
                          <p className="text-slate-400 text-sm">
                            Tienes {tareasPendientes.length} {tareasPendientes.length === 1 ? 'tarea' : 'tareas'} por entregar
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="text-blue-400 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  )}
                  
                  {evaluacionesPendientes.length > 0 && (
                    <Link
                      to="/my-contributions"
                      className="flex items-center justify-between p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-xl hover:bg-yellow-900/30 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <CalendarCheck className="text-yellow-400" size={24} />
                        <div>
                          <p className="text-white font-medium">Evaluaciones Pendientes</p>
                          <p className="text-slate-400 text-sm">
                            Tienes {evaluacionesPendientes.length} {evaluacionesPendientes.length === 1 ? 'evaluación' : 'evaluaciones'} por completar
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="text-yellow-400 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  )}

                  {publicaciones.length > 0 && (
                    <Link
                      to="/my-contributions"
                      className="flex items-center justify-between p-4 bg-purple-900/20 border border-purple-500/30 rounded-xl hover:bg-purple-900/30 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <MessageSquare className="text-purple-400" size={24} />
                        <div>
                          <p className="text-white font-medium">Publicaciones Recientes</p>
                          <p className="text-slate-400 text-sm">
                            {publicaciones.length} {publicaciones.length === 1 ? 'publicación nueva' : 'publicaciones nuevas'} en tus cátedras
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="text-purple-400 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* Usuario Nuevo */}
        {userType === 'new' && (
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
              <Sparkles className="text-white" size={40} />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">¡Bienvenido!</h2>
            <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
              Comienza tu viaje musical contribuyendo al Timeline de compositores o accediendo a las cátedras en las que estés inscrito.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/"
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-xl transition-all"
              >
                Explorar Timeline
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlumnoDashboardPage; 