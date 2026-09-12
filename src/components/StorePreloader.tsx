import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TouzaLogo } from './TouzaLogo';
import { Product, Category, StoreSettings } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { DEFAULT_HEADER_VIDEO_URL, getOptimizedImageUrl, getVideoPosterUrl } from '../utils/cloudinary';

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
  const [progress, setProgress] = useState(35);
  const [statusMessage, setStatusMessage] = useState({
    ar: 'جاري تحميل أحدث التشكيلات والمنتجات...',
    en: 'Loading latest collections & products...',
  });
  const [isFadingOut, setIsFadingOut] = useState(false);

  const [isPosterReady, setIsPosterReady] = useState(false);
  const [minDisplayPassed, setMinDisplayPassed] = useState(false);

  // Guarantee that finish callback runs only once and is never interrupted by re-renders
  const hasDismissedRef = useRef(false);
  const onFinishLoadingRef = useRef(onFinishLoading);
  onFinishLoadingRef.current = onFinishLoading;

  const dismiss = useCallback(() => {
    if (hasDismissedRef.current) return;
    hasDismissedRef.current = true;

    setProgress(100);
    setStatusMessage({
      ar: 'مرحباً بك في توزا كاجوال',
      en: 'Welcome to TOUZA',
    });

    setIsFadingOut(true);

    setTimeout(() => {
      onFinishLoadingRef.current();
    }, 220);
  }, []);

  // 1. Minimum display time to ensure luxury presentation and smooth progress (1100ms)
  useEffect(() => {
    const minTimer = setTimeout(() => {
      setMinDisplayPassed(true);
    }, 1100);
    return () => clearTimeout(minTimer);
  }, []);

  // 2. Absolute safety ceiling: never trap the user for more than 4000ms
  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      dismiss();
    }, 4000);

    // Safari BFCache restoration handler (e.g. user navigating back or re-entering tab)
    const handlePageShow = () => {
      dismiss();
    };

    window.addEventListener('pageshow', handlePageShow);

    return () => {
      clearTimeout(safetyTimer);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [dismiss]);

  // 3. Progressive animated progress bar
  useEffect(() => {
    const t1 = setTimeout(() => setProgress((p) => Math.max(p, 55)), 150);
    const t2 = setTimeout(() => {
      setProgress((p) => Math.max(p, 80));
      setStatusMessage({
        ar: 'جاري تجهيز العرض الفاخر...',
        en: 'Preparing luxury storefront...',
      });
    }, 450);
    const t3 = setTimeout(() => setProgress((p) => Math.max(p, 92)), 850);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  // 4. Preload hero banner poster image to ensure instantaneous rendering
  useEffect(() => {
    const heroUrl = storeSettings?.heroImageUrl?.trim() || '';
    const posterUrl =
      getVideoPosterUrl(heroUrl) ||
      getVideoPosterUrl(DEFAULT_HEADER_VIDEO_URL) ||
      '/images/philosophy_model.jpg';

    if (posterUrl) {
      const img = new Image();
      img.src = posterUrl;
      img.onload = () => setIsPosterReady(true);
      img.onerror = () => setIsPosterReady(true);
    } else {
      setIsPosterReady(true);
    }
  }, [storeSettings?.heroImageUrl]);

  // 5. Intelligent dismissal: dismiss once initial sync is complete, media is ready, and minimum duration passed
  useEffect(() => {
    // If not on home page (e.g. /admin, /shop, /checkout), dismiss immediately
    if (!isHomeView) {
      dismiss();
      return;
    }

    // When both store data is synced from Firestore and either video or poster is ready
    if (isInitialSyncDone && minDisplayPassed && (isVideoReady || isPosterReady)) {
      dismiss();
      return;
    }

    // If initial sync and minimum time are done, allow up to 1.8s for video streaming before revealing
    if (isInitialSyncDone && minDisplayPassed) {
      const videoWaitTimer = setTimeout(() => {
        dismiss();
      }, 1800);
      return () => clearTimeout(videoWaitTimer);
    }
  }, [isHomeView, isInitialSyncDone, minDisplayPassed, isVideoReady, isPosterReady, dismiss]);

  return (
    <div
      onClick={dismiss}
      role="button"
      tabIndex={0}
      aria-label="Skip loading"
      className={`fixed inset-0 z-[99999] bg-[#0c0c0d] text-white flex flex-col items-center justify-center p-6 transition-all duration-500 ease-out select-none cursor-pointer ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      style={{
        backgroundImage: 'radial-gradient(circle at 50% 45%, #1c1c1f 0%, #0c0c0d 75%)',
      }}
    >
      {/* Subtle Golden Ambient Glow Behind Logo */}
      <div className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-[#c5a059]/10 blur-3xl pointer-events-none animate-pulse" />

      <div className="relative z-10 flex flex-col items-center max-w-sm w-full">
        {/* Animated Brand Logo Container */}
        <div className="relative mb-8 p-3 sm:p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-[#c5a059]/30 shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
          {/* Subtle animated border ping */}
          <div className="absolute -inset-1 rounded-2xl border border-[#c5a059]/20 animate-ping opacity-40 pointer-events-none" />

          <TouzaLogo
            className="w-28 sm:w-36 h-auto drop-shadow-[0_4px_12px_rgba(197,160,89,0.35)]"
            variant="gold"
            animated={true}
          />
        </div>

        {/* Brand Tagline */}
        <div className="text-center mb-6">
          <h2 className="font-display text-[20px] sm:text-[22px] font-bold text-white tracking-wider mb-1">
            {language === 'ar'
              ? storeSettings?.storeNameAr || 'توزا TOUZA'
              : storeSettings?.storeNameEn || 'TOUZA CASUAL'}
          </h2>
          <p className="font-label-caps text-[11px] sm:text-[12px] text-[#c5a059] tracking-[0.25em] uppercase font-semibold">
            PORT SAID • EGYPT
          </p>
        </div>

        {/* Elegant Progress Bar */}
        <div className="w-56 sm:w-64 h-1.5 bg-white/10 rounded-full overflow-hidden mb-3.5 p-0.5 border border-white/5 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-[#8c734b] via-[#c5a059] to-[#f4e8d1] rounded-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(197,160,89,0.8)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Status Text & Percentage */}
        <div className="flex items-center justify-between w-56 sm:w-64 text-[11px] sm:text-[12px] text-white/70 font-mono">
          <span className="font-body tracking-normal truncate pr-2">
            {language === 'ar' ? statusMessage.ar : statusMessage.en}
          </span>
          <span className="text-[#c5a059] font-bold shrink-0">{progress}%</span>
        </div>
      </div>
    </div>
  );
};
