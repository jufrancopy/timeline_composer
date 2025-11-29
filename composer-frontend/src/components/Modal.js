import React from 'react';
import ReactDOM from 'react-dom';

const Modal = ({ isOpen, onClose, onSubmit, title, children, showSubmitButton = true, submitText = 'Enviar', cancelText = 'Cancelar', isAttachmentModal = false }) => {
  if (!isOpen) {
    return null;
  }

  return ReactDOM.createPortal(
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div 
        className={`bg-slate-800 rounded-lg shadow-xl w-full ${isAttachmentModal ? 'max-w-7xl' : 'max-w-2xl'} flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
        </div>

        <div className="p-6 overflow-y-auto" style={{ maxHeight: isAttachmentModal ? '90vh' : '70vh' }}>
          {children}
        </div>

        <div className="flex justify-end gap-4 p-4 border-t border-slate-700">
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            {cancelText}
          </button>
          {showSubmitButton && (
            <button
              onClick={onSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              {submitText}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.getElementById('modal-root')
  );
};

export default Modal;
