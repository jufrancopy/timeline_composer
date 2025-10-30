import React from 'react';
import { Plus, Edit3, Trash2, Eye, BookOpen, Calendar } from 'lucide-react';
import Swal from 'sweetalert2';

const PlanDeClasesTable = ({ planesDeClase, onEdit, onDelete, onSelect, onCreate }) => {
  return (
    <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
      <div className="bg-gradient-to-r from-slate-800/50 to-slate-800/30 p-6 border-b border-slate-700/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-600/20 rounded-lg">
              <BookOpen className="text-purple-400" size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Gestión de Planes de Clases</h3>
              <p className="text-slate-400">{planesDeClase?.length || 0} planes registrados</p>
            </div>
          </div>
          <button
            onClick={onCreate}
            className="group inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium rounded-xl transition-all duration-300 shadow-lg shadow-purple-900/25 hover:shadow-xl hover:shadow-purple-900/40 hover:scale-105"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
            <span>Crear Nuevo Plan</span>
          </button>
        </div>
      </div>
      
      <div className="p-6">
        {planesDeClase.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 bg-slate-800/50 rounded-full flex items-center justify-center">
              <BookOpen className="text-slate-500" size={32} />
            </div>
            <p className="text-slate-400 text-lg font-medium">No hay planes de clases registrados.</p>
            <p className="text-slate-500 text-sm mt-1">Crea un plan para organizar el contenido de tu cátedra.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-left py-4 px-4 text-slate-300 font-semibold">Título</th>
                  <th className="text-left py-4 px-4 text-slate-300 font-semibold">Año</th>
                  <th className="text-left py-4 px-4 text-slate-300 font-semibold">Tipo</th>
                  <th className="text-left py-4 px-4 text-slate-300 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {planesDeClase.map((plan) => (
                  <tr key={plan.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-medium text-white">{plan.titulo}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-600/20 text-blue-300 rounded-full text-sm border border-blue-500/30">
                        <Calendar size={14} /> {plan.anio}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-600/20 text-purple-300 rounded-full text-sm border border-purple-500/30">
                        {plan.tipoOrganizacion === 'MES' ? 'Por Mes' : 'Por Módulo'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onSelect(plan)}
                          className="p-2 bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 hover:text-indigo-200 rounded-lg transition-all duration-200 border border-indigo-500/30"
                          title="Ver Unidades"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => onEdit(plan)}
                          className="p-2 bg-yellow-600/20 text-yellow-300 hover:bg-yellow-600/30 hover:text-yellow-200 rounded-lg transition-all duration-200 border border-yellow-500/30"
                          title="Editar Plan"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => onDelete(plan.id)}
                          className="p-2 bg-red-600/20 text-red-300 hover:bg-red-600/30 hover:text-red-200 rounded-lg transition-all duration-200 border border-red-500/30"
                          title="Eliminar Plan"
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
  );
};

export default PlanDeClasesTable;
