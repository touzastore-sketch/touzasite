import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const LogoMarqueeSectionComponent: React.FC = () => {
  const { language } = useLanguage();

  const isRtl = language === 'ar';

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

  // Duplicate list to guarantee seamless continuous infinite loop (-50% translation)
  const marqueeItems = [...pressLogos, ...pressLogos, ...pressLogos];

  return (
    <section className="py-14 sm:py-16 bg-[#ffffff] border-t border-[#c5a059]/20 overflow-hidden relative">
      {/* Small Header Tag */}
      <div className="max-w-[1440px] mx-auto px-5 md:px-16 mb-8 text-center">
        <div className="inline-flex items-center gap-3">
          <span className="w-8 h-[1px] bg-[#c5a059]/40" />
          <span className="font-label-caps text-[#8c734b] text-[11px] sm:text-[12px] tracking-[0.25em] uppercase font-medium">
            {language === 'ar' ? 'كما ورد في صحافة الأزياء الرجالية العالمية' : "AS FEATURED IN MEN'S FASHION & STYLE PRESS"}
          </span>
          <span className="w-8 h-[1px] bg-[#c5a059]/40" />
        </div>
      </div>

      {/* Marquee Viewport Container */}
      <div className="relative w-full overflow-hidden py-3 marquee-container group">
        {/* Subtle Left & Right Luxury Gradient Vignette Masks */}
        <div className="absolute top-0 bottom-0 left-0 w-20 sm:w-32 bg-gradient-to-r from-[#ffffff] to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-20 sm:w-32 bg-gradient-to-l from-[#ffffff] to-transparent z-10 pointer-events-none" />

        {/* Scrolling Animated Track */}
        <div className={isRtl ? 'animate-marquee-rtl' : 'animate-marquee'}>
          {marqueeItems.map((logo, idx) => (
            <div
              key={`${logo.id}-${idx}`}
              className="flex items-center gap-16 sm:gap-24 px-8 sm:px-12 group/item cursor-pointer shrink-0 transition-all duration-300"
            >
              <div className="flex flex-col items-center justify-center text-center">
                <span className="font-display text-[22px] sm:text-[26px] tracking-[0.18em] font-normal text-[#1a1a1a]/45 group-hover/item:text-[#c5a059] group-hover/item:scale-105 transition-all duration-300 drop-shadow-2xs">
                  {logo.name}
                </span>
                <span className="font-label-caps text-[9px] tracking-[0.3em] text-[#8c734b]/40 group-hover/item:text-[#1a1a1a] transition-colors duration-300 uppercase -mt-0.5">
                  {logo.subtitle}
                </span>
              </div>

              {/* Minimal Luxury Diamond Separator */}
              <span className="w-1.5 h-1.5 rotate-45 border border-[#c5a059]/35 bg-transparent inline-block" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const LogoMarqueeSection = React.memo(LogoMarqueeSectionComponent);

