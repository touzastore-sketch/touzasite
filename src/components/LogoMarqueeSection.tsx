import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const LogoMarqueeSectionComponent: React.FC = () => {
  const { language } = useLanguage();

  const pressLogos = [
    { id: 'gq', name: 'GQ', subtitle: 'MENSWEAR & STYLE' },
    { id: 'esquire', name: 'ESQUIRE', subtitle: "MEN'S FASHION" },
    { id: 'hypebeast', name: 'HYPEBEAST', subtitle: 'STREETWEAR & CASUAL' },
    { id: 'highsnobiety', name: 'HIGHSNOBIETY', subtitle: "MEN'S CULTURE" },
    { id: 'gqstyle', name: 'GQ STYLE', subtitle: 'CASUAL & LUXURY' },
    { id: 'voguehommes', name: 'VOGUE HOMMES', subtitle: 'PARIS HOMME' },
    { id: 'lofficielhommes', name: "L'OFFICIEL HOMMES", subtitle: 'MODE HOMME' },
    { id: 'menshealth', name: "MEN'S HEALTH", subtitle: 'STYLE & FIT' },
  ];

  return (
    <section className="py-12 sm:py-16 bg-[#ffffff] border-t border-[#c5a059]/25 overflow-hidden relative select-none">
      {/* Header Tag */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 mb-7 sm:mb-9 text-center">
        <div className="inline-flex items-center gap-3">
          <span className="w-8 sm:w-12 h-[1px] bg-[#c5a059]/40" />
          <span className="font-label-caps text-[#8c734b] text-[11px] sm:text-[13px] tracking-[0.22em] sm:tracking-[0.28em] uppercase font-bold">
            {language === 'ar' ? 'كما ورد في صحافة الأزياء الرجالية العالمية' : "AS FEATURED IN MEN'S FASHION & STYLE PRESS"}
          </span>
          <span className="w-8 sm:w-12 h-[1px] bg-[#c5a059]/40" />
        </div>
      </div>

      {/* Marquee Viewport Container with Left & Right Luxury Vignette Masks */}
      <div
        dir="ltr"
        className="relative w-full overflow-hidden py-3 marquee-container group"
      >
        {/* Subtle Left & Right Luxury Gradient Vignette Masks */}
        <div className="absolute top-0 bottom-0 left-0 w-16 sm:w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-16 sm:w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        {/* Scrolling Animated Track */}
        <div
          className="flex whitespace-nowrap animate-marquee w-max"
          style={{ animationDuration: '28s' }}
        >
          {/* Primary Set */}
          <div className="flex items-center gap-10 sm:gap-20 px-6 sm:px-10 shrink-0">
            {pressLogos.map((logo) => (
              <div
                key={`p1-${logo.id}`}
                className="flex items-center gap-10 sm:gap-20 group/item cursor-pointer shrink-0 transition-transform duration-300 hover:scale-105"
              >
                <div className="flex flex-col items-center justify-center text-center">
                  <span className="font-display text-[22px] sm:text-[28px] tracking-[0.16em] font-semibold text-[#111111]/80 group-hover/item:text-[#c5a059] transition-colors duration-300">
                    {logo.name}
                  </span>
                  <span className="font-label-caps text-[9.5px] sm:text-[10px] tracking-[0.25em] text-[#8c734b]/80 group-hover/item:text-[#111111] transition-colors duration-300 uppercase -mt-0.5 font-bold">
                    {logo.subtitle}
                  </span>
                </div>

                {/* Minimal Luxury Diamond Separator */}
                <span className="w-2 h-2 rotate-45 border border-[#c5a059]/60 bg-[#c5a059]/10 inline-block" />
              </div>
            ))}
          </div>

          {/* Duplicate Set for Seamless Continuous Infinite Loop */}
          <div className="flex items-center gap-10 sm:gap-20 px-6 sm:px-10 shrink-0" aria-hidden="true">
            {pressLogos.map((logo) => (
              <div
                key={`p2-${logo.id}`}
                className="flex items-center gap-10 sm:gap-20 group/item cursor-pointer shrink-0 transition-transform duration-300 hover:scale-105"
              >
                <div className="flex flex-col items-center justify-center text-center">
                  <span className="font-display text-[22px] sm:text-[28px] tracking-[0.16em] font-semibold text-[#111111]/80 group-hover/item:text-[#c5a059] transition-colors duration-300">
                    {logo.name}
                  </span>
                  <span className="font-label-caps text-[9.5px] sm:text-[10px] tracking-[0.25em] text-[#8c734b]/80 group-hover/item:text-[#111111] transition-colors duration-300 uppercase -mt-0.5 font-bold">
                    {logo.subtitle}
                  </span>
                </div>

                {/* Minimal Luxury Diamond Separator */}
                <span className="w-2 h-2 rotate-45 border border-[#c5a059]/60 bg-[#c5a059]/10 inline-block" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export const LogoMarqueeSection = React.memo(LogoMarqueeSectionComponent);


