import React, { useEffect, useState } from 'react';
import api from '../api';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const DocenteDashboardPage = () => {
  const [catedras, setCatedras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('docenteToken');
    navigate('/docente/login');
  };

  useEffect(() => {
    const token = localStorage.getItem('docenteToken');
    if (!token) {
      // If token is missing, redirect to login
      navigate('/docente/login');
      return;
    }

    const fetchCatedras = async () => {
      try {
        const response = await api.getDocenteCatedras();
        setCatedras(response.data);
      } catch (err) {
        console.error('Error loading assigned catedras:', err); // Log the error for debugging
        // Check if the error is due to an expired/invalid token (401 Unauthorized)
        if (err.response?.status === 401) {
          localStorage.removeItem('docenteToken'); // Clear expired token
          navigate('/docente/login'); // Redirect to login
          toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        } else {
          setError(err.response?.data?.message || 'Error al cargar las cátedras asignadas.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchCatedras();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-8 flex items-center justify-center">
        <p className="text-center text-lg text-gray-300">Cargando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-8 flex items-center justify-center">
        <p className="text-center text-red-400 text-lg">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto bg-white/5 backdrop-blur-lg p-6 rounded-lg shadow-xl">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center text-center md:text-left mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Mi Dashboard de Docente
          </h1>
          <button
            onClick={handleLogout}
            className="bg-red-700 hover:bg-red-800 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 w-full md:w-auto mt-4 md:mt-0 shadow-lg"
          >
            Cerrar Sesión
          </button>
        </div>

        <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          Mis Cátedras Asignadas
        </h2>
        {catedras.length === 0 ? (
          <p className="text-center text-gray-400 text-lg">No tienes cátedras asignadas aún.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {catedras.map((catedra) => (
              <div key={catedra.id} className="bg-gray-800/50 hover:bg-gray-700/50 transition-colors duration-300 rounded-lg shadow-lg p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2 text-purple-300">{catedra.nombre} ({catedra.anio})</h3>
                  <p className="text-gray-300 mb-4">{catedra.institucion} - {catedra.turno}</p>
                  <p className="text-gray-200">Horario: {catedra.horario} ({catedra.dias})</p>
                  <p className="text-gray-200">Aula: {catedra.aula}</p>
                </div>
                <div className="mt-4">
                  <Link
                    to={`/docente/catedra/${catedra.id}`}
                    className="block bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 text-center"
                  >
                    Ver Detalles de Cátedra
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocenteDashboardPage;
