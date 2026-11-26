import React, { useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { StoreSettings } from '../types';
import heroDarkStack from '../assets/images/touza_hero_jacket_stack_1795730395438.jpg';
import heroDarkHangers from '../assets/images/touza_hero_jacket_rack_1795730396212.jpg';

interface HeroBannerProps {
  onShopNow: () => void;
  onShopSecondary?: () => void;
  storeSettings?: StoreSettings;
  onVideoReady?: () => void;
}

const HeroBannerComponent: React.FC<HeroBannerProps> = ({
  onShopNow,
  onShopSecondary,
  storeSettings,
  onVideoReady,
}) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  useEffect(() => {
    onVideoReady?.();
  }, [onVideoReady]);

  const leftEyebrow =
    (isAr ? storeSettings?.heroBadgeAr : storeSettings?.heroBadgeEn)?.trim() ||
    (isAr ? 'تشكيلة الموسم · TOUZA' : 'SEASONAL EDIT · TOUZA');

  const leftTitle =
    (isAr ? storeSettings?.heroTitleAr : storeSettings?.heroTitleEn)?.trim() ||
    (isAr ? 'أقوى تشكيلة كاجوال رجالي' : 'Our finest men’s edit');

  const leftSubtitle =
    (isAr ? storeSettings?.heroSubtitleAr : storeSettings?.heroSubtitleEn)?.trim() ||
    (isAr
      ? 'خامات فاخرة وقصّات عصرية مريحة تناسب كل يوم — شحن سريع لجميع محافظات مصر.'
      : 'Heavyweight everyday staples tailored with quiet Scandinavian restraint.');

  const leftCta =
    (isAr ? storeSettings?.heroCtaAr : storeSettings?.heroCtaEn)?.trim() ||
    (isAr ? 'تسوق الكل' : 'SHOP ALL MEN');

  return (
    <section className="w-full pt-[88px] md:pt-[100px] bg-[#0a0a0a]">
      {/* Exact Bread & Boxers Full-Bleed 50/50 Dark Split Hero */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-0">
        {/* Hero Panel 1 (Start): Moody Folded Menswear Stack */}
        <div
          onClick={onShopNow}
          className="group relative w-full h-[64vh] sm:h-[72vh] md:h-[80vh] max-h-[820px] min-h-[480px] overflow-hidden bg-[#0a0a0a] cursor-pointer"
        >
          <img
            src={heroDarkStack}
            alt={leftTitle}
            fetchPriority="high"
            loading="eager"
            decoding="async"
            className="w-full h-full object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10 pointer-events-none" />

          <div className="absolute inset-x-0 bottom-0 p-7 sm:p-10 md:p-14 flex flex-col items-start text-start text-white z-10 max-w-xl">
            <span className="inline-block border-b border-white/80 pb-1 text-[11px] tracking-[0.14em] uppercase font-body text-white/95 mb-3">
              {leftEyebrow}
            </span>

            <h1 className="font-editorial editorial-italic text-[34px] sm:text-[42px] lg:text-[50px] font-normal leading-[1.12] text-white text-balance mb-3">
              {leftTitle}
            </h1>

            <p className="font-body text-[14px] sm:text-[15px] text-white/85 leading-[1.6] max-w-md mb-6 line-clamp-2">
              {leftSubtitle}
            </p>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onShopNow();
              }}
              className="border border-white/80 bg-transparent text-white hover:bg-white hover:text-[#111111] transition-colors duration-200 px-7 py-3 rounded-none text-[11px] font-medium tracking-[0.16em] uppercase cursor-pointer"
            >
              {leftCta}
            </button>
          </div>
        </div>

        {/* Hero Panel 2 (End): Moody Hanging Menswear Rack */}
        <div
          onClick={() => (onShopSecondary ? onShopSecondary() : onShopNow())}
          className="group relative w-full h-[64vh] sm:h-[72vh] md:h-[80vh] max-h-[820px] min-h-[480px] overflow-hidden bg-[#0a0a0a] cursor-pointer border-t md:border-t-0 md:border-s border-white/10"
        >
          <img
            src={heroDarkHangers}
            alt={isAr ? 'إصدار شتاء ٢٠٢٦ للرجال' : 'Winter 2026 Menswear Drop'}
            fetchPriority="high"
            loading="eager"
            decoding="async"
            className="w-full h-full object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10 pointer-events-none" />

          <div className="absolute inset-x-0 bottom-0 p-7 sm:p-10 md:p-14 flex flex-col items-start text-start text-white z-10 max-w-xl">
            <span className="inline-block border-b border-white/80 pb-1 text-[11px] tracking-[0.14em] uppercase font-body text-white/95 mb-3">
              {isAr ? 'وصل حديثاً · شتاء ٢٠٢٦' : 'NEW DROP · WINTER 2026'}
            </span>

            <h2 className="font-editorial editorial-italic text-[34px] sm:text-[42px] lg:text-[50px] font-normal leading-[1.12] text-white text-balance mb-3">
              {isAr ? 'قطع شتوية متكاملة' : 'Crafted for colder days'}
            </h2>

            <p className="font-body text-[14px] sm:text-[15px] text-white/85 leading-[1.6] max-w-md mb-6 line-clamp-2">
              {isAr
                ? 'جواكيت وأوفرشيرت بخامات ثقيلة — اطلب مباشرة عبر واتساب مع معاينة قبل الاستلام.'
                : 'Structured overshirts and tailored winter layers — order effortlessly via WhatsApp.'}
            </p>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onShopSecondary) {
                  onShopSecondary();
                } else {
                  onShopNow();
                }
              }}
              className="border border-white/80 bg-transparent text-white hover:bg-white hover:text-[#111111] transition-colors duration-200 px-7 py-3 rounded-none text-[11px] font-medium tracking-[0.16em] uppercase cursor-pointer"
            >
              {isAr ? 'تسوق الشتوي' : 'SHOP WINTER'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export const HeroBanner = React.memo(HeroBannerComponent);
