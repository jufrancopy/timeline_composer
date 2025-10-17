import React, { useEffect, useState } from 'react';
import apiClient from '../api';

function GamificationPage() {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const response = await apiClient.getRanking();
        setRanking(response.data);
      } catch (err) {
        console.error('Error fetching ranking:', err);
        setError('No se pudo cargar el ranking. Intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchRanking();
  }, []);
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-lg p-6 rounded-lg shadow-xl">
        <h2 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Ranking de Aportantes
        </h2>

        <div className="mb-8 p-4 bg-gray-800/50 rounded-lg shadow-inner">
          <h3 className="text-2xl font-semibold text-white mb-4 text-center">Niveles de Colaborador</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-600">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Nivel</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Nombre de Categoría</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Aportes Mínimos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                <tr><td className="px-4 py-2 whitespace-nowrap text-sm text-gray-200">1</td><td className="px-4 py-2 whitespace-nowrap text-sm text-gray-200">Colaborador Inicial</td><td className="px-4 py-2 whitespace-nowrap text-sm text-gray-200">1</td></tr>
                <tr><td className="px-4 py-2 whitespace-nowrap text-sm text-gray-200">2</td><td className="px-4 py-2 whitespace-nowrap text-sm text-gray-200">Colaborador Activo</td><td className="px-4 py-2 whitespace-nowrap text-sm text-gray-200">5</td></tr>
                <tr><td className="px-4 py-2 whitespace-nowrap text-sm text-gray-200">3</td><td className="px-4 py-2 whitespace-nowrap text-sm text-gray-200">Colaborador Avanzado</td><td className="px-4 py-2 whitespace-nowrap text-sm text-gray-200">10</td></tr>
                <tr><td className="px-4 py-2 whitespace-nowrap text-sm text-gray-200">4</td><td className="px-4 py-2 whitespace-nowrap text-sm text-gray-200">Investigador Musical</td><td className="px-4 py-2 whitespace-nowrap text-sm text-gray-200">20</td></tr>
                <tr><td className="px-4 py-2 whitespace-nowrap text-sm text-gray-200">5</td><td className="px-4 py-2 whitespace-nowrap text-sm text-gray-200">Curador de la Memoria Sonora</td><td className="px-4 py-2 whitespace-nowrap text-sm text-gray-200">50</td></tr>
                <tr><td className="px-4 py-2 whitespace-nowrap text-sm text-gray-200">6</td><td className="px-4 py-2 whitespace-nowrap text-sm text-gray-200">Guardián del Patrimonio</td><td className="px-4 py-2 whitespace-nowrap text-sm text-gray-200">100</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {loading && <p className="text-center text-lg">Cargando ranking...</p>}
        {error && <p className="text-center text-red-400 text-lg">{error}</p>}

        {!loading && !error && ranking.length === 0 && (
          <p className="text-center text-lg">Aún no hay aportes publicados para mostrar el ranking.</p>
        )}

        {!loading && !error && ranking.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Pos.</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Medalla</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Aportante (Email)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Tipo de Aportante</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Aportes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Nivel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {ranking.map((contributor, index) => (
                  <tr key={contributor.email} className="hover:bg-gray-700/50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-200">{index + 1}.</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      {index === 0 && <span role="img" aria-label="gold medal" className="text-2xl">🥇</span>}
                      {index === 1 && <span role="img" aria-label="silver medal" className="text-2xl">🥈</span>}
                      {index === 2 && <span role="img" aria-label="bronze medal" className="text-2xl">🥉</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{maskEmail(contributor.email)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {contributor.is_student_contribution ? (
                        <span className="font-bold text-green-400">Alumno: {contributor.student_first_name} {contributor.student_last_name}</span>
                      ) : (
                        <span className="text-gray-400">Usuario de la Web</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{contributor.contributions}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{contributor.level}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to mask email
const maskEmail = (email) => {
  if (!email) return '';
  const [name, domain] = email.split('@');
  if (name.length <= 2) return `***@${domain}`;
  return `${name[0]}***${name[name.length - 1]}@${domain}`;
};

export default GamificationPage;