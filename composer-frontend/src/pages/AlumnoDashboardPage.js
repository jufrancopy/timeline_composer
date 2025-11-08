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
import ComposerOfTheDay from '../components/ComposerOfTheDay';

// Helper para niveles de gamificación
const AlumnoDashboardPage = () => {
  const [alumno, setAlumno] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState(null);
  
  // Estados para estudiantes de cátedras
  const [catedras, setCatedras] = useState([]);
  const [tareasPendientes, setTareasPendientes] = useState([]);
  const [evaluacionesPendientes, setEvaluacionesPendientes] = useState([]);
  const [publicaciones, setPublicaciones] = useState([]);
  const [randomComposer, setRandomComposer] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);


  const handleComposerClick = (composerId) => {
    window.location.href = `/timeline/${composerId}`;
  };

  const fetchDashboardData = async () => {
    const allComposers = await api.getComposers();
    if (allComposers.data && allComposers.data.length > 0) {
      const randomIndex = Math.floor(Math.random() * allComposers.data.length);
      setRandomComposer(allComposers.data[randomIndex]);
    }
    try {
      setLoading(true);
      
      // Fetch datos del alumno/aportante
      const alumnoResponse = await api.getAlumnoMe();
      const userData = alumnoResponse.data;
      setAlumno(userData);
      
      // Fetch cátedras inscritas
      const catedrasResponse = await api.getStudentCatedras().catch(() => ({ data: [] }));
      const catedrasData = catedrasResponse.data;
      setCatedras(catedrasData);
      
      // Determinar tipo de usuario
      const hasCatedras = catedrasData.length > 0;
      
      if (hasCatedras) {
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
  }; // This is the missing closing brace for fetchDashboardData

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
      {randomComposer && (
        <div className="fixed top-20 right-4 z-50 w-72">
          <ComposerOfTheDay composer={randomComposer} onComposerClick={handleComposerClick} />
        </div>
      )}
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Principal */}
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 sm:p-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                ¡Bienvenido, {alumno.nombre || 'Usuario'}!
              </h1>
              <p className="text-slate-400 text-lg">
                {userType === 'student' && 'Estudiante Activo'}
                {userType === 'new' && 'Comienza tu viaje musical'}
              </p>
            </div>

          </div>
        </div>



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
                    if (!cat || cat.id === undefined || cat.id === null) return null;
                    
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