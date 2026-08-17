import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { StoreSettings } from '../types';
import { getOptimizedImageUrl } from '../utils/cloudinary';

const DEFAULT_MODEL_IMAGE = '/images/philosophy_model.jpg';

interface PhilosophySectionProps {
  imageUrl?: string;
  storeSettings?: StoreSettings;
  onExplore?: () => void;
}

export const PhilosophySection: React.FC<PhilosophySectionProps> = ({
  imageUrl,
  storeSettings,
  onExplore,
}) => {
  const { language } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const rawModelImage =
    storeSettings?.philosophyImageUrl ||
    imageUrl ||
    DEFAULT_MODEL_IMAGE;
  const activeImageUrl = getOptimizedImageUrl(rawModelImage, { width: 800 });

  useEffect(() => {
    const element = sectionRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  const isRtl = language === 'ar';

  return (
    <section
      id="about"
      ref={sectionRef}
      className="py-10 sm:py-12 md:py-14 bg-[#ffffff] border-y border-[#c5a059]/20 px-4 sm:px-6 md:px-16 overflow-hidden relative"
    >
      {/* Decorative Subtle Background Ambient Glow */}
      <div className="absolute top-1/2 ltr:left-10 rtl:right-10 -translate-y-1/2 w-96 h-96 bg-[#c5a059]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Section Container: 2 columns on tablet & desktop (md:grid-cols-2), 1 column on mobile */}
      <div className="max-w-[1240px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
        {/* Column 1: Text Content (md:order-1 -> Right side in RTL, Left side in LTR) */}
        <div className="order-2 md:order-1 z-20 space-y-4 sm:space-y-5 max-w-xl mx-auto md:mx-0 relative">
          {/* Subtitle & Golden Expanding Accent Line */}
          <div className="flex items-center gap-3">
            <span
              className="h-[1.5px] bg-gradient-to-r from-[#c5a059] to-[#dfc38c] rounded-full transition-all duration-800 ease-out"
              style={{
                width: isVisible ? '2.5rem' : '0rem',
                opacity: isVisible ? 1 : 0,
              }}
            />
            <span
              className="font-label-caps text-[#8c734b] text-[11px] sm:text-[12px] tracking-[0.28em] font-semibold uppercase transition-all duration-700 ease-out"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible
                  ? 'translateX(0)'
                  : isRtl
                  ? 'translateX(20px)'
                  : 'translateX(-20px)',
                transitionDelay: '200ms',
              }}
            >
              {language === 'ar'
                ? storeSettings?.philosophyBadgeAr || 'فلسفة دار الأزياء'
                : storeSettings?.philosophyBadgeEn || 'OUR PHILOSOPHY'}
            </span>
          </div>

          {/* Main Title */}
          <h2 className="font-display text-[26px] sm:text-[32px] md:text-[38px] text-[#1a1a1a] leading-[1.22] font-normal tracking-tight">
            <span
              className="block transition-all duration-700 ease-out"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                transitionDelay: '300ms',
              }}
            >
              {language === 'ar'
                ? storeSettings?.philosophyTitle1Ar || 'إتقان يدوي..'
                : storeSettings?.philosophyTitle1En || 'Pure Craftsmanship.'}
            </span>
            <span
              className="block font-italic italic text-[#8c734b] transition-all duration-700 ease-out mt-0.5"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                transitionDelay: '420ms',
              }}
            >
              {language === 'ar'
                ? storeSettings?.philosophyTitle2Ar || 'وأناقة تدوم طويلاً'
                : storeSettings?.philosophyTitle2En || 'Unhurried Elegance.'}
            </span>
          </h2>

          {/* Golden Horizontal Connecting Line */}
          <div
            className="h-[1px] bg-gradient-to-r from-[#c5a059]/40 via-[#c5a059]/15 to-transparent transition-all duration-1000"
            style={{
              width: isVisible ? '100%' : '0%',
              opacity: isVisible ? 1 : 0,
              transitionDelay: '500ms',
            }}
          />

          {/* Paragraphs */}
          <div
            className="space-y-3 transition-all duration-800 ease-out"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(16px)',
              transitionDelay: '580ms',
            }}
          >
            <p className="font-body text-[14px] sm:text-[15px] text-[#2c2c2c] leading-[1.8] font-light">
              {language === 'ar'
                ? storeSettings?.philosophyParagraph1Ar ||
                  'في توزا، نركز على تقديم أفضل أزياء كاجوال رجالي تجمع بين العصرية والراحة المطلقة في جميع الأوقات.'
                : storeSettings?.philosophyParagraph1En ||
                  'At TOUZA, we craft high-end casual menswear built with 280GSM Egyptian cotton, pure flax linen, and custom relaxed tailoring.'}
            </p>
            <p className="font-body text-[13px] sm:text-[14px] text-[#555555] leading-[1.75] font-light">
              {language === 'ar'
                ? storeSettings?.philosophyParagraph2Ar ||
                  'تصاميم تعبر عن الأناقة الهادئة والثقة المطلقة، مع خدمات توصيل سريعة ومميزة في جميع أنحاء مصر.'
                : storeSettings?.philosophyParagraph2En ||
                  'Designed for perpetual relevance across seasons, our garments honor the wearer with quiet confidence.'}
            </p>
          </div>

          {/* CTA Button */}
          <div
            className="pt-1 transition-all duration-800 ease-out"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(16px)',
              transitionDelay: '700ms',
            }}
          >
            <button
              onClick={onExplore}
              className="group relative inline-flex items-center justify-center gap-2.5 border border-[#1a1a1a] text-[#1a1a1a] py-3 px-8 font-label-caps rounded-xl overflow-hidden cursor-pointer text-[12px] sm:text-[13px] font-semibold tracking-wider shadow-2xs transition-all duration-500 hover:shadow-md transform hover:-translate-y-0.5"
            >
              {/* Animated Hover Background Fill */}
              <span className="absolute inset-0 bg-[#1a1a1a] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-0" />

              <span className="relative z-10 group-hover:text-white transition-colors duration-500">
                {language === 'ar' ? 'اكتشف التشكيلة الكاملة' : 'Explore The Atelier'}
              </span>
              {language === 'ar' ? (
                <ArrowLeft className="relative z-10 w-4.5 h-4.5 group-hover:text-white transition-all duration-500 transform group-hover:-translate-x-1" />
              ) : (
                <ArrowRight className="relative z-10 w-4.5 h-4.5 group-hover:text-white transition-all duration-500 transform group-hover:translate-x-1" />
              )}
            </button>
          </div>
        </div>

        {/* Column 2: Model Image (md:order-2 -> Left side in RTL, Right side in LTR) */}
        <div className="order-1 md:order-2 relative z-10 w-full flex justify-center ltr:md:justify-end rtl:md:justify-start">
          <div
            className="relative w-full max-w-[320px] sm:max-w-[350px] md:max-w-[380px] transition-all duration-1000 ease-out"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible
                ? 'scale(1) translateY(0)'
                : 'scale(0.95) translateY(20px)',
              transitionDelay: '250ms',
            }}
          >
            {/* Seamless Model Photo Wrapper - Transparent Cutout with Ground Shadow */}
            <div className="relative h-[360px] sm:h-[400px] md:h-[430px] w-full flex flex-col items-center justify-end group">
              {/* Soft Ground Shadow under Model Feet */}
              <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-[60%] h-3.5 bg-black/15 rounded-[100%] blur-md pointer-events-none z-0 transition-opacity duration-700 group-hover:opacity-80" />

              {/* Model Cutout Image - Seamless Transparent PNG with Ground Shadow */}
              <img
                src={activeImageUrl}
                alt="Maison Atelier Model"
                referrerPolicy="no-referrer"
                loading="eager"
                fetchPriority="high"
                onError={(e) => {
                  e.currentTarget.src = DEFAULT_MODEL_IMAGE;
                }}
                className="relative z-10 max-h-full max-w-full object-contain object-bottom transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                style={{
                  filter: 'contrast(1.04) brightness(1.02)',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
