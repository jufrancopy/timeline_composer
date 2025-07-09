import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://apihmpy.thepydeveloper.dev/api', // El dominio de tu backend en producción con prefijo /api
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
