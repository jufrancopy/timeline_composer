import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-400 py-6 mt-auto">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between mb-4">
          <div className="flex items-center mb-4 md:mb-0">
            <a href="https://thepydeveloper.dev" target="_blank" rel="noopener noreferrer">
              <img 
                src="https://thepydeveloper.dev/images/logo.png" 
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
        <div className="border-t border-gray-700 pt-4 text-center text-sm">
          <p>"Un proyecto que une filosofía, tecnología y pasión por la cultura, creando un espacio digital donde el pasado cobra vida para inspirar el futuro."</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
