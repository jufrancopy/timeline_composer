import React from 'react';
import { Link } from 'react-router-dom';

const DashboardCard = ({ 
  title, 
  value, 
  linkTo, 
  icon: Icon,  // Icon con mayúscula para componentes Lucide
  description, 
  bgColor,     // Aceptamos la prop pero no la usamos en las clases
  shadowColor  // Aceptamos la prop pero no la usamos en las clases
}) => {
  const content = (
    <div className="bg-white/10 backdrop-blur-lg p-6 rounded-lg shadow-lg hover:bg-white/20 transition-all duration-300 flex items-center space-x-4">
      {Icon && <Icon className="text-purple-400" size={32} />}
      <div>
        <p className="text-gray-300 text-sm font-medium">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
        {description && (
          <p className="text-gray-400 text-xs mt-1">{description}</p>
        )}
      </div>
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="block">
        {content}
      </Link>
    );
  }

  return content;
};

export default DashboardCard;