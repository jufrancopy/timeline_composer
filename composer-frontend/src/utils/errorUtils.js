// src/utils/errorUtils.js
import toast from 'react-hot-toast';

export const handleRequestError = (err, setError, customMessages = {}) => {
  const errorMessage = err.response?.data?.message || 'Ocurrió un error inesperado.';
  
  if (err.response?.status === 404) {
    const message = customMessages.notFound || 'El recurso solicitado no fue encontrado.';
    toast.error(message);
    if (setError) setError(message);
  } else if (err.response?.status === 403) {
    const message = customMessages.forbidden || 'No tienes permiso para realizar esta acción.';
    toast.error(message);
    if (setError) setError(message);
  } else if (err.response?.status === 401) {
    const message = customMessages.unauthorized || 'No estás autorizado para realizar esta acción.';
    toast.error(message);
    if (setError) setError(message);
  } else {
    toast.error(errorMessage);
    if (setError) setError(errorMessage);
  }
};
