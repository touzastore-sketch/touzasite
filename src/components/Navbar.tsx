import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  Heart,
  User as UserIcon,
  ShoppingBag,
  Search,
  X,
  ChevronDown,
  ChevronUp,
  Ruler,
  Tag,
  MapPin,
  Phone,
  MessageCircle,
  Sparkles,
  Compass,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
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

      {/* Side Drawer Navigation - Pure Classic Minimalist Luxury (كلاسيك سيمبل خالص) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[99999] overflow-hidden" role="dialog" aria-modal="true">
          {/* Subtle Deep Backdrop */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 cursor-pointer z-40"
            aria-label={language === 'ar' ? 'إغلاق القائمة' : 'Close menu'}
          />

          {/* Side Drawer */}
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
            <div className="w-[82vw] sm:w-[340px] max-w-full bg-[#0a0a0c] text-[#f5f0e8] border-r border-[#c5a059]/20 rtl:border-l rtl:border-r-0 shadow-[0_0_40px_rgba(0,0,0,0.9)] flex flex-col justify-between h-full pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))] relative overflow-hidden select-none">
              
              {/* 1. Classic Wordmark Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] shrink-0">
                <div className="flex flex-col text-start">
                  <span className="font-display text-[22px] font-bold tracking-[0.25em] uppercase text-white">
                    TOUZA
                  </span>
                  <span className="font-label-caps text-[9px] tracking-[0.3em] text-[#c5a059] uppercase">
                    {language === 'ar' ? 'دار أزياء • بورسعيد' : 'MAISON DE MODE • PORT SAID'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-9 h-9 min-w-[36px] min-h-[36px] flex items-center justify-center text-white/60 hover:text-white rounded-full border border-white/10 hover:border-[#c5a059]/50 transition-colors cursor-pointer active:scale-95"
                  aria-label="Close menu"
                >
                  <X className="w-4.5 h-4.5 stroke-[1.5]" />
                </button>
              </div>

              {/* 2. Pure Editorial Navigation Links (Spacious, Minimalist, Classic) */}
              <nav className="flex-1 overflow-y-auto hide-scrollbar px-6 py-6 flex flex-col justify-center space-y-5">
                {/* 2.1 Home */}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('home');
                  }}
                  className={`text-start font-display text-[19px] sm:text-[21px] transition-all duration-200 cursor-pointer block ${
                    currentView === 'home'
                      ? 'text-[#c5a059] font-bold ltr:translate-x-1.5 rtl:-translate-x-1.5'
                      : 'text-white/85 hover:text-[#c5a059] hover:ltr:translate-x-1 hover:rtl:-translate-x-1'
                  }`}
                >
                  {language === 'ar' ? 'الرئيسية' : 'Home'}
                </button>

                {/* 2.2 Winter Collection (Single Category) */}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('shop', 'Winter Collection');
                  }}
                  className="text-start font-display text-[19px] sm:text-[21px] text-white/95 hover:text-[#c5a059] hover:ltr:translate-x-1 hover:rtl:-translate-x-1 transition-all duration-200 cursor-pointer block group"
                >
                  <span className="flex items-center justify-between">
                    <span>{language === 'ar' ? 'ملابس شتوي' : 'Winter Collection'}</span>
                    <span className="text-[10px] font-label-caps tracking-widest text-[#c5a059] uppercase opacity-75 group-hover:opacity-100">
                      {language === 'ar' ? 'مجموعة الشتاء' : 'COLLECTION'}
                    </span>
                  </span>
                </button>

                {/* 2.3 All Products */}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('shop', 'All');
                  }}
                  className="text-start font-display text-[19px] sm:text-[21px] text-white/85 hover:text-[#c5a059] hover:ltr:translate-x-1 hover:rtl:-translate-x-1 transition-all duration-200 cursor-pointer block"
                >
                  {language === 'ar' ? 'جميع المعروضات' : 'All Garments'}
                </button>

                {/* 2.4 Size Guide */}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onOpenSizeGuide) onOpenSizeGuide();
                  }}
                  className="text-start font-display text-[18px] sm:text-[20px] text-white/75 hover:text-[#c5a059] hover:ltr:translate-x-1 hover:rtl:-translate-x-1 transition-all duration-200 cursor-pointer block"
                >
                  {language === 'ar' ? 'جدول المقاسات' : 'Size Guide'}
                </button>

                {/* 2.5 Quick Search Trigger */}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenSearch();
                  }}
                  className="text-start font-display text-[18px] sm:text-[20px] text-white/75 hover:text-[#c5a059] hover:ltr:translate-x-1 hover:rtl:-translate-x-1 transition-all duration-200 cursor-pointer block"
                >
                  {language === 'ar' ? 'البحث في المتجر' : 'Search Collection'}
                </button>

                {/* 2.6 Direct Contact WhatsApp */}
                <a
                  href="https://wa.me/+201070606272"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-start font-display text-[18px] sm:text-[20px] text-[#c5a059]/90 hover:text-[#c5a059] hover:ltr:translate-x-1 hover:rtl:-translate-x-1 transition-all duration-200 cursor-pointer block"
                >
                  {language === 'ar' ? 'تواصل معنا (واتساب)' : 'Concierge & Inquiries'}
                </a>
              </nav>

              {/* 3. Quiet Classic Bottom Strip */}
              <div className="px-6 pt-4 pb-2 border-t border-white/[0.08] shrink-0 space-y-3">
                {/* Actions: Account / Wishlist / Cart */}
                <div className="flex items-center justify-between text-[13px] font-body text-white/80">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAccount();
                    }}
                    className="hover:text-[#c5a059] transition-colors cursor-pointer py-1"
                  >
                    {user
                      ? user.displayName || (language === 'ar' ? 'حسابي' : 'Account')
                      : language === 'ar'
                      ? 'تسجيل الدخول'
                      : 'Sign In'}
                  </button>

                  <span className="text-white/20">·</span>

                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenWishlist();
                    }}
                    className="hover:text-[#c5a059] transition-colors cursor-pointer py-1"
                  >
                    {language === 'ar' ? 'المفضلة' : 'Wishlist'} ({wishlistCount})
                  </button>

                  <span className="text-white/20">·</span>

                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenCart();
                    }}
                    className="hover:text-[#c5a059] transition-colors cursor-pointer py-1"
                  >
                    {language === 'ar' ? 'الحقيبة' : 'Bag'} ({cartCount})
                  </button>
                </div>

                {/* Clean Language & Hotline Row */}
                <div className="flex items-center justify-between pt-2 border-t border-white/[0.05] text-[11px] font-label-caps text-white/50 tracking-wider">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setLanguage('ar');
                        setMobileMenuOpen(false);
                      }}
                      className={`cursor-pointer transition-colors ${
                        language === 'ar' ? 'text-[#c5a059] font-bold' : 'hover:text-white'
                      }`}
                    >
                      العربية
                    </button>
                    <span>/</span>
                    <button
                      type="button"
                      onClick={() => {
                        setLanguage('en');
                        setMobileMenuOpen(false);
                      }}
                      className={`cursor-pointer transition-colors ${
                        language === 'en' ? 'text-[#c5a059] font-bold' : 'hover:text-white'
                      }`}
                    >
                      EN
                    </button>
                  </div>

                  <a
                    href="https://wa.me/+201070606272"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-white/60 hover:text-[#c5a059] transition-colors dir-ltr"
                  >
                    01070606272
                  </a>
                </div>

                {/* Admin Link - STRICTLY ONLY for touzastore@gmail.com */}
                {user?.email === 'touzastore@gmail.com' && onOpenAdmin && (
                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenAdmin();
                      }}
                      className="text-[10px] font-label-caps text-[#c5a059]/60 hover:text-[#c5a059] cursor-pointer"
                    >
                      🔐 {language === 'ar' ? 'لوحة التحكم' : 'Admin'}
                    </button>
                  </div>
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

