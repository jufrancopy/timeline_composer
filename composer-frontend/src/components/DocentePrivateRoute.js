import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const DocentePrivateRoute = ({ children }) => {
  const docenteToken = localStorage.getItem('docenteToken');

  if (!docenteToken) {
    return <Navigate to="/docente/login" replace />;
  }

  return children || <Outlet />;
};

export default DocentePrivateRoute;