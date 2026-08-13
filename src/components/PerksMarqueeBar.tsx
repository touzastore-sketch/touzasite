import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { StoreSettings } from '../types';

interface PerksMarqueeBarProps {
  storeSettings?: StoreSettings;
}

export const PerksMarqueeBar: React.FC<PerksMarqueeBarProps> = ({ storeSettings }) => {
  const { language } = useLanguage();
  const isRtl = language === 'ar';

  const customAnnouncement = isRtl ? storeSettings?.announcementAr : storeSettings?.announcementEn;

  const defaultPerks = isRtl
    ? [
        'شحن مجاني للطلبات لجميع المحافظات',
        'إرجاع واستبدال مجاني خلال 14 يوم',
        'جميع القطع خامات قطن مصري وكتان فاخر 100%',
        'توصيل سريع لجميع محافظات مصر',
        'تغليف توزا الفاخر مجاناً لجميع الطلبات',
      ]
    : [
        'COMPLIMENTARY EXPRESS SHIPPING NATIONWIDE',
        'COMPLIMENTARY 14-DAY EASY RETURNS & EXCHANGES',
        '100% HEAVYWEIGHT EGYPTIAN COTTON & FINE LINEN',
        'EXPRESS DOORSTEP DELIVERY ACROSS ALL EGYPT',
        'SIGNATURE TOUZA LUXURY PACKAGING INCLUDED',
      ];

  const perks = customAnnouncement ? [customAnnouncement, ...defaultPerks] : defaultPerks;

  // Repeat items for seamless continuous loop
  const marqueeItems = [...perks, ...perks, ...perks, ...perks];

  return (
    <div className="w-full bg-[#121212] border-y border-[#c5a059]/40 py-3 overflow-hidden relative shadow-sm marquee-container group">
      {/* Subtle side gradient fade overlays */}
      <div className="absolute top-0 bottom-0 left-0 w-12 sm:w-24 bg-gradient-to-r from-[#121212] to-transparent z-10 pointer-events-none" />
      <div className="absolute top-0 bottom-0 right-0 w-12 sm:w-24 bg-gradient-to-l from-[#121212] to-transparent z-10 pointer-events-none" />

      {/* Marquee Track */}
      <div className={isRtl ? 'animate-marquee-rtl' : 'animate-marquee'}>
        {marqueeItems.map((perk, idx) => (
          <div
            key={`perk-${idx}`}
            className="flex items-center gap-6 sm:gap-10 px-4 sm:px-6 shrink-0"
          >
            <span className="font-label-caps text-[12px] sm:text-[13px] font-medium tracking-[0.18em] text-[#f3f3f3] uppercase whitespace-nowrap group-hover:text-[#dfc38c] transition-colors duration-300">
              {perk}
            </span>
            <span className="text-[#c5a059] text-[10px] sm:text-[11px] select-none font-serif opacity-80">
              ✦
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
