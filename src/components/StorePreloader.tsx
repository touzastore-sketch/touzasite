import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TouzaLogo } from './TouzaLogo';
import { Product, Category, StoreSettings } from '../types';
import { useLanguage } from '../context/LanguageContext';

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
  isInitialSyncDone = false,
  isHomeView = true,
  onFinishLoading,
}) => {
  const { language } = useLanguage();
  const [progress, setProgress] = useState(28);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [minDisplayPassed, setMinDisplayPassed] = useState(false);

  const hasDismissedRef = useRef(false);
  const onFinishLoadingRef = useRef(onFinishLoading);
  onFinishLoadingRef.current = onFinishLoading;

  const dismiss = useCallback(() => {
    if (hasDismissedRef.current) return;
    hasDismissedRef.current = true;
    setProgress(100);
    setIsFadingOut(true);

    setTimeout(() => {
      onFinishLoadingRef.current();
    }, 380);
  }, []);

  // Brief, unhurried minimum presentation so the brand emblem lands cleanly
  useEffect(() => {
    const minTimer = setTimeout(() => {
      setMinDisplayPassed(true);
    }, 850);
    return () => clearTimeout(minTimer);
  }, []);

  // Maximum ceiling so visitors are never delayed
  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      dismiss();
    }, 3200);

    const handlePageShow = () => dismiss();
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      clearTimeout(safetyTimer);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [dismiss]);

  useEffect(() => {
    const t1 = setTimeout(() => setProgress((p) => Math.max(p, 62)), 200);
    const t2 = setTimeout(() => setProgress((p) => Math.max(p, 88)), 520);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    if (!isHomeView) {
      dismiss();
      return;
    }

    if (minDisplayPassed && (isInitialSyncDone || products.length > 0)) {
      dismiss();
    }
  }, [isHomeView, minDisplayPassed, isInitialSyncDone, products.length, dismiss]);

  return (
    <div
      onClick={dismiss}
      role="dialog"
      aria-label="Loading TOUZA"
      className={`fixed inset-0 z-[99999] bg-[#faf9f7] text-[#111111] flex flex-col items-center justify-center p-6 transition-opacity duration-400 ease-out select-none cursor-pointer ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center max-w-xs w-full">
        {/* Clean Minimalist Emblem */}
        <div className="mb-6">
          <TouzaLogo
            className="w-20 sm:w-24 h-auto"
            variant="dark"
            animated={false}
            idPrefix="preloader-scandi-touza"
          />
        </div>

        {/* Crisp Editorial Wordmark */}
        <span className="brand-wordmark text-[30px] sm:text-[34px] font-medium text-[#111111] mb-2">
          TOUZA
        </span>

        <p className="font-body text-[12px] tracking-[0.14em] text-[#6e6c68] uppercase mb-8">
          {language === 'ar' ? 'أزياء كاجوال رجالية' : 'EVERYDAY ESSENTIALS'}
        </p>

        {/* Razor-Thin 1px Architectural Progress Line */}
        <div className="w-40 h-[1px] bg-[#e2dfd9] overflow-hidden relative">
          <div
            className="h-full bg-[#111111] transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
