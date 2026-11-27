import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { User } from 'firebase/auth';
import { Category, Product, CartItem, ViewMode, PromoCode, StoreSettings } from './types';
import { CATALOG_VERSION } from './data/products';
import { DEFAULT_CATEGORIES, CATEGORIES_VERSION } from './data/defaultCategories';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HeroBanner } from './components/HeroBanner';
import { BrandsMarqueeStrip } from './components/BrandsMarqueeStrip';
import { ProductCarouselSection } from './components/ProductCarouselSection';
import { FloatingContactButtons } from './components/FloatingContactButtons';
import { FloatingTouzaBag } from './components/FloatingTouzaBag';
import { ScrollReveal } from './components/ScrollReveal';
import { StorePreloader } from './components/StorePreloader';
import { useLanguage } from './context/LanguageContext';
import { getOptimizedImageUrl, DEFAULT_HEADER_VIDEO_URL, withCacheBuster } from './utils/cloudinary';
import editorialFabricCraft from './assets/images/touza_split_craft_jackets_1795730398005.jpg';
import editorialWinterLookbook from './assets/images/touza_split_studio_model_1795730399881.jpg';
import splitStreetOlive from './assets/images/touza_split_street_blossom_1795730400195.jpg';
import splitStreetBlack from './assets/images/touza_split_street_tapestry_1795730402236.jpg';
import catModelBlossom from './assets/images/cat_model_blossom_1795730668487.jpg';
import catModelTapestry from './assets/images/cat_model_tapestry_1795730668945.jpg';
import catFlatlayTiger from './assets/images/cat_flatlay_tiger_1795730670964.jpg';
import catFlatlayPortrait from './assets/images/cat_flatlay_portrait_1795730671087.jpg';
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
  deleteMultipleProductsAdmin,
  resetDefaultProductsAdmin,
  subscribeToStoreSettings,
  saveStoreSettingsAdmin,
  fetchInitialStoreData,
  subscribeToPromoCodes,
  getAllPromoCodesAdmin,
  savePromoCodeAdmin,
  deletePromoCodeAdmin,
  incrementPromoCodeUsageAdmin,
  safeJsonStringify,
  isBannedProductId,
  sortProductsNewestFirst,
  getAllProductsAdmin,
} from './firebase';
import {
  initTikTokPixel,
  trackTikTokPageView,
  trackTikTokAddToCart,
  trackTikTokViewContent,
} from './utils/tiktokPixel';

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

  // Dynamic Products state initialized cleanly from database cache or empty array
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      if (typeof window !== 'undefined') {
        const CLEAN_KEY = 'touza_clean_catalog_v2026_11';
        if (localStorage.getItem(CLEAN_KEY) !== 'purged') {
          localStorage.setItem(CLEAN_KEY, 'purged');
          // Purge any stale products in localStorage
          try {
            const raw = localStorage.getItem('maison_products');
            if (raw) {
              const parsed: Product[] = JSON.parse(raw);
              if (Array.isArray(parsed)) {
                const cleaned = parsed.filter((p) => p && !isBannedProductId(p.id));
                localStorage.setItem('maison_products', safeJsonStringify(cleaned));
              }
            }
          } catch {}
        }
      }

      const deletedList: string[] = JSON.parse(localStorage.getItem('maison_deleted_products') || '[]');
      const deletedSet = new Set(deletedList);

      const saved = localStorage.getItem('maison_products');
      if (saved !== null) {
        const parsed: Product[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return sortProductsNewestFirst(
            parsed.filter((p) => p && !deletedSet.has(p.id) && !isBannedProductId(p.id))
          );
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  const productsRef = useRef<Product[]>(products);
  const lastLocalProductMutationRef = useRef<number>(0);

  useEffect(() => {
    productsRef.current = products;
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

  // Dynamic Categories state (Single Winter Category)
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const savedVersion = localStorage.getItem('maison_categories_version');
      if (savedVersion !== CATEGORIES_VERSION) {
        localStorage.setItem('maison_categories_version', CATEGORIES_VERSION);
        localStorage.setItem('maison_categories', safeJsonStringify(DEFAULT_CATEGORIES));
        return DEFAULT_CATEGORIES;
      }
      const saved = localStorage.getItem('maison_categories');
      if (saved) {
        const parsed: Category[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const deprecated = new Set(['cat-pants', 'cat-polos', 'cat-shirts', 'cat-shorts', 'cat-suit', 'cat-tshirts']);
          const cleanList = parsed.filter((c) => !deprecated.has(c.id));
          if (cleanList.length > 0) return cleanList;
        }
      }
      return DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('maison_categories_version', CATEGORIES_VERSION);
      localStorage.setItem('maison_categories', safeJsonStringify(categories));
    } catch (err) {
      console.error('Failed to store categories in local cache:', err);
    }
  }, [categories]);

  const handleAddCategory = async (catData: Omit<Category, 'id'>) => {
    const tempCat: Category = {
      id: 'cat-' + Date.now(),
      ...catData,
    };
    setCategories((prev) => [...prev, tempCat]);
    try {
      const updated = await saveCategoryAdmin(catData, categories);
      setCategories(updated);
    } catch (err) {
      console.error('Failed to save category:', err);
    }
  };

  const handleUpdateCategory = async (catId: string, updatedData: Partial<Category>) => {
    setCategories((prev) => prev.map((c) => (c.id === catId ? { ...c, ...updatedData } : c)));
    try {
      const updated = await updateCategoryAdmin(catId, updatedData, categories);
      setCategories(updated);
    } catch (err) {
      console.error('Failed to update category:', err);
    }
  };

  const handleDeleteCategory = async (catId: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== catId));
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

  // App Initial Database Synchronization & Loading State
  const [isInitialSyncDone, setIsInitialSyncDone] = useState(false);
  const [isSiteLoaded, setIsSiteLoaded] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(true);

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

  // Dynamic Store Banner & Appearance Settings (pre-seeded with latest live Firestore settings)
  const defaultSettings: StoreSettings = {
    storeNameAr: 'توزا TOUZA',
    storeNameEn: 'TOUZA CASUAL',
    taglineAr: 'ملابس كاجوال رجالي فاخرة - بورسعيد | مصر',
    taglineEn: 'Luxury Men Casual Wear - Portsaid | Egypt',
    announcementAr: "TOUZA MEN'S WEAR",
    announcementEn: "TOUZA MEN'S WEAR",
    enableMarqueeBar: false,
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
    heroImageUrl: 'https://res.cloudinary.com/s1vv6dqw/video/upload/ac_none,vc_h264,q_auto/v1789030762/touza_header_videos/pmec37wvaue03zau8f4z.mp4?v=1789030817345',
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
    philosophyImageUrl: 'https://res.cloudinary.com/s1vv6dqw/image/upload/f_auto,q_auto/v1789030811/touza_settings/jhjelfzdn1bsix0plhm5.png',
    socialInstagramUrl: 'https://www.instagram.com/touzamenswear?igsh=MWlibDh0OThsOGY4dg%3D%3D&utm_source=qr',
    socialFacebookUrl: '',
    socialTiktokUrl: 'https://www.tiktok.com/@eltouza95?_r=1&_t=ZS-98m1NvL2Yo3',
    socialTwitterUrl: '',
    socialWhatsappUrl: 'https://wa.me/+201070606272',
    socialYoutubeUrl: '',
    socialSnapchatUrl: '',
    branchesAr: 'للطلب والاستفسار : 01070606272\nالعنوان : بورسعيد شارع ٢٣ يوليو امام قاعة البوريفاج\nيوجد شحن لجميع المحافظات',
    branchesEn: 'For orders and inquiries: 01070606272\nAddress: Port Said, 23 July Street, opposite Al Bourivage Hall.\nShipping is available to all governorates',
    contactAr: 'للطلب والاستفسار : 01070606272\nالعنوان : بورسعيد شارع ٢٣ يوليو امام قاعة البوريفاج\nيوجد شحن لجميع المحافظات',
    contactEn: 'For orders and inquiries: 01070606272\nAddress: Port Said, 23 July Street, opposite Al Bourivage Hall.\nShipping is available to all governorates',
    whatsappNumber: '01070606272',
    phoneNumber: '01200031140',
    privacyAr: 'تلتزم توزا بحماية كافة بيانات العملاء بخصوصية تامة وعدم مشاركتها مع أي جهة خارجية إلا لغرض الشحن.',
    privacyEn: 'TOUZA values your privacy. All customer data is fully protected and used strictly for order fulfillment.',
    returnsAr: 'يمكنكم طلب استبدال أو استرجاع المنتجات خلال 14 يوماً من الاستلام بشرط الحفاظ على الحالة الأصلية للقطع.',
    returnsEn: 'Returns and exchanges are accepted within 14 days of delivery in original condition.',
    shippingAr: 'نوفر خدمة التوصيل السريع لجميع محافظات مصر (القاهرة والجيزة خلال 24-48 ساعة، وباقي المحافظات خلال 2-4 أيام عمل).',
    shippingEn: 'Express delivery nationwide across Egypt (Cairo & Giza within 24-48 hrs, other governorates within 2-4 business days).',
    shippingFree: false,
    shippingFee: 40,
    shippingLabelAr: 'الشحن داخل مصر',
    shippingLabelEn: 'Express Delivery',
    shippingNoteAr: 'شامل جميع الرسوم والتوصيل للمحافظات.',
    shippingNoteEn: 'All duties & delivery across Egypt included.',
    defaultLanguage: 'en',
    enableVodafoneCash: true,
    vodafoneCashNumber: '01070606272',
    vodafoneCashInstructionsAr: 'يرجى تحويل المبلغ المطلوب إلى رقم محفظة فودافون كاش الموضح أعلاه، ثم إدخال رقم الموبايل المحول منه لتأكيد الطلب.',
    vodafoneCashInstructionsEn: 'Please transfer the exact total amount to the Vodafone Cash number above, then enter your sender phone number to confirm your order.',
    enableOrangeCash: true,
    orangeCashNumber: '01070606272',
    orangeCashInstructionsAr: 'يرجى تحويل المبلغ المطلوب إلى رقم محفظة أورانج كاش الموضح أعلاه، ثم إدخال رقم الموبايل المحول منه لتأكيد الطلب.',
    orangeCashInstructionsEn: 'Please transfer the exact total amount to the Orange Cash number above, then enter your sender phone number to confirm your order.',
    enableInstaPay: true,
    instaPayAddress: 'm.fathyabdallah95@instapay',
    instaPayAccount: 'm.fathyabdallah95@instapay',
    instaPayPhone: '01200031140',
    instaPayInstructionsAr: 'يرجى تحويل المبلغ عبر تطبيق InstaPay إلى عنوان IPA أو رقم الهاتف الموضح أعلاه، ثم أدخل رقم الموبايل أو رقم مرجع العملية.',
    instaPayInstructionsEn: 'Please transfer the exact amount via InstaPay to the IPA handle or phone number above, then enter your sender number or reference ID.',
    enableCashOnDelivery: true,
    codInstructionsAr: 'ستقوم بدفع المبلغ الإجمالي للمندوب عند وصول الشحنة إلى عنوانك مباشرة.',
    codInstructionsEn: 'You will pay the exact total amount in cash directly to the courier upon delivery.',
    collectionsTitleAr: 'استايلك يبدأ من هنا',
    collectionsTitleEn: 'Your Style Starts Here',
    collectionsSubtitleAr: 'تشكيلة راقية صُممت بعناية فائقة لتمنحك إطلالة جذابة تناسب جميع المناسبات في مصر.',
    collectionsSubtitleEn: 'A curated selection of luxury pieces tailored with precision and unhurried elegance.',
    copyrightAr: 'جميع الحقوق محفوظة - سليمان ميديا - ٢٠٢٦',
    copyrightEn: 'ALL COPYRIGHT SOLIMAN MEDIA 2026',
  };

  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem('maison_settings_v4') || localStorage.getItem('maison_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return { ...defaultSettings, ...parsed };
        }
      }
      return defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  const hasServerSettingsLoadedRef = useRef(false);

  useEffect(() => {
    // Only persist settings if we already loaded from cache or confirmed from server
    try {
      localStorage.setItem('maison_settings_v4', safeJsonStringify(storeSettings));
      localStorage.setItem('maison_settings', safeJsonStringify(storeSettings));
    } catch (err) {
      console.error('Failed to store settings:', err);
    }
  }, [storeSettings]);

  // Streamlined Real-time Firestore synchronization with guaranteed fresh initial server load
  useEffect(() => {
    let isSubscribed = true;
    let hasReceivedRealtimeProducts = false;

    // 1. High-priority direct initial fetch from Firestore server with instant progressive rendering
    fetchInitialStoreData(defaultSettings, {
      onSettings: (settings) => {
        if (!isSubscribed) return;
        hasServerSettingsLoadedRef.current = true;
        setStoreSettings(settings);
      },
      onCategories: (cats) => {
        if (!isSubscribed) return;
        if (cats && cats.length > 0) setCategories(cats);
      },
      onPromoCodes: (promos) => {
        if (!isSubscribed) return;
        if (promos && promos.length > 0) setPromoCodes(promos);
      },
      onProducts: (prods) => {
        if (!isSubscribed) return;
        // Never overwrite fresher local mutations or live realtime snapshots
        if (hasReceivedRealtimeProducts || Date.now() - lastLocalProductMutationRef.current < 4000) {
          setIsInitialSyncDone(true);
          return;
        }
        if (Array.isArray(prods)) {
          setProducts(sortProductsNewestFirst(prods));
          setIsInitialSyncDone(true);
        }
      },
    })
      .then(() => {
        if (!isSubscribed) return;
        setIsInitialSyncDone(true);
      })
      .catch((err) => {
        console.warn('Initial store data fetch note:', err);
        setIsInitialSyncDone(true);
      });

    // 2. Subscribe to continuous live Firestore updates with instant 0ms snapshot triggers
    const unsubscribeProducts = subscribeToProducts((liveProducts) => {
      if (isSubscribed && Array.isArray(liveProducts)) {
        hasReceivedRealtimeProducts = true;
        setProducts(sortProductsNewestFirst(liveProducts));
        setIsInitialSyncDone(true);
      }
    });

    const unsubscribeCategories = subscribeToCategories((liveCats) => {
      if (isSubscribed && liveCats && liveCats.length > 0) {
        setCategories(liveCats);
        setIsInitialSyncDone(true);
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

    // 3. Listen for internal admin updates dispatched within the same or other tabs via CustomEvents, BroadcastChannel & localStorage
    const handleStoreSyncEvent = (e: any) => {
      if (!isSubscribed) return;
      const { type, data } = e.detail || {};
      if (type === 'products' && Array.isArray(data)) {
        hasReceivedRealtimeProducts = true;
        setProducts(sortProductsNewestFirst(data));
      } else if (type === 'categories' && Array.isArray(data)) {
        setCategories(data);
      } else if (type === 'settings' && data) {
        setStoreSettings(data);
      } else if (type === 'promos' && Array.isArray(data)) {
        setPromoCodes(data);
      }
    };
    window.addEventListener('touza_store_sync', handleStoreSyncEvent);

    const handleStorageSync = (e: StorageEvent) => {
      if (!isSubscribed || !e.newValue) return;
      try {
        if (e.key === 'maison_products') {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            hasReceivedRealtimeProducts = true;
            setProducts(sortProductsNewestFirst(parsed.filter((p) => p && !isBannedProductId(p.id))));
          }
        } else if (e.key === 'maison_categories') {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCategories(parsed);
          }
        } else if (e.key === 'maison_settings_v4' || e.key === 'maison_settings') {
          const parsed = JSON.parse(e.newValue);
          if (parsed && typeof parsed === 'object') {
            setStoreSettings((prev) => ({ ...prev, ...parsed }));
          }
        }
      } catch {}
    };
    window.addEventListener('storage', handleStorageSync);

    let bc: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        bc = new BroadcastChannel('touza_store_channel');
        bc.onmessage = (event) => {
          if (!isSubscribed) return;
          const { type, data } = event.data || {};
          if (type === 'products' && Array.isArray(data)) {
            hasReceivedRealtimeProducts = true;
            setProducts(sortProductsNewestFirst(data));
          } else if (type === 'categories' && Array.isArray(data)) {
            setCategories(data);
          } else if (type === 'settings' && data) {
            setStoreSettings(data);
          } else if (type === 'promos' && Array.isArray(data)) {
            setPromoCodes(data);
          }
        };
      }
    } catch {}

    const handleSettingsUpdated = (e: any) => {
      if (isSubscribed && e.detail) {
        setStoreSettings(e.detail);
      }
    };
    window.addEventListener('touza_settings_updated', handleSettingsUpdated);

    // Fallback safety: ensure isInitialSyncDone becomes true within 4.0s even under extreme offline latency
    const fallbackTimer = setTimeout(() => {
      if (isSubscribed) {
        setIsInitialSyncDone(true);
      }
    }, 4000);

    return () => {
      isSubscribed = false;
      clearTimeout(fallbackTimer);
      window.removeEventListener('touza_store_sync', handleStoreSyncEvent);
      window.removeEventListener('storage', handleStorageSync);
      window.removeEventListener('touza_settings_updated', handleSettingsUpdated);
      if (bc) {
        try {
          bc.close();
        } catch {}
      }
      unsubscribeProducts();
      unsubscribeCategories();
      unsubscribeSettings();
      unsubscribePromoCodes();
    };
  }, []);

  // Cross-device and Safari BFCache synchronization hook:
  // When a user unlocks their phone, switches back to the tab, or focuses the browser,
  // pull fresh server products without overlapping in-flight requests or firing while offline.
  useEffect(() => {
    let isMounted = true;
    let isSyncing = false;
    let throttleTimer: NodeJS.Timeout | null = null;

    const syncLatestFromFirestore = () => {
      if (!isMounted || isSyncing) return;
      if (typeof navigator !== 'undefined' && navigator.onLine === false) return;
      if (Date.now() - lastLocalProductMutationRef.current < 3000) return;
      if (throttleTimer) return;
      throttleTimer = setTimeout(() => {
        throttleTimer = null;
      }, 8000);

      isSyncing = true;
      getAllProductsAdmin()
        .then((freshProducts) => {
          if (isMounted && Array.isArray(freshProducts) && Date.now() - lastLocalProductMutationRef.current >= 3000) {
            setProducts(sortProductsNewestFirst(freshProducts));
          }
        })
        .catch(() => {})
        .finally(() => {
          isSyncing = false;
        });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncLatestFromFirestore();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', syncLatestFromFirestore);
    window.addEventListener('pageshow', syncLatestFromFirestore);

    return () => {
      isMounted = false;
      if (throttleTimer) clearTimeout(throttleTimer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', syncLatestFromFirestore);
      window.removeEventListener('pageshow', syncLatestFromFirestore);
    };
  }, []);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(() => products[0] || null);
  const [categoryFilter, setCategoryFilter] = useState<string>(initialUrlState.category || 'All');

  // Sync selected product with live Firestore updates
  useEffect(() => {
    if (products.length > 0) {
      if (!selectedProduct || !products.some((p) => p.id === selectedProduct.id)) {
        setSelectedProduct(products[0]);
      } else {
        const updated = products.find((p) => p.id === selectedProduct.id);
        if (updated && updated !== selectedProduct) {
          setSelectedProduct(updated);
        }
      }
    } else {
      setSelectedProduct(null);
    }
  }, [products]);

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

  // Initialize TikTok Pixel once
  useEffect(() => {
    initTikTokPixel();
  }, []);

  // Track PageView on view change
  useEffect(() => {
    trackTikTokPageView(currentView);
  }, [currentView]);

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
    const now = Date.now();
    const stampedProduct: Product = {
      ...newProduct,
      createdAt: newProduct.createdAt || now,
      updatedAt: now,
      showOnHome: typeof newProduct.showOnHome === 'boolean' ? newProduct.showOnHome : true,
    };
    lastLocalProductMutationRef.current = now;
    const nextList = sortProductsNewestFirst([
      stampedProduct,
      ...productsRef.current.filter((p) => p.id !== stampedProduct.id),
    ]);
    productsRef.current = nextList;
    setProducts(nextList);
    try {
      await saveProductAdmin(stampedProduct, nextList);
    } catch (err) {
      console.error('Failed to save product in Firestore:', err);
    }
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
    const now = Date.now();
    const stampedProduct: Product = {
      ...updatedProduct,
      updatedAt: now,
    };
    lastLocalProductMutationRef.current = now;
    const nextList = sortProductsNewestFirst(
      productsRef.current.map((p) => (p.id === stampedProduct.id ? stampedProduct : p))
    );
    productsRef.current = nextList;
    setProducts(nextList);
    if (selectedProduct && selectedProduct.id === stampedProduct.id) {
      setSelectedProduct(stampedProduct);
    }
    try {
      await saveProductAdmin(stampedProduct, nextList);
    } catch (err) {
      console.error('Failed to update product in Firestore:', err);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    lastLocalProductMutationRef.current = Date.now();
    const nextList = productsRef.current.filter((p) => p.id !== productId);
    productsRef.current = nextList;
    setProducts(nextList);
    try {
      const updated = await deleteProductAdmin(productId, nextList);
      productsRef.current = updated;
      setProducts(updated);
    } catch (err) {
      console.error('Failed to delete product from Firestore:', err);
    }
  };

  const handleDeleteMultipleProducts = async (productIds: string[]) => {
    lastLocalProductMutationRef.current = Date.now();
    const idSet = new Set(productIds);
    const nextList = productsRef.current.filter((p) => !idSet.has(p.id));
    productsRef.current = nextList;
    setProducts(nextList);
    try {
      const updated = await deleteMultipleProductsAdmin(productIds, nextList);
      productsRef.current = updated;
      setProducts(updated);
    } catch (err) {
      console.error('Failed to delete multiple products from Firestore:', err);
    }
  };

  const handleResetDefaultProducts = async () => {
    try {
      const restored = await resetDefaultProductsAdmin();
      setProducts(restored);
    } catch (err) {
      console.error('Failed to reset default products:', err);
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
    let settingsToSave = newSettings;
    // When heroImageUrl is updated, ensure it carries a fresh cache-busting timestamp
    if (newSettings.heroImageUrl && newSettings.heroImageUrl !== storeSettings?.heroImageUrl) {
      settingsToSave = {
        ...newSettings,
        heroImageUrl: withCacheBuster(newSettings.heroImageUrl),
      };
    }

    setStoreSettings(settingsToSave);
    try {
      await saveStoreSettingsAdmin(settingsToSave);
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

    // Track TikTok Pixel AddToCart event with real product data
    try {
      trackTikTokAddToCart(product, 1, color, size, 'EGP');
    } catch (ttErr) {
      console.debug('TikTok Pixel AddToCart error:', ttErr);
    }

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
          isInitialSyncDone={isInitialSyncDone}
          isVideoReady={isVideoReady}
          isHomeView={currentView === 'home'}
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
          onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
          categories={categories}
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
            onDeleteMultipleProducts={handleDeleteMultipleProducts}
            onResetProducts={handleResetDefaultProducts}
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
          <div className="bg-[#ffffff]">
            {/* Band 1 (Screenshot 1): Full-Bleed 50/50 Dark Editorial Split Hero */}
            <HeroBanner
              onShopNow={() => handleNavigate('shop', 'All')}
              onShopSecondary={() => handleNavigate('shop', categories[0]?.nameEn || 'All')}
              storeSettings={storeSettings}
              onVideoReady={() => setIsVideoReady(true)}
            />

            {/* Luxury Animated Global Brands Marquee Strip */}
            <BrandsMarqueeStrip onExplore={() => handleNavigate('shop', 'All')} />

            {/* Band 2 (Screenshot 2): 4-Column Horizontal Product Carousel (100% Live Firestore Products) */}
            <ProductCarouselSection
              products={products}
              isInitialSyncDone={isInitialSyncDone}
              wishlistIds={wishlistIds}
              onSelectProduct={handleSelectProduct}
              onToggleWishlist={handleToggleWishlist}
              onQuickAdd={(p, color, size) => handleAddToCart(p, color, size)}
              onViewAll={() => handleNavigate('shop', 'All')}
            />

            {/* Band 3 (Screenshot 2 Bottom / Screenshot 3 Top): Full-Width Black Editorial Strip #1 */}
            <div className="w-full bg-[#000000] text-white py-3.5 px-6 overflow-hidden">
              <div className="max-w-[1440px] mx-auto flex items-center justify-center md:justify-between gap-8 text-[11px] sm:text-[12px] tracking-[0.14em] uppercase font-body whitespace-nowrap">
                <span>{language === 'ar' ? 'طلب فوري عبر واتساب بدون تسجيل' : 'DIRECT WHATSAPP ORDERING'}</span>
                <span className="hidden sm:inline">{language === 'ar' ? 'شحن سريع لجميع محافظات مصر' : 'EXPRESS NATIONWIDE SHIPPING'}</span>
                <span className="hidden md:inline">{language === 'ar' ? 'أقوى تشكيلة كاجوال رجالي ٢٠٢٦' : 'MEN’S CASUAL ESSENTIALS 2026'}</span>
                <span className="hidden lg:inline">{language === 'ar' ? 'استبدال واسترجاع خلال ١٤ يوم' : '14-DAY EASY EXCHANGES'}</span>
              </div>
            </div>

            {/* Band 4 (Screenshot 3): Full-Bleed 50/50 Editorial Split #1 — 100% Men's */}
            <ScrollReveal>
              <section className="w-full grid grid-cols-1 md:grid-cols-2 gap-0 bg-[#111111]">
                {/* Left Panel: Folded Luxury Men's Essentials */}
                <div
                  onClick={() => handleNavigate('shop', 'All')}
                  className="group relative aspect-[4/5] md:aspect-[1/1.05] max-h-[780px] w-full overflow-hidden bg-[#1a1917] cursor-pointer"
                >
                  <img
                    src={editorialFabricCraft}
                    alt={language === 'ar' ? 'أساسيات يومية للرجال' : 'Essentials for him'}
                    loading="lazy"
                    className="w-full h-full object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
                  <div className="absolute inset-x-0 bottom-0 p-7 sm:p-10 md:p-14 text-white flex flex-col items-start text-start">
                    <h3 className="font-editorial text-[34px] sm:text-[42px] md:text-[46px] font-normal leading-[1.08] mb-2">
                      {language === 'ar' ? (
                        <>
                          أساسيات <span className="editorial-italic">للرجال</span>
                        </>
                      ) : (
                        <>
                          Essentials <span className="editorial-italic">for him</span>
                        </>
                      )}
                    </h3>
                    <p className="font-body text-[14px] sm:text-[15px] text-white/85 mb-6 max-w-md">
                      {language === 'ar'
                        ? 'خامات فاخرة ومريحة مصممة للاستخدام اليومي.'
                        : 'Soft heavyweight essentials crafted for every day.'}
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNavigate('shop', 'All');
                      }}
                      className="border border-white/80 bg-transparent text-white hover:bg-white hover:text-[#111111] transition-colors duration-200 px-7 py-3 rounded-none text-[11px] font-medium tracking-[0.16em] uppercase cursor-pointer"
                    >
                      {language === 'ar' ? 'تسوق الأساسيات' : 'MEN’S ESSENTIALS'}
                    </button>
                  </div>
                </div>

                {/* Right Panel: Male Model Tailored Casual Lookbook (Replacing Female Image with 100% Male Model) */}
                <div
                  onClick={() => handleNavigate('shop', categories[0]?.nameEn || 'All')}
                  className="group relative aspect-[4/5] md:aspect-[1/1.05] max-h-[780px] w-full overflow-hidden bg-[#1a1917] cursor-pointer"
                >
                  <img
                    src={editorialWinterLookbook}
                    alt={language === 'ar' ? 'جاكيت كوردروي رجالي مطرز من توزا' : 'TOUZA embroidered corduroy jacket editorial'}
                    loading="lazy"
                    className="w-full h-full object-cover object-top transition-transform duration-1000 ease-out group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
                  <div className="absolute inset-x-0 bottom-0 p-7 sm:p-10 md:p-14 text-white flex flex-col items-start text-start">
                    <h3 className="font-editorial text-[34px] sm:text-[42px] md:text-[46px] font-normal leading-[1.08] mb-2">
                      {language === 'ar' ? (
                        <>
                          أناقة <span className="editorial-italic">يومية</span>
                        </>
                      ) : (
                        <>
                          Tailored <span className="editorial-italic">casual</span>
                        </>
                      )}
                    </h3>
                    <p className="font-body text-[14px] sm:text-[15px] text-white/85 mb-6 max-w-md">
                      {language === 'ar'
                        ? 'جواكيت وأوفرشيرت بقصّات عصرية تناسب كل المناسبات.'
                        : 'Structured overshirts and outerwear in refined earthy tones.'}
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNavigate('shop', categories[0]?.nameEn || 'All');
                      }}
                      className="border border-white/80 bg-transparent text-white hover:bg-white hover:text-[#111111] transition-colors duration-200 px-7 py-3 rounded-none text-[11px] font-medium tracking-[0.16em] uppercase cursor-pointer"
                    >
                      {language === 'ar' ? 'تسوق الجواكيت' : 'SHOP OUTERWEAR'}
                    </button>
                  </div>
                </div>
              </section>
            </ScrollReveal>

            {/* Band 5 (Screenshot 4 Top): Full-Width Black Editorial Strip #2 */}
            <div className="w-full bg-[#000000] text-white py-3.5 px-6 overflow-hidden">
              <div className="max-w-[1440px] mx-auto flex items-center justify-center md:justify-between gap-8 text-[11px] sm:text-[12px] tracking-[0.14em] uppercase font-body whitespace-nowrap">
                <span>{language === 'ar' ? 'توصيل لجميع المحافظات' : 'FAST EGYPT DELIVERY'}</span>
                <span className="hidden sm:inline">{language === 'ar' ? 'استبدال خلال ١٤ يوم' : '14-DAY RETURNS'}</span>
                <span className="hidden md:inline">{language === 'ar' ? 'معاينة قبل الاستلام' : 'INSPECT ON DELIVERY'}</span>
                <span className="hidden lg:inline">{language === 'ar' ? 'بورسعيد — شارع ٢٣ يوليو' : 'PORT SAID ATELIER'}</span>
              </div>
            </div>

            {/* Band 6 (Screenshot 4): Full-Bleed 50/50 Street Layering Split #2 — 100% Men's */}
            <ScrollReveal>
              <section className="w-full grid grid-cols-1 md:grid-cols-2 gap-0 bg-[#111111]">
                {/* Left Panel: Male Model in Olive Half-Zip on Autumn Street */}
                <div
                  onClick={() => handleNavigate('shop', categories[0]?.nameEn || 'All')}
                  className="group relative aspect-[4/5] md:aspect-[1/1.05] max-h-[780px] w-full overflow-hidden bg-[#1a1917] cursor-pointer"
                >
                  <img
                    src={splitStreetOlive}
                    alt={language === 'ar' ? 'إطلالة شتاء دافئة للرجال' : 'Layer up menswear'}
                    loading="lazy"
                    className="w-full h-full object-cover object-top transition-transform duration-1000 ease-out group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
                  <div className="absolute inset-x-0 bottom-0 p-7 sm:p-10 md:p-14 text-white flex flex-col items-start text-start">
                    <h3 className="font-editorial text-[34px] sm:text-[42px] md:text-[46px] font-normal leading-[1.08] mb-2">
                      {language === 'ar' ? (
                        <>
                          دفء <span className="editorial-italic">الشتاء</span>
                        </>
                      ) : (
                        <>
                          Layer <span className="editorial-italic">up</span>
                        </>
                      )}
                    </h3>
                    <p className="font-body text-[14px] sm:text-[15px] text-white/85 mb-6 max-w-md">
                      {language === 'ar'
                        ? 'سويت شيرتات وجواكيت ثقيلة مصممة لأيام البرد.'
                        : 'Long sleeves, sweats, and jackets built for colder days.'}
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNavigate('shop', categories[0]?.nameEn || 'All');
                      }}
                      className="border border-white/80 bg-transparent text-white hover:bg-white hover:text-[#111111] transition-colors duration-200 px-7 py-3 rounded-none text-[11px] font-medium tracking-[0.16em] uppercase cursor-pointer"
                    >
                      {language === 'ar' ? 'تسوق الشتوي' : 'SHOP WINTER'}
                    </button>
                  </div>
                </div>

                {/* Right Panel: Male Model in All-Black Minimalist Streetwear (100% Male Model!) */}
                <div
                  onClick={() => handleNavigate('shop', 'All')}
                  className="group relative aspect-[4/5] md:aspect-[1/1.05] max-h-[780px] w-full overflow-hidden bg-[#1a1917] cursor-pointer"
                >
                  <img
                    src={splitStreetBlack}
                    alt={language === 'ar' ? 'كاجوال أسود يومي للرجال' : 'Minimalist black menswear'}
                    loading="lazy"
                    className="w-full h-full object-cover object-top transition-transform duration-1000 ease-out group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
                  <div className="absolute inset-x-0 bottom-0 p-7 sm:p-10 md:p-14 text-white flex flex-col items-start text-start">
                    <h3 className="font-editorial text-[34px] sm:text-[42px] md:text-[46px] font-normal leading-[1.08] mb-2">
                      {language === 'ar' ? (
                        <>
                          إطلالة <span className="editorial-italic">بسيطة</span>
                        </>
                      ) : (
                        <>
                          Everyday <span className="editorial-italic">minimal</span>
                        </>
                      )}
                    </h3>
                    <p className="font-body text-[14px] sm:text-[15px] text-white/85 mb-6 max-w-md">
                      {language === 'ar'
                        ? 'قطع يومية مريحة وأنيقة — مثالية للخروج والعمل.'
                        : 'Relaxed silhouettes and timeless blacks — effortless anywhere.'}
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNavigate('shop', 'All');
                      }}
                      className="border border-white/80 bg-transparent text-white hover:bg-white hover:text-[#111111] transition-colors duration-200 px-7 py-3 rounded-none text-[11px] font-medium tracking-[0.16em] uppercase cursor-pointer"
                    >
                      {language === 'ar' ? 'تسوق الكل' : 'SHOP ALL'}
                    </button>
                  </div>
                </div>
              </section>
            </ScrollReveal>
            {/* Band 7: "Our categories" — Full-Width Seamless Studio 4-Column Band (100% TOUZA Men's Jackets) */}
            <ScrollReveal>
              <section className="w-full bg-[#ffffff] pt-14 md:pt-20 pb-10 md:pb-14">
                <div className="max-w-[1440px] mx-auto px-6 sm:px-10 md:px-14 mb-6 md:mb-8">
                  <h2 className="font-editorial text-[32px] sm:text-[38px] md:text-[42px] font-normal leading-[1.1] text-[#111111]">
                    {language === 'ar' ? 'أقسامنا' : 'Our categories'}
                  </h2>
                </div>

                <div className="w-full grid grid-cols-2 lg:grid-cols-4 gap-0 bg-[#dcdad6]">
                  {[
                    {
                      id: 'cat-corduroy',
                      image: catModelBlossom,
                      objectPos: 'object-top',
                      labelAr: 'جواكيت كوردروي',
                      labelEn: 'CORDUROY JACKETS',
                      altAr: 'موديل رجالي بجاكيت كوردروي أسود مطرز من توزا',
                      altEn: 'TOUZA black embroidered corduroy jacket on male model',
                      targetCategory: categories[0]?.nameEn || 'All',
                    },
                    {
                      id: 'cat-tapestry',
                      image: catModelTapestry,
                      objectPos: 'object-top',
                      labelAr: 'جواكيت تابستري',
                      labelEn: 'TAPESTRY JACKETS',
                      altAr: 'موديل رجالي بجاكيت تابستري رمادي من توزا',
                      altEn: 'TOUZA grey woven tapestry jacket on male model',
                      targetCategory: categories[0]?.nameEn || 'All',
                    },
                    {
                      id: 'cat-winter',
                      image: catFlatlayTiger,
                      objectPos: 'object-center',
                      labelAr: 'تشكيلة الشتاء',
                      labelEn: 'WINTER EDITION',
                      altAr: 'جاكيت كوردروي بيج مطرز من تشكيلة الشتاء لتوزا',
                      altEn: 'TOUZA sand beige embroidered winter corduroy jacket',
                      targetCategory: categories[0]?.nameEn || 'All',
                    },
                    {
                      id: 'cat-new',
                      image: catFlatlayPortrait,
                      objectPos: 'object-center',
                      labelAr: 'وصل حديثاً',
                      labelEn: 'NEW ARRIVALS',
                      altAr: 'جاكيت كوردروي كحلي داكن مطرز وصل حديثاً من توزا',
                      altEn: 'TOUZA midnight navy embroidered jacket new arrivals',
                      targetCategory: products.some((p) => p.isNewArrival) ? 'New Arrivals' : 'All',
                    },
                  ].map((tile) => (
                    <div
                      key={tile.id}
                      onClick={() => handleNavigate('shop', tile.targetCategory)}
                      className="group relative aspect-[4/4.5] w-full overflow-hidden bg-[#dcdad6] cursor-pointer"
                    >
                      <img
                        src={tile.image}
                        alt={language === 'ar' ? tile.altAr : tile.altEn}
                        loading="lazy"
                        className={`w-full h-full object-cover ${tile.objectPos} transition-transform duration-700 ease-out group-hover:scale-[1.03]`}
                      />
                      <div className="absolute inset-x-0 bottom-5 sm:bottom-7 flex justify-center px-3 pointer-events-none">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNavigate('shop', tile.targetCategory);
                          }}
                          className="pointer-events-auto bg-[#ffffff] border border-[#111111] text-[#111111] group-hover:bg-[#111111] group-hover:text-white transition-colors duration-200 px-4 sm:px-6 py-2.5 sm:py-3 rounded-none text-[10px] sm:text-[12px] tracking-[0.1em] uppercase font-body font-medium whitespace-nowrap cursor-pointer"
                        >
                          {language === 'ar' ? tile.labelAr : tile.labelEn}
                        </button>
                      </div>
                    </div>
                  ))}
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

          {currentView === 'product' && selectedProduct && (
            <ProductDetail
              product={selectedProduct}
              products={products}
              storeSettings={storeSettings}
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

          {currentView === 'product' && !selectedProduct && (
            <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center bg-[#f9f9f9]">
              <span className="material-symbols-outlined text-[48px] text-[#747878] mb-3">inventory_2</span>
              <h2 className="font-display text-[22px] font-bold text-[#000000] mb-2">
                {language === 'ar' ? 'المنتج غير متاح حالياً' : 'Product Not Available'}
              </h2>
              <p className="font-body text-[14px] text-[#747878] mb-6">
                {language === 'ar' ? 'تم حذف هذا المنتج أو لم يعد متوفراً في المتجر.' : 'This product has been removed or is no longer available.'}
              </p>
              <button
                onClick={() => handleNavigate('home')}
                className="bg-[#000000] text-white px-6 py-2.5 rounded-xl font-label-caps font-bold hover:bg-[#222222] transition-colors cursor-pointer"
              >
                {language === 'ar' ? 'العودة للمتجر' : 'Return to Store'}
              </button>
            </div>
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
            storeSettings={storeSettings}
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
            products={products}
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

      {/* Floating Branded TOUZA Animated Shopping Bag (Moves & catches selected products) */}
      {currentView !== 'admin' && currentView !== 'checkout' && (
        <FloatingTouzaBag
          cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
          totalAmount={cartItems.reduce(
            (sum, item) => sum + item.product.price * item.quantity,
            0
          )}
          onOpenCart={() => setIsCartOpen(true)}
          hidden={isCartOpen}
        />
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
