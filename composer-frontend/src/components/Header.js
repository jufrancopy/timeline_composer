import React from 'react';
import { Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';

const Header = ({ isAdmin, isDocente, isStudent, handleLogout }) => {
  return (
    <header className="fixed top-0 left-0 w-full bg-gray-800 text-white shadow-md z-50 p-4">
      <nav className="max-w-6xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-purple-400 hover:text-purple-300 transition-colors">
          HMPY
        </Link>
        <ul className="flex space-x-4 items-center">
          <li>
            <Link to="/" className="hover:text-purple-300 transition duration-300">Línea de Tiempo</Link>
          </li>
          <li>
            <Link to="/gamification" className="hover:text-purple-300 transition duration-300">Ranking</Link>
          </li>
          {/* Enlaces para Admin */}
          {isAdmin && (
            <>
              <li><Link to="/admin/dashboard" className="hover:text-purple-300 transition duration-300">Admin Dashboard</Link></li>
              <li><Link to="/admin/catedras" className="hover:text-purple-300 transition duration-300">Cátedras (Admin)</Link></li>
              <li><Link to="/admin/alumnos" className="hover:text-purple-300 transition duration-300">Alumnos (Admin)</Link></li>
              <li><Link to="/admin/docentes" className="hover:text-purple-300 transition duration-300">Docentes (Admin)</Link></li>
            </>
          )}
          {/* Enlaces para Docente */}
          {isDocente && (
            <>
              <li><Link to="/docente/dashboard" className="hover:text-purple-300 transition duration-300">Docente Dashboard</Link></li>
            </>
          )}
          {/* Enlaces para Alumno */}
          {isStudent && (
            <>
              <li><Link to="/my-contributions" className="hover:text-purple-300 transition duration-300">Mis Aportes</Link></li>
              <li><Link to="/my-evaluations" className="hover:text-purple-300 transition duration-300">Mis Evaluaciones</Link></li>
            </>
          )}

          {/* Botones de Login/Logout condicionales */}
          {!isAdmin && !isDocente && !isStudent && (
            <>
              <li><Link to="/admin/login" className="hover:text-purple-300 transition duration-300">Admin Login</Link></li>
              <li><Link to="/docente/login" className="hover:text-purple-300 transition duration-300">Docente Login</Link></li>
              {/* No hay login explícito para alumno, asumo que es a través de otra ruta o ya está manejado */}
            </>
          )}
          {(isAdmin || isDocente || isStudent) && (
            <li>
              <button onClick={handleLogout} className="flex items-center gap-1 text-white hover:text-purple-300 transition duration-300 bg-transparent border-none cursor-pointer">
                <LogOut size={20} />
                Salir
              </button>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
