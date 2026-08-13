import React, { useRef, useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { useLanguage } from '../context/LanguageContext';
import { getAllReviews, SavedReview } from '../firebase';

interface CustomerReviewsSectionProps {
  user: User | null;
  onSignInGoogle: () => Promise<void>;
  onOpenAccount: () => void;
}

export const CustomerReviewsSection: React.FC<CustomerReviewsSectionProps> = ({
  user,
  onOpenAccount,
}) => {
  const { language } = useLanguage();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [reviews, setReviews] = useState<SavedReview[]>([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    getAllReviews()
      .then((data) => setReviews(data))
      .catch((err) => console.error('Error loading homepage reviews:', err));
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
    const isRTL = language === 'ar';

    let atLeftEdge = false;
    let atRightEdge = false;

    if (isRTL) {
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

  // Display list from database reviews (or default list returned by getAllReviews)
  const displayList = reviews.map((r) => ({
    id: r.id,
    userName: r.userName || (language === 'ar' ? 'عميل توزا' : 'Touza Client'),
    city: r.orderNumber || r.productTitle || (language === 'ar' ? 'عميل موثق' : 'Verified Purchase'),
    comment: r.comment,
    image: r.userPhoto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600',
  }));

  const scrollLeft = () => {
    if (scrollContainerRef.current && canScrollLeft) {
      const step = scrollContainerRef.current.clientWidth < 640 ? 280 : 320;
      scrollContainerRef.current.scrollBy({ left: -step, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current && canScrollRight) {
      const step = scrollContainerRef.current.clientWidth < 640 ? 280 : 320;
      scrollContainerRef.current.scrollBy({ left: step, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-20 px-6 md:px-16 bg-[#ffffff] border-t border-[#c5a059]/20 overflow-hidden">
      <div className="max-w-[1340px] mx-auto flex flex-col lg:flex-row items-start lg:items-center gap-10 lg:gap-16">
        
        {/* Left Headline Section */}
        <div className="lg:w-1/3 shrink-0 space-y-4">
          <h2 className="font-display text-[38px] md:text-[52px] text-[#000000] font-bold leading-[1.15] tracking-tight">
            {language === 'ar' ? 'ماذا يقول عملاؤنا' : 'What Our Customers Say'}
          </h2>
          <p className="font-body text-[15px] md:text-[16px] text-[#555555] leading-relaxed max-w-md">
            {language === 'ar'
              ? 'آراؤكم هي مصدر إلهامنا اليومي. إليك كيف يتألق ويستمتع عملاؤنا بقطع توزا (Touza) الرجالية الكاجوال.'
              : 'Your feedback inspires us. Here’s how men are styling and enjoying Touza casual menswear.'}
          </p>

          {/* If logged in, show quick button to rate orders inside Account */}
          {user && (
            <div className="pt-2">
              <button
                onClick={onOpenAccount}
                className="inline-flex items-center gap-2 bg-[#000000] text-white px-5 py-2.5 rounded-full font-body text-[13px] font-bold hover:bg-[#222222] transition-all cursor-pointer shadow-xs"
              >
                <span className="material-symbols-outlined text-[18px]">rate_review</span>
                <span>{language === 'ar' ? 'إضافة تقييم لطلباتك' : 'Review Your Orders'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Carousel Section with Slider Navigation */}
        <div className="lg:w-2/3 w-full relative group">
          
          {/* Scroll Container */}
          <div
            ref={scrollContainerRef}
            onScroll={updateScrollButtons}
            className="flex gap-8 overflow-x-auto scrollbar-none scroll-smooth py-6 px-2 snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {displayList.map((item) => (
              <div
                key={item.id}
                className="w-[260px] sm:w-[290px] shrink-0 snap-start flex flex-col space-y-4"
              >
                {/* Image Container with Quote Badge */}
                <div className="relative w-[210px] h-[230px] sm:w-[230px] sm:h-[250px] mx-auto rounded-[50%] overflow-hidden bg-[#eaeaea] shadow-xs">
                  <img
                    src={item.image}
                    alt={item.userName}
                    loading="lazy"
                    className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
                  />
                  {/* Circular Quote Icon Badge */}
                  <div className="absolute bottom-3 left-3 w-10 h-10 rounded-full bg-[#000000] text-white flex items-center justify-center shadow-lg border-2 border-white">
                    <span className="font-serif text-[22px] leading-none font-bold">”</span>
                  </div>
                </div>

                {/* Name & City */}
                <div className="text-left space-y-0.5 pt-1">
                  <h3 className="font-display text-[22px] font-bold text-[#000000]">
                    {item.userName}
                  </h3>
                  <p className="font-body text-[13px] text-[#747878]">
                    {item.city}
                  </p>
                </div>

                {/* Review Comment text */}
                <p className="font-body text-[14px] text-[#222222] leading-relaxed text-left">
                  "{item.comment}"
                </p>
              </div>
            ))}
          </div>

          {/* Slider Left & Right Arrow Buttons */}
          <div className="flex items-center gap-3 mt-4 lg:mt-0 lg:absolute lg:top-1/2 lg:-translate-y-1/2 lg:w-full lg:left-0 lg:justify-between pointer-events-none px-2">
            <button
              onClick={scrollLeft}
              disabled={!canScrollLeft}
              className={`w-11 h-11 rounded-full bg-[#000000] text-white flex items-center justify-center shadow-md transition-all ${
                canScrollLeft
                  ? 'pointer-events-auto opacity-100 hover:bg-[#333333] cursor-pointer hover:scale-110 active:scale-95'
                  : 'opacity-25 cursor-not-allowed pointer-events-none'
              }`}
              aria-label="Previous review"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>

            <button
              onClick={scrollRight}
              disabled={!canScrollRight}
              className={`w-11 h-11 rounded-full bg-[#000000] text-white flex items-center justify-center shadow-md transition-all ${
                canScrollRight
                  ? 'pointer-events-auto opacity-100 hover:bg-[#333333] cursor-pointer hover:scale-110 active:scale-95'
                  : 'opacity-25 cursor-not-allowed pointer-events-none'
              }`}
              aria-label="Next review"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};
