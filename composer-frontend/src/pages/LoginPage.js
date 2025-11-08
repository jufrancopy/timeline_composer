import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import { Mail, Shield, Users } from 'lucide-react';
import { handleRequestError } from '../utils/errorUtils';


function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.requestOtp(email);
      setShowOtpInput(true);
      toast.success('Código enviado a tu email. Revisa tu bandeja de entrada.');
    } catch (err) {
      console.error('Error requesting OTP:', err);
      handleRequestError(err, setError, {
        notFound: 'El correo que ingresaste no existe.',
        forbidden: 'Este correo es de docente o admin. Por favor, usa el portal correspondiente.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await api.verifyOtp(email, otp);
      localStorage.setItem('userToken', response.data.token);
      onLogin(); // Notificar a AppContent que el alumno ha iniciado sesión
      toast.success('¡Sesión iniciada con éxito!');
      navigate('/my-contributions'); // Redirigir al dashboard de contribuciones
    } catch (err) {
      console.error('Error verifying OTP:', err);
      handleRequestError(err, setError, { unauthorized: 'Código inválido o expirado. Intenta de nuevo.' }); finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950">
      <div className="max-w-md w-full">
        <div className="relative overflow-hidden rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-slate-700/50">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 via-transparent to-emerald-600/10"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-green-500/20 to-transparent rounded-full blur-2xl"></div>
          
          <div className="relative z-10 p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center">
                <Users className="text-white" size={28} />
              </div>
              <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-emerald-400 to-green-400">
                Acceder como Estudiante
              </h2>
              <p className="text-slate-400 mt-2">Ingresa con tu email para continuar</p>
            </div>

            <form onSubmit={showOtpInput ? handleVerifyOtp : handleRequestOtp} className="space-y-6">
              <div>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="email"
                    placeholder="Tu Email de Estudiante"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent transition-all duration-300"
                    required
                    readOnly={showOtpInput}
                  />
                </div>
              </div>
              
              {showOtpInput && (
                <div className="animate-in slide-in-from-top-4 duration-300">
                  <div className="relative">
                    <Shield className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="text"
                      placeholder="Código OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent transition-all duration-300"
                      required
                    />
                  </div>
                </div>
              )}
              
              <button
                type="submit"
                disabled={loading}
                className="group w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-green-900/25 hover:shadow-xl hover:shadow-green-900/40 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <span className="flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/20 rounded-full animate-spin border-t-white"></div>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Shield size={20} className="group-hover:rotate-12 transition-transform duration-300" />
                      {showOtpInput ? 'Verificar y Acceder' : 'Solicitar Código'}
                    </>
                  )}
                </span>
              </button>
            </form>
            
            {error && (
              <div className="mt-4 p-3 bg-red-900/30 border border-red-500/30 rounded-lg">
                <p className="text-red-300 text-sm text-center">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
