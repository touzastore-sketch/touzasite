import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Heart, User as UserIcon, ShoppingBag, Search, X } from 'lucide-react';
import { ViewMode, StoreSettings } from '../types';
import { useLanguage } from '../context/LanguageContext';
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
  storeSettings,
  user,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [menuAnimated, setMenuAnimated] = useState(false);

  useEffect(() => {
    if (mobileMenuOpen) {
      const timer = setTimeout(() => setMenuAnimated(true), 30);
      return () => clearTimeout(timer);
    } else {
      setMenuAnimated(false);
    }
  }, [mobileMenuOpen]);

  const displayBrandName =
    (language === 'ar' ? storeSettings?.storeNameAr : storeSettings?.storeNameEn) ||
    (language === 'ar' ? 'توزا TOUZA' : 'TOUZA CASUAL');

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
              className="flex whitespace-nowrap gap-10 animate-marquee"
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
          {/* Menu Button (Frameless, Minimalist & Luxury with 44x44px Touch Target) */}
          <div className="shrink-0 z-20 flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`group flex items-center justify-center gap-2 sm:gap-3 transition-colors duration-300 focus:outline-none cursor-pointer min-h-[44px] min-w-[44px] px-2 rounded-xl ${
                isTransparent
                  ? 'text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)] hover:text-[#e2c792] hover:bg-white/10'
                  : 'text-[#000000] hover:text-[#8c734b] hover:bg-black/5'
              }`}
              aria-label="Toggle menu"
            >
              {/* Custom Ultra-Thin 3-Line Animated Hamburger Icon (~24px wide) */}
              <div className="relative w-[22px] sm:w-[26px] h-3.5 flex flex-col justify-between items-start py-[1px]">
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
              <span className="hidden sm:inline font-label-caps text-[11px] sm:text-[12px] font-medium tracking-[0.18em] sm:tracking-[0.28em] uppercase transition-colors">
                {language === 'ar' ? 'القائمة' : 'MENU'}
              </span>
            </button>
          </div>

          {/* Brand Logo - Centered with flex-1 & min-w-0 to prevent overlap */}
          <div className="flex-1 min-w-0 flex items-center justify-center px-1 sm:px-2 z-10 text-center">
            <button
              onClick={() => onNavigate('home')}
              className={`font-display text-[18px] xs:text-[21px] sm:text-[28px] md:text-[36px] tracking-tighter truncate text-center transition-all cursor-pointer max-w-full min-h-[44px] flex items-center justify-center ${
                isTransparent
                  ? 'text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)] hover:text-white/90'
                  : 'text-[#000000] hover:opacity-90'
              }`}
            >
              {displayBrandName}
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
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className={`absolute inset-0 bg-black/75 backdrop-blur-md transition-opacity duration-500 ${
              menuAnimated ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Side Drawer */}
          <aside
            className={`absolute inset-y-0 ${
              language === 'ar' ? 'right-0' : 'left-0'
            } max-w-full flex transition-transform duration-500 ease-out`}
          >
            <div className="w-screen max-w-xs sm:max-w-md bg-[#0a0a0b] text-[#f5f0eb] border-r border-white/10 rtl:border-l rtl:border-r-0 shadow-2xl flex flex-col justify-between h-full py-8 px-6 sm:px-10 overflow-y-auto">
              <div>
                {/* Header with Brand & Close button */}
                <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/10">
                  <div className="flex flex-col">
                    <span className="font-display text-[22px] sm:text-[26px] font-light tracking-wide text-[#f5f0eb]">
                      {displayBrandName}
                    </span>
                    <span className="font-label-caps text-[10px] tracking-[0.3em] text-[#c5a059] uppercase mt-0.5">
                      {language === 'ar' ? 'أزياء رجالية' : "MEN'S WEAR"}
                    </span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-white/70 hover:text-[#c5a059] hover:bg-white/10 rounded-full transition-all duration-300 cursor-pointer"
                    aria-label="Close menu"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Main Nav links with Staggered Animation & Editorial Styling */}
                <div className="flex flex-col text-start py-2">
                  {navLinks.map((link, index) => {
                    const formattedNum = `0${index + 1}`;
                    return (
                      <button
                        key={link.labelKey}
                        onClick={() => {
                          setMobileMenuOpen(false);
                          handleNavClick(link);
                        }}
                        style={{
                          transitionDelay: `${index * 80 + 100}ms`,
                        }}
                        className={`group relative py-3.5 sm:py-5 border-b border-white/10 flex items-baseline gap-4 text-start cursor-pointer transition-all duration-500 ease-out min-h-[48px] ${
                          menuAnimated
                            ? 'translate-x-0 opacity-100'
                            : language === 'ar'
                            ? 'translate-x-8 opacity-0'
                            : '-translate-x-8 opacity-0'
                        }`}
                      >
                        {/* Refined Gold Number */}
                        <span className="font-mono text-[12px] sm:text-[13px] text-[#c5a059] tracking-[0.25em] font-light min-w-[30px]">
                          {formattedNum}
                        </span>

                        {/* Editorial Typography & Hover Underline */}
                        <span className="font-display text-[26px] sm:text-[34px] md:text-[38px] font-extralight tracking-wide text-[#f5f0eb] group-hover:text-[#c5a059] transition-colors duration-300 relative">
                          {t(link.labelKey, link.defaultLabel)}
                          {/* Animated Underline */}
                          <span className="absolute bottom-[-2px] left-0 right-0 h-[1px] bg-[#c5a059] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left rtl:origin-right" />
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Footer actions inside drawer */}
              <div className="pt-6 border-t border-white/10 flex flex-col gap-4">
                {/* Minimalist Language Switcher EN / عربي with 44px min touch height */}
                <div className="flex items-center justify-center gap-3 py-1">
                  <button
                    onClick={() => {
                      setLanguage('ar');
                      setMobileMenuOpen(false);
                    }}
                    className={`min-h-[44px] min-w-[100px] px-4 py-2 rounded-xl font-label-caps text-[12px] font-bold tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      language === 'ar'
                        ? 'bg-[#c5a059] text-black shadow-md'
                        : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span>العربية</span>
                  </button>
                  <button
                    onClick={() => {
                      setLanguage('en');
                      setMobileMenuOpen(false);
                    }}
                    className={`min-h-[44px] min-w-[100px] px-4 py-2 rounded-xl font-label-caps text-[12px] font-bold tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      language === 'en'
                        ? 'bg-[#c5a059] text-black shadow-md'
                        : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span>ENGLISH</span>
                  </button>
                </div>

                {/* Outline Buttons for Saved Items & Account */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenWishlist();
                    }}
                    className="flex items-center justify-center gap-2 min-h-[48px] py-2.5 px-3 border border-white/20 hover:border-[#c5a059] text-white hover:text-[#c5a059] transition-all duration-300 font-label-caps text-[12px] tracking-wider cursor-pointer bg-white/5 hover:bg-white/10 rounded-xl"
                  >
                    <Heart className={`w-5 h-5 ${wishlistCount > 0 ? 'text-red-400 fill-red-400' : 'text-[#c5a059]'}`} />
                    <span>{t('nav.wishlist', 'المفضلة')} ({wishlistCount})</span>
                  </button>

                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAccount();
                    }}
                    className="flex items-center justify-center gap-2 min-h-[48px] py-2.5 px-3 border border-white/20 hover:border-[#c5a059] text-white hover:text-[#c5a059] transition-all duration-300 font-label-caps text-[12px] tracking-wider cursor-pointer bg-white/5 hover:bg-white/10 rounded-xl"
                  >
                    <UserIcon className="w-5 h-5 text-[#c5a059]" />
                    <span>{t('nav.account', 'الحساب')}</span>
                  </button>
                </div>

                {/* Mobile Drawer Social Links */}
                <div className="flex flex-col items-center pt-4 border-t border-white/10">
                  <span className="font-label-caps text-[10px] text-[#c5a059] mb-3 tracking-[0.25em] uppercase opacity-80">
                    {language === 'ar' ? 'منصات الدار' : 'ATELIER PLATFORMS'}
                  </span>
                  <SocialLinks variant="horizontal" theme="dark" storeSettings={storeSettings} />
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

