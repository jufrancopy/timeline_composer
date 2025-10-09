import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import Swal from 'sweetalert2';

const AdminPaymentManagementPage = ({ handleLogout }) => {
  const [catedras, setCatedras] = useState([]);
  const [loadingCatedras, setLoadingCatedras] = useState(true);
  const [error, setError] = useState('');

  // States for Modals
  const [isCostsModalOpen, setIsCostsModalOpen] = useState(false);
  const [selectedCatedra, setSelectedCatedra] = useState(null);
  const [costosCatedra, setCostosCatedra] = useState(null);
  const [montoMatricula, setMontoMatricula] = useState('');
  const [montoCuota, setMontoCuota] = useState('');
  const [esGratuita, setEsGratuita] = useState(false);
  const [modalidadPago, setModalidadPago] = useState('');

  const [isAlumnoPaymentModalOpen, setIsAlumnoPaymentModalOpen] = useState(false);
  const [selectedAlumno, setSelectedAlumno] = useState(null);
  const [selectedCatedraAlumnoId, setSelectedCatedraAlumnoId] = useState(null);
  const [alumnoPaymentStatus, setAlumnoPaymentStatus] = useState(null);
  const [diaCobro, setDiaCobro] = useState('');

  const checkAuth = useCallback(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      handleLogout();
      return false;
    }
    return true;
  }, [handleLogout]);

  const handleApiError = useCallback((err, defaultMessage) => {
    console.error(err);
    if (err.response && (err.response.status === 401 || err.response.status === 403)) {
      handleLogout();
      return;
    }
    toast.error(err.response?.data?.error || defaultMessage);
    setError(err.response?.data?.error || defaultMessage);
  }, [handleLogout]);

  const fetchCatedras = useCallback(async () => {
    if (!checkAuth()) return;
    try {
      setLoadingCatedras(true);
      const response = await api.getCatedras();
      setCatedras(response.data);
    } catch (err) {
      handleApiError(err, 'Error al cargar las cátedras.');
    } finally {
      setLoadingCatedras(false);
    }
  }, [checkAuth, handleApiError]);

  useEffect(() => {
    fetchCatedras();
  }, [fetchCatedras]);

  // --- Funciones para Costos de Cátedra ---
  const openCostsModal = async (catedra) => {
    setSelectedCatedra(catedra);
    setMontoMatricula('');
    setMontoCuota('');
    setEsGratuita(false);
    setModalidadPago(catedra.modalidad_pago || '');

    try {
      const response = await api.getCatedraCostos(catedra.id);
      const costos = response.data;
      setCostosCatedra(costos);
      setMontoMatricula(costos.monto_matricula || '');
      setMontoCuota(costos.monto_cuota || '');
      setEsGratuita(costos.es_gratuita);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setCostosCatedra(null); // No costs defined yet
      } else {
        handleApiError(err, 'Error al cargar los costos de la cátedra.');
      }
    } finally {
      setIsCostsModalOpen(true);
    }
  };

  const handleSaveCatedraCosts = async () => {
    if (!selectedCatedra) return;

    if (!checkAuth()) return;

    try {
      // Update costs
      await api.defineCatedraCostos(selectedCatedra.id, {
        monto_matricula: montoMatricula ? parseFloat(montoMatricula) : null,
        monto_cuota: montoCuota ? parseFloat(montoCuota) : null,
        es_gratuita: esGratuita,
      });

      // Update payment modality if changed
      if (modalidadPago !== selectedCatedra.modalidad_pago) {
        await api.updateCatedraModalidadPago(selectedCatedra.id, { modalidad_pago: modalidadPago });
      }

      toast.success('Costos y modalidad de pago de la cátedra actualizados con éxito!');
      setIsCostsModalOpen(false);
      fetchCatedras(); // Refresh catedras to show updated modality
    } catch (err) {
      handleApiError(err, 'Error al guardar los costos y modalidad de pago.');
    }
  };

  // --- Funciones para Estado de Pagos de Alumno ---
  const openAlumnoPaymentModal = async (alumno, catedra) => {
    if (!checkAuth()) return;

    setSelectedAlumno(alumno);
    setSelectedCatedra(catedra);
    setDiaCobro('');
    setAlumnoPaymentStatus(null); // Reset status

    try {
      // Find the CatedraAlumnoId for the specific alumno and catedra
      const catedraAlumnoData = catedra.alumnos.find(
        (ca) => ca.alumnoId === alumno.id || ca.composerId === alumno.id // Assuming alumno.id could be composerId for contributions
      );

      if (!catedraAlumnoData) {
        toast.error('Alumno no inscrito en esta cátedra.');
        return;
      }
      setSelectedCatedraAlumnoId(catedraAlumnoData.id);
      setDiaCobro(catedraAlumnoData.dia_cobro || '');

      const response = await api.getAdminAlumnoEstadoPago(alumno.id, catedra.id);
      setAlumnoPaymentStatus(response.data);
    } catch (err) {
      handleApiError(err, 'Error al cargar el estado de pago del alumno.');
    } finally {
      setIsAlumnoPaymentModalOpen(true);
    }
  };

  const handleUpdateDiaCobro = async () => {
    if (!selectedCatedraAlumnoId || diaCobro === '') {
      toast.error('Día de cobro es obligatorio.');
      return;
    }
    if (!checkAuth()) return;

    try {
      await api.updateCatedraAlumnoDiaCobro(selectedCatedraAlumnoId, { dia_cobro: parseInt(diaCobro, 10) });
      toast.success('Día de cobro actualizado con éxito!');
      // Re-fetch status to reflect change
      const response = await api.getAdminAlumnoEstadoPago(selectedAlumno.id, selectedCatedra.id);
      setAlumnoPaymentStatus(response.data);
      fetchCatedras(); // Refresh catedras to update dia_cobro in table
    } catch (err) {
      handleApiError(err, 'Error al actualizar el día de cobro.');
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'AL DÍA': return 'bg-green-100 text-green-800';
      case 'EN MORA': return 'bg-red-100 text-red-800';
      case 'MATRÍCULA PENDIENTE': return 'bg-yellow-100 text-yellow-800';
      case 'MATRÍCULA PARCIALMENTE PAGADA': return 'bg-orange-100 text-orange-800';
      case 'GRATUITO': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loadingCatedras) return <div className="text-center p-8">Cargando cátedras...</div>;
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <Link to="/admin/dashboard" className="mb-6 text-purple-400 hover:text-purple-300 inline-block">
          &larr; Volver al Dashboard Admin
        </Link>
        <h2 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">Gestión de Pagos</h2>

        <div className="bg-white/5 backdrop-blur-lg p-6 rounded-lg shadow-xl mb-10">
          <h3 className="text-2xl font-bold mb-6">Cátedras y Costos</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Cátedra</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Modalidad de Pago</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Matrícula</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Cuota Mensual</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Gratuita</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {catedras.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-400">No hay cátedras disponibles.</td>
                  </tr>
                ) : (
                  catedras.map((catedra) => (
                    <tr key={catedra.id} className="hover:bg-gray-700/50">
                      <td className="px-6 py-4 font-medium text-gray-200">{catedra.nombre}</td>
                      <td className="px-6 py-4 text-gray-300">{catedra.modalidad_pago || 'N/A'}</td>
                      <td className="px-6 py-4 text-gray-300">{catedra.costos?.monto_matricula ? `${catedra.costos.monto_matricula} Gs.` : 'N/A'}</td>
                      <td className="px-6 py-4 text-gray-300">{catedra.costos?.monto_cuota ? `${catedra.costos.monto_cuota} Gs.` : 'N/A'}</td>
                      <td className="px-6 py-4 text-gray-300">{catedra.costos?.es_gratuita ? 'Sí' : 'No'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => openCostsModal(catedra)}
                          className="text-indigo-400 hover:text-indigo-300"
                          title="Gestionar Costos"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-lg p-6 rounded-lg shadow-xl">
          <h3 className="text-2xl font-bold mb-6">Estado de Pagos de Alumnos por Cátedra</h3>
          {catedras.length === 0 ? (
            <p className="text-center py-4 text-gray-400">No hay cátedras disponibles para mostrar el estado de pagos de alumnos.</p>
          ) : (
            catedras.map((catedra) => (
              <div key={catedra.id} className="mb-8 p-4 bg-gray-800/50 rounded-lg">
                <h4 className="text-xl font-semibold mb-4">{catedra.nombre}</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Alumno</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Día de Cobro</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Estado de Pago</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {catedra.alumnos && catedra.alumnos.length > 0 ? (
                        catedra.alumnos.map((inscripcion) => (
                          <tr key={inscripcion.id} className="hover:bg-gray-600/50">
                            <td className="px-6 py-4 font-medium text-gray-200">{inscripcion.alumno ? `${inscripcion.alumno.nombre} ${inscripcion.alumno.apellido}` : 'N/A'}</td>
                            <td className="px-6 py-4 text-gray-300">{inscripcion.dia_cobro || 'N/A'}</td>
                            <td className="px-6 py-4 text-gray-300">
                                {/* This will be dynamically loaded via modal, placeholder for now */}
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Ver Estado</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => openAlumnoPaymentModal(inscripcion.alumno, catedra)}
                                className="text-blue-400 hover:text-blue-300"
                                title="Ver Detalles de Pago"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="px-6 py-4 text-center text-gray-400">No hay alumnos inscritos en esta cátedra.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal for Catedra Costs and Modality */}
        {selectedCatedra && (
          <Modal
            isOpen={isCostsModalOpen}
            onClose={() => setIsCostsModalOpen(false)}
            title={`Gestionar Costos y Modalidad de Pago: ${selectedCatedra.nombre}`}
            onSubmit={handleSaveCatedraCosts}
            submitText="Guardar Cambios"
            cancelText="Cancelar"
            showSubmitButton={true}
          >
            <div className="space-y-4 text-gray-200">
              <div>
                <label htmlFor="modalidadPago" className="block text-sm font-medium text-gray-300 mb-1">Modalidad de Pago:</label>
                <select
                  id="modalidadPago"
                  value={modalidadPago}
                  onChange={(e) => setModalidadPago(e.target.value)}
                  className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="">Seleccione...</option>
                  <option value="PARTICULAR">Particular</option>
                  <option value="INSTITUCIONAL">Institucional</option>
                </select>
              </div>
              <div className="flex items-center">
                <input
                  id="esGratuita"
                  type="checkbox"
                  checked={esGratuita}
                  onChange={(e) => setEsGratuita(e.target.checked)}
                  className="form-checkbox h-5 w-5 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                />
                <label htmlFor="esGratuita" className="ml-2 block text-sm text-gray-300">Es Gratuita</label>
              </div>
              {!esGratuita && (
                <>
                  <div>
                    <label htmlFor="montoMatricula" className="block text-sm font-medium text-gray-300 mb-1">Monto Matrícula (Gs.):</label>
                    <input
                      type="number"
                      id="montoMatricula"
                      value={montoMatricula}
                      onChange={(e) => setMontoMatricula(e.target.value)}
                      className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:border-purple-500"
                      placeholder="Ej: 500000"
                      min="0"
                    />
                  </div>
                  <div>
                    <label htmlFor="montoCuota" className="block text-sm font-medium text-gray-300 mb-1">Monto Cuota Mensual (Gs.):</label>
                    <input
                      type="number"
                      id="montoCuota"
                      value={montoCuota}
                      onChange={(e) => setMontoCuota(e.target.value)}
                      className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:border-purple-500"
                      placeholder="Ej: 300000"
                      min="0"
                    />
                  </div>
                </>
              )}
            </div>
          </Modal>
        )}

        {/* Modal for Alumno Payment Status and Dia de Cobro */}
        {isAlumnoPaymentModalOpen && selectedAlumno && selectedCatedra && alumnoPaymentStatus && (
          <Modal
            isOpen={isAlumnoPaymentModalOpen}
            onClose={() => setIsAlumnoPaymentModalOpen(false)}
            title={`Estado de Pago: ${selectedAlumno.nombre} ${selectedAlumno.apellido} en ${selectedCatedra.nombre}`}
            showSubmitButton={false}
            cancelText="Cerrar"
          >
            <div className="space-y-4 text-gray-200">
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <p className="text-sm"><span className="font-semibold text-purple-400">Estado General:</span> <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusColor(alumnoPaymentStatus.estadoActual)}`}>{alumnoPaymentStatus.estadoActual}</span></p>
                <p className="text-sm"><span className="font-semibold text-purple-400">Matrícula Pendiente:</span> {alumnoPaymentStatus.deudaMatricula > 0 ? `${alumnoPaymentStatus.deudaMatricula} Gs.` : 'No'}</p>
                
                {alumnoPaymentStatus.deudaCuotas && alumnoPaymentStatus.deudaCuotas.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-purple-400 mt-2">Cuotas Pendientes:</p>
                    <ul className="list-disc list-inside ml-4 text-sm">
                      {alumnoPaymentStatus.deudaCuotas.map((cuota, index) => (
                        <li key={index}>{cuota.periodo}: {cuota.monto} Gs. ({cuota.estado})</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="diaCobro" className="block text-sm font-medium text-gray-300 mb-1">Día de Cobro Mensual:</label>
                <input
                  type="number"
                  id="diaCobro"
                  value={diaCobro}
                  onChange={(e) => setDiaCobro(e.target.value)}
                  className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:border-blue-500"
                  placeholder="1-31"
                  min="1"
                  max="31"
                />
                <button
                  onClick={handleUpdateDiaCobro}
                  className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg text-sm"
                >
                  Actualizar Día de Cobro
                </button>
              </div>

              <div className="bg-gray-800/50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-400 mb-2">Historial de Pagos Registrados:</h4>
                {alumnoPaymentStatus.pagosRegistrados && alumnoPaymentStatus.pagosRegistrados.length > 0 ? (
                  <ul className="list-disc list-inside ml-4 text-sm space-y-1">
                    {alumnoPaymentStatus.pagosRegistrados.map((pago) => (
                      <li key={pago.id}>
                        {new Date(pago.fecha).toLocaleDateString()}: {pago.monto} Gs. ({pago.tipo}{pago.periodo ? ` - ${pago.periodo}` : ''})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400">No hay pagos registrados para este alumno en esta cátedra.</p>
                )}
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default AdminPaymentManagementPage;
