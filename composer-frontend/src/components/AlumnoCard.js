import React from 'react';

const AlumnoCard = ({ alumno, onEdit, onDelete }) => {
  return (
    <div className="bg-white/5 backdrop-blur-lg p-4 rounded-lg shadow-xl mb-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-bold text-gray-100">{alumno.nombre} {alumno.apellido}</h3>
        <div className="flex space-x-2">
          <button onClick={() => onEdit(alumno)} className="text-yellow-400 hover:text-yellow-500 text-sm">Editar</button>
          <button onClick={() => onDelete(alumno.id)} className="text-red-400 hover:text-red-500 text-sm">Eliminar</button>
        </div>
      </div>
      <p className="text-gray-300"><strong>Email:</strong> {alumno.email}</p>
      <p className="text-gray-300"><strong>Instrumento:</strong> {alumno.instrumento || 'N/A'}</p>
      {/* Puedes añadir más detalles aquí si es necesario */}
    </div>
  );
};

export default AlumnoCard;