import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import logo from '../logo.png';
import { Menu, X, ChevronDown, UserCircle, LogOut, Settings, Award, BookOpen, BarChart3, Users } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';

const Header = ({ isAdmin, isDocente, isStudent, handleLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);

  // Detectar scroll para cambiar el estilo de la cabecera
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const decodeAndSetUser = (token, type) => {
      try {
        const decoded = jwtDecode(token);
        let name = '';
        let roleDisplay = '';
        let profilePath = '';
        let id = null;

        if (type === 'admin') {
          name = 'Administrador';
          roleDisplay = 'Administrador';
          profilePath = '/admin/dashboard';
        } else if (type === 'docente') {
          name = `${decoded.nombre || decoded.email.split('@')[0]} ${decoded.apellido || ''}`.trim();
          roleDisplay = 'Docente';
          id = decoded.docenteId;
          profilePath = `/docente/profile/${id}`;
        } else if (type === 'user') {
          name = `${decoded.nombre || decoded.email.split('@')[0]} ${decoded.apellido || ''}`.trim();
          roleDisplay = 'Alumno';
          id = decoded.alumnoId;
          profilePath = `/alumno/profile/${id}`;
        }

        if (!name) {
          name = decoded.email ? decoded.email.split('@')[0] : 'Usuario';
        }

        const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        setUserData({ name, role: roleDisplay, initials, profilePath, id });
      } catch (error) {
        console.error("Error decodificando el token en Header:", error);
        setUserData(null);
      }
    };

    const userToken = localStorage.getItem('userToken');
    const adminToken = localStorage.getItem('adminToken');
    const docenteToken = localStorage.getItem('docenteToken');

    if (userToken) {
      decodeAndSetUser(userToken, 'user');
    } else if (adminToken) {
      decodeAndSetUser(adminToken, 'admin');
    } else if (docenteToken) {
      decodeAndSetUser(docenteToken, 'docente');
    } else {
      setUserData(null);
    }
  }, [isAdmin, isDocente, isStudent]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(prev => !prev);
  };

  // Función para obtener el color del role badge
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'Administrador':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'Docente':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'Alumno':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  // Función para obtener el icono del rol
  const getRoleIcon = (role) => {
    switch (role) {
      case 'Administrador':
        return <Settings size={14} />;
      case 'Docente':
        return <BookOpen size={14} />;
      case 'Alumno':
        return <Users size={14} />;
      default:
        return <UserCircle size={14} />;
    }
  };

  return (
    <>
      {/* Header principal */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50 shadow-2xl shadow-purple-900/10' 
          : 'bg-gradient-to-r from-slate-950/50 via-purple-950/30 to-slate-950/50 backdrop-blur-lg border-b border-white/5'
      }`}>
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-transparent to-pink-600/5"></div>
        
        <div className="container mx-auto relative z-10">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Logo y título */}
            <Link to="/" className="group flex items-center gap-3 transition-transform duration-300 hover:scale-105">
              <div className="relative">

                <img src={logo} className="relative h-12 w-12 rounded-xl shadow-lg" alt="logo" />
              </div>
              <div className="hidden sm:block">
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 drop-shadow-sm">
                  EduPlatForm
                </span>
                <div className="text-xs text-slate-400 font-medium tracking-wide">
                  Plataforma Educativa Colaborativa
                </div>
              </div>
            </Link>

            {/* Navegación Desktop */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link 
                to="/about" 
                className="group relative px-4 py-2.5 text-slate-300 hover:text-white transition-all duration-300 rounded-lg hover:bg-white/5"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <BookOpen size={16} />
                  Sobre el Proyecto
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Link>
              
              <Link 
                to="/gamification" 
                className="group relative px-4 py-2.5 text-slate-300 hover:text-white transition-all duration-300 rounded-lg hover:bg-white/5"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Award size={16} />
                  Ranking
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Link>
              
              {!userData && (
                <>
                  <Link 
                    to="/admin/login" 
                    className="group relative px-4 py-2.5 text-red-300 hover:text-white transition-all duration-300 rounded-lg hover:bg-white/5"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <Settings size={16} />
                      Admin
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-red-600/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </Link>
                  <Link 
                    to="/docente/login" 
                    className="group relative px-4 py-2.5 text-blue-300 hover:text-white transition-all duration-300 rounded-lg hover:bg-white/5"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <BookOpen size={16} />
                      Docente
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-blue-600/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </Link>
                  <Link 
                    to="/alumno/login" 
                    className="group relative px-4 py-2.5 text-green-300 hover:text-white transition-all duration-300 rounded-lg hover:bg-white/5"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <Users size={16} />
                      Estudiante
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-green-600/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </Link>
                </>
              )}

              {userData && userData.role === 'Alumno' && (
                <Link 
                  to="/alumnos/dashboard" 
                  className="group relative px-4 py-2.5 text-slate-300 hover:text-white transition-all duration-300 rounded-lg hover:bg-white/5"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <BarChart3 size={16} />
                    Dashboard Alumno
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </Link>
              )}

              {userData && userData.role === 'Docente' && (
                <Link 
                  to="/docente/dashboard" 
                  className="group relative px-4 py-2.5 text-slate-300 hover:text-white transition-all duration-300 rounded-lg hover:bg-white/5"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <BookOpen size={16} />
                    Dashboard Docente
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </Link>
              )}

              {userData && userData.role === 'Administrador' && (
                <Link 
                  to="/admin/dashboard" 
                  className="group relative px-4 py-2.5 text-slate-300 hover:text-white transition-all duration-300 rounded-lg hover:bg-white/5"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Settings size={16} />
                    Dashboard Admin
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-pink-600/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </Link>
              )}
            </nav>

            {/* Usuario y controles */}
            <div className="flex items-center gap-3">
              {/* Dropdown de usuario (Desktop) */}
              {userData && (
                <div className="hidden lg:block relative" ref={dropdownRef}>
                  <button 
                    onClick={toggleDropdown} 
                    className="group flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3">
                      {userData.initials ? (
                        <div className="relative">

                          <div className="relative w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm shadow-lg">
                            {userData.initials}
                          </div>
                        </div>
                      ) : (
                        <UserCircle size={32} className="text-slate-400" />
                      )}
                      <div className="text-left">
                        <div className="font-semibold text-white text-sm">{userData.name}</div>
                        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${getRoleBadgeColor(userData.role)}`}>
                          {getRoleIcon(userData.role)}
                          {userData.role}
                        </div>
                      </div>
                    </div>
                    <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 py-2 z-50 animate-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-3 border-b border-slate-700/50">
                        <div className="font-semibold text-white">{userData.name}</div>
                        <div className="text-sm text-slate-400">{userData.role}</div>
                      </div>
                      
                      {userData.profilePath && (
                        <Link 
                          to={userData.profilePath} 
                          className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5 transition-all duration-200"
                          onClick={() => { setIsDropdownOpen(false); setIsMenuOpen(false); }}
                        >
                          <Settings size={18} />
                          <span>Editar Perfil</span>
                        </Link>
                      )}
                      
                      <button 
                        onClick={() => { handleLogout(); setIsDropdownOpen(false); setIsMenuOpen(false); }} 
                        className="flex items-center gap-3 w-full text-left px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200"
                      >
                        <LogOut size={18} />
                        <span>Cerrar Sesión</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Botón hamburguesa (Mobile/Tablet) */}
              <button 
                onClick={toggleMenu} 
                className="lg:hidden p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 text-white"
              >
                <div className="relative w-6 h-6">
                  <Menu 
                    size={24} 
                    className={`absolute inset-0 transition-all duration-300 ${isMenuOpen ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'}`} 
                  />
                  <X 
                    size={24} 
                    className={`absolute inset-0 transition-all duration-300 ${isMenuOpen ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'}`} 
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Menú móvil */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          ></div>
          
          {/* Menu panel */}
          <nav className="absolute top-[73px] left-0 right-0 bg-slate-950/95 backdrop-blur-xl border-b border-slate-800/50 shadow-2xl animate-in slide-in-from-top-2 duration-300">
            <div className="container mx-auto p-4">
              {/* Info de usuario en móvil */}
              {userData && (
                <div className="flex items-center gap-3 p-4 mb-4 rounded-2xl bg-gradient-to-r from-white/5 to-white/10 border border-white/10">
                  {userData.initials ? (
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-sm opacity-50"></div>
                      <div className="relative w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-lg">
                        {userData.initials}
                      </div>
                    </div>
                  ) : (
                    <UserCircle size={48} className="text-slate-400" />
                  )}
                  <div>
                    <div className="font-semibold text-white">{userData.name}</div>
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${getRoleBadgeColor(userData.role)} mt-1`}>
                      {getRoleIcon(userData.role)}
                      {userData.role}
                    </div>
                  </div>
                </div>
              )}

              {/* Enlaces de navegación */}
              <div className="space-y-1">
                <Link 
                  to="/about" 
                  className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <BookOpen size={20} />
                  Sobre el Proyecto
                </Link>
                
                <Link 
                  to="/gamification" 
                  className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Award size={20} />
                  Ranking
                </Link>

                {!userData && (
                  <>
                    <Link 
                      to="/admin/login" 
                      className="flex items-center gap-3 px-4 py-3 text-red-300 hover:text-white hover:bg-red-500/10 rounded-xl transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Settings size={20} />
                      Login Admin
                    </Link>
                    <Link 
                      to="/docente/login" 
                      className="flex items-center gap-3 px-4 py-3 text-blue-300 hover:text-white hover:bg-blue-500/10 rounded-xl transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <BookOpen size={20} />
                      Login Docente
                    </Link>
                    <Link 
                      to="/alumno/login" 
                      className="flex items-center gap-3 px-4 py-3 text-green-300 hover:text-white hover:bg-green-500/10 rounded-xl transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Users size={20} />
                      Login Estudiante
                    </Link>
                  </>
                )}
                
                {userData && userData.role === 'Alumno' && (
                  <Link 
                    to="/alumnos/dashboard" 
                    className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <BarChart3 size={20} />
                    Dashboard Alumno
                  </Link>
                )}

                {userData && userData.role === 'Docente' && (
                  <Link 
                    to="/docente/dashboard" 
                    className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-blue-500/10 rounded-xl transition-all duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <BookOpen size={20} />
                    Dashboard Docente
                  </Link>
                )}

                {userData && userData.role === 'Administrador' && (
                  <Link 
                    to="/admin/dashboard" 
                    className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-red-500/10 rounded-xl transition-all duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Settings size={20} />
                    Dashboard Admin
                  </Link>
                )}
              </div>

              {/* Botones de acción para usuario autenticado */}
              {userData && (
                <div className="mt-6 pt-4 border-t border-slate-700/50 space-y-2">
                  {userData.profilePath && (
                    <Link 
                      to={userData.profilePath} 
                      className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Settings size={20} />
                      Editar Perfil
                    </Link>
                  )}
                  
                  <button 
                    onClick={() => { handleLogout(); setIsMenuOpen(false); }} 
                    className="flex items-center gap-3 w-full text-left px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all duration-200"
                  >
                    <LogOut size={20} />
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  );
};

export default Header;