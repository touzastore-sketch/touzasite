import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { StoreSettings } from '../types';

interface PerksMarqueeBarProps {
  storeSettings?: StoreSettings;
}

const PerksMarqueeBarComponent: React.FC<PerksMarqueeBarProps> = ({ storeSettings }) => {
  const { language } = useLanguage();
  const isRtl = language === 'ar';

  if (storeSettings?.enableMarqueeBar === false) {
    return null;
  }

  const rawText = isRtl ? storeSettings?.announcementAr : storeSettings?.announcementEn;

  const defaultPerks = isRtl
    ? [
        "TOUZA MEN'S WEAR",
      ]
    : [
        "TOUZA MEN'S WEAR",
      ];

  let parsedPerks: string[] = [];

  if (rawText && rawText.trim()) {
    if (rawText.includes('|')) {
      parsedPerks = rawText.split('|').map((s) => s.trim()).filter(Boolean);
    } else if (rawText.includes('\n')) {
      parsedPerks = rawText.split('\n').map((s) => s.trim()).filter(Boolean);
    } else {
      parsedPerks = [rawText.trim()];
    }
  }

  const perks = parsedPerks.length > 0 ? parsedPerks : defaultPerks;

  // Repeat items for seamless continuous loop
  const effectiveItems = perks.length > 0 ? perks : ["TOUZA MEN'S WEAR"];
  const repeatCount = Math.max(4, Math.ceil(12 / effectiveItems.length));
  const marqueeItems = Array(repeatCount).fill(effectiveItems).flat();

  const bgColor = storeSettings?.marqueeBgColor || '#121212';
  const textColor = storeSettings?.marqueeTextColor || '#f3f3f3';
  const symbol = storeSettings?.marqueeSymbol || '✦';

  const speedVal = storeSettings?.marqueeSpeed;
  let duration = '22s';
  if (speedVal === 'slow') duration = '36s';
  else if (speedVal === 'fast') duration = '12s';
  else if (typeof speedVal === 'string' && speedVal.endsWith('s')) duration = speedVal;

  return (
    <div
      dir="ltr"
      className="w-full border-y border-[#c5a059]/40 py-3 overflow-hidden relative shadow-sm marquee-container group transition-colors duration-300"
      style={{ backgroundColor: bgColor }}
    >
      {/* Subtle side gradient fade overlays */}
      <div
        className="absolute top-0 bottom-0 left-0 w-12 sm:w-24 z-10 pointer-events-none"
        style={{
          background: `linear-gradient(to right, ${bgColor}, transparent)`,
        }}
      />
      <div
        className="absolute top-0 bottom-0 right-0 w-12 sm:w-24 z-10 pointer-events-none"
        style={{
          background: `linear-gradient(to left, ${bgColor}, transparent)`,
        }}
      />

      {/* Marquee Track */}
      <div
        className="flex whitespace-nowrap animate-marquee w-max"
        style={{ animationDuration: duration }}
      >
        <div className="flex items-center shrink-0">
          {marqueeItems.map((perk, idx) => (
            <div
              key={`perk-1-${idx}`}
              className="flex items-center gap-6 sm:gap-10 px-4 sm:px-6 shrink-0"
            >
              <span
                className="font-label-caps text-[12px] sm:text-[13px] font-medium tracking-[0.18em] uppercase whitespace-nowrap transition-colors duration-300"
                style={{ color: textColor }}
              >
                {perk}
              </span>
              <span
                className="text-[10px] sm:text-[11px] select-none font-serif opacity-80"
                style={{ color: textColor === '#f3f3f3' || textColor === '#ffffff' ? '#c5a059' : textColor }}
              >
                {symbol}
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center shrink-0" aria-hidden="true">
          {marqueeItems.map((perk, idx) => (
            <div
              key={`perk-2-${idx}`}
              className="flex items-center gap-6 sm:gap-10 px-4 sm:px-6 shrink-0"
            >
              <span
                className="font-label-caps text-[12px] sm:text-[13px] font-medium tracking-[0.18em] uppercase whitespace-nowrap transition-colors duration-300"
                style={{ color: textColor }}
              >
                {perk}
              </span>
              <span
                className="text-[10px] sm:text-[11px] select-none font-serif opacity-80"
                style={{ color: textColor === '#f3f3f3' || textColor === '#ffffff' ? '#c5a059' : textColor }}
              >
                {symbol}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const PerksMarqueeBar = React.memo(PerksMarqueeBarComponent);

