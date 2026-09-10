import React, { useState, useEffect, useRef } from 'react';
import { TouzaLogo } from './TouzaLogo';
import { Product, Category, StoreSettings } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { getOptimizedImageUrl } from '../utils/cloudinary';

interface StorePreloaderProps {
  products: Product[];
  categories: Category[];
  storeSettings?: StoreSettings;
  isInitialSyncDone?: boolean;
  onFinishLoading: () => void;
}

export const StorePreloader: React.FC<StorePreloaderProps> = ({
  products,
  categories,
  storeSettings,
  isInitialSyncDone = false,
  onFinishLoading,
}) => {
  const { language } = useLanguage();
  const [progress, setProgress] = useState(35);
  const [statusMessage, setStatusMessage] = useState({
    ar: 'جاري تحميل أحدث التشكيلات والمنتجات...',
    en: 'Loading latest collections & products...',
  });
  const [isFadingOut, setIsFadingOut] = useState(false);
  const hasFinishedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    // Fast progressive progress steps
    const t1 = setTimeout(() => {
      if (!isMounted || hasFinishedRef.current) return;
      setProgress(65);
    }, 150);

    const t2 = setTimeout(() => {
      if (!isMounted || hasFinishedRef.current) return;
      setProgress(85);
      setStatusMessage({
        ar: 'جاري تجهيز العرض الفاخر...',
        en: 'Preparing luxury storefront...',
      });
    }, 350);

    // Function to gracefully finalize and fade out
    const finishAndDismiss = () => {
      if (hasFinishedRef.current || !isMounted) return;
      hasFinishedRef.current = true;

      setProgress(100);
      setStatusMessage({
        ar: 'مرحباً بك في توزا كاجوال',
        en: 'Welcome to TOUZA',
      });

      // Quick smooth fade out
      setTimeout(() => {
        if (!isMounted) return;
        setIsFadingOut(true);

        setTimeout(() => {
          if (!isMounted) return;
          onFinishLoading();
        }, 250);
      }, 150);
    };

    // Preload hero banner in background without blocking
    if (storeSettings?.heroImageUrl && !storeSettings.heroImageUrl.endsWith('.mp4')) {
      const img = new Image();
      img.src = storeSettings.heroImageUrl;
    }

    // If initial sync is already finished, complete quickly
    if (isInitialSyncDone) {
      const finishTimer = setTimeout(finishAndDismiss, 400);
      return () => {
        isMounted = false;
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(finishTimer);
      };
    }

    // Safety timeout: Maximum 800ms total preloader time under all conditions
    const safetyTimer = setTimeout(() => {
      finishAndDismiss();
    }, 750);

    return () => {
      isMounted = false;
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(safetyTimer);
    };
  }, [isInitialSyncDone, onFinishLoading, storeSettings?.heroImageUrl]);

  return (
    <div
      className={`fixed inset-0 z-[99999] bg-[#0c0c0d] text-white flex flex-col items-center justify-center p-6 transition-all duration-700 ease-out select-none ${
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
