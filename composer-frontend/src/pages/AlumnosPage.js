import React, { useState, useEffect } from 'react';
import api from '../api';
import Modal from '../components/Modal';
import AlumnoForm from '../components/AlumnoForm';
import AlumnoCard from '../components/AlumnoCard';
import toast from 'react-hot-toast';

const AlumnosPage = () => {
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAlumno, setSelectedAlumno] = useState(null);

  const fetchAlumnos = async () => {
    try {
      const response = await api.getAlumnos();
      setAlumnos(response.data);
    } catch (error) {
      toast.error('No se pudieron cargar los alumnos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlumnos();
  }, []);

  const handleFormSubmit = async (formData) => {
    try {
      if (selectedAlumno) {
        await api.updateAlumno(selectedAlumno.id, formData);
        toast.success('Alumno actualizado exitosamente!');
      } else {
        await api.createAlumno(formData);
        toast.success('Alumno creado exitosamente!');
      }
      fetchAlumnos();
      setIsModalOpen(false);
      setSelectedAlumno(null);
    } catch (error) {
      toast.error(error.response?.data?.error || 'No se pudo guardar el alumno.');
    }
  };

  const openModal = (alumno = null) => {
    setSelectedAlumno(alumno);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este alumno?')) {
      try {
        await api.deleteAlumno(id);
        toast.success('Alumno eliminado.');
        fetchAlumnos();
      } catch (error) {
        toast.error('No se pudo eliminar el alumno.');
      }
    }
  };

  if (loading) return <div className="text-center p-8">Cargando...</div>;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4 sm:p-6 md:p-8">
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
          <div className="flex flex-col md:flex-row md:justify-between md:items-center text-center md:text-left mb-10">
            <h2 className="text-4xl font-bold">Gestión de Alumnos</h2>
            <button onClick={() => openModal()} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-4 md:mt-0">
              Crear Alumno
            </button>
          </div>

          {/* Vista de tabla para pantallas grandes */}
          <div className="hidden md:block bg-white/5 backdrop-blur-lg p-6 rounded-lg shadow-xl">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Nombre Completo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Instrumento</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {alumnos.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-200">{a.nombre} {a.apellido}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">{a.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">{a.instrumento || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button onClick={() => openModal(a)} className="text-yellow-400 hover:text-yellow-500 mr-4">Editar</button>
                        <button onClick={() => handleDelete(a.id)} className="text-red-400 hover:text-red-500">Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Vista de tarjetas para pantallas pequeñas */}
          <div className="block md:hidden">
            {alumnos.map((a) => (
              <AlumnoCard key={a.id} alumno={a} onEdit={openModal} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedAlumno ? 'Editar Alumno' : 'Crear Alumno'} showSubmitButton={false} cancelText="">
        <AlumnoForm 
          onSubmit={handleFormSubmit} 
          initialData={selectedAlumno}
          onCancel={() => {
            setIsModalOpen(false);
            setSelectedAlumno(null);
          }}
        />
      </Modal>
    </>
  );
};

export default AlumnosPage;