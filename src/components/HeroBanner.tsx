import React, { useEffect, useRef, useState, useCallback, useLayoutEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { StoreSettings } from '../types';
import { SocialLinks } from './SocialLinks';
import { getOptimizedVideoUrl, DEFAULT_HEADER_VIDEO_URL } from '../utils/cloudinary';

interface HeroBannerProps {
  onShopNow: () => void;
  storeSettings?: StoreSettings;
  onVideoReady?: () => void;
}

const isDev = process.env.NODE_ENV !== 'production';

const HeroBannerComponent: React.FC<HeroBannerProps> = ({ onShopNow, storeSettings, onVideoReady }) => {
  const { language, t } = useLanguage();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [usingFallbackVideo, setUsingFallbackVideo] = useState(false);
  const isMountedRef = useRef(true);
  const isPlayingRef = useRef(false);

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

  // Resolve video delivery URL
  const primaryVideoUrl = rawMedia ? getOptimizedVideoUrl(rawMedia) : DEFAULT_HEADER_VIDEO_URL;
  const videoSrc = usingFallbackVideo ? DEFAULT_HEADER_VIDEO_URL : primaryVideoUrl;

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

  // Reset state when rawMedia changes
  useEffect(() => {
    setVideoError(false);
    setUsingFallbackVideo(false);
    isPlayingRef.current = false;
  }, [rawMedia]);

  // Robust programmatic play with promise & retry handling
  const attemptPlay = useCallback((reason = 'direct') => {
    const video = videoRef.current;
    if (!video || !isMountedRef.current) return;

    // Strict Safari / WebKit setup before requesting play
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.volume = 0;
    try {
      video.setAttribute('muted', '');
      video.setAttribute('playsinline', '');
      video.setAttribute('webkit-playsinline', '');
    } catch {}

    if (isDev) {
      console.log(`[Hero Video] attempting autoplay (${reason})`);
    }

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          if (!isMountedRef.current) return;
          isPlayingRef.current = true;
          setIsVideoLoaded(true);
          if (onVideoReady) {
            onVideoReady();
          }
          if (isDev) {
            console.log('[Hero Video] autoplay success via', reason);
          }
        })
        .catch((err) => {
          if (!isMountedRef.current) return;
          if (isDev) {
            console.warn('[Hero Video] autoplay failed (' + reason + '):', err?.name || 'Error', err?.message || err);
          }
        });
    }
  }, [onVideoReady]);

  // Apply strict WebKit / Safari muted properties as soon as DOM mounts
  useLayoutEffect(() => {
    if (isVideo && videoRef.current) {
      const video = videoRef.current;
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      video.volume = 0;
      video.setAttribute('muted', '');
      video.setAttribute('playsinline', '');
      video.setAttribute('webkit-playsinline', '');
      video.setAttribute('x5-playsinline', '');
    }
  }, [isVideo, videoSrc]);

  // Lifecycle listeners and initial play triggers
  useEffect(() => {
    isMountedRef.current = true;

    if (isVideo && videoRef.current) {
      const video = videoRef.current;

      // Ensure video is configured and attempt immediate play
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      video.volume = 0;
      video.setAttribute('muted', '');
      video.setAttribute('playsinline', '');
      video.setAttribute('webkit-playsinline', '');
      video.setAttribute('x5-playsinline', '');

      // Trigger immediate play attempt
      attemptPlay('mounted');

      // Immediate secondary tick
      const initialTimer = setTimeout(() => {
        if (isMountedRef.current && videoRef.current && videoRef.current.paused) {
          attemptPlay('initial-timer-tick');
        }
      }, 100);

      // Desktop Autoplay Unlock: Listen to any user movement/interaction on the entire window/document
      // (Desktop Safari/Chrome allow muted video playback immediately upon any mouse move, scroll, hover, or keydown)
      const handleUserInteraction = () => {
        if (isMountedRef.current && videoRef.current && videoRef.current.paused) {
          attemptPlay('user-interaction');
        }
      };

      const interactionEvents = [
        'mousemove',
        'pointermove',
        'mouseenter',
        'wheel',
        'scroll',
        'touchstart',
        'pointerdown',
        'mousedown',
        'keydown',
        'focus',
      ];

      interactionEvents.forEach((evt) => {
        window.addEventListener(evt, handleUserInteraction, { passive: true, capture: true });
        document.addEventListener(evt, handleUserInteraction, { passive: true, capture: true });
      });

      // Handle pageshow event (Safari bfcache restoration)
      const handlePageShow = (e: PageTransitionEvent) => {
        if (e.persisted && videoRef.current) {
          if (isDev) console.log('[Hero Video] pageshow persisted event, resuming');
          attemptPlay('pageshow');
        }
      };

      // Handle document visibility changes (tab switching / app foreground)
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible' && videoRef.current && videoRef.current.paused) {
          if (isDev) console.log('[Hero Video] tab became visible, resuming autoplay');
          attemptPlay('visibilitychange');
        }
      };

      // Handle window focus
      const handleWindowFocus = () => {
        if (videoRef.current && videoRef.current.paused) {
          attemptPlay('window-focus');
        }
      };

      window.addEventListener('pageshow', handlePageShow);
      window.addEventListener('focus', handleWindowFocus);
      document.addEventListener('visibilitychange', handleVisibilityChange);

      // Periodic check during first 4 seconds to guarantee autoplay kicks in
      const interval = setInterval(() => {
        if (!isMountedRef.current) {
          clearInterval(interval);
          return;
        }
        if (videoRef.current && videoRef.current.paused) {
          attemptPlay('interval-check');
        } else if (videoRef.current && !videoRef.current.paused) {
          clearInterval(interval);
        }
      }, 600);

      return () => {
        isMountedRef.current = false;
        clearTimeout(initialTimer);
        clearInterval(interval);
        window.removeEventListener('pageshow', handlePageShow);
        window.removeEventListener('focus', handleWindowFocus);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        interactionEvents.forEach((evt) => {
          window.removeEventListener(evt, handleUserInteraction, { capture: true });
          document.removeEventListener(evt, handleUserInteraction, { capture: true });
        });
      };
    } else if (!isVideo) {
      setIsVideoLoaded(true);
      if (onVideoReady) onVideoReady();
    }
  }, [isVideo, videoSrc, attemptPlay, onVideoReady]);

  // Handlers for video media events
  const handleLoadedMetadata = () => {
    if (isDev) console.log('[Hero Video] loadedmetadata');
    attemptPlay('loadedmetadata');
  };

  const handleCanPlay = () => {
    if (isDev) console.log('[Hero Video] canplay');
    attemptPlay('canplay');
  };

  const handleCanPlayThrough = () => {
    if (isDev) console.log('[Hero Video] canplaythrough');
    attemptPlay('canplaythrough');
  };

  const handleVideoPlaying = () => {
    isPlayingRef.current = true;
    setIsVideoLoaded(true);
    if (onVideoReady) {
      onVideoReady();
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.currentTime > 0.05 && !isVideoLoaded) {
      isPlayingRef.current = true;
      setIsVideoLoaded(true);
      if (onVideoReady) {
        onVideoReady();
      }
    }
  };

  const handleVideoEnded = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      attemptPlay('loop-restart');
    }
  };

  const handleVideoError = () => {
    const video = videoRef.current;
    if (isDev) {
      console.error('[Hero Video] video error occurred:', {
        src: video?.src,
        currentSrc: video?.currentSrc,
        readyState: video?.readyState,
        networkState: video?.networkState,
        errorCode: video?.error?.code,
        errorMessage: video?.error?.message,
      });
    }

    // If primary video failed and we haven't tried default fallback yet, switch to default fallback
    if (!usingFallbackVideo && videoSrc !== DEFAULT_HEADER_VIDEO_URL) {
      if (isDev) {
        console.warn('[Hero Video] primary video failed, switching to default fallback video');
      }
      setUsingFallbackVideo(true);
      setVideoError(false);
      setTimeout(() => {
        if (videoRef.current) {
          try {
            videoRef.current.load();
            attemptPlay('fallback-switch');
          } catch {}
        }
      }, 50);
    } else {
      setVideoError(true);
      setIsVideoLoaded(true);
      if (onVideoReady) onVideoReady();
    }
  };

  // Section interactive fallback triggers
  const handleSectionInteraction = () => {
    if (videoRef.current && videoRef.current.paused) {
      attemptPlay('section-interaction');
    }
  };

  return (
    <section
      ref={containerRef}
      onMouseEnter={handleSectionInteraction}
      onMouseMove={handleSectionInteraction}
      onPointerDown={handleSectionInteraction}
      onClick={handleSectionInteraction}
      className="relative h-[100dvh] min-h-[550px] sm:min-h-[600px] w-full flex items-end justify-center pb-10 sm:pb-16 md:pb-20 pt-24 sm:pt-28 px-4 overflow-hidden bg-[#0c0c0e] select-none"
    >
      {/* Primary Visual Poster Backdrop (Guarantees elegant visual instantly while media loads) */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none"
        style={{
          backgroundImage: `url('/images/philosophy_model.jpg')`,
        }}
      />

      {/* Hero Media Background Video (Layer 1) */}
      {isVideo && !videoError && (
        <video
          ref={(el) => {
            if (el) {
              el.defaultMuted = true;
              el.muted = true;
              el.playsInline = true;
              el.volume = 0;
              el.setAttribute('muted', '');
              el.setAttribute('playsinline', '');
              el.setAttribute('webkit-playsinline', '');
              el.setAttribute('x5-playsinline', '');
            }
            videoRef.current = el;
          }}
          src={videoSrc}
          poster="/images/philosophy_model.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          disablePictureInPicture
          onLoadedMetadata={handleLoadedMetadata}
          onLoadedData={handleCanPlay}
          onCanPlay={handleCanPlay}
          onCanPlayThrough={handleCanPlayThrough}
          onPlaying={handleVideoPlaying}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleVideoEnded}
          onError={handleVideoError}
          className={`hero-video absolute inset-0 w-full h-full object-cover object-center z-[1] pointer-events-none bg-transparent transition-opacity duration-700 ease-out ${
            isVideoLoaded ? 'opacity-100' : 'opacity-90'
          }`}
        />
      )}

      {/* If mediaUrl is a custom static image URL */}
      {!isVideo && (
        <img
          src={videoSrc}
          alt={heroTitle}
          onError={(e) => {
            e.currentTarget.src = '/images/philosophy_model.jpg';
          }}
          className="absolute inset-0 w-full h-full object-cover object-center z-[1] pointer-events-none"
        />
      )}

      {/* Gradient Overlay covering top navbar down to bottom text for readability (Layer 2) */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/80 z-[2] pointer-events-none" />

      {/* Hero Content positioned elegantly - renders immediately upon page load (Layer 10) */}
      <div className="relative z-10 text-center px-4 flex flex-col items-center max-w-2xl mx-auto pb-2 sm:pb-4 pointer-events-auto">
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


