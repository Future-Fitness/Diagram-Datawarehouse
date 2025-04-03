import React, { useEffect } from 'react';

import ImageDetailVisualization from './ImageDetailVisualization';

interface ImageDetailModalProps {
  image: any| null;
  isOpen: boolean;
  onClose: () => void;
  darkMode?: boolean;
}

const ImageDetailModal: React.FC<ImageDetailModalProps> = ({
  image,
  isOpen,
  onClose,
  darkMode = true
}) => {
  // Close modal on escape key press
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    
    // Lock body scroll when modal is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  // Stop propagation of click events inside the modal content
  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (!isOpen || !image) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
      {/* Backdrop with blur and opacity */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal container */}
      <div 
        className="relative w-full max-w-7xl mx-4 z-50 max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl transition-transform"
        onClick={handleContentClick}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-white bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-2 transition-colors"
          aria-label="Close modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* Image detail visualization component */}
        <ImageDetailVisualization image={image} darkMode={darkMode} />
      </div>
    </div>
  );
};

export default ImageDetailModal;