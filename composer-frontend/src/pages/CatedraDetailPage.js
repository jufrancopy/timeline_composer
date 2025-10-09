import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import api from '../api';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import Swal from 'sweetalert2'; // Importar SweetAlert2
import TareaForm from '../components/TareaForm';
import PublicacionCard from '../components/PublicacionCard';
import PublicacionForm from '../components/PublicacionForm';
import { jwtDecode } from 'jwt-decode';

const InscribirAlumnoModal = ({ catedraId, alumnosDisponibles, onInscribir, onCancel, catedra }) => {
  const [selectedAlumnoId, setSelectedAlumnoId] = useState('');
  const [diaCobro, setDiaCobro] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedAlumnoId) {
      const selectedAlumno = alumnosDisponibles.find(a => a.id === selectedAlumnoId);
      if (selectedAlumno?.isComposer) {
        onInscribir(catedraId, selectedAlumno.composerId, true, diaCobro ? parseInt(diaCobro) : null);
      } else {
        onInscribir(catedraId, parseInt(selectedAlumnoId), false, diaCobro ? parseInt(diaCobro) : null);
      }
    } else {
      toast.error('Debes seleccionar un alumno.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <p className="mb-4 text-gray-300">Selecciona un alumno para inscribir en esta cátedra.</p>
      {catedra && catedra.modalidad_pago === 'PARTICULAR' && (
        <div className="mb-4">
          <label htmlFor="diaCobro" className="block mb-1 font-semibold text-gray-200">Día de Cobro Mensual (1-31)</label>
          <input
            type="number"
            id="diaCobro"
            min="1"
            max="31"
            value={diaCobro}
            onChange={(e) => setDiaCobro(e.target.value)}
            className="w-full p-2 bg-gray-700 rounded text-white"
            placeholder="Ej: 5 (se cobrará el día 5 de cada mes)"
          />
        </div>
      )}
      <select 
        value={selectedAlumnoId} 
        onChange={(e) => setSelectedAlumnoId(e.target.value)}
        className="w-full p-2 bg-gray-700 rounded text-white"
      >
        <option value="">-- Seleccionar Alumno --</option>
        {alumnosDisponibles.map(alumno => (
          <option key={alumno.id} value={alumno.id}>
            {`${alumno.nombre} ${alumno.apellido} ${alumno.isComposer ? '(Contribuyente)' : ''}`}
          </option>
        ))}
      </select>
      <div className="flex justify-end space-x-4 pt-6">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500">Cancelar</button>
        <button type="submit" className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-500">Inscribir</button>
      </div>
    </form>
  );
};

const CatedraDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [catedra, setCatedra] = useState(null);
  const [allAlumnos, setAllAlumnos] = useState([]);
  const [studentComposers, setStudentComposers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTareaModalOpen, setIsTareaModalOpen] = useState(false);
  const [isTaskDetailModalOpen, setIsTaskDetailModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isAssignTaskModalOpen, setIsAssignTaskModalOpen] = useState(false); // Nuevo estado para el modal de asignación
  const [selectedTareaMaestraForAssignment, setSelectedTareaMaestraForAssignment] = useState(null); // TareaMaestra seleccionada para asignar
  const [isEvaluationDetailModalOpen, setIsEvaluationDetailModalOpen] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [tareasAgrupadas, setTareasAgrupadas] = useState([]);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [selectedDiaClase, setSelectedDiaClase] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date()); // Para el calendario
  const [attendanceData, setAttendanceData] = useState({}); // { diaClaseId: { alumnoId: presente } }
  const [isAlumnoAttendanceDetailModalOpen, setIsAlumnoAttendanceDetailModalOpen] = useState(false);
  const [selectedAlumnoAttendance, setSelectedAlumnoAttendance] = useState(null);

  // State for Publicaciones (Tablón)
  const [publicaciones, setPublicaciones] = useState([]);
  const [isPublicacionModalOpen, setIsPublicacionModalOpen] = useState(false);
  const [editingPublicacion, setEditingPublicacion] = useState(null);
  const [publicationLoading, setPublicationLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [userRole, setUserRole] = useState(null);

  const fetchPublicaciones = useCallback(async () => {
    try {
      const response = await api.getPublicaciones(id);
      setPublicaciones(response.data);
    } catch (err) {
      console.error("Error al cargar publicaciones:", err);
      toast.error('No se pudieron cargar las publicaciones del tablón.');
    }
  }, [id]);

  const handleAddComment = async (publicacionId, commentData) => {
    try {
      await api.createComentario(publicacionId, commentData);
      fetchPublicaciones();
      toast.success('Comentario añadido exitosamente!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al añadir el comentario.');
    }
  };

  const handleDeleteComment = async (publicacionId, commentId) => {
    // Los alumnos no pueden borrar comentarios, pero la prop es necesaria.
  };

  const handleInteractToggle = async (publicacionId, hasUserInteracted) => {
    try {
      if (hasUserInteracted) {
        await api.uninteractWithPublicacion(publicacionId);
      } else {
        await api.interactWithPublicacion(publicacionId);
      }
      fetchPublicaciones();
    } catch (error) {
      console.error("Error al interactuar con la publicación:", error);
      toast.error('Error al registrar la interacción.');
    }
  };
  
  const handleCreatePublicacion = async (catedraId, data) => {
    setPublicationLoading(true);
    try {
      await api.createPublicacion(catedraId, data);
      Swal.fire('Publicación Creada', 'La publicación ha sido añadida al tablón.', 'success');
      setIsPublicacionModalOpen(false);
      fetchPublicaciones();
    } catch (error) {
      Swal.fire('Error', error.response?.data?.error || 'Error al crear la publicación.', 'error');
    } finally {
      setPublicationLoading(false);
    }
  };
  
  const openPublicacionModal = (publicacion = null) => {
    setEditingPublicacion(publicacion);
    setIsPublicacionModalOpen(true);
  };


  const openTaskDetailModal = (task) => {
    setSelectedTask(task);
    setIsTaskDetailModalOpen(true);
  };

  // Determinar la URL base para los archivos estáticos del backend
  // Se asume que la API_URL termina en /api y que los estáticos están en la raíz del mismo dominio
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';
  const STATIC_ASSET_BASE_URL = API_BASE_URL.endsWith('/api')
    ? API_BASE_URL.slice(0, -4) // Elimina '/api'
    : API_BASE_URL;


  const fetchCatedraDetails = useCallback(async () => {
    try {
      const response = await api.getCatedra(id);
      setCatedra(response.data);
      console.log('[DEBUG CatedraDetailPage] Objeto catedra después de fetch:', response.data); // DEBUG

      const initialAttendance = {};
      response.data.diasClase?.forEach(diaClase => {
        initialAttendance[diaClase.id] = {};
        diaClase.asistencias.forEach(asistencia => {
          initialAttendance[diaClase.id][asistencia.alumnoId] = asistencia.presente;
        });
      });
      setAttendanceData(initialAttendance);

      // Agrupar tareas por título y contar asignaciones
      const groupedTasks = (response.data.tareasMaestras || []).reduce((acc, tareaMaestra) => {
        if (!acc[tareaMaestra.id]) {
          acc[tareaMaestra.id] = {
            ...tareaMaestra,
            asignaciones: tareaMaestra._count?.asignaciones || 0, // Usar el conteo del backend
            isOverdue: tareaMaestra.fecha_entrega ? new Date(tareaMaestra.fecha_entrega) < new Date() : false,
          };
        }
        return acc;
      }, {});
      setTareasAgrupadas(Object.values(groupedTasks));
    } catch (error) {
      toast.error('No se pudo cargar la cátedra.');
      navigate('/admin/catedras');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  const fetchAlumnos = useCallback(async () => {
    try {
      const response = await api.getAlumnos();
      setAllAlumnos(response.data);
    } catch (error) {
      toast.error('No se pudieron cargar los alumnos para la inscripción.');
    }
  }, []);

  const fetchStudentComposers = useCallback(async () => {
    try {
      const response = await api.getAllStudents();
      // Mapear los compositores a un formato similar al de alumnos
      const mappedStudentComposers = response.data.map(composer => {
        const studentFirstName = composer.student_first_name || composer.first_name || '';
        const studentLastName = composer.student_last_name || composer.last_name || '';
        return {
          id: `composer-${composer.id}`, // Prefijo para evitar colisiones de ID
          nombre: studentFirstName,
          apellido: studentLastName,
          email: composer.email || `contribuyente-${composer.id}@example.com`, // Usar email real o dummy
          isComposer: true, // Para distinguirlos
          composerId: composer.id // ID real del compositor
        };
      });
      setStudentComposers(mappedStudentComposers);
    } catch (error) {
      toast.error('No se pudieron cargar los compositores estudiantes.');
    }
  }, []);

const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const fullWeekDays = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const getDayName = (date) => {
  return fullWeekDays[getDay(date)];
};

const getScheduledDays = useMemo(() => {
  if (!catedra || !catedra.dias) return [];
  return catedra.dias.split(',').map(day => day.trim());
}, [catedra]);

const generateCalendarDays = useMemo(() => {
  const start = startOfMonth(currentMonth);
  const end = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start, end });

  const firstDayOfWeek = getDay(start); // 0 for Sunday, 1 for Monday, etc.
  // Add days before the start of the month to fill the first week
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.unshift(addDays(start, (i - firstDayOfWeek)));
  }

  const lastDayOfWeek = getDay(end);
  // Add days after the end of the month to fill the last week
  for (let i = 0; i < (6 - lastDayOfWeek); i++) {
    days.push(addDays(end, i + 1));
  }

  return days;
}, [currentMonth]);

const getDiaClaseForDate = (date) => {
  if (!catedra || !catedra.diasClase) return null;
  return catedra.diasClase.find(dc => isSameDay(parseISO(dc.fecha), date));
};

const handlePrevMonth = () => {
  setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
};

const handleNextMonth = () => {
  setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
};

const handleCreateDiaClase = async (date) => {
  try {
    const dayName = getDayName(date);
    const formattedDate = format(date, 'yyyy-MM-dd');
    await api.createDiaClase(id, { fecha: formattedDate, dia_semana: dayName });
    toast.success(`Día de clase para ${format(date, 'dd/MM/yyyy', { locale: es })} creado.`);
    fetchCatedraDetails();
  } catch (error) {
    toast.error(error.response?.data?.error || 'Error al crear día de clase.');
  }
};

  const alumnosConResumenAsistencia = useMemo(() => {
    if (!catedra || !catedra.alumnos || !catedra.diasClase) return [];

    const resumen = catedra.alumnos.map(inscripcion => {
      const alumnoId = inscripcion.alumnoId || inscripcion.composerId;
      const alumnoNombre = inscripcion.alumno ? `${inscripcion.alumno.nombre} ${inscripcion.alumno.apellido}` :
                           inscripcion.composer ? `${inscripcion.composer.student_first_name || inscripcion.composer.first_name || ''} ${inscripcion.composer.student_last_name || inscripcion.composer.last_name || ''}` : '';

      let totalClasesProgramadas = 0;
      let clasesPresente = 0;
      let clasesAusente = 0;

      // Ensure catedra.diasClase is an array before iterating
      (catedra.diasClase || []).forEach(diaClase => {
        totalClasesProgramadas++;
        const isPresente = attendanceData[diaClase.id]?.[alumnoId]; // true/false/undefined
        if (isPresente === true) {
          clasesPresente++;
        } else if (isPresente === false) {
          clasesAusente++;
        }
      });

      const porcentajeAsistencia = totalClasesProgramadas > 0
        ? ((clasesPresente / totalClasesProgramadas) * 100).toFixed(2)
        : 'N/A';

      return {
        alumnoId: alumnoId,
        nombreCompleto: alumnoNombre,
        totalClases: totalClasesProgramadas,
        presente: clasesPresente,
        ausente: clasesAusente,
        porcentajeAsistencia: porcentajeAsistencia,
        diasClaseDetalle: (catedra.diasClase || []).map(diaClase => ({
          fecha: diaClase.fecha,
          presente: attendanceData[diaClase.id]?.[alumnoId], // true, false, or undefined
        }))
      };
    });
    return resumen;
  }, [catedra, attendanceData]);

const handleToggleAttendance = async (diaClaseId, alumnoId, isPresente) => {
  try {
    await api.toggleAsistencia(catedra.id, diaClaseId, alumnoId, isPresente);
    toast.success('Asistencia actualizada.');
    // Actualizar estado localmente para feedback inmediato
    setAttendanceData(prev => ({
      ...prev,
      [diaClaseId]: {
        ...(prev[diaClaseId] || {}),
        [alumnoId]: isPresente,
      },
    }));
  } catch (error) {
    toast.error(error.response?.data?.error || 'Error al actualizar asistencia.');
  }
};


  useEffect(() => {
    fetchCatedraDetails();
    fetchAlumnos();
    fetchStudentComposers();
    fetchPublicaciones();
  }, [fetchCatedraDetails, fetchAlumnos, fetchStudentComposers, fetchPublicaciones, id]);

  const handleInscribir = async (catedraId, alumnoId, isComposer = false, diaCobro = null) => {
    try {
      if (isComposer) {
        await api.inscribirAlumno(catedraId, null, alumnoId, diaCobro); // Pasa null para alumnoId y el id del compositor
      } else {
        await api.inscribirAlumno(catedraId, parseInt(alumnoId), null, diaCobro); // Pasa null para composerId y el id del alumno
      }
      toast.success('Alumno inscrito exitosamente!');
      fetchCatedraDetails(); // Recargar datos
      setIsModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.error || 'No se pudo inscribir al alumno.');
    }
  };

  const handleDesinscribir = async (inscripcion) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "¡No podrás revertir esto!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, ¡desinscribir!',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        if (inscripcion.alumnoId) {
          await api.desinscribirAlumno(id, inscripcion.alumnoId, null);
        } else if (inscripcion.composerId) {
          await api.desinscribirAlumno(id, null, inscripcion.composerId);
        }
        toast.success('Alumno desinscrito.');
        fetchCatedraDetails(); // Recargar datos
        setIsModalOpen(false); // Asumo que también queremos cerrar el modal de inscripción
      } catch (error) {
        toast.error('No se pudo desinscribir al alumno.');
      }
    }
  };

  const handleDeleteTarea = async (tareaId) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "¡No podrás revertir esto!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminarla!',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await api.deleteTarea(tareaId);
        toast.success('Tarea eliminada exitosamente.');
        fetchCatedraDetails(); // Recargar datos
      } catch (error) {
        toast.error(error.response?.data?.error || 'No se pudo eliminar la tarea.');
      }
    }
  };

  const handleDeleteEvaluation = async (evaluationId) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "¡Eliminar esta evaluación también borrará todas las preguntas, opciones y calificaciones asociadas! ¡No podrás revertir esto!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminarla!',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await api.deleteEvaluation(evaluationId);
        toast.success('Evaluación y registros asociados eliminados exitosamente.');
        fetchCatedraDetails(); // Recargar datos
      } catch (error) {
        toast.error(error.response?.data?.error || 'No se pudo eliminar la evaluación.');
      }
    }
  };

  const getAlumnosDisponibles = () => {
    if (!catedra) return [];
    const idsInscritos = new Set();
    catedra.alumnos.forEach(inscripcion => {
      if (inscripcion.alumnoId) idsInscritos.add(inscripcion.alumnoId);
      if (inscripcion.composerId) idsInscritos.add(inscripcion.composerId);
    });

    const combinedStudents = [
      ...allAlumnos,
      ...studentComposers
    ];

    // Filtrar duplicados y alumnos ya inscritos
    const uniqueStudents = combinedStudents.filter((student, index, self) =>
      index === self.findIndex((s) => (
        (s.id === student.id) || (s.email === student.email)
      ))
    );

    return uniqueStudents.filter(s => {
      // For regular students, check their numeric ID
      if (!s.isComposer && idsInscritos.has(s.id)) return false;
      // For student composers, check their numeric composerId
      if (s.isComposer && idsInscritos.has(s.composerId)) return false;
      return true;
    });
  };

  if (loading) return <div className="text-center p-8 text-white">Cargando detalles de la cátedra...</div>;
  if (!catedra) return null;


  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <button onClick={() => navigate('/admin/catedras')} className="mb-6 text-purple-400 hover:text-purple-300">
            &larr; Volver a Cátedras
          </button>
          
          <div className="bg-white/5 backdrop-blur-lg p-8 rounded-lg shadow-xl mb-10">
            <div className="flex justify-between items-center">
              <h2 className="text-4xl font-bold mb-2">{catedra.nombre}</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${catedra.modalidad_pago === 'PARTICULAR' ? 'bg-blue-600' : 'bg-yellow-600'}`}>
                {catedra.modalidad_pago}
              </span>
            </div>
            <p className="text-lg text-gray-300">{catedra.institucion} - {catedra.anio}</p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <span className="text-sm text-gray-400 block">Turno</span>
                <span className="font-semibold text-lg">{catedra.turno}</span>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <span className="text-sm text-gray-400 block">Horario</span>
                <div className="font-semibold text-lg">
                  {catedra.horariosPorDia && catedra.horariosPorDia.length > 0 ? (
                    catedra.horariosPorDia.map((horario, index) => (
                      <div key={index}>{horario.dia_semana}: {horario.hora_inicio} - {horario.hora_fin}</div>
                    ))
                  ) : (
                    'N/A'
                  )}
                </div>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <span className="text-sm text-gray-400 block">Aula</span>
                <span className="font-semibold text-lg">{catedra.aula}</span>
              </div>
            </div>
          </div>

          {/* SECCIÓN DE CALENDARIO DE ASISTENCIA */}
          {/*
          <div className="bg-white/5 backdrop-blur-lg p-6 rounded-lg shadow-xl mb-10">
            <h3 className="text-2xl font-bold mb-6">Control de Asistencia</h3>
            <div className="flex justify-between items-center mb-4">
              <button onClick={handlePrevMonth} className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-700">&lt; Mes Anterior</button>
              <h4 className="text-xl font-semibold">{format(currentMonth, 'MMMM yyyy', { locale: es })}</h4>
              <button onClick={handleNextMonth} className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-700">Mes Siguiente &gt;</button>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center text-sm mb-4">
              {weekDays.map(day => <div key={day} className="font-bold text-purple-300">{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {generateCalendarDays.map((date, index) => {
                const diaClase = getDiaClaseForDate(date);
                const isScheduledDay = getScheduledDays.includes(getDayName(date));
                const isCurrentMonth = isSameDay(date, startOfMonth(currentMonth)) || date.getMonth() === currentMonth.getMonth();

                return (
                  <div
                    key={index}
                    className={`p-2 rounded-lg flex flex-col items-center justify-center h-24 ${!isCurrentMonth ? 'bg-gray-700/30 text-gray-500' : isScheduledDay ? 'bg-purple-800/30 text-white cursor-pointer hover:bg-purple-700/50' : 'bg-gray-800/50 text-gray-400'}`}
                    onClick={() => { 
                      if (isCurrentMonth && isScheduledDay) {
                        if (diaClase) {
                          setSelectedDiaClase(diaClase);
                          setIsAttendanceModalOpen(true);
                        } else {
                          handleCreateDiaClase(date);
                        }
                      }
                    }}
                  >
                    <span className="text-xl font-bold">{format(date, 'd')}</span>
                    {isScheduledDay && (
                      <span className={`mt-1 px-2 py-1 rounded-full text-xs ${diaClase ? 'bg-green-600' : 'bg-red-600'}`}>
                        {diaClase ? 'Clase Creada' : 'Crear Clase'}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          */}

          {/* NUEVA SECCIÓN: RESUMEN DE ASISTENCIA POR ALUMNO */}
          <div className="bg-white/5 backdrop-blur-lg p-6 rounded-lg shadow-xl mb-10">
            <h3 className="text-2xl font-bold mb-6">Resumen de Asistencia por Alumno</h3>
            {alumnosConResumenAsistencia.length === 0 ? (
              <p className="text-center py-4 text-gray-400">No hay alumnos inscritos o días de clase registrados para mostrar el resumen de asistencia.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Alumno</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Total Clases</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Presente</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Ausente</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                        % Asistencia
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {alumnosConResumenAsistencia.map(resumen => (
                      <tr key={resumen.alumnoId} className="hover:bg-gray-700/50">
                        <td className="px-6 py-4 font-medium text-gray-200">{resumen.nombreCompleto}</td>
                        <td className="px-6 py-4 text-gray-300">{resumen.totalClases}</td>
                        <td className="px-6 py-4 text-green-400 font-semibold">{resumen.presente}</td>
                        <td className="px-6 py-4 text-red-400 font-semibold">{resumen.ausente}</td>
                        <td className="px-6 py-4 text-gray-300">{resumen.porcentajeAsistencia}%</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => {
                              setSelectedAlumnoAttendance(resumen);
                              setIsAlumnoAttendanceDetailModalOpen(true);
                            }}
                            className="text-purple-400 hover:text-purple-300"
                          >
                            Ver Detalle
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-white/5 backdrop-blur-lg p-6 rounded-lg shadow-xl mb-10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">Tareas del Curso ({tareasAgrupadas.length || 0})</h3>
              <button onClick={() => setIsTareaModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Crear Nueva Tarea
              </button>
            </div>
            { (tareasAgrupadas.length || 0) === 0 ? (
              <p className="text-center py-4 text-gray-400">No hay tareas creadas para este curso. Haz clic en "Crear Nueva Tarea" para empezar a asignar a los alumnos.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Título</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Descripción</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                        Puntos Posibles
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                        Fecha de Entrega
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Estado</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                        Asignaciones Activas
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Recursos</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Acciones</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Asignar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {tareasAgrupadas.map((tarea, index) => (
                      <tr key={index} className="hover:bg-gray-700/50 cursor-pointer" onClick={() => openTaskDetailModal(tarea)}>
                        <td className="px-6 py-4 font-medium text-gray-200">{tarea.titulo}</td>
                        <td
                          className="px-6 py-4 text-gray-300 max-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap"
                          dangerouslySetInnerHTML={{ __html: tarea.descripcion }}
                        ></td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                          {tarea.puntos_posibles}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                          {tarea.fecha_entrega ? new Date(tarea.fecha_entrega).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {tarea.isOverdue ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                              Vencida
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              En Plazo
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                          {tarea.asignaciones}
                        </td>
                        <td className="px-6 py-4 whitespace-normal text-gray-300 max-w-xs">
                          {(tarea.recursos && tarea.recursos.length > 0) ? (
                            <ul className="list-disc list-inside space-y-1">
                              {tarea.recursos.map((recurso, resIndex) => {
                                const fileName = recurso.split('/').pop();
                                const fileExtension = fileName.includes('.') ? fileName.split('.').pop().toLowerCase() : '';
                                const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension);
                                const isPdf = fileExtension === 'pdf';
                                return (
                                  <li key={resIndex} className="flex items-center space-x-2">
                                    {isImage && (
                                      <a
                                        href={`${STATIC_ASSET_BASE_URL}${recurso}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block w-16 h-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-600"
                                      >
                                        <img src={`${STATIC_ASSET_BASE_URL}${recurso}`} alt="Recurso" className="w-full h-full object-cover" />
                                      </a>
                                    )}
                                {isPdf && (
                                      <a
                                        href={`${STATIC_ASSET_BASE_URL}${recurso}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center text-red-400 hover:underline"
                                      >
                                        <svg
                                          className="w-5 h-5 mr-1"
                                          fill="currentColor"
                                          viewBox="0 0 20 20"
                                          xmlns="http://www.w3.org/2000/svg"
                                        >
                                          <path
                                            fillRule="evenodd"
                                            d="M4 4a2 2 0 012-2h4.586A2 2 0 0113 3.414L16.586 7A2 2 0 0118 8.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm0 3a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm0 3a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1z"
                                            clipRule="evenodd"
                                          ></path>
                                        </svg>
                                        <span>{recurso.split('/').pop()}</span>
                                      </a>
                                    )}
                                    {!isImage && !isPdf && (
                                      <a
                                        href={`${STATIC_ASSET_BASE_URL}${recurso}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-400 hover:underline"
                                      >
                                        {recurso.split('/').pop()}
                                      </a>
                                    )}
                                  </li>
                                );
                              })}
                            </ul>
                          ) : (
                            <span>N/A</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTarea(tarea.id);
                            }}
                            className="text-red-400 hover:text-red-500"
                          >
                            Eliminar
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTareaMaestraForAssignment(tarea);
                              setIsAssignTaskModalOpen(true);
                            }}
                            className="text-green-400 hover:text-green-500"
                          >
                            Asignar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* SECCIÓN DE EVALUACIONES */}
          <div className="bg-white/5 backdrop-blur-lg p-6 rounded-lg shadow-xl mb-10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">Evaluaciones ({catedra.evaluaciones?.length || 0})</h3>
              <button
                onClick={() => navigate(`/admin/catedras/${id}/evaluations/create`)}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
              >
                Crear Evaluación por IA
              </button>
            </div>
            {(catedra.evaluaciones?.length || 0) === 0 ? (
              <p className="text-center py-4 text-gray-400">
                No hay evaluaciones asignadas a este curso.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Título</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                        Nº de Preguntas
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                        Fecha de Creación
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {catedra.evaluaciones.map((evaluation) => (
                      <tr key={evaluation.id} className="hover:bg-gray-700/50">
                        <td className="px-6 py-4 font-medium text-gray-200">{evaluation.titulo}</td>
                        <td className="px-6 py-4 text-gray-300">{evaluation.preguntas?.length || 0}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                          {new Date(evaluation.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEvaluation(evaluation);
                              setIsEvaluationDetailModalOpen(true);
                            }}
                            className="text-purple-400 hover:text-purple-300 mr-4"
                          >
                            Ver Detalles
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Evita que se abra el modal de detalles de la evaluación
                              handleDeleteEvaluation(evaluation.id);
                            }}
                            className="text-red-400 hover:text-red-500"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Sección de Tablón */}
          <div className="bg-white/5 backdrop-blur-lg p-6 rounded-lg shadow-xl mb-10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">Tablón de la Cátedra</h3>
              <button onClick={() => openPublicacionModal()} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                Crear Publicación
              </button>
            </div>
            {(publicaciones?.length === 0) ? (
              <p className="text-center py-4 text-gray-400">No hay publicaciones en el tablón.</p>
            ) : (
              <div className="space-y-6">
                {publicaciones.map(publicacion => (
                  (publicacion.visible_to_students || userRole === 'admin') && 
                  <PublicacionCard
                    key={publicacion.id}
                    publicacion={publicacion}
                    onAddComment={handleAddComment}
                    onDeleteComment={handleDeleteComment}
                    onInteractToggle={handleInteractToggle}
                    userType={userRole}
                    userId={currentUserId}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="bg-white/5 backdrop-blur-lg p-6 rounded-lg shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">Alumnos Inscritos ({catedra.alumnos?.length || 0})</h3>
              <button onClick={() => setIsModalOpen(true)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                Inscribir Alumno
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                      Nombre Completo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Puntos</th>
                    {catedra.modalidad_pago === 'PARTICULAR' && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                        Día de Cobro
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {catedra.alumnos.map((inscripcion) => {
                    const alumnoDisplay = inscripcion.alumno
                      ? `${inscripcion.alumno.nombre} ${inscripcion.alumno.apellido}`
                      : inscripcion.composer
                      ? `${inscripcion.composer.student_first_name || inscripcion.composer.first_name} ${inscripcion.composer.student_last_name || inscripcion.composer.last_name} (Contribuyente)`
                      : '';
                    const alumnoEmail = inscripcion.alumno
                      ? inscripcion.alumno.email
                      : inscripcion.composer
                      ? inscripcion.composer.email || `contribuyente-#${inscripcion.composer.id}`
                      : '';
                    const alumnoIdForAttendance = inscripcion.alumnoId || inscripcion.composerId; // Usar el ID correcto para asistencia

                    return (
                      <tr key={alumnoIdForAttendance} className="hover:bg-gray-700/50">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-200">
                          {alumnoDisplay}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">{alumnoEmail}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300 font-bold text-lg">
                          {inscripcion.totalPoints || 0}
                        </td>
                        {catedra.modalidad_pago === 'PARTICULAR' && (
                          <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                            {inscripcion.dia_cobro ? `Día ${inscripcion.dia_cobro}` : 'N/A'}
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button onClick={() => handleDesinscribir(inscripcion)} className="text-red-400 hover:text-red-500">
                            Desinscribir
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {catedra.alumnos.length === 0 && (
                <p className="text-center py-4 text-gray-400">
                  No hay alumnos inscritos en esta cátedra.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Inscribir Alumno" showSubmitButton={false} cancelText="">
        <InscribirAlumnoModal 
          catedraId={id}
          alumnosDisponibles={getAlumnosDisponibles()}
          onInscribir={handleInscribir}
          onCancel={() => setIsModalOpen(false)}
          catedra={catedra} // Pass catedra prop
        />
      </Modal>

      {/* Modal de Asistencia */}
      <Modal
        isOpen={isAttendanceModalOpen}
        onClose={() => setIsAttendanceModalOpen(false)}
        title={`Asistencia para ${
          selectedDiaClase ? format(parseISO(selectedDiaClase.fecha), 'dd/MM/yyyy', { locale: es }) : ''
        }`}
        showSubmitButton={false}
        cancelText="Cerrar"
      >
        <div className="p-4">
          <h4 className="text-xl font-bold mb-4 text-gray-200">Alumnos en Cátedra</h4>
          {catedra.alumnos.length === 0 ? (
            <p className="text-gray-400">No hay alumnos inscritos en esta cátedra.</p>
          ) : (
            <ul className="space-y-3">
              {catedra.alumnos.map(inscripcion => {
                const alumnoId = inscripcion.alumnoId || inscripcion.composerId;
                const alumnoNombre = inscripcion.alumno
                  ? `${inscripcion.alumno.nombre} ${inscripcion.alumno.apellido}`
                  : inscripcion.composer
                  ? `${inscripcion.composer.student_first_name || inscripcion.composer.first_name} ${inscripcion.composer.student_last_name || inscripcion.composer.last_name}`
                  : '';
                const isPresente = attendanceData[selectedDiaClase?.id]?.[alumnoId] || false;

                return (
                  <li key={alumnoId} className="flex items-center justify-between bg-gray-800/50 p-3 rounded-md">
                    <span className="text-gray-200">{alumnoNombre}</span>
                    <button
                      onClick={() => handleToggleAttendance(selectedDiaClase.id, alumnoId, !isPresente)}
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        isPresente ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                      }`}
                    >
                      {isPresente ? 'Presente' : 'Ausente'}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </Modal>

      <Modal isOpen={isTareaModalOpen} onClose={() => setIsTareaModalOpen(false)} title="Crear Nueva Tarea" showSubmitButton={false}>
        <TareaForm
          catedraId={id}
          onTareaCreated={() => { fetchCatedraDetails(); setIsTareaModalOpen(false); }}
          onCancel={() => setIsTareaModalOpen(false)}
        />
      </Modal>

      {/* Task Detail Modal */}
      {isTaskDetailModalOpen && selectedTask && (
        <Modal
          isOpen={isTaskDetailModalOpen}
          onClose={() => setIsTaskDetailModalOpen(false)}
          title={`Detalles de Tarea: ${selectedTask.titulo}`}
          showSubmitButton={false}
          cancelText="Cerrar"
        >
          <div className="p-4 text-gray-300">
            <p className="mb-4">
              <span className="font-bold">Puntos Posibles:</span> {selectedTask.puntos_posibles}
            </p>
            <p className="mb-4">
              <span className="font-bold">Fecha de Entrega:</span>{' '}
              {selectedTask.fecha_entrega ? new Date(selectedTask.fecha_entrega).toLocaleDateString() : 'N/A'}
            </p>
            <div className="mb-4">
              <h4 className="font-bold mb-2">Descripción:</h4>
              <div
                className="bg-gray-800/50 p-3 rounded-md overflow-y-auto custom-scrollbar"
                dangerouslySetInnerHTML={{ __html: selectedTask.descripcion }}
              ></div>
            </div>

            {selectedTask.recursos && selectedTask.recursos.length > 0 && (
              <div className="mb-4">
                <h4 className="font-bold mb-2">Recursos:</h4>
                <ul className="list-disc list-inside space-y-2">
                  {selectedTask.recursos.map((recurso, resIndex) => {
                    const fileName = recurso.split('/').pop();
                    const fileExtension = fileName.includes('.') ? fileName.split('.').pop().toLowerCase() : '';
                    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension);
                    const isPdf = fileExtension === 'pdf';
                    const fullRecursoUrl = `${STATIC_ASSET_BASE_URL}${recurso}`;

                    return (
                      <li key={resIndex} className="flex items-center space-x-2">
                        {isImage && (
                          <a
                            href={fullRecursoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full h-auto max-h-96 flex-shrink-0 overflow-hidden rounded-md border border-gray-600"
                          >
                            <img src={fullRecursoUrl} alt="Recurso" className="w-full h-full object-cover" />
                          </a>
                        )}
                        {isPdf && (
                          <a
                            href={fullRecursoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-red-400 hover:underline"
                          >
                                <svg
                                  className="w-5 h-5 mr-1"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0113 3.414L16.586 7A2 2 0 0118 8.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm0 3a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm0 3a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1z"
                                    clipRule="evenodd"
                                  ></path>
                                </svg>
                                <span>{fileName}</span>
                              </a>
                            )}
                            {!isImage && !isPdf && (
                              <a
                                href={fullRecursoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:underline"
                              >
                                {fileName}
                              </a>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            </Modal>
          )}

          {/* Modal de Asignar Tarea a Alumnos */}
          {isAssignTaskModalOpen && selectedTareaMaestraForAssignment && (
            <Modal
              isOpen={isAssignTaskModalOpen}
              onClose={() => setIsAssignTaskModalOpen(false)}
              title={`Asignar Tarea: ${selectedTareaMaestraForAssignment.titulo}`}
              showSubmitButton={false}
              cancelText="Cerrar"
            >
              <AssignTaskToStudentsModal
                catedra={catedra}
                tareaMaestra={selectedTareaMaestraForAssignment}
                onAssignSuccess={() => {
                  fetchCatedraDetails();
                  setIsAssignTaskModalOpen(false);
                }}
                onCancel={() => setIsAssignTaskModalOpen(false)}
              />
            </Modal>
          )}

          {/* Evaluation Detail Modal */}
          {isEvaluationDetailModalOpen && selectedEvaluation && (
            <Modal
              isOpen={isEvaluationDetailModalOpen}
              onClose={() => setIsEvaluationDetailModalOpen(false)}
              title={`Detalles de Evaluación: ${selectedEvaluation.titulo}`}
              showSubmitButton={false}
              cancelText="Cerrar"
            >
              <div className="p-4 text-gray-300 max-h-[70vh] overflow-y-auto custom-scrollbar">
                {selectedEvaluation.preguntas.map((pregunta, index) => (
                  <div key={pregunta.id} className="mb-6 border-b border-gray-700 pb-6">
                    <p className="font-medium mb-4 text-lg">
                      {index + 1}. {pregunta.texto}
                    </p>
                    <div className="space-y-3 pl-4">
                      {pregunta.opciones.map((opcion) => {
                        const isCorrect = opcion.es_correcta;
                        return (
                          <div
                            key={opcion.id}
                            className={`flex items-center p-3 rounded-md transition-colors ${
                              isCorrect ? 'bg-green-800/50 border-l-4 border-green-400' : 'bg-gray-800/50'
                            }`}
                          >
                            <span
                              className={`ml-3 ${isCorrect ? 'text-white font-semibold' : 'text-gray-300'}`}
                            >
                              {opcion.texto}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </Modal>
          )}

          {/* Modal de Detalle de Asistencia por Alumno */}
          {isAlumnoAttendanceDetailModalOpen && selectedAlumnoAttendance && (
            <Modal
              isOpen={isAlumnoAttendanceDetailModalOpen}
              onClose={() => setIsAlumnoAttendanceDetailModalOpen(false)}
              title={`Detalle de Asistencia: ${selectedAlumnoAttendance.nombreCompleto}`}
              showSubmitButton={false}
              cancelText="Cerrar"
            >
              <div className="p-4 text-gray-300 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <p className="mb-4">
                  Total de Clases: <span className="font-bold">{selectedAlumnoAttendance.totalClases}</span>
                </p>
                <p className="mb-4">
                  Presente: <span className="font-bold text-green-400">{selectedAlumnoAttendance.presente}</span>
                </p>
                <p className="mb-4">
                  Ausente: <span className="font-bold text-red-400">{selectedAlumnoAttendance.ausente}</span>
                </p>
                <p className="mb-6">
                  Porcentaje de Asistencia:{' '}
                  <span className="font-bold">{selectedAlumnoAttendance.porcentajeAsistencia}%</span>
                </p>

                <h4 className="font-bold mb-3 text-lg">Registro Día por Día:</h4>
                {selectedAlumnoAttendance.diasClaseDetalle.length === 0 ? (
                  <p>No hay registro de clases para este alumno.</p>
                ) : (
                  <ul className="space-y-2">
                    {selectedAlumnoAttendance.diasClaseDetalle.map((dia, index) => (
                      <li
                        key={index}
                        className="flex justify-between items-center bg-gray-800/50 p-2 rounded-md"
                      >
                        <span>{format(parseISO(dia.fecha), 'dd/MM/yyyy', { locale: es })}</span>
                        {dia.presente === true ? (
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-600">
                            Presente
                          </span>
                        ) : dia.presente === false ? (
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-600">
                            Ausente
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-500">
                            Sin Registro
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Modal>
          )}
        </>
      );
    };

    // CatedraDetailPage.js

const AssignTaskToStudentsModal = ({ catedra, tareaMaestra, onAssignSuccess, onCancel }) => {
      const [selectedAlumnoIds, setSelectedAlumnoIds] = useState([]);
      const [loadingAssignment, setLoadingAssignment] = useState(false);

      const alumnosInscritos = useMemo(() => {
        const assignedToThisTask = new Set();

        return (catedra.alumnos || [])
          .filter(inscripcion => inscripcion.alumnoId !== null || inscripcion.composerId !== null)
          .map(inscripcion => {
            const isComposer = inscripcion.composerId !== null;
            const id = isComposer ? inscripcion.composer.id : inscripcion.alumno.id;
            const nombreCompleto = isComposer
              ? `${inscripcion.composer.student_first_name || inscripcion.composer.first_name || ''} ${inscripcion.composer.student_last_name || inscripcion.composer.last_name || ''} (Contribuyente)`
              : `${inscripcion.alumno.nombre} ${inscripcion.alumno.apellido}`;
            return { id, nombreCompleto, isComposer };
          });
      }, [catedra, tareaMaestra]);

      const handleCheckboxChange = (alumnoId) => {
        setSelectedAlumnoIds(prev =>
          prev.includes(alumnoId)
            ? prev.filter(id => id !== alumnoId)
            : [...prev, alumnoId]
        );
      };

      const handleAssignAll = () => {
        setSelectedAlumnoIds(alumnosInscritos.map(alumno => alumno.id));
      };

      const handleUnassignAll = () => {
        setSelectedAlumnoIds([]);
      };

      const handleAssignSubmit = async () => {
        if (selectedAlumnoIds.length === 0) {
          toast.error('Debes seleccionar al menos un alumno para asignar la tarea.');
          return;
        }

        setLoadingAssignment(true);
        try {
          await api.assignTareaMaestraToStudents(tareaMaestra.id, selectedAlumnoIds);
          toast.success('Tarea asignada exitosamente a los alumnos seleccionados!');
          onAssignSuccess();
        } catch (error) {
          toast.error(error.response?.data?.error || 'Error al asignar la tarea.');
        } finally {
          setLoadingAssignment(false);
        }
      };

      return (
        <div className="p-4">
          <p className="mb-4 text-gray-300">Selecciona los alumnos a los que deseas asignar esta tarea:</p>
          <div className="flex justify-end mb-4 space-x-2">
            <button onClick={handleAssignAll} className="px-3 py-1 bg-purple-600 rounded text-sm hover:bg-purple-700">Seleccionar Todos</button>
            <button onClick={handleUnassignAll} className="px-3 py-1 bg-gray-600 rounded text-sm hover:bg-gray-700">Deseleccionar Todos</button>
          </div>
          <div className="max-h-60 overflow-y-auto custom-scrollbar border border-gray-700 rounded-md p-3">
            {alumnosInscritos.length === 0 ? (
              <p className="text-gray-400">No hay alumnos inscritos en esta cátedra.</p>
            ) : (
              <ul className="space-y-2">
                {alumnosInscritos.map(alumno => (
                  <li key={alumno.id} className="flex items-center bg-gray-800/50 p-2 rounded-md">
                    <input
                      type="checkbox"
                      id={`alumno-${alumno.id}`}
                      checked={selectedAlumnoIds.includes(alumno.id)}
                      onChange={() => handleCheckboxChange(alumno.id)}
                      className="form-checkbox h-5 w-5 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                    />
                    <label htmlFor={`alumno-${alumno.id}`} className="ml-3 text-gray-200 cursor-pointer">
                      {alumno.nombreCompleto}
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex justify-end space-x-4 pt-6">
            <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500">Cancelar</button>
            <button
              type="button"
              onClick={handleAssignSubmit}
              disabled={loadingAssignment}
              className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingAssignment ? 'Asignando...' : 'Asignar Tarea'}
            </button>
          </div>
        </div>
      );
    };

export default CatedraDetailPage;