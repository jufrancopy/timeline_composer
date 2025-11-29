import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, TrendingUp, CheckCircle, XCircle, Plus, Edit3, Trash2, ClipboardCheck, ChevronDown, ChevronUp, BarChart3, CloudRain, Sun, Umbrella, CalendarX } from 'lucide-react';
import TipoDiaClaseModal from './TipoDiaClaseModal';

const UnifiedAttendanceSection = ({ 
  diasClase = [],
  annualAttendanceData = [],
  currentYear,
  setCurrentYear,
  onOpenDiaClaseModal,
  onEditDiaClase,
  onDeleteDiaClase,
  onOpenAttendanceModal,
  onUpdateDiaClaseTipo,
  scheduledClassDays = [],
  recordedClassDates = []}) => {
  const [viewMode, setViewMode] = useState('list');
  const [expandedDays, setExpandedDays] = useState(new Set());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [showTipoDiaModal, setShowTipoDiaModal] = useState(false);
  const [selectedDiaClaseForTipo, setSelectedDiaClaseForTipo] = useState(null);

      // Función para parsear fechas ISO ignorando zona horaria
  const parseISODate = (isoString) => {
    // Extraer año, mes, día directamente del string (evitar new Date(isoString) que aplica zona horaria)
    const datePart = String(isoString || '').split('T')[0]; // => 'YYYY-MM-DD'
    const parts = datePart.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Mes es 0-indexed
    const day = parseInt(parts[2], 10);
    // dateLocal: fecha construida en medianoche local (evita desplazamientos)
    const dateLocal = new Date(year, month, day);
    // isoDate: cadena segura para <input type="date" value="YYYY-MM-DD" />
    const isoDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return { year, month, day, date: dateLocal, isoDate };
  };

  const formatDate = (dateString) => {
    const { date } = parseISODate(dateString);
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getTipoDiaIcon = (tipoDia) => {
    switch (tipoDia) {
      case 'FERIADO': return <Sun size={12} className="text-yellow-400" />;
      case 'ASUETO': return <Umbrella size={12} className="text-blue-400" />;
      case 'LLUVIA': return <CloudRain size={12} className="text-slate-400" />;
      default: return null;
    }
  };

  const getTipoDiaLabel = (tipoDia) => {
    switch (tipoDia) {
      case 'NORMAL': return 'Normal';
      case 'FERIADO': return 'Feriado';
      case 'ASUETO': return 'Asueto';
      case 'LLUVIA': return 'Lluvia';
      default: return 'Normal';
    }
  };

  const getTipoDiaClasses = (tipoDia) => {
    switch (tipoDia) {
      case 'FERIADO': return 'from-yellow-600/20 to-yellow-700/10 border-yellow-500/30';
      case 'ASUETO': return 'from-blue-600/20 to-blue-700/10 border-blue-500/30';
      case 'LLUVIA': return 'from-slate-600/20 to-slate-700/10 border-slate-500/30';
      default: return 'from-blue-600/20 to-purple-600/20 border-blue-500/30';
    }
  };

  const getTipoDiaSpanClasses = (tipoDia) => {
    switch (tipoDia) {
      case 'FERIADO': return 'bg-yellow-600/20 text-yellow-300 border border-yellow-500/30';
      case 'ASUETO': return 'bg-blue-600/20 text-blue-300 border border-blue-500/30';
      case 'LLUVIA': return 'bg-slate-600/20 text-slate-300 border border-slate-500/30';
      default: return 'bg-purple-600/20 text-purple-300 border border-purple-500/30'; // Default (NORMAL)
    }
  };

  // Calcular estadísticas
  const calculateStats = () => {
    const totalClasses = diasClase.length;
    const totalAttendanceRecords = annualAttendanceData.reduce(
      (sum, dia) => sum + dia.asistencias.length, 
      0
    );
    const presentCount = annualAttendanceData.reduce(
      (sum, dia) => sum + dia.asistencias.filter(a => a.presente).length, 
      0
    );
    const attendanceRate = totalAttendanceRecords > 0 
      ? ((presentCount / totalAttendanceRecords) * 100).toFixed(1) 
      : 0;

    // Agrupar por mes
    const monthlyData = Array(12).fill(0).map((_, i) => ({
      month: i,
      classes: 0,
      present: 0,
      absent: 0
    }));

    annualAttendanceData.forEach(dia => {
      const { month } = parseISODate(dia.fecha);
      monthlyData[month].classes++;
      dia.asistencias.forEach(a => {
        if (a.presente) monthlyData[month].present++;
        else monthlyData[month].absent++;
      });
    });

    return { totalClasses, totalAttendanceRecords, presentCount, attendanceRate, monthlyData };
  };

  const stats = calculateStats();

  const toggleDayExpansion = (dayId) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(dayId)) {
      newExpanded.delete(dayId);
    } else {
      newExpanded.add(dayId);
    }
    setExpandedDays(newExpanded);
  };

  const getMonthName = (monthIndex) => {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return months[monthIndex];
  };

  // Filtrar días por mes seleccionado
  const filteredDays = viewMode === 'list' && selectedMonth !== null
    ? annualAttendanceData.filter(dia => {
        const { month } = parseISODate(dia.fecha);
        return month === selectedMonth;
      })
    : annualAttendanceData;

  // Renderizar calendario simple
  const renderSimpleCalendar = () => {
    const today = new Date();
    const currentMonth = selectedMonth ?? today.getMonth();
    const currentYearNum = currentYear;
    const firstDayOfMonth = new Date(currentYearNum, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYearNum, currentMonth + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startingDayOfWeek = firstDayOfMonth.getDay();

    // Convertir scheduledClassDays a formato Date.getDay() (0-6)
    const scheduledDaysAsNumbers = new Set(scheduledClassDays.map(dayStr => {
      const dayNum = parseInt(dayStr, 10);
      if (dayNum === 7) return 0; // Domingo
      return dayNum;
    }));

    const days = [];
    // Días vacíos al inicio del mes
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-16 bg-slate-800/20 rounded-lg"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYearNum, currentMonth, day);
      const dateStr = `${currentYearNum}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayOfWeek = date.getDay();

      const hasRecordedClass = recordedClassDates.includes(dateStr);
      const isScheduledDay = scheduledDaysAsNumbers.has(dayOfWeek);
      const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYearNum === today.getFullYear();
      
      let dayClasses = 'border-slate-700/50 bg-slate-800/20';
      let textClasses = 'text-slate-400';

      if (isToday) {
        dayClasses = 'border-purple-500 bg-purple-500/10';
        textClasses = 'text-purple-300';
      } else if (hasRecordedClass) {
        dayClasses = 'border-green-500/50 bg-green-500/10';
        textClasses = 'text-green-300';
      } else if (isScheduledDay) {
        dayClasses = 'border-blue-500/50 bg-blue-500/10';
        textClasses = 'text-blue-300';
      }
      
      days.push(
        <div 
          key={day} 
          className={`h-16 rounded-lg border transition-all ${dayClasses} flex flex-col items-center justify-center p-2 hover:scale-105 cursor-pointer`}
        >
          <span className={`text-sm font-semibold ${textClasses}`}>
            {day}
          </span>
          {hasRecordedClass && (
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-1"></div>
          )}
          {!hasRecordedClass && isScheduledDay && (
             <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1"></div>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
            <div key={day} className="text-center text-xs font-semibold text-slate-400 py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {days}
        </div>
        <div className="flex items-center gap-4 justify-center mt-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500/30 border border-green-500/50 rounded"></div>
            <span className="text-slate-400">Clase Registrada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500/30 border border-blue-500/50 rounded"></div>
            <span className="text-slate-400">Clase Programada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500/30 border border-purple-500 rounded"></div>
            <span className="text-slate-400">Hoy</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800/50 to-slate-800/30 p-6 border-b border-slate-700/50">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 rounded-lg">
              <Calendar className="text-blue-400" size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Gestión de Asistencia</h3>
              <p className="text-slate-400">{stats.totalClasses} clases • {stats.attendanceRate}% asistencia</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Selector de año */}
            <select
              value={currentYear}
              onChange={(e) => setCurrentYear(parseInt(e.target.value))}
              className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500"
            >
              {[...Array(5)].map((_, i) => {
                const yearOption = new Date().getFullYear() - 2 + i;
                return <option key={yearOption} value={yearOption}>{yearOption}</option>;
              })}
            </select>

            {/* Selector de mes para el calendario */}
            {viewMode === 'calendar' && (
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500 ml-2"
              >
                {Array(12).fill(0).map((_, i) => (
                  <option key={i} value={i}>{getMonthName(i)}</option>
                ))}
              </select>
            )}

            {/* Toggle de vista */}
            <div className="flex bg-slate-700/50 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'list' 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ClipboardCheck size={16} className="inline mr-1" />
                Lista
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'calendar' 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Calendar size={16} className="inline mr-1" />
                Calendario
              </button>
              <button
                onClick={() => setViewMode('stats')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'stats' 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <BarChart3 size={16} className="inline mr-1" />
                Stats
              </button>
            </div>

            <button
              onClick={() => onOpenDiaClaseModal()}
              className="group inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl transition-all duration-300 shadow-lg shadow-blue-900/25 hover:shadow-xl hover:shadow-blue-900/40 hover:scale-105"
            >
              <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
              <span className="hidden sm:inline">Nueva Clase</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Vista de Lista */}
        {viewMode === 'list' && (
          <div className="space-y-4">
            {/* Selector de mes */}
            <div className="flex items-center gap-2 mb-4">
              <label className="text-slate-400 text-sm font-medium">Filtrar por mes:</label>
              <select
                value={selectedMonth ?? ''}
                onChange={(e) => setSelectedMonth(e.target.value === '' ? null : parseInt(e.target.value))}
                className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">Todos los meses</option>
                {Array(12).fill(0).map((_, i) => (
                  <option key={i} value={i}>{getMonthName(i)}</option>
                ))}
              </select>
            </div>

            {filteredDays.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-4 bg-slate-800/50 rounded-full flex items-center justify-center">
                  <Calendar className="text-slate-500" size={32} />
                </div>
                <p className="text-slate-400 text-lg font-medium">No hay clases registradas</p>
                <p className="text-slate-500 text-sm mt-1">Registra días de clase para gestionar asistencias</p>
              </div>
            ) : (
              filteredDays.map((dia) => {
                const isExpanded = expandedDays.has(dia.id);
                const presentCount = dia.asistencias.filter(a => a.presente).length;
                const totalCount = dia.asistencias.length;
                const attendancePercentage = totalCount > 0 ? (presentCount / totalCount) * 100 : 0;
                const { year, month, day } = parseISODate(dia.fecha);

                return (
                  <div 
                    key={dia.id} 
                    className="bg-slate-800/30 rounded-xl border border-slate-700/50 overflow-hidden hover:border-slate-600/50 transition-all"
                  >
                    {/* Header de la clase */}
                    <div 
                      className="p-4 cursor-pointer"
                      onClick={() => toggleDayExpansion(dia.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className={`flex flex-col items-center justify-center w-16 h-16 bg-gradient-to-br ${getTipoDiaClasses(dia.tipoDia || 'NORMAL')} rounded-lg border`}>
                            <span className="text-2xl font-bold text-white">
                              {day}
                            </span>
                            <span className="text-xs text-slate-400">
                              {getMonthName(month).substring(0, 3)}
                            </span>
                          </div>
                          
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-white mb-1">
                              {formatDate(dia.fecha)} {dia.tipoDia && dia.tipoDia !== 'NORMAL' && (
                                <span className={`ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getTipoDiaSpanClasses(dia.tipoDia)}`}>
                                  {getTipoDiaIcon(dia.tipoDia)} {getTipoDiaLabel(dia.tipoDia)}
                                </span>
                              )}
                            </h4>
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-600/20 text-indigo-300 rounded-full text-xs border border-indigo-500/30">
                                <Clock size={12} />
                                {dia.dia_semana}
                              </span>
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-600/20 text-slate-300 rounded-full text-xs border border-slate-500/30">
                                <Users size={12} />
                                {presentCount}/{totalCount} presentes
                              </span>
                              <div className="flex items-center gap-2">
                                <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
                                    style={{ width: `${attendancePercentage}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-slate-400 font-medium">
                                  {attendancePercentage.toFixed(0)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // pasar isoDate para evitar desplazamientos por zona horaria
                              const isoDate = parseISODate(dia.fecha).isoDate;
                              onEditDiaClase({ ...dia, isoDate });
                            }}
                            className="p-2 bg-yellow-600/20 text-yellow-300 hover:bg-yellow-600/30 hover:text-yellow-200 rounded-lg transition-all duration-200 border border-yellow-500/30"
                            title="Editar"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteDiaClase(dia.id);
                            }}
                            className="p-2 bg-red-600/20 text-red-300 hover:bg-red-600/30 hover:text-red-200 rounded-lg transition-all duration-200 border border-red-500/30"
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDiaClaseForTipo(dia);
                              setShowTipoDiaModal(true);
                            }}
                            className="p-2 bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 hover:text-purple-200 rounded-lg transition-all duration-200 border border-purple-500/30"
                            title="Marcar tipo de día"
                          >
                            <CalendarX size={16} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenAttendanceModal(dia);
                            }}
                            className="p-2 bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 hover:text-purple-200 rounded-lg transition-all duration-200 border border-purple-500/30"
                            title="Gestionar Asistencia"
                          >
                            <ClipboardCheck size={16} />
                          </button>
                          {isExpanded ? (
                            <ChevronUp className="text-slate-400" size={20} />
                          ) : (
                            <ChevronDown className="text-slate-400" size={20} />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Detalle expandible de asistencias */}
                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-slate-700/50 pt-4 animate-in slide-in-from-top-2 duration-300">
                        {dia.asistencias.length === 0 ? (
                          <p className="text-slate-400 text-sm text-center py-4">
                            No hay asistencias registradas para este día
                          </p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {dia.asistencias.map((asistencia) => (
                              <div
                                key={`${dia.id}-${asistencia.alumnoId || asistencia.composerId}`}
                                className={`flex items-center justify-between px-3 py-2 rounded-lg border ${
                                  asistencia.presente
                                    ? 'bg-green-600/10 border-green-500/30'
                                    : 'bg-red-600/10 border-red-500/30'
                                }`}
                              >
                                <span className={`text-sm font-medium ${
                                  asistencia.presente ? 'text-green-300' : 'text-red-300'
                                }`}>
                                  {asistencia.nombreCompleto}
                                </span>
                                {asistencia.presente ? (
                                  <CheckCircle size={16} className="text-green-400" />
                                ) : (
                                  <XCircle size={16} className="text-red-400" />
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Vista de Calendario */}
        {viewMode === 'calendar' && (
          <div>
            {renderSimpleCalendar()}
          </div>
        )}

        {/* Vista de Estadísticas */}
        {viewMode === 'stats' && (
          <div className="space-y-6">
            {/* Estadísticas generales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-600/20 to-blue-700/10 rounded-xl p-4 border border-blue-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="text-blue-400" size={20} />
                  <span className="text-xs text-slate-400 font-medium">CLASES TOTALES</span>
                </div>
                <div className="text-3xl font-bold text-white">{stats.totalClasses}</div>
              </div>
              <div className="bg-gradient-to-br from-green-600/20 to-green-700/10 rounded-xl p-4 border border-green-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="text-green-400" size={20} />
                  <span className="text-xs text-slate-400 font-medium">PRESENTES</span>
                </div>
                <div className="text-3xl font-bold text-white">{stats.presentCount}</div>
              </div>
              <div className="bg-gradient-to-br from-red-600/20 to-red-700/10 rounded-xl p-4 border border-red-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="text-red-400" size={20} />
                  <span className="text-xs text-slate-400 font-medium">AUSENTES</span>
                </div>
                <div className="text-3xl font-bold text-white">
                  {stats.totalAttendanceRecords - stats.presentCount}
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-600/20 to-purple-700/10 rounded-xl p-4 border border-purple-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="text-purple-400" size={20} />
                  <span className="text-xs text-slate-400 font-medium">TASA ASISTENCIA</span>
                </div>
                <div className="text-3xl font-bold text-white">{stats.attendanceRate}%</div>
              </div>
            </div>

            {/* Gráfico mensual */}
            <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50">
              <h4 className="text-lg font-semibold text-white mb-4">Asistencia por Mes</h4>
              <div className="space-y-3">
                {stats.monthlyData.map((month, index) => {
                  if (month.classes === 0) return null;
                  const total = month.present + month.absent;
                  const percentage = total > 0 ? (month.present / total) * 100 : 0;
                  
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-300 font-medium">{getMonthName(index)}</span>
                        <span className="text-slate-400">
                          {month.present}/{total} ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="w-full h-3 bg-slate-700/50 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      <TipoDiaClaseModal
        isOpen={showTipoDiaModal}
        onClose={() => setShowTipoDiaModal(false)}
        diaClase={selectedDiaClaseForTipo}
        onSave={onUpdateDiaClaseTipo}
      />
    </div>
  );
};

export default UnifiedAttendanceSection;