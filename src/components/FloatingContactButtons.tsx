import React from 'react';
import { Phone } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { StoreSettings } from '../types';

interface FloatingContactButtonsProps {
  storeSettings?: StoreSettings;
}

export const FloatingContactButtons: React.FC<FloatingContactButtonsProps> = ({ storeSettings }) => {
  const { language } = useLanguage();

  const rawContact = storeSettings?.contactAr || '';
  const phoneMatch = rawContact.match(/01\d{9}|\+?\d{10,12}/);
  const fallbackPhone = phoneMatch ? phoneMatch[0] : '01070606272';

  const phoneNumber = storeSettings?.phoneNumber?.trim() || fallbackPhone;
  const rawWhatsapp = storeSettings?.whatsappNumber?.trim() || phoneNumber;

  const cleanWhatsapp = rawWhatsapp.replace(/[^0-9]/g, '');
  const whatsappNum = cleanWhatsapp.startsWith('0') ? '2' + cleanWhatsapp : cleanWhatsapp;

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-center gap-2.5 dir-ltr">
      {/* WhatsApp Direct Concierge */}
      <a
        href={`https://wa.me/${whatsappNum}?text=${encodeURIComponent(
          language === 'ar' ? 'مرحباً توزا، أود الاستفسار عن المنتجات' : 'Hello TOUZA, I would like to inquire about your products'
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex items-center justify-center w-11 h-11 bg-[#111111] hover:bg-[#1a6b3c] text-white rounded-full shadow-md transition-colors duration-200 cursor-pointer border border-white/20"
        aria-label="WhatsApp Contact"
      >
        <svg
          className="w-5 h-5 fill-current"
          viewBox="0 0 24 24"
        >
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
        </svg>

        <span className="absolute right-13 bg-[#111111] text-white font-body text-[12px] px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-md pointer-events-none">
          {language === 'ar' ? 'تواصل عبر واتساب' : 'Chat on WhatsApp'}
        </span>
      </a>

      {/* Direct Phone Call */}
      <a
        href={`tel:${phoneNumber}`}
        className="group relative flex items-center justify-center w-11 h-11 bg-[#ffffff] hover:bg-[#111111] text-[#111111] hover:text-white rounded-full shadow-md transition-colors duration-200 cursor-pointer border border-[#d6d3cc]"
        aria-label="Direct Phone Call"
      >
        <Phone className="w-4.5 h-4.5 stroke-[1.75]" />

        <span className="absolute right-13 bg-[#111111] text-white font-body text-[12px] px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-md pointer-events-none tabular-nums">
          {language === 'ar' ? `اتصال مباشر (${phoneNumber})` : `Call (${phoneNumber})`}
        </span>
      </a>
    </div>
  );
};
