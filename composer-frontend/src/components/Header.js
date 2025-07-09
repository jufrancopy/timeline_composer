import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../logo.svg';
import { Menu, X } from 'lucide-react'; // Importar iconos de lucide-react

const Header = ({ isAdmin, handleLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-gray-900/50 backdrop-blur-lg text-white sticky top-0 z-40 border-b border-white/10">
      <div className="container mx-auto flex items-center justify-between p-4">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} className="h-10 w-10" alt="logo" />
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
            TimeLine Composer
          </span>
        </Link>

        {/* Botón de hamburguesa para móvil */}
        <div className="md:hidden">
          <button onClick={toggleMenu} className="text-white focus:outline-none">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Menú de navegación - visible en desktop, condicional en móvil */}
        <nav className={`md:flex items-center gap-4 ${isMenuOpen ? 'flex flex-col absolute top-full left-0 w-full bg-gray-900/90 backdrop-blur-lg p-4 border-b border-white/10' : 'hidden'}`}>
          
          <Link to="/about" className="block py-2 px-4 text-gray-300 hover:text-white transition-colors" onClick={() => setIsMenuOpen(false)}>
            Sobre el Proyecto
          </Link>
          <Link to="/gamification" className="block py-2 px-4 text-gray-300 hover:text-white transition-colors" onClick={() => setIsMenuOpen(false)}>
            Ranking
          </Link>
          <Link to="/my-contributions" className="block py-2 px-4 text-gray-300 hover:text-white transition-colors" onClick={() => setIsMenuOpen(false)}>
            Mis Aportes
          </Link>
          {isAdmin ? (
            <>
              <Link to="/admin/dashboard" className="block py-2 px-4 text-gray-300 hover:text-white transition-colors" onClick={() => setIsMenuOpen(false)}>
                Admin Dashboard
              </Link>
              <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="block w-full text-left py-2 px-4 text-gray-300 hover:text-white transition-colors bg-transparent border-none cursor-pointer">
                Logout
              </button>
            </>
          ) : (
            <Link to="/admin/login" className="block py-2 px-4 text-gray-300 hover:text-white transition-colors" onClick={() => setIsMenuOpen(false)}>
              Admin
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
