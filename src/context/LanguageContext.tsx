import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'ar' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  direction: 'rtl' | 'ltr';
  formatPrice: (amount: number) => string;
  t: (key: string, defaultText?: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  ar: {
    // Brand & Header
    'brand.name': 'توزا TOUZA',
    'nav.home': 'الرئيسية',
    'nav.about': 'عن توزا',
    'nav.collections': 'المجموعات',
    'nav.shop': 'المتجر',
    'nav.contact': 'تواصل معنا',
    'nav.search': 'بحث',
    'nav.wishlist': 'المحفوظات',
    'nav.account': 'الحساب',
    'nav.cart': 'سلة التسوق',
    'currency.symbol': 'ج.م',
    'currency.name': 'جنيه مصري',

    // Hero
    'hero.badge': 'مجموعة الخريف والشتاء الحصرية',
    'hero.title': 'أناقة فاخرة وتصاميم أزياء حصرية',
    'hero.subtitle': 'قطع راقية مصنوعة يدوياً من الحرير الطبيعي والأقمشة الفاخرة للرجل والمرأة العصرية.',
    'hero.shopNow': 'تصفح التشكيلة',
    'hero.lookbook': 'عرض الكتالوج',

    // Featured Section
    'featured.badge': 'مختارات الدار',
    'featured.title': 'التشكيلة الأساسية',
    'featured.viewAll': 'عرض كل القطع',

    // Product Card
    'product.newArrival': 'جديد',
    'product.quickAdd': 'إضافة سريعة للسلة',
    'product.addToWishlist': 'إضافة للمحفوظات',
    'product.removeFromWishlist': 'إزالة من المحفوظات',

    // Product Detail
    'detail.breadcrumbHome': 'الرئيسية',
    'detail.breadcrumbShop': 'المتجر',
    'detail.color': 'اللون',
    'detail.size': 'المقاس',
    'detail.sizeGuide': 'دليل المقاسات',
    'detail.addToCart': 'أضف إلى السلة',
    'detail.buyNow': 'شراء الآن',
    'detail.description': 'الوصف',
    'detail.detailsFit': 'التفاصيل والمقاس',
    'detail.shippingReturns': 'الشحن والإرجاع',
    'detail.shippingPolicy': 'توصيل سريع لكافة المحافظات المصرية خلال ٢-٤ أيام عمل. إمكانية المعاينة عند الاستلام والإرجاع خلال ١٤ يوماً.',
    'detail.curatedTitle': 'اخترنا لك خصيصاً',

    // Cart Drawer
    'cart.title': 'سلة التسوق',
    'cart.emptyTitle': 'سلة التسوق فارغة',
    'cart.emptySubtitle': 'لم تقم بإضافة أي قطع بعد. استكشف تشكيلتنا الفاخرة واختر ما يناسبك.',
    'cart.explore': 'تصفح التشكيلة',
    'cart.color': 'اللون',
    'cart.size': 'المقاس',
    'cart.subtotal': 'المجموع الفرعي',
    'cart.delivery': 'الشحن داخل مصر',
    'cart.free': 'مجاني',
    'cart.taxInfo': 'شامل جميع الرسوم والتوصيل للمحافظات.',
    'cart.checkout': 'المتابعة لإتمام الطلب',
    'cart.remove': 'حذف',

    // Checkout
    'checkout.title': 'إتمام الطلب',
    'checkout.backToShop': 'العودة للمتجر',
    'checkout.shippingTitle': 'بيانات الشحن والتوصيل',
    'checkout.fullName': 'الاسم بالكامل',
    'checkout.street': 'العنوان والشارع',
    'checkout.apartment': 'رقم الشقة / الدور (اختياري)',
    'checkout.city': 'المحافظة / المدينة',
    'checkout.phone': 'رقم الهاتف للتواصل',
    'checkout.paymentTitle': 'طريقة الدفع',
    'checkout.cod': 'الدفع عند الاستلام (COD)',
    'checkout.card': 'بطاقة ائتمان / ميزة / كارت بانكي',
    'checkout.cardName': 'الاسم على البطاقة',
    'checkout.cardNumber': 'رقم البطاقة',
    'checkout.expDate': 'تاريخ الانتهاء (MM/YY)',
    'checkout.cvc': 'رمز الأمان (CVC)',
    'checkout.placeOrder': 'تأكيد الطلب الآن',
    'checkout.orderSummary': 'ملخص الطلب',
    'checkout.total': 'الإجمالي النهائي',
    'checkout.successTitle': 'تم تأكيد طلبك بنجاح!',
    'checkout.successMsg': 'شكراً لتسوقك من ميزون إيليجانت. تم استلام طلبك وجاري تحضيره للتوصيل.',
    'checkout.continueShopping': 'مواصلة التسوق',

    // Wishlist
    'wishlist.title': 'القطع المحفوظة',
    'wishlist.emptyTitle': 'قائمة المحفوظات فارغة',
    'wishlist.emptySubtitle': 'اضغط على رمز القلب على أي قطعة لتحفظها هنا للعودة إليها لاحقاً.',

    // Search
    'search.title': 'البحث في المتجر',
    'search.placeholder': 'ابحث عن فستان، معطف، حقيبة، حذاء...',
    'search.popular': 'الأكثر بحثاً',
    'search.noResults': 'لم نجد قطعاً تطابق بحثك',

    // Philosophy / About
    'about.badge': 'فلسفة الدار',
    'about.title': 'إتقان رفيع.. وأناقة تدوم',
    'about.text1': 'في "ميزون إيليجانت"، نؤمن بأن الفخامة الحقيقية تكمن في البساطة والتفاصيل الدقيقة. تُصاغ كل قطعة بعناية فائقة من أقمشة الحرير الطبيعي والصوف والجلد الفاخر.',
    'about.text2': 'مصممة لتمنحك حضوراً واثقاً وأناقة هادئة عبر الفصول.',
    'about.btn': 'استكشف الدار',

    // Newsletter
    'newsletter.badge': 'نشرة الدار',
    'newsletter.title': 'انضم إلى النخبة',
    'newsletter.subtitle': 'اشترك للحصول على دعوات خاصة، ومعاينات المجموعات الجديدة، ومزايا الشحن السريع المجاني.',
    'newsletter.placeholder': 'أدخل بريدك الإلكتروني',
    'newsletter.subscribe': 'اشتراك',
    'newsletter.success': '✓ أهلاً بك في ميزون إيليجانت. تم الاشتراك بنجاح!',

    // Footer
    'footer.customerCare': 'خدمة العملاء',
    'footer.privacy': 'سياسة الخصوصية',
    'footer.terms': 'الشروط والأحكام',
    'footer.shippingInfo': 'الشحن والإرجاع',
    'footer.rights': 'جميع الحقوق محفوظة © ميزون إيليجانت',
    'footer.currency': 'العملة: الجنيه المصري (ج.م)',

    // Size guide
    'sizeGuide.title': 'دليل المقاسات',
    'sizeGuide.chest': 'الصدر',
    'sizeGuide.waist': 'الخصر',
    'sizeGuide.hips': 'الأوراك',
    'sizeGuide.close': 'إغلاق',

    // Account Modal
    'account.title': 'حساب العميل',
    'account.welcome': 'مرحباً بك في ميزون إيليجانت',
    'account.email': 'البريد الإلكتروني',
    'account.password': 'كلمة المرور',
    'account.login': 'تسجيل الدخول',
    'account.guestCheckout': 'متابعة كزائر',
  },
  en: {
    // Brand & Header
    'brand.name': 'TOUZA CASUAL',
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.collections': 'Collections',
    'nav.shop': 'Shop',
    'nav.contact': 'Contact Us',
    'nav.search': 'Search',
    'nav.wishlist': 'Saved Items',
    'nav.account': 'Account',
    'nav.cart': 'Shopping Bag',
    'currency.symbol': 'EGP',
    'currency.name': 'Egyptian Pound',

    // Hero
    'hero.badge': "TOUZA MEN'S WEAR COLLECTION",
    'hero.title': 'Timeless Grace & Sculptural Tailoring',
    'hero.subtitle': 'Handcrafted from pure silk georgette, virgin wools, and fine European leathers.',
    'hero.shopNow': 'Shop Collection',
    'hero.lookbook': 'View Lookbook',

    // Featured Section
    'featured.badge': 'ATELIER SELECTIONS',
    'featured.title': 'Essential Wardrobe',
    'featured.viewAll': 'View All Pieces',

    // Product Card
    'product.newArrival': 'New Arrival',
    'product.quickAdd': 'Quick Add to Bag',
    'product.addToWishlist': 'Add to Wishlist',
    'product.removeFromWishlist': 'Remove from Wishlist',

    // Product Detail
    'detail.breadcrumbHome': 'Home',
    'detail.breadcrumbShop': 'Shop',
    'detail.color': 'COLOR',
    'detail.size': 'SIZE',
    'detail.sizeGuide': 'Size Guide',
    'detail.addToCart': 'Add to Cart',
    'detail.buyNow': 'Buy it Now',
    'detail.description': 'Description',
    'detail.detailsFit': 'Details & Fit',
    'detail.shippingReturns': 'Shipping & Returns',
    'detail.shippingPolicy': 'Complimentary express delivery across Egypt within 2-4 business days. Returns accepted within 14 days.',
    'detail.curatedTitle': 'Curated For You',

    // Cart Drawer
    'cart.title': 'Shopping Bag',
    'cart.emptyTitle': 'Your bag is empty',
    'cart.emptySubtitle': 'Discover our timeless collections and find your new wardrobe essential.',
    'cart.explore': 'Explore Collections',
    'cart.color': 'Color',
    'cart.size': 'Size',
    'cart.subtotal': 'Subtotal',
    'cart.delivery': 'Express Delivery',
    'cart.free': 'Complimentary',
    'cart.taxInfo': 'All duties & delivery across Egypt included.',
    'cart.checkout': 'Proceed to Checkout',
    'cart.remove': 'Delete',

    // Checkout
    'checkout.title': 'Checkout',
    'checkout.backToShop': 'Back to Shop',
    'checkout.shippingTitle': 'Shipping Address',
    'checkout.fullName': 'Full Name',
    'checkout.street': 'Street Address',
    'checkout.apartment': 'Apartment / Suite (Optional)',
    'checkout.city': 'City / Governorate',
    'checkout.phone': 'Phone Number',
    'checkout.paymentTitle': 'Payment Method',
    'checkout.cod': 'Cash on Delivery (COD)',
    'checkout.card': 'Credit / Debit Card',
    'checkout.cardName': 'Name on Card',
    'checkout.cardNumber': 'Card Number',
    'checkout.expDate': 'Expiration Date (MM/YY)',
    'checkout.cvc': 'CVC Security Code',
    'checkout.placeOrder': 'Place Order',
    'checkout.orderSummary': 'Order Summary',
    'checkout.total': 'Total',
    'checkout.successTitle': 'Order Confirmed!',
    'checkout.successMsg': 'Thank you for shopping at Maison Élégant. We have received your order and are preparing it for express delivery.',
    'checkout.continueShopping': 'Continue Shopping',

    // Wishlist
    'wishlist.title': 'Saved Pieces',
    'wishlist.emptyTitle': 'Your wishlist is empty',
    'wishlist.emptySubtitle': 'Click the heart icon on any piece to save it for later.',

    // Search
    'search.title': 'Search Our Atelier',
    'search.placeholder': 'Search for dresses, coats, accessories...',
    'search.popular': 'Popular Searches',
    'search.noResults': 'No pieces matched your search',

    // Philosophy / About
    'about.badge': 'OUR PHILOSOPHY',
    'about.title': 'Pure Craftsmanship. Unhurried Elegance.',
    'about.text1': 'At Maison Élégant, we believe luxury lives in restraint. Every piece in our collection is meticulously tailored in small-batch ateliers using certified mulberry silk, virgin wools, and vegetable-tanned leathers.',
    'about.text2': 'Designed for perpetual relevance across seasons, our garments honor the wearer with quiet confidence.',
    'about.btn': 'Explore The Atelier',

    // Newsletter
    'newsletter.badge': 'TOUZA',
    'newsletter.title': 'Join TOUZA Sanctuary',
    'newsletter.subtitle': 'Subscribe to receive private client invitations, seasonal lookbook previews, and VIP privileges.',
    'newsletter.placeholder': 'Enter your email address',
    'newsletter.subscribe': 'Subscribe',
    'newsletter.success': '✓ Welcome to TOUZA. Subscribed successfully!',

    // Footer
    'footer.customerCare': 'Customer Care',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Service',
    'footer.shippingInfo': 'Shipping & Returns',
    'footer.rights': 'All rights reserved © Maison Élégant',
    'footer.currency': 'Currency: EGP (Egyptian Pound)',

    // Size guide
    'sizeGuide.title': 'Size Guide',
    'sizeGuide.chest': 'Chest',
    'sizeGuide.waist': 'Waist',
    'sizeGuide.hips': 'Hips',
    'sizeGuide.close': 'Close',

    // Account Modal
    'account.title': 'Client Account',
    'account.welcome': 'Welcome to Maison Élégant',
    'account.email': 'Email Address',
    'account.password': 'Password',
    'account.login': 'Sign In',
    'account.guestCheckout': 'Continue as Guest',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const manual = localStorage.getItem('touza_user_lang_manual');
      if (manual === 'ar' || manual === 'en') return manual;
      const settingsSaved = localStorage.getItem('maison_settings');
      if (settingsSaved) {
        const parsed = JSON.parse(settingsSaved);
        if (parsed.defaultLanguage === 'ar' || parsed.defaultLanguage === 'en') {
          return parsed.defaultLanguage;
        }
      }
    } catch {}
    return 'ar';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    try {
      localStorage.setItem('touza_user_lang_manual', lang);
    } catch {}
  };

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const direction = language === 'ar' ? 'rtl' : 'ltr';

  const formatPrice = (amount: number): string => {
    const formattedNum = amount.toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    if (language === 'ar') {
      return `${formattedNum} ج.م`;
    }
    return `${formattedNum} EGP`;
  };

  const t = (key: string, defaultText?: string): string => {
    const translated = translations[language]?.[key];
    if (translated) return translated;
    return defaultText || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        direction,
        formatPrice,
        t,
      }}
    >
      <div dir={direction} className={language === 'ar' ? 'font-arabic' : ''}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
