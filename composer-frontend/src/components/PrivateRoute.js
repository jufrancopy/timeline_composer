import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const userToken = localStorage.getItem('userToken');

  if (!userToken) {
    // Si no hay token, redirige a la página de login/contribuciones
    // Pasamos la ubicación actual para poder redirigir de vuelta después del login
    return <Navigate to="/" replace />;
  }

  // Si hay token, renderiza el componente hijo (la página protegida)
  return children || <Outlet />;
};

export default PrivateRoute;
