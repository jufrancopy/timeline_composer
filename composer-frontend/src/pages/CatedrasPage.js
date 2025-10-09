import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Modal from '../components/Modal';
import CatedraForm from '../components/CatedraForm';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2'; // Importar SweetAlert2

const CatedrasPage = () => {
  const [catedras, setCatedras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCatedra, setSelectedCatedra] = useState(null);
  const navigate = useNavigate();

  const fetchCatedras = async () => {
    try {
      const response = await api.getCatedras();
      setCatedras(response.data);
    } catch (error) {
      toast.error('No se pudieron cargar las cátedras.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatedras();
  }, []);

  const handleFormSubmit = async (formData) => {
    try {
      if (selectedCatedra) {
        await api.updateCatedra(selectedCatedra.id, formData);
        toast.success('Cátedra actualizada exitosamente!');
      } else {
        await api.createCatedra(formData);
        toast.success('Cátedra creada exitosamente!');
      }
      fetchCatedras();
      setIsModalOpen(false);
      setSelectedCatedra(null);
    } catch (error) {
      toast.error(error.response?.data?.error || 'No se pudo guardar la cátedra.');
    }
  };

  const openModal = (catedra = null) => {
    setSelectedCatedra(catedra);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "¡No podrás revertir esto! Eliminar esta cátedra también eliminará todas las tareas y evaluaciones asociadas.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminarla!',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await api.deleteCatedra(id);
        toast.success('Cátedra eliminada.');
        fetchCatedras();
      } catch (error) {
        toast.error(error.response?.data?.error || 'No se pudo eliminar la cátedra.');
      }
    }
  };

  if (loading) return <div className="text-center p-8">Cargando...</div>;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <button 
            onClick={() => window.history.back()} 
            className="mb-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Volver al Módulo Académico
          </button>
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-4xl font-bold">Gestión de Cátedras</h2>
            <button onClick={() => openModal()} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
              Crear Cátedra
            </button>
          </div>

          <div className="bg-white/5 backdrop-blur-lg p-6 rounded-lg shadow-xl">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Nombre</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Año</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Institución</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Días</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Horario</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Alumnos</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {catedras.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-200">{c.nombre}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">{c.anio}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">{c.institucion}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {c.horariosPorDia && c.horariosPorDia.length > 0 ? (
                          [...new Set(c.horariosPorDia.map(h => h.dia_semana))].join(', ')
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {c.horariosPorDia && c.horariosPorDia.length > 0 ? (
                          c.horariosPorDia.map((horario, index) => (
                            <div key={index}>{horario.hora_inicio} - {horario.hora_fin}</div>
                          ))
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">{c.alumnos.length}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button onClick={() => navigate(`/admin/catedras/${c.id}`)} className="text-blue-400 hover:text-blue-500 mr-4">Ver</button>
                        <button onClick={() => openModal(c)} className="text-yellow-400 hover:text-yellow-500 mr-4">Editar</button>
                        <button onClick={() => handleDelete(c.id)} className="text-red-400 hover:text-red-500">Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedCatedra ? 'Editar Cátedra' : 'Crear Cátedra'} showSubmitButton={false} cancelText="">
        <CatedraForm 
          onSubmit={handleFormSubmit} 
          initialData={selectedCatedra}
          onCancel={() => {
            setIsModalOpen(false);
            setSelectedCatedra(null);
          }}
        />
      </Modal>
    </>
  );
};

export default CatedrasPage;