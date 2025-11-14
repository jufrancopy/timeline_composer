import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import EvaluationForm from '../components/EvaluationForm';
import EditQuestionsModal from '../components/EditQuestionsModal';
import api from '../api';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

function DocenteEvaluationPage() {
  const { catedraId, evaluationId } = useParams();
  const navigate = useNavigate();
  const [evaluationData, setEvaluationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [evaluationToEdit, setEvaluationToEdit] = useState(null);
  const [isEditQuestionsModalOpen, setIsEditQuestionsModalOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(!evaluationId);
  const [catedraDetails, setCatedraDetails] = useState(null);

  const fetchEvaluation = async () => {
    try {
      // Usar el endpoint que YA EXISTE en tu backend
      const response = await api.getEvaluationDetailForDocente(evaluationId);
      console.log('Evaluación obtenida para edición:', response.data);
      setEvaluationData(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar la evaluación.');
      toast.error(err.response?.data?.error || 'Error al cargar la evaluación.');
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchCatedraDetails = async () => {
    try {
      const response = await api.getDocenteCatedraDetalles(catedraId);
      setCatedraDetails(response.data);
    } catch (err) {
      console.error('Error al cargar detalles de la cátedra:', err);
      toast.error('Error al cargar detalles de la cátedra.');
    }
  };

  const handleGenerateEvaluation = async (prompt, subject, numberOfQuestions, numberOfOptions, unidadId, unidadContent, planDeClasesId, fechaLimite) => {
    setLoading(true);
    setError(null);

    if (!catedraId) {
      toast.error('ID de cátedra no disponible.');
      setLoading(false);
      return;
    }

    try {
      const response = await api.generateDocenteEvaluation(catedraId, {
        topic: prompt,
        subject: subject,
        numberOfQuestions,
        numberOfOptions,
        unidadPlanId: unidadId,
        unidadContent: unidadContent,
        planDeClasesId: planDeClasesId,
        fechaLimite: fechaLimite || null,
      });
      toast.success(response.data.message || 'Evaluación generada exitosamente!');

      // Navegar a la evaluación recién creada
      if (response.data.evaluation && response.data.evaluation.id) {
        navigate(`/docente/catedra/${catedraId}/evaluation/${response.data.evaluation.id}`);
      } else {
        // Recargar la vista si no hay ID
        window.location.reload();
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Error al generar la evaluación. Inténtalo de nuevo.';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error generando evaluación:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEvaluation = async (updatedData) => {
    setLoading(true);
    try {
      await api.updateDocenteEvaluation(evaluationId, updatedData);
      toast.success('Evaluación actualizada exitosamente.');
      setIsEditModalOpen(false);
      // Recargar los datos de la evaluación
      await fetchEvaluation();
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Error al actualizar la evaluación.';
      toast.error(errorMessage);
      console.error('Error actualizando evaluación:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = (prompt, subject, numberOfQuestions, numberOfOptions, unidadId, unidadContent, planDeClasesId, fechaLimite) => {
    if (evaluationToEdit) {
      const updateData = {
        titulo: subject,
        fecha_limite: fechaLimite || null,
        unidadPlanId: unidadId,
        planDeClasesId: planDeClasesId,
      };
      handleUpdateEvaluation(updateData);
    }
  };

  const openEditModal = () => {
    if (evaluationData) {
      setEvaluationToEdit({
        ...evaluationData,
        // Asegurarnos de que los IDs sean strings para el formulario
        planDeClasesId: evaluationData.planDeClasesId?.toString() || '',
        unidadPlanId: evaluationData.unidadPlanId?.toString() || '',
        fecha_limite: evaluationData.fecha_limite ? new Date(evaluationData.fecha_limite).toISOString().split('T')[0] : '',
      });
      setIsEditModalOpen(true);
    }
  };

  const handleUpdateQuestions = async (updatedQuestions) => {
    setLoading(true);
    try {
      await api.updateEvaluationQuestions(evaluationId, { questions: updatedQuestions });
      toast.success('Preguntas actualizadas exitosamente.');
      setIsEditQuestionsModalOpen(false);
      // Recargar los datos
      await fetchEvaluation();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al actualizar las preguntas.');
      console.error('Error updating questions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (catedraId) {
      fetchCatedraDetails();
    }

    if (evaluationId) {
      fetchEvaluation();
      setIsCreateMode(false);
    } else {
      setInitialLoading(false);
      setIsCreateMode(true);
    }
  }, [evaluationId, catedraId]);

  const handleDownloadPdf = () => {
    if (!evaluationData || !catedraDetails) {
      toast.error('Datos de evaluación o cátedra no disponibles para descargar.');
      return;
    }

    const doc = new jsPDF('p', 'mm', 'legal'); // 'p' for portrait, 'mm' for millimeters, 'legal' for oficio
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    let y = margin;

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(`Evaluación: ${evaluationData.titulo || 'Sin Título'}`, margin, y);
    y += 10;

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Cátedra: ${catedraDetails.nombre || 'N/A'}`, margin, y);
    y += 7;
    doc.text(`Profesor: ${catedraDetails.Docente?.nombre || 'N/A'} ${catedraDetails.Docente?.apellido || ''}`, margin, y);
    y += 7;
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, margin, y);
    y += 10;

    doc.text("______________________________________", margin, y);
    y += 7;
    doc.text("Nombre: _____________________________", margin, y);
    y += 7;
    doc.text("Apellido: ____________________________", margin, y);
    y += 7;
    doc.text("Fecha de entrega: _____________________", margin, y);
    y += 15;

    // Add evaluation questions and options
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Preguntas:", margin, y);
    y += 10;

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");

    const maxWidth = doc.internal.pageSize.width - 2 * margin;

    evaluationData.Pregunta.forEach((question, index) => {
      // Split question text
      const questionText = `${index + 1}. ${question.texto}`;
      const splitQuestion = doc.splitTextToSize(questionText, maxWidth);

      // Check for page overflow before adding question
      if (y + splitQuestion.length * 7 > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(splitQuestion, margin, y);
      y += splitQuestion.length * 7; // Increment y based on number of lines

      question.Opcion.forEach((option, optionIndex) => {
        const optionText = `   ${String.fromCharCode(65 + optionIndex)}. ${option.texto}`;
        const splitOption = doc.splitTextToSize(optionText, maxWidth - 10); // Indent options a bit

        // Check for page overflow before adding option
        if (y + splitOption.length * 7 > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(splitOption, margin + 5, y); // Adjusted margin for indentation
        y += splitOption.length * 7; // Increment y based on number of lines
      });
      y += 5; // Space between questions
    });

    // Add page numbers
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(`Página ${i} de ${totalPages}`, doc.internal.pageSize.width - margin, pageHeight - 10, { align: 'right' });
    }

    doc.save(`evaluacion-${evaluationData.titulo.replace(/ /g, '_') || 'sin_titulo'}.pdf`);
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-8">
        <div className="max-w-4xl mx-auto text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-300">Cargando evaluación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-purple-400 hover:text-purple-300 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Volver a la Cátedra
        </button>

        {/* Modo Creación */}
        {isCreateMode && (
          <div className="bg-white/5 backdrop-blur-lg p-8 rounded-lg shadow-xl border border-white/10">
            <h1 className="text-3xl font-bold mb-6 text-center">Generar Nueva Evaluación</h1>
            <p className="text-center text-gray-300 mb-8">
              Completa el formulario para generar una evaluación con IA. Puedes basarla en unidades específicas de tus planes de clase.
            </p>

            <EvaluationForm
              catedraId={catedraId}
              onSubmit={handleGenerateEvaluation}
              loading={loading}
              onCancel={() => navigate(`/docente/catedra/${catedraId}`)}
              isEditMode={false}
            />
          </div>
        )}

        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 p-4 rounded-lg mb-6">
            <p className="font-semibold">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {/* Vista de Evaluación Existente */}
        {!isCreateMode && evaluationData && (
          <div className="mt-8 p-8 bg-white/5 backdrop-blur-lg rounded-lg shadow-xl border border-white/10">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-semibold mb-2">{evaluationData.titulo}</h2>
                {evaluationData.fecha_limite && (
                  <p className="text-gray-300">
                    <span className="font-medium">Fecha límite:</span> {new Date(evaluationData.fecha_limite).toLocaleDateString('es-ES')}
                  </p>
                )}
                <p className="text-gray-400 text-sm mt-1">
                  Creada el {new Date(evaluationData.created_at).toLocaleDateString('es-ES')} • {evaluationData.Pregunta?.length || 0} preguntas
                </p>
              </div>

              {/* BOTONES DE EDICIÓN - AQUÍ ESTÁ EL CAMBIO */}
              <div className="flex space-x-3">
                {/* Botón Editar (Información) */}
                <button
                  onClick={openEditModal}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  Editar Información
                </button>

                {/* NUEVO BOTÓN - Editar Preguntas */}
                <button
                  onClick={() => setIsEditQuestionsModalOpen(true)}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  Editar Preguntas
                </button>

                {/* NUEVO BOTÓN - Descargar PDF */}
                <button
                  onClick={handleDownloadPdf}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 4V3a1 1 0 011-1h2a1 1 0 011 1v1h1a2 2 0 012 2v3a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2h1zm9 6a3 3 0 11-6 0 3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  Descargar PDF
                </button>
              </div>
            </div>

            {/* Lista de Preguntas */}
            <div className="space-y-6">
              {evaluationData.Pregunta && evaluationData.Pregunta.map((question, index) => (
                <div key={question.id} className="border-b border-gray-700 pb-6 last:border-b-0">
                  <div className="flex items-start mb-4">
                    <span className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium mr-3 flex-shrink-0">
                      {index + 1}
                    </span>
                    <p className="font-medium text-lg pt-1">{question.texto}</p>
                  </div>

                  <div className="space-y-3 pl-11">
                    {question.Opcion && question.Opcion.map((option) => (
                      <div
                        key={option.id}
                        className={`flex items-center p-3 rounded-md transition-colors ${option.es_correcta
                            ? 'bg-green-800/30 border border-green-600/50'
                            : 'bg-gray-800/30 border border-gray-700/50'
                          }`}
                      >
                        <div className="flex items-center w-full">
                          <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center mr-3 ${option.es_correcta
                              ? 'border-green-500 bg-green-500'
                              : 'border-gray-400'
                            }`}>
                            {option.es_correcta && (
                              <div className="h-2 w-2 rounded-full bg-white"></div>
                            )}
                          </div>
                          <span className="text-gray-300">{option.texto}</span>

                          {option.es_correcta && (
                            <span className="ml-auto text-green-400 text-sm font-medium flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Correcta
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-700 text-center">
              <button
                onClick={() => navigate(-1)}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
              >
                Volver a la Cátedra
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Edición (Información) */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Información de Evaluación"
        size="lg"
      >
        {evaluationToEdit && (
          <EvaluationForm
            catedraId={catedraId}
            onSubmit={handleEditSubmit}
            loading={loading}
            onCancel={() => setIsEditModalOpen(false)}
            initialData={evaluationToEdit}
            isEditMode={true}
          />
        )}
      </Modal>

      {/* NUEVO Modal de Edición de Preguntas */}
      <EditQuestionsModal
        isOpen={isEditQuestionsModalOpen}
        onClose={() => setIsEditQuestionsModalOpen(false)}
        evaluation={evaluationData}
        onSave={handleUpdateQuestions}
        loading={loading}
      />
    </div>
  );
}

export default DocenteEvaluationPage;