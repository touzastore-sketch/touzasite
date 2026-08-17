import React from 'react';
import { X } from 'lucide-react';

interface ImageModalProps {
  imageSrc: string | null;
  onClose: () => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({ imageSrc, onClose }) => {
  if (!imageSrc) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-white p-3 hover:opacity-70 transition-opacity z-10 cursor-pointer"
        title="Close image"
      >
        <X className="w-8 h-8" />
      </button>

      <div className="max-w-4xl max-h-[90vh] overflow-hidden rounded flex items-center justify-center">
        <img
          src={imageSrc}
          alt="Expanded view"
          className="max-w-full max-h-[90vh] object-contain select-none"
        />
      </div>
    </div>
  );
};
