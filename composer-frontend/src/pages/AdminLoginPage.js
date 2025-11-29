import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, AlertCircle } from 'lucide-react';
import axios from 'axios'; // Importa axios
import logo from '../logo.png'; // Importar el logo

function AdminLoginPage({ onLogin }) {
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000'; // Usa la URL base de tu API, configurable por .env
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/login`, { password });
      console.log('Admin login successful:', response.data);
      localStorage.setItem('adminToken', response.data.token);
      localStorage.setItem('userRole', 'admin');
      setSuccess(true);
      setError('');
      // Llama a la función onLogin pasada desde AppContent
      onLogin();
      navigate('/admin/dashboard'); // Redirige al dashboard de administrador
    } catch (err) {
      console.error('Admin login failed:', err);
      setError(err.response?.data?.error || 'Error al iniciar sesión. Intenta de nuevo.');
      setSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Card container with glass effect */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Header section */}
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-8 pb-6">
            <img src={logo} alt="Logo EduPlatForm" className="w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg transform hover:scale-105 transition-transform duration-300 p-2" />
            <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">
              Acceso de Administrador
            </h2>
            <p className="text-center text-gray-300 text-sm mt-2">
              Ingresa tus credenciales para continuar
            </p>
          </div>

          {/* Form section */}
          <div className="p-8 pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-gray-200 text-sm font-medium mb-2">
                  Contraseña de Administrador
                </label>
                <div className="relative">
                  <input
                    type="password"
                    id="password"
                    className={`w-full px-4 py-3 bg-white/5 border ${
                      isFocused ? 'border-purple-400' : 'border-white/10'
                    } rounded-xl focus:outline-none focus:border-purple-400 text-white placeholder-gray-400 transition-all duration-300 backdrop-blur-sm`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="Ingresa tu contraseña"
                    required
                  />
                  <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 -z-10 blur-sm transition-opacity duration-300 ${
                    isFocused ? 'opacity-100' : 'opacity-0'
                  }`}></div>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl p-3 animate-shake">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 text-green-400 text-sm bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                  <div className="w-4 h-4 flex-shrink-0">✓</div>
                  <span>¡Acceso concedido! Redirigiendo...</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Iniciar Sesión</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer text */}
        <p className="text-center text-gray-400 text-xs mt-6">
          Acceso restringido solo para administradores autorizados
        </p>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}

export default AdminLoginPage;