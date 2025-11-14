import React from 'react';
import logo from '../logo.png'; // Asegúrate de que esta ruta sea correcta


const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-400 py-6 mt-auto">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between px-4">
        <div className="flex items-center mb-4 md:mb-0">
          <a href="https://thepydeveloper.dev" target="_blank" rel="noopener noreferrer">
            <img 
              src={logo} 
              alt="ThePyDeveloper Logo" 
              className="h-10 w-10 mr-3 rounded-full"
            />
          </a>
          <div>
            <span>Desarrollado por </span>
            <a 
              href="https://thepydeveloper.dev" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-purple-400 hover:text-purple-300 font-semibold"
            >
              ThePyDeveloper
            </a>
          </div>
        </div>
        <div className="text-center md:text-right">
          <p>
            <span>impulsado por </span>
            <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-500">
              Google Gemini
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
