import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { User } from 'firebase/auth';
import { useLanguage } from '../context/LanguageContext';
import { subscribeToReviews, SavedReview } from '../firebase';

interface CustomerReviewsSectionProps {
  user?: User | null;
  onSignInGoogle?: () => Promise<void>;
  onOpenAccount?: () => void;
}

const CustomerReviewsSectionComponent: React.FC<CustomerReviewsSectionProps> = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [reviews, setReviews] = useState<SavedReview[]>([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToReviews((data) => {
      setReviews(data);
    });
    return () => unsubscribe();
  }, []);

  const updateScrollButtons = () => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const maxScroll = el.scrollWidth - el.clientWidth;

    if (maxScroll <= 5) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    const sLeft = el.scrollLeft;
    let atLeftEdge = false;
    let atRightEdge = false;

    if (isAr) {
      if (sLeft < 0) {
        atRightEdge = Math.abs(sLeft) <= 10;
        atLeftEdge = Math.abs(sLeft) >= maxScroll - 10;
      } else if (sLeft > 0) {
        atLeftEdge = sLeft >= maxScroll - 10;
        atRightEdge = sLeft <= 10;
      } else {
        atRightEdge = true;
        atLeftEdge = false;
      }
    } else {
      atLeftEdge = sLeft <= 10;
      atRightEdge = sLeft >= maxScroll - 10;
    }

    setCanScrollLeft(!atLeftEdge);
    setCanScrollRight(!atRightEdge);
  };

  useEffect(() => {
    updateScrollButtons();
    const timer = setTimeout(updateScrollButtons, 300);
    window.addEventListener('resize', updateScrollButtons);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, [reviews, language]);

  const displayList = reviews.map((r) => ({
    id: r.id,
    userName: r.userName || (isAr ? 'عميل توزا' : 'TOUZA Client'),
    meta: r.productTitle || r.orderNumber || (isAr ? 'عميل موثق' : 'Verified Purchase'),
    comment: r.comment,
    rating: r.rating || 5,
  }));

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -340, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 340, behavior: 'smooth' });
    }
  };

  if (displayList.length === 0) {
    return null;
  }

  return (
    <section className="py-16 md:py-24 px-5 sm:px-8 md:px-14 bg-[#ffffff] overflow-hidden">
      <div className="max-w-[1440px] mx-auto">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10 md:mb-12">
          <div className="space-y-2 max-w-xl">
            <span className="font-label-caps text-[11px] text-[#6e6c68] uppercase block">
              {isAr ? 'انطباعات العملاء' : 'CLIENT NOTES'}
            </span>
            <h2 className="font-display text-[26px] sm:text-[34px] md:text-[38px] text-[#111111] font-semibold leading-[1.15] tracking-tight">
              {isAr ? 'ماذا يقول عملاؤنا' : 'Worn & Reviewed'}
            </h2>
          </div>

          {/* Crisp Architectural Arrow Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={scrollLeft}
              disabled={!canScrollLeft}
              aria-label="Previous review"
              className={`w-10 h-10 border border-[#e6e4df] flex items-center justify-center transition-colors ${
                canScrollLeft
                  ? 'text-[#111111] hover:border-[#111111] hover:bg-[#111111] hover:text-white cursor-pointer'
                  : 'text-[#c9c6bf] cursor-not-allowed'
              }`}
            >
              {isAr ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={scrollRight}
              disabled={!canScrollRight}
              aria-label="Next review"
              className={`w-10 h-10 border border-[#e6e4df] flex items-center justify-center transition-colors ${
                canScrollRight
                  ? 'text-[#111111] hover:border-[#111111] hover:bg-[#111111] hover:text-white cursor-pointer'
                  : 'text-[#c9c6bf] cursor-not-allowed'
              }`}
            >
              {isAr ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Minimalist Editorial Review Track */}
        <div
          ref={scrollContainerRef}
          onScroll={updateScrollButtons}
          className="flex gap-5 md:gap-6 overflow-x-auto hide-scrollbar scroll-smooth snap-x snap-mandatory pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          {displayList.map((item) => (
            <article
              key={item.id}
              className="w-[82vw] sm:w-[340px] md:w-[380px] shrink-0 snap-start border border-[#e6e4df] bg-[#faf9f7] p-6 sm:p-8 flex flex-col justify-between gap-6"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-1 text-[#111111]">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3.5 h-3.5 ${
                        star <= item.rating ? 'fill-[#111111] text-[#111111]' : 'text-[#d4d1ca]'
                      }`}
                    />
                  ))}
                </div>
                <p className="font-body text-[14px] sm:text-[15px] text-[#222222] leading-[1.8]">
                  “{item.comment}”
                </p>
              </div>

              <div className="pt-4 border-t border-[#e6e4df] flex items-baseline justify-between gap-3">
                <span className="font-display text-[15px] font-semibold text-[#111111]">
                  {item.userName}
                </span>
                <span className="font-body text-[12px] text-[#6e6c68] truncate max-w-[160px]">
                  {item.meta}
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export const CustomerReviewsSection = React.memo(CustomerReviewsSectionComponent);
