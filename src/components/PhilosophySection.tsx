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

const PhilosophySectionComponent: React.FC<PhilosophySectionProps> = ({
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
  const activeImageUrl = getOptimizedImageUrl(rawModelImage, { width: 900, quality: 'auto:good' });

  useEffect(() => {
    const element = sectionRef.current;
    if (!element) {
      setIsVisible(true);
      return;
    }

    const safetyTimer = setTimeout(() => {
      setIsVisible(true);
    }, 200);

    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return () => clearTimeout(safetyTimer);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
          clearTimeout(safetyTimer);
        }
      },
      {
        threshold: 0.01,
        rootMargin: '100px 0px 50px 0px',
      }
    );

    observer.observe(element);

    return () => {
      clearTimeout(safetyTimer);
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  const isAr = language === 'ar';

  return (
    <section
      id="about"
      ref={sectionRef}
      className="py-16 md:py-24 bg-[#f4f3f0] border-y border-[#e6e4df] px-5 sm:px-8 md:px-14 overflow-hidden"
    >
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
        {/* Column 1: Editorial Copy */}
        <div
          className="lg:col-span-6 order-2 lg:order-1 space-y-6 max-w-xl"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(16px)',
            transition: 'opacity 700ms ease-out, transform 700ms ease-out',
          }}
        >
          <span className="font-label-caps text-[#6e6c68] text-[11px] uppercase block">
            {isAr
              ? storeSettings?.philosophyBadgeAr || 'فلسفة التصميم'
              : storeSettings?.philosophyBadgeEn || 'THE PHILOSOPHY'}
          </span>

          <h2 className="font-display text-[28px] sm:text-[36px] md:text-[44px] text-[#111111] leading-[1.15] font-semibold tracking-tight text-balance">
            <span className="block">
              {isAr
                ? storeSettings?.philosophyTitle1Ar || 'إتقان هادئ في كل تفصيلة'
                : storeSettings?.philosophyTitle1En || 'Refined Essentials.'}
            </span>
            <span className="block text-[#6e6c68] font-normal mt-1">
              {isAr
                ? storeSettings?.philosophyTitle2Ar || 'وأناقة تدوم طويلاً'
                : storeSettings?.philosophyTitle2En || 'Made to Endure.'}
            </span>
          </h2>

          <div className="h-[1px] w-16 bg-[#111111]/25" />

          <div className="space-y-4">
            <p className="font-body text-[15px] sm:text-[16px] text-[#2a2a2a] leading-[1.8]">
              {isAr
                ? storeSettings?.philosophyParagraph1Ar ||
                  'في توزا، نركز على تقديم أزياء كاجوال رجالي تجمع بين الخطوط البسيطة والخامات المختارة بعناية لتمنحك راحة وثقة في كل يوم.'
                : storeSettings?.philosophyParagraph1En ||
                  'At TOUZA, we focus on elevated everyday menswear—clean silhouettes, substantial fabrics, and relaxed tailoring built for lasting comfort.'}
            </p>
            <p className="font-body text-[14px] sm:text-[15px] text-[#6e6c68] leading-[1.8]">
              {isAr
                ? storeSettings?.philosophyParagraph2Ar ||
                  'تصاميم تعبر عن الأناقة الهادئة بعيداً عن الصخب، مع شحن سريع وموثوق لجميع محافظات مصر.'
                : storeSettings?.philosophyParagraph2En ||
                  'Designed with restraint for perpetual relevance across seasons, delivered nationwide across Egypt.'}
            </p>
          </div>

          <div className="pt-3">
            <button
              type="button"
              onClick={onExplore}
              className="group inline-flex items-center justify-center gap-3 bg-[#111111] text-white py-3.5 px-8 rounded-none font-label-caps text-[12px] font-semibold hover:bg-[#2b2b2b] transition-colors cursor-pointer"
            >
              <span>{isAr ? 'استكشف التشكيلة الكاملة' : 'EXPLORE THE COLLECTION'}</span>
              {isAr ? (
                <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
              ) : (
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              )}
            </button>
          </div>
        </div>

        {/* Column 2: Architectural Portrait Pedestal */}
        <div
          className="lg:col-span-6 order-1 lg:order-2 flex justify-center lg:justify-end"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 850ms ease-out 120ms, transform 850ms ease-out 120ms',
          }}
        >
          <div className="relative w-full max-w-[440px] aspect-[4/5] bg-[#edebe6] overflow-hidden flex items-end justify-center group">
            <img
              key={activeImageUrl}
              src={activeImageUrl}
              alt="TOUZA Atelier"
              referrerPolicy="no-referrer"
              loading="eager"
              decoding="async"
              fetchPriority="high"
              onError={(e) => {
                if (e.currentTarget.src !== DEFAULT_MODEL_IMAGE && !e.currentTarget.src.includes(DEFAULT_MODEL_IMAGE)) {
                  e.currentTarget.src = DEFAULT_MODEL_IMAGE;
                }
              }}
              className="w-full h-full object-contain object-bottom pt-6 transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export const PhilosophySection = React.memo(PhilosophySectionComponent);
