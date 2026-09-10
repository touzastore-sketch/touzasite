import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Heart, User as UserIcon, ShoppingBag, Search, X, ChevronDown, ChevronUp, Ruler, Tag, MapPin } from 'lucide-react';
import { ViewMode, StoreSettings, Category } from '../types';
import { DEFAULT_CATEGORIES } from '../data/defaultCategories';
import { useLanguage } from '../context/LanguageContext';
import { SocialLinks } from './SocialLinks';
import { TouzaLogo } from './TouzaLogo';

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
  onOpenAccount,
  onOpenAdmin,
  onOpenSizeGuide,
  categories,
  storeSettings,
  user,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [menuAnimated, setMenuAnimated] = useState(false);
  const [categoriesExpanded, setCategoriesExpanded] = useState(true);

  const activeCategories: Category[] = categories && categories.length > 0 ? categories : DEFAULT_CATEGORIES;

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

  const displayBrandName =
    (storeSettings?.storeNameEn && storeSettings.storeNameEn.trim() !== 'TOUZA CASUAL'
      ? storeSettings.storeNameEn
      : 'TOUZA');

  const isScrolled = React.useSyncExternalStore(
    (callback) => {
      window.addEventListener('scroll', callback, { passive: true });
      window.addEventListener('resize', callback, { passive: true });
      return () => {
        window.removeEventListener('scroll', callback);
        window.removeEventListener('resize', callback);
      };
    },
    () => (typeof window !== 'undefined' ? (window.pageYOffset || document.documentElement.scrollTop || 0) > 30 : false),
    () => false
  );

  const navLinks = [
    { labelKey: 'nav.home', defaultLabel: 'Home', view: 'home' as ViewMode },
    { labelKey: 'nav.about', defaultLabel: 'About', view: 'home' as ViewMode, anchor: '#about' },
    { labelKey: 'nav.collections', defaultLabel: 'Collections', view: 'shop' as ViewMode, category: 'All' },
    { labelKey: 'nav.contact', defaultLabel: 'Contact Us', view: 'home' as ViewMode, anchor: '#footer' },
  ];

  const handleNavClick = (link: (typeof navLinks)[0]) => {
    onNavigate(link.view, link.category);
    if (link.anchor) {
      setTimeout(() => {
        const el = document.querySelector(link.anchor!);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const isTransparent = currentView === 'home' && !isScrolled;
  const rawTopAnnouncement =
    (language === 'ar' ? storeSettings?.announcementAr : storeSettings?.announcementEn)?.trim() ||
    storeSettings?.announcementAr?.trim() ||
    storeSettings?.announcementEn?.trim() ||
    "TOUZA MEN'S WEAR";

  const showTopAnnouncement = storeSettings?.enableMarqueeBar !== false;

  // Parse custom messages cleanly without hardcoded injections
  let announcementItems: string[] = [];
  if (rawTopAnnouncement && rawTopAnnouncement.trim()) {
    if (rawTopAnnouncement.includes('|')) {
      announcementItems = rawTopAnnouncement.split('|').map((s) => s.trim()).filter(Boolean);
    } else if (rawTopAnnouncement.includes('\n')) {
      announcementItems = rawTopAnnouncement.split('\n').map((s) => s.trim()).filter(Boolean);
    } else {
      announcementItems = [rawTopAnnouncement.trim()];
    }
  }

  const effectiveItems = announcementItems.length > 0 ? announcementItems : ["TOUZA MEN'S WEAR"];
  // Repeat items for seamless continuous ticker
  const repeatCount = Math.max(4, Math.ceil(12 / effectiveItems.length));
  const marqueeList = Array(repeatCount).fill(effectiveItems).flat();

  const marqueeSymbol = storeSettings?.marqueeSymbol || '✦';

  return (
    <>
      <header
        id="navbar"
        className={`fixed top-0 left-0 w-full z-[100] transition-colors duration-300 ease-in-out pt-[env(safe-area-inset-top,0px)] ${
          isTransparent
            ? 'bg-[#0a0a0c]/90 backdrop-blur-md border-b border-white/10 shadow-sm'
            : 'bg-white/98 backdrop-blur-md shadow-md border-b border-[#000000]/10'
        }`}
      >
        {/* Top Announcement Bar (Infinite Moving Marquee Ticker) */}
        {showTopAnnouncement && (
          <div 
            dir="ltr"
            className="w-full min-h-[26px] bg-[#111111] text-[#e2c792] text-[11px] sm:text-[12px] font-medium py-1.5 border-b border-[#e2c792]/20 overflow-hidden font-label-caps whitespace-nowrap marquee-container select-none shrink-0"
          >
            <div
              className="flex whitespace-nowrap gap-10 animate-marquee w-max"
              style={{ animationDuration: '24s' }}
            >
              <div className="flex items-center gap-10 shrink-0">
                {marqueeList.map((item, idx) => (
                  <span key={`nav-ann-${idx}`} className="flex items-center gap-3">
                    <span className="text-[#e2c792] text-[10px] opacity-80">{marqueeSymbol}</span>
                    <span className="tracking-[0.18em]">{item}</span>
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-10 shrink-0">
                {marqueeList.map((item, idx) => (
                  <span key={`nav-ann-dup-${idx}`} className="flex items-center gap-3">
                    <span className="text-[#e2c792] text-[10px] opacity-80">{marqueeSymbol}</span>
                    <span className="tracking-[0.18em]">{item}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className={`max-w-[1440px] mx-auto px-3 sm:px-6 md:px-16 flex items-center justify-between gap-2 sm:gap-4 relative ${
          isTransparent ? 'py-2 md:py-3.5 border-b border-white/15' : 'py-2 md:py-3'
        }`}>
          {/* Menu Button (Frameless, Minimalist & Luxury with 48x48px Touch Target) */}
          <div className="shrink-0 z-30 flex items-center">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMobileMenuOpen((prev) => !prev);
              }}
              className={`group flex items-center justify-center gap-2 sm:gap-3 transition-colors duration-300 focus:outline-none cursor-pointer min-h-[48px] min-w-[48px] px-2.5 rounded-xl active:scale-95 ${
                isTransparent
                  ? 'text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)] hover:text-[#e2c792] hover:bg-white/10'
                  : 'text-[#000000] hover:text-[#8c734b] hover:bg-black/5'
              }`}
              aria-label={language === 'ar' ? 'فتح القائمة' : 'Toggle menu'}
            >
              {/* Custom Ultra-Thin 3-Line Animated Hamburger Icon (~24px wide) */}
              <div className="relative w-[22px] sm:w-[26px] h-3.5 flex flex-col justify-between items-start py-[1px] pointer-events-none">
                <span
                  className={`block h-[1.5px] bg-current transition-all duration-300 ease-out origin-center ${
                    mobileMenuOpen
                      ? 'w-[22px] sm:w-[26px] translate-y-[5.5px] rotate-45'
                      : 'w-[22px] sm:w-[26px]'
                  }`}
                />
                <span
                  className={`block h-[1.5px] bg-current transition-all duration-300 ease-out ${
                    mobileMenuOpen
                      ? 'w-0 opacity-0'
                      : 'w-[14px] sm:w-[18px] group-hover:w-[22px] sm:group-hover:w-[26px]'
                  }`}
                />
                <span
                  className={`block h-[1.5px] bg-current transition-all duration-300 ease-out origin-center ${
                    mobileMenuOpen
                      ? 'w-[22px] sm:w-[26px] -translate-y-[5.5px] -rotate-45'
                      : 'w-[18px] sm:w-[22px] group-hover:w-[22px] sm:group-hover:w-[26px]'
                  }`}
                />
              </div>
              <span className="hidden sm:inline font-label-caps text-[11px] sm:text-[12px] font-medium tracking-[0.18em] sm:tracking-[0.28em] uppercase transition-colors pointer-events-none">
                {language === 'ar' ? 'القائمة' : 'MENU'}
              </span>
            </button>
          </div>

          {/* Brand Logo - Centered with flex-1 & min-w-0 to prevent overlap */}
          <div className="flex-1 min-w-0 flex items-center justify-center px-1 sm:px-2 z-10 text-center">
            <button
              onClick={() => onNavigate('home')}
              className={`font-display text-[20px] xs:text-[22px] sm:text-[28px] md:text-[34px] font-bold tracking-[0.14em] sm:tracking-[0.20em] uppercase truncate text-center transition-all cursor-pointer max-w-full min-h-[44px] flex items-center justify-center ${
                isTransparent
                  ? 'text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)] hover:text-white/90'
                  : 'text-[#000000] hover:opacity-90'
              }`}
            >
              TOUZA
            </button>
          </div>

          {/* Trailing Icons & Language Switcher (Visible on both Mobile & Desktop) */}
          <div
            className={`shrink-0 z-20 flex items-center gap-1 sm:gap-2.5 md:gap-4 transition-colors ${
              isTransparent ? 'text-white' : 'text-[#000000]'
            }`}
          >
            {/* Social Media Links (Desktop/Tablet) */}
            <div
              className={`hidden xl:flex items-center ltr:mr-1 rtl:ml-1 ltr:pr-2 rtl:pl-2 border-r ltr:border-r rtl:border-l ${
                isTransparent ? 'border-white/20' : 'border-[#c4c7c7]/30'
              }`}
            >
              <SocialLinks variant="horizontal" theme={isTransparent ? 'dark' : 'light'} storeSettings={storeSettings} />
            </div>

            {/* Language Switcher Pill */}
            <div
              className={`flex items-center rounded-full px-1 py-0.5 sm:px-1.5 sm:py-1 text-[10px] sm:text-[12px] font-medium transition-all h-8 sm:h-10 border ${
                isTransparent
                  ? 'border-white/30 bg-black/35 backdrop-blur-md text-white drop-shadow-sm'
                  : 'border-[#747878]/30 bg-white/80 text-[#000000] shadow-2xs'
              }`}
            >
              <button
                onClick={() => setLanguage('ar')}
                className={`min-h-[28px] sm:min-h-[36px] min-w-[34px] sm:min-w-[42px] px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full transition-all cursor-pointer flex items-center justify-center ${
                  language === 'ar'
                    ? isTransparent
                      ? 'bg-white text-black font-bold'
                      : 'bg-[#000000] text-white font-bold'
                    : isTransparent
                    ? 'text-white/80 hover:text-white'
                    : 'text-[#5e5e5c] hover:text-[#000000]'
                }`}
              >
                عربي
              </button>
              <span className={`mx-0.5 text-[9px] sm:text-[11px] ${isTransparent ? 'text-white/40' : 'text-[#c4c7c7]'}`}>|</span>
              <button
                onClick={() => setLanguage('en')}
                className={`min-h-[28px] sm:min-h-[36px] min-w-[34px] sm:min-w-[42px] px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full transition-all cursor-pointer flex items-center justify-center ${
                  language === 'en'
                    ? isTransparent
                      ? 'bg-white text-black font-bold'
                      : 'bg-[#000000] text-white font-bold'
                    : isTransparent
                    ? 'text-white/80 hover:text-white'
                    : 'text-[#5e5e5c] hover:text-[#000000]'
                }`}
              >
                EN
              </button>
            </div>

            {/* Search */}
            <button
              onClick={onOpenSearch}
              className={`w-9 h-9 sm:w-11 sm:h-11 min-w-[36px] min-h-[36px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center rounded-full transition-all cursor-pointer relative ${
                isTransparent
                  ? 'text-white hover:bg-white/15 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]'
                  : 'text-[#000000] hover:bg-[#000000]/5'
              }`}
              title={t('nav.search', 'Search')}
              aria-label={t('nav.search', 'Search')}
            >
              <Search className="w-5 h-5 sm:w-5.5 sm:h-5.5 md:w-6 md:h-6" />
            </button>

            {/* Wishlist */}
            <button
              onClick={onOpenWishlist}
              className={`w-9 h-9 sm:w-11 sm:h-11 min-w-[36px] min-h-[36px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center rounded-full transition-all cursor-pointer relative ${
                isTransparent
                  ? 'text-white hover:bg-white/15 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]'
                  : 'text-[#000000] hover:bg-[#000000]/5'
              }`}
              title={t('nav.wishlist', 'Saved Items')}
              aria-label={t('nav.wishlist', 'Saved Items')}
            >
              <Heart
                className={`w-5 h-5 sm:w-5.5 sm:h-5.5 md:w-6 md:h-6 transition-colors ${
                  wishlistCount > 0
                    ? isTransparent
                      ? 'text-red-400 fill-red-400'
                      : 'text-[#ba1a1a] fill-[#ba1a1a]'
                    : isTransparent
                    ? 'text-white'
                    : 'text-[#000000]'
                }`}
              />
              {wishlistCount > 0 && (
                <span className="absolute top-0 sm:top-0.5 right-0 sm:right-0.5 bg-[#ba1a1a] text-white text-[9px] sm:text-[10px] w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full flex items-center justify-center font-bold shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Account */}
            <button
              onClick={onOpenAccount}
              className={`w-9 h-9 sm:w-11 sm:h-11 min-w-[36px] min-h-[36px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center rounded-full transition-all cursor-pointer relative ${
                isTransparent
                  ? 'text-white hover:bg-white/15 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]'
                  : 'text-[#000000] hover:bg-[#000000]/5'
              }`}
              title={user?.email || t('nav.account', 'Account')}
              aria-label={user?.email || t('nav.account', 'Account')}
            >
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Account'}
                  className={`w-5.5 h-5.5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full object-cover border ${
                    isTransparent ? 'border-white/40' : 'border-[#000000]/20'
                  }`}
                />
              ) : (
                <div className="relative flex items-center justify-center">
                  <UserIcon className="w-5 h-5 sm:w-5.5 sm:h-5.5 md:w-6 md:h-6" />
                  {user && (
                    <span className="absolute bottom-0 right-0 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-[#2e7d32] rounded-full ring-1 ring-white" />
                  )}
                </div>
              )}
            </button>

            {/* Cart */}
            <button
              onClick={onOpenCart}
              className={`w-9 h-9 sm:w-11 sm:h-11 min-w-[36px] min-h-[36px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center rounded-full transition-all cursor-pointer relative ${
                isTransparent
                  ? 'text-white hover:bg-white/15 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]'
                  : 'text-[#000000] hover:bg-[#000000]/5'
              }`}
              title={t('nav.cart', 'Shopping Bag')}
              aria-label={t('nav.cart', 'Shopping Bag')}
            >
              <ShoppingBag className="w-5 h-5 sm:w-5.5 sm:h-5.5 md:w-6 md:h-6" />
              {cartCount > 0 && (
                <span
                  className={`absolute top-0 sm:top-0.5 right-0 sm:right-0.5 text-[9px] sm:text-[10px] w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full flex items-center justify-center font-bold ${
                    isTransparent
                      ? 'bg-white text-black shadow-sm'
                      : 'bg-[#000000] text-white'
                  }`}
                >
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Side Drawer Navigation (Mobile & Desktop) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[99999] overflow-hidden" role="dialog" aria-modal="true">
          {/* Soft Backdrop */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 cursor-pointer z-40"
            aria-label={language === 'ar' ? 'إغلاق القائمة' : 'Close menu'}
          />

          {/* Side Drawer - Clean Classic Layout */}
          <aside
            className={`fixed top-0 bottom-0 ${
              language === 'ar' ? 'right-0' : 'left-0'
            } max-w-full flex z-50 transition-transform duration-300 ease-out h-[100dvh] max-h-[100dvh] ${
              menuAnimated
                ? 'translate-x-0'
                : language === 'ar'
                ? 'translate-x-full'
                : '-translate-x-full'
            }`}
          >
            <div className="w-[85vw] max-w-[340px] sm:max-w-[375px] bg-[#ffffff] text-[#1a1c1c] border-r border-[#000000]/10 rtl:border-l rtl:border-r-0 shadow-2xl flex flex-col justify-between h-full pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]">
              {/* Header with Brand & Close button */}
              <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#000000]/10 shrink-0">
                <div className="flex items-center gap-2.5">
                  <TouzaLogo className="w-7 h-11 shrink-0" variant="gold" showFrame={true} />
                  <div className="flex flex-col">
                    <span className="font-display text-[19px] sm:text-[21px] font-bold tracking-[0.1em] uppercase text-[#1a1c1c]">
                      TOUZA
                    </span>
                    <span className="font-label-caps text-[9px] tracking-[0.2em] text-[#c5a059] uppercase -mt-0.5">
                      {language === 'ar' ? 'أزياء رجالية • بورسعيد' : "MEN'S WEAR • PORT SAID"}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-10 h-10 min-w-[40px] min-h-[40px] flex items-center justify-center text-[#1a1c1c]/70 hover:text-[#000000] hover:bg-black/5 rounded-full transition-colors cursor-pointer active:scale-95"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Navigation Items - Simple & Classic */}
              <div className="flex-1 overflow-y-auto hide-scrollbar divide-y divide-[#000000]/8">
                {/* 1. Home */}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('home');
                  }}
                  className="w-full py-3.5 px-6 text-start text-[15px] sm:text-[16px] font-medium text-[#1a1c1c] hover:text-[#c5a059] hover:bg-[#faf8f5] transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>{language === 'ar' ? 'الرئيسية' : 'Home'}</span>
                </button>

                {/* 2. Men / Categories (Expandable with subcategories) */}
                <div className="w-full">
                  <button
                    type="button"
                    onClick={() => setCategoriesExpanded((prev) => !prev)}
                    className="w-full py-3.5 px-6 text-start text-[15px] sm:text-[16px] font-medium text-[#1a1c1c] hover:text-[#c5a059] hover:bg-[#faf8f5] transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <span>{language === 'ar' ? 'أزياء رجالية' : 'Men'}</span>
                      <span className="text-[10px] font-semibold text-[#c5a059] bg-[#c5a059]/10 px-2 py-0.5 rounded-full">
                        {activeCategories.length} {language === 'ar' ? 'تصنيف' : 'items'}
                      </span>
                    </span>
                    <span className="text-neutral-500 text-xs transition-transform duration-200">
                      {categoriesExpanded ? '▲' : '▼'}
                    </span>
                  </button>

                  {/* Sub-categories List (Indented cleanly like dockland style) */}
                  {categoriesExpanded && (
                    <div className="bg-[#faf8f5]/60 border-t border-[#000000]/5 divide-y divide-[#000000]/5">
                      {/* View All Products in Shop */}
                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          onNavigate('shop', 'All');
                        }}
                        className="w-full py-2.5 px-8 sm:px-9 text-start text-[13px] sm:text-[13.5px] font-semibold text-[#1a1c1c] hover:text-[#c5a059] hover:bg-[#f3eee7] transition-colors flex items-center justify-between cursor-pointer"
                      >
                        <span>{language === 'ar' ? 'عرض كل القطع' : 'ALL PRODUCTS'}</span>
                        <span className="text-[10px] text-[#c5a059] font-mono tracking-widest uppercase">
                          {language === 'ar' ? 'الكل' : 'VIEW'}
                        </span>
                      </button>

                      {/* Store Categories */}
                      {activeCategories.map((cat) => {
                        const displayName = language === 'ar' ? (cat.nameAr || cat.nameEn) : (cat.nameEn || cat.nameAr);
                        const secondaryName = language === 'ar' ? cat.nameEn : cat.nameAr;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => {
                              setMobileMenuOpen(false);
                              onNavigate('shop', cat.nameEn || cat.nameAr);
                            }}
                            className="w-full py-2.5 px-8 sm:px-9 text-start text-[13px] sm:text-[13.5px] font-normal text-[#444748] hover:text-[#c5a059] hover:bg-[#f3eee7] transition-colors flex items-center justify-between cursor-pointer uppercase tracking-wider"
                          >
                            <span>{displayName}</span>
                            {secondaryName && secondaryName !== displayName && (
                              <span className="text-[11px] text-neutral-400 font-light normal-case">
                                {secondaryName}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 3. Summer 2026 / Collections */}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('shop', 'All');
                  }}
                  className="w-full py-3.5 px-6 text-start text-[15px] sm:text-[16px] font-medium text-[#1a1c1c] hover:text-[#c5a059] hover:bg-[#faf8f5] transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>{language === 'ar' ? 'كولكشن الصيف 2026' : 'Summer 2026'}</span>
                  <span className="text-[10px] text-amber-800 font-semibold bg-amber-50 border border-amber-200/70 px-2 py-0.5 rounded">
                    {language === 'ar' ? 'جديد' : 'NEW'}
                  </span>
                </button>

                {/* 4. Sale */}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('shop', 'All');
                  }}
                  className="w-full py-3.5 px-6 text-start text-[15px] sm:text-[16px] font-medium text-[#1a1c1c] hover:text-[#c5a059] hover:bg-[#faf8f5] transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>{language === 'ar' ? 'العروض والتخفيضات' : 'Sale'}</span>
                  <span className="text-[10px] text-white font-bold bg-[#c5a059] px-2 py-0.5 rounded tracking-wider shadow-xs">
                    SALE
                  </span>
                </button>

                {/* 5. Stores */}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setTimeout(() => {
                      const el = document.querySelector('#footer');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="w-full py-3.5 px-6 text-start text-[15px] sm:text-[16px] font-medium text-[#1a1c1c] hover:text-[#c5a059] hover:bg-[#faf8f5] transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>{language === 'ar' ? 'فروعنا وعناويننا' : 'Stores'}</span>
                  <span className="text-[11px] text-neutral-400 font-light">
                    {language === 'ar' ? 'بورسعيد' : 'Port Said'}
                  </span>
                </button>

                {/* 6. About Touza */}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (currentView !== 'home') {
                      onNavigate('home');
                    }
                    setTimeout(() => {
                      const el = document.querySelector('#about');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }, 150);
                  }}
                  className="w-full py-3.5 px-6 text-start text-[15px] sm:text-[16px] font-medium text-[#1a1c1c] hover:text-[#c5a059] hover:bg-[#faf8f5] transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>{language === 'ar' ? 'عن توزا (قصتنا)' : 'About Us'}</span>
                </button>

                {/* 7. Size Chart */}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onOpenSizeGuide) {
                      onOpenSizeGuide();
                    }
                  }}
                  className="w-full py-3.5 px-6 text-start text-[15px] sm:text-[16px] font-medium text-[#1a1c1c] hover:text-[#c5a059] hover:bg-[#faf8f5] transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>{language === 'ar' ? 'جدول المقاسات' : 'Size Chart'}</span>
                  <span className="text-neutral-400 text-xs">▾</span>
                </button>

                {/* 8. Contact Us */}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setTimeout(() => {
                      const el = document.querySelector('#footer');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="w-full py-3.5 px-6 text-start text-[15px] sm:text-[16px] font-medium text-[#1a1c1c] hover:text-[#c5a059] hover:bg-[#faf8f5] transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>{language === 'ar' ? 'تواصل معنا' : 'Contact Us'}</span>
                </button>
              </div>

              {/* Footer Actions - Classic & Clean */}
              <div className="p-5 border-t border-[#000000]/10 bg-neutral-50/50 flex flex-col gap-3.5 shrink-0">
                <div className="flex items-center justify-between text-[13.5px] font-medium text-[#1a1c1c] px-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAccount();
                    }}
                    className="hover:text-[#c5a059] transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <UserIcon className="w-4 h-4 text-[#c5a059]" />
                    <span>
                      {user
                        ? (language === 'ar' ? 'حسابي' : 'My Account')
                        : (language === 'ar' ? 'تسجيل الدخول' : 'Log in')}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenWishlist();
                    }}
                    className="hover:text-[#c5a059] transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        wishlistCount > 0 ? 'text-red-500 fill-red-500' : 'text-[#c5a059]'
                      }`}
                    />
                    <span>
                      {t('nav.wishlist', 'المفضلة')} ({wishlistCount})
                    </span>
                  </button>
                </div>

                {/* Minimalist Language Switcher */}
                <div className="flex items-center justify-center gap-2 pt-1 border-t border-[#000000]/5">
                  <button
                    type="button"
                    onClick={() => {
                      setLanguage('ar');
                      setMobileMenuOpen(false);
                    }}
                    className={`px-3 py-1 rounded text-[12px] font-bold tracking-wider transition-colors cursor-pointer ${
                      language === 'ar'
                        ? 'bg-[#c5a059] text-white'
                        : 'text-neutral-500 hover:text-black'
                    }`}
                  >
                    العربية
                  </button>
                  <span className="text-neutral-300">/</span>
                  <button
                    type="button"
                    onClick={() => {
                      setLanguage('en');
                      setMobileMenuOpen(false);
                    }}
                    className={`px-3 py-1 rounded text-[12px] font-bold tracking-wider transition-colors cursor-pointer ${
                      language === 'en'
                        ? 'bg-[#c5a059] text-white'
                        : 'text-neutral-500 hover:text-black'
                    }`}
                  >
                    ENGLISH
                  </button>
                </div>

                {/* Atelier Social Platforms */}
                <div className="flex items-center justify-center pt-1">
                  <SocialLinks variant="horizontal" theme="light" storeSettings={storeSettings} />
                </div>

                {/* Optional Admin Link */}
                {onOpenAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAdmin();
                    }}
                    className="text-[11px] text-neutral-400 hover:text-neutral-700 text-center cursor-pointer transition-colors"
                  >
                    {language === 'ar' ? 'لوحة تحكم المتجر' : 'Store Dashboard'}
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

