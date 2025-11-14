import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import { handleRequestError } from '../utils/errorUtils';
import { Mail, Shield, AlertCircle, ArrowRight } from 'lucide-react';
import logo from '../logo.png'; // Importar el logo


const AlumnoLoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.requestOtp(email);
      setOtpSent(true);
      toast.success('Código enviado a tu email.');
    } catch (err) {
      handleRequestError(err, setError, { 
        notFound: 'El correo que ingresaste no existe.',
        forbidden: 'Este correo es de docente. Por favor, usa el portal de docentes.'
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
      localStorage.setItem('userToken', response.data.token); // Store as 'userToken' for students
      onLogin(); // Notify the parent component
      toast.success('¡Sesión iniciada con éxito!');
      navigate('/alumnos/dashboard'); // Redirect to student dashboard
    } catch (err) {
      handleRequestError(err, setError, { unauthorized: 'El código OTP es incorrecto o ha expirado.' });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-lime-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Card container with glass effect */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Header section */}
          <div className="bg-gradient-to-r from-emerald-500/20 to-lime-500/20 p-8 pb-6">
            <img src={logo} alt="Logo EduPlatForm" className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-lime-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg transform hover:scale-105 transition-transform duration-300" />
            <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-emerald-200 to-lime-200 bg-clip-text text-transparent">
              Acceso de Alumno
            </h2>
            <p className="text-center text-gray-300 text-sm mt-2">
              Ingresa con tu email para continuar
            </p>
          </div>

          {/* Form section */}
          <div className="p-8 pt-6">
            <form onSubmit={otpSent ? handleVerifyOtp : handleRequestOtp} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-gray-200 text-sm font-medium mb-2">
                  Email de Contacto
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="email"
                    id="email"
                    placeholder="Tu Email de Alumno"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full pl-12 pr-4 py-3 bg-white/5 border ${loading ? 'border-emerald-400' : 'border-white/10'} rounded-xl focus:outline-none focus:border-emerald-400 text-white placeholder-gray-400 transition-all duration-300 backdrop-blur-sm`}
                    required
                    readOnly={otpSent}
                  />
                  <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/20 to-lime-500/20 -z-10 blur-sm transition-opacity duration-300 ${loading ? 'opacity-100' : 'opacity-0'}`}></div>
                </div>
              </div>

              {otpSent && (
                <div className="animate-in slide-in-from-top-4 duration-300">
                  <div>
                    <label htmlFor="otp" className="block text-gray-200 text-sm font-medium mb-2">
                      Código OTP
                    </label>
                    <div className="relative">
                      <Shield className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                      <input
                        type="text"
                        id="otp"
                        placeholder="Ingresa el código de 6 dígitos"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className={`w-full pl-12 pr-4 py-3 bg-white/5 border ${loading ? 'border-emerald-400' : 'border-white/10'} rounded-xl focus:outline-none focus:border-emerald-400 text-white placeholder-gray-400 transition-all duration-300 backdrop-blur-sm`}
                        required
                      />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/20 to-lime-500/20 -z-10 blur-sm transition-opacity duration-300 "></div>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl p-3 animate-shake">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-500 to-lime-500 hover:from-emerald-600 hover:to-lime-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>{otpSent ? 'Verificar y Acceder' : 'Solicitar Código'}</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer text */}
        <p className="text-center text-gray-400 text-xs mt-6">
          Acceso restringido solo para alumnos autorizados
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
};

export default AlumnoLoginPage;
