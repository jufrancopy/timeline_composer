import React, { useState, useEffect } from 'react';
import api from '../api';
import Modal from '../components/Modal';
import DocenteForm from '../components/DocenteForm';
import toast from 'react-hot-toast';

const DocentesPage = () => {
  const [docentes, setDocentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDocente, setSelectedDocente] = useState(null);

  const fetchDocentes = async () => {
    try {
      const response = await api.getDocentes();
      setDocentes(response.data);
    } catch (error) {
      toast.error('No se pudieron cargar los docentes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocentes();
  }, []);

  const handleFormSubmit = async (formData) => {
    try {
      if (selectedDocente) {
        await api.updateDocente(selectedDocente.id, formData);
        toast.success('Docente actualizado exitosamente!');
      } else {
        await api.createDocente(formData);
        toast.success('Docente creado exitosamente!');
      }
      fetchDocentes();
      setIsModalOpen(false);
      setSelectedDocente(null);
    } catch (error) {
      toast.error(error.response?.data?.error || 'No se pudo guardar el docente.');
    }
  };

  const openModal = (docente = null) => {
    setSelectedDocente(docente);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este docente?')) {
      try {
        await api.deleteDocente(id);
        toast.success('Docente eliminado.');
        fetchDocentes();
      } catch (error) {
        toast.error('No se pudo eliminar el docente.');
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
            <h2 className="text-4xl font-bold">Gestión de Docentes</h2>
            <button onClick={() => openModal()} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
              Crear Docente
            </button>
          </div>

          <div className="bg-white/5 backdrop-blur-lg p-6 rounded-lg shadow-xl">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Nombre Completo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {docentes.map((d) => (
                    <tr key={d.id} className="hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-200">{d.nombre} {d.apellido}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">{d.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button onClick={() => openModal(d)} className="text-yellow-400 hover:text-yellow-500 mr-4">Editar</button>
                        <button onClick={() => handleDelete(d.id)} className="text-red-400 hover:text-red-500">Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedDocente ? 'Editar Docente' : 'Crear Docente'} showSubmitButton={false} cancelText="">
        <DocenteForm 
          onSubmit={handleFormSubmit} 
          initialData={selectedDocente}
          onCancel={() => {
            setIsModalOpen(false);
            setSelectedDocente(null);
          }}
        />
      </Modal>
    </>
  );
};

export default DocentesPage;