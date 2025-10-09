import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TareaForm from '../components/TareaForm';
import api from '../api';

function DocenteTareaPage() {
  const { catedraId } = useParams();
  const navigate = useNavigate();

  const handleTareaCreated = () => {
    navigate(`/docente/catedras/${catedraId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate(`/docente/catedras/${catedraId}`)} className="mb-6 text-purple-400 hover:text-purple-300">
          &larr; Volver a la Cátedra
        </button>

        <div className="bg-white/5 backdrop-blur-lg p-8 rounded-lg shadow-xl">
          <h1 className="text-3xl font-bold mb-6 text-center">Crear Nueva Tarea</h1>
          <TareaForm
            catedraId={catedraId}
            onTareaCreated={handleTareaCreated}
            onCancel={() => navigate(`/docente/catedras/${catedraId}`)}
            userType="docente"
          />
        </div>
      </div>
    </div>
  );
}

export default DocenteTareaPage;
