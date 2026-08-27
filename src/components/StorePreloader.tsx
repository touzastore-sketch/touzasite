import React, { useState, useEffect } from 'react';
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
  const [progress, setProgress] = useState(25);
  const [statusMessage, setStatusMessage] = useState({
    ar: 'جاري الاتصال بقاعدة بيانات توزا...',
    en: 'Connecting to TOUZA database...',
  });
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const startTime = Date.now();

    // Step 1: Connecting & syncing state progression
    const t1 = setTimeout(() => {
      if (!isMounted) return;
      setProgress((prev) => Math.max(prev, 55));
      setStatusMessage({
        ar: 'جاري تحميل أحدث المنتجات والتحديثات...',
        en: 'Loading latest products & updates...',
      });
    }, 350);

    // Step 2: Preload critical visuals (Hero + first top products) once data is synchronized or after short safety period
    const preloadVisualsAndFinish = async () => {
      const urlsToPreload: string[] = [];

      // Hero banner image (if static image)
      if (storeSettings?.heroImageUrl && !storeSettings.heroImageUrl.endsWith('.mp4')) {
        urlsToPreload.push(storeSettings.heroImageUrl);
      }

      // First batch of product images
      if (products && products.length > 0) {
        products.slice(0, 6).forEach((prod) => {
          const rawImg = prod.colors?.[0]?.imageUrl || prod.images?.[0];
          if (rawImg && rawImg.trim()) {
            urlsToPreload.push(getOptimizedImageUrl(rawImg, { width: 500, quality: 'auto:good' }));
          }
        });
      }

      // Preload categories icons/images
      if (categories && categories.length > 0) {
        categories.slice(0, 4).forEach((cat) => {
          if (cat.imageUrl) {
            urlsToPreload.push(getOptimizedImageUrl(cat.imageUrl, { width: 400 }));
          }
        });
      }

      // Execute non-blocking image preloading
      const promises = urlsToPreload.map((url) => {
        return new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => resolve(); // Don't block if one image fails
          img.src = url;
        });
      });

      // Wait for images with 2.0s maximum timeout
      await Promise.race([
        Promise.all(promises),
        new Promise((resolve) => setTimeout(resolve, 2000)),
      ]);

      if (!isMounted) return;

      setProgress(90);
      setStatusMessage({
        ar: 'جاري تهيئة العرض والصور الفاخرة...',
        en: 'Finalizing luxury visuals...',
      });

      // Ensure minimum 800ms total smooth experience for luxury feel
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, 850 - elapsed);

      setTimeout(() => {
        if (!isMounted) return;
        setProgress(100);
        setStatusMessage({
          ar: 'مرحباً بك في توزا كاجوال',
          en: 'Welcome to TOUZA',
        });

        // Trigger smooth fade out
        setTimeout(() => {
          if (!isMounted) return;
          setIsFadingOut(true);

          setTimeout(() => {
            if (!isMounted) return;
            onFinishLoading();
          }, 500);
        }, 300);
      }, remainingTime);
    };

    // If initial live sync is done or when it becomes true
    if (isInitialSyncDone) {
      preloadVisualsAndFinish();
    } else {
      // Wait for isInitialSyncDone with a maximum 2-second fallback timeout
      const syncWaitTimer = setTimeout(() => {
        if (isMounted) {
          preloadVisualsAndFinish();
        }
      }, 2000);

      return () => {
        isMounted = false;
        clearTimeout(t1);
        clearTimeout(syncWaitTimer);
      };
    }

    // Absolute fallback safety timeout (3.5 seconds max)
    const safetyTimeout = setTimeout(() => {
      if (!isMounted) return;
      setProgress(100);
      setIsFadingOut(true);
      setTimeout(() => {
        if (isMounted) onFinishLoading();
      }, 400);
    }, 3500);

    return () => {
      isMounted = false;
      clearTimeout(t1);
      clearTimeout(safetyTimeout);
    };
  }, [isInitialSyncDone, products.length, categories.length, storeSettings?.heroImageUrl, onFinishLoading]);

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
