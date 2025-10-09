import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { LoadingSpinner, ErrorMessage } from '../pages/AdminDashboardPage'; // Importar de la página de administración

const DashboardOverview = () => {
  const [counts, setCounts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setLoading(true);
        const response = await api.getDashboardCounts(); // Esta función se creará en api.js
        setCounts(response.data);
      } catch (err) {
        console.error('Error fetching dashboard counts:', err);
        setError('No se pudieron cargar los datos del dashboard.');
      } finally {
        setLoading(false);
      }
    };
    fetchCounts();
  }, []);

  if (loading) return <LoadingSpinner message="Cargando datos del dashboard..." />;
  if (error) return <ErrorMessage message={error} onRetry={() => window.location.reload()} />; // simple retry

  if (!counts) return <p className="text-center text-gray-400 py-8">No hay datos disponibles para el dashboard.</p>;

  const stats = [
    { name: 'Cátedras Totales', value: counts.totalCatedras, color: 'text-blue-400', route: '/admin/catedras' },
    { name: 'Alumnos Registrados', value: counts.totalAlumnos, color: 'text-green-400', route: '/admin/alumnos' },
    { name: 'Tareas Asignadas', value: counts.totalTareas, color: 'text-purple-400', route: '/admin/dashboard?tab=academic&subtab=overview' },
    { name: 'Tareas Pendientes', value: counts.pendingTasks, color: 'text-yellow-400', route: '/admin/dashboard?tab=academic&subtab=pendingTasks' },
    { name: 'Tareas Calificadas', value: counts.gradedTasks, color: 'text-red-400', route: '/admin/dashboard?tab=academic&subtab=gradedTasks' },
    { name: 'Aportes Pendientes', value: counts.pendingContributions, color: 'text-orange-400', route: '/admin/dashboard?tab=contributions' },
    { name: 'Sugerencias Pendientes', value: counts.pendingSuggestions, color: 'text-teal-400', route: '/admin/dashboard?tab=suggestions' },
  ];

  return (
    <div className="bg-white/5 backdrop-blur-lg p-6 rounded-lg shadow-xl mt-10">
      <h3 className="text-2xl font-bold mb-6 text-center">Resumen del Sistema</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className="bg-gray-800/50 p-5 rounded-lg shadow-md border border-gray-700 hover:border-purple-500 transition-colors cursor-pointer"
            onClick={() => navigate(stat.route)}
          >
            <p className="text-sm font-medium text-gray-400">{stat.name}</p>
            <p className={`mt-1 text-4xl font-semibold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardOverview;
