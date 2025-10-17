import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api'; // ← Este es tu archivo api.js
import toast from 'react-hot-toast';
import { Home, Award, BookOpen, BarChart3, Users, Clock, CalendarCheck } from 'lucide-react';
import DashboardCard from '../components/DashboardCard';

const AlumnoDashboardPage = () => {
  const [alumno, setAlumno] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPuntos, setTotalPuntos] = useState(0);
  const [catedras, setCatedras] = useState([]);
  const [tareasPendientes, setTareasPendientes] = useState([]);
  const [evaluacionesPendientes, setEvaluacionesPendientes] = useState([]);

  useEffect(() => {
    const fetchAlumnoData = async () => {
      try {
        setLoading(true);
        
        // ✅ CORREGIDO: Usar los métodos específicos de tu api.js
        // Fetch datos del alumno
        const response = await api.getAlumnoMe(); // ← Método específico
        setAlumno(response.data);
        setTotalPuntos(response.data.totalPuntos || 0);

        // ✅ CORREGIDO: Usar método específico para cátedras
        const catedrasResponse = await api.getStudentCatedras(); // ← getStudentCatedras()
        setCatedras(catedrasResponse.data.map(ca => ca.Catedra).filter(Boolean));

        // ✅ CORREGIDO: Usar método específico para tareas
        const tareasResponse = await api.getAlumnoTareas(); // ← getAlumnoTareas()
        const pendientes = tareasResponse.data.filter(tarea => 
          tarea.estado === 'ASIGNADA' || tarea.estado === 'PENDIENTE'
        );
        setTareasPendientes(pendientes);

        // ✅ CORREGIDO: Usar método específico para evaluaciones
        const evaluacionesResponse = await api.getMyEvaluations(); // ← getMyEvaluations()
        const evPendientes = evaluacionesResponse.data.filter(ev => !ev.realizada);
        setEvaluacionesPendientes(evPendientes);

      } catch (err) {
        console.error('Error al cargar datos del alumno:', err);
        const errorMessage = err.response?.data?.error || 
                           err.response?.data?.message || 
                           'Error al cargar los datos del dashboard.';
        setError(errorMessage);
        toast.error(errorMessage);
        
        if (err.response?.status === 401) {
          // Redirigir al login
          window.location.href = '/login';
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAlumnoData();
  }, []);

  // ... el resto del componente se mantiene igual
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-emerald-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Error: {error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!alumno) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center text-gray-500">
          No se encontraron datos del alumno.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 text-white p-6 sm:p-10">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-white mb-8 drop-shadow-lg">
          Bienvenido, {alumno.nombre} {alumno.apellido}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <DashboardCard
            icon={Award}
            title="Puntos Totales"
            value={totalPuntos}
            description="Puntos acumulados en todas las cátedras."
            bgColor="from-emerald-500 to-lime-600"
            shadowColor="shadow-emerald-500/30"
          />
          <DashboardCard
            icon={BookOpen}
            title="Cátedras Inscritas"
            value={catedras.length}
            description="Número total de cátedras en las que estás inscrito."
            bgColor="from-green-500 to-teal-600"
            shadowColor="shadow-green-500/30"
          />
          <DashboardCard
            icon={Clock}
            title="Tareas Pendientes"
            value={tareasPendientes.length}
            description="Tareas que aún no has entregado."
            bgColor="from-yellow-500 to-orange-600"
            shadowColor="shadow-yellow-500/30"
            linkTo="/alumno/tareas"
          />
          <DashboardCard
            icon={CalendarCheck}
            title="Evaluaciones Pendientes"
            value={evaluacionesPendientes.length}
            description="Evaluaciones que aún no has realizado."
            bgColor="from-red-500 to-rose-600"
            shadowColor="shadow-red-500/30"
            linkTo="/alumno/evaluaciones"
          />
        </div>

        <section className="mb-10">
          <h2 className="text-3xl font-bold text-white mb-6">Tus Cátedras</h2>
          {catedras.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {catedras.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/alumno/catedra/${cat.id}`}
                  className="block bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:border-emerald-400 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-emerald-500/20"
                >
                  <h3 className="text-xl font-semibold text-emerald-300 mb-2">{cat.nombre}</h3>
                  <p className="text-gray-300 text-sm">Año: {cat.anio}</p>
                  <p className="text-gray-400 text-xs mt-4 flex items-center gap-2">
                    <Home size={16} />
                    Institución: {cat.institucion || 'No especificada'}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No estás inscrito en ninguna cátedra aún.</p>
          )}
        </section>

        <section>
          <h2 className="text-3xl font-bold text-white mb-6">Actividad Reciente</h2>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <p className="text-gray-300">¡Mantente al día con tus tareas y evaluaciones!</p>
            <ul className="mt-4 space-y-3">
              {tareasPendientes.length > 0 && (
                <li>
                  <Link to="/alumno/tareas" className="text-emerald-300 hover:text-emerald-100 flex items-center gap-2">
                    <BarChart3 size={18} />
                    Tienes {tareasPendientes.length} tareas pendientes. ¡No te atrases!
                  </Link>
                </li>
              )}
              {evaluacionesPendientes.length > 0 && (
                <li>
                  <Link to="/alumno/evaluaciones" className="text-red-300 hover:text-red-100 flex items-center gap-2">
                    <Users size={18} />
                    Tienes {evaluacionesPendientes.length} evaluaciones pendientes. ¡Prepárate!
                  </Link>
                </li>
              )}
              {tareasPendientes.length === 0 && evaluacionesPendientes.length === 0 && (
                <li>
                  <p className="text-gray-400">¡Excelente! No tienes tareas ni evaluaciones pendientes por ahora.</p>
                </li>
              )}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AlumnoDashboardPage;