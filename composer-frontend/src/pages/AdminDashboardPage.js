import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

// --- Helper Function for Scoring and Missing Fields ---
const evaluateContribution = (contribution) => {
  const allFields = [
    { key: 'first_name', label: 'Nombre' },
    { key: 'last_name', label: 'Apellido' },
    { key: 'birth_year', label: 'Año de Nacimiento' },
    { key: 'birth_month', label: 'Mes de Nacimiento' },
    { key: 'birth_day', label: 'Día de Nacimiento' },
    { key: 'death_year', label: 'Año de Fallecimiento' },
    { key: 'death_month', label: 'Mes de Fallecimiento' },
    { key: 'death_day', label: 'Día de Fallecimiento' },
    { key: 'bio', label: 'Biografía' },
    { key: 'notable_works', label: 'Obras Notables' },
    { key: 'period', label: 'Período' },
    { key: 'photo_url', label: 'Foto' },
    { key: 'youtube_link', label: 'YouTube' },
    { key: 'references', label: 'Referencias' },
    { key: 'mainRole', label: 'Rol Principal' },
  ];

  let scorableFields = [...allFields];
  if (!contribution.death_year) {
    scorableFields = allFields.filter(f => !f.key.startsWith('death_'));
  }

  const missingFields = scorableFields.filter(field => {
    const value = contribution[field.key];
    return value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0);
  });

  const score = scorableFields.length - missingFields.length;
  const total = scorableFields.length;

  return { score, total, missing: missingFields.map(f => f.label) };
};

function AdminDashboardPage({ handleLogout }) {
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [currentContribution, setCurrentContribution] = useState(null);
  const [currentMissingFields, setCurrentMissingFields] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      // App.js will handle the redirect
      return;
    }
    
    api.get('/composers/pending', { headers: { Authorization: `Bearer ${token}` } })
      .then(response => setContributions(response.data))
      .catch(err => {
        toast.error('No se pudieron cargar los aportes.');
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          handleLogout(); // Use the logout handler from props
        }
      })
      .finally(() => setLoading(false));
  }, [navigate, handleLogout]);

  const handleApprove = async (id) => {
    const token = localStorage.getItem('adminToken');
    await api.put(`/composers/${id}/status`, { status: 'PUBLISHED' }, { headers: { Authorization: `Bearer ${token}` } });
    toast.success('Aporte aprobado exitosamente!');
    setContributions(contributions.filter(c => c.id !== id));
  };

  const openReviewModal = (contribution) => {
    setCurrentContribution(contribution);
    setIsReviewModalOpen(true);
  };

  const handleReviewSubmit = async () => {
    const token = localStorage.getItem('adminToken');
    await api.post(`/composers/${currentContribution.id}/review`, { reason: rejectionReason }, { headers: { Authorization: `Bearer ${token}` } });
    toast.success('Aporte remitido para revisión!');
    setContributions(contributions.filter(c => c.id !== currentContribution.id));
    setIsReviewModalOpen(false);
    setRejectionReason('');
  };

  const openDetailModal = (contribution) => {
    const { missing } = evaluateContribution(contribution);
    setCurrentContribution(contribution);
    setCurrentMissingFields(missing);
    setIsDetailModalOpen(true);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Cargando...</div>;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-4xl font-bold">Panel de Administración</h2>
            
          </div>
          <div className="bg-white/5 backdrop-blur-lg p-6 rounded-lg shadow-xl">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Compositor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Aportante</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Puntaje</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {contributions.map((c) => {
                    const { score, total, missing } = evaluateContribution(c);
                    return (
                      <tr key={c.id} className="hover:bg-gray-700/50 cursor-pointer" onClick={() => openDetailModal(c)}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">{c.first_name} {c.last_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {c.is_student_contribution ? (
                            <span className="font-bold text-green-400">Alumno: {c.student_first_name} {c.student_last_name}</span>
                          ) : (
                            <span className="text-gray-400">Público General</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{c.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-mono" title={`Campos faltantes: ${missing.join(', ')}`}>
                          {score} / {total}
                          {missing.length > 0 && (
                            <span className="ml-2 text-red-400 text-xs">(Faltan: {missing.length})</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => handleApprove(c.id)} className="text-green-400 hover:text-green-500 mr-4">Aprobar</button>
                          <button onClick={() => openReviewModal(c)} className="text-red-400 hover:text-red-500">Remitir</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)} onSubmit={handleReviewSubmit} title="Remitir Aporte">
        <textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="Motivo de la revisión..." className="w-full p-3 border rounded" rows="4"/>
      </Modal>

      {currentContribution && (
        <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} showSubmitButton={false} cancelText="Cerrar" title="Detalles del Aporte">
          <div className="text-gray-300 space-y-4">
            {currentMissingFields.length > 0 && (
              <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg">
                <p className="font-bold text-red-400 mb-2">Campos Faltantes:</p>
                <ul className="list-disc list-inside text-red-300">
                  {currentMissingFields.map((field, index) => (
                    <li key={index}>{field}</li>
                  ))}
                </ul>
              </div>
            )}
            {Object.entries(currentContribution).map(([key, value]) => {
              if (['id', 'created_at', 'updated_at', 'status', 'ip_address', 'rejection_reason', 'suggestion_reason'].includes(key)) return null;
              return (
                <div key={key}>
                  <p className="font-bold text-purple-400 capitalize">{key.replace(/_/g, ' ')}:</p>
                  <p className="ml-2">{Array.isArray(value) ? value.join(', ') : value || 'No especificado'}</p>
                </div>
              );
            })}
          </div>
        </Modal>
      )}
    </>
  );
}

export default AdminDashboardPage;