import React, { useState, useEffect, Suspense, lazy } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { User } from 'firebase/auth';
import { Category, Product, CartItem, ViewMode, PromoCode, StoreSettings } from './types';
import { PRODUCTS, CATALOG_VERSION } from './data/products';
import { DEFAULT_CATEGORIES, CATEGORIES_VERSION } from './data/defaultCategories';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HeroBanner } from './components/HeroBanner';
import { CategorySection } from './components/CategorySection';
import { ProductCard } from './components/ProductCard';
import { CustomerReviewsSection } from './components/CustomerReviewsSection';
import { PhilosophySection } from './components/PhilosophySection';
import { LogoMarqueeSection } from './components/LogoMarqueeSection';
import { PerksMarqueeBar } from './components/PerksMarqueeBar';
import { FloatingContactButtons } from './components/FloatingContactButtons';
import { ScrollReveal } from './components/ScrollReveal';
import { StorePreloader } from './components/StorePreloader';
import { useLanguage } from './context/LanguageContext';
import { getOptimizedImageUrl } from './utils/cloudinary';
import {
  subscribeToAuth,
  signInWithGoogle,
  subscribeToCategories,
  saveCategoryAdmin,
  updateCategoryAdmin,
  deleteCategoryAdmin,
  resetDefaultCategoriesAdmin,
  addNewsletterSubscriber,
  subscribeToProducts,
  saveProductAdmin,
  deleteProductAdmin,
  subscribeToStoreSettings,
  saveStoreSettingsAdmin,
  subscribeToPromoCodes,
  getAllPromoCodesAdmin,
  savePromoCodeAdmin,
  deletePromoCodeAdmin,
  incrementPromoCodeUsageAdmin,
  safeJsonStringify,
} from './firebase';

// Lazy-loaded Views for ultra-fast initial bundle & instant startup
const ProductDetail = lazy(() => import('./components/ProductDetail').then((m) => ({ default: m.ProductDetail })));
const CollectionsView = lazy(() => import('./components/CollectionsView').then((m) => ({ default: m.CollectionsView })));
const CheckoutView = lazy(() => import('./components/CheckoutView').then((m) => ({ default: m.CheckoutView })));
const ResetPasswordView = lazy(() => import('./components/ResetPasswordView').then((m) => ({ default: m.ResetPasswordView })));
const AdminDashboard = lazy(() => import('./components/AdminDashboard').then((m) => ({ default: m.AdminDashboard })));

// Lazy-loaded Modals & Drawers (rendered strictly on demand)
const CartDrawer = lazy(() => import('./components/CartDrawer').then((m) => ({ default: m.CartDrawer })));
const SearchModal = lazy(() => import('./components/SearchModal').then((m) => ({ default: m.SearchModal })));
const WishlistModal = lazy(() => import('./components/WishlistModal').then((m) => ({ default: m.WishlistModal })));
const ImageModal = lazy(() => import('./components/ImageModal').then((m) => ({ default: m.ImageModal })));
const SizeGuideModal = lazy(() => import('./components/SizeGuideModal').then((m) => ({ default: m.SizeGuideModal })));
const PolicyModal = lazy(() => import('./components/PolicyModal').then((m) => ({ default: m.PolicyModal })));
const AccountModal = lazy(() => import('./components/AccountModal').then((m) => ({ default: m.AccountModal })));


const getInitialViewState = (): { view: ViewMode; category: string; productId: string | null; oobCode?: string | null } => {
  if (typeof window !== 'undefined') {
    const path = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);
    const hash = window.location.hash;
    const hashParams = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash);

    const oobCode = searchParams.get('oobCode') || hashParams.get('oobCode');
    const mode = searchParams.get('mode') || hashParams.get('mode');

    if (path.includes('/reset-password') || mode === 'resetPassword' || oobCode || searchParams.get('view') === 'reset-password') {
      return { view: 'reset-password' as ViewMode, category: 'All', productId: null, oobCode };
    }
    if (path.includes('/admin') || searchParams.get('view') === 'admin' || hash.includes('admin')) {
      return { view: 'admin' as ViewMode, category: 'All', productId: null };
    }
    if (searchParams.get('view') === 'shop' || searchParams.has('category') || searchParams.has('page')) {
      return { view: 'shop' as ViewMode, category: searchParams.get('category') || 'All', productId: null };
    }
    if (searchParams.get('view') === 'product' || searchParams.has('id')) {
      return { view: 'product' as ViewMode, category: 'All', productId: searchParams.get('id') || searchParams.get('productId') };
    }
    if (searchParams.get('view') === 'checkout') {
      return { view: 'checkout' as ViewMode, category: 'All', productId: null };
    }
  }
  return { view: 'home' as ViewMode, category: 'All', productId: null };
};

