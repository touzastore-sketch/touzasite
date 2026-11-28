import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  Heart,
  Search,
  X,
  Menu,
  MessageCircle,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { ViewMode, StoreSettings, Category } from '../types';
import { DEFAULT_CATEGORIES } from '../data/defaultCategories';
import { useLanguage } from '../context/LanguageContext';
import { formatWhatsAppNumber } from '../utils/whatsapp';
import { SocialLinks } from './SocialLinks';
import drawerEditorialThumb from '../assets/images/touza_split_studio_model_1795730399881.jpg';

interface NavbarProps {
  currentView: ViewMode;
  activeCategory?: string;
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

const toRomanNumeral = (num: number): string => {
  const map: Array<[number, string]> = [
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ];
  let n = num;
  let out = '';
  for (const [val, sym] of map) {
    while (n >= val) {
      out += sym;
      n -= val;
    }
  }
  return out || String(num);
};

const NavbarComponent: React.FC<NavbarProps> = ({
  currentView,
  activeCategory,
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

              {activeCategories.slice(0, 3).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onNavigate('shop', cat.nameEn || cat.nameAr)}
                  className="whitespace-nowrap shrink-0 cursor-pointer relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-[#111111] hover:after:w-full after:transition-all after:duration-200"
                >
                  {isAr ? (cat.nameAr || cat.nameEn) : (cat.nameEn || cat.nameAr)}
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
                <svg
                  viewBox="0 0 24 26"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-[19px] h-[21px] shrink-0"
                  aria-hidden="true"
                >
                  <path
                    d="M8 8.5V6.5C8 4.29 9.79 2.5 12 2.5C14.21 2.5 16 4.29 16 6.5V8.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M4.2 8.5H19.8L20.8 23.2H3.2L4.2 8.5Z"
                    fill={cartCount > 0 ? '#111111' : 'none'}
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinejoin="miter"
                  />
                  <text
                    x="12"
                    y="18.2"
                    textAnchor="middle"
                    fill={cartCount > 0 ? '#e6d5b8' : 'currentColor'}
                    fontFamily="'Playfair Display', Georgia, serif"
                    fontSize="7.6"
                    fontWeight="600"
                  >
                    T
                  </text>
                </svg>
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

      {/* Ultra-Classic Heritage Maison Slide-Out Drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-[99999] overflow-hidden"
          role="dialog"
          aria-modal="true"
        >
          <div
            onClick={() => setMobileMenuOpen(false)}
            className={`fixed inset-0 bg-[#0d0d0c]/60 backdrop-blur-[4px] transition-opacity duration-350 cursor-pointer z-40 ${
              menuAnimated ? 'opacity-100' : 'opacity-0'
            }`}
            aria-label={isAr ? 'إغلاق القائمة' : 'Close menu'}
          />

          <aside
            className={`fixed top-0 bottom-0 ${
              isAr ? 'right-0' : 'left-0'
            } max-w-full flex z-50 transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] h-[100dvh] ${
              menuAnimated
                ? 'translate-x-0'
                : isAr
                ? 'translate-x-full'
                : '-translate-x-full'
            }`}
          >
            {/* Outer Alabaster Parchment Surface */}
            <div className="w-[86vw] sm:w-[390px] max-w-full bg-[#f8f6f1] text-[#141413] h-full p-2.5 sm:p-3 pt-[max(0.625rem,env(safe-area-inset-top))] pb-[max(0.625rem,env(safe-area-inset-bottom))] select-none shadow-[0_28px_80px_rgba(0,0,0,0.36)]">
              {/* Inner Engraved Classical Double Frame */}
              <div className="w-full h-full border border-[#ded8cc] bg-[#f8f6f1] flex flex-col justify-between overflow-hidden">
                {/* Centered Regal Maison Crest Header */}
                <div className="relative px-6 pt-5 pb-4 text-center border-b border-[#e6e1d6]">
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`absolute top-3.5 ${
                      isAr ? 'left-3.5' : 'right-3.5'
                    } w-8 h-8 flex items-center justify-center text-[#7c7569] hover:text-[#111111] transition-colors cursor-pointer`}
                    aria-label="Close menu"
                  >
                    <X className="w-4 h-4 stroke-[1.5]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigate('home');
                    }}
                    className="brand-wordmark text-[25px] leading-none font-medium text-[#111111] cursor-pointer hover:opacity-75 transition-opacity"
                  >
                    TOUZA
                  </button>

                  {/* Delicate Classical Diamond Rule */}
                  <div
                    aria-hidden="true"
                    className="flex items-center justify-center gap-2.5 my-2"
                  >
                    <span className="w-8 h-[1px] bg-[#cfc6b6]" />
                    <span className="w-1.5 h-1.5 rotate-45 bg-[#9c8563]" />
                    <span className="w-8 h-[1px] bg-[#cfc6b6]" />
                  </div>

                  <p className="text-[9.5px] tracking-[0.24em] uppercase text-[#7f776a] font-body">
                    {isAr ? 'توزا للأزياء الرجالية · بورسعيد' : "MAISON DE MODE · PORT SAID"}
                  </p>
                </div>

                {/* Middle Scroll-Safe Classical Navigation */}
                <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col justify-between gap-4 hide-scrollbar">
                  {/* Roman Numeral Editorial Links — Dynamically Syncs ALL Store Categories */}
                  <nav className="flex flex-col shrink-0">
                    {(() => {
                      const normalizedActiveCat = (activeCategory || '').trim().toLowerCase();
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
                          isActive:
                            currentView === 'shop' &&
                            (!normalizedActiveCat || normalizedActiveCat === 'all'),
                          onClick: () => {
                            setMobileMenuOpen(false);
                            onNavigate('shop', 'All');
                          },
                        },
                        {
                          id: 'new-arrivals',
                          label: isAr ? 'وصل حديثاً' : 'New Arrivals',
                          isActive:
                            currentView === 'shop' &&
                            normalizedActiveCat === 'new arrivals',
                          onClick: () => {
                            setMobileMenuOpen(false);
                            onNavigate('shop', 'New Arrivals');
                          },
                        },
                        ...activeCategories.map((cat) => {
                          const catKeyEn = (cat.nameEn || '').trim().toLowerCase();
                          const catKeyAr = (cat.nameAr || '').trim().toLowerCase();
                          const targetFilter = cat.nameEn || cat.nameAr || 'All';
                          return {
                            id: cat.id,
                            label: isAr
                              ? cat.nameAr || cat.nameEn
                              : cat.nameEn || cat.nameAr,
                            isActive:
                              currentView === 'shop' &&
                              (normalizedActiveCat === catKeyEn ||
                                normalizedActiveCat === catKeyAr ||
                                normalizedActiveCat === cat.id.toLowerCase()),
                            onClick: () => {
                              setMobileMenuOpen(false);
                              onNavigate('shop', targetFilter);
                            },
                          };
                        }),
                      ];

                      return primaryLinks.map((item, idx) => (
                        <div key={item.id} className="relative">
                          <button
                            type="button"
                            onClick={item.onClick}
                            className="group w-full flex items-center justify-between py-2.5 sm:py-3 cursor-pointer text-start transition-colors"
                          >
                            <span className="flex items-baseline gap-3.5 min-w-0">
                              <span className="font-editorial editorial-italic text-[11.5px] text-[#9c8563] w-5 shrink-0 text-center">
                                {toRomanNumeral(idx + 1)}
                              </span>
                              <span
                                className={`font-editorial text-[20px] sm:text-[22px] leading-[1.15] text-[#141413] truncate transition-all duration-200 ${
                                  isAr
                                    ? 'group-hover:-translate-x-1'
                                    : 'group-hover:translate-x-1'
                                } ${
                                  item.isActive
                                    ? 'font-medium text-[#111111]'
                                    : 'font-normal text-[#1e1d1b] group-hover:text-[#111111]'
                                }`}
                              >
                                {item.label}
                              </span>
                            </span>

                            <span className="flex items-center gap-2 shrink-0">
                              {item.isActive ? (
                                <span
                                  aria-hidden="true"
                                  className="w-5 h-[1px] bg-[#9c8563]"
                                />
                              ) : (
                                <span
                                  aria-hidden="true"
                                  className="w-0 group-hover:w-4 h-[1px] bg-[#9c8563] transition-all duration-250"
                                />
                              )}
                            </span>
                          </button>

                          {idx < primaryLinks.length - 1 && (
                            <div
                              aria-hidden="true"
                              className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#e2dcd0] to-transparent"
                            />
                          )}
                        </div>
                      ));
                    })()}
                  </nav>

                  {/* Compact Framed Editorial Lookbook Card */}
                  <div className="pt-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onNavigate('shop', categories[0]?.nameEn || 'All');
                      }}
                      className="group relative w-full h-[78px] overflow-hidden border border-[#ded8cc] bg-[#161514] text-white cursor-pointer flex items-center text-start"
                    >
                      <img
                        src={drawerEditorialThumb}
                        alt={isAr ? 'إصدار شتاء توزا' : 'TOUZA Winter Edit'}
                        className="absolute inset-0 w-full h-full object-cover object-top opacity-70 group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-[#111110]/85 via-[#111110]/55 to-[#111110]/20" />
                      <div className="relative z-10 w-full px-4 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <span className="block text-[9px] tracking-[0.22em] uppercase text-[#d8c4a0] font-body">
                            {isAr ? 'إصدار الشتاء ٢٠٢٦' : 'WINTER EDIT ’26'}
                          </span>
                          <span className="block font-editorial text-[17px] leading-tight text-white mt-0.5 truncate">
                            {isAr ? 'جواكيت توزا المختارة' : 'Signature Outerwear'}
                          </span>
                        </div>
                        <span className="w-7 h-7 border border-white/35 flex items-center justify-center shrink-0 group-hover:bg-white group-hover:text-[#111111] transition-colors">
                          {isAr ? (
                            <ArrowLeft className="w-3.5 h-3.5 stroke-[1.5]" />
                          ) : (
                            <ArrowRight className="w-3.5 h-3.5 stroke-[1.5]" />
                          )}
                        </span>
                      </div>
                    </button>

                    {/* Pure Classic Typographic Utilities Bar (No Clunky Boxes) */}
                    <div className="mt-4 pt-3 border-t border-[#e6e1d6] flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[10.5px] tracking-[0.14em] uppercase font-body text-[#5e5950]">
                      {onOpenSizeGuide && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setMobileMenuOpen(false);
                              onOpenSizeGuide();
                            }}
                            className="hover:text-[#111111] transition-colors cursor-pointer"
                          >
                            {isAr ? 'المقاسات' : 'Size Guide'}
                          </button>
                          <span className="text-[#cfc6b6]" aria-hidden="true">·</span>
                        </>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          onOpenSearch();
                        }}
                        className="hover:text-[#111111] transition-colors cursor-pointer"
                      >
                        {isAr ? 'البحث' : 'Search'}
                      </button>

                      <span className="text-[#cfc6b6]" aria-hidden="true">·</span>

                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          onOpenWishlist();
                        }}
                        className="hover:text-[#111111] transition-colors cursor-pointer tabular-nums"
                      >
                        {isAr ? `المفضلة (${wishlistCount})` : `Saved (${wishlistCount})`}
                      </button>

                      <span className="text-[#cfc6b6]" aria-hidden="true">·</span>

                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          onOpenCart();
                        }}
                        className="hover:text-[#111111] transition-colors cursor-pointer tabular-nums"
                      >
                        {isAr ? `السلة (${cartCount})` : `Bag (${cartCount})`}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tailored Heritage Maison Footer */}
                <div className="px-6 py-4 border-t border-[#e6e1d6] bg-[#f3efe7] space-y-3">
                  {/* Double-Bordered Obsidian Concierge CTA */}
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-3 px-4 bg-[#121211] text-[#f8f6f1] ring-1 ring-inset ring-white/15 hover:bg-[#232220] transition-colors text-[11px] tracking-[0.18em] uppercase font-medium flex items-center justify-center gap-2 btn-atc-sheen"
                  >
                    <MessageCircle className="w-3.5 h-3.5 stroke-[1.6] text-[#d8c4a0]" />
                    <span>
                      {isAr ? 'الطلب المباشر عبر واتساب' : 'ORDER VIA WHATSAPP'}
                    </span>
                  </a>

                  {/* Language Switch & Quiet Socials Row */}
                  <div className="flex items-center justify-between pt-0.5 text-[11px] font-body text-[#6e685e]">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setLanguage('en')}
                        className={`cursor-pointer transition-colors tracking-[0.1em] ${
                          !isAr
                            ? 'text-[#111111] font-semibold border-b border-[#9c8563]'
                            : 'text-[#8c857a] hover:text-[#111111]'
                        }`}
                      >
                        EN
                      </button>
                      <span className="text-[#cfc6b6]">/</span>
                      <button
                        type="button"
                        onClick={() => setLanguage('ar')}
                        className={`cursor-pointer transition-colors ${
                          isAr
                            ? 'text-[#111111] font-semibold border-b border-[#9c8563]'
                            : 'text-[#8c857a] hover:text-[#111111]'
                        }`}
                      >
                        عربي
                      </button>
                    </div>

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
                      className="w-full text-center text-[10px] tracking-[0.16em] uppercase text-[#7f776a] hover:text-[#111111] cursor-pointer pt-1.5 border-t border-[#e6e1d6]"
                    >
                      {isAr ? 'لوحة التحكم' : 'Admin Dashboard'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};

export const Navbar = React.memo(NavbarComponent);
