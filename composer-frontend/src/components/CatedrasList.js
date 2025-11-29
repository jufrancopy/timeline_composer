import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

function CatedrasList() {
  const [catedras, setCatedras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCatedras = async () => {
      try {
        const { data } = await api.fetchPublicCatedras();
        setCatedras(data);
      } catch (err) {
        setError('Error al cargar las cátedras.');
        console.error('Error fetching public catedras:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCatedras();
  }, []);

  if (loading) return <div className="text-gray-200">Cargando cátedras...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (catedras.length === 0) return <div className="text-gray-400">No hay cátedras disponibles.</div>;

  return (
    <div className="container mx-auto p-4 bg-gray-800 text-white min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-green-400">Cátedras Disponibles</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {catedras.map((catedra) => (
          <div key={catedra.id} className="bg-gray-700 rounded-lg shadow-lg p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-blue-300 mb-2">{catedra.nombre}</h2>
              <p className="text-gray-300 mb-4">Año: {catedra.anio}</p>
              {catedra.docente && (
                <p className="text-gray-400 text-sm">Docente: {catedra.docente.nombre} {catedra.docente.apellido}</p>
              )}
            </div>
            <Link
              to={`/public/catedras/${catedra.id}`}
              className="mt-4 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Ver detalles de la cátedra &rarr;
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CatedrasList;
