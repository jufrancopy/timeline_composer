import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import Swal from 'sweetalert2';
import Modal from '../components/Modal'; // 1. Importar Modal

// Helper Component for File Icons
const FileIcon = ({ fileType }) => {
  const iconSize = "w-10 h-10";
  switch (fileType) {
    case 'pdf':
      return (
        <svg className={`${iconSize} text-red-400`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 17a2 2 0 012-2h10a2 2 0 012 2v2H3v-2zM3 5a2 2 0 012-2h3.293a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V15H5a2 2 0 01-2-2V5zm10-2a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-3zM9 9a1 1 0 01-2 0V5a1 1 0 012 0v4zm2-2a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"></path></svg>
      );
    case 'word':
      return (
        <svg className={`${iconSize} text-blue-400`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 17a2 2 0 012-2h10a2 2 0 012 2v2H3v-2zM3 5a2 2 0 012-2h3.293a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V15H5a2 2 0 01-2-2V5zm10-2a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-3zM9 9h2V5H9v4zm2-6h-2a1 1 0 100 2h2a1 1 0 100-2z" clipRule="evenodd"></path></svg>
      );
    case 'powerpoint':
      return (
         <svg className={`${iconSize} text-orange-400`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 17a2 2 0 012-2h10a2 2 0 012 2v2H3v-2zM3 5a2 2 0 012-2h3.293a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V15H5a2 2 0 01-2-2V5zm10-2a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-3zM9 9V5h2v4H9zm2-6a1 1 0 10-2 0 1 1 0 002 0z" clipRule="evenodd"></path></svg>
      );
    default: // Generic file icon
      return (
        <svg className={`${iconSize} text-gray-400`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-5L9 4H4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1z" clipRule="evenodd"></path></svg>
      );
  }
};

const DocenteAlumnoTareasPage = () => {
  const { catedraId, alumnoId } = useParams();
  const [data, setData] = useState(null);
  const [evaluaciones, setEvaluaciones] = useState([]); // Nuevo estado para evaluaciones
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [calificaciones, setCalificaciones] = useState({});

  // 2. Nuevos estados para el modal de adjuntos
  const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [attachmentType, setAttachmentType] = useState(''); // 'image', 'pdf', or 'other'

  const API_BASE_URL = process.env.REACT_APP_API_URL;
  const STATIC_ASSET_BASE_URL = process.env.REACT_APP_API_URL ? new URL(process.env.REACT_APP_API_URL).origin : '';


  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      console.log(`[FRONTEND] Fetching tareas para catedraId: ${catedraId}, alumnoId: ${alumnoId}`);
      console.log(`[FRONTEND] Fetching evaluaciones para catedraId: ${catedraId}, alumnoId: ${alumnoId}`);
      const [tareasResponse, evaluacionesResponse] = await Promise.all([
        api.getEntregasForAlumno(catedraId, alumnoId),
        api.getEvaluacionesForAlumno(catedraId, alumnoId),
      ]);

      setData(tareasResponse.data);
      setEvaluaciones(evaluacionesResponse.data);

      const initialCalificaciones = {};
      tareasResponse.data.tareasConEntregas.forEach(tarea => {
        if (tarea.entrega) {
          initialCalificaciones[tarea.id] = {
            puntos: tarea.puntos_obtenidos || '',
            comentario: tarea.comentario_docente || '', // Asumiendo que este campo podría existir
          };
        }
      });
      setCalificaciones(initialCalificaciones);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar los datos del alumno.');
    } finally {
      setLoading(false);
    }
  }, [catedraId, alumnoId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCalificacionChange = (tareaId, field, value) => {
    setCalificaciones(prev => ({
      ...prev,
      [tareaId]: { ...prev[tareaId], [field]: value },
    }));
  };

  const handleCalificar = async (tareaId, puntosPosibles) => {
    const calificacion = calificaciones[tareaId];
    if (calificacion.puntos === '' || calificacion.puntos === null) {
      Swal.fire('Error', 'Debe ingresar una calificación.', 'error');
      return;
    }
    const puntos = parseInt(calificacion.puntos, 10);
    if (puntos < 0 || puntos > puntosPosibles) {
      Swal.fire('Error', `La calificación debe estar entre 0 y ${puntosPosibles}.`, 'error');
      return;
    }
    try {
      await api.calificarTarea(tareaId, {
        puntos_obtenidos: puntos,
        comentario_docente: calificacion.comentario,
      });
      Swal.fire('¡Calificado!', 'La entrega ha sido calificada exitosamente.', 'success');
      fetchData();
    } catch (error) {
      Swal.fire('Error', error.response?.data?.error || 'No se pudo guardar la calificación.', 'error');
    }
  };

  // 3. Función para abrir el modal
  const openAttachmentModal = (path) => {
    let correctedPath = path;

    console.log('[DEBUG ADJUNTO] Path recibido (original):', path);

    // Asegurarse de que el path comience con /uploads/ si no lo hace ya
    if (!correctedPath.startsWith('/uploads/')) {
      correctedPath = `/uploads/${correctedPath}`;
      console.log('[DEBUG ADJUNTO] Path después de asegurar /uploads/:', correctedPath);
    }

    // Reemplazar explícitamente '/uploads/entregas/' con '/uploads/tareas/'
    // Esto manejará tanto las rutas antiguas de la DB como posibles inconsistencias
    correctedPath = correctedPath.replace('/uploads/entregas/', '/uploads/tareas/');
    console.log('[DEBUG ADJUNTO] Path después de reemplazar /entregas/ por /tareas/:', correctedPath);
    
    const fullUrl = `${STATIC_ASSET_BASE_URL}${correctedPath}`;

    console.log('[DEBUG ADJUNTO] STATIC_ASSET_BASE_URL (final):', STATIC_ASSET_BASE_URL);
    console.log('[DEBUG ADJUNTO] Full URL final:', fullUrl);

    const extension = correctedPath.split('.').pop().toLowerCase();
    if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(extension)) {
      setAttachmentType('image');
    } else if (extension === 'pdf') {
      setAttachmentType('pdf');
    } else {
      setAttachmentType('other');
    }
    setAttachmentUrl(fullUrl);
    setIsAttachmentModalOpen(true);
  };

  if (loading) return <div className="text-center p-8">Cargando...</div>;
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;
  if (!data) return <div className="text-center p-8">No se encontraron datos.</div>;

  const { alumno, tareasConEntregas } = data;

  const evaluacionesPendientes = evaluaciones.filter(evaluacion => evaluacion.estado === 'PENDIENTE');
  const evaluacionesCalificadas = evaluaciones.filter(evaluacion => evaluacion.estado === 'CALIFICADA');

  // 4. Lógica para separar tareas
  const tareasPendientesDeEntrega = tareasConEntregas.filter(t => t.estado === 'ASIGNADA' && !t.submission_path);
  const tareasEntregadasPendientesDeCalificacion = tareasConEntregas.filter(t => t.estado === 'ENTREGADA' && t.submission_path);
  const tareasCalificadas = tareasConEntregas.filter(t => t.estado === 'CALIFICADA');

  const renderEvaluacion = (evaluacion) => (
    <div key={evaluacion.id} className="bg-white/5 backdrop-blur-lg p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold text-orange-300">{evaluacion.titulo}</h3>
          <p className="text-sm text-gray-400">
            Creada: {new Date(evaluacion.created_at).toLocaleDateString()}
          </p>
        </div>
        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
          evaluacion.estado === 'CALIFICADA' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'
        }`}>
          {evaluacion.estado === 'CALIFICADA' ? `Calificada: ${evaluacion.puntos_obtenidos}%` : 'Pendiente'}
        </span>
      </div>
      <div className="mt-4 border-t border-gray-700 pt-4 text-right">
        {evaluacion.estado === 'CALIFICADA' && (
          <Link to={`/docente/catedras/${catedraId}/alumnos/${alumnoId}/evaluaciones/${evaluacion.id}/results`} className="text-blue-400 hover:underline">Ver Resultados</Link>
        )}
        {evaluacion.estado === 'PENDIENTE' && (
          <Link to={`/realizar-evaluacion/${evaluacion.id}`} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg">Realizar Evaluación</Link>
        )}
      </div>
    </div>
  );

  const renderTarea = (tarea) => {
    // Helper to process attachment path and determine type
    const getAttachmentInfo = (path) => {
      if (!path) {
        return { url: null, fileType: 'none', filename: null };
      }
      let correctedPath = path;
      if (!correctedPath.startsWith('/uploads/')) {
        correctedPath = `/uploads/${correctedPath}`;
      }
      correctedPath = correctedPath.replace('/uploads/entregas/', '/uploads/tareas/');
      
      const fullUrl = `${STATIC_ASSET_BASE_URL}${correctedPath}`;
      const extension = correctedPath.split('.').pop().toLowerCase();
      const filename = correctedPath.split('/').pop();
      
      let fileType = 'other';
      if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(extension)) {
        fileType = 'image';
      } else if (extension === 'pdf') {
        fileType = 'pdf';
      } else if (['doc', 'docx'].includes(extension)) {
        fileType = 'word';
      } else if (['ppt', 'pptx'].includes(extension)) {
        fileType = 'powerpoint';
      }
      
      return { url: fullUrl, fileType, filename };
    };

    const attachment = getAttachmentInfo(tarea.submission_path);

    return (
      <div key={tarea.id} className="bg-white/5 backdrop-blur-lg p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-purple-300">{tarea.titulo}</h3>
            <p className="text-sm text-gray-400">
              Puntos Posibles: {tarea.puntos_posibles} | Vence: {new Date(tarea.fecha_entrega).toLocaleDateString()}
            </p>
          </div>
          <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
            tarea.estado === 'CALIFICADA' ? 'bg-green-500/20 text-green-300'
              : tarea.estado === 'ENTREGADA' ? 'bg-yellow-500/20 text-yellow-300'
              : 'bg-red-500/20 text-red-300'
          }`}>
            {tarea.estado === 'CALIFICADA' ? `Calificada: ${tarea.puntos_obtenidos}/${tarea.puntos_posibles}`
              : tarea.estado === 'ENTREGADA' ? 'Entregada (Pendiente Calificación)'
              : 'Pendiente de Entrega'}
          </span>
        </div>
        <div className="mt-4 border-t border-gray-700 pt-4">
          {(tarea.estado === 'ASIGNADA' && !tarea.submission_path) ? (
            <p className="text-center text-gray-500 italic">Pendiente de Entrega</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Entrega del Alumno</h4>
                <p className="text-sm text-gray-400 mb-2">Entregado el: {new Date(tarea.submission_date).toLocaleString()}</p>
                <div className="bg-gray-800/50 p-3 rounded-md">
                  <p className="font-semibold mb-2">Archivos Adjuntos:</p>
                  {attachment.url ? (
                    <div 
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => openAttachmentModal(tarea.submission_path)}
                    >
                      {attachment.fileType === 'image' ? (
                        <img 
                          src={attachment.url} 
                          alt="Miniatura" 
                          className="w-16 h-16 object-cover rounded-md hover:opacity-80 transition-opacity"
                        />
                      ) : (
                        <div className="flex items-center gap-3 bg-gray-700/50 p-2 rounded-md hover:bg-gray-700 transition-colors">
                          <FileIcon fileType={attachment.fileType} />
                          <span className="text-indigo-400 break-all text-left">
                            {attachment.filename}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : <p className="text-gray-500">No hay archivos.</p>}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Calificación</h4>
                <div className="space-y-4">
                  <div>
                    <label htmlFor={`puntos-${tarea.id}`} className="block text-sm font-medium text-gray-300 mb-1">Puntos Obtenidos</label>
                    <input
                      type="number"
                      id={`puntos-${tarea.id}`}
                      value={calificaciones[tarea.id]?.puntos || ''}
                      onChange={(e) => handleCalificacionChange(tarea.id, 'puntos', e.target.value)}
                      className="w-full bg-gray-900/50 border border-gray-600 rounded-md px-3 py-2"
                      placeholder={`0 - ${tarea.puntos_posibles}`}
                      max={tarea.puntos_posibles} min="0"
                      disabled={tarea.estado === 'CALIFICADA'}
                    />
                  </div>
                  <div>
                    <label htmlFor={`comentario-${tarea.id}`} className="block text-sm font-medium text-gray-300 mb-1">Comentario (Opcional)</label>
                    <textarea
                      id={`comentario-${tarea.id}`}
                      rows="3"
                      value={calificaciones[tarea.id]?.comentario || ''}
                      onChange={(e) => handleCalificacionChange(tarea.id, 'comentario', e.target.value)}
                      className="w-full bg-gray-900/50 border border-gray-600 rounded-md px-3 py-2"
                      placeholder="Añade una devolución para el alumno..."
                      disabled={tarea.estado === 'CALIFICADA'}
                    ></textarea>
                  </div>
                  {tarea.estado === 'ENTREGADA' && (
                    <button onClick={() => handleCalificar(tarea.id, tarea.puntos_posibles)} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg">
                      Guardar Calificación
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4 sm:p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Link to={`/docente/catedra/${catedraId}`} className="mb-6 text-purple-400 hover:text-purple-300 inline-block">&larr; Volver a la Cátedra</Link>
          <div className="bg-white/5 backdrop-blur-lg p-6 rounded-lg shadow-xl mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold">Revisando Tareas de:</h2>
            <p className="text-xl sm:text-2xl text-gray-300">{alumno.nombre} {alumno.apellido}</p>
            <p className="text-md text-gray-400">{alumno.email}</p>
          </div>

          {/* 5. Nueva estructura de renderizado */}
          <div className="space-y-8">
            <section>
              <h3 className="text-xl sm:text-2xl font-bold mb-4 border-b-2 border-purple-500 pb-2">Tareas Entregadas (Pendientes de Calificación)</h3>
              {tareasEntregadasPendientesDeCalificacion.length > 0 ? tareasEntregadasPendientesDeCalificacion.map(renderTarea) : <p className="text-gray-400 italic">No hay tareas entregadas pendientes de calificación.</p>}
            </section>
            <section>
              <h3 className="text-xl sm:text-2xl font-bold mb-4 border-b-2 border-green-500 pb-2">Tareas Calificadas</h3>
              {tareasCalificadas.length > 0 ? tareasCalificadas.map(renderTarea) : <p className="text-gray-400 italic">No hay tareas calificadas.</p>}
            </section>
            <section>
              <h3 className="text-xl sm:text-2xl font-bold mb-4 border-b-2 border-gray-600 pb-2">Tareas Pendientes de Entrega</h3>
              {tareasPendientesDeEntrega.length > 0 ? tareasPendientesDeEntrega.map(renderTarea) : <p className="text-gray-400 italic">No hay tareas pendientes de entrega.</p>}
            </section>

            <section>
              <h3 className="text-xl sm:text-2xl font-bold mb-4 border-b-2 border-orange-500 pb-2">Evaluaciones Pendientes</h3>
              {evaluacionesPendientes.length > 0 ? evaluacionesPendientes.map(renderEvaluacion) : <p className="text-gray-400 italic">No hay evaluaciones pendientes.</p>}
            </section>

            <section>
              <h3 className="text-xl sm:text-2xl font-bold mb-4 border-b-2 border-blue-500 pb-2">Evaluaciones Calificadas</h3>
              {evaluacionesCalificadas.length > 0 ? evaluacionesCalificadas.map(renderEvaluacion) : <p className="text-gray-400 italic">No hay evaluaciones calificadas.</p>}
            </section>
          </div>
        </div>
      </div>

      {/* 6. JSX del Modal */}
      <Modal isOpen={isAttachmentModalOpen} onClose={() => setIsAttachmentModalOpen(false)} title="Vista Previa del Adjunto" showSubmitButton={false} cancelText="Cerrar">
        <div className="p-4">
          {attachmentType === 'image' && <img src={attachmentUrl} alt="Adjunto" className="max-w-full h-auto mx-auto rounded-md" />}
          {attachmentType === 'pdf' && <iframe src={attachmentUrl} title="Visor de PDF" className="w-full h-[70vh]" frameBorder="0"></iframe>}
          {attachmentType === 'other' && (
            <div className="text-center">
              <p className="text-gray-300 mb-4">No se puede previsualizar este tipo de archivo.</p>
              <a href={attachmentUrl} target="_blank" rel="noopener noreferrer" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg">
                Descargar Archivo
              </a>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default DocenteAlumnoTareasPage;