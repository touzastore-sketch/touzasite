import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export interface TouzaBagCatchDetail {
  productName?: string;
  size?: string;
  color?: string;
  imageUrl?: string;
}

interface FloatingTouzaBagProps {
  cartCount: number;
  totalAmount?: number;
  onOpenCart: () => void;
  hidden?: boolean;
}

export const FloatingTouzaBag: React.FC<FloatingTouzaBagProps> = ({
  cartCount,
  totalAmount,
  onOpenCart,
  hidden = false,
}) => {
  const { language, formatPrice } = useLanguage();
  const isAr = language === 'ar';

  // Animation states (compositor-only GPU transforms)
  const [catchKey, setCatchKey] = useState(0);
  const [motionState, setMotionState] = useState<{
    key: number;
    type: 'none' | 'catch' | 'nudge';
  }>({ key: 0, type: 'none' });
  const [isPreparing, setIsPreparing] = useState(false);
  const [recentItem, setRecentItem] = useState<TouzaBagCatchDetail | null>(null);

  // Refs for physics-inspired scroll pendulum sway (direct DOM transform, 0 re-renders)
  const swayWrapperRef = useRef<HTMLDivElement>(null);
  const lastScrollYRef = useRef<number>(0);
  const targetAngleRef = useRef<number>(0);
  const currentAngleRef = useRef<number>(0);
  const rafIdRef = useRef<number | null>(null);
  const slipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prepareTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Smooth passive scroll pendulum inertia — bag gently swings as customer browses
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const prefersReducedMotion =
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    lastScrollYRef.current = window.scrollY;

    const animateSway = () => {
      // Exponentially damp target back toward 0 and spring current toward target
      targetAngleRef.current *= 0.86;
      currentAngleRef.current += (targetAngleRef.current - currentAngleRef.current) * 0.16;

      if (swayWrapperRef.current) {
        const angle = currentAngleRef.current;
        const liftY = -Math.min(Math.abs(angle) * 0.45, 3);
        swayWrapperRef.current.style.transform = `translate3d(0, ${liftY.toFixed(2)}px, 0) rotate(${angle.toFixed(2)}deg)`;
      }

      if (Math.abs(currentAngleRef.current) > 0.04 || Math.abs(targetAngleRef.current) > 0.04) {
        rafIdRef.current = requestAnimationFrame(animateSway);
      } else {
        if (swayWrapperRef.current) {
          swayWrapperRef.current.style.transform = 'translate3d(0, 0, 0) rotate(0deg)';
        }
        rafIdRef.current = null;
      }
    };

    const handleScroll = () => {
      const nowY = window.scrollY;
      const delta = nowY - lastScrollYRef.current;
      lastScrollYRef.current = nowY;

      // Clamp pendulum swing to an elegant, restrained luxury arc (-7.5deg to +7.5deg)
      const impulse = Math.max(-7.5, Math.min(7.5, delta * 0.14));
      targetAngleRef.current = Math.max(
        -8,
        Math.min(8, targetAngleRef.current * 0.55 + impulse)
      );

      if (rafIdRef.current === null) {
        rafIdRef.current = requestAnimationFrame(animateSway);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  // Listen for product selection nudge, incoming flight preparation, and catch landing
  useEffect(() => {
    const handleIncoming = () => {
      setIsPreparing(true);
      if (prepareTimeoutRef.current) clearTimeout(prepareTimeoutRef.current);
      prepareTimeoutRef.current = setTimeout(() => {
        setIsPreparing(false);
      }, 750);
    };

    const handleCatch = (e: Event) => {
      const custom = e as CustomEvent<TouzaBagCatchDetail | undefined>;
      setIsPreparing(false);
      if (prepareTimeoutRef.current) clearTimeout(prepareTimeoutRef.current);
      setCatchKey((prev) => prev + 1);
      setMotionState((prev) => ({ key: prev.key + 1, type: 'catch' }));

      if (custom.detail && (custom.detail.productName || custom.detail.imageUrl)) {
        setRecentItem(custom.detail);
        if (slipTimeoutRef.current) clearTimeout(slipTimeoutRef.current);
        slipTimeoutRef.current = setTimeout(() => {
          setRecentItem(null);
        }, 3600);
      }
    };

    const handleNudge = () => {
      setMotionState((prev) => ({ key: prev.key + 1, type: 'nudge' }));
    };

    window.addEventListener('touza_bag_incoming', handleIncoming);
    window.addEventListener('touza_bag_catch', handleCatch);
    window.addEventListener('touza_bag_nudge', handleNudge);

    return () => {
      window.removeEventListener('touza_bag_incoming', handleIncoming);
      window.removeEventListener('touza_bag_catch', handleCatch);
      window.removeEventListener('touza_bag_nudge', handleNudge);
      if (slipTimeoutRef.current) clearTimeout(slipTimeoutRef.current);
      if (prepareTimeoutRef.current) clearTimeout(prepareTimeoutRef.current);
    };
  }, []);

  if (hidden) return null;

  return (
    <div
      className="fixed bottom-4 sm:bottom-5 left-4 sm:left-5 z-[85] flex items-end gap-2.5 dir-ltr select-none pointer-events-none"
      aria-live="polite"
    >
      {/* Interactive Branded TOUZA Boutique Bag Button */}
      <div
        ref={swayWrapperRef}
        className="pointer-events-auto will-change-transform"
        style={{ transformOrigin: '50% 10%' }}
      >
        <button
          id="floating-touza-bag"
          type="button"
          onClick={() => {
            setRecentItem(null);
            onOpenCart();
          }}
          aria-label={
            isAr
              ? `حقيبة تسوق توزا (${cartCount} قطعة)`
              : `TOUZA Shopping Bag (${cartCount} items)`
          }
          title={isAr ? 'حقيبة تسوق توزا' : 'TOUZA Shopping Bag'}
          className={`group relative flex flex-col items-center justify-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9c8563] focus-visible:ring-offset-2 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isPreparing
              ? 'scale-[1.12] -translate-y-1.5 -rotate-[5deg]'
              : 'hover:-translate-y-1 hover:scale-[1.04] active:scale-95'
          }`}
        >
          {/* Animated Catch / Nudge Motion Layer */}
          <div
            key={`motion-${motionState.key}`}
            className={`relative w-[56px] h-[66px] sm:w-[64px] sm:h-[74px] ${
              motionState.type === 'catch'
                ? 'animate-touza-bag-catch'
                : motionState.type === 'nudge'
                ? 'animate-touza-bag-nudge'
                : ''
            }`}
            style={{ transformOrigin: '50% 14%' }}
          >
            {/* Subtle Ambient Floor Shadow */}
            <div
              aria-hidden="true"
              className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-[78%] h-[7px] rounded-full bg-black/28 blur-[4px] transition-all duration-300 ${
                isPreparing ? 'scale-x-75 opacity-45' : 'group-hover:scale-x-90 opacity-70'
              }`}
            />

            {/* Bespoke Architectural TOUZA Luxury Boutique Paper Bag SVG */}
            <svg
              viewBox="0 0 84 96"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full drop-shadow-[0_10px_20px_rgba(0,0,0,0.22)] overflow-visible"
              aria-hidden="true"
            >
              <defs>
                {/* Matte Obsidian Paper Body Gradient */}
                <linearGradient id="touzaBagBodyGrad" x1="8" y1="22" x2="72" y2="90" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#1b1a18" />
                  <stop offset="55%" stopColor="#111110" />
                  <stop offset="100%" stopColor="#090908" />
                </linearGradient>

                {/* Architectural Folded Side Gusset */}
                <linearGradient id="touzaBagGussetGrad" x1="68" y1="24" x2="78" y2="88" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#2c2924" />
                  <stop offset="100%" stopColor="#181715" />
                </linearGradient>

                {/* Warm Antique Champagne Gold Foil */}
                <linearGradient id="touzaGoldFoil" x1="16" y1="44" x2="64" y2="68" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#e8d8ba" />
                  <stop offset="50%" stopColor="#cbb288" />
                  <stop offset="100%" stopColor="#f0e4cc" />
                </linearGradient>

                {/* Clip for Diagonal Gold Sheen Sweep */}
                <clipPath id="touzaBagFrontClip">
                  <path d="M10 26H68L70 88H8L10 26Z" />
                </clipPath>
              </defs>

              {/* Back Ribbon Handle (depth layer) */}
              <path
                d="M30 27C30 13.5 34.8 7 42 7C49.2 7 54 13.5 54 27"
                stroke="#3a362f"
                strokeWidth="2.6"
                strokeLinecap="round"
              />

              {/* Interior Top Paper Opening (visible when catching product) */}
              <path
                d="M10 26L15 21H71L76 26H10Z"
                fill="#292622"
                stroke="#433d34"
                strokeWidth="0.7"
              />
              {/* Subtle Tissue Paper Peek Inside Bag */}
              <path
                d={
                  isPreparing
                    ? 'M20 24L31 15L42 22L54 14L63 24H20Z'
                    : 'M22 25L32 19L42 24L53 18.5L62 25H22Z'
                }
                fill="#f6f3ec"
                fillOpacity={isPreparing ? '0.95' : '0.82'}
                className="transition-all duration-300"
              />

              {/* Right Folded 3D Side Gusset */}
              <path
                d="M68 26L76 26L77.5 84.5L70 88L68 26Z"
                fill="url(#touzaBagGussetGrad)"
              />
              {/* Gusset Crease Line */}
              <path
                d="M72.5 26L74 86.2"
                stroke="#0c0c0b"
                strokeWidth="0.8"
                strokeOpacity="0.65"
              />

              {/* Front Matte Obsidian Paper Bag Body */}
              <path
                d="M10 26H68L70 88H8L10 26Z"
                fill="url(#touzaBagBodyGrad)"
                stroke="#2c2924"
                strokeWidth="0.85"
              />

              {/* Folded Top Cuff Shadow Line */}
              <path
                d="M10 33.5H68.2"
                stroke="#c8b08a"
                strokeOpacity="0.22"
                strokeWidth="0.75"
              />

              {/* Engraved Inner Double Hairline Frame */}
              <path
                d="M14.5 31H63.5L65 83H13L14.5 31Z"
                stroke="url(#touzaGoldFoil)"
                strokeOpacity="0.42"
                strokeWidth="0.75"
              />

              {/* Front Braided Cord Handle + Gold Eyelets */}
              <path
                d="M26.5 30.5C26.5 14 32 6 39 6C46 6 51.5 14 51.5 30.5"
                stroke="#111110"
                strokeWidth="3.6"
                strokeLinecap="round"
              />
              <path
                d="M26.5 30.5C26.5 14 32 6 39 6C46 6 51.5 14 51.5 30.5"
                stroke="#d6c09a"
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeOpacity="0.85"
              />
              <circle cx="26.5" cy="30.5" r="2.2" fill="#0d0d0c" stroke="#cbb288" strokeWidth="1" />
              <circle cx="51.5" cy="30.5" r="2.2" fill="#0d0d0c" stroke="#cbb288" strokeWidth="1" />

              {/* Foil-Stamped TOUZA Luxury Wordmark */}
              <text
                x="39"
                y="58.5"
                textAnchor="middle"
                fill="url(#touzaGoldFoil)"
                fontFamily="'Playfair Display', Georgia, serif"
                fontSize="12.2"
                fontWeight="600"
                letterSpacing="2.1"
              >
                TOUZA
              </text>

              {/* Delicate Heritage Diamond & Est. Hairline */}
              <line x1="25" y1="65" x2="35.5" y2="65" stroke="#cbb288" strokeOpacity="0.55" strokeWidth="0.6" />
              <polygon points="39,63.2 40.8,65 39,66.8 37.2,65" fill="#d8c4a0" />
              <line x1="42.5" y1="65" x2="53" y2="65" stroke="#cbb288" strokeOpacity="0.55" strokeWidth="0.6" />

              <text
                x="39"
                y="73.2"
                textAnchor="middle"
                fill="#b8a586"
                fontFamily="'Plus Jakarta Sans', sans-serif"
                fontSize="4.6"
                fontWeight="500"
                letterSpacing="1.6"
              >
                MENSWEAR
              </text>

              {/* Diagonal Gold Foil Shimmer Sweep on Catch / Hover */}
              <g clipPath="url(#touzaBagFrontClip)">
                <rect
                  key={`sheen-${catchKey}`}
                  x="-36"
                  y="20"
                  width="24"
                  height="78"
                  transform="skewX(-22)"
                  fill="url(#touzaGoldFoil)"
                  fillOpacity="0.32"
                  className={
                    catchKey > 0
                      ? 'animate-touza-foil-sweep'
                      : 'opacity-0 group-hover:animate-touza-foil-sweep'
                  }
                />
              </g>
            </svg>

            {/* Live Item Count Architectural Tag */}
            {cartCount > 0 && (
              <span
                key={`count-${cartCount}-${catchKey}`}
                className="absolute top-[13px] -right-1 min-w-[21px] h-[21px] px-1.5 bg-[#f8f6f1] text-[#111111] border border-[#9c8563] text-[10.5px] font-semibold tabular-nums flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.22)] animate-cart-bounce"
              >
                {cartCount}
              </span>
            )}

            {/* Floating Champagne +1 Rising Out of the Bag Mouth on Catch */}
            {catchKey > 0 && (
              <span
                key={`plus-${catchKey}`}
                aria-hidden="true"
                className="pointer-events-none absolute top-0 left-1/2 font-editorial text-[13px] font-semibold text-[#111111] bg-[#f8f6f1]/95 border border-[#c8b08a] px-1.5 py-0.5 shadow-sm animate-cart-plus-one"
              >
                +1
              </span>
            )}
          </div>
        </button>
      </div>

      {/* Sleek Ivory Parchment Slide-Out Confirmation Slip Beside the Bag */}
      {recentItem && (
        <div
          key={`slip-${catchKey}`}
          dir={isAr ? 'rtl' : 'ltr'}
          className="pointer-events-auto animate-touza-slip-in bg-[#f8f6f1] text-[#141413] border border-[#d6cfc1] shadow-[0_14px_36px_rgba(0,0,0,0.2)] p-2 sm:p-2.5 flex items-center gap-2.5 max-w-[calc(100vw-156px)] sm:max-w-[270px] mb-1"
        >
          {recentItem.imageUrl && (
            <div className="w-10 h-12 bg-[#ece9e2] border border-[#ded8cc] shrink-0 overflow-hidden">
              <img
                src={recentItem.imageUrl}
                alt={recentItem.productName || 'TOUZA item'}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <p className="text-[9.5px] tracking-[0.16em] uppercase text-[#8a7554] font-body font-medium leading-none">
              {isAr ? 'أُضيف لحقيبة توزا' : 'IN YOUR TOUZA BAG'}
            </p>
            {recentItem.productName && (
              <p className="font-editorial text-[13px] text-[#111111] leading-snug truncate mt-1">
                {recentItem.productName}
              </p>
            )}
            <div className="flex items-center justify-between gap-2 mt-1">
              <span className="text-[10.5px] text-[#6e685e] font-body truncate tabular-nums">
                {recentItem.size
                  ? isAr
                    ? `مقاس ${recentItem.size}`
                    : `Size ${recentItem.size}`
                  : ''}
                {typeof totalAmount === 'number' && totalAmount > 0
                  ? ` · ${formatPrice(totalAmount)}`
                  : ''}
              </span>

              <button
                type="button"
                onClick={() => {
                  setRecentItem(null);
                  onOpenCart();
                }}
                className="inline-flex items-center gap-1 text-[10px] tracking-[0.12em] uppercase font-semibold text-[#111111] border-b border-[#111111] hover:opacity-65 transition-opacity cursor-pointer shrink-0"
              >
                <span>{isAr ? 'عرض' : 'VIEW'}</span>
                {isAr ? (
                  <ArrowLeft className="w-2.5 h-2.5 stroke-[2]" />
                ) : (
                  <ArrowRight className="w-2.5 h-2.5 stroke-[2]" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
