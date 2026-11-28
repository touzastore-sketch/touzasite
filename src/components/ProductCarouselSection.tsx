import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';
import { useLanguage } from '../context/LanguageContext';

interface ProductCarouselSectionProps {
  products: Product[];
  isInitialSyncDone: boolean;
  wishlistIds: string[];
  onSelectProduct: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  onQuickAdd: (product: Product, color: string, size: string) => void;
  onViewAll: () => void;
}

export const ProductCarouselSection: React.FC<ProductCarouselSectionProps> = ({
  products,
  isInitialSyncDone,
  wishlistIds,
  onSelectProduct,
  onToggleWishlist,
  onQuickAdd,
  onViewAll,
}) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  const homeSelected = products.filter((p) => p.showOnHome !== false);
  const displayList = homeSelected.length > 0 ? homeSelected : products;

  const updateScrollArrows = () => {
    const el = trackRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 8) {
      setCanScrollPrev(false);
      setCanScrollNext(false);
      return;
    }

    const pos = Math.abs(el.scrollLeft);
    setCanScrollPrev(pos > 12);
    setCanScrollNext(pos < maxScroll - 12);
  };

  useEffect(() => {
    updateScrollArrows();
    const timer = setTimeout(updateScrollArrows, 250);
    window.addEventListener('resize', updateScrollArrows);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateScrollArrows);
    };
  }, [displayList.length, language]);

  const scrollTrack = (direction: 'prev' | 'next') => {
    const el = trackRef.current;
    if (!el) return;
    const step = Math.max(el.clientWidth * 0.78, 300);
    const sign = direction === 'next' ? 1 : -1;
    const rtlFactor = isAr ? -1 : 1;
    el.scrollBy({ left: step * sign * rtlFactor, behavior: 'smooth' });
  };

  return (
    <section
      id="featured-collection"
      className="py-14 md:py-20 px-4 sm:px-8 md:px-12 max-w-[1440px] mx-auto w-full bg-[#ffffff]"
    >
      {/* Editorial Serif Section Header */}
      <div className="flex items-end justify-between gap-4 mb-7 md:mb-10">
        <div>
          <p className="font-body text-[10.5px] sm:text-[11px] tracking-[0.18em] uppercase text-[#8a7554] mb-1.5">
            {isAr ? 'إصدار الشتاء ٢٠٢٦ · مختارات توزا' : 'WINTER 2026 · CURATED EDIT'}
          </p>
          <h2 className="font-editorial text-[30px] sm:text-[38px] md:text-[42px] text-[#111111] font-normal leading-[1.08] tracking-[-0.01em]">
            {isAr ? 'مختارات توزا للرجال' : 'Signature Pieces'}
          </h2>
        </div>

        <button
          type="button"
          onClick={onViewAll}
          className="font-body text-[11.5px] sm:text-[12px] tracking-[0.12em] uppercase text-[#111111] border-b border-[#111111]/60 pb-0.5 hover:border-[#111111] hover:opacity-70 transition-all cursor-pointer whitespace-nowrap shrink-0"
        >
          {isAr ? `عرض الكل (${products.length})` : `VIEW ALL (${products.length})`}
        </button>
      </div>

      {/* Loading Skeletons */}
      {displayList.length === 0 && !isInitialSyncDone ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[0, 1, 2, 3].map((slot) => (
            <div key={slot} className="animate-pulse">
              <div className="aspect-[3/4] bg-[#f2f2f0]" />
              <div className="pt-3 space-y-2">
                <div className="h-3.5 bg-[#e8e6e1] w-3/4" />
                <div className="h-3 bg-[#f0eee9] w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : displayList.length === 0 ? (
        <div className="py-16 text-center bg-[#faf9f7] border border-[#e6e4df] p-8">
          <p className="font-editorial text-[24px] text-[#111111]">
            {isAr ? 'المتجر قيد التحديث' : 'Collection Updating'}
          </p>
          <p className="font-body text-[14px] text-[#6e6c68] mt-1.5">
            {isAr
              ? 'سيتم إضافة قطع ومجموعات جديدة قريباً جداً.'
              : 'New seasonal pieces will be available shortly.'}
          </p>
        </div>
      ) : (
        /* Horizontal 4-Up Carousel with Bread & Boxers Edge Chevrons (Screenshot 2 Exact Style) */
        <div className="relative group/carousel">
          {/* Previous Edge Chevron */}
          {canScrollPrev && (
            <button
              type="button"
              onClick={() => scrollTrack('prev')}
              aria-label={isAr ? 'السابق' : 'Previous products'}
              className="hidden sm:flex items-center justify-center absolute top-[38%] start-1 z-20 w-10 h-10 bg-white/85 hover:bg-white text-[#111111] border border-[#e5e3de]/80 transition-all cursor-pointer shadow-xs"
            >
              {isAr ? (
                <ChevronRight className="w-5 h-5 stroke-[1.5]" />
              ) : (
                <ChevronLeft className="w-5 h-5 stroke-[1.5]" />
              )}
            </button>
          )}

          {/* Product Strip */}
          <div
            ref={trackRef}
            onScroll={updateScrollArrows}
            className="flex gap-3 sm:gap-4 overflow-x-auto hide-scrollbar scroll-smooth snap-x snap-mandatory pb-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {displayList.map((product, idx) => (
              <div
                key={product.id}
                className="w-[46%] sm:w-[32%] lg:w-[calc(25%-12px)] shrink-0 snap-start"
              >
                <ProductCard
                  product={product}
                  priority={idx < 4}
                  onSelectProduct={onSelectProduct}
                  isWishlisted={wishlistIds.includes(product.id)}
                  onToggleWishlist={(p, e) => {
                    e.stopPropagation();
                    onToggleWishlist(p);
                  }}
                  onQuickAdd={(p, color, size) => {
                    onQuickAdd(p, color, size);
                  }}
                />
              </div>
            ))}
          </div>

          {/* Next Edge Chevron */}
          {canScrollNext && (
            <button
              type="button"
              onClick={() => scrollTrack('next')}
              aria-label={isAr ? 'التالي' : 'Next products'}
              className="hidden sm:flex items-center justify-center absolute top-[38%] end-1 z-20 w-10 h-10 bg-white/85 hover:bg-white text-[#111111] border border-[#e5e3de]/80 transition-all cursor-pointer shadow-xs"
            >
              {isAr ? (
                <ChevronLeft className="w-5 h-5 stroke-[1.5]" />
              ) : (
                <ChevronRight className="w-5 h-5 stroke-[1.5]" />
              )}
            </button>
          )}
        </div>
      )}
    </section>
  );
};
