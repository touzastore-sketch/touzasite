import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  Heart,
  ShoppingBag,
  Search,
  X,
  Menu,
  MessageCircle,
  ChevronRight,
  ChevronLeft,
  Ruler,
} from 'lucide-react';
import { ViewMode, StoreSettings, Category } from '../types';
import { DEFAULT_CATEGORIES } from '../data/defaultCategories';
import { useLanguage } from '../context/LanguageContext';
import { formatWhatsAppNumber } from '../utils/whatsapp';
import { SocialLinks } from './SocialLinks';

interface NavbarProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode, categoryFilter?: string) => void;
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenSearch: () => void;
  onOpenAccount: () => void;
  onOpenAdmin?: () => void;
  onOpenSizeGuide?: () => void;
  categories?: Category[];
  storeSettings?: StoreSettings;
  user?: User | null;
}

const NavbarComponent: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  cartCount,
  wishlistCount,
  onOpenCart,
  onOpenWishlist,
  onOpenSearch,
  onOpenAdmin,
  onOpenSizeGuide,
  categories,
  storeSettings,
  user,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const isAr = language === 'ar';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [menuAnimated, setMenuAnimated] = useState(false);
  const [cartPopKey, setCartPopKey] = useState(0);

  useEffect(() => {
    const handleCartPop = () => {
      setCartPopKey((prev) => prev + 1);
    };
    window.addEventListener('touza_cart_pop', handleCartPop);
    return () => window.removeEventListener('touza_cart_pop', handleCartPop);
  }, []);

  const activeCategories: Category[] =
    categories && categories.length > 0 ? categories : DEFAULT_CATEGORIES;

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      const timer = setTimeout(() => setMenuAnimated(true), 20);
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = '';
      };
    } else {
      setMenuAnimated(false);
      document.body.style.overflow = '';
    }
  }, [mobileMenuOpen]);

  const tickerItems = isAr
    ? [
        storeSettings?.announcementAr?.trim() || 'تشكيلة الشتاء ٢٠٢٦ · شحن لجميع المحافظات',
        'طلب فوري عبر واتساب بدون تسجيل',
        'استبدال واسترجاع خلال ١٤ يوم',
        'بورسعيد — شارع ٢٣ يوليو',
      ]
    : [
        storeSettings?.announcementEn?.trim() || 'WINTER 2026 EDIT · NATIONWIDE SHIPPING',
        'DIRECT WHATSAPP ORDERING',
        '14-DAY EASY EXCHANGES',
        'TOUZA MEN’S CASUAL WEAR',
      ];

  const whatsappHref = `https://wa.me/${formatWhatsAppNumber(
    storeSettings?.whatsappNumber
  )}?text=${encodeURIComponent(
    isAr
      ? 'مرحباً توزا، أود الطلب والاستفسار'
      : 'Hello TOUZA, I would like to order or inquire'
  )}`;

  return (
    <>
      <header
        id="navbar"
        className="fixed top-0 left-0 w-full z-[100] bg-[#ffffff] text-[#111111] border-b border-[#e5e3de] pt-[env(safe-area-inset-top,0px)]"
      >
        {/* Top Black Bread & Boxers Announcement Strip */}
        <div className="w-full h-[30px] bg-[#000000] text-[#ffffff] flex items-center justify-center overflow-hidden px-4">
          <div className="max-w-[1440px] w-full flex items-center justify-center sm:justify-between gap-6 text-[10px] sm:text-[11px] tracking-[0.14em] uppercase font-body whitespace-nowrap overflow-hidden">
            <span className="truncate">{tickerItems[0]}</span>
            <span className="hidden md:inline text-white/35" aria-hidden="true">|</span>
            <span className="hidden md:inline truncate">{tickerItems[1]}</span>
            <span className="hidden lg:inline text-white/35" aria-hidden="true">|</span>
            <span className="hidden lg:inline truncate">{tickerItems[2]}</span>
            <span className="hidden xl:inline text-white/35" aria-hidden="true">|</span>
            <span className="hidden xl:inline truncate">{tickerItems[3]}</span>
          </div>
        </div>

        {/* Crisp 3-Zone Editorial White Top Bar */}
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 md:px-12 h-[58px] md:h-[70px] grid grid-cols-3 items-center gap-4">
          {/* Zone 1 (Start): Clean Text Nav Links (Desktop) / Menu & Search (Mobile) */}
          <div className="flex items-center gap-4 md:gap-7 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="lg:hidden flex items-center justify-center w-10 h-10 -mx-2 cursor-pointer transition-opacity hover:opacity-60"
              aria-label={isAr ? 'فتح القائمة' : 'Toggle menu'}
            >
              <Menu className="w-5 h-5 stroke-[1.5]" />
            </button>

            <button
              type="button"
              onClick={onOpenSearch}
              className="lg:hidden flex items-center justify-center w-10 h-10 cursor-pointer transition-opacity hover:opacity-60"
              aria-label={t('nav.search', 'Search')}
            >
              <Search className="w-[18px] h-[18px] stroke-[1.5]" />
            </button>

            <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-[12px] font-medium tracking-[0.09em] uppercase text-[#111111]">
              <button
                type="button"
                onClick={() => onNavigate('shop', 'All')}
                className="whitespace-nowrap shrink-0 cursor-pointer relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-[#111111] hover:after:w-full after:transition-all after:duration-200"
              >
                {isAr ? 'الكل' : 'ALL'}
              </button>

              <button
                type="button"
                onClick={() => onNavigate('shop', 'New Arrivals')}
                className="whitespace-nowrap shrink-0 cursor-pointer relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-[#111111] hover:after:w-full after:transition-all after:duration-200"
              >
                {isAr ? 'وصل حديثاً' : 'NEW IN'}
              </button>

              {activeCategories.slice(0, 1).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onNavigate('shop', cat.nameEn)}
                  className="whitespace-nowrap shrink-0 cursor-pointer relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-[#111111] hover:after:w-full after:transition-all after:duration-200"
                >
                  {isAr ? cat.nameAr : cat.nameEn}
                </button>
              ))}

              {onOpenSizeGuide && (
                <button
                  type="button"
                  onClick={onOpenSizeGuide}
                  className="whitespace-nowrap shrink-0 cursor-pointer relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-[#111111] hover:after:w-full after:transition-all after:duration-200"
                >
                  {isAr ? 'المقاسات' : 'SIZE GUIDE'}
                </button>
              )}
            </nav>
          </div>

          {/* Zone 2 (Center): Iconic Bread & Boxers Editorial Serif Wordmark */}
          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="brand-wordmark text-[24px] sm:text-[27px] md:text-[30px] font-medium text-[#111111] leading-none whitespace-nowrap shrink-0 cursor-pointer transition-opacity hover:opacity-70"
            >
              TOUZA
            </button>
          </div>

          {/* Zone 3 (End): Language Switch, Search, Wishlist, Bag */}
          <div className="flex items-center justify-end gap-2 sm:gap-4 md:gap-5">
            <div className="flex items-center gap-1.5 text-[12px] tracking-[0.04em] whitespace-nowrap shrink-0">
              <button
                type="button"
                onClick={() => setLanguage('ar')}
                className={`cursor-pointer transition-opacity py-1 ${
                  isAr
                    ? 'font-semibold text-[#111111] underline underline-offset-4'
                    : 'text-[#6e6c68] hover:text-[#111111]'
                }`}
              >
                عربي
              </button>
              <span className="text-[#c9c6bf]">/</span>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`cursor-pointer transition-opacity py-1 ${
                  !isAr
                    ? 'font-semibold text-[#111111] underline underline-offset-4'
                    : 'text-[#6e6c68] hover:text-[#111111]'
                }`}
              >
                EN
              </button>
            </div>

            <button
              type="button"
              onClick={onOpenSearch}
              className="hidden lg:flex items-center justify-center w-9 h-9 cursor-pointer transition-opacity hover:opacity-60"
              title={t('nav.search', 'Search')}
              aria-label={t('nav.search', 'Search')}
            >
              <Search className="w-[18px] h-[18px] stroke-[1.5]" />
            </button>

            <button
              type="button"
              onClick={onOpenWishlist}
              className="hidden sm:flex items-center justify-center w-9 h-9 cursor-pointer transition-opacity hover:opacity-60 relative"
              title={t('nav.wishlist', 'Saved Items')}
              aria-label={t('nav.wishlist', 'Saved Items')}
            >
              <Heart
                className={`w-[18px] h-[18px] stroke-[1.5] ${
                  wishlistCount > 0 ? 'fill-[#111111] text-[#111111]' : ''
                }`}
              />
              {wishlistCount > 0 && (
                <span className="absolute top-0.5 end-0 text-[10px] font-semibold tabular-nums">
                  {wishlistCount}
                </span>
              )}
            </button>

            <button
              id="navbar-cart-btn"
              type="button"
              onClick={onOpenCart}
              className="relative flex items-center gap-1.5 min-h-[40px] px-1.5 cursor-pointer transition-opacity hover:opacity-75 whitespace-nowrap shrink-0"
              title={t('nav.cart', 'Shopping Bag')}
              aria-label={t('nav.cart', 'Shopping Bag')}
            >
              <span
                key={`bag-${cartPopKey}`}
                className={`inline-flex items-center gap-1.5 ${
                  cartPopKey > 0 ? 'animate-cart-bounce' : ''
                }`}
              >
                <ShoppingBag className="w-[18px] h-[18px] stroke-[1.6]" />
                {cartCount > 0 ? (
                  <span className="bg-[#111111] text-white min-w-[20px] h-[20px] px-1.5 inline-flex items-center justify-center text-[11px] font-semibold tabular-nums">
                    {cartCount}
                  </span>
                ) : (
                  <span className="text-[12px] font-medium tabular-nums">
                    (0)
                  </span>
                )}
              </span>
              {cartPopKey > 0 && (
                <span
                  key={`plus-${cartPopKey}`}
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-1 left-1/2 text-[11px] font-bold text-[#111111] animate-cart-plus-one"
                >
                  +1
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Classic Tailored Luxury Maison Slide-Out Drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-[99999] overflow-hidden"
          role="dialog"
          aria-modal="true"
        >
          <div
            onClick={() => setMobileMenuOpen(false)}
            className={`fixed inset-0 bg-black/50 backdrop-blur-[3px] transition-opacity duration-300 cursor-pointer z-40 ${
              menuAnimated ? 'opacity-100' : 'opacity-0'
            }`}
            aria-label={isAr ? 'إغلاق القائمة' : 'Close menu'}
          />

          <aside
            className={`fixed top-0 bottom-0 ${
              isAr ? 'right-0' : 'left-0'
            } max-w-full flex z-50 transition-transform duration-350 ease-[cubic-bezier(0.22,1,0.36,1)] h-[100dvh] ${
              menuAnimated
                ? 'translate-x-0'
                : isAr
                ? 'translate-x-full'
                : '-translate-x-full'
            }`}
          >
            <div
              className={`w-[86vw] sm:w-[400px] max-w-full bg-[#f7f5f0] text-[#141413] flex flex-col justify-between h-full pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] select-none shadow-[0_24px_64px_rgba(0,0,0,0.28)] ${
                isAr ? 'border-s border-[#dedad0]' : 'border-e border-[#dedad0]'
              }`}
            >
              {/* Classic Atelier Header */}
              <div className="px-7 pt-3 pb-5 border-b border-[#e2ded5] flex items-center justify-between gap-4">
                <div className="flex flex-col">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigate('home');
                    }}
                    className="brand-wordmark text-[26px] leading-none font-medium text-[#111111] text-start cursor-pointer hover:opacity-75 transition-opacity"
                  >
                    TOUZA
                  </button>
                  <span className="mt-1.5 text-[10px] tracking-[0.2em] uppercase text-[#7c7870] font-body">
                    {isAr ? 'للأزياء الرجالية · بورسعيد' : "MEN'S WEAR · ATELIER"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-9 h-9 border border-[#d9d5cb] bg-[#fbfaf7] hover:bg-[#111111] hover:border-[#111111] hover:text-white flex items-center justify-center text-[#111111] transition-colors duration-200 cursor-pointer shrink-0"
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4 stroke-[1.6]" />
                </button>
              </div>

              {/* Scrollable Editorial Navigation Body */}
              <div className="flex-1 overflow-y-auto px-7 py-7 hide-scrollbar">
                {/* Eyebrow */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[10px] tracking-[0.22em] uppercase text-[#8a857c] font-body font-medium">
                    {isAr ? 'التشكيلة' : 'COLLECTION'}
                  </span>
                  <span className="flex-1 h-[1px] bg-[#e2ded5]" />
                </div>

                {/* Numbered Classic Editorial Links */}
                <nav className="flex flex-col">
                  {(() => {
                    const primaryLinks: Array<{
                      id: string;
                      label: string;
                      isActive?: boolean;
                      onClick: () => void;
                    }> = [
                      {
                        id: 'home',
                        label: isAr ? 'الرئيسية' : 'Home',
                        isActive: currentView === 'home',
                        onClick: () => {
                          setMobileMenuOpen(false);
                          onNavigate('home');
                        },
                      },
                      {
                        id: 'shop-all',
                        label: isAr ? 'جميع القطع' : 'Shop All',
                        onClick: () => {
                          setMobileMenuOpen(false);
                          onNavigate('shop', 'All');
                        },
                      },
                      {
                        id: 'new-arrivals',
                        label: isAr ? 'وصل حديثاً' : 'New Arrivals',
                        onClick: () => {
                          setMobileMenuOpen(false);
                          onNavigate('shop', 'New Arrivals');
                        },
                      },
                      ...activeCategories.map((cat) => ({
                        id: cat.id,
                        label: isAr ? cat.nameAr : cat.nameEn,
                        onClick: () => {
                          setMobileMenuOpen(false);
                          onNavigate('shop', cat.nameEn);
                        },
                      })),
                    ];

                    return primaryLinks.map((item, idx) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={item.onClick}
                        className="group w-full flex items-center justify-between py-4 border-b border-[#e4e0d7] cursor-pointer text-start transition-colors"
                      >
                        <span className="flex items-baseline gap-3.5 min-w-0">
                          <span className="font-editorial editorial-italic text-[12px] text-[#969085] w-5 shrink-0 tabular-nums">
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          <span
                            className={`font-editorial text-[22px] sm:text-[24px] leading-[1.15] text-[#141413] transition-transform duration-200 ${
                              isAr
                                ? 'group-hover:-translate-x-1'
                                : 'group-hover:translate-x-1'
                            } ${item.isActive ? 'font-semibold' : 'font-normal'}`}
                          >
                            {item.label}
                          </span>
                          {item.isActive && (
                            <span
                              aria-hidden="true"
                              className="w-1.5 h-1.5 rounded-full bg-[#111111] self-center shrink-0"
                            />
                          )}
                        </span>

                        {isAr ? (
                          <ChevronLeft className="w-4 h-4 stroke-[1.4] text-[#8a857c] group-hover:text-[#111111] group-hover:-translate-x-0.5 transition-all shrink-0" />
                        ) : (
                          <ChevronRight className="w-4 h-4 stroke-[1.4] text-[#8a857c] group-hover:text-[#111111] group-hover:translate-x-0.5 transition-all shrink-0" />
                        )}
                      </button>
                    ));
                  })()}
                </nav>

                {/* Tailored Client Services Grid */}
                <div className="mt-7">
                  <div className="flex items-center gap-3 mb-3.5">
                    <span className="text-[10px] tracking-[0.22em] uppercase text-[#8a857c] font-body font-medium">
                      {isAr ? 'الخدمات السريعة' : 'CLIENT SERVICES'}
                    </span>
                    <span className="flex-1 h-[1px] bg-[#e2ded5]" />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {onOpenSizeGuide && (
                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          onOpenSizeGuide();
                        }}
                        className="flex items-center gap-2 px-3.5 py-2.5 border border-[#dedad0] bg-[#fcfbf8] hover:bg-[#111111] hover:border-[#111111] hover:text-white text-[#141413] text-[12px] font-body font-medium transition-colors cursor-pointer"
                      >
                        <Ruler className="w-3.5 h-3.5 stroke-[1.6] shrink-0 opacity-75" />
                        <span className="truncate">{isAr ? 'المقاسات' : 'Size Guide'}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenSearch();
                      }}
                      className="flex items-center gap-2 px-3.5 py-2.5 border border-[#dedad0] bg-[#fcfbf8] hover:bg-[#111111] hover:border-[#111111] hover:text-white text-[#141413] text-[12px] font-body font-medium transition-colors cursor-pointer"
                    >
                      <Search className="w-3.5 h-3.5 stroke-[1.6] shrink-0 opacity-75" />
                      <span className="truncate">{isAr ? 'البحث' : 'Search'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenWishlist();
                      }}
                      className="flex items-center justify-between gap-2 px-3.5 py-2.5 border border-[#dedad0] bg-[#fcfbf8] hover:bg-[#111111] hover:border-[#111111] hover:text-white text-[#141413] text-[12px] font-body font-medium transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2 truncate">
                        <Heart className="w-3.5 h-3.5 stroke-[1.6] shrink-0 opacity-75" />
                        <span className="truncate">{isAr ? 'المفضلة' : 'Saved'}</span>
                      </span>
                      <span className="text-[11px] opacity-70 tabular-nums">({wishlistCount})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenCart();
                      }}
                      className="flex items-center justify-between gap-2 px-3.5 py-2.5 border border-[#dedad0] bg-[#fcfbf8] hover:bg-[#111111] hover:border-[#111111] hover:text-white text-[#141413] text-[12px] font-body font-medium transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2 truncate">
                        <ShoppingBag className="w-3.5 h-3.5 stroke-[1.6] shrink-0 opacity-75" />
                        <span className="truncate">{isAr ? 'السلة' : 'Bag'}</span>
                      </span>
                      <span className="text-[11px] opacity-70 tabular-nums">({cartCount})</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Classic Maison Footer */}
              <div className="px-7 pt-5 border-t border-[#e2ded5] bg-[#f2efe8] space-y-4">
                {/* Language Switch Row */}
                <div className="flex items-center justify-between text-[11px] font-body">
                  <span className="tracking-[0.18em] uppercase text-[#7c7870]">
                    {isAr ? 'اللغة' : 'LANGUAGE'}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setLanguage('en')}
                      className={`cursor-pointer transition-colors ${
                        !isAr
                          ? 'text-[#111111] font-semibold underline underline-offset-4'
                          : 'text-[#8a857c] hover:text-[#111111]'
                      }`}
                    >
                      EN
                    </button>
                    <span className="text-[#c9c4b8]">/</span>
                    <button
                      type="button"
                      onClick={() => setLanguage('ar')}
                      className={`cursor-pointer transition-colors ${
                        isAr
                          ? 'text-[#111111] font-semibold underline underline-offset-4'
                          : 'text-[#8a857c] hover:text-[#111111]'
                      }`}
                    >
                      عربي
                    </button>
                  </div>
                </div>

                {/* Classic WhatsApp Concierge CTA */}
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3.5 px-5 border border-[#111111] bg-[#111111] text-[#f7f5f0] text-[11.5px] tracking-[0.16em] uppercase font-medium flex items-center justify-center gap-2.5 hover:bg-[#242423] transition-colors btn-atc-sheen"
                >
                  <MessageCircle className="w-4 h-4 stroke-[1.6] text-[#25D366]" />
                  <span>
                    {isAr ? 'الطلب المباشر عبر واتساب' : 'ORDER VIA WHATSAPP'}
                  </span>
                </a>

                {/* Quiet Atelier Signature & Socials */}
                <div className="flex items-center justify-between pt-1 text-[11px] text-[#7c7870]">
                  <span className="font-body">
                    {isAr ? 'بورسعيد · شارع ٢٣ يوليو' : 'Port Said · 23 July St.'}
                  </span>
                  <div className="opacity-75 scale-90 origin-end">
                    <SocialLinks variant="horizontal" storeSettings={storeSettings} />
                  </div>
                </div>

                {user?.email === 'touzastore@gmail.com' && onOpenAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAdmin();
                    }}
                    className="w-full text-center text-[11px] tracking-[0.12em] uppercase text-[#7c7870] hover:text-[#111111] cursor-pointer pt-1 border-t border-[#e2ded5]"
                  >
                    {isAr ? 'لوحة التحكم' : 'Admin Dashboard'}
                  </button>
                )}
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};

export const Navbar = React.memo(NavbarComponent);
