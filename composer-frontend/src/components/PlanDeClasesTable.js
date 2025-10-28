import React, { useState } from 'react';
import Modal from './Modal';
import UnidadPlanForm from './UnidadPlanForm';
import Swal from 'sweetalert2';
import api from '../api';
import { ArrowLeft, Plus, Edit3, Trash2, Eye, BookOpen, Clock, Globe, Youtube, FileText } from 'lucide-react';

const getYouTubeVideoId = (url) => {
  const regex = /(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|)([^\s&?"'<]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};


const PlanDeClasesTable = ({ plan, onBackToPlanes, fetchPlanesDeClase }) => {
  const [isUnidadModalOpen, setIsUnidadModalOpen] = useState(false);
  const [editingUnidad, setEditingUnidad] = useState(null);
  const [isUnidadDetailModalOpen, setIsUnidadDetailModalOpen] = useState(false);
  const [selectedUnidad, setSelectedUnidad] = useState(null);

  const handleAddUnidad = () => {
    setEditingUnidad(null);
    setIsUnidadModalOpen(true);
  };

  const handleEditUnidad = (unidad) => {
    setEditingUnidad(unidad);
    setIsUnidadModalOpen(true);
  };

  const handleUnidadCreated = () => {
    fetchPlanesDeClase(); // Refresh parent's plans to get updated units
    console.log("[PlanDeClasesTable] Unidad created, fetching plans.");
    setIsUnidadModalOpen(false);
  };

  const handleUnidadUpdated = () => {
    fetchPlanesDeClase(); // Refresh parent's plans to get updated units
    console.log("[PlanDeClasesTable] Unidad updated, fetching plans.");
    setIsUnidadModalOpen(false);
    setEditingUnidad(null);
  };

  const handleDeleteUnidad = async (unidadId) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "¡Esta acción eliminará la unidad del plan de clases!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, ¡eliminarla!',
      cancelButtonText: 'Cancelar'
    });
    if (result.isConfirmed) {
      try {
        await api.deleteUnidadPlan(unidadId);
        Swal.fire('¡Eliminada!', 'La unidad del plan de clases ha sido eliminada.', 'success');
        fetchPlanesDeClase(); // Refresh parent to get updated units
      } catch (error) {
        Swal.fire('Error', error.response?.data?.message || 'Error al eliminar la unidad.', 'error');
      }
    }
  };

  const openUnidadDetailModal = (unidad) => {
    setSelectedUnidad(unidad);
    setIsUnidadDetailModalOpen(true);
  };

  if (!plan) {
    return <div className="text-center text-slate-400 py-8">Seleccione un plan de clases para ver sus unidades.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 border-b border-slate-700/50 pb-6 mb-6">
        <button
          onClick={onBackToPlanes}
          className="group inline-flex items-center gap-2 text-slate-300 hover:text-white transition-all duration-300"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform duration-300" />
          <span className="font-medium">Volver a Planes</span>
        </button>
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-white">
          Plan: {plan.titulo}
        </h2>
        <span className="ml-auto px-3 py-1 bg-purple-600/20 text-purple-200 rounded-full text-sm font-medium border border-purple-500/30">
          {plan.tipoOrganizacion === 'MES' ? 'Por Mes' : 'Por Módulo'}
        </span>
      </div>

      <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-800/50 to-slate-800/30 p-6 border-b border-slate-700/50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600/20 rounded-lg">
                <BookOpen className="text-indigo-400" size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Unidades del Plan</h3>
                <p className="text-slate-400">{plan.UnidadPlan?.length || 0} unidades definidas</p>
              </div>
            </div>
            <button
              onClick={handleAddUnidad}
              className="group inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-medium rounded-xl transition-all duration-300 shadow-lg shadow-indigo-900/25 hover:shadow-xl hover:shadow-indigo-900/40 hover:scale-105"
            >
              <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
              <span>Crear Nueva Unidad</span>
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {(plan.UnidadPlan?.length || 0) === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 bg-slate-800/50 rounded-full flex items-center justify-center">
                <BookOpen className="text-slate-500" size={32} />
              </div>
              <p className="text-slate-400 text-lg font-medium">No hay unidades definidas para este plan.</p>
              <p className="text-slate-500 text-sm mt-1">Crea la primera unidad para estructurar el contenido.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    <th className="text-left py-4 px-4 text-slate-300 font-semibold">{plan.tipoOrganizacion === 'MES' ? 'Período' : 'Módulo'}</th>
                    <th className="text-left py-4 px-4 text-slate-300 font-semibold">Horas</th>
                    <th className="text-left py-4 px-4 text-slate-300 font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {plan.UnidadPlan.map((unidad) => (
                    <tr key={unidad.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-medium text-white">{unidad.nombre || unidad.periodo}</div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-600/20 text-blue-300 rounded-full text-sm border border-blue-500/30">
                          <Clock size={14} /> {unidad.horasTeoricas}T / {unidad.horasPracticas}P
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openUnidadDetailModal(unidad)}
                            className="p-2 bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 hover:text-indigo-200 rounded-lg transition-all duration-200 border border-indigo-500/30"
                            title="Ver Detalles de Unidad"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleEditUnidad(unidad)}
                            className="p-2 bg-yellow-600/20 text-yellow-300 hover:bg-yellow-600/30 hover:text-yellow-200 rounded-lg transition-all duration-200 border border-yellow-500/30"
                            title="Editar Unidad"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteUnidad(unidad.id)}
                            className="p-2 bg-red-600/20 text-red-300 hover:bg-red-600/30 hover:text-red-200 rounded-lg transition-all duration-200 border border-red-500/30"
                            title="Eliminar Unidad"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal para Crear/Editar Unidad */}
      <Modal
        isOpen={isUnidadModalOpen}
        onClose={() => setIsUnidadModalOpen(false)}
        title={editingUnidad ? `Editar ${plan.tipoOrganizacion === 'MES' ? 'Período' : 'Módulo'} del Plan` : `Crear Nuevo ${plan.tipoOrganizacion === 'MES' ? 'Período' : 'Módulo'} del Plan`}
        showSubmitButton={false}
        showCancelButton={false}
      >
        <UnidadPlanForm
          planDeClasesId={plan.id}
          onUnidadCreated={handleUnidadCreated}
          onUnidadUpdated={handleUnidadUpdated}
          onCancel={() => setIsUnidadModalOpen(false)}
          initialData={editingUnidad}
          isEditMode={!!editingUnidad}
        />
      </Modal>

      {/* Modal para Ver Detalles de Unidad */}
      {selectedUnidad && (
        <Modal
          isOpen={isUnidadDetailModalOpen}
          onClose={() => setIsUnidadDetailModalOpen(false)}
          title={`Detalles de Unidad: ${selectedUnidad.periodo}`}
          showSubmitButton={false}
          cancelText="Cerrar"
        >
          <div className="p-4 text-slate-300 space-y-4">
            <div>
              <h4 className="text-lg font-semibold text-white mb-2">Contenido</h4>
              <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/50 prose prose-invert max-w-none">
                <p>{selectedUnidad.contenido}</p>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-2">Capacidades</h4>
              <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/50 prose prose-invert max-w-none">
                <p>{selectedUnidad.capacidades}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Horas Teóricas</h4>
                <span className="bg-blue-600/20 text-blue-300 rounded-full px-3 py-1 text-sm font-medium border border-blue-500/30">
                  {selectedUnidad.horasTeoricas}
                </span>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Horas Prácticas</h4>
                <span className="bg-green-600/20 text-green-300 rounded-full px-3 py-1 text-sm font-medium border border-green-500/30">
                  {selectedUnidad.horasPracticas}
                </span>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-2">Estrategias Metodológicas</h4>
              <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/50 prose prose-invert max-w-none">
                <p>{selectedUnidad.estrategiasMetodologicas}</p>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-2">Medios de Verificación/Evaluación</h4>
              <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/50 prose prose-invert max-w-none">
                <p>{selectedUnidad.mediosVerificacionEvaluacion}</p>
              </div>
            </div>
            {(selectedUnidad.recursos && selectedUnidad.recursos.length > 0) && (
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Recursos</h4>
                <div className="space-y-3">
                  {selectedUnidad.recursos.map((recurso, index) => (
                    <div key={index} className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/50">
                      {recurso.type === 'youtube' ? (
                        <div className="aspect-video w-full rounded-lg overflow-hidden mb-2">
                          <iframe
                            width="100%"
                            height="100%"
                            src={`https://www.youtube.com/embed/${getYouTubeVideoId(recurso.value)}`}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title="YouTube video player"
                          ></iframe>
                        </div>
                      ) : recurso.type === 'file' ? (
                        <div className="flex items-center gap-2 text-slate-300">
                          <FileText size={20} className="flex-shrink-0 text-purple-400" />
                          <a
                            href={recurso.value.startsWith('http') ? recurso.value : `${process.env.REACT_APP_API_URL}/${recurso.value}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-grow text-blue-400 hover:text-blue-300 truncate font-medium"
                          >
                            {recurso.value.split('/').pop()} {recurso.type && `(${recurso.type})`}
                          </a>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-slate-300">
                          <Globe size={20} className="flex-shrink-0" />
                          <a
                            href={recurso.value}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-grow text-blue-400 hover:text-blue-300 truncate font-medium"
                          >
                            {recurso.value} {recurso.type && `(${recurso.type})`}
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PlanDeClasesTable;