import React from 'react';
import { useLanguage } from '../context/LanguageContext';

interface BrandsMarqueeStripProps {
  onExplore?: () => void;
}

interface BrandItem {
  name: string;
  styleClass: string;
}

const LUXURY_BRANDS: BrandItem[] = [
  { name: 'TOUZA', styleClass: 'brand-marquee-serif text-[20px] sm:text-[23px] font-medium' },
  { name: 'RALPH LAUREN', styleClass: 'brand-marquee-serif text-[16px] sm:text-[18px] font-normal' },
  { name: 'HUGO BOSS', styleClass: 'brand-marquee-sans text-[14px] sm:text-[16px] font-semibold' },
  { name: 'MASSIMO DUTTI', styleClass: 'brand-marquee-serif text-[16px] sm:text-[18px] font-normal italic' },
  { name: 'CALVIN KLEIN', styleClass: 'brand-marquee-sans text-[14px] sm:text-[16px] font-medium' },
  { name: 'LACOSTE', styleClass: 'brand-marquee-sans text-[14px] sm:text-[16px] font-semibold' },
  { name: 'EMPORIO ARMANI', styleClass: 'brand-marquee-serif text-[15px] sm:text-[17px] font-normal' },
  { name: 'TOMMY HILFIGER', styleClass: 'brand-marquee-sans text-[13.5px] sm:text-[15.5px] font-semibold' },
  { name: 'ZARA MAN', styleClass: 'brand-marquee-serif text-[18px] sm:text-[21px] font-normal' },
  { name: 'STONE ISLAND', styleClass: 'brand-marquee-sans text-[13.5px] sm:text-[15.5px] font-semibold' },
  { name: 'PALM ANGELS', styleClass: 'brand-marquee-serif text-[16px] sm:text-[18px] font-medium' },
  { name: 'OFF-WHITE', styleClass: 'brand-marquee-sans text-[14px] sm:text-[16px] font-semibold' },
];

const BrandsMarqueeStripComponent: React.FC<BrandsMarqueeStripProps> = ({
  onExplore,
}) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const renderTrackGroup = (groupKey: string) => (
    <div
      key={groupKey}
      className="flex items-center shrink-0"
      aria-hidden={groupKey === 'dup'}
    >
      {LUXURY_BRANDS.map((brand, idx) => (
        <React.Fragment key={`${groupKey}-${brand.name}-${idx}`}>
          <button
            type="button"
            onClick={onExplore}
            tabIndex={groupKey === 'dup' ? -1 : 0}
            className={`px-7 sm:px-10 md:px-12 py-1 text-[#111111]/75 hover:text-[#111111] transition-colors duration-200 whitespace-nowrap select-none cursor-pointer uppercase ${brand.styleClass}`}
          >
            {brand.name}
          </button>
          <span
            aria-hidden="true"
            className="w-[4px] h-[4px] rotate-45 bg-[#111111]/25 shrink-0"
          />
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <section
      aria-label={isAr ? 'أقوى الماركات العالمية' : 'Featured Global Menswear Labels'}
      className="w-full bg-[#f4f3f0] border-y border-[#e5e3de] relative overflow-hidden"
    >
      {/* Subtle Architectural Left/Right Edge Fade Masks */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-10 sm:w-20 bg-gradient-to-r from-[#f4f3f0] to-transparent z-10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-10 sm:w-20 bg-gradient-to-l from-[#f4f3f0] to-transparent z-10"
      />

      {/* Seamless Infinite Horizontal Track (Forced LTR for glitch-free infinite scroll in both AR & EN) */}
      <div
        dir="ltr"
        className="marquee-container py-4 sm:py-5 group/brands"
      >
        <div className="animate-brand-marquee group-hover/brands:[animation-play-state:paused]">
          {renderTrackGroup('main')}
          {renderTrackGroup('dup')}
        </div>
      </div>
    </section>
  );
};

export const BrandsMarqueeStrip = React.memo(BrandsMarqueeStripComponent);
