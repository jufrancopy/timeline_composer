import React, { useState, useEffect, memo } from 'react';
import api from '../api';

const Comments = ({ composerId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [userName, setUserName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const response = await api.getComposerComments(composerId);
        setComments(response.data);
      } catch (error) {
        setError('No se pudieron cargar los comentarios.');
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [composerId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('handleSubmit triggered.');
    console.log('Valores actuales:', { newComment, userName });
    if (!newComment.trim() || !userName.trim()) {
      setError('El nombre y el comentario no pueden estar vacíos.');
      return;
    }
    try {
      console.log('Enviando comentario:', { composerId, text: newComment, name: userName });
      const response = await api.addComposerComment(composerId, newComment, userName);
      setComments([response.data, ...comments]);
      setNewComment('');
      setError('');
    } catch (error) {
      console.error("Error al enviar el comentario (frontend):", error);
      setError(error.response?.data?.error || 'Error al enviar el comentario.');
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-white/10">
      <h4 className="font-semibold text-sm mb-3 text-white">Comentarios</h4>
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Tu nombre"
            className="flex-1 bg-gray-700 p-2 rounded-md text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md text-sm transition-colors">
            Comentar
          </button>
        </div>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Escribe tu comentario..."
          rows="2"
          className="w-full bg-gray-700 p-2 rounded-md text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
      </form>
      
      <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
        {loading ? (
          <p className="text-gray-400 text-sm">Cargando comentarios...</p>
        ) : comments.length > 0 ? (
          comments.map(comment => (
            <div key={comment.id} className="bg-gray-800/50 p-3 rounded-lg">
              <p className="text-sm text-gray-300">{comment.text}</p>
              <p className="text-xs text-purple-300 mt-1 text-right">- {comment.name}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-sm">No hay comentarios aún. ¡Sé el primero!</p>
        )}
      </div>
    </div>
  );
};

export default memo(Comments);
