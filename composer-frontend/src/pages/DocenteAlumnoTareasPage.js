import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import Swal from 'sweetalert2';
import Modal from '../components/Modal';

// ============================================
// COMPONENTES AUXILIARES
// ============================================

const FileIcon = React.memo(({ fileType }) => {
  const iconSize = "w-12 h-12";
  const icons = {
    pdf: (
      <div className="relative">
        <svg className={`${iconSize} text-red-500`} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
        </svg>
        <span className="absolute bottom-0 right-0 text-[8px] font-bold bg-red-600 text-white px-1 rounded">PDF</span>
      </div>
    ),
    word: (
      <div className="relative">
        <svg className={`${iconSize} text-blue-500`} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
        </svg>
        <span className="absolute bottom-0 right-0 text-[8px] font-bold bg-blue-600 text-white px-1 rounded">DOC</span>
      </div>
    ),
    powerpoint: (
      <div className="relative">
        <svg className={`${iconSize} text-orange-500`} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
        </svg>
        <span className="absolute bottom-0 right-0 text-[8px] font-bold bg-orange-600 text-white px-1 rounded">PPT</span>
      </div>
    ),
    default: (
      <svg className={`${iconSize} text-gray-400`} fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
      </svg>
    )
  };

  return icons[fileType] || icons.default;
});

