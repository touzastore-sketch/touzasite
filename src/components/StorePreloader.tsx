import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TouzaLogo } from './TouzaLogo';
import { Product, Category, StoreSettings } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { DEFAULT_HEADER_VIDEO_URL, getVideoPosterUrl } from '../utils/cloudinary';

interface StorePreloaderProps {
  products: Product[];
  categories: Category[];
  storeSettings?: StoreSettings;
  isInitialSyncDone?: boolean;
  isVideoReady?: boolean;
  isHomeView?: boolean;
  onFinishLoading: () => void;
}

export const StorePreloader: React.FC<StorePreloaderProps> = ({
  products,
  categories,
  storeSettings,
  isInitialSyncDone = false,
  isVideoReady = false,
  isHomeView = true,
  onFinishLoading,
}) => {
  const { language } = useLanguage();
  const [progress, setProgress] = useState(25);
  const [statusMessage, setStatusMessage] = useState({
    ar: 'جاري تجهيز المتجر...',
    en: 'Preparing the store...',
  });
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [minDisplayPassed, setMinDisplayPassed] = useState(false);

  const hasDismissedRef = useRef(false);
  const onFinishLoadingRef = useRef(onFinishLoading);
  onFinishLoadingRef.current = onFinishLoading;

  const dismiss = useCallback(() => {
    if (hasDismissedRef.current) return;
    hasDismissedRef.current = true;

    setProgress(100);
    setStatusMessage({
      ar: 'أهلاً بك في توزا',
      en: 'Welcome to TOUZA',
    });

    setIsFadingOut(true);

    setTimeout(() => {
      onFinishLoadingRef.current();
    }, 450);
  }, []);

  // 1. Minimum display time: 1200ms ensures an elegant, premium look without lagging
  useEffect(() => {
    const minTimer = setTimeout(() => {
      setMinDisplayPassed(true);
    }, 1200);
    return () => clearTimeout(minTimer);
  }, []);

  // 2. Maximum safety ceiling: never trap the visitor for more than 3500ms
  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      dismiss();
    }, 3500);

    const handlePageShow = () => {
      dismiss();
    };

    window.addEventListener('pageshow', handlePageShow);

    return () => {
      clearTimeout(safetyTimer);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [dismiss]);

  // 3. Smooth progressive simulated progress
  useEffect(() => {
    const t1 = setTimeout(() => {
      setProgress((p) => Math.max(p, 55));
      setStatusMessage({
        ar: 'جاري تحميل التشكيلة الفاخرة...',
        en: 'Loading exclusive collection...',
      });
    }, 250);

    const t2 = setTimeout(() => {
      setProgress((p) => Math.max(p, 85));
      setStatusMessage({
        ar: 'اللمسات الأخيرة للعرض...',
        en: 'Finalizing storefront...',
      });
    }, 650);

    const t3 = setTimeout(() => {
      setProgress((p) => Math.max(p, 96));
    }, 1000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  // 4. Intelligent dismissal when minimum duration has passed and data is ready
  useEffect(() => {
    if (!isHomeView) {
      dismiss();
      return;
    }

    if (minDisplayPassed) {
      dismiss();
    }
  }, [isHomeView, minDisplayPassed, dismiss]);

  return (
    <div
      onClick={dismiss}
      role="dialog"
      aria-label="Loading TOUZA"
      className={`fixed inset-0 z-[99999] bg-[#09090b] text-white flex flex-col items-center justify-center p-6 transition-all duration-500 ease-out select-none cursor-pointer overflow-hidden ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      style={{
        backgroundImage: 'radial-gradient(circle at 50% 48%, #17171c 0%, #0c0c0e 60%, #050506 100%)',
      }}
    >
      {/* Ambient Warm Golden Aura */}
      <div className="absolute w-80 h-80 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-[#c5a059]/15 via-[#e2c792]/20 to-transparent blur-3xl pointer-events-none animate-pulse" />

      {/* Decorative Fine Golden Rings */}
      <div className="absolute w-[340px] h-[340px] sm:w-[420px] sm:h-[420px] rounded-full border border-[#c5a059]/10 pointer-events-none animate-[spin_60s_linear_infinite]" />
      <div className="absolute w-[440px] h-[440px] sm:w-[540px] sm:h-[540px] rounded-full border border-dashed border-[#c5a059]/10 pointer-events-none animate-[spin_90s_linear_infinite_reverse]" />

      <div className="relative z-10 flex flex-col items-center max-w-sm w-full">
        {/* Luxury Logo Emblem Container */}
        <div className="relative mb-7 group">
          {/* Subtle Outer Glow Halo */}
          <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-[#c5a059]/20 via-[#e2c792]/30 to-[#c5a059]/20 blur-md opacity-75 animate-pulse" />

          {/* Frosted Obsidian Glass Plaque */}
          <div className="relative p-5 sm:p-6 rounded-3xl bg-black/60 backdrop-blur-xl border border-[#c5a059]/35 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.15)] flex flex-col items-center justify-center">
            {/* Corner Decorative Micro Accents */}
            <span className="absolute top-2 left-2 w-2 h-2 border-t border-l border-[#c5a059]/60" />
            <span className="absolute top-2 right-2 w-2 h-2 border-t border-r border-[#c5a059]/60" />
            <span className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-[#c5a059]/60" />
            <span className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-[#c5a059]/60" />

            {/* Authentic Metallic Gold TOUZA Logo */}
            <TouzaLogo
              className="w-24 sm:w-28 h-auto drop-shadow-[0_4px_16px_rgba(197,160,89,0.45)]"
              variant="metallic"
              animated={true}
              idPrefix="preloader-touza"
            />
          </div>
        </div>

        {/* Brand Name & Identity */}
        <div className="text-center mb-6">
          <h1 className="font-display text-[22px] sm:text-[26px] font-bold text-white tracking-[0.2em] sm:tracking-[0.28em] uppercase drop-shadow-sm mb-1.5">
            {language === 'ar'
              ? storeSettings?.storeNameAr || 'توزا TOUZA'
              : storeSettings?.storeNameEn || 'TOUZA CASUAL'}
          </h1>
          <div className="flex items-center justify-center gap-2">
            <span className="h-[1px] w-6 bg-[#c5a059]/40" />
            <p className="font-label-caps text-[10px] sm:text-[11px] text-[#e2c792] tracking-[0.25em] uppercase font-semibold">
              MEN'S CASUAL WEAR • PORT SAID
            </p>
            <span className="h-[1px] w-6 bg-[#c5a059]/40" />
          </div>
        </div>

        {/* Ultra-Slim Hairline Golden Progress Bar */}
        <div className="w-52 sm:w-60 h-[2.5px] bg-white/10 rounded-full overflow-hidden mb-3 relative">
          <div
            className="h-full bg-gradient-to-r from-[#8c734b] via-[#e2c792] to-[#ffffff] rounded-full transition-all duration-300 ease-out shadow-[0_0_12px_rgba(226,199,146,0.9)] relative"
            style={{ width: `${progress}%` }}
          >
            {/* Radiant glowing tip spark */}
            <span className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#ffffff] -mr-1" />
          </div>
        </div>

        {/* Status Message & Subtle Percentage */}
        <div className="flex items-center justify-between w-52 sm:w-60 text-[11px] text-white/70">
          <span className="font-body text-white/80 tracking-wide truncate transition-opacity duration-300">
            {language === 'ar' ? statusMessage.ar : statusMessage.en}
          </span>
          <span className="text-[#e2c792] font-semibold font-mono text-[12px] shrink-0">
            {progress}%
          </span>
        </div>

        {/* Click to skip discreet hint */}
        <p className="mt-8 text-[10px] text-white/40 tracking-wider hover:text-white/70 transition-colors uppercase">
          {language === 'ar' ? 'انقر في أي مكان للدخول فوراً' : 'Tap anywhere to enter'}
        </p>
      </div>
    </div>
  );
};