export const AppContent: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const initialUrlState = getInitialViewState();
  const [currentView, setCurrentView] = useState<ViewMode>(initialUrlState.view);

  // Sync with browser URL / popstate events
  useEffect(() => {
    const handlePopState = () => {
      const state = getInitialViewState();
      setCurrentView(state.view);
      if (state.category) {
        setCategoryFilter(state.category);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Dynamic Products state initialized from local cache or fallback
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('maison_products');
      if (saved) {
        const parsed: Product[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return PRODUCTS;
    } catch {
      return PRODUCTS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('maison_products', safeJsonStringify(products));
    } catch (err) {
      console.error('Failed to store products in local cache:', err);
    }

    // Idle non-blocking image pre-warmer for smooth browsing
    if (typeof window !== 'undefined' && products && products.length > 0) {
      const idleTimer = setTimeout(() => {
        const preloadList = products.slice(0, 4);
        preloadList.forEach((prod) => {
          const rawImg = prod.colors?.[0]?.imageUrl || prod.images?.[0];
          if (rawImg && rawImg.trim()) {
            const optimized = getOptimizedImageUrl(rawImg, { width: 450, quality: 'auto:good' });
            const img = new Image();
            img.src = optimized;
          }
        });
      }, 2000);
      return () => clearTimeout(idleTimer);
    }
  }, [products]);

  // Dynamic Categories state
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem('maison_categories');
      if (saved) {
        const parsed: Category[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('maison_categories', safeJsonStringify(categories));
    } catch (err) {
      console.error('Failed to store categories in local cache:', err);
    }
  }, [categories]);

  const handleAddCategory = async (catData: Omit<Category, 'id'>) => {
    try {
      const updated = await saveCategoryAdmin(catData, categories);
      setCategories(updated);
    } catch (err) {
      console.error('Failed to save category:', err);
    }
  };

  const handleUpdateCategory = async (catId: string, updatedData: Partial<Category>) => {
    try {
      const updated = await updateCategoryAdmin(catId, updatedData, categories);
      setCategories(updated);
    } catch (err) {
      console.error('Failed to update category:', err);
    }
  };

  const handleDeleteCategory = async (catId: string) => {
    try {
      const updated = await deleteCategoryAdmin(catId, categories);
      setCategories(updated);
    } catch (err) {
      console.error('Failed to delete category:', err);
    }
  };

  const handleResetCategories = async () => {
    try {
      const updated = await resetDefaultCategoriesAdmin();
      setCategories(updated);
    } catch (err) {
      console.error('Failed to reset categories:', err);
    }
  };

  // Dynamic Promo Codes state
  const defaultPromos: PromoCode[] = [
    {
      id: 'promo-1',
      code: 'TOUZA10',
      discountType: 'percentage',
      discountPercent: 10,
      discountAmount: 0,
      maxUses: 100,
      usedCount: 0,
      isActive: true,
      expiryNote: 'خصم 10% للعملاء الجدد',
    },
    {
      id: 'promo-2',
      code: 'WELCOME50',
      discountType: 'fixed',
      discountPercent: 0,
      discountAmount: 50,
      maxUses: 50,
      usedCount: 0,
      isActive: true,
      expiryNote: 'خصم 50 ج.م على الطلب الأول',
    },
  ];

  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(() => {
    try {
      const saved = localStorage.getItem('maison_promos');
      return saved ? JSON.parse(saved) : defaultPromos;
    } catch {
      return defaultPromos;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('maison_promos', safeJsonStringify(promoCodes));
    } catch (err) {
      console.error('Failed to store promos:', err);
    }
  }, [promoCodes]);

  // Dynamic Store Banner & Appearance Settings
  const defaultSettings: StoreSettings = {
    storeNameAr: 'توزا TOUZA',
    storeNameEn: 'TOUZA CASUAL',
    taglineAr: 'ملابس كاجوال رجالي فاخرة - بورسعيد | مصر',
    taglineEn: 'Luxury Men Casual Wear - Portsaid | Egypt',
    announcementAr: "TOUZA MEN'S WEAR",
    announcementEn: "TOUZA MEN'S WEAR",
    enableMarqueeBar: true,
    marqueeSpeed: 'normal',
    marqueeBgColor: '#121212',
    marqueeTextColor: '#f3f3f3',
    marqueeSymbol: '✦',
    heroTitleAr: 'ستايلك يبدأ من هنا',
    heroTitleEn: 'Your Style Starts Here',
    heroSubtitleAr: 'تشكيلة رجالية مميزة صُممت بعناية لتمنحك إطلالة أنيقة وعصرية تناسب مختلف المناسبات، مع اختيارات تجمع بين الجودة، الراحة، والأناقة في كل تفصيلة.',
    heroSubtitleEn: 'A distinctive men’s collection crafted with care to give you a stylish and modern look for all occasions, combining quality, comfort, and elegance in every detail.',
    heroBadgeAr: 'تشكيلة توزا الرجالية • بورسعيد ومصر',
    heroBadgeEn: 'TOUZA MENSWEAR • EGYPT',
    heroImageUrl: 'https://res.cloudinary.com/qazdrpcx/video/upload/q_auto,f_mp4/v1786595529/touza_header_videos/pb3glshlcqx6jhuapcpq.mp4',
    newsletterBadgeAr: 'توزا',
    newsletterBadgeEn: 'TOUZA',
    newsletterTitleAr: 'انضم إلى عائلة توزا',
    newsletterTitleEn: 'Join TOUZA Club',
    newsletterSubtitleAr: 'اشترك للحصول على خصومات حصرية ومعاينة أحدث الكولكشنز الكاجوال قبل أي حد مع خصم 10% أول طلب.',
    newsletterSubtitleEn: 'Subscribe for exclusive drop alerts, private sales, and 10% off your first order.',
    philosophyBadgeAr: 'فلسفة البراند',
    philosophyBadgeEn: 'BRAND PHILOSOPHY',
    philosophyTitle1Ar: 'خامات ممتازة..',
    philosophyTitle1En: 'Premium Fabrics.',
    philosophyTitle2Ar: 'وراحة تدوم طول اليوم',
    philosophyTitle2En: 'Uncompromised Comfort.',
    philosophyParagraph1Ar: 'في توزا، نركز على تقديم أفضل أزياء كاجوال رجالي تجمع بين العصرية والراحة المطلقة في جميع الأوقات.',
    philosophyParagraph1En: 'At TOUZA, we craft high-end casual menswear built with 280GSM Egyptian cotton, pure flax linen, and custom relaxed tailoring.',
    philosophyParagraph2Ar: 'تصاميم تعبر عن الثقة والأناقة الكاجوال مع توصيل سريع لجميع محافظات مصر.',
    philosophyParagraph2En: 'Designed for everyday confidence with fast express shipping across all Egyptian governorates.',
    philosophyImageUrl: 'https://res.cloudinary.com/qazdrpcx/image/upload/v1786595579/touza_settings/mf5eckkcwerbrntmvvbs.png',
    socialInstagramUrl: 'https://www.instagram.com/touzamenswear?igsh=MWlibDh0OThsOGY4dg%3D%3D&utm_source=qr',
    socialFacebookUrl: '',
    socialTiktokUrl: 'https://www.tiktok.com/@eltouza95?_r=1&_t=ZS-98m1NvL2Yo3',
    socialTwitterUrl: '',
    socialWhatsappUrl: 'https://wa.me/+201070606272',
    socialYoutubeUrl: '',
    socialSnapchatUrl: '',
    branchesAr: 'للطلب والاستفسار : 01070606272  📲\nالعنوان : بورسعيد شارع ٢٣ يوليو امام قاعة البوريفاج \nيوجد شحن لجميع المحافظات 🚚',
    branchesEn: 'For orders and inquiries: 01070606272 📲\nAddress: Port Said, 23 July Street, opposite Al Bourivage Hall.\nShipping is available to all governorates 🚚\n',
    contactAr: 'للطلب والاستفسار : 01070606272  📲\nالعنوان : بورسعيد شارع ٢٣ يوليو امام قاعة البوريفاج \nيوجد شحن لجميع المحافظات 🚚',
    contactEn: 'For orders and inquiries: 01070606272 📲\nAddress: Port Said, 23 July Street, opposite Al Bourivage Hall.\nShipping is available to all governorates 🚚',
    whatsappNumber: '01070606272',
    phoneNumber: '01200031140',
    privacyAr: 'تلتزم توزا بحماية كافة بيانات العملاء بخصوصية تامة وعدم مشاركتها مع أي جهة خارجية إلا لغرض الشحن.',
    privacyEn: 'TOUZA values your privacy. All customer data is fully protected and used strictly for order fulfillment.',
    returnsAr: 'يمكنكم طلب استبدال أو استرجاع المنتجات خلال 14 يوماً من الاستلام بشرط الحفاظ على الحالة الأصلية للقطع.',
    returnsEn: 'Returns and exchanges are accepted within 14 days of delivery in original condition.',
    shippingAr: 'نوفر خدمة التوصيل السريع لجميع محافظات مصر (القاهرة والجيزة خلال 24-48 ساعة، وباقي المحافظات خلال 2-4 أيام عمل).',
    shippingEn: 'Express delivery nationwide across Egypt (Cairo & Giza within 24-48 hrs, other governorates within 2-4 business days).',
    defaultLanguage: 'ar',
    enableVodafoneCash: true,
    vodafoneCashNumber: '01012345678',
    vodafoneCashInstructionsAr: 'يرجى تحويل المبلغ المطلوب إلى رقم محفظة فودافون كاش الموضح أعلاه، ثم إدخال رقم الموبايل المحول منه لتأكيد الطلب.',
    vodafoneCashInstructionsEn: 'Please transfer the exact total amount to the Vodafone Cash number above, then enter your sender phone number to confirm your order.',
    enableOrangeCash: true,
    orangeCashNumber: '01200031140',
    orangeCashInstructionsAr: 'يرجى تحويل المبلغ المطلوب إلى رقم محفظة أورانج كاش الموضح أعلاه، ثم إدخال رقم الموبايل المحول منه لتأكيد الطلب.',
    orangeCashInstructionsEn: 'Please transfer the exact total amount to the Orange Cash number above, then enter your sender phone number to confirm your order.',
    enableInstaPay: true,
    instaPayAddress: 'touza@instapay',
    instaPayAccount: 'touza@instapay',
    instaPayPhone: '01012345678',
    instaPayInstructionsAr: 'يرجى تحويل المبلغ عبر تطبيق InstaPay إلى عنوان IPA أو رقم الهاتف الموضح أعلاه، ثم أدخل رقم الموبايل أو رقم مرجع العملية.',
    instaPayInstructionsEn: 'Please transfer the exact amount via InstaPay to the IPA handle or phone number above, then enter your sender number or reference ID.',
    enableCashOnDelivery: true,
    codInstructionsAr: 'ستقوم بدفع المبلغ الإجمالي للمندوب عند وصول الشحنة إلى عنوانك مباشرة.',
    codInstructionsEn: 'You will pay the exact total amount in cash directly to the courier upon delivery.',
    collectionsTitleAr: 'استايلك يبدأ من هنا',
    collectionsTitleEn: 'Your Style Starts Here',
    collectionsSubtitleAr: 'تشكيلة راقية صُممت بعناية فائقة لتمنحك إطلالة جذابة تناسب جميع المناسبات في مصر.',
    collectionsSubtitleEn: 'A curated selection of luxury pieces tailored with precision and unhurried elegance.',
  };

  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    try {
      // Clear out legacy cache to prevent stale data flashes
      localStorage.removeItem('maison_settings');
      localStorage.removeItem('maison_settings_v2');
      localStorage.removeItem('maison_settings_v3');

      const saved = localStorage.getItem('maison_settings_v4');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Upgrade legacy default hero text to new copy
        if (!parsed.heroTitleAr || parsed.heroTitleAr.includes('تشكيلة الخريف والشتاء') || parsed.heroTitleAr.includes('الموضة العصرية')) {
          parsed.heroTitleAr = defaultSettings.heroTitleAr;
        }
        if (!parsed.heroSubtitleAr || parsed.heroSubtitleAr.includes('تشكيلة راقية صُممت بعناية')) {
          parsed.heroSubtitleAr = defaultSettings.heroSubtitleAr;
        }
        if (parsed.heroBadgeAr && parsed.heroBadgeAr.includes('تشكيلة الخريف والشتاء')) {
          parsed.heroBadgeAr = defaultSettings.heroBadgeAr;
        }
        // Fallback for empty announcements
        if (!parsed.announcementAr || !parsed.announcementAr.trim()) {
          parsed.announcementAr = defaultSettings.announcementAr;
        }
        if (!parsed.announcementEn || !parsed.announcementEn.trim()) {
          parsed.announcementEn = defaultSettings.announcementEn;
        }
        return { ...defaultSettings, ...parsed };
      }
      return defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('maison_settings_v4', safeJsonStringify(storeSettings));
    } catch (err) {
      console.error('Failed to store settings:', err);
    }
    if (storeSettings.defaultLanguage) {
      const manualLang = localStorage.getItem('touza_user_lang_manual');
      if (!manualLang) {
        setLanguage(storeSettings.defaultLanguage);
      }
    }
  }, [storeSettings]);

  // Streamlined Real-time Firestore synchronization (uses cache-first listener for instantaneous load)
  useEffect(() => {
    let isSubscribed = true;

    // Subscribe to live Firestore updates with instantaneous local cache hydration
    const unsubscribeProducts = subscribeToProducts((liveProducts) => {
      if (isSubscribed && liveProducts && liveProducts.length > 0) {
        setProducts(liveProducts);
      }
    });

    const unsubscribeCategories = subscribeToCategories((liveCats) => {
      if (isSubscribed && liveCats && liveCats.length > 0) {
        setCategories(liveCats);
      }
    });

    const unsubscribeSettings = subscribeToStoreSettings(defaultSettings, (liveSettings) => {
      if (isSubscribed && liveSettings) {
        setStoreSettings(liveSettings);
      }
    });

    const unsubscribePromoCodes = subscribeToPromoCodes(defaultPromos, (livePromos) => {
      if (isSubscribed && livePromos && livePromos.length > 0) {
        setPromoCodes(livePromos);
      }
    });

    return () => {
      isSubscribed = false;
      unsubscribeProducts();
      unsubscribeCategories();
      unsubscribeSettings();
      unsubscribePromoCodes();
    };
  }, []);

  const [selectedProduct, setSelectedProduct] = useState<Product>(products[0] || PRODUCTS[0]);
  const [categoryFilter, setCategoryFilter] = useState<string>(initialUrlState.category || 'All');

  // Load product from URL parameter if present
  useEffect(() => {
    if (initialUrlState.productId && products.length > 0) {
      const found = products.find((p) => p.id === initialUrlState.productId);
      if (found) {
        setSelectedProduct(found);
        setCurrentView('product');
      }
    }
  }, [products]);

  // Firebase User state
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToAuth((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleSignInGoogle = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Sign-in error:', err);
    }
  };

  // Admin Handlers
  const handleAddProduct = async (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev.filter((p) => p.id !== newProduct.id)]);
    try {
      await saveProductAdmin(newProduct, products);
    } catch (err) {
      console.error('Failed to save product in Firestore:', err);
    }
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)));
    if (selectedProduct && selectedProduct.id === updatedProduct.id) {
      setSelectedProduct(updatedProduct);
    }
    try {
      await saveProductAdmin(updatedProduct, products);
    } catch (err) {
      console.error('Failed to update product in Firestore:', err);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    try {
      await deleteProductAdmin(productId);
    } catch (err) {
      console.error('Failed to delete product from Firestore:', err);
    }
  };

  const handleAddPromoCode = async (promo: PromoCode) => {
    setPromoCodes((prev) => [promo, ...prev]);
    try {
      await savePromoCodeAdmin(promo);
    } catch (err) {
      console.error('Failed to save promo code in Firestore:', err);
    }
  };

  const handleDeletePromoCode = async (promoId: string) => {
    setPromoCodes((prev) => prev.filter((p) => p.id !== promoId));
    try {
      await deletePromoCodeAdmin(promoId);
    } catch (err) {
      console.error('Failed to delete promo code in Firestore:', err);
    }
  };

  const handleTogglePromoStatus = async (promoId: string) => {
    let targetPromo: PromoCode | undefined;
    setPromoCodes((prev) =>
      prev.map((p) => {
        if (p.id === promoId) {
          targetPromo = { ...p, isActive: !p.isActive };
          return targetPromo;
        }
        return p;
      })
    );
    if (targetPromo) {
      try {
        await savePromoCodeAdmin(targetPromo);
      } catch (err) {
        console.error('Failed to update promo code status in Firestore:', err);
      }
    }
  };

  const handleUsePromoCode = async (promoId: string) => {
    let updatedPromo: PromoCode | undefined;
    setPromoCodes((prev) =>
      prev.map((p) => {
        if (p.id === promoId) {
          const newCount = (p.usedCount || 0) + 1;
          updatedPromo = {
            ...p,
            usedCount: newCount,
          };
          return updatedPromo;
        }
        return p;
      })
    );
    if (updatedPromo) {
      try {
        await incrementPromoCodeUsageAdmin(promoId);
      } catch (err) {
        console.error('Failed to increment promo code usage in Firestore:', err);
      }
    }
  };

  const handleUpdateStoreSettings = async (newSettings: StoreSettings) => {
    setStoreSettings(newSettings);
    try {
      await saveStoreSettingsAdmin(newSettings);
    } catch (err) {
      console.error('Failed to save store settings in Firestore:', err);
    }
  };

  // Cart state persisted to localStorage
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('maison_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('maison_cart', safeJsonStringify(cartItems));
    } catch {
      // fallback
    }
  }, [cartItems]);

  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('maison_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('maison_wishlist', safeJsonStringify(wishlistIds));
    } catch {
      // fallback
    }
  }, [wishlistIds]);

  // App Loading & Database Sync State
  const [isSiteLoaded, setIsSiteLoaded] = useState(false);

  // Modals / Overlays state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [policyModal, setPolicyModal] = useState<{ title: string; content: string } | null>(null);
  const [toastNotification, setToastNotification] = useState<{ show: boolean; productName: string }>({
    show: false,
    productName: '',
  });

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Handlers
  const handleNavigate = (view: ViewMode, category?: string) => {
    setCurrentView(view);
    if (category) {
      setCategoryFilter(category);
    }
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams();
      if (view === 'admin') {
        params.set('view', 'admin');
      } else if (view === 'shop') {
        params.set('view', 'shop');
        if (category && category !== 'All') {
          params.set('category', category);
        }
      } else if (view === 'checkout') {
        params.set('view', 'checkout');
      } else if (view === 'reset-password') {
        params.set('view', 'reset-password');
      }

      const newUrl = view === 'reset-password' ? '/reset-password' : (params.toString() ? `?${params.toString()}` : '/');
      window.history.pushState({}, '', newUrl);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setCurrentView('product');
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams();
      params.set('view', 'product');
      params.set('id', product.id);
      window.history.pushState({}, '', `?${params.toString()}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = (product: Product, color: string, size: string, openCart = false) => {
    const itemId = `${product.id}-${color}-${size}`;
    setCartItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.id === itemId);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      }
      return [
        ...prev,
        {
          id: itemId,
          product,
          selectedColor: color,
          selectedSize: size,
          quantity: 1,
        },
      ];
    });

    if (openCart) {
      setIsCartOpen(true);
    } else {
      const pName = language === 'ar' ? (product.nameAr || product.name) : product.name;
      setToastNotification({ show: true, productName: pName });
      setTimeout(() => {
        setToastNotification((prev) => ({ ...prev, show: false }));
      }, 3500);
    }
  };

  const handleBuyNow = (product: Product, color: string, size: string) => {
    handleAddToCart(product, color, size, false);
    setIsCartOpen(false);
    setCurrentView('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleWishlist = (product: Product) => {
    setWishlistIds((prev) =>
      prev.includes(product.id)
        ? prev.filter((id) => id !== product.id)
        : [...prev, product.id]
    );
  };

  const handleUpdateCartQuantity = (cartItemId: string, newQty: number) => {
    setCartItems((prev) =>
      prev.map((item) => (item.id === cartItemId ? { ...item, quantity: newQty } : item))
    );
  };

  // Ensure light mode strictly
  useEffect(() => {
    try {
      localStorage.removeItem('maison_dark_mode');
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark-mode-active');
    } catch (err) {
      console.error(err);
    }
  }, []);

  const handleRemoveCartItem = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail && newsletterEmail.trim()) {
      try {
        await addNewsletterSubscriber(newsletterEmail.trim(), 'الموقع الإلكتروني');
      } catch (err) {
        console.error('Newsletter save error:', err);
      }
      setNewsletterSubscribed(true);
      setNewsletterEmail('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#ffffff] text-[#1a1c1c] relative">
      {/* Luxury Branded Store Preloader (Runs on initial load until DB & critical assets are ready) */}
      {!isSiteLoaded && (
        <StorePreloader
          products={products}
          categories={categories}
          storeSettings={storeSettings}
          onFinishLoading={() => setIsSiteLoaded(true)}
        />
      )}

      {/* Top Navigation */}
      {currentView !== 'admin' && (
        <Navbar
          currentView={currentView}
          onNavigate={handleNavigate}
          cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
          wishlistCount={wishlistIds.length}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenWishlist={() => setIsWishlistOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenAccount={() => setIsAccountOpen(true)}
          onOpenAdmin={() => handleNavigate('admin')}
          storeSettings={storeSettings}
          user={user}
        />
      )}

      {/* Main View Switcher */}
      <main className="flex-1">
        {currentView === 'admin' && (
          <AdminDashboard
            products={products}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            promoCodes={promoCodes}
            onAddPromoCode={handleAddPromoCode}
            onDeletePromoCode={handleDeletePromoCode}
            onTogglePromoStatus={handleTogglePromoStatus}
            storeSettings={storeSettings}
            onUpdateStoreSettings={handleUpdateStoreSettings}
            categories={categories}
            onAddCategory={handleAddCategory}
            onUpdateCategory={handleUpdateCategory}
            onDeleteCategory={handleDeleteCategory}
            onResetCategories={handleResetCategories}
            onCloseAdmin={() => handleNavigate('home')}
          />
        )}

        {currentView === 'home' && (
          <div>
            {/* Screen 1: Hero Banner */}
            <HeroBanner
              onShopNow={() => handleNavigate('shop', 'All')}
              storeSettings={storeSettings}
            />

            {/* Featured Collection Grid */}
            <ScrollReveal>
              <section className="py-16 md:py-20 px-5 md:px-16 max-w-[1440px] mx-auto w-full">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10">
                  <div>
                    <span className="font-label-caps text-[#747878] mb-1.5 block text-[13px]">
                      {language === 'ar' ? 'مختارات البوتيك الحصرية' : 'ATELIER SELECTIONS'}
                    </span>
                    <h2 className="font-display text-[28px] md:text-[40px] text-[#000000] font-bold">
                      {language === 'ar' ? 'معروضات الصفحة الرئيسية' : 'Homepage Selection'}
                    </h2>
                  </div>
                  <button
                    onClick={() => handleNavigate('shop', 'All')}
                    className="font-label-caps text-[#000000] underline underline-offset-8 hover:text-[#747878] transition-colors mt-3 md:mt-0 cursor-pointer text-[14px]"
                  >
                    {language === 'ar' ? `عرض كل القطع (${products.length})` : `View All Pieces (${products.length})`}
                  </button>
                </div>

                {(() => {
                  const homeSelected = products.filter((p) => p.showOnHome === true || (p.showOnHome !== false && p.isFeatured));
                  const displayList = homeSelected.length > 0 ? homeSelected : products;

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {displayList.map((product, idx) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          priority={idx < 4}
                          onSelectProduct={handleSelectProduct}
                          isWishlisted={wishlistIds.includes(product.id)}
                          onToggleWishlist={(p, e) => {
                            e.stopPropagation();
                            handleToggleWishlist(p);
                          }}
                          onQuickAdd={(p, color, size) => {
                            handleAddToCart(p, color, size);
                          }}
                        />
                      ))}
                    </div>
                  );
                })()}
              </section>
            </ScrollReveal>

            {/* Seamless Full-Width Perks Marquee Bar */}
            <PerksMarqueeBar storeSettings={storeSettings} />

            {/* Editorial Brand Highlight Section (Atelier Philosophy) */}
            <PhilosophySection
              storeSettings={storeSettings}
              onExplore={() => handleNavigate('shop', 'All')}
            />

            {/* Customer Reviews Section */}
            <ScrollReveal>
              <CustomerReviewsSection
                user={user}
                onSignInGoogle={handleSignInGoogle}
                onOpenAccount={() => setIsAccountOpen(true)}
              />
            </ScrollReveal>

            {/* Press & Partner Logo Marquee */}
            <LogoMarqueeSection />

            {/* Newsletter Section */}
            <ScrollReveal>
              <section className="py-20 md:py-28 px-5 md:px-16 bg-[#ffffff] border-t border-[#c5a059]/20">
                <div className="max-w-[850px] mx-auto text-center">
                  <span className="font-label-caps text-[#8c734b] mb-2 block text-[12px] tracking-[0.25em] uppercase font-semibold">
                    {language === 'ar'
                      ? storeSettings?.newsletterBadgeAr || 'توزا'
                      : storeSettings?.newsletterBadgeEn || 'TOUZA'}
                  </span>
                  <h2 className="font-display text-[30px] md:text-[42px] text-[#1a1a1a] mb-3 font-normal tracking-tight">
                    {language === 'ar'
                      ? storeSettings?.newsletterTitleAr || 'انضم إلى مجتمع توزا'
                      : storeSettings?.newsletterTitleEn || 'Join TOUZA Sanctuary'}
                  </h2>
                  <p className="font-body text-[15px] sm:text-[16px] text-[#555555] mb-8 leading-relaxed max-w-xl mx-auto font-light">
                    {language === 'ar'
                      ? storeSettings?.newsletterSubtitleAr || 'اشترك للحصول على دعوات حصرية لمعاينة التشكيلات الجديدة قبل الجميع وحصولك على خصم ١٠٪ عند أول طلب.'
                      : storeSettings?.newsletterSubtitleEn || 'Subscribe to receive private client invitations, seasonal lookbook previews, and VIP privileges.'}
                  </p>

                  {newsletterSubscribed ? (
                    <div className="p-5 bg-[#2e7d32]/10 border border-[#2e7d32]/30 text-[#2e7d32] font-body rounded-2xl max-w-md mx-auto font-bold text-[15px] shadow-2xs">
                      {language === 'ar' ? '✓ تم الاشتراك بنجاح! تفقد بريدك للحصول على كود الخصم.' : '✓ Welcome to Maison Élégant. Check your inbox for your privilege code.'}
                    </div>
                  ) : (
                    <form
                      onSubmit={handleNewsletterSubmit}
                      className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
                    >
                      <input
                        type="email"
                        placeholder={language === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email address'}
                        value={newsletterEmail}
                        onChange={(e) => setNewsletterEmail(e.target.value)}
                        required
                        className="flex-1 input-minimal text-[15px] py-3.5 px-5 border border-[#c5a059]/40 rounded-xl bg-white/70 focus:bg-white focus:border-[#000000]"
                      />
                      <button
                        type="submit"
                        className="bg-[#1a1a1a] text-white py-3.5 px-8 font-label-caps rounded-xl hover:bg-[#c5a059] transition-all duration-300 cursor-pointer shrink-0 text-[13px] font-semibold tracking-wider shadow-xs"
                      >
                        {language === 'ar' ? 'اشتراك' : 'Subscribe'}
                      </button>
                    </form>
                  )}
                </div>
              </section>
            </ScrollReveal>
          </div>
        )}

        <Suspense fallback={<div className="min-h-[40vh] flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-[#121212]/20 border-t-[#121212] animate-spin" /></div>}>
          {currentView === 'shop' && (
            <CollectionsView
              onSelectProduct={handleSelectProduct}
              wishlistIds={wishlistIds}
              onToggleWishlist={handleToggleWishlist}
              onAddToCart={handleAddToCart}
              onNavigateHome={() => handleNavigate('home')}
              initialCategory={categoryFilter}
              products={products}
              categories={categories}
              storeSettings={storeSettings}
            />
          )}

          {currentView === 'product' && (
            <ProductDetail
              product={selectedProduct}
              products={products}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
              onSelectProduct={handleSelectProduct}
              isWishlisted={wishlistIds.includes(selectedProduct.id)}
              onToggleWishlist={handleToggleWishlist}
              onOpenImageModal={(img) => setZoomedImage(img)}
              onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
              user={user}
              onSignInGoogle={handleSignInGoogle}
              onNavigate={(view, category) => handleNavigate(view, category)}
            />
          )}

          {currentView === 'checkout' && (
            <CheckoutView
              cartItems={cartItems}
              onBackToShop={() => handleNavigate('shop', 'All')}
              onClearCart={() => setCartItems([])}
              user={user}
              onSignInGoogle={handleSignInGoogle}
              promoCodes={promoCodes}
              onUsePromoCode={handleUsePromoCode}
              storeSettings={storeSettings}
            />
          )}

          {currentView === 'reset-password' && (
            <ResetPasswordView
              initialOobCode={initialUrlState.oobCode}
              onOpenLogin={() => {
                handleNavigate('home');
                setIsAccountOpen(true);
              }}
              onNavigateHome={() => handleNavigate('home')}
            />
          )}
        </Suspense>
      </main>

      {/* Footer */}
      {currentView !== 'admin' && (
        <Footer
          onNavigate={(view, cat) => handleNavigate(view, cat)}
          onOpenPolicyModal={(title, content) => setPolicyModal({ title, content })}
          storeSettings={storeSettings}
        />
      )}

      {/* Drawers & Modals (Mounted on demand for zero startup overhead) */}
      <Suspense fallback={null}>
        {isCartOpen && (
          <CartDrawer
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            cartItems={cartItems}
            onUpdateQuantity={handleUpdateCartQuantity}
            onRemoveItem={handleRemoveCartItem}
            onProceedToCheckout={() => handleNavigate('checkout')}
          />
        )}

        {isWishlistOpen && (
          <WishlistModal
            isOpen={isWishlistOpen}
            onClose={() => setIsWishlistOpen(false)}
            wishlistIds={wishlistIds}
            onSelectProduct={handleSelectProduct}
            onRemoveWishlist={handleToggleWishlist}
            onAddToCart={handleAddToCart}
          />
        )}

        {isSearchOpen && (
          <SearchModal
            isOpen={isSearchOpen}
            onClose={() => setIsSearchOpen(false)}
            onSelectProduct={handleSelectProduct}
            products={products}
          />
        )}

        {isAccountOpen && (
          <AccountModal
            isOpen={isAccountOpen}
            onClose={() => setIsAccountOpen(false)}
            user={user}
            onSignInGoogle={handleSignInGoogle}
          />
        )}

        {isSizeGuideOpen && (
          <SizeGuideModal
            isOpen={isSizeGuideOpen}
            onClose={() => setIsSizeGuideOpen(false)}
          />
        )}

        {zoomedImage && (
          <ImageModal
            imageSrc={zoomedImage}
            onClose={() => setZoomedImage(null)}
          />
        )}

        {policyModal && (
          <PolicyModal
            title={policyModal.title || null}
            content={policyModal.content || null}
            onClose={() => setPolicyModal(null)}
          />
        )}
      </Suspense>

      {/* Floating Toast Notification for Add to Cart */}
      {toastNotification.show && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 bg-[#000000] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/20 animate-fade-in font-body text-[14px]">
          <CheckCircle2 className="w-5 h-5 text-[#25D366] shrink-0" />
          <span>
            {language === 'ar'
              ? `تمت إضافة "${toastNotification.productName}" إلى السلة`
              : `Added "${toastNotification.productName}" to cart`}
          </span>
          <button
            type="button"
            onClick={() => {
              setToastNotification({ show: false, productName: '' });
              setIsCartOpen(true);
            }}
            className="bg-white/20 hover:bg-white/30 text-white text-[12px] font-bold px-3 py-1 rounded-lg transition-colors cursor-pointer mr-2"
          >
            {language === 'ar' ? 'عرض السلة 🛍️' : 'View Cart 🛍️'}
          </button>
        </div>
      )}

      {/* Floating Animated Contact Buttons (WhatsApp & Call) */}
      {currentView !== 'admin' && (
        <FloatingContactButtons storeSettings={storeSettings} />
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return <AppContent />;
};

export default App;
