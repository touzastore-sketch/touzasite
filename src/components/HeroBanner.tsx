import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { StoreSettings } from '../types';
import { SocialLinks } from './SocialLinks';
import { getOptimizedVideoUrl } from '../utils/cloudinary';

interface HeroBannerProps {
  onShopNow: () => void;
  storeSettings?: StoreSettings;
  onVideoReady?: () => void;
}

const HeroBannerComponent: React.FC<HeroBannerProps> = ({ onShopNow, storeSettings, onVideoReady }) => {
  const { language, t } = useLanguage();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const heroTitle = (language === 'ar'
    ? storeSettings?.heroTitleAr
    : storeSettings?.heroTitleEn
  )?.trim() || (language === 'ar' ? 'ستايلك يبدأ من هنا' : 'Your Style Starts Here');

  const heroSubtitle = (language === 'ar'
    ? storeSettings?.heroSubtitleAr
    : storeSettings?.heroSubtitleEn
  )?.trim() || (language === 'ar' ? 'تشكيلة رجالية مميزة صُممت بعناية لتمنحك إطلالة أنيقة وعصرية تناسب مختلف المناسبات، مع اختيارات تجمع بين الجودة، الراحة، والأناقة في كل تفصيلة.' : 'A distinctive men’s collection crafted with care to give you a stylish and modern look for all occasions, combining quality, comfort, and elegance in every detail.');

  const heroBadge = (language === 'ar'
    ? storeSettings?.heroBadgeAr
    : storeSettings?.heroBadgeEn
  )?.trim() || (language === 'ar' ? 'تشكيلة توزا الرجالية • بورسعيد ومصر' : 'TOUZA MENSWEAR • EGYPT');

  const rawMedia = storeSettings?.heroImageUrl?.trim();

  // Reset video error state whenever rawMedia changes so new uploaded videos are attempted
  useEffect(() => {
    setVideoError(false);
  }, [rawMedia]);

  // Default to hero video if rawMedia is missing
  let mediaUrl = '/hero-video.mp4';
  if (rawMedia) {
    mediaUrl = getOptimizedVideoUrl(rawMedia);
  }

  let videoSrc = mediaUrl.startsWith('http')
    ? mediaUrl
    : mediaUrl.startsWith('/')
    ? mediaUrl
    : '/' + mediaUrl;

  if (videoError && videoSrc !== '/hero-video.mp4') {
    videoSrc = '/hero-video.mp4';
  }

  const mediaLower = videoSrc.toLowerCase();
  const isVideo =
    mediaLower.includes('.mp4') ||
    mediaLower.includes('.webm') ||
    mediaLower.includes('.ogg') ||
    mediaLower.includes('.mov') ||
    mediaLower.includes('.m4v') ||
    mediaLower.includes('video') ||
    mediaLower.includes('hero') ||
    mediaLower.includes('desert') ||
    mediaLower.includes('soli') ||
    !mediaLower.match(/\.(jpg|jpeg|png|webp|gif|svg)$/);

  const handleVideoEnded = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  const handleVideoPlaying = () => {
    setIsVideoLoaded(true);
    if (onVideoReady) {
      onVideoReady();
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.currentTime > 0.05) {
      setIsVideoLoaded(true);
      if (onVideoReady) {
        onVideoReady();
      }
    }
  };

  const handleReady = () => {
    if (videoRef.current) {
      const v = videoRef.current;
      // If video has already buffered and ready to play without stalling
      if (v.readyState >= 3 && v.currentTime > 0) {
        setIsVideoLoaded(true);
        if (onVideoReady) {
          onVideoReady();
        }
      }
    } else {
      setIsVideoLoaded(true);
      if (onVideoReady) {
        onVideoReady();
      }
    }
  };

  useEffect(() => {
    let isMounted = true;
    let fallbackTimer: NodeJS.Timeout;

    if (isVideo && videoRef.current) {
      const videoEl = videoRef.current;
      videoEl.defaultMuted = true;
      videoEl.muted = true;
      videoEl.playsInline = true;
      videoEl.setAttribute('playsinline', 'true');
      videoEl.setAttribute('webkit-playsinline', 'true');
      videoEl.setAttribute('x5-playsinline', 'true');

      const playVideo = () => {
        if (!isMounted || !videoRef.current) return;
        videoRef.current.defaultMuted = true;
        videoRef.current.muted = true;
        videoRef.current.playsInline = true;
        
        const promise = videoRef.current.play();
        if (promise !== undefined) {
          promise.then(() => {
            if (isMounted) {
              setIsVideoLoaded(true);
              if (onVideoReady) onVideoReady();
            }
          }).catch((err) => {
            console.log('Autoplay status:', err);
          });
        }
      };

      // Trigger video load & play
      try {
        videoEl.load();
      } catch {}
      playVideo();

      // Graceful fallback for low power mode or restricted background autoplay
      fallbackTimer = setTimeout(() => {
        if (isMounted) {
          setIsVideoLoaded(true);
          if (onVideoReady) onVideoReady();
        }
      }, 3500);

      const handleUserInteraction = () => {
        playVideo();
      };

      window.addEventListener('touchstart', handleUserInteraction, { passive: true });
      window.addEventListener('click', handleUserInteraction, { passive: true });
      window.addEventListener('scroll', handleUserInteraction, { passive: true });

      return () => {
        isMounted = false;
        clearTimeout(fallbackTimer);
        window.removeEventListener('touchstart', handleUserInteraction);
        window.removeEventListener('click', handleUserInteraction);
        window.removeEventListener('scroll', handleUserInteraction);
      };
    } else if (!isVideo) {
      setIsVideoLoaded(true);
      if (onVideoReady) onVideoReady();
    }
  }, [mediaUrl, isVideo]);

  return (
    <section className="relative h-[100dvh] min-h-[550px] sm:min-h-[600px] w-full flex items-end justify-center pb-10 sm:pb-16 md:pb-20 pt-24 sm:pt-28 px-4 overflow-hidden bg-[#0c0c0e]">
      {/* Primary Visual Poster Backdrop */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none"
        style={{
          backgroundImage: `url('/images/philosophy_model.jpg')`,
        }}
      />

      {/* Hero Media Background Video */}
      {isVideo && (
        <video
          key={videoSrc}
          ref={videoRef}
          src={videoSrc}
          poster="/images/philosophy_model.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onEnded={handleVideoEnded}
          onLoadedData={handleReady}
          onCanPlay={handleReady}
          onPlay={handleReady}
          onPlaying={handleVideoPlaying}
          onTimeUpdate={handleTimeUpdate}
          onError={(e) => {
            console.error('Hero video load issue for URL:', videoSrc, e);
            if (!videoError && videoSrc !== '/hero-video.mp4') {
              setVideoError(true);
            }
            handleReady();
          }}
          className="hero-video absolute inset-0 w-full h-full object-cover object-center z-1 bg-transparent opacity-100 transition-opacity duration-500"
        >
          <source src={videoSrc} type="video/mp4" />
          {rawMedia && rawMedia !== videoSrc && <source src={rawMedia} />}
        </video>
      )}

      {/* If mediaUrl is a custom static image URL */}
      {!isVideo && (
        <img
          src={videoSrc}
          alt={heroTitle}
          onError={(e) => {
            e.currentTarget.src = '/images/philosophy_model.jpg';
          }}
          className="absolute inset-0 w-full h-full object-cover object-center z-1"
        />
      )}

      {/* Gradient Overlay covering top navbar down to bottom text for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/80 z-2 pointer-events-none" />

      {/* Hero Content positioned elegantly - renders immediately upon page load */}
      <div className="relative z-10 text-center px-4 flex flex-col items-center max-w-2xl mx-auto pb-2 sm:pb-4">
        <span className="font-label-caps text-white/95 text-[11px] md:text-[13px] tracking-widest mb-3 bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 shadow-xs">
          {heroBadge}
        </span>
        <h1 className="font-display text-[28px] sm:text-[36px] md:text-[52px] text-white mb-3 drop-shadow-lg font-bold leading-tight">
          {heroTitle}
        </h1>
        <p className="font-body text-[14px] sm:text-[16px] md:text-[18px] text-white/90 max-w-lg mx-auto mb-7 drop-shadow-md leading-relaxed">
          {heroSubtitle}
        </p>
        <button
          onClick={onShopNow}
          className="inline-block bg-white text-black font-label-caps py-3.5 px-9 rounded-xl hover:bg-[#f0f0f0] transition-all duration-300 cursor-pointer shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 text-[14px] md:text-[15px] font-bold"
        >
          {t('hero.shopNow', 'Shop Collection')}
        </button>
      </div>

      {/* Floating Vertical Social Icons */}
      <SocialLinks variant="floating-hero" storeSettings={storeSettings} />
    </section>
  );
};

export const HeroBanner = React.memo(HeroBannerComponent);

