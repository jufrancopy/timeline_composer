import React, { useState } from 'react';
import PropTypes from 'prop-types';

const ComentarioForm = ({ publicacionId, onSubmit, loading = false }) => {
  const [texto, setTexto] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!texto.trim()) {
      setError('El comentario no puede estar vacío.');
      return;
    }

    onSubmit(publicacionId, { contenido: texto });
    setTexto(''); // Limpiar el campo después de enviar
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Escribe un comentario..."
        rows="2"
        className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500"
        disabled={loading}
      ></textarea>
      <button
        type="submit"
        className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        disabled={loading}
      >
        {loading ? 'Publicando...' : 'Comentar'}
      </button>
    </form>
  );
};

ComentarioForm.propTypes = {
  publicacionId: PropTypes.number.isRequired,
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

export default ComentarioForm; 