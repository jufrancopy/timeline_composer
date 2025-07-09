import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api'; // Assuming you have an api.js for backend calls

function AdminLoginPage({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await api.post('/admin/login', { password });
      if (response.data.token) {
        localStorage.setItem('adminToken', response.data.token);
        onLogin(); // Notify the parent component
        navigate('/admin/dashboard');
      } else {
        setError('Contraseña incorrecta.');
      }
    } catch (err) {
      setError('Error al intentar iniciar sesión. Inténtalo de nuevo.');
      console.error('Login error:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="bg-white/5 backdrop-blur-lg p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Acceso de Administrador
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-gray-300 text-sm font-medium mb-2">
              Contraseña de Administrador
            </label>
            <input
              type="password"
              id="password"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300"
          >
            Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLoginPage;