const StatusBadge = React.memo(({ estado, puntosObtenidos, puntosPosibles }) => {
  const badges = {
    CALIFICADA: {
      bg: 'bg-gradient-to-r from-green-500 to-emerald-600',
      text: 'text-white',
      icon: '✓',
      label: `${puntosObtenidos}/${puntosPosibles} pts`
    },
    ENTREGADA: {
      bg: 'bg-gradient-to-r from-amber-500 to-orange-600',
      text: 'text-white',
      icon: '⏳',
      label: 'Por Calificar'
    },
    ASIGNADA: {
      bg: 'bg-gradient-to-r from-slate-500 to-slate-600',
      text: 'text-white',
      icon: '📋',
      label: 'Sin Entregar'
    }
  };

  const badge = badges[estado] || badges.ASIGNADA;
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-full ${badge.bg} ${badge.text} shadow-lg`}>
      <span>{badge.icon}</span>
      <span>{badge.label}</span>
    </span>
  );
});

// ============================================
// UTILIDADES
// ============================================

const getAttachmentInfo = (paths, baseUrl) => {
  if (!paths || (Array.isArray(paths) && paths.length === 0)) return [];

  const processPath = (path) => {
    if (!path || typeof path !== 'string') return null;
    let correctedPath = path.startsWith('/uploads/') ? path : `/uploads/${path}`;


    
    const fullUrl = `${baseUrl}${correctedPath}`;
    const extension = correctedPath.split('.').pop().toLowerCase();
    const filename = correctedPath.split('/').pop();
    
    const fileTypeMap = {
      png: 'image', jpg: 'image', jpeg: 'image', gif: 'image', webp: 'image',
      pdf: 'pdf',
      doc: 'word', docx: 'word',
      ppt: 'powerpoint', pptx: 'powerpoint'
    };
    
    return { 
      url: fullUrl, 
      fileType: fileTypeMap[extension] || 'other', 
      filename 
    };
  };

  if (Array.isArray(paths)) {
    return paths.map(processPath).filter(info => info !== null);
  } else {
    const info = processPath(paths);
    return info ? [info] : [];
  }
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// ============================================
// COMPONENTES DE RENDERIZADO
// ============================================

const EvaluacionCard = React.memo(({ evaluacion, catedraId, alumnoId }) => {
  return (
    <div className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl p-6 rounded-2xl shadow-xl hover:shadow-2xl border border-white/10">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center text-xl shadow-lg">
              📝
            </div>
            <h3 className="text-xl font-bold text-white">{evaluacion.titulo}</h3>
          </div>
          <p className="text-sm text-gray-300 flex items-center gap-2">
            <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
            {formatDate(evaluacion.created_at)}
          </p>
        </div>
        <span className={`px-4 py-2 text-sm font-bold rounded-full whitespace-nowrap shadow-lg ${
          (evaluacion.estado === 'CALIFICADA' || evaluacion.estado === 'REALIZADA') 
            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' 
            : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white'
        }`}>
          {(evaluacion.estado === 'CALIFICADA' || evaluacion.estado === 'REALIZADA') 
            ? (evaluacion.puntos_obtenidos !== null && evaluacion.total_preguntas > 0 
                ? `✓ ${((evaluacion.puntos_obtenidos / evaluacion.total_preguntas) * 100).toFixed(0)}%` 
                : '✓ N/A%') 
            : '⏳ Pendiente'}
        </span>
      </div>
      
      <div className="border-t border-white/10 pt-4 flex justify-end">
        {(evaluacion.estado === 'CALIFICADA' || evaluacion.estado === 'REALIZADA') ? (
          <Link 
            to={`/docente/catedra/${catedraId}/alumnos/${alumnoId}/evaluaciones/${evaluacion.id}/results`} 
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <span>Ver Resultados</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        ) : (
          <Link 
            to={`/realizar-evaluacion/${evaluacion.id}`} 
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <span>Realizar Evaluación</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        )}
      </div>
    </div>
  );
});

const TareaCard = React.memo(({ 
  tarea, 
  calificacion, 
  onCalificacionChange, 
  onCalificar, 
  guardando, 
  openAttachmentModal,
  STATIC_ASSET_BASE_URL 
}) => {
  const attachments = getAttachmentInfo(tarea.submission_path, STATIC_ASSET_BASE_URL);
  const esCalificada = tarea.estado === 'CALIFICADA';
  const esEntregada = tarea.estado === 'ENTREGADA';

  return (
    <div className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl shadow-xl hover:shadow-2xl overflow-hidden border border-white/10">
      {/* Header de la Tarea */}
      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 p-6 border-b border-white/10">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-2xl shadow-lg">
                📚
              </div>
              <h3 className="text-2xl font-bold text-white">{tarea.titulo}</h3>
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm bg-white/10 px-3 py-1.5 rounded-lg">
                <span className="text-yellow-400">⭐</span>
                <span className="text-white font-semibold">{tarea.puntos_posibles} puntos</span>
              </div>
              <div className="flex items-center gap-2 text-sm bg-white/10 px-3 py-1.5 rounded-lg">
                <span className="text-blue-400">📅</span>
                <span className="text-white font-semibold">{formatDate(tarea.fecha_entrega)}</span>
              </div>
            </div>
          </div>
          <StatusBadge 
            estado={tarea.estado} 
            puntosObtenidos={tarea.puntos_obtenidos} 
            puntosPosibles={tarea.puntos_posibles} 
          />
        </div>

        {tarea.descripcion && (
          <div className="mt-4 p-4 bg-black/20 rounded-xl border border-white/10">
            <div className="text-gray-200 leading-relaxed" dangerouslySetInnerHTML={{ __html: tarea.descripcion }}></div>
          </div>
        )}
      </div>

      {/* Contenido de la Tarea */}
      <div className="p-6">
        {!tarea.submission_path && tarea.estado === 'ASIGNADA' ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-4xl">
              ⏱️
            </div>
            <p className="text-gray-300 text-lg font-medium">
              El alumno aún no ha entregado esta tarea
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Sección de Entrega */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-lg">
                  📤
                </div>
                <h4 className="font-bold text-xl text-white">Entrega del Alumno</h4>
              </div>
              
              <div className="bg-gradient-to-br from-blue-600/10 to-cyan-600/10 p-4 rounded-xl border border-blue-500/20">
                <p className="text-sm text-gray-300 flex items-center gap-2">
                  <span className="text-blue-400">🕐</span>
                  {formatDateTime(tarea.submission_date)}
                </p>
              </div>
              
              <div className="bg-black/20 p-5 rounded-xl border border-white/10">
                <p className="font-semibold mb-4 text-white flex items-center gap-2">
                  <span className="text-purple-400">📎</span>
                  Archivos Adjuntos
                </p>
                {attachments.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {attachments.map((att, index) => att.url && (
                      <div 
                        key={index} 
                        className="relative group block w-full h-32 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-white/10"
                        onClick={() => openAttachmentModal(att, attachments)}
                      >
                        {att.fileType === 'image' ? (
                          <img 
                            src={att.url} 
                            alt={att.filename} 
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="absolute inset-0 w-full h-full bg-gray-800 flex items-center justify-center text-white text-4xl group-hover:bg-gray-700 transition-colors duration-300">
                            <FileIcon fileType={att.fileType} />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span className="text-white text-sm font-semibold p-2 bg-black bg-opacity-75 rounded-md">{att.filename}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-4">No hay archivos adjuntos.</p>
                )}
              </div>
            </div>

            {/* Sección de Calificación */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-lg">
                  ✍️
                </div>
                <h4 className="font-bold text-xl text-white">Calificación</h4>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-200 mb-3 flex items-center gap-2">
                  <span className="text-yellow-400">⭐</span>
                  Puntos Obtenidos
                </label>
                {esCalificada ? (
                  <div className="text-2xl font-bold text-white bg-gradient-to-r from-green-600/30 to-emerald-600/30 border-2 border-green-500/50 rounded-xl px-6 py-4 text-center shadow-lg">
                    {tarea.puntos_obtenidos !== null 
                      ? `${tarea.puntos_obtenidos} / ${tarea.puntos_posibles}` 
                      : 'N/A'}
                  </div>
                ) : (
                  <input
                    type="number"
                    value={calificacion.puntos}
                    onChange={(e) => onCalificacionChange(tarea.id, 'puntos', e.target.value)}
                    className="w-full bg-black/30 border-2 border-purple-500/50 focus:border-purple-400 focus:ring-4 focus:ring-purple-500/20 rounded-xl px-4 py-3 transition-all text-white text-lg font-semibold placeholder-gray-500"
                    placeholder={`Máximo: ${tarea.puntos_posibles} pts`}
                    max={tarea.puntos_posibles}
                    min="0"
                    disabled={guardando}
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-200 mb-3 flex items-center gap-2">
                  <span className="text-blue-400">💬</span>
                  Comentario del Docente
                </label>
                {esCalificada ? (
                  <div className="text-sm text-gray-200 bg-black/30 border border-white/10 rounded-xl px-4 py-4 min-h-[100px] whitespace-pre-wrap leading-relaxed">
                    {tarea.comentario_docente || '📝 Sin comentarios.'}
                  </div>
                ) : (
                  <textarea
                    rows="5"
                    value={calificacion.comentario}
                    onChange={(e) => onCalificacionChange(tarea.id, 'comentario', e.target.value)}
                    className="w-full bg-black/30 border-2 border-purple-500/50 focus:border-purple-400 focus:ring-4 focus:ring-purple-500/20 rounded-xl px-4 py-3 transition-all resize-none text-white placeholder-gray-500"
                    placeholder="Escribe tu retroalimentación para el alumno..."
                    disabled={guardando}
                  />
                )}
              </div>

              {esEntregada && (
                <button 
                  onClick={() => onCalificar(tarea.id, tarea.puntos_posibles)} 
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] flex items-center justify-center gap-2"
                  disabled={guardando}
                >
                  {guardando ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <span>✓</span>
                      <span>Guardar Calificación</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

const SeccionTareas = React.memo(({ 
  titulo, 
  emoji,
  tareas, 
  calificaciones, 
  onCalificacionChange, 
  onCalificar, 
  guardando, 
  openAttachmentModal,
  STATIC_ASSET_BASE_URL,
  gradientFrom,
  gradientTo
}) => {
  return (
    <section>
      <div className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} p-4 rounded-2xl mb-6 shadow-lg`}>
        <h3 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
          <span className="text-3xl">{emoji}</span>
          <span>{titulo}</span>
          <span className="ml-auto bg-white/20 px-4 py-2 rounded-full text-lg">
            {tareas.length}
          </span>
        </h3>
      </div>
      {tareas.length > 0 ? (
        <div className="space-y-6">
          {tareas.map(tarea => (
            <TareaCard 
              key={tarea.id}
              tarea={tarea}
              calificacion={calificaciones[tarea.id] || { puntos: '', comentario: '' }}
              onCalificacionChange={onCalificacionChange}
              onCalificar={onCalificar}
              guardando={guardando}
              openAttachmentModal={openAttachmentModal}
              STATIC_ASSET_BASE_URL={STATIC_ASSET_BASE_URL}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gradient-to-br from-white/5 to-white/10 rounded-2xl border border-white/10">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-gray-300 text-lg font-medium">
            No hay tareas en esta sección
          </p>
        </div>
      )}
    </section>
  );
});

const SeccionEvaluaciones = React.memo(({ 
  titulo, 
  emoji,
  evaluaciones, 
  catedraId, 
  alumnoId,
  gradientFrom,
  gradientTo
}) => {
  return (
    <section>
      <div className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} p-4 rounded-2xl mb-6 shadow-lg`}>
        <h3 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
          <span className="text-3xl">{emoji}</span>
          <span>{titulo}</span>
          <span className="ml-auto bg-white/20 px-4 py-2 rounded-full text-lg">
            {evaluaciones.length}
          </span>
        </h3>
      </div>
      {evaluaciones.length > 0 ? (
        <div className="space-y-6">
          {evaluaciones.map(evaluacion => (
            <EvaluacionCard 
              key={evaluacion.id}
              evaluacion={evaluacion}
              catedraId={catedraId}
              alumnoId={alumnoId}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gradient-to-br from-white/5 to-white/10 rounded-2xl border border-white/10">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-gray-300 text-lg font-medium">
            No hay evaluaciones en esta sección
          </p>
        </div>
      )}
    </section>
  );
});

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

const DocenteAlumnoTareasPage = () => {
  const { catedraId, alumnoId } = useParams();
  
  const [data, setData] = useState(null);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [calificaciones, setCalificaciones] = useState({});
  const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);
  const [modalAttachments, setModalAttachments] = useState([]);
  const [currentAttachmentIndex, setCurrentAttachmentIndex] = useState(0);
  const [guardando, setGuardando] = useState(false);

  const STATIC_ASSET_BASE_URL = process.env.REACT_APP_API_URL 
    ? new URL(process.env.REACT_APP_API_URL).origin 
    : '';

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [tareasResponse, evaluacionesResponse] = await Promise.all([
        api.getEntregasForAlumno(catedraId, alumnoId),
        api.getEvaluacionesForAlumno(catedraId, alumnoId),
      ]);

      setData(tareasResponse.data);
      setEvaluaciones(evaluacionesResponse.data);

      const initialCalificaciones = {};
      tareasResponse.data.tareasConEntregas.forEach(tarea => {
        if (tarea.entrega || tarea.estado === 'ENTREGADA') {
          initialCalificaciones[tarea.id] = {
            puntos: tarea.puntos_obtenidos ?? '',
            comentario: tarea.comentario_docente ?? '',
          };
        }
      });
      setCalificaciones(initialCalificaciones);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError(err.response?.data?.error || 'Error al cargar los datos del alumno.');
    } finally {
      setLoading(false);
    }
  }, [catedraId, alumnoId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCalificacionChange = useCallback((tareaId, field, value) => {
    setCalificaciones(prev => ({
      ...prev,
      [tareaId]: { 
        ...prev[tareaId], 
        [field]: value 
      },
    }));
  }, []);

  const handleCalificar = useCallback(async (tareaId, puntosPosibles) => {
    const calificacion = calificaciones[tareaId];
    
    if (calificacion?.puntos === '' || calificacion?.puntos === null) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Debe ingresar una calificación.',
        confirmButtonColor: '#9333ea'
      });
      return;
    }

    const puntos = parseInt(calificacion.puntos, 10);
    if (isNaN(puntos) || puntos < 0 || puntos > puntosPosibles) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `La calificación debe estar entre 0 y ${puntosPosibles}.`,
        confirmButtonColor: '#9333ea'
      });
      return;
    }

    try {
      setGuardando(true);
      await api.calificarTarea(tareaId, {
        puntos_obtenidos: puntos,
        comentario_docente: calificacion.comentario || null,
      });
      
      await Swal.fire({
        icon: 'success',
        title: '¡Calificado!',
        text: 'La entrega ha sido calificada exitosamente.',
        confirmButtonColor: '#9333ea',
        timer: 2000
      });
      
      fetchData();
    } catch (error) {
      console.error('Error al calificar:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.error || 'No se pudo guardar la calificación.',
        confirmButtonColor: '#9333ea'
      });
    } finally {
      setGuardando(false);
    }
  }, [calificaciones, fetchData]);

  const openAttachmentModal = useCallback((clickedAttachment, allAttachments) => {
    setModalAttachments(allAttachments);
    const index = allAttachments.findIndex(att => att.url === clickedAttachment.url);
    setCurrentAttachmentIndex(index !== -1 ? index : 0);
    setIsAttachmentModalOpen(true);
  }, []);

  const { 
    tareasPendientesDeEntrega, 
    tareasEntregadasPendientesDeCalificacion, 
    tareasCalificadas 
  } = useMemo(() => {
    if (!data?.tareasConEntregas) {
      return {
        tareasPendientesDeEntrega: [],
        tareasEntregadasPendientesDeCalificacion: [],
        tareasCalificadas: []
      };
    }

    return {
      tareasPendientesDeEntrega: data.tareasConEntregas.filter(
        t => t.estado === 'ASIGNADA' && !t.submission_path
      ),
      tareasEntregadasPendientesDeCalificacion: data.tareasConEntregas.filter(
        t => t.estado === 'ENTREGADA' && t.submission_path
      ),
      tareasCalificadas: data.tareasConEntregas.filter(
        t => t.estado === 'CALIFICADA'
      )
    };
  }, [data]);

  const { evaluacionesPendientes, evaluacionesCalificadas } = useMemo(() => ({
    evaluacionesPendientes: evaluaciones.filter(e => e.estado === 'PENDIENTE'),
    // Incluir tanto 'CALIFICADA' como 'REALIZADA'
    evaluacionesCalificadas: evaluaciones.filter(e => ['CALIFICADA', 'REALIZADA'].includes(e.estado))
  }), [evaluaciones]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-purple-500/30"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-purple-500 animate-spin"></div>
          </div>
          <p className="text-white text-xl font-semibold">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-red-600/20 to-red-800/20 border-2 border-red-500/50 backdrop-blur-xl rounded-2xl p-8 max-w-md shadow-2xl">
          <div className="text-6xl mb-4 text-center">⚠️</div>
          <p className="text-red-300 text-center text-lg mb-6">{error}</p>
          <button 
            onClick={fetchData}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg"
          >
            🔄 Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-white text-xl font-semibold">No se encontraron datos.</p>
        </div>
      </div>
    );
  }

  const { alumno } = data;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header con botón de regreso mejorado */}
          <Link 
            to={`/docente/catedra/${catedraId}`} 
            className="mb-8 inline-flex items-center gap-2 text-purple-300 hover:text-purple-200 transition-all duration-300 group bg-white/5 px-4 py-2 rounded-xl hover:bg-white/10 backdrop-blur-sm"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            <span className="font-semibold">Volver a la Cátedra</span>
          </Link>

          {/* Tarjeta de información del alumno mejorada */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-2xl mb-10 border border-white/20">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-4xl shadow-xl">
                👨‍🎓
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-purple-300 mb-2 uppercase tracking-wider">Revisando Tareas de</p>
                <h2 className="text-3xl sm:text-4xl font-bold mb-3 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                  {alumno.nombre} {alumno.apellido}
                </h2>
                <div className="flex items-center gap-2 text-gray-300">
                  <span className="text-xl">📧</span>
                  <span className="text-lg">{alumno.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contenido Principal con espaciado mejorado */}
          <div className="space-y-12">
            {/* Tareas Entregadas Pendientes */}
            <SeccionTareas 
              titulo="Tareas Entregadas - Por Calificar"
              emoji="⏳"
              tareas={tareasEntregadasPendientesDeCalificacion}
              calificaciones={calificaciones}
              onCalificacionChange={handleCalificacionChange}
              onCalificar={handleCalificar}
              guardando={guardando}
              openAttachmentModal={openAttachmentModal}
              STATIC_ASSET_BASE_URL={STATIC_ASSET_BASE_URL}
              gradientFrom="from-amber-600"
              gradientTo="to-orange-600"
            />

            {/* Tareas Calificadas */}
            <SeccionTareas 
              titulo="Tareas Calificadas"
              emoji="✅"
              tareas={tareasCalificadas}
              calificaciones={calificaciones}
              onCalificacionChange={handleCalificacionChange}
              onCalificar={handleCalificar}
              guardando={guardando}
              openAttachmentModal={openAttachmentModal}
              STATIC_ASSET_BASE_URL={STATIC_ASSET_BASE_URL}
              gradientFrom="from-green-600"
              gradientTo="to-emerald-600"
            />

            {/* Tareas Pendientes de Entrega */}
            <SeccionTareas 
              titulo="Tareas Pendientes de Entrega"
              emoji="📋"
              tareas={tareasPendientesDeEntrega}
              calificaciones={calificaciones}
              onCalificacionChange={handleCalificacionChange}
              onCalificar={handleCalificar}
              guardando={guardando}
              openAttachmentModal={openAttachmentModal}
              STATIC_ASSET_BASE_URL={STATIC_ASSET_BASE_URL}
              gradientFrom="from-slate-600"
              gradientTo="to-gray-600"
            />

            {/* Evaluaciones Pendientes */}
            <SeccionEvaluaciones 
              titulo="Evaluaciones Pendientes"
              emoji="📝"
              evaluaciones={evaluacionesPendientes}
              catedraId={catedraId}
              alumnoId={alumnoId}
              gradientFrom="from-orange-600"
              gradientTo="to-pink-600"
            />

            {/* Evaluaciones Calificadas */}
            <SeccionEvaluaciones 
              titulo="Evaluaciones Realizadas"
              emoji="📊"
              evaluaciones={evaluacionesCalificadas}
              catedraId={catedraId}
              alumnoId={alumnoId}
              gradientFrom="from-blue-600"
              gradientTo="to-cyan-600"
            />
          </div>
        </div>
      </div>

      {/* Modal de Adjuntos mejorado */}
      <Modal 
        isOpen={isAttachmentModalOpen} 
        onClose={() => setIsAttachmentModalOpen(false)} 
        title={`Adjunto ${modalAttachments.length > 0 ? currentAttachmentIndex + 1 : 0} de ${modalAttachments.length}`} 
        showSubmitButton={false} 
        cancelText="Cerrar"
      >
        <div className="p-6">
          {modalAttachments.length > 0 && modalAttachments[currentAttachmentIndex] ? (
            <div className="relative">
              {modalAttachments[currentAttachmentIndex].fileType === 'image' ? (
                <img 
                  src={modalAttachments[currentAttachmentIndex].url} 
                  alt="Adjunto" 
                  className="max-w-full h-auto rounded-lg mx-auto"
                />
              ) : modalAttachments[currentAttachmentIndex].fileType === 'pdf' ? (
                <iframe 
                  src={modalAttachments[currentAttachmentIndex].url} 
                  title="Documento PDF" 
                  className="w-full" 
                  style={{ height: '70vh' }}
                ></iframe>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 bg-gray-800 rounded-lg text-white">
                  <FileIcon fileType={modalAttachments[currentAttachmentIndex].fileType} size={64} />
                  <p className="mt-4 text-xl font-semibold">{modalAttachments[currentAttachmentIndex].filename}</p>
                  <a 
                    href={modalAttachments[currentAttachmentIndex].url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                  >
                    Descargar {modalAttachments[currentAttachmentIndex].fileType.toUpperCase()}
                  </a>
                </div>
              )}
              
              {modalAttachments.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentAttachmentIndex(prev => (prev - 1 + modalAttachments.length) % modalAttachments.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-2 rounded-full text-2xl z-10"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => setCurrentAttachmentIndex(prev => (prev + 1) % modalAttachments.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-2 rounded-full text-2xl z-10"
                  >
                    →
                  </button>
                </>
              )}
            </div>
          ) : (
            <p className="text-white">No hay adjunto para mostrar.</p>
          )}
        </div>
      </Modal>
    </>
  );
};

export default DocenteAlumnoTareasPage;