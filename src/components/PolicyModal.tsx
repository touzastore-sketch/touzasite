import React from 'react';
import { X } from 'lucide-react';

interface PolicyModalProps {
  title: string | null;
  content: string | null;
  onClose: () => void;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({ title, content, onClose }) => {
  if (!title || !content) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#ffffff] max-w-lg w-full rounded-2xl p-6 md:p-8 relative shadow-2xl space-y-4 fade-in-up">
        <div className="flex justify-between items-center border-b border-[#c4c7c7]/30 pb-4">
          <h2 className="font-display text-[24px] text-[#000000]">{title}</h2>
          <button onClick={onClose} className="p-2 text-[#000000] hover:opacity-70 cursor-pointer">
            <X className="w-6 h-6" />
          </button>
        </div>

        <p className="font-body text-[15px] text-[#444748] leading-relaxed py-2">{content}</p>

        <button
          onClick={onClose}
          className="w-full bg-[#000000] text-white py-3 rounded-lg font-label-caps hover:bg-[#2f3131] transition-colors cursor-pointer"
        >
          Close Notice
        </button>
      </div>
    </div>
  );
};
