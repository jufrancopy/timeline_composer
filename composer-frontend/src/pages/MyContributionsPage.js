import React, { useEffect, useState } from 'react';
import apiClient from '../api';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import AddComposerForm from '../components/AddComposerForm'; // Reusing for edit functionality

// Helper function for gamification level (duplicated from backend for frontend display)
const getContributorLevel = (count) => {
  let level = 'Principiante';
  if (count >= 100) {
    level = 'Guardián del Patrimonio';
  } else if (count >= 50) {
    level = 'Curador de la Memoria Sonora';
  } else if (count >= 20) {
    level = 'Investigador Musical';
  } else if (count >= 10) {
    level = 'Colaborador Avanzado';
  } else if (count >= 5) {
    level = 'Colaborador Activo';
  } else if (count >= 1) {
    level = 'Colaborador Inicial';
  }
  return level;
};

function MyContributionsPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [contributions, setContributions] = useState([]);
  const [userLevel, setUserLevel] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentEditingContribution, setCurrentEditingContribution] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (token) {
      setLoggedIn(true);
      fetchContributions(token);
    }
  }, []);

  const fetchContributions = async (token) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/my-contributions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setContributions(response.data.contributions);
      setUserLevel(response.data.userLevel);
    } catch (err) {
      console.error('Error fetching contributions:', err);
      setError('No se pudieron cargar tus aportes. Por favor, inicia sesión de nuevo.');
      localStorage.removeItem('userToken');
      setLoggedIn(false);
      setShowOtpInput(false);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await apiClient.post('/request-otp', { email });
      setShowOtpInput(true);
      toast.success('Código enviado a tu email. Revisa tu bandeja de entrada.');
    } catch (err) {
      console.error('Error requesting OTP:', err);
      toast.error(err.response?.data?.error || 'Error al solicitar el código. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    console.log('Verifying OTP with:', { email, otp }); // Debug log
    try {
      const response = await apiClient.post('/verify-otp', { email, otp });
      localStorage.setItem('userToken', response.data.token);
      setLoggedIn(true);
      setShowOtpInput(false);
      setOtp(''); // Clear OTP input
      toast.success('¡Sesión iniciada con éxito!');
      fetchContributions(response.data.token);
    } catch (err) {
      console.error('Error verifying OTP:', err);
      toast.error(err.response?.data?.error || 'Código inválido o expirado. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    setLoggedIn(false);
    setContributions([]);
    setUserLevel('');
    setEmail('');
    setOtp('');
    setShowOtpInput(false);
    toast.success('Sesión cerrada.');
  };

  const handleEditClick = (contribution) => {
    setCurrentEditingContribution(contribution);
    setIsEditModalOpen(true);
  };

  const handleResubmit = async (updatedData) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('userToken');
      await apiClient.put(`/composers/resubmit/${currentEditingContribution.id}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Aporte reenviado para revisión con éxito!');
      setIsEditModalOpen(false);
      setCurrentEditingContribution(null);
      fetchContributions(token); // Refresh the list
    } catch (err) {
      console.error('Error resubmitting contribution:', err);
      toast.error(err.response?.data?.error || 'Error al reenviar el aporte.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING_REVIEW': return 'text-yellow-400';
      case 'PUBLISHED': return 'text-green-400';
      case 'REJECTED': return 'text-red-400';
      case 'NEEDS_IMPROVEMENT': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-8">
      <div className="max-w-6xl mx-auto bg-white/5 backdrop-blur-lg p-6 rounded-lg shadow-xl">
        <h2 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Mis Aportes
        </h2>

        {!loggedIn ? (
          <div className="max-w-md mx-auto p-6 bg-gray-800 rounded-lg shadow-md">
            <h3 className="text-2xl font-semibold text-white mb-4 text-center">Acceder a Mis Aportes</h3>
            <form onSubmit={showOtpInput ? handleVerifyOtp : handleRequestOtp}>
              <div className="mb-4">
                <input
                  type="email"
                  placeholder="Tu Email de Contacto"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  required
                  readOnly={showOtpInput}
                />
              </div>
              {showOtpInput && (
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Código OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300"
              >
                {loading ? 'Cargando...' : showOtpInput ? 'Verificar Código y Acceder' : 'Solicitar Código de Acceso'}
              </button>
            </form>
            {error && <p className="text-red-400 text-center mt-4">{error}</p>}
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6">
              <p className="text-lg">Tu Nivel de Colaborador: <span className="font-bold text-purple-300">{userLevel}</span></p>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
              >
                Cerrar Sesión
              </button>
            </div>

            {loading && <p className="text-center text-lg">Cargando tus aportes...</p>}
            {error && <p className="text-center text-red-400 text-lg">{error}</p>}

            {!loading && !error && contributions.length === 0 && (
              <p className="text-center text-lg">No has realizado aportes aún, o no se encontraron aportes para tu cuenta.</p>
            )}

            {!loading && !error && contributions.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Compositor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Estado</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Motivo/Sugerencia</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {contributions.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-700/50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">{c.first_name} {c.last_name}</td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${getStatusColor(c.status)}`}>
                          {c.status === 'PENDING_REVIEW' && 'Pendiente de Revisión'}
                          {c.status === 'PUBLISHED' && 'Publicado'}
                          {c.status === 'REJECTED' && 'Rechazado'}
                          {c.status === 'NEEDS_IMPROVEMENT' && 'Necesita Mejoras'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300 max-w-xs truncate">
                          {c.rejection_reason || c.suggestion_reason || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {c.status === 'NEEDS_IMPROVEMENT' && (
                            <button
                              onClick={() => handleEditClick(c)}
                              className="text-blue-400 hover:text-blue-500"
                            >
                              Editar y Reenviar
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Contribution Modal */}
      {isEditModalOpen && currentEditingContribution && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Editar Aporte"
          showSubmitButton={false} // AddComposerForm has its own submit
        >
          <AddComposerForm
            initialData={currentEditingContribution}
            onComposerAdded={handleResubmit} // This will be called on successful resubmit
            onCancel={() => setIsEditModalOpen(false)}
          />
        </Modal>
      )}
    </div>
  );
}

export default MyContributionsPage;