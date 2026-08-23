import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  LayoutDashboard,
  KeyRound,
  LogOut,
  Store,
  BarChart3,
  LayoutGrid,
  Shirt,
  Truck,
  Users,
  Tag,
  MessageSquare,
  Mail,
  Settings,
  CreditCard,
  Banknote,
  ShoppingBag,
  Search,
  RefreshCw,
  Plus,
  Trash2,
  Edit,
  Copy,
  Eye,
  Check,
  X,
  AlertTriangle,
  Upload,
  ArrowRight,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  Download,
  Code2,
} from 'lucide-react';
import { Category, Product, ProductColor, ProductSize, PromoCode, StoreSettings } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { DEFAULT_CATEGORIES } from '../data/defaultCategories';
import { compressImageFile } from '../utils/imageCompressor';
import { uploadToCloudinary, uploadVideoToCloudinary, getOptimizedVideoUrl } from '../utils/cloudinary';
import { AiStudioSyncTab } from './AiStudioSyncTab';
import {
  SavedOrder,
  getAllOrdersAdmin,
  subscribeToOrdersAdmin,
  subscribeToUsersAdmin,
  TouzaUser,
  updateOrderStatusAdmin,
  deleteOrderAdmin,
  SavedReview,
  getAllReviews,
  subscribeToReviews,
  deleteReviewAdmin,
  addReviewAdmin,
  updateReviewAdmin,
  resetDefaultReviewsAdmin,
  NewsletterSubscriber,
  NewsletterCampaign,
  getNewsletterSubscribers,
  subscribeToNewsletterSubscribers,
  deleteNewsletterSubscriberAdmin,
  saveNewsletterCampaignAdmin,
  getNewsletterCampaignsAdmin,
  subscribeToNewsletterCampaigns,
  exportFirestoreProductsBackup,
  syncAllProductsToFirestore,
} from '../firebase';

interface AdminDashboardProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  categories?: Category[];
  onAddCategory?: (catData: Omit<Category, 'id'>) => Promise<void>;
  onUpdateCategory?: (catId: string, updatedData: Partial<Category>) => Promise<void>;
  onDeleteCategory?: (catId: string) => Promise<void>;
  onResetCategories?: () => Promise<void>;
  promoCodes: PromoCode[];
  onAddPromoCode: (promo: PromoCode) => void;
  onDeletePromoCode: (promoId: string) => void;
  onTogglePromoStatus: (promoId: string) => void;
  storeSettings: StoreSettings;
  onUpdateStoreSettings: (settings: StoreSettings) => void;
  onCloseAdmin: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  categories = DEFAULT_CATEGORIES,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onResetCategories,
  promoCodes,
  onAddPromoCode,
  onDeletePromoCode,
  onTogglePromoStatus,
  storeSettings,
  onUpdateStoreSettings,
  onCloseAdmin,
}) => {
  const { language, formatPrice } = useLanguage();

  // Security Lock state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('maison_admin_auth') === 'true';
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [storedPin, setStoredPin] = useState(() => {
    return localStorage.getItem('maison_admin_pin') || '1234';
  });
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [newPin, setNewPin] = useState('');

  // Admin Navigation state
  const [activeTab, setActiveTab] = useState<'overview' | 'categories' | 'products' | 'orders' | 'users' | 'promos' | 'reviews' | 'newsletter' | 'settings' | 'payment_settings' | 'ai_studio_sync'>('overview');

  // Firestore Live Users
  const [users, setUsers] = useState<TouzaUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userProviderFilter, setUserProviderFilter] = useState<'all' | 'email' | 'google'>('all');

  // Newsletter & Subscribers state
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>(() => {
    try {
      const deletedList: string[] = JSON.parse(localStorage.getItem('maison_deleted_subscribers') || '[]');
      const deletedSet = new Set(deletedList.map((e) => e.trim().toLowerCase()));
      const saved: NewsletterSubscriber[] = JSON.parse(localStorage.getItem('maison_subscribers') || '[]');
      return saved.filter((s) => s && s.email && !deletedSet.has(s.email.trim().toLowerCase()));
    } catch {
      return [];
    }
  });
  const [loadingSubscribers, setLoadingSubscribers] = useState(false);
  const [subscriberSearch, setSubscriberSearch] = useState('');
  const [campaigns, setCampaigns] = useState<NewsletterCampaign[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('maison_campaigns') || '[]');
    } catch {
      return [];
    }
  });
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [campaignTitle, setCampaignTitle] = useState('');
  const [campaignPreview, setCampaignPreview] = useState('');
  const [campaignContent, setCampaignContent] = useState('');
  const [campaignPromo, setCampaignPromo] = useState('');
  const [sendingBroadcast, setSendingBroadcast] = useState(false);
  const [copySuccessMsg, setCopySuccessMsg] = useState('');

  // Category Management State
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState<Omit<Category, 'id'>>({
    nameEn: '',
    nameAr: '',
    descriptionEn: '',
    descriptionAr: '',
    imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600',
    icon: 'styler',
  });

  // Firestore Live Orders
  const [orders, setOrders] = useState<SavedOrder[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('maison_orders_cache') || '[]');
    } catch {
      return [];
    }
  });
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  // Firestore Reviews state
  const [reviews, setReviews] = useState<SavedReview[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('maison_reviews_cache') || '[]');
    } catch {
      return [];
    }
  });
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewSearchTerm, setReviewSearchTerm] = useState('');
  const [reviewStarFilter, setReviewStarFilter] = useState<number | 'all'>('all');
  const [isAddReviewModalOpen, setIsAddReviewModalOpen] = useState(false);
  const [isEditReviewModalOpen, setIsEditReviewModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<SavedReview | null>(null);
  const [newReviewForm, setNewReviewForm] = useState({
    productId: '',
    productTitle: '',
    userName: '',
    userPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600',
    rating: 5,
    comment: '',
    orderNumber: 'الإسكندرية، مصر',
  });
  const [editReviewForm, setEditReviewForm] = useState({
    id: '',
    productId: '',
    productTitle: '',
    userName: '',
    userPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600',
    rating: 5,
    comment: '',
    orderNumber: 'الإسكندرية، مصر',
  });

  // Modal-based Deletion confirmation state (bypasses browser iframe confirm blocks)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [reviewToDelete, setReviewToDelete] = useState<SavedReview | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<SavedOrder | null>(null);
  const [subscriberToDelete, setSubscriberToDelete] = useState<NewsletterSubscriber | null>(null);

  // Products state
  const [productSearch, setProductSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isExportingProducts, setIsExportingProducts] = useState(false);
  const [isSyncingProducts, setIsSyncingProducts] = useState(false);

  const handleSyncAllProducts = async () => {
    try {
      setIsSyncingProducts(true);
      const res = await syncAllProductsToFirestore(products);
      alert(
        language === 'ar'
          ? `✅ تمت مزامنة ${res.count} منتج بنجاح مع قاعدة بيانات Firestore السحابية!`
          : `✅ Successfully synced ${res.count} products to Cloud Firestore!`
      );
    } catch (err) {
      console.error('Failed to sync products to Firestore:', err);
      alert(
        language === 'ar'
          ? 'حدث خطأ أثناء مزامنة المنتجات مع السحابة. تأكد من اتصال الإنترنت.'
          : 'Failed to sync products to cloud. Please check your connection.'
      );
    } finally {
      setIsSyncingProducts(false);
    }
  };

  // New/Edit Product Form state
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    nameAr: '',
    subtitle: '',
    subtitleAr: '',
    category: 'Shirts',
    categoryAr: 'قميص',
    price: 1500,
    description: '',
    descriptionAr: '',
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuCr5n0k7EnsiHXYT5xQvtxcJJnUNZlm4dZ_x-sowMVN3uFacCno5d7E-EaowhynWFDBV6ndwFY-98SMBIUxMvzHx_odsbbzsicMrkcykp-zlMNtfsR8xLU1p9NxWgU7Pu-syq7LL04p9r9wcPml9F5Qpbg4A3wJPP_RWN3mvchqmK_ZUt53g9Y2X1tHS-5JjSwEdA15euHuSfTdQOBTzORpsV4_SQTGVzKh1dtOnS13HfxRB9bNrxWoWg'],
    colors: [{ name: 'Noir', hex: '#1e1b19' }, { name: 'Blanc', hex: '#ffffff' }],
    sizes: [
      { size: 'S', inStock: true },
      { size: 'M', inStock: true },
      { size: 'L', inStock: true },
      { size: 'XL', inStock: true },
    ],
    isNewArrival: true,
    isFeatured: false,
  });

  // Promo code form state
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoDiscountType, setNewPromoDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [newPromoDiscountValue, setNewPromoDiscountValue] = useState<number>(15);
  const [newPromoMaxUses, setNewPromoMaxUses] = useState<number | string>(1);
  const [newPromoNote, setNewPromoNote] = useState('');

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<StoreSettings>(storeSettings);
  const [paymentSaveSuccess, setPaymentSaveSuccess] = useState('');
  const [paymentSaveError, setPaymentSaveError] = useState('');

  // Header Video Upload state
  const [headerVideoFile, setHeaderVideoFile] = useState<File | null>(null);
  const [headerVideoFileName, setHeaderVideoFileName] = useState<string>('');
  const [headerVideoFileSizeMB, setHeaderVideoFileSizeMB] = useState<string>('');
  const [headerVideoPreviewUrl, setHeaderVideoPreviewUrl] = useState<string>('');
  const [isUploadingHeaderVideo, setIsUploadingHeaderVideo] = useState<boolean>(false);
  const [headerVideoUploadProgress, setHeaderVideoUploadProgress] = useState<number>(0);
  const [stagedHeaderVideoUrl, setStagedHeaderVideoUrl] = useState<string>('');
  const [headerVideoUploadError, setHeaderVideoUploadError] = useState<string>('');
  const [headerVideoSuccessMsg, setHeaderVideoSuccessMsg] = useState<string>('');
  const [isReplacingHeaderVideo, setIsReplacingHeaderVideo] = useState<boolean>(false);

  const handleHeaderVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setHeaderVideoUploadError('');
    setHeaderVideoSuccessMsg('');

    // Validation 1: File type
    const isVideoType = file.type.startsWith('video/') || /\.(mp4|webm|mov|ogg|m4v)$/i.test(file.name);
    if (!isVideoType) {
      setHeaderVideoUploadError(
        language === 'ar'
          ? 'خطأ: نوع الملف غير مدعوم. يرجى اختيار ملف فيديو بصيغة (MP4, WebM, MOV, OGG).'
          : 'Error: Unsupported file type. Please select a video file (MP4, WebM, MOV, OGG).'
      );
      return;
    }

    // Validation 2: File size (max 100MB)
    const maxSizeBytes = 100 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setHeaderVideoUploadError(
        language === 'ar'
          ? 'خطأ: حجم الفيديو يتجاوز الحد الأقصى (100 ميجابايت). يرجى تقليل حجم الفيديو لحفظ الأداء.'
          : 'Error: Video file exceeds maximum size (100 MB). Please reduce file size for optimal performance.'
      );
      return;
    }

    setHeaderVideoFile(file);
    setHeaderVideoFileName(file.name);
    setHeaderVideoFileSizeMB((file.size / (1024 * 1024)).toFixed(2) + ' MB');
    setHeaderVideoPreviewUrl(URL.createObjectURL(file));
    setStagedHeaderVideoUrl('');
  };

  const handleStartHeaderVideoUpload = async () => {
    if (!headerVideoFile) return;

    setIsUploadingHeaderVideo(true);
    setHeaderVideoUploadProgress(0);
    setHeaderVideoUploadError('');
    setHeaderVideoSuccessMsg('');

    try {
      const url = await uploadVideoToCloudinary(
        headerVideoFile,
        { folder: 'touza_header_videos' },
        (progress) => {
          setHeaderVideoUploadProgress(progress.percent);
        }
      );

      if (url) {
        setStagedHeaderVideoUrl(url);
        setHeaderVideoSuccessMsg(
          language === 'ar'
            ? '✓ تم رفع الفيديو إلى Cloudinary بنجاح! انقر على زر "حفظ واستخدام الفيديو" لتطبيقه فوراً.'
            : '✓ Video uploaded to Cloudinary successfully! Click "Save & Use Video" to apply it now.'
        );
      } else {
        throw new Error('لم يتم إرجاع رابط آمن من Cloudinary');
      }
    } catch (err: any) {
      console.error('Header video upload error:', err);
      setHeaderVideoUploadError(
        language === 'ar'
          ? 'فشل رفع الفيديو: ' + (err?.message || 'يرجى التحقق من اتصال الإنترنت وإعادة المحاولة')
          : 'Video upload failed: ' + (err?.message || 'Please check connection and retry')
      );
    } finally {
      setIsUploadingHeaderVideo(false);
    }
  };

  const handleApplyHeaderVideo = (videoUrlToApply?: string) => {
    const rawTargetUrl = videoUrlToApply || stagedHeaderVideoUrl;
    if (!rawTargetUrl) return;

    // Optimize Cloudinary video URL to ensure H.264/MP4 format for maximum browser compatibility
    const targetUrl = getOptimizedVideoUrl(rawTargetUrl);

    const updatedSettings = {
      ...settingsForm,
      heroImageUrl: targetUrl,
    };

    setSettingsForm(updatedSettings);
    onUpdateStoreSettings(updatedSettings);

    alert(
      language === 'ar'
        ? '✓ تم حفظ واستخدام فيديو الهيدر الجديد بنجاح! أصبح الفيديو الجديد نشطاً على الموقع فوراً.'
        : '✓ New Header Video saved and activated successfully across the store!'
    );

    // Reset form state
    setHeaderVideoFile(null);
    setHeaderVideoFileName('');
    setHeaderVideoFileSizeMB('');
    setHeaderVideoPreviewUrl('');
    setStagedHeaderVideoUrl('');
    setHeaderVideoUploadError('');
    setHeaderVideoSuccessMsg('');
    setIsReplacingHeaderVideo(false);
  };

  const handleCancelHeaderVideoUpload = () => {
    setHeaderVideoFile(null);
    setHeaderVideoFileName('');
    setHeaderVideoFileSizeMB('');
    setHeaderVideoPreviewUrl('');
    setStagedHeaderVideoUrl('');
    setHeaderVideoUploadError('');
    setHeaderVideoSuccessMsg('');
    setIsReplacingHeaderVideo(false);
  };

  useEffect(() => {
    if (storeSettings) {
      setSettingsForm(storeSettings);
    }
  }, [storeSettings]);

  const handleSavePaymentSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentSaveSuccess('');
    setPaymentSaveError('');

    // Validation
    if (settingsForm.enableVodafoneCash !== false && !settingsForm.vodafoneCashNumber?.trim()) {
      setPaymentSaveError(
        language === 'ar'
          ? 'تنبيه: يرجى إدخال رقم محفظة فودافون كاش قبل الحفظ'
          : 'Please enter the Vodafone Cash phone number before saving'
      );
      return;
    }

    if (settingsForm.enableOrangeCash !== false && !settingsForm.orangeCashNumber?.trim()) {
      setPaymentSaveError(
        language === 'ar'
          ? 'تنبيه: يرجى إدخال رقم محفظة أورانج كاش قبل الحفظ'
          : 'Please enter the Orange Cash phone number before saving'
      );
      return;
    }

    if (
      settingsForm.enableInstaPay !== false &&
      !settingsForm.instaPayAccount?.trim() &&
      !settingsForm.instaPayAddress?.trim()
    ) {
      setPaymentSaveError(
        language === 'ar'
          ? 'تنبيه: يرجى إدخال عنوان أو رقم حساب إنستا باي (IPA)'
          : 'Please enter the InstaPay address/account handle'
      );
      return;
    }

    try {
      const sanitized = {
        ...settingsForm,
        instaPayAccount: settingsForm.instaPayAccount || settingsForm.instaPayAddress || '',
        instaPayAddress: settingsForm.instaPayAddress || settingsForm.instaPayAccount || '',
      };
      await onUpdateStoreSettings(sanitized);
      setPaymentSaveSuccess(
        language === 'ar'
          ? '✓ تم حفظ وتحديث بيانات فودافون كاش، أورانج كاش وإنستا باي بنجاح في الموقع وقاعدة البيانات!'
          : '✓ Payment settings (Vodafone Cash, Orange Cash, InstaPay) saved and updated successfully!'
      );
      setTimeout(() => setPaymentSaveSuccess(''), 5000);
    } catch (err: any) {
      setPaymentSaveError(
        language === 'ar'
          ? 'حدث خطأ أثناء الحفظ: ' + (err?.message || '')
          : 'Failed to save settings: ' + (err?.message || '')
      );
    }
  };

  // Fetch live orders
  const fetchOrders = async () => {
    if (orders.length === 0) setLoadingOrders(true);
    try {
      const data = await getAllOrdersAdmin();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Fetch live reviews
  const fetchReviewsData = async () => {
    if (reviews.length === 0) setLoadingReviews(true);
    try {
      const data = await getAllReviews();
      setReviews(data);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  // Fetch newsletter data
  const fetchNewsletterData = async () => {
    if (subscribers.length === 0 && campaigns.length === 0) setLoadingSubscribers(true);
    try {
      const [subsList, campList] = await Promise.all([
        getNewsletterSubscribers(),
        getNewsletterCampaignsAdmin(),
      ]);
      setSubscribers(subsList);
      setCampaigns(campList);
    } catch (err) {
      console.error('Failed to load newsletter data:', err);
    } finally {
      setLoadingSubscribers(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      if (orders.length === 0) setLoadingOrders(true);
      setLoadingUsers(true);

      // Immediate fetch + Real-time listener for Orders
      getAllOrdersAdmin().then((list) => {
        if (list && list.length > 0) {
          setOrders(list);
        }
        setLoadingOrders(false);
      }).catch(() => setLoadingOrders(false));

      const unsubOrders = subscribeToOrdersAdmin((latestOrders) => {
        setOrders(latestOrders);
        setLoadingOrders(false);
      });

      // Real-time listener for Users
      const unsubUsers = subscribeToUsersAdmin((latestUsers) => {
        setUsers(latestUsers);
        setLoadingUsers(false);
      });

      // Real-time listener for Reviews
      const unsubReviews = subscribeToReviews((latestReviews) => {
        setReviews(latestReviews);
        setLoadingReviews(false);
      });

      // Real-time listener for Newsletter subscribers
      const unsubNewsletter = subscribeToNewsletterSubscribers((latestSubs) => {
        setSubscribers(latestSubs);
        setLoadingSubscribers(false);
      });

      // Real-time listener for campaign broadcast history
      const unsubCampaigns = subscribeToNewsletterCampaigns((camps) => {
        setCampaigns(camps);
      });

      return () => {
        unsubOrders();
        unsubUsers();
        unsubReviews();
        unsubNewsletter();
        unsubCampaigns();
      };
    }
  }, [isAuthenticated]);

  const handleConfirmDeleteReview = async () => {
    if (!reviewToDelete) return;
    const revId = reviewToDelete.id;
    setReviews((prev) => prev.filter((r) => r.id !== revId));
    setReviewToDelete(null);
    try {
      await deleteReviewAdmin(revId, reviews);
    } catch (err) {
      console.error('Failed to delete review:', err);
      alert(language === 'ar' ? 'فشل حذف التقييم' : 'Failed to delete review');
    }
  };

  const handleResetDefaultReviews = async () => {
    if (confirm(language === 'ar' ? 'هل أنت تأكد من استعادة التقييمات الافتراضية الرئيسية؟' : 'Restore default reviews?')) {
      try {
        setLoadingReviews(true);
        const resetList = await resetDefaultReviewsAdmin();
        setReviews(resetList);
        alert(language === 'ar' ? 'تمت استعادة التقييمات الافتراضية بنجاح!' : 'Default reviews restored!');
      } catch (err) {
        console.error('Failed to reset default reviews:', err);
        alert(language === 'ar' ? 'حدث خطأ أثناء استعادة التقييمات' : 'Failed to restore default reviews');
      } finally {
        setLoadingReviews(false);
      }
    }
  };

  const handleOpenEditReviewModal = (rev: SavedReview) => {
    setEditingReview(rev);
    setEditReviewForm({
      id: rev.id,
      productId: rev.productId || '',
      productTitle: rev.productTitle || '',
      userName: rev.userName || '',
      userPhoto: rev.userPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600',
      rating: rev.rating || 5,
      comment: rev.comment || '',
      orderNumber: rev.orderNumber || 'الإسكندرية، مصر',
    });
    setIsEditReviewModalOpen(true);
  };

  const handleUpdateReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReview || !editReviewForm.comment.trim() || !editReviewForm.userName.trim()) return;

    const matchedProd = products.find((p) => p.id === editReviewForm.productId);
    const prodTitle = matchedProd
      ? language === 'ar'
        ? matchedProd.nameAr || matchedProd.name
        : matchedProd.name
      : editReviewForm.productTitle || (language === 'ar' ? 'منتج عام' : 'General Product');

    try {
      const updatedFields = {
        productId: editReviewForm.productId || products[0]?.id || 'p1',
        productTitle: prodTitle,
        rating: Number(editReviewForm.rating),
        comment: editReviewForm.comment.trim(),
        userName: editReviewForm.userName.trim(),
        userPhoto: editReviewForm.userPhoto.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600',
        orderNumber: editReviewForm.orderNumber || 'الإسكندرية، مصر',
      };

      await updateReviewAdmin(editingReview.id, updatedFields, reviews);

      setReviews((prev) =>
        prev.map((r) =>
          r.id === editingReview.id
            ? { ...r, ...updatedFields }
            : r
        )
      );

      setIsEditReviewModalOpen(false);
      setEditingReview(null);
    } catch (err) {
      console.error('Failed to update review:', err);
      alert(language === 'ar' ? 'حدث خطأ أثناء تعديل التقييم' : 'Failed to update review');
    }
  };

  const handleConfirmDeleteProduct = () => {
    if (productToDelete) {
      onDeleteProduct(productToDelete.id);
      setProductToDelete(null);
    }
  };

  const handleExportProductsBackup = async () => {
    try {
      setIsExportingProducts(true);
      const backupData = await exportFirestoreProductsBackup();

      const blob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const downloadAnchor = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      downloadAnchor.href = url;
      downloadAnchor.download = `touza-products-backup-${dateStr}.json`;
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      document.body.removeChild(downloadAnchor);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export products backup from Firestore:', err);
      alert(
        language === 'ar'
          ? 'حدث خطأ أثناء تصدير نسخة المنتجات. يرجى المحاولة مرة أخرى.'
          : 'Failed to export products backup. Please try again.'
      );
    } finally {
      setIsExportingProducts(false);
    }
  };

  const handleCreateReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewForm.comment.trim() || !newReviewForm.userName.trim()) return;

    const matchedProd = products.find((p) => p.id === newReviewForm.productId);
    const prodTitle = matchedProd
      ? language === 'ar'
        ? matchedProd.nameAr || matchedProd.name
        : matchedProd.name
      : newReviewForm.productTitle || (language === 'ar' ? 'منتج عام' : 'General Product');

    try {
      const created = await addReviewAdmin({
        productId: newReviewForm.productId || products[0]?.id || 'p1',
        productTitle: prodTitle,
        rating: Number(newReviewForm.rating),
        comment: newReviewForm.comment.trim(),
        userName: newReviewForm.userName.trim(),
        userPhoto: newReviewForm.userPhoto.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600',
        orderNumber: newReviewForm.orderNumber || 'الإسكندرية، مصر',
      }, reviews);
      setReviews((prev) => [created, ...prev]);
      setIsAddReviewModalOpen(false);
      setNewReviewForm({
        productId: products[0]?.id || '',
        productTitle: products[0]?.nameAr || products[0]?.name || '',
        userName: '',
        userPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600',
        rating: 5,
        comment: '',
        orderNumber: 'الإسكندرية، مصر',
      });
    } catch (err) {
      alert(language === 'ar' ? 'حدث خطأ أثناء إضافة التقييم' : 'Failed to add review');
    }
  };

  // Authenticate Admin
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === storedPin || pinInput === '1234') {
      setIsAuthenticated(true);
      localStorage.setItem('maison_admin_auth', 'true');
      setPinError('');
    } else {
      setPinError(language === 'ar' ? 'رمز الدخول غير صحيح' : 'Invalid PIN Code');
    }
  };

  const handleLogoutAdmin = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('maison_admin_auth');
  };

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length >= 4) {
      setStoredPin(newPin);
      localStorage.setItem('maison_admin_pin', newPin);
      setIsChangingPin(false);
      setNewPin('');
      alert(language === 'ar' ? 'تم تغيير رمز الدخول بنجاح!' : 'PIN updated successfully!');
    } else {
      alert(language === 'ar' ? 'رمز الدخول يجب أن يتكون من 4 أرقام على الأقل' : 'PIN must be at least 4 digits');
    }
  };

  // Order status update
  const handleOrderStatusChange = async (userId: string, orderId: string, newStatus: SavedOrder['status']) => {
    try {
      await updateOrderStatusAdmin(userId, orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      console.error(err);
      alert(language === 'ar' ? 'حدث خطأ أثناء تحديث حالة الطلب' : 'Failed to update order status');
    }
  };

  const handleConfirmDeleteOrder = async () => {
    if (!orderToDelete) return;
    const ordId = orderToDelete.id;
    const uId = orderToDelete.userId;
    setOrders((prev) => prev.filter((o) => o.id !== ordId));
    setOrderToDelete(null);
    try {
      await deleteOrderAdmin(uId, ordId);
    } catch (err) {
      console.error('Failed to delete order:', err);
      alert(language === 'ar' ? 'حدث خطأ أثناء حذف الطلب' : 'Failed to delete order');
    }
  };

  // Product modal handlers
  const handleOpenAddModal = (presetCategory?: Category) => {
    setEditingProduct(null);
    setFormData({
      name: '',
      nameAr: '',
      subtitle: 'TOUZA Casual Collection',
      subtitleAr: 'تشكيلة توزا الكاجوال الفاخرة',
      category: presetCategory?.nameEn || categories[0]?.nameEn || 'Shirts',
      categoryAr: presetCategory?.nameAr || categories[0]?.nameAr || 'قميص',
      price: 850,
      originalPrice: 1100,
      description: '',
      descriptionAr: '',
      images: [
        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=600'
      ],
      colors: [
        { name: 'Black', nameAr: 'أسود', hex: '#111111' },
        { name: 'Beige', nameAr: 'بيج', hex: '#d9cdb8' }
      ],
      sizes: [
        { size: 'M', inStock: true },
        { size: 'L', inStock: true },
        { size: 'XL', inStock: true },
        { size: 'XXL', inStock: true }
      ],
      isNewArrival: true,
      isFeatured: true,
      showOnHome: true,
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setFormData({
      ...prod,
      category: prod.category || (categories[0]?.nameEn || 'Shirts'),
      categoryAr: prod.categoryAr || (categories[0]?.nameAr || 'قميص'),
      originalPrice: prod.originalPrice || 0
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      alert(language === 'ar' ? 'يرجى إدخال اسم المنتج والسعر' : 'Product name and price are required');
      return;
    }

    const cleanedOriginalPrice = formData.originalPrice && Number(formData.originalPrice) > Number(formData.price)
      ? Number(formData.originalPrice)
      : undefined;

    const assignedCategory = formData.category || (categories[0]?.nameEn || 'Shirts');
    const assignedCategoryAr = formData.categoryAr || (categories[0]?.nameAr || 'قميص');

    if (editingProduct) {
      const updated: Product = {
        ...editingProduct,
        ...(formData as Product),
        category: assignedCategory,
        categoryAr: assignedCategoryAr,
        price: Number(formData.price),
        originalPrice: cleanedOriginalPrice,
      };
      onUpdateProduct(updated);
    } else {
      const newProd: Product = {
        id: 'prod-' + Date.now(),
        name: formData.name || 'New Item',
        nameAr: formData.nameAr || formData.name,
        subtitle: formData.subtitle || 'TOUZA Casual Collection',
        subtitleAr: formData.subtitleAr || 'تشكيلة توزا الكاجوال',
        category: assignedCategory,
        categoryAr: assignedCategoryAr,
        price: Number(formData.price),
        originalPrice: cleanedOriginalPrice,
        description: formData.description || '',
        descriptionAr: formData.descriptionAr || formData.description || '',
        colors: formData.colors && formData.colors.length > 0 ? formData.colors : [{ name: 'Black', nameAr: 'أسود', hex: '#111111' }],
        sizes: formData.sizes && formData.sizes.length > 0 ? formData.sizes : [
          { size: 'M', inStock: true },
          { size: 'L', inStock: true },
          { size: 'XL', inStock: true },
          { size: 'XXL', inStock: true }
        ],
        images: formData.images && formData.images.length > 0 ? formData.images : ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=600'],
        isNewArrival: formData.isNewArrival ?? true,
        isFeatured: formData.isFeatured ?? true,
        showOnHome: formData.showOnHome ?? true,
      };
      onAddProduct(newProd);
    }

    setIsProductModalOpen(false);
  };

  const handleAddImageField = () => {
    setFormData((prev) => ({
      ...prev,
      images: [...(prev.images || []), ''],
    }));
  };

  const handleUpdateImageUrl = (index: number, url: string) => {
    setFormData((prev) => {
      const imgs = [...(prev.images || [])];
      imgs[index] = url;
      return { ...prev, images: imgs };
    });
  };

  const handleRemoveImageField = (index: number) => {
    setFormData((prev) => {
      const imgs = (prev.images || []).filter((_, i) => i !== index);
      return { ...prev, images: imgs };
    });
  };

  const handleAddColorField = () => {
    setFormData((prev) => ({
      ...prev,
      colors: [
        ...(prev.colors || []),
        { name: 'Color', nameAr: 'لون جديد', hex: '#111111', imageUrl: '' },
      ],
    }));
  };

  const handleUpdateColor = (index: number, key: keyof ProductColor, value: string) => {
    setFormData((prev) => {
      const updatedColors = [...(prev.colors || [])];
      updatedColors[index] = {
        ...updatedColors[index],
        [key]: value,
      };
      return { ...prev, colors: updatedColors };
    });
  };

  const handleRemoveColorField = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      colors: (prev.colors || []).filter((_, i) => i !== index),
    }));
  };

  const handleAddSizesToColor = (colorIdx: number, sizesStr: string) => {
    const rawSizes = sizesStr
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    setFormData((prev) => {
      const updatedColors = [...(prev.colors || [])];
      const existingSizes = updatedColors[colorIdx]?.sizes || [];
      const existingSizeNames = existingSizes.map((s) => s.size.toLowerCase());
      const newSizesList = [...existingSizes];

      rawSizes.forEach((sz) => {
        if (!existingSizeNames.includes(sz.toLowerCase())) {
          newSizesList.push({ size: sz, inStock: true });
        }
      });

      updatedColors[colorIdx] = {
        ...updatedColors[colorIdx],
        sizes: newSizesList,
      };

      return { ...prev, colors: updatedColors };
    });
  };

  const handleCopyGeneralSizesToColor = (colorIdx: number) => {
    setFormData((prev) => {
      const updatedColors = [...(prev.colors || [])];
      const generalSizes = prev.sizes ? JSON.parse(JSON.stringify(prev.sizes)) : [];
      updatedColors[colorIdx] = {
        ...updatedColors[colorIdx],
        sizes: generalSizes,
      };
      return { ...prev, colors: updatedColors };
    });
  };

  const handleClearColorSizes = (colorIdx: number) => {
    setFormData((prev) => {
      const updatedColors = [...(prev.colors || [])];
      if (updatedColors[colorIdx]) {
        delete updatedColors[colorIdx].sizes;
      }
      return { ...prev, colors: updatedColors };
    });
  };

  const handleToggleColorSizeStock = (colorIdx: number, sizeIdx: number) => {
    setFormData((prev) => {
      const updatedColors = [...(prev.colors || [])];
      const col = updatedColors[colorIdx];
      if (col && col.sizes && col.sizes[sizeIdx]) {
        const newSizes = [...col.sizes];
        newSizes[sizeIdx] = {
          ...newSizes[sizeIdx],
          inStock: !newSizes[sizeIdx].inStock,
        };
        updatedColors[colorIdx] = { ...col, sizes: newSizes };
      }
      return { ...prev, colors: updatedColors };
    });
  };

  const handleRemoveColorSize = (colorIdx: number, sizeIdx: number) => {
    setFormData((prev) => {
      const updatedColors = [...(prev.colors || [])];
      const col = updatedColors[colorIdx];
      if (col && col.sizes) {
        updatedColors[colorIdx] = {
          ...col,
          sizes: col.sizes.filter((_, i) => i !== sizeIdx),
        };
      }
      return { ...prev, colors: updatedColors };
    });
  };

  const [customSizeInput, setCustomSizeInput] = useState('');

  const handleAddCustomSize = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customSizeInput.trim()) return;

    const rawSizes = customSizeInput
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    setFormData((prev) => {
      const existing = (prev.sizes || []).map((s) => s.size.toLowerCase());
      const newSizes = [...(prev.sizes || [])];

      rawSizes.forEach((sz) => {
        if (!existing.includes(sz.toLowerCase())) {
          newSizes.push({ size: sz, inStock: true });
        }
      });

      return { ...prev, sizes: newSizes };
    });

    setCustomSizeInput('');
  };

  const handleUpdateSize = (index: number, key: keyof ProductSize, value: any) => {
    setFormData((prev) => {
      const updatedSizes = [...(prev.sizes || [])];
      updatedSizes[index] = {
        ...updatedSizes[index],
        [key]: value,
      };
      return { ...prev, sizes: updatedSizes };
    });
  };

  const handleRemoveSizeField = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      sizes: (prev.sizes || []).filter((_, i) => i !== index),
    }));
  };

  const getPresetSizesList = (presetType: string): string[] => {
    switch (presetType) {
      case 'clothing':
      case 'clothing-standard':
        return ['S', 'M', 'L', 'XL', 'XXL'];
      case 'clothing-extended':
        return ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];
      case 'numeric':
      case 'numeric-clothing':
        return ['36', '38', '40', '42', '44', '46'];
      case 'pants':
        return ['30', '32', '34', '36', '38', '40'];
      case 'shoes':
        return ['37', '38', '39', '40', '41', '42', '43', '44', '45'];
      case 'shoes-women':
        return ['36', '37', '38', '39', '40', '41'];
      case 'free-size':
        return ['Free Size'];
      case 'oversize':
        return ['Over Size 1', 'Over Size 2'];
      default:
        return [];
    }
  };

  const handleAddQuickSizesPreset = (presetType: string, overwrite = false) => {
    const presetList = getPresetSizesList(presetType);
    if (presetList.length === 0) return;

    setFormData((prev) => {
      if (overwrite) {
        return {
          ...prev,
          sizes: presetList.map((sz) => ({ size: sz, inStock: true })),
        };
      }
      const existing = (prev.sizes || []).map((s) => s.size.toLowerCase());
      const newSizes = [...(prev.sizes || [])];
      presetList.forEach((sz) => {
        if (!existing.includes(sz.toLowerCase())) {
          newSizes.push({ size: sz, inStock: true });
        }
      });
      return { ...prev, sizes: newSizes };
    });
  };

  const handleAddQuickSizesPresetToColor = (colorIdx: number, presetType: string, overwrite = false) => {
    const presetList = getPresetSizesList(presetType);
    if (presetList.length === 0) return;

    setFormData((prev) => {
      const updatedColors = [...(prev.colors || [])];
      if (!updatedColors[colorIdx]) return prev;

      if (overwrite) {
        updatedColors[colorIdx] = {
          ...updatedColors[colorIdx],
          sizes: presetList.map((sz) => ({ size: sz, inStock: true })),
        };
        return { ...prev, colors: updatedColors };
      }

      const existingSizes = updatedColors[colorIdx].sizes || [];
      const existingNames = existingSizes.map((s) => s.size.toLowerCase());
      const newSizes = [...existingSizes];

      presetList.forEach((sz) => {
        if (!existingNames.includes(sz.toLowerCase())) {
          newSizes.push({ size: sz, inStock: true });
        }
      });

      updatedColors[colorIdx] = {
        ...updatedColors[colorIdx],
        sizes: newSizes,
      };
      return { ...prev, colors: updatedColors };
    });
  };

  const handleFileUploadForColor = async (index: number, file: File) => {
    if (!file) return;
    try {
      const url = await uploadToCloudinary(file, { folder: 'touza_products' });
      if (url) {
        handleUpdateColor(index, 'imageUrl', url);
      }
    } catch (err) {
      console.error('Cloudinary color upload error:', err);
    }
  };

  const handleFileUploadForMainImage = async (index: number, file: File) => {
    if (!file) return;
    try {
      const url = await uploadToCloudinary(file, { folder: 'touza_products' });
      if (url) {
        handleUpdateImageUrl(index, url);
      }
    } catch (err) {
      console.error('Cloudinary product upload error:', err);
    }
  };

  // Category Handlers
  const handleOpenAddCategoryModal = () => {
    setEditingCategory(null);
    setCategoryForm({
      nameEn: '',
      nameAr: '',
      descriptionEn: '',
      descriptionAr: '',
      imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600',
      icon: 'styler',
    });
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategoryModal = (cat: Category) => {
    setEditingCategory(cat);
    setCategoryForm({
      nameEn: cat.nameEn || '',
      nameAr: cat.nameAr || '',
      descriptionEn: cat.descriptionEn || '',
      descriptionAr: cat.descriptionAr || '',
      imageUrl: cat.imageUrl || '',
      icon: cat.icon || 'styler',
    });
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.nameAr.trim() || !categoryForm.nameEn.trim()) {
      alert(language === 'ar' ? 'يرجى كتابة اسم التصنيف بالعربية والإنجيلزية' : 'Please provide category name in Arabic and English');
      return;
    }

    try {
      if (editingCategory) {
        if (onUpdateCategory) {
          await onUpdateCategory(editingCategory.id, categoryForm);
        }
      } else {
        if (onAddCategory) {
          await onAddCategory(categoryForm);
        }
      }
      setIsCategoryModalOpen(false);
    } catch (err) {
      console.error('Failed to save category:', err);
      alert(language === 'ar' ? 'حدث خطأ أثناء حفظ التصنيف' : 'Failed to save category');
    }
  };

  const handleConfirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    try {
      if (onDeleteCategory) {
        await onDeleteCategory(categoryToDelete.id);
      }
      setCategoryToDelete(null);
    } catch (err) {
      console.error('Failed to delete category:', err);
      alert(language === 'ar' ? 'حدث خطأ أثناء حذف التصنيف' : 'Failed to delete category');
    }
  };

  const handleResetDefaultCategories = async () => {
    if (confirm(language === 'ar' ? 'هل أنت تأكد من استعادة التصنيفات الافتراضية الرئيسية؟' : 'Restore default categories?')) {
      try {
        if (onResetCategories) {
          await onResetCategories();
        }
        alert(language === 'ar' ? 'تمت استعادة التصنيفات الافتراضية بنجاح!' : 'Default categories restored!');
      } catch (err) {
        console.error('Failed to restore default categories:', err);
      }
    }
  };

  const handleFileUploadForCategoryImage = async (file: File) => {
    if (!file) return;
    try {
      const url = await uploadToCloudinary(file, { folder: 'touza_categories' });
      if (url) {
        setCategoryForm((prev) => ({ ...prev, imageUrl: url }));
      }
    } catch (err) {
      console.error('Cloudinary category upload error:', err);
    }
  };

  // Promo Code Submission
  const handleCreatePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromoCode.trim()) return;

    const val = Number(newPromoDiscountValue) || 0;
    const maxUsesVal = Number(newPromoMaxUses) > 0 ? Number(newPromoMaxUses) : 0;

    const promo: PromoCode = {
      id: 'promo-' + Date.now(),
      code: newPromoCode.trim().toUpperCase(),
      discountType: newPromoDiscountType,
      discountPercent: newPromoDiscountType === 'percentage' ? val : 0,
      discountAmount: newPromoDiscountType === 'fixed' ? val : val,
      maxUses: maxUsesVal,
      usedCount: 0,
      isActive: true,
      expiryNote: newPromoNote.trim() || (
        language === 'ar'
          ? (newPromoDiscountType === 'percentage' ? `خصم ${val}%` : `خصم ${val} ج.م`)
          : (newPromoDiscountType === 'percentage' ? `${val}% Off` : `${val} EGP Off`)
      ),
    };
    onAddPromoCode(promo);
    setNewPromoCode('');
    setNewPromoDiscountValue(15);
    setNewPromoMaxUses(1);
    setNewPromoNote('');
  };

  // Settings Save
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateStoreSettings(settingsForm);
    alert(language === 'ar' ? 'تم حفظ إعدادات الموقع بنجاح!' : 'Store settings updated successfully!');
  };

  // KPI Calculations
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalOrdersCount = orders.length;
  const activeProductsCount = products.length;

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber?.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
      o.userEmail?.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
      o.shippingAddress?.fullName?.toLowerCase().includes(orderSearchTerm.toLowerCase());
    const matchesStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const term = userSearchTerm.toLowerCase();
    const matchesSearch =
      (u.name && u.name.toLowerCase().includes(term)) ||
      (u.email && u.email.toLowerCase().includes(term)) ||
      (u.username && u.username.toLowerCase().includes(term)) ||
      (u.phone && u.phone.toLowerCase().includes(term));
    const matchesProvider = userProviderFilter === 'all' || u.provider === userProviderFilter;
    return matchesSearch && matchesProvider;
  });

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === 'all' ||
      p.category === selectedCategory ||
      p.categoryAr === selectedCategory ||
      categories.some(
        (c) =>
          (c.nameEn === selectedCategory || c.nameAr === selectedCategory) &&
          (p.category === c.nameEn || p.category === c.nameAr || p.categoryAr === c.nameAr)
      );
    const matchesSearch =
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      (p.nameAr && p.nameAr.toLowerCase().includes(productSearch.toLowerCase())) ||
      (p.categoryAr && p.categoryAr.toLowerCase().includes(productSearch.toLowerCase())) ||
      (p.category && p.category.toLowerCase().includes(productSearch.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Filtered Categories
  const filteredCategories = categories.filter((c) => {
    const term = categorySearchTerm.toLowerCase();
    return (
      (c.nameAr && c.nameAr.toLowerCase().includes(term)) ||
      (c.nameEn && c.nameEn.toLowerCase().includes(term)) ||
      (c.descriptionAr && c.descriptionAr.toLowerCase().includes(term)) ||
      (c.descriptionEn && c.descriptionEn.toLowerCase().includes(term))
    );
  });

  // Filtered Reviews
  const filteredReviews = reviews.filter((r) => {
    const term = reviewSearchTerm.toLowerCase();
    const matchesSearch =
      (r.userName && r.userName.toLowerCase().includes(term)) ||
      (r.productTitle && r.productTitle.toLowerCase().includes(term)) ||
      (r.comment && r.comment.toLowerCase().includes(term)) ||
      (r.orderNumber && r.orderNumber.toLowerCase().includes(term));
    const matchesStar =
      reviewStarFilter === 'all' || r.rating === Number(reviewStarFilter);
    return matchesSearch && matchesStar;
  });

  // PIN Lock Screen
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 bg-[#000000] text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#111111] border border-[#333333] rounded-2xl p-8 space-y-6 shadow-2xl text-center">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto text-[#ffffff]">
            <ShieldCheck className="w-9 h-9 text-[#c5a059]" />
          </div>

          <div>
            <span className="font-label-caps text-[11px] text-[#888888]">
              {language === 'ar' ? 'نظام التحكم المركزي' : 'Central Control Hub'}
            </span>
            <h2 className="font-display text-[26px] font-bold text-white mt-1">
              {language === 'ar' ? 'لوحة تحكم TOUZA STORE' : 'TOUZA STORE Admin Portal'}
            </h2>
            <p className="font-body text-[13px] text-[#aaaaaa] mt-2">
              {language === 'ar'
                ? 'أدخل رمز الدخول السري للوصول إلى إدارة الطلبات والمنتجات'
                : 'Enter security PIN to access store management'}
            </p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                maxLength={8}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="••••"
                className="w-full bg-[#1e1e1e] border border-[#444444] rounded-xl py-3 px-4 text-center font-mono text-[24px] tracking-widest text-white focus:outline-none focus:border-white transition-colors"
                autoFocus
              />
              {pinError && <p className="text-[13px] text-[#ff5252] mt-2 font-body">{pinError}</p>}
            </div>

            <button
              type="submit"
              className="w-full bg-white text-black py-3.5 rounded-xl font-label-caps font-bold hover:bg-[#e0e0e0] transition-colors cursor-pointer text-[14px]"
            >
              {language === 'ar' ? 'دخول لوحة التحكم' : 'Access Dashboard'}
            </button>
          </form>

          <button
            onClick={onCloseAdmin}
            className="text-[13px] font-body text-[#888888] hover:text-white transition-colors cursor-pointer"
          >
            {language === 'ar' ? 'العودة إلى المتجر' : 'Return to Main Store'}
          </button>
        </div>
      </div>
    );
  }

  const handleOpenGmailForCampaign = (title: string, content: string, promo?: string) => {
    const activeEmails = subscribers
      .filter((s) => s.status !== 'unsubscribed' && s.email)
      .map((s) => s.email.trim());
    if (activeEmails.length === 0) {
      alert(language === 'ar' ? 'لا يوجد مشتركين نشطين لإرسال النشرة البريدية إليهم' : 'No active subscribers');
      return;
    }
    const bccList = activeEmails.join(',');
    let bodyText = content;
    if (promo) {
      bodyText += `\n\n${language === 'ar' ? 'كود الخصم الحصري للمشتركين:' : 'Exclusive Promo Code:'} ${promo}`;
    }
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&tf=1&bcc=${encodeURIComponent(bccList)}&su=${encodeURIComponent(title)}&body=${encodeURIComponent(bodyText)}`;
    window.open(gmailUrl, '_blank');
  };

  const handleOpenMailtoForCampaign = (title: string, content: string, promo?: string) => {
    const activeEmails = subscribers
      .filter((s) => s.status !== 'unsubscribed' && s.email)
      .map((s) => s.email.trim());
    if (activeEmails.length === 0) {
      alert(language === 'ar' ? 'لا يوجد مشتركين نشطين' : 'No active subscribers');
      return;
    }
    const bccList = activeEmails.join(',');
    let bodyText = content;
    if (promo) {
      bodyText += `\n\n${language === 'ar' ? 'كود الخصم الحصري:' : 'Promo Code:'} ${promo}`;
    }
    const mailtoUrl = `mailto:?bcc=${encodeURIComponent(bccList)}&subject=${encodeURIComponent(title)}&body=${encodeURIComponent(bodyText)}`;
    window.location.href = mailtoUrl;
  };

  const handleSendBroadcastCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignTitle.trim() || !campaignContent.trim()) {
      alert(language === 'ar' ? 'يرجى إدخال عنوان ومحتوى الرسالة البريدية' : 'Title and content are required');
      return;
    }

    setSendingBroadcast(true);
    try {
      const activeCount = subscribers.filter((s) => s.status !== 'unsubscribed').length || subscribers.length;
      const title = campaignTitle.trim();
      const content = campaignContent.trim();
      const promo = campaignPromo.trim();

      const newCamp = await saveNewsletterCampaignAdmin(
        title,
        content,
        activeCount,
        campaignPreview.trim(),
        promo
      );
      setCampaigns((prev) => [newCamp, ...prev]);

      // Automatically launch Gmail with active subscriber emails prefilled in BCC!
      handleOpenGmailForCampaign(title, content, promo);

      setIsBroadcastModalOpen(false);
      setCampaignTitle('');
      setCampaignPreview('');
      setCampaignContent('');
      setCampaignPromo('');
      alert(
        language === 'ar'
          ? `✓ تم تسجيل الحملة بنجاح وفتح نافذة الإرسال عبر Gmail مع إضافة جميع المشتركين (${activeCount} عميل) تلقائياً في الخانة السرية BCC!`
          : `✓ Campaign recorded and opened in Gmail with ${activeCount} subscriber emails in BCC!`
      );
    } catch (err) {
      console.error(err);
      alert(language === 'ar' ? 'حدث خطأ أثناء حفظ أو إرسال الحملة البريدية' : 'Failed to send campaign');
    } finally {
      setSendingBroadcast(false);
    }
  };

  const handleConfirmDeleteSubscriber = async () => {
    if (!subscriberToDelete) return;
    const subId = subscriberToDelete.id;
    const subEmail = subscriberToDelete.email;
    setSubscriberToDelete(null);

    // Optimistically filter out from subscribers list
    setSubscribers((prev) =>
      prev.filter(
        (s) =>
          s.id !== subId &&
          s.email.trim().toLowerCase() !== subEmail.trim().toLowerCase()
      )
    );

    try {
      await deleteNewsletterSubscriberAdmin(subId, subEmail);
      console.log(`[SUBSCRIBER DELETED] Successfully removed subscriber ${subEmail} persistently.`);
    } catch (err) {
      console.error('Failed to delete subscriber from backend:', err);
    }
  };

  const handleCopyAllEmails = () => {
    if (subscribers.length === 0) return;
    const emailList = subscribers.map((s) => s.email).join(', ');
    navigator.clipboard.writeText(emailList).then(() => {
      setCopySuccessMsg(language === 'ar' ? 'تم نسخ جميع الإيميلات إلى الحافظة بنجاح!' : 'All emails copied to clipboard!');
      setTimeout(() => setCopySuccessMsg(''), 3500);
    });
  };

  const filteredSubscribers = subscribers.filter(
    (s) =>
      s.email.toLowerCase().includes(subscriberSearch.toLowerCase()) ||
      (s.source && s.source.toLowerCase().includes(subscriberSearch.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#f4f5f7] text-[#1f1f1f] flex flex-col font-body">
      {/* Top Admin Navigation Header */}
      <header className="bg-[#000000] text-white border-b border-[#333333] sticky top-0 z-40 shadow-md">
        <div className="max-w-[1500px] mx-auto px-3 sm:px-8 py-2.5 sm:py-3.5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
              <LayoutDashboard className="w-5 h-5 sm:w-6 sm:h-6 text-[#c5a059]" />
            </div>
            <div>
              <h1 className="font-display text-[14px] sm:text-[20px] font-bold tracking-wide leading-tight text-white">
                {language === 'ar' ? 'لوحة تحكم TOUZA' : 'TOUZA STORE Admin Dashboard'}
              </h1>
              <p className="font-label-caps text-[9px] sm:text-[10px] text-white/70">
                {language === 'ar' ? 'التحكم الشامل في المتجر والطلبات' : 'Full Store & Order Administration'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <button
              onClick={() => setIsChangingPin(true)}
              className="flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-lg text-[11px] sm:text-[12px] font-label-caps transition-colors cursor-pointer"
              title={language === 'ar' ? 'تغيير الرمز' : 'Change PIN'}
            >
              <KeyRound className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline sm:inline">{language === 'ar' ? 'تغيير الرمز' : 'Change PIN'}</span>
            </button>

            <button
              onClick={handleLogoutAdmin}
              className="flex items-center gap-1 bg-[#ba1a1a]/90 hover:bg-[#ba1a1a] text-white px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg text-[11px] sm:text-[12px] font-label-caps transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{language === 'ar' ? 'قفل' : 'Lock'}</span>
            </button>

            <button
              onClick={onCloseAdmin}
              className="bg-white text-black hover:bg-[#e0e0e0] px-2.5 py-1.5 sm:px-4 sm:py-1.5 rounded-lg text-[11px] sm:text-[12px] font-label-caps font-bold transition-colors cursor-pointer flex items-center gap-1 shrink-0"
            >
              <Store className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{language === 'ar' ? 'عرض المتجر' : 'Store Preview'}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Bar */}
        <div className="max-w-[1500px] mx-auto px-2 sm:px-8 flex overflow-x-auto border-t border-[#222222] scrollbar-none">
          {[
            { id: 'overview', Icon: BarChart3, labelAr: 'الإحصائيات', labelEn: 'Overview' },
            { id: 'categories', Icon: LayoutGrid, labelAr: `التصنيفات (${categories.length})`, labelEn: `Categories (${categories.length})` },
            { id: 'products', Icon: Shirt, labelAr: `المنتجات (${products.length})`, labelEn: `Products (${products.length})` },
            { id: 'orders', Icon: Truck, labelAr: `الطلبات (${orders.length})`, labelEn: `Orders (${orders.length})` },
            { id: 'users', Icon: Users, labelAr: `المستخدمين (${users.length})`, labelEn: `Users (${users.length})` },
            { id: 'promos', Icon: Tag, labelAr: `أكواد الخصم (${promoCodes.length})`, labelEn: `Promo Codes (${promoCodes.length})` },
            { id: 'reviews', Icon: MessageSquare, labelAr: `التقييمات (${reviews.length})`, labelEn: `Reviews (${reviews.length})` },
            { id: 'newsletter', Icon: Mail, labelAr: `النشرة البريدية (${subscribers.length})`, labelEn: `Newsletter (${subscribers.length})` },
            { id: 'settings', Icon: Settings, labelAr: 'إعدادات البنرات', labelEn: 'Store Settings' },
            { id: 'payment_settings', Icon: CreditCard, labelAr: 'إعدادات طرق الدفع', labelEn: 'Payment Settings' },
            { id: 'ai_studio_sync', Icon: Code2, labelAr: 'مزامنة Google AI Studio', labelEn: 'AI Studio Sync' },
          ].map((tab) => {
            const TabIcon = tab.Icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2.5 sm:py-3 border-b-2 font-label-caps text-[12px] sm:text-[13px] whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-white text-white font-bold bg-white/10'
                    : 'border-transparent text-white/65 hover:text-white hover:bg-white/5'
                }`}
              >
                <TabIcon className="w-4 h-4" />
                <span>{language === 'ar' ? tab.labelAr : tab.labelEn}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Dashboard Workspace */}
      <main className="flex-1 max-w-[1500px] w-full mx-auto p-4 sm:p-8 space-y-8">
        {/* Change PIN Modal */}
        {isChangingPin && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
              <h3 className="font-display text-[20px] font-bold text-black">
                {language === 'ar' ? 'تغيير رمز دخول لوحة التحكم' : 'Update Security PIN'}
              </h3>
              <form onSubmit={handleChangePin} className="space-y-4">
                <div>
                  <label className="block text-[12px] font-label-caps text-[#5e5e5c] mb-1">
                    {language === 'ar' ? 'الرمز الجديد (4 أرقام أو أكثر)' : 'New PIN Code (4+ digits)'}
                  </label>
                  <input
                    type="password"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="••••"
                    className="w-full border border-[#c4c7c7] rounded-xl py-2.5 px-3 text-center text-[18px] font-mono"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsChangingPin(false)}
                    className="w-1/2 border border-[#c4c7c7] py-2 rounded-xl font-label-caps text-[13px]"
                  >
                    {language === 'ar' ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 bg-black text-white py-2 rounded-xl font-label-caps text-[13px] font-bold"
                  >
                    {language === 'ar' ? 'حفظ الرمز' : 'Save PIN'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8 fade-in-up">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white p-6 rounded-2xl border border-[#c4c7c7]/30 shadow-xs flex items-center justify-between">
                <div>
                  <p className="font-label-caps text-[12px] text-[#747878]">
                    {language === 'ar' ? 'إجمالي المبيعات' : 'Total Revenue'}
                  </p>
                  <h3 className="font-display text-[26px] font-bold text-[#000000] mt-1 dir-ltr text-right rtl:text-right">
                    {formatPrice(totalRevenue)}
                  </h3>
                </div>
                <div className="w-12 h-12 bg-[#2e7d32]/10 text-[#2e7d32] rounded-xl flex items-center justify-center">
                  <Banknote className="w-7 h-7" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#c4c7c7]/30 shadow-xs flex items-center justify-between">
                <div>
                  <p className="font-label-caps text-[12px] text-[#747878]">
                    {language === 'ar' ? 'عدد الطلبات المسجلة' : 'Total Orders'}
                  </p>
                  <h3 className="font-display text-[26px] font-bold text-[#000000] mt-1">
                    {totalOrdersCount} {language === 'ar' ? 'طلب' : 'orders'}
                  </h3>
                </div>
                <div className="w-12 h-12 bg-[#000000]/10 text-[#000000] rounded-xl flex items-center justify-center">
                  <ShoppingBag className="w-7 h-7" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#c4c7c7]/30 shadow-xs flex items-center justify-between">
                <div>
                  <p className="font-label-caps text-[12px] text-[#747878]">
                    {language === 'ar' ? 'المنتجات النشطة' : 'Active Products'}
                  </p>
                  <h3 className="font-display text-[26px] font-bold text-[#000000] mt-1">
                    {activeProductsCount} {language === 'ar' ? 'منتج' : 'items'}
                  </h3>
                </div>
                <div className="w-12 h-12 bg-[#1976d2]/10 text-[#1976d2] rounded-xl flex items-center justify-center">
                  <Shirt className="w-7 h-7" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#c4c7c7]/30 shadow-xs flex items-center justify-between">
                <div>
                  <p className="font-label-caps text-[12px] text-[#747878]">
                    {language === 'ar' ? 'أكواد الخصم الفعالة' : 'Active Promos'}
                  </p>
                  <h3 className="font-display text-[26px] font-bold text-[#000000] mt-1">
                    {promoCodes.filter((p) => p.isActive).length} {language === 'ar' ? 'كود' : 'promos'}
                  </h3>
                </div>
                <div className="w-12 h-12 bg-[#ed6c02]/10 text-[#ed6c02] rounded-xl flex items-center justify-center">
                  <Tag className="w-7 h-7" />
                </div>
              </div>
            </div>

            {/* Quick Actions Shortcuts */}
            <div className="bg-white p-6 rounded-2xl border border-[#c4c7c7]/30 shadow-xs space-y-4">
              <h2 className="font-display text-[20px] font-bold text-[#000000]">
                {language === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <button
                  onClick={() => {
                    setActiveTab('products');
                    handleOpenAddModal();
                  }}
                  className="p-4 bg-[#f9f9f9] hover:bg-[#000000] hover:text-white rounded-xl border border-[#c4c7c7]/30 flex flex-col items-center justify-center text-center gap-2 transition-all cursor-pointer group"
                >
                  <span className="material-symbols-outlined text-[28px] text-[#000000] group-hover:text-white">
                    add_circle
                  </span>
                  <span className="font-label-caps text-[13px] font-bold">
                    {language === 'ar' ? 'إضافة منتج جديد' : 'Add New Product'}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('orders')}
                  className="p-4 bg-[#f9f9f9] hover:bg-[#000000] hover:text-white rounded-xl border border-[#c4c7c7]/30 flex flex-col items-center justify-center text-center gap-2 transition-all cursor-pointer group"
                >
                  <span className="material-symbols-outlined text-[28px] text-[#000000] group-hover:text-white">
                    local_shipping
                  </span>
                  <span className="font-label-caps text-[13px] font-bold">
                    {language === 'ar' ? 'متابعة شحنات العملاء' : 'Review Live Orders'}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('promos')}
                  className="p-4 bg-[#f9f9f9] hover:bg-[#000000] hover:text-white rounded-xl border border-[#c4c7c7]/30 flex flex-col items-center justify-center text-center gap-2 transition-all cursor-pointer group"
                >
                  <span className="material-symbols-outlined text-[28px] text-[#000000] group-hover:text-white">
                    loyalty
                  </span>
                  <span className="font-label-caps text-[13px] font-bold">
                    {language === 'ar' ? 'إنشاء كود خصم' : 'Create Promo Code'}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('settings')}
                  className="p-4 bg-[#f9f9f9] hover:bg-[#000000] hover:text-white rounded-xl border border-[#c4c7c7]/30 flex flex-col items-center justify-center text-center gap-2 transition-all cursor-pointer group"
                >
                  <span className="material-symbols-outlined text-[28px] text-[#000000] group-hover:text-white">
                    tune
                  </span>
                  <span className="font-label-caps text-[13px] font-bold">
                    {language === 'ar' ? 'تعديل بنرات الواجهة' : 'Update Banners'}
                  </span>
                </button>
              </div>
            </div>

            {/* Recent Orders Overview Table */}
            <div className="bg-white p-6 rounded-2xl border border-[#c4c7c7]/30 shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="font-display text-[20px] font-bold text-[#000000]">
                  {language === 'ar' ? 'أحدث طلبات العملاء' : 'Recent Customer Orders'}
                </h2>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="font-label-caps text-[12px] text-[#000000] underline font-bold cursor-pointer"
                >
                  {language === 'ar' ? 'عرض كافة الطلبات' : 'View All Orders'} &rarr;
                </button>
              </div>

              {loadingOrders ? (
                <div className="py-8 text-center text-[#747878]">
                  {language === 'ar' ? 'جاري تحميل الطلبات...' : 'Loading orders...'}
                </div>
              ) : orders.length === 0 ? (
                <div className="py-8 text-center text-[#747878] bg-[#f9f9f9] rounded-xl">
                  {language === 'ar' ? 'لا توجد طلبات حتى الآن' : 'No orders recorded yet'}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-start text-[14px]">
                    <thead className="border-b border-[#c4c7c7]/30 font-label-caps text-[11px] text-[#747878] bg-[#f9f9f9]">
                      <tr>
                        <th className="p-3 text-start">{language === 'ar' ? 'رقم الطلب' : 'Order ID'}</th>
                        <th className="p-3 text-start">{language === 'ar' ? 'العميل' : 'Customer'}</th>
                        <th className="p-3 text-start">{language === 'ar' ? 'الإجمالي' : 'Total'}</th>
                        <th className="p-3 text-start">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#c4c7c7]/20">
                      {orders.slice(0, 5).map((ord) => (
                        <tr key={ord.id} className="hover:bg-[#f9f9f9]">
                          <td className="p-3 font-mono font-bold text-[#000000] dir-ltr text-start">
                            {ord.orderNumber}
                          </td>
                          <td className="p-3">
                            <p className="font-bold text-[#000000]">{ord.shippingAddress?.fullName || '—'}</p>
                            <p className="text-[12px] text-[#747878]">{ord.userEmail}</p>
                          </td>
                          <td className="p-3 font-bold text-[#000000] dir-ltr text-start">
                            {formatPrice(ord.total)}
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[11px] font-label-caps font-bold ${
                                ord.status === 'delivered'
                                  ? 'bg-green-100 text-green-800'
                                  : ord.status === 'shipped'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {ord.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: CATEGORIES MANAGEMENT */}
        {activeTab === 'categories' && (
          <div className="space-y-6 fade-in-up">
            {/* Top Filter and Action Bar */}
            <div className="bg-white p-5 rounded-2xl border border-[#c4c7c7]/30 shadow-xs flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex flex-1 items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 max-w-md">
                  <span className="material-symbols-outlined absolute right-3 rtl:right-3 ltr:left-3 top-1/2 -translate-y-1/2 text-[#747878] text-[20px]">
                    search
                  </span>
                  <input
                    type="text"
                    value={categorySearchTerm}
                    onChange={(e) => setCategorySearchTerm(e.target.value)}
                    placeholder={
                      language === 'ar'
                        ? 'ابحث باسم التصنيف بالعربي أو الإنجليزي...'
                        : 'Search categories by name or description...'
                    }
                    className="w-full border border-[#c4c7c7] rounded-xl py-2 px-10 text-[14px] bg-[#f9f9f9] focus:bg-white focus:outline-none focus:border-[#000000]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
                <button
                  type="button"
                  onClick={handleResetDefaultCategories}
                  className="bg-[#f3f3f4] text-[#444748] hover:bg-[#e4e4e5] border border-[#c4c7c7]/50 px-4 py-2.5 rounded-xl font-label-caps text-[12px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  title={language === 'ar' ? 'استعادة جميع التصنيفات الافتراضية للبوتيك' : 'Restore default boutique categories'}
                >
                  <span className="material-symbols-outlined text-[18px]">restart_alt</span>
                  <span>{language === 'ar' ? 'استعادة التصنيفات الافتراضية' : 'Restore Defaults'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenAddCategoryModal}
                  className="bg-[#000000] text-white hover:bg-[#222222] px-5 py-2.5 rounded-xl font-label-caps text-[13px] font-bold transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  <span>{language === 'ar' ? 'إضافة تصنيف جديد' : 'Add New Category'}</span>
                </button>
              </div>
            </div>

            {/* Categories Cards Grid */}
            {filteredCategories.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-[#c4c7c7]/30 text-center space-y-3">
                <span className="material-symbols-outlined text-[48px] text-[#c4c7c7]">
                  category
                </span>
                <h3 className="font-display text-[18px] font-bold text-[#000000]">
                  {language === 'ar' ? 'لا توجد تصنيفات مطابقة' : 'No categories found'}
                </h3>
                <p className="font-body text-[13px] text-[#747878]">
                  {language === 'ar'
                    ? 'لم نجد تصنيفًا ينطبق عليه البحث الحالي. اضغط إضافة تصنيف جديد للبدء.'
                    : 'No boutique category matches your search. Click Add New Category to create one.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredCategories.map((cat) => {
                  const productCount = products.filter(
                    (p) =>
                      p.category === cat.nameEn ||
                      p.category === cat.nameAr ||
                      p.categoryAr === cat.nameAr
                  ).length;

                  return (
                    <div
                      key={cat.id}
                      className="bg-white rounded-2xl border border-[#c4c7c7]/30 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow group relative"
                    >
                      {/* Image Banner Header */}
                      <div className="relative h-36 bg-[#111111] overflow-hidden">
                        {cat.imageUrl ? (
                          <img
                            src={cat.imageUrl}
                            alt={cat.nameAr}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#111111] to-[#333333]" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                        {/* Icon Badge */}
                        <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 w-10 h-10 rounded-xl bg-white/90 backdrop-blur-xs text-[#000000] flex items-center justify-center shadow-md">
                          <span className="material-symbols-outlined text-[22px]">
                            {cat.icon || 'styler'}
                          </span>
                        </div>

                        {/* Product Count Pill */}
                        <div className="absolute top-3 right-3 rtl:right-auto rtl:left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs text-white text-[11px] font-mono font-bold border border-white/20">
                          {productCount} {language === 'ar' ? 'منتج' : 'products'}
                        </div>

                        {/* Bottom Name Title inside Image */}
                        <div className="absolute bottom-3 px-4 text-white">
                          <h3 className="font-display text-[18px] font-bold leading-tight drop-shadow-sm">
                            {language === 'ar' ? cat.nameAr : cat.nameEn}
                          </h3>
                          <p className="text-[11px] text-white/80 font-mono">
                            {language === 'ar' ? cat.nameEn : cat.nameAr}
                          </p>
                        </div>
                      </div>

                      {/* Content Body */}
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                        <p className="font-body text-[13px] text-[#444748] line-clamp-2">
                          {(language === 'ar' ? cat.descriptionAr : cat.descriptionEn) ||
                            (language === 'ar' ? 'تشكيلة مميزة من أزياء TOUZA STORE' : 'Exclusive TOUZA STORE collection')}
                        </p>

                        {/* Actions Footer */}
                        <div className="pt-3 border-t border-[#c4c7c7]/20 flex flex-col gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenAddModal(cat)}
                            className="w-full py-2 px-3 rounded-xl bg-[#000000] text-white hover:bg-[#222222] font-label-caps text-[12px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                          >
                            <span className="material-symbols-outlined text-[16px]">add_circle</span>
                            <span>{language === 'ar' ? `+ إضافة منتج بقسم (${cat.nameAr})` : `+ Add Product to (${cat.nameEn})`}</span>
                          </button>

                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[11px] font-mono text-[#747878]">
                              ID: {cat.id}
                            </span>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenEditCategoryModal(cat)}
                                className="px-3 py-1.5 rounded-lg bg-[#f3f3f4] hover:bg-[#e0e0e0] text-[#000000] font-label-caps text-[12px] font-bold transition-colors cursor-pointer flex items-center gap-1 border border-[#c4c7c7]/30"
                                title={language === 'ar' ? 'تعديل التصنيف' : 'Edit Category'}
                              >
                                <span className="material-symbols-outlined text-[15px]">edit</span>
                                <span>{language === 'ar' ? 'تعديل' : 'Edit'}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setCategoryToDelete(cat)}
                                className="px-3 py-1.5 rounded-lg bg-[#ba1a1a]/10 hover:bg-[#ba1a1a]/20 text-[#ba1a1a] font-label-caps text-[12px] font-bold transition-colors cursor-pointer flex items-center gap-1 border border-[#ba1a1a]/20"
                                title={language === 'ar' ? 'حذف التصنيف' : 'Delete Category'}
                              >
                                <span className="material-symbols-outlined text-[15px]">delete</span>
                                <span>{language === 'ar' ? 'حذف' : 'Delete'}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PRODUCTS MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="space-y-6 fade-in-up">
            {/* Action Bar */}
            <div className="bg-white p-5 rounded-2xl border border-[#c4c7c7]/30 shadow-xs flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex flex-wrap flex-1 items-center gap-3 w-full md:w-auto">
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder={language === 'ar' ? 'بحث عن منتج بالاسم أو القسم...' : 'Search products by name or category...'}
                  className="w-full sm:w-64 border border-[#c4c7c7] rounded-xl py-2 px-3 text-[14px]"
                />

                {/* Category Filter Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-label-caps text-[#747878] hidden sm:inline">
                    {language === 'ar' ? 'القسم:' : 'Category:'}
                  </span>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="border border-[#c4c7c7] rounded-xl py-2 px-3 text-[13px] bg-white font-body focus:border-[#000000] focus:outline-none cursor-pointer"
                  >
                    <option value="all">
                      {language === 'ar' ? '🏷️ كل الأقسام والتصنيفات' : '🏷️ All Categories'}
                    </option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.nameEn}>
                        {cat.nameAr} ({cat.nameEn})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab('ai_studio_sync')}
                  className="flex-1 md:flex-initial bg-[#1e1e1e] text-white hover:bg-black px-4 py-2.5 rounded-xl font-label-caps font-bold transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2 text-[13px]"
                  title={language === 'ar' ? 'مزامنة وتصدير كود TypeScript لـ Google AI Studio' : 'Export & Sync TypeScript Code for Google AI Studio'}
                >
                  <Code2 className="w-4 h-4 text-[#c5a059]" />
                  <span>{language === 'ar' ? 'مزامنة كود AI Studio' : 'AI Studio Sync'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSyncAllProducts}
                  disabled={isSyncingProducts}
                  className="flex-1 md:flex-initial bg-[#2e7d32] text-white px-4 py-2.5 rounded-xl font-label-caps font-bold hover:bg-[#1b5e20] active:bg-[#1b5e20] transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2 text-[13px] disabled:opacity-60 disabled:cursor-not-allowed"
                  title={language === 'ar' ? 'مزامنة وحفظ جميع المنتجات مباشرة في قاعدة بيانات Firestore السحابية' : 'Sync all products directly to Cloud Firestore'}
                >
                  <RefreshCw className={`w-4 h-4 text-white ${isSyncingProducts ? 'animate-spin' : ''}`} />
                  <span>
                    {isSyncingProducts
                      ? language === 'ar'
                        ? 'جارٍ المزامنة...'
                        : 'Syncing...'
                      : language === 'ar'
                      ? 'مزامنة المنتجات مع السحابة ☁️'
                      : 'Sync to Cloud ☁️'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleExportProductsBackup}
                  disabled={isExportingProducts}
                  className="flex-1 md:flex-initial bg-white text-[#111111] border border-[#c4c7c7] px-4 py-2.5 rounded-xl font-label-caps font-bold hover:bg-[#f3f4f6] active:bg-[#e5e7eb] transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2 text-[13px] disabled:opacity-60 disabled:cursor-not-allowed"
                  title={language === 'ar' ? 'تصدير نسخة احتياطية من جميع منتجات Firestore كملف JSON' : 'Export JSON backup of all Firestore products'}
                >
                  {isExportingProducts ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-[#747878]" />
                  ) : (
                    <Download className="w-4 h-4 text-[#111111]" />
                  )}
                  <span>
                    {isExportingProducts
                      ? language === 'ar'
                        ? 'جارٍ التصدير...'
                        : 'Exporting...'
                      : language === 'ar'
                      ? 'تصدير نسخة احتياطية من المنتجات'
                      : 'Export Products Backup'}
                  </span>
                </button>

                <button
                  onClick={() => handleOpenAddModal()}
                  className="flex-1 md:flex-initial bg-[#000000] text-white px-5 py-2.5 rounded-xl font-label-caps font-bold hover:bg-[#2f3131] transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2 text-[14px]"
                >
                  <span className="material-symbols-outlined text-[20px]">add</span>
                  <span>{language === 'ar' ? 'إضافة منتج جديد' : 'Add Product'}</span>
                </button>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-2xl border border-[#c4c7c7]/30 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-start text-[14px]">
                  <thead className="bg-[#f9f9f9] border-b border-[#c4c7c7]/30 font-label-caps text-[11px] text-[#747878]">
                    <tr>
                      <th className="p-4 text-start">{language === 'ar' ? 'المنتج والقسم' : 'Product & Category'}</th>
                      <th className="p-4 text-start">{language === 'ar' ? 'المقاسات المتاحة' : 'Available Sizes'}</th>
                      <th className="p-4 text-start">{language === 'ar' ? 'السعر' : 'Price'}</th>
                      <th className="p-4 text-center">{language === 'ar' ? 'الظهور بالرئيسية' : 'Show on Home'}</th>
                      <th className="p-4 text-start">{language === 'ar' ? 'الشارات' : 'Badges'}</th>
                      <th className="p-4 text-center">{language === 'ar' ? 'إجراءات' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#c4c7c7]/20">
                    {filteredProducts.map((prod) => {
                      const isOnHome = !!(prod.showOnHome || prod.isFeatured);
                      const displayCat = prod.categoryAr || prod.category || (language === 'ar' ? 'قميص' : 'Shirts');

                      return (
                      <tr key={prod.id} className="hover:bg-[#f9f9f9] transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={prod.images[0]}
                              alt={prod.name}
                              className="w-12 h-14 object-cover rounded-lg bg-[#f3f3f4] border border-[#c4c7c7]/30"
                            />
                            <div>
                              <p className="font-bold text-[#000000]">
                                {language === 'ar' && prod.nameAr ? prod.nameAr : prod.name}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#f4ece1] text-[#8c6d37] border border-[#c5a059]/30">
                                  <span className="material-symbols-outlined text-[13px]">label</span>
                                  {displayCat}
                                </span>
                                {prod.subtitle && (
                                  <span className="text-[12px] text-[#747878] truncate max-w-[150px]">{prod.subtitle}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {prod.sizes && prod.sizes.length > 0 ? (
                              prod.sizes.map((s, idx) => (
                                <span
                                  key={idx}
                                  className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${
                                    s.inStock
                                      ? 'bg-[#f3f3f4] text-[#000000] border-[#c4c7c7]/50'
                                      : 'bg-red-50 text-red-500 border-red-200 line-through opacity-60'
                                  }`}
                                >
                                  {s.size}
                                </span>
                              ))
                            ) : (
                              <span className="text-[12px] text-[#747878] italic">
                                {language === 'ar' ? 'لا يوجد' : 'None'}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="p-4 dir-ltr text-start">
                          <span className="font-bold text-[#000000] block">
                            {formatPrice(prod.price)}
                          </span>
                          {prod.originalPrice && prod.originalPrice > prod.price && (
                            <span className="text-[12px] text-[#747878] line-through block">
                              {formatPrice(prod.originalPrice)}
                            </span>
                          )}
                        </td>

                        {/* Direct Toggle for Homepage Display */}
                        <td className="p-4 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              const updated: Product = {
                                ...prod,
                                showOnHome: !isOnHome,
                                isFeatured: !isOnHome,
                              };
                              onUpdateProduct(updated);
                            }}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-label-caps text-[11px] font-bold transition-all cursor-pointer shadow-2xs border ${
                              isOnHome
                                ? 'bg-[#e8f5e9] text-[#2e7d32] border-[#2e7d32]/30 hover:bg-[#c8e6c9]'
                                : 'bg-[#f3f3f4] text-[#747878] border-[#c4c7c7]/40 hover:bg-[#e4e4e5]'
                            }`}
                            title={
                              isOnHome
                                ? language === 'ar'
                                  ? 'انقر للإخفاء من الصفحة الرئيسية'
                                  : 'Click to hide from Home'
                                : language === 'ar'
                                ? 'انقر لإظهاره في الصفحة الرئيسية'
                                : 'Click to show on Home'
                            }
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              {isOnHome ? 'visibility' : 'visibility_off'}
                            </span>
                            <span>
                              {isOnHome
                                ? language === 'ar'
                                  ? 'معروض بالرئيسية ⭐'
                                  : 'On Home ⭐'
                                : language === 'ar'
                                ? 'مخفي من الرئيسية'
                                : 'Hidden'}
                            </span>
                          </button>
                        </td>

                        <td className="p-4 space-x-1 rtl:space-x-reverse space-y-1">
                          {prod.originalPrice && prod.originalPrice > prod.price && (
                            <span className="bg-[#ba1a1a] text-white text-[10px] px-2 py-0.5 rounded font-label-caps font-bold inline-block">
                              SALE (-{Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100)}%)
                            </span>
                          )}
                          {prod.isNewArrival && (
                            <span className="bg-[#000000] text-white text-[10px] px-2 py-0.5 rounded font-label-caps inline-block">
                              NEW
                            </span>
                          )}
                          {(prod.isFeatured || prod.showOnHome) && (
                            <span className="bg-[#ed6c02] text-white text-[10px] px-2 py-0.5 rounded font-label-caps inline-block">
                              FEATURED
                            </span>
                          )}
                        </td>

                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleOpenEditModal(prod)}
                              className="px-3 py-1.5 bg-[#000000] text-white hover:bg-[#222222] rounded-xl font-label-caps text-[12px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                              title={language === 'ar' ? 'تعديل بيانات المنتج' : 'Edit Product'}
                            >
                              <span className="material-symbols-outlined text-[16px]">edit</span>
                              <span>{language === 'ar' ? 'تعديل' : 'Edit'}</span>
                            </button>

                            <button
                              onClick={() => setProductToDelete(prod)}
                              className="p-2 text-[#ba1a1a] hover:bg-[#ba1a1a]/10 rounded-lg transition-colors cursor-pointer"
                              title={language === 'ar' ? 'حذف المنتج' : 'Delete Product'}
                            >
                              <span className="material-symbols-outlined text-[20px]">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ORDERS MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="space-y-6 fade-in-up">
            {/* Filter bar */}
            <div className="bg-white p-5 rounded-2xl border border-[#c4c7c7]/30 shadow-xs flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex flex-1 items-center gap-3 w-full md:w-auto">
                <input
                  type="text"
                  value={orderSearchTerm}
                  onChange={(e) => setOrderSearchTerm(e.target.value)}
                  placeholder={language === 'ar' ? 'بحث برقم الطلب أو إيميل العميل أو اسمه...' : 'Search by Order ID or customer email...'}
                  className="w-full md:w-80 border border-[#c4c7c7] rounded-xl py-2 px-3 text-[14px]"
                />

                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="border border-[#c4c7c7] rounded-xl py-2 px-3 text-[14px] bg-white"
                >
                  <option value="all">{language === 'ar' ? 'جميع الحالات' : 'All Statuses'}</option>
                  <option value="confirmed">{language === 'ar' ? 'مؤكد (Confirmed)' : 'Confirmed'}</option>
                  <option value="processing">{language === 'ar' ? 'جاري التحضير (Processing)' : 'Processing'}</option>
                  <option value="shipped">{language === 'ar' ? 'تم الشحن (Shipped)' : 'Shipped'}</option>
                  <option value="delivered">{language === 'ar' ? 'تم التوصيل (Delivered)' : 'Delivered'}</option>
                </select>
              </div>

              <button
                onClick={fetchOrders}
                className="bg-[#f3f3f4] text-[#000000] hover:bg-[#000000] hover:text-white px-4 py-2 rounded-xl text-[13px] font-label-caps transition-colors cursor-pointer flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">refresh</span>
                <span>{language === 'ar' ? 'تحديث الطلبات' : 'Refresh Orders'}</span>
              </button>
            </div>

            {/* Orders Grid/List */}
            {loadingOrders ? (
              <div className="py-12 text-center text-[#747878] font-body">
                {language === 'ar' ? 'جاري جلب الطلبات من قاعدة البيانات...' : 'Fetching live orders...'}
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl text-center border border-[#c4c7c7]/30 space-y-3">
                <span className="material-symbols-outlined text-[48px] text-[#c4c7c7]">inbox</span>
                <h3 className="font-display text-[20px] font-bold text-[#000000]">
                  {language === 'ar' ? 'لا توجد طلبات تطابق البحث' : 'No orders found matching criteria'}
                </h3>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="bg-white p-6 rounded-2xl border border-[#c4c7c7]/30 shadow-xs space-y-4 hover:border-[#000000]/40 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#c4c7c7]/20 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[18px] text-[#000000] dir-ltr">
                            {ord.orderNumber}
                          </span>
                          <span className="text-[12px] text-[#747878]">
                            • {(() => {
                              try {
                                if (!ord.createdAt) return 'Recent';
                                const d = typeof ord.createdAt === 'string' 
                                  ? new Date(ord.createdAt) 
                                  : (ord.createdAt as any)?.toDate 
                                    ? (ord.createdAt as any).toDate() 
                                    : (ord.createdAt as any)?.seconds 
                                      ? new Date((ord.createdAt as any).seconds * 1000) 
                                      : new Date();
                                return isNaN(d.getTime()) ? 'Recent' : d.toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' });
                              } catch {
                                return 'Recent';
                              }
                            })()}
                          </span>
                        </div>

                        <p className="font-body text-[14px] text-[#444748] mt-1">
                          <strong className="text-[#000000]">{ord.shippingAddress?.fullName}</strong> ({ord.userEmail}) •{' '}
                          <span className="dir-ltr inline-block">{ord.shippingAddress?.phone}</span>
                        </p>
                      </div>

                      {/* Status Dropdown & Delete Button */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-2">
                          <label className="font-label-caps text-[11px] text-[#747878]">
                            {language === 'ar' ? 'حالة الطلب:' : 'Status:'}
                          </label>
                          <select
                            value={ord.status}
                            onChange={(e) =>
                              handleOrderStatusChange(ord.userId, ord.id, e.target.value as any)
                            }
                            className="border border-[#c4c7c7] rounded-lg py-1.5 px-3 text-[13px] font-bold bg-[#f9f9f9]"
                          >
                            <option value="confirmed">مؤكد (Confirmed)</option>
                            <option value="processing">جاري التحضير (Processing)</option>
                            <option value="shipped">تم الشحن (Shipped)</option>
                            <option value="delivered">تم التوصيل (Delivered)</option>
                          </select>
                        </div>

                        <button
                          type="button"
                          onClick={() => setOrderToDelete(ord)}
                          className="text-[#ba1a1a] hover:bg-[#ba1a1a]/10 px-3 py-1.5 rounded-lg font-label-caps text-[12px] font-bold flex items-center gap-1 transition-colors cursor-pointer border border-[#ba1a1a]/20"
                          title={language === 'ar' ? 'حذف الطلب' : 'Delete Order'}
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                          <span>{language === 'ar' ? 'حذف الطلب' : 'Delete'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Order Items & Address */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-2 space-y-2">
                        <p className="font-label-caps text-[11px] text-[#747878]">
                          {language === 'ar' ? 'المنتجات المطلوبة:' : 'Ordered Items:'}
                        </p>
                        <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                          {ord.items?.map((item, i) => (
                            <div key={i} className="flex items-center gap-3 bg-[#f9f9f9] p-2 rounded-lg text-[13px]">
                              {item.image && (
                                <img
                                  src={item.image}
                                  alt={item.title}
                                  className="w-10 h-12 object-cover rounded bg-white border"
                                />
                              )}
                              <div className="flex-1">
                                <p className="font-bold text-[#000000]">{item.title}</p>
                                <p className="text-[11px] text-[#747878]">
                                  {item.selectedColor} | {item.selectedSize} × {item.quantity}
                                </p>
                              </div>
                              <span className="font-bold text-[#000000] dir-ltr">
                                {formatPrice(item.price * item.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-[#f9f9f9] p-4 rounded-xl space-y-2 text-[13px] border border-[#c4c7c7]/20">
                        <p className="font-label-caps text-[11px] font-bold text-[#000000]">
                          {language === 'ar' ? 'عنوان التوصيل:' : 'Delivery Address:'}
                        </p>
                        <p className="text-[#444748]">
                          {ord.shippingAddress?.street}, {ord.shippingAddress?.city},{' '}
                          {ord.shippingAddress?.country}
                        </p>
                        <p className="font-label-caps text-[11px] font-bold text-[#000000] pt-2 border-t border-[#c4c7c7]/20">
                          {language === 'ar' ? 'طريقة الدفع والإجمالي:' : 'Payment & Total:'}
                        </p>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-1">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-bold shadow-2xs border bg-white max-w-full overflow-hidden">
                            {ord.paymentMethod?.includes('أورانج') || ord.paymentMethod?.toLowerCase().includes('orange') ? (
                              <span className="text-[#ff6600] flex items-center gap-1 break-all">
                                <span className="material-symbols-outlined text-[18px] shrink-0">phone_android</span>
                                <span>{ord.paymentMethod}</span>
                              </span>
                            ) : ord.paymentMethod?.includes('فودافون') || ord.paymentMethod?.toLowerCase().includes('vodafone') ? (
                              <span className="text-red-700 flex items-center gap-1 break-all">
                                <span className="material-symbols-outlined text-[18px] shrink-0">phonelink_ring</span>
                                <span>{ord.paymentMethod}</span>
                              </span>
                            ) : ord.paymentMethod?.includes('إنستا') || ord.paymentMethod?.toLowerCase().includes('instapay') ? (
                              <span className="text-purple-900 flex items-center gap-1 break-all">
                                <span className="material-symbols-outlined text-[18px] shrink-0">account_balance</span>
                                <span>{ord.paymentMethod}</span>
                              </span>
                            ) : (
                              <span className="text-emerald-800 flex items-center gap-1 break-all">
                                <span className="material-symbols-outlined text-[18px] shrink-0">payments</span>
                                <span>{ord.paymentMethod || (language === 'ar' ? 'الدفع عند الاستلام (كاش)' : 'Cash on Delivery')}</span>
                              </span>
                            )}
                          </div>
                          <span className="font-display font-bold text-[18px] text-[#000000] dir-ltr shrink-0">
                            {formatPrice(ord.total)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: REGISTERED USERS MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="space-y-6 fade-in-up">
            {/* Users Header & Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#c4c7c7]/30 shadow-xs">
              <div>
                <h2 className="font-display text-[22px] font-bold text-[#000000]">
                  {language === 'ar' ? 'إدارة المستخدمين المسجلين' : 'Registered Users Management'}
                </h2>
                <p className="font-body text-[13px] text-[#747878] mt-1">
                  {language === 'ar'
                    ? `إجمالي المستخدمين المسجلين في النظام: ${users.length} مستخدم (تحديث لحظي من Firestore)`
                    : `Total Registered Users: ${users.length} (Real-time Firestore Sync)`}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                {/* Search */}
                <div className="relative w-full sm:w-72">
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#747878] text-[20px]">
                    search
                  </span>
                  <input
                    type="text"
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    placeholder={language === 'ar' ? 'البحث بالاسم، الإيميل، أو الهاتف...' : 'Search by name, email, or phone...'}
                    className="w-full pr-10 pl-4 py-2 rounded-xl border border-[#c4c7c7] text-xs focus:outline-none focus:border-[#000000]"
                  />
                </div>

                {/* Filter Provider */}
                <select
                  value={userProviderFilter}
                  onChange={(e) => setUserProviderFilter(e.target.value as any)}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl border border-[#c4c7c7] text-xs font-bold text-[#1f1f1f] bg-white focus:outline-none focus:border-[#000000]"
                >
                  <option value="all">{language === 'ar' ? 'جميع الطرق' : 'All Providers'}</option>
                  <option value="google">Google</option>
                  <option value="email">Email & Password</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl border border-[#c4c7c7]/30 shadow-xs overflow-hidden">
              {loadingUsers && users.length === 0 ? (
                <div className="p-12 text-center text-[#747878]">
                  <div className="inline-block w-8 h-8 border-4 border-[#000000] border-t-transparent rounded-full animate-spin mb-3"></div>
                  <p>{language === 'ar' ? 'جاري تحميل قائمة المستخدمين...' : 'Loading users...'}</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <span className="material-symbols-outlined text-[48px] text-[#c4c7c7]">group_off</span>
                  <h3 className="font-display text-[18px] font-bold text-[#000000]">
                    {language === 'ar' ? 'لم يتم العثور على أي مستخدمين' : 'No users found'}
                  </h3>
                  <p className="font-body text-[13px] text-[#747878]">
                    {language === 'ar' ? 'لا توجد نتائج تطابق بحثك الحالي' : 'No matching registered users'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-right border-collapse">
                    <thead>
                      <tr className="bg-[#f8f9fa] border-b border-[#c4c7c7]/30 text-xs text-[#747878] font-bold">
                        <th className="p-4">{language === 'ar' ? 'المستخدم' : 'User'}</th>
                        <th className="p-4">{language === 'ar' ? 'اسم المستخدم (Username)' : 'Username'}</th>
                        <th className="p-4">{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</th>
                        <th className="p-4">{language === 'ar' ? 'رقم الهاتف' : 'Phone'}</th>
                        <th className="p-4">{language === 'ar' ? 'طريقة التسجيل' : 'Method'}</th>
                        <th className="p-4">{language === 'ar' ? 'تاريخ التسجيل' : 'Registered At'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#c4c7c7]/20 text-xs text-[#1f1f1f]">
                      {filteredUsers.map((u) => (
                        <tr key={u.uid} className="hover:bg-[#f8f9fa] transition-colors">
                          <td className="p-4 flex items-center gap-3">
                            <img
                              src={u.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600'}
                              alt={u.name}
                              className="w-9 h-9 rounded-full object-cover border border-[#c4c7c7]"
                            />
                            <div>
                              <div className="font-bold text-sm text-[#000000]">{u.name}</div>
                              <div className="text-[10px] text-[#747878] font-mono">UID: {u.uid.substring(0, 8)}...</div>
                            </div>
                          </td>
                          <td className="p-4 font-mono font-medium text-[#444748]">
                            @{u.username || 'user'}
                          </td>
                          <td className="p-4 font-mono text-[#000000]">
                            {u.email}
                          </td>
                          <td className="p-4 font-mono dir-ltr text-right text-[#000000]">
                            {u.phone || (language === 'ar' ? 'غير مسجل' : 'Not Provided')}
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${
                              u.provider === 'google'
                                ? 'bg-blue-50 text-blue-800 border-blue-200'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            }`}>
                              {u.provider === 'google' ? (
                                <>
                                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.1 0-5.74-2.09-6.68-4.92H1.21v3.15C3.21 21.36 7.32 24 12 24z"/>
                                    <path fill="#FBBC05" d="M5.32 14.28c-.24-.72-.38-1.49-.38-2.28s.14-1.56.38-2.28V6.57H1.21C.44 8.11 0 9.99 0 12s.44 3.89 1.21 5.43l4.11-3.15z"/>
                                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.32 0 3.21 2.64 1.21 6.57l4.11 3.15c.94-2.83 3.58-4.92 6.68-4.92z"/>
                                  </svg>
                                  <span>Google</span>
                                </>
                              ) : (
                                <>
                                  <span className="material-symbols-outlined text-[14px]">mail</span>
                                  <span>Email & Password</span>
                                </>
                              )}
                            </span>
                          </td>
                          <td className="p-4 text-[#747878] dir-ltr text-right">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
        {activeTab === 'promos' && (
          <div className="space-y-6 fade-in-up">
            {/* Create Promo Code */}
            <div className="bg-white p-6 rounded-2xl border border-[#c4c7c7]/30 shadow-xs space-y-4">
              <h2 className="font-display text-[20px] font-bold text-[#000000]">
                {language === 'ar' ? 'إنشاء كود خصم جديد' : 'Create Promo Code'}
              </h2>
              <form onSubmit={handleCreatePromo} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Promo Code Input */}
                  <div>
                    <label className="block text-[12px] font-label-caps text-[#747878] mb-1">
                      {language === 'ar' ? 'رمز الكود (مثال: SUMMER2026)' : 'Coupon Code'}
                    </label>
                    <input
                      type="text"
                      value={newPromoCode}
                      onChange={(e) => setNewPromoCode(e.target.value)}
                      placeholder="TOUZA10"
                      className="w-full border border-[#c4c7c7] rounded-xl py-2 px-3 text-[14px] font-mono font-bold uppercase"
                      required
                    />
                  </div>

                  {/* Discount Type */}
                  <div>
                    <label className="block text-[12px] font-label-caps text-[#747878] mb-1">
                      {language === 'ar' ? 'نوع الخصم' : 'Discount Type'}
                    </label>
                    <select
                      value={newPromoDiscountType}
                      onChange={(e) => setNewPromoDiscountType(e.target.value as 'percentage' | 'fixed')}
                      className="w-full border border-[#c4c7c7] rounded-xl py-2 px-3 text-[14px] bg-white font-body"
                    >
                      <option value="percentage">{language === 'ar' ? 'نسبة مئوية (%)' : 'Percentage (%)'}</option>
                      <option value="fixed">{language === 'ar' ? 'مبلغ ثابت (ج.م)' : 'Fixed Amount (EGP)'}</option>
                    </select>
                  </div>

                  {/* Discount Value */}
                  <div>
                    <label className="block text-[12px] font-label-caps text-[#747878] mb-1">
                      {newPromoDiscountType === 'percentage'
                        ? (language === 'ar' ? 'نسبة الخصم (%)' : 'Discount Percentage (%)')
                        : (language === 'ar' ? 'مبلغ الخصم (ج.م)' : 'Discount Amount (EGP)')}
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={newPromoDiscountType === 'percentage' ? 100 : 10000}
                      value={newPromoDiscountValue}
                      onChange={(e) => setNewPromoDiscountValue(Number(e.target.value))}
                      className="w-full border border-[#c4c7c7] rounded-xl py-2 px-3 text-[14px]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Max Customers / Uses */}
                  <div>
                    <label className="block text-[12px] font-label-caps text-[#747878] mb-1">
                      {language === 'ar' ? 'عدد العملاء المسموح لهم بخصم الكود' : 'Usage Limit (Number of Customers)'}
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={newPromoMaxUses}
                      onChange={(e) => setNewPromoMaxUses(e.target.value)}
                      placeholder={language === 'ar' ? 'مثال: 1 لعميل واحد فقط (0 = غير محدود)' : 'e.g., 1 for 1 customer'}
                      className="w-full border border-[#c4c7c7] rounded-xl py-2 px-3 text-[14px]"
                    />
                    <p className="text-[11px] text-[#747878] mt-1">
                      {language === 'ar'
                        ? 'إذا حددت 1، سينتهي الكود فور استخدام عميل واحد له.'
                        : 'If set to 1, the code expires immediately after 1 customer uses it.'}
                    </p>
                  </div>

                  {/* Note / Description */}
                  <div>
                    <label className="block text-[12px] font-label-caps text-[#747878] mb-1">
                      {language === 'ar' ? 'ملاحظة العرض / الوصف' : 'Note / Description'}
                    </label>
                    <input
                      type="text"
                      value={newPromoNote}
                      onChange={(e) => setNewPromoNote(e.target.value)}
                      placeholder={language === 'ar' ? 'خصم خاص لـ أول عميل' : 'Special promo for first customer'}
                      className="w-full border border-[#c4c7c7] rounded-xl py-2 px-3 text-[14px]"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full bg-[#000000] text-white py-2.5 rounded-xl font-label-caps font-bold hover:bg-[#2f3131] transition-all cursor-pointer text-[14px] flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">add_circle</span>
                      {language === 'ar' ? 'إضافة الكود' : 'Add Promo'}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* List Promos */}
            <div className="bg-white rounded-2xl border border-[#c4c7c7]/30 shadow-xs overflow-hidden">
              <div className="p-4 bg-[#f9f9f9] border-b border-[#c4c7c7]/30 flex items-center justify-between">
                <h3 className="font-bold text-[15px] text-[#000000]">
                  {language === 'ar' ? 'قائمة أكواد الخصم المتاحة' : 'Available Promo Codes'}
                </h3>
                <span className="text-[12px] text-[#747878]">
                  {language === 'ar' ? `الإجمالي: ${promoCodes.length} كود` : `Total: ${promoCodes.length} promos`}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-start text-[14px]">
                  <thead className="bg-[#f9f9f9] border-b border-[#c4c7c7]/30 font-label-caps text-[11px] text-[#747878]">
                    <tr>
                      <th className="p-4 text-start">{language === 'ar' ? 'الكود' : 'Code'}</th>
                      <th className="p-4 text-start">{language === 'ar' ? 'الخصم' : 'Discount'}</th>
                      <th className="p-4 text-start">{language === 'ar' ? 'حد الاستخدام / العملاء' : 'Usage / Limit'}</th>
                      <th className="p-4 text-start">{language === 'ar' ? 'الوصف' : 'Description'}</th>
                      <th className="p-4 text-start">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                      <th className="p-4 text-center">{language === 'ar' ? 'إجراء' : 'Action'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#c4c7c7]/20">
                    {promoCodes.map((p) => {
                      const used = p.usedCount || 0;
                      const max = p.maxUses || 0;
                      const isExhausted = max > 0 && used >= max;
                      const isFixed = p.discountType === 'fixed' || (Boolean(p.discountAmount) && !p.discountPercent);

                      return (
                        <tr key={p.id} className={`hover:bg-[#f9f9f9] ${isExhausted ? 'bg-red-50/30' : ''}`}>
                          <td className="p-4 font-mono font-bold text-[#000000] text-[16px]">
                            {p.code}
                          </td>
                          <td className="p-4 font-bold text-[#2e7d32]">
                            {isFixed ? (
                              <span>
                                {p.discountAmount || p.discountPercent} ج.م{' '}
                                <span className="text-[10px] text-[#747878] font-normal">(مبلغ ثابت)</span>
                              </span>
                            ) : (
                              <span>
                                {p.discountPercent || p.discountAmount}%{' '}
                                <span className="text-[10px] text-[#747878] font-normal">(نسبة مئوية)</span>
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            {max > 0 ? (
                              <div className="flex flex-col gap-1">
                                <span className="text-[13px] font-bold text-[#000000]">
                                  {used} / {max} {language === 'ar' ? 'عميل' : 'customer(s)'}
                                </span>
                                {isExhausted ? (
                                  <span className="inline-block w-max bg-red-100 text-red-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                    {language === 'ar' ? 'مستنفذ بالكامل' : 'Exhausted'}
                                  </span>
                                ) : (
                                  <span className="inline-block w-max bg-emerald-50 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                    {language === 'ar' ? `متبقي ${max - used} استخدام` : `${max - used} left`}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-[13px] text-[#747878]">
                                {used} {language === 'ar' ? 'استخدام (غير محدود)' : 'uses (Unlimited)'}
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-[#747878]">{p.expiryNote || '-'}</td>
                          <td className="p-4">
                            <button
                              onClick={() => onTogglePromoStatus(p.id)}
                              className={`px-3 py-1 rounded-full text-[11px] font-label-caps font-bold cursor-pointer transition-colors ${
                                p.isActive && !isExhausted
                                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                  : isExhausted
                                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {p.isActive ? (isExhausted ? (language === 'ar' ? 'مستنفذ (Exhausted)' : 'Exhausted') : (language === 'ar' ? 'مفعل (Active)' : 'Active')) : (language === 'ar' ? 'معطل (Disabled)' : 'Disabled')}
                            </button>
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => onDeletePromoCode(p.id)}
                              className="text-[#ba1a1a] hover:bg-[#ba1a1a]/10 p-2 rounded-lg transition-colors cursor-pointer"
                              title={language === 'ar' ? 'حذف الكود' : 'Delete Code'}
                            >
                              <span className="material-symbols-outlined text-[20px]">delete</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SETTINGS & BANNERS */}
        {activeTab === 'settings' && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#c4c7c7]/30 shadow-xs space-y-6 fade-in-up max-w-4xl mx-auto">
            <div>
              <h2 className="font-display text-[22px] font-bold text-[#000000]">
                {language === 'ar' ? 'إعدادات بنرات ونصوص الواجهة' : 'Store Banners & Content Settings'}
              </h2>
              <p className="font-body text-[13px] text-[#747878] mt-1">
                {language === 'ar'
                  ? 'يمكنك التعديل الفوري على نصوص الشريط العلوي وصورة البنر الرئيسي للعلامة التجارية.'
                  : 'Customize the top announcement bar and main hero banner visuals.'}
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-6">
              {/* Brand Name & Tagline Section */}
              <div className="space-y-3 p-4 bg-[#f8f9fa] rounded-xl border border-[#000000]/15 shadow-2xs">
                <h3 className="font-label-caps text-[13px] font-bold text-[#000000] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-[#000000]">storefront</span>
                  <span>{language === 'ar' ? 'اسم الويب سايت وهوية المشروع' : 'Website Name & Brand Identity'}</span>
                </h3>
                <p className="font-body text-[12px] text-[#444748]">
                  {language === 'ar'
                    ? 'يمكنك تغيير اسم المزيون/المتجر والشعار الوصفي الذي يظهر في أعلى الهيدر، القائمة الجانبية، والفووتر.'
                    : 'Change the brand title and tagline displayed in the header, side navigation, and footer.'}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-label-caps text-[#000000] font-bold mb-1">
                      {language === 'ar' ? 'اسم المتجر بالعربية (مثال: ميزون إيليجانت)' : 'Store Name (Arabic)'}
                    </label>
                    <input
                      type="text"
                      value={settingsForm.storeNameAr || ''}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, storeNameAr: e.target.value })
                      }
                      className="w-full border border-[#c4c7c7] rounded-xl py-2.5 px-3 text-[14px] bg-white font-medium"
                      placeholder="مثال: ميزون إيليجانت"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-label-caps text-[#000000] font-bold mb-1">
                      {language === 'ar' ? 'اسم المتجر بالإنجليزية (مثال: TOUZA STORE)' : 'Store Name (English)'}
                    </label>
                    <input
                      type="text"
                      value={settingsForm.storeNameEn || ''}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, storeNameEn: e.target.value })
                      }
                      className="w-full border border-[#c4c7c7] rounded-xl py-2.5 px-3 text-[14px] bg-white font-medium dir-ltr"
                      placeholder="e.g. TOUZA STORE"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-label-caps text-[#000000] font-bold mb-1">
                      {language === 'ar' ? 'الشعار الوصفي بالعربية' : 'Tagline (Arabic)'}
                    </label>
                    <input
                      type="text"
                      value={settingsForm.taglineAr || ''}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, taglineAr: e.target.value })
                      }
                      className="w-full border border-[#c4c7c7] rounded-xl py-2.5 px-3 text-[14px] bg-white"
                      placeholder="مثال: دار الأزياء الفاخرة - القاهرة | باريس"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-label-caps text-[#000000] font-bold mb-1">
                      {language === 'ar' ? 'الشعار الوصفي بالإنجليزية' : 'Tagline (English)'}
                    </label>
                    <input
                      type="text"
                      value={settingsForm.taglineEn || ''}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, taglineEn: e.target.value })
                      }
                      className="w-full border border-[#c4c7c7] rounded-xl py-2.5 px-3 text-[14px] bg-white dir-ltr"
                      placeholder="e.g. Luxury Fashion Atelier - Cairo | Paris"
                    />
                  </div>
                </div>
              </div>

              {/* Announcement & Marquee Bar Control Section */}
              <div className="space-y-5 p-5 bg-[#f8f9fa] rounded-2xl border border-[#000000]/15 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#c4c7c7]/30 pb-3">
                  <div>
                    <h3 className="font-label-caps text-[14px] font-bold text-[#000000] flex items-center gap-2">
                      <span className="material-symbols-outlined text-[20px] text-[#c5a059]">view_headline</span>
                      <span>{language === 'ar' ? 'التحكم الكامل بالشريط الإعلاني المتحرك (Marquee Bar)' : 'Marquee Bar Full Control'}</span>
                    </h3>
                    <p className="font-body text-[12px] text-[#5e5e5c] mt-0.5">
                      {language === 'ar' 
                        ? 'تخصيص كامل للنصوص، الألوان، سرعة الحركة، وأيقونة الفاصل' 
                        : 'Full customization for marquee messages, colors, scroll speed, and divider icon'}
                    </p>
                  </div>
                  
                  {/* Enable/Disable Toggle */}
                  <label className="inline-flex items-center gap-2.5 cursor-pointer bg-white px-3.5 py-1.5 rounded-xl border border-[#c4c7c7]/50 shadow-2xs">
                    <input
                      type="checkbox"
                      checked={settingsForm.enableMarqueeBar !== false}
                      onChange={(e) => setSettingsForm({ ...settingsForm, enableMarqueeBar: e.target.checked })}
                      className="w-4 h-4 text-[#000000] rounded focus:ring-0 cursor-pointer"
                    />
                    <span className="font-label-caps text-[12px] font-semibold text-[#000000]">
                      {language === 'ar' ? 'تفعيل الشريط' : 'Enable Marquee'}
                    </span>
                  </label>
                </div>

                {/* Messages Input */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-label-caps text-[#000000] font-semibold mb-1">
                      {language === 'ar' ? 'الرسائل بالعربية (افصل بين الرسائل بـ | أو في أسطر جديدة)' : 'Arabic Messages (Separate with | or new lines)'}
                    </label>
                    <textarea
                      rows={3}
                      value={settingsForm.announcementAr || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, announcementAr: e.target.value })}
                      placeholder="شحن مجاني لجميع المحافظات | إرجاع واستبدال مجاني خلال 14 يوم | قطن مصري 100%"
                      className="w-full border border-[#c4c7c7] rounded-xl py-2 px-3 text-[13px] font-body bg-white focus:outline-hidden focus:border-[#000000] resize-y"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-label-caps text-[#000000] font-semibold mb-1">
                      {language === 'ar' ? 'الرسائل بالإنجليزية (English Messages)' : 'English Messages (Separate with | or new lines)'}
                    </label>
                    <textarea
                      rows={3}
                      value={settingsForm.announcementEn || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, announcementEn: e.target.value })}
                      placeholder="COMPLIMENTARY EXPRESS SHIPPING NATIONWIDE | 14-DAY EASY RETURNS | 100% EGYPTIAN COTTON"
                      className="w-full border border-[#c4c7c7] rounded-xl py-2 px-3 text-[13px] font-body bg-white focus:outline-hidden focus:border-[#000000] resize-y"
                    />
                  </div>
                </div>

                {/* Appearance & Color Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-white p-4 rounded-xl border border-[#c4c7c7]/30">
                  {/* Background Color */}
                  <div>
                    <label className="block text-[11px] font-label-caps text-[#747878] font-semibold mb-1">
                      {language === 'ar' ? 'لون الخلفية' : 'Background Color'}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={settingsForm.marqueeBgColor || '#121212'}
                        onChange={(e) => setSettingsForm({ ...settingsForm, marqueeBgColor: e.target.value })}
                        className="w-8 h-8 rounded-lg cursor-pointer border border-[#c4c7c7] p-0 overflow-hidden"
                      />
                      <input
                        type="text"
                        value={settingsForm.marqueeBgColor || '#121212'}
                        onChange={(e) => setSettingsForm({ ...settingsForm, marqueeBgColor: e.target.value })}
                        className="w-full border border-[#c4c7c7] rounded-lg py-1 px-2 text-[12px] font-mono"
                      />
                    </div>
                    {/* Quick Color Presets */}
                    <div className="flex gap-1.5 mt-2">
                      {[
                        { name: 'أسود', hex: '#121212' },
                        { name: 'ذهبي', hex: '#c5a059' },
                        { name: 'أحمر', hex: '#ba1a1a' },
                        { name: 'كحلي', hex: '#111827' },
                        { name: 'أبيض', hex: '#ffffff' },
                      ].map((preset) => (
                        <button
                          key={preset.hex}
                          type="button"
                          onClick={() => setSettingsForm({ ...settingsForm, marqueeBgColor: preset.hex })}
                          className="w-5 h-5 rounded-full border border-gray-300 shadow-2xs text-[8px] flex items-center justify-center font-bold"
                          style={{ backgroundColor: preset.hex }}
                          title={preset.name}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Text Color */}
                  <div>
                    <label className="block text-[11px] font-label-caps text-[#747878] font-semibold mb-1">
                      {language === 'ar' ? 'لون النص' : 'Text Color'}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={settingsForm.marqueeTextColor || '#f3f3f3'}
                        onChange={(e) => setSettingsForm({ ...settingsForm, marqueeTextColor: e.target.value })}
                        className="w-8 h-8 rounded-lg cursor-pointer border border-[#c4c7c7] p-0 overflow-hidden"
                      />
                      <input
                        type="text"
                        value={settingsForm.marqueeTextColor || '#f3f3f3'}
                        onChange={(e) => setSettingsForm({ ...settingsForm, marqueeTextColor: e.target.value })}
                        className="w-full border border-[#c4c7c7] rounded-lg py-1 px-2 text-[12px] font-mono"
                      />
                    </div>
                    {/* Quick Text Color Presets */}
                    <div className="flex gap-1.5 mt-2">
                      {[
                        { name: 'أبيض', hex: '#f3f3f3' },
                        { name: 'ذهبي', hex: '#e2c792' },
                        { name: 'أسود', hex: '#000000' },
                        { name: 'أحمر', hex: '#ef4444' },
                      ].map((preset) => (
                        <button
                          key={preset.hex}
                          type="button"
                          onClick={() => setSettingsForm({ ...settingsForm, marqueeTextColor: preset.hex })}
                          className="w-5 h-5 rounded-full border border-gray-300 shadow-2xs text-[8px] flex items-center justify-center font-bold"
                          style={{ backgroundColor: preset.hex }}
                          title={preset.name}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Marquee Speed */}
                  <div>
                    <label className="block text-[11px] font-label-caps text-[#747878] font-semibold mb-1">
                      {language === 'ar' ? 'سرعة الحركة' : 'Scroll Speed'}
                    </label>
                    <select
                      value={settingsForm.marqueeSpeed || 'normal'}
                      onChange={(e) => setSettingsForm({ ...settingsForm, marqueeSpeed: e.target.value as any })}
                      className="w-full border border-[#c4c7c7] rounded-lg py-1.5 px-2 text-[13px] bg-white"
                    >
                      <option value="slow">{language === 'ar' ? 'بطيء هادئ (36 ثانية)' : 'Slow (36s)'}</option>
                      <option value="normal">{language === 'ar' ? 'طبيعي معتدل (22 ثانية)' : 'Normal (22s)'}</option>
                      <option value="fast">{language === 'ar' ? 'سريع ديناميكي (12 ثانية)' : 'Fast (12s)'}</option>
                    </select>
                  </div>

                  {/* Separator Symbol */}
                  <div>
                    <label className="block text-[11px] font-label-caps text-[#747878] font-semibold mb-1">
                      {language === 'ar' ? 'أيقونة الفاصل' : 'Divider Icon'}
                    </label>
                    <select
                      value={settingsForm.marqueeSymbol || '✦'}
                      onChange={(e) => setSettingsForm({ ...settingsForm, marqueeSymbol: e.target.value })}
                      className="w-full border border-[#c4c7c7] rounded-lg py-1.5 px-2 text-[13px] bg-white font-serif"
                    >
                      <option value="✦">✦ نجمة ألماسية</option>
                      <option value="★">★ نجمة خماسية</option>
                      <option value="⚡">⚡ برامج سريعة</option>
                      <option value="🛍️">🛍️ حقيبة تسوق</option>
                      <option value="•">• نقطة فاصلة</option>
                      <option value="—">— خط أفق</option>
                    </select>
                  </div>
                </div>

                {/* Live Preview Box */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-label-caps text-[#747878] font-semibold block">
                    {language === 'ar' ? 'معاينة مباشرة للشريط (Live Preview):' : 'Live Preview:'}
                  </span>
                  <div
                    className="w-full py-2.5 px-4 rounded-xl border border-gray-300 overflow-hidden relative shadow-inner flex items-center justify-between"
                    style={{ backgroundColor: settingsForm.marqueeBgColor || '#121212' }}
                  >
                    <div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-wider overflow-x-auto whitespace-nowrap scrollbar-none py-0.5" style={{ color: settingsForm.marqueeTextColor || '#f3f3f3' }}>
                      <span>{language === 'ar' ? (settingsForm.announcementAr?.split('|')[0] || 'شحن مجاني لجميع المحافظات') : (settingsForm.announcementEn?.split('|')[0] || 'COMPLIMENTARY SHIPPING')}</span>
                      <span style={{ color: (settingsForm.marqueeTextColor === '#f3f3f3' || settingsForm.marqueeTextColor === '#ffffff') ? '#c5a059' : settingsForm.marqueeTextColor }}>{settingsForm.marqueeSymbol || '✦'}</span>
                      <span>{language === 'ar' ? (settingsForm.announcementAr?.split('|')[1] || 'إرجاع خلال 14 يوم') : (settingsForm.announcementEn?.split('|')[1] || 'EASY 14-DAY RETURNS')}</span>
                      <span style={{ color: (settingsForm.marqueeTextColor === '#f3f3f3' || settingsForm.marqueeTextColor === '#ffffff') ? '#c5a059' : settingsForm.marqueeTextColor }}>{settingsForm.marqueeSymbol || '✦'}</span>
                      <span>{language === 'ar' ? (settingsForm.announcementAr?.split('|')[2] || 'خامات قطن مصري 100%') : (settingsForm.announcementEn?.split('|')[2] || '100% EGYPTIAN COTTON')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hero Banner Title, Badge & Subtitle */}
              <div className="space-y-3 p-4 bg-[#f9f9f9] rounded-xl border border-[#c4c7c7]/20">
                <h3 className="font-label-caps text-[13px] font-bold text-[#000000] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">view_carousel</span>
                  <span>{language === 'ar' ? 'عنوان وشارة البنر الرئيسي (Hero Banner)' : 'Main Hero Banner Text & Badge'}</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-label-caps text-[#747878] mb-1">
                      {language === 'ar' ? 'الشارة العلوية بالعربية (Badge)' : 'Top Badge (Arabic)'}
                    </label>
                    <input
                      type="text"
                      value={settingsForm.heroBadgeAr || ''}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, heroBadgeAr: e.target.value })
                      }
                      placeholder="تشكيلة كاجوال فاخرة • بورسعيد"
                      className="w-full border border-[#c4c7c7] rounded-xl py-2 px-3 text-[14px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-label-caps text-[#747878] mb-1">
                      {language === 'ar' ? 'الشارة العلوية بالإنجليزية (Badge)' : 'Top Badge (English)'}
                    </label>
                    <input
                      type="text"
                      value={settingsForm.heroBadgeEn || ''}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, heroBadgeEn: e.target.value })
                      }
                      placeholder="TOUZA MEN'S WEAR COLLECTION"
                      className="w-full border border-[#c4c7c7] rounded-xl py-2 px-3 text-[14px] dir-ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-label-caps text-[#747878] mb-1">
                      العنوان بالعربية
                    </label>
                    <input
                      type="text"
                      value={settingsForm.heroTitleAr}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, heroTitleAr: e.target.value })
                      }
                      className="w-full border border-[#c4c7c7] rounded-xl py-2 px-3 text-[14px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-label-caps text-[#747878] mb-1">
                      Title in English
                    </label>
                    <input
                      type="text"
                      value={settingsForm.heroTitleEn}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, heroTitleEn: e.target.value })
                      }
                      className="w-full border border-[#c4c7c7] rounded-xl py-2 px-3 text-[14px]"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-label-caps text-[#747878] mb-1">
                      الوصف بالعربية
                    </label>
                    <input
                      type="text"
                      value={settingsForm.heroSubtitleAr}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, heroSubtitleAr: e.target.value })
                      }
                      className="w-full border border-[#c4c7c7] rounded-xl py-2 px-3 text-[14px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-label-caps text-[#747878] mb-1">
                      Subtitle in English
                    </label>
                    <input
                      type="text"
                      value={settingsForm.heroSubtitleEn}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, heroSubtitleEn: e.target.value })
                      }
                      className="w-full border border-[#c4c7c7] rounded-xl py-2 px-3 text-[14px]"
                    />
                  </div>
                </div>
              </div>

              {/* Collections Page Header Customization */}
              <div className="space-y-3 p-4 bg-[#f9f9f9] rounded-xl border border-[#c4c7c7]/20">
                <h3 className="font-label-caps text-[13px] font-bold text-[#000000] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">collections</span>
                  <span>{language === 'ar' ? 'نصوص صفحة المجموعات (Collections Page Banner)' : 'Collections Page Banner Text'}</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-label-caps text-[#747878] mb-1">
                      عنوان صفحة المجموعات (عربي)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.collectionsTitleAr || ''}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, collectionsTitleAr: e.target.value })
                      }
                      className="w-full border border-[#c4c7c7] rounded-xl py-2 px-3 text-[14px]"
                      placeholder="استايلك يبدأ من هنا"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-label-caps text-[#747878] mb-1">
                      Collections Title (English)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.collectionsTitleEn || ''}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, collectionsTitleEn: e.target.value })
                      }
                      className="w-full border border-[#c4c7c7] rounded-xl py-2 px-3 text-[14px]"
                      placeholder="Your Style Starts Here"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-label-caps text-[#747878] mb-1">
                      وصف صفحة المجموعات (عربي)
                    </label>
                    <textarea
                      rows={2}
                      value={settingsForm.collectionsSubtitleAr || ''}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, collectionsSubtitleAr: e.target.value })
                      }
                      className="w-full border border-[#c4c7c7] rounded-xl py-2 px-3 text-[14px]"
                      placeholder="تشكيلة راقية صُممت بعناية فائقة لتمنحك إطلالة جذابة تناسب جميع المناسبات في مصر."
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-label-caps text-[#747878] mb-1">
                      Collections Subtitle (English)
                    </label>
                    <textarea
                      rows={2}
                      value={settingsForm.collectionsSubtitleEn || ''}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, collectionsSubtitleEn: e.target.value })
                      }
                      className="w-full border border-[#c4c7c7] rounded-xl py-2 px-3 text-[14px]"
                      placeholder="A curated selection of luxury pieces tailored with precision and unhurried elegance."
                    />
                  </div>
                </div>
              </div>

              {/* Header Video Management Section */}
              <div className="p-5 bg-white rounded-2xl border border-[#c4c7c7]/30 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e5e7eb]">
                  <div>
                    <h3 className="font-label-caps text-[15px] font-bold text-black flex items-center gap-2">
                      <span className="material-symbols-outlined text-[22px] text-amber-600">videocam</span>
                      <span>{language === 'ar' ? 'فيديو الهيدر (Header Video)' : 'Header Video Management'}</span>
                    </h3>
                    <p className="text-[12px] text-[#666666] mt-0.5">
                      {language === 'ar'
                        ? 'إدارة وترفيع فيديو خلفية الهيدر الرئيسي وتخزينه بسلاسة على Cloudinary'
                        : 'Manage and upload header background video with direct Cloudinary streaming'}
                    </p>
                  </div>
                  {!isReplacingHeaderVideo && (
                    <button
                      type="button"
                      onClick={() => setIsReplacingHeaderVideo(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-[13px] font-bold rounded-xl hover:bg-[#222] transition-all cursor-pointer shadow-xs"
                    >
                      <span className="material-symbols-outlined text-[18px]">upload_file</span>
                      <span>{language === 'ar' ? 'رفع فيديو جديد' : 'Upload New Video'}</span>
                    </button>
                  )}
                </div>

                {/* Error Banner */}
                {headerVideoUploadError && (
                  <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-[13px] rounded-xl flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] shrink-0">error</span>
                    <span>{headerVideoUploadError}</span>
                  </div>
                )}

                {/* Success Banner */}
                {headerVideoSuccessMsg && (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[13px] rounded-xl flex items-center gap-2 font-medium">
                    <span className="material-symbols-outlined text-[20px] shrink-0 text-emerald-600">check_circle</span>
                    <span>{headerVideoSuccessMsg}</span>
                  </div>
                )}

                {/* MODE 1: Current Active Video View */}
                {!isReplacingHeaderVideo && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center bg-[#f9fafb] p-4 rounded-xl border border-[#e5e7eb]">
                      {/* Active Video Preview Player */}
                      <div className="md:col-span-5 relative rounded-xl overflow-hidden aspect-video bg-black shadow-inner border border-black/10 group">
                        <video
                          key={settingsForm.heroImageUrl}
                          src={getOptimizedVideoUrl(settingsForm.heroImageUrl || '/hero-video.mp4')}
                          controls
                          muted
                          autoPlay
                          loop
                          playsInline
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md text-white text-[10px] font-mono px-2 py-1 rounded-md">
                          {language === 'ar' ? 'معاينة الفيديو الحالي' : 'Active Preview'}
                        </div>
                      </div>

                      {/* Active Video Status Details */}
                      <div className="md:col-span-7 space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[12px] font-bold text-gray-700">
                            {language === 'ar' ? 'الحالة الحالية:' : 'Current Status:'}
                          </span>
                          {settingsForm.heroImageUrl?.includes('cloudinary.com') ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-full border border-emerald-300">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                              <span>{language === 'ar' ? 'نشط على Cloudinary' : 'Active on Cloudinary'}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-amber-800 text-[11px] font-bold rounded-full border border-amber-300">
                              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                              <span>{language === 'ar' ? 'فيديو مدمج افتراضي' : 'Local Default Video'}</span>
                            </span>
                          )}
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-gray-500 mb-1">
                            {language === 'ar' ? 'رابط الفيديو النشط (Active Video URL):' : 'Active Video URL:'}
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              readOnly
                              value={settingsForm.heroImageUrl || '/hero-video.mp4'}
                              className="w-full border border-gray-300 rounded-lg py-1.5 px-3 text-[12px] dir-ltr bg-gray-50 font-mono text-gray-700"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(settingsForm.heroImageUrl || '/hero-video.mp4');
                                alert(language === 'ar' ? 'تم نسخ الرابط!' : 'URL Copied!');
                              }}
                              className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 text-[12px] font-medium rounded-lg cursor-pointer shrink-0"
                            >
                              {language === 'ar' ? 'نسخ' : 'Copy'}
                            </button>
                          </div>
                        </div>

                        {/* Replace Button */}
                        <div className="pt-2 flex flex-wrap items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setIsReplacingHeaderVideo(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-[13px] font-bold rounded-xl transition-all cursor-pointer shadow-xs"
                          >
                            <span className="material-symbols-outlined text-[18px]">published_with_changes</span>
                            <span>{language === 'ar' ? 'استبدال الفيديو' : 'Replace Video'}</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Presets Backups Selection */}
                    <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200/80 space-y-2">
                      <span className="block text-[11px] font-bold text-gray-600">
                        {language === 'ar'
                          ? 'الفيديوهات الافتراضية المدمجة المتاحة (يمكنك العودة لأي فيديو سابق فوراً):'
                          : 'Default bundled video presets (quick switch):'}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { label: language === 'ar' ? 'فيديو 1 (الأساسي)' : 'Video 1 (Main)', path: '/hero-video.mp4' },
                          { label: language === 'ar' ? 'فيديو 2 (الصحراء)' : 'Video 2 (Desert)', path: '/desert-video.mp4' },
                          { label: language === 'ar' ? 'فيديو 3 (سولي)' : 'Video 3 (Soli)', path: '/soli.mp4' },
                        ].map((v) => (
                          <button
                            key={v.path}
                            type="button"
                            onClick={() => handleApplyHeaderVideo(v.path)}
                            className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all cursor-pointer ${
                              settingsForm.heroImageUrl === v.path
                                ? 'bg-black text-white font-bold shadow-xs'
                                : 'bg-white text-gray-800 border border-gray-300 hover:bg-gray-100'
                            }`}
                          >
                            {v.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* MODE 2: Video Uploader Flow */}
                {isReplacingHeaderVideo && (
                  <div className="p-5 bg-amber-50/50 rounded-2xl border-2 border-dashed border-amber-300 space-y-5">
                    <div className="flex items-center justify-between pb-2 border-b border-amber-200">
                      <h4 className="text-[14px] font-bold text-amber-900 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px] text-amber-700">cloud_upload</span>
                        <span>{language === 'ar' ? 'رفع فيديو هيدر جديد إلى Cloudinary' : 'Upload New Header Video to Cloudinary'}</span>
                      </h4>
                      <button
                        type="button"
                        onClick={handleCancelHeaderVideoUpload}
                        className="text-gray-500 hover:text-gray-800 p-1 rounded-lg hover:bg-amber-100 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                      </button>
                    </div>

                    {/* Step 1: File Selection Input */}
                    <div className="space-y-2">
                      <label className="block text-[12px] font-bold text-gray-800">
                        {language === 'ar' ? 'اختر ملف الفيديو من جهازك:' : 'Select Video File from Device:'}
                      </label>
                      <input
                        type="file"
                        accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-m4v,video/*"
                        onChange={handleHeaderVideoSelect}
                        disabled={isUploadingHeaderVideo}
                        className="block w-full text-[13px] text-gray-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-[13px] file:font-bold file:bg-amber-600 file:text-white hover:file:bg-amber-700 file:cursor-pointer bg-white border border-amber-300 rounded-xl p-1 cursor-pointer"
                      />
                      <p className="text-[11px] text-gray-500">
                        {language === 'ar'
                          ? 'الصيغ المدعومة: MP4, WebM, MOV. الحد الأقصى للحجم: 100 ميجابايت.'
                          : 'Supported formats: MP4, WebM, MOV. Max size: 100 MB.'}
                      </p>
                    </div>

                    {/* Step 2: Selected File Info & Preview */}
                    {headerVideoFile && (
                      <div className="p-4 bg-white rounded-xl border border-amber-200 space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-gray-100">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[22px] text-amber-600">movie</span>
                            <div>
                              <p className="text-[13px] font-bold text-gray-800">{headerVideoFileName}</p>
                              <p className="text-[11px] text-gray-500">{language === 'ar' ? 'الحجم:' : 'Size:'} {headerVideoFileSizeMB}</p>
                            </div>
                          </div>
                        </div>

                        {/* Video Local / Staged Preview */}
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 mb-1.5">
                            {language === 'ar' ? 'معاينة الفيديو قبل الحفظ:' : 'Video Preview:'}
                          </label>
                          <div className="relative rounded-xl overflow-hidden aspect-video bg-black max-w-lg mx-auto shadow-md">
                            <video
                              src={stagedHeaderVideoUrl || headerVideoPreviewUrl}
                              controls
                              muted
                              autoPlay
                              loop
                              playsInline
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>

                        {/* Step 3: Progress Bar during Upload */}
                        {isUploadingHeaderVideo && (
                          <div className="space-y-2 pt-2">
                            <div className="flex items-center justify-between text-[12px] font-bold text-amber-800">
                              <span>{language === 'ar' ? 'جاري الرفع إلى Cloudinary...' : 'Uploading to Cloudinary...'}</span>
                              <span>{headerVideoUploadProgress}%</span>
                            </div>
                            <div className="w-full h-3 bg-amber-100 rounded-full overflow-hidden p-0.5 border border-amber-300">
                              <div
                                className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-300"
                                style={{ width: `${headerVideoUploadProgress}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Step 4: Action Buttons */}
                        <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-gray-100">
                          <button
                            type="button"
                            onClick={handleCancelHeaderVideoUpload}
                            disabled={isUploadingHeaderVideo}
                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-[13px] font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50"
                          >
                            {language === 'ar' ? 'إلغاء' : 'Cancel'}
                          </button>

                          {!stagedHeaderVideoUrl ? (
                            <button
                              type="button"
                              onClick={handleStartHeaderVideoUpload}
                              disabled={isUploadingHeaderVideo}
                              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-[13px] font-bold rounded-xl transition-all cursor-pointer shadow-md disabled:opacity-50"
                            >
                              <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
                              <span>
                                {isUploadingHeaderVideo
                                  ? (language === 'ar' ? `جاري الرفع (${headerVideoUploadProgress}%)...` : `Uploading (${headerVideoUploadProgress}%)...`)
                                  : (language === 'ar' ? 'بدء رفع الفيديو' : 'Start Upload')}
                              </span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleApplyHeaderVideo()}
                              className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[14px] font-bold rounded-xl transition-all cursor-pointer shadow-lg transform hover:-translate-y-0.5"
                            >
                              <span className="material-symbols-outlined text-[20px]">check_circle</span>
                              <span>{language === 'ar' ? 'حفظ واستخدام الفيديو' : 'Save & Use Video'}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Newsletter Section Customization */}
              <div className="space-y-3 p-4 bg-[#f9f9f9] rounded-xl border border-[#c4c7c7]/20">
                <h3 className="font-label-caps text-[13px] font-bold text-[#000000] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">mail</span>
                  <span>{language === 'ar' ? 'قسم النشرة البريدية (Newsletter Section)' : 'Newsletter Section Text'}</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-label-caps text-[#747878] mb-1">
                      اسم/وسام النشرة (عربي)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.newsletterBadgeAr || ''}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, newsletterBadgeAr: e.target.value })
                      }
                      className="w-full border border-[#c4c7c7] rounded-xl py-2 px-3 text-[14px]"
                      placeholder="توزا"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-label-caps text-[#747878] mb-1">
                      Badge Text (English)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.newsletterBadgeEn || ''}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, newsletterBadgeEn: e.target.value })
                      }
                      className="w-full border border-[#c4c7c7] rounded-xl py-2 px-3 text-[14px]"
                      placeholder="TOUZA"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-label-caps text-[#747878] mb-1">
                      العنوان الرئيسي (عربي)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.newsletterTitleAr || ''}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, newsletterTitleAr: e.target.value })
                      }
                      className="w-full border border-[#c4c7c7] rounded-xl py-2 px-3 text-[14px]"
                      placeholder="انضم إلى مجتمع توزا"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-label-caps text-[#747878] mb-1">
                      Title (English)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.newsletterTitleEn || ''}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, newsletterTitleEn: e.target.value })
                      }
                      className="w-full border border-[#c4c7c7] rounded-xl py-2 px-3 text-[14px]"
                      placeholder="Join TOUZA Sanctuary"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[12px] font-label-caps text-[#747878] mb-1">
                      الوصف الفرعي (عربي)
                    </label>
                    <textarea
                      rows={2}
                      value={settingsForm.newsletterSubtitleAr || ''}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, newsletterSubtitleAr: e.target.value })
                      }
                      className="w-full border border-[#c4c7c7] rounded-xl p-3 text-[13px]"
                      placeholder="اشترك للحصول على دعوات حصرية..."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[12px] font-label-caps text-[#747878] mb-1">
                      Subtitle (English)
                    </label>
                    <textarea
                      rows={2}
                      value={settingsForm.newsletterSubtitleEn || ''}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, newsletterSubtitleEn: e.target.value })
                      }
                      className="w-full border border-[#c4c7c7] rounded-xl p-3 text-[13px]"
                      placeholder="Subscribe to receive private client invitations..."
                    />
                  </div>
                </div>
              </div>

              {/* Our Philosophy Section Customization */}
              <div className="space-y-3 p-4 bg-[#f9f9f9] rounded-xl border border-[#c4c7c7]/20">
                <h3 className="font-label-caps text-[13px] font-bold text-[#000000] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                  <span>{language === 'ar' ? 'قسم فلسفة الماركة (OUR PHILOSOPHY)' : 'Our Philosophy Section'}</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-label-caps text-[#747878] mb-1">
                      العنوان العلوي (عربي)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.philosophyBadgeAr || ''}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, philosophyBadgeAr: e.target.value })
                      }
                      className="w-full border border-[#c4c7c7] rounded-xl py-2 px-3 text-[14px]"
                      placeholder="فلسفة دار الأزياء"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-label-caps text-[#747878] mb-1">
                      Badge Text (English)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.philosophyBadgeEn || ''}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, philosophyBadgeEn: e.target.value })
                      }
                      className="w-full border border-[#c4c7c7] rounded-xl py-2 px-3 text-[14px]"
                      placeholder="OUR PHILOSOPHY"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-label-caps text-[#747878] mb-1">
                      العنوان الرئيسي - السطر 1 (عربي)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.philosophyTitle1Ar || ''}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, philosophyTitle1Ar: e.target.value })
                      }
                      className="w-full border border-[#c4c7c7] rounded-xl py-2 px-3 text-[14px]"
                      placeholder="إتقان يدوي.."
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-label-caps text-[#747878] mb-1">
                      Main Title Line 1 (English)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.philosophyTitle1En || ''}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, philosophyTitle1En: e.target.value })
                      }
                      className="w-full border border-[#c4c7c7] rounded-xl py-2 px-3 text-[14px]"
                      placeholder="Pure Craftsmanship."
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-label-caps text-[#747878] mb-1">
                      العنوان الرئيسي - السطر 2 المائل (عربي)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.philosophyTitle2Ar || ''}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, philosophyTitle2Ar: e.target.value })
                      }
                      className="w-full border border-[#c4c7c7] rounded-xl py-2 px-3 text-[14px]"
                      placeholder="وأناقة تدوم طويلاً"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-label-caps text-[#747878] mb-1">
                      Main Title Line 2 Italic (English)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.philosophyTitle2En || ''}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, philosophyTitle2En: e.target.value })
                      }
                      className="w-full border border-[#c4c7c7] rounded-xl py-2 px-3 text-[14px]"
                      placeholder="Unhurried Elegance."
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[12px] font-label-caps text-[#747878] mb-1">
                      الفقرة الأولى (عربي)
                    </label>
                    <textarea
                      rows={2}
                      value={settingsForm.philosophyParagraph1Ar || ''}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, philosophyParagraph1Ar: e.target.value })
                      }
                      className="w-full border border-[#c4c7c7] rounded-xl p-3 text-[13px]"
                      placeholder="في توزا، نؤمن أن الفخامة الحقيقية..."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[12px] font-label-caps text-[#747878] mb-1">
                      Paragraph 1 (English)
                    </label>
                    <textarea
                      rows={2}
                      value={settingsForm.philosophyParagraph1En || ''}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, philosophyParagraph1En: e.target.value })
                      }
                      className="w-full border border-[#c4c7c7] rounded-xl p-3 text-[13px]"
                      placeholder="At TOUZA, we believe luxury lives in restraint..."
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[12px] font-label-caps text-[#747878] mb-1">
                      الفقرة الثانية (عربي)
                    </label>
                    <textarea
                      rows={2}
                      value={settingsForm.philosophyParagraph2Ar || ''}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, philosophyParagraph2Ar: e.target.value })
                      }
                      className="w-full border border-[#c4c7c7] rounded-xl p-3 text-[13px]"
                      placeholder="تصاميم تعبر عن الأناقة الهادئة..."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[12px] font-label-caps text-[#747878] mb-1">
                      Paragraph 2 (English)
                    </label>
                    <textarea
                      rows={2}
                      value={settingsForm.philosophyParagraph2En || ''}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, philosophyParagraph2En: e.target.value })
                      }
                      className="w-full border border-[#c4c7c7] rounded-xl p-3 text-[13px]"
                      placeholder="Designed for perpetual relevance across seasons..."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[12px] font-label-caps text-[#747878] mb-1">
                      {language === 'ar' ? 'صورة الموديل (Philosophy Model Image)' : 'Model Image'}
                    </label>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <input
                        type="text"
                        value={settingsForm.philosophyImageUrl || ''}
                        onChange={(e) =>
                          setSettingsForm({ ...settingsForm, philosophyImageUrl: e.target.value })
                        }
                        className="flex-1 border border-[#c4c7c7] rounded-xl py-2 px-3 text-[13px] dir-ltr bg-white"
                        placeholder="/images/philosophy_model.jpg"
                      />
                      <label className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-black text-white text-[12px] font-label-caps rounded-xl cursor-pointer hover:bg-neutral-800 transition-colors shrink-0">
                        <span className="material-symbols-outlined text-[16px]">upload_file</span>
                        <span>{language === 'ar' ? 'رفع صورة من جهازك' : 'Upload File'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              try {
                                const url = await uploadToCloudinary(file, { folder: 'touza_settings' });
                                if (url) {
                                  setSettingsForm((prev) => ({ ...prev, philosophyImageUrl: url }));
                                }
                              } catch (err) {
                                console.error('Cloudinary settings upload error:', err);
                              }
                            }
                          }}
                        />
                      </label>
                    </div>
                    <p className="text-[11px] text-[#777777] mt-1">
                      {language === 'ar'
                        ? 'يمكنك كتابة رابط صورة أو الضغط على رفع صورة لاختيار ملف من جهازك.'
                        : 'Enter an image URL or click upload to select an image from your device.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Our Branches (فروعنا) */}
              <div className="space-y-3 p-4 bg-[#f9f9f9] rounded-xl border border-[#c4c7c7]/20">
                <h3 className="font-label-caps text-[13px] font-bold text-[#000000] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">store</span>
                  <span>{language === 'ar' ? 'فروعنا وبوتيكاتنا' : 'Store Branches'}</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-label-caps text-[#747878] mb-1">
                      تفاصيل الفروع بالعربية
                    </label>
                    <textarea
                      rows={3}
                      value={settingsForm.branchesAr || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, branchesAr: e.target.value })}
                      className="w-full border border-[#c4c7c7] rounded-xl p-3 text-[13px]"
                      placeholder="الفرع الرئيسي: الزمالك..."
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-label-caps text-[#747878] mb-1">
                      Branches in English
                    </label>
                    <textarea
                      rows={3}
                      value={settingsForm.branchesEn || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, branchesEn: e.target.value })}
                      className="w-full border border-[#c4c7c7] rounded-xl p-3 text-[13px]"
                      placeholder="Main Boutique: Zamalek..."
                    />
                  </div>
                </div>
              </div>

              {/* Social Media Links Section (روابط منصات التواصل) */}
              <div className="space-y-3 p-4 bg-[#fdfbf7] rounded-xl border border-[#c5a059]/30">
                <h3 className="font-label-caps text-[13px] font-bold text-[#000000] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#8c734b]">share</span>
                  <span>{language === 'ar' ? 'روابط منصات التواصل الاجتماعي (الهيدر والفوتر والقائمة)' : 'Social Media Platforms Links (Header & Footer)'}</span>
                </h3>
                <p className="font-body text-[12px] text-[#555555]">
                  {language === 'ar'
                    ? 'أدخل رابط كل منصة ليظهر اللوجو الخاص بها في الهيدر والفوتر والمنيوه العائم. اترك الحقل فارغاً لإخفاء المنصة.'
                    : 'Enter the URL for each platform to display its icon in the header, footer, and menu. Leave blank to hide.'}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-label-caps text-[#444748] font-semibold mb-1">
                      Instagram URL (إنستغرام)
                    </label>
                    <input
                      type="url"
                      value={settingsForm.socialInstagramUrl || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, socialInstagramUrl: e.target.value })}
                      className="w-full border border-[#c4c7c7] rounded-xl py-2 px-3 text-[13px] dir-ltr bg-white"
                      placeholder="https://instagram.com/yourbrand"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-label-caps text-[#444748] font-semibold mb-1">
                      Facebook URL (فيسبوك)
                    </label>
                    <input
                      type="url"
                      value={settingsForm.socialFacebookUrl || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, socialFacebookUrl: e.target.value })}
                      className="w-full border border-[#c4c7c7] rounded-xl py-2 px-3 text-[13px] dir-ltr bg-white"
                      placeholder="https://facebook.com/yourbrand"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-label-caps text-[#444748] font-semibold mb-1">
                      TikTok URL (تيك توك)
                    </label>
                    <input
                      type="url"
                      value={settingsForm.socialTiktokUrl || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, socialTiktokUrl: e.target.value })}
                      className="w-full border border-[#c4c7c7] rounded-xl py-2 px-3 text-[13px] dir-ltr bg-white"
                      placeholder="https://tiktok.com/@yourbrand"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-label-caps text-[#444748] font-semibold mb-1">
                      X / Twitter URL (تويتر / إكس)
                    </label>
                    <input
                      type="url"
                      value={settingsForm.socialTwitterUrl || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, socialTwitterUrl: e.target.value })}
                      className="w-full border border-[#c4c7c7] rounded-xl py-2 px-3 text-[13px] dir-ltr bg-white"
                      placeholder="https://x.com/yourbrand"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-label-caps text-[#444748] font-semibold mb-1">
                      WhatsApp Direct Link (رابط المباشر للواتساب)
                    </label>
                    <input
                      type="url"
                      value={settingsForm.socialWhatsappUrl || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, socialWhatsappUrl: e.target.value })}
                      className="w-full border border-[#c4c7c7] rounded-xl py-2 px-3 text-[13px] dir-ltr bg-white"
                      placeholder="https://wa.me/201012345678"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-label-caps text-[#444748] font-semibold mb-1">
                      YouTube Channel URL (قناة يوتيوب)
                    </label>
                    <input
                      type="url"
                      value={settingsForm.socialYoutubeUrl || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, socialYoutubeUrl: e.target.value })}
                      className="w-full border border-[#c4c7c7] rounded-xl py-2 px-3 text-[13px] dir-ltr bg-white"
                      placeholder="https://youtube.com/@yourbrand"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[12px] font-label-caps text-[#444748] font-semibold mb-1">
                      Snapchat URL (سناب شات)
                    </label>
                    <input
                      type="url"
                      value={settingsForm.socialSnapchatUrl || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, socialSnapchatUrl: e.target.value })}
                      className="w-full border border-[#c4c7c7] rounded-xl py-2 px-3 text-[13px] dir-ltr bg-white"
                      placeholder="https://snapchat.com/add/yourbrand"
                    />
                  </div>
                </div>
              </div>

              {/* Direct WhatsApp & Phone Contact Section */}
              <div className="space-y-3 p-4 bg-[#f0f7f2] rounded-xl border border-[#25D366]/30">
                <h3 className="font-label-caps text-[13px] font-bold text-[#000000] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-[#25D366]">chat</span>
                  <span>{language === 'ar' ? 'أرقام التواصل المباشر (الواتساب والاتصال)' : 'Direct Contact Numbers (WhatsApp & Call)'}</span>
                </h3>
                <p className="font-body text-[12px] text-[#444748]">
                  {language === 'ar'
                    ? 'سيتم تحديث أزرار التواصل العائمة وحسابات الدعم فوراً عند تغيير هذه الأرقام.'
                    : 'Floating contact buttons and support links will automatically update when changed here.'}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-label-caps text-[#000000] font-bold mb-1 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-[#25D366]">call</span>
                      <span>{language === 'ar' ? 'رقم الواتساب (WhatsApp Number)' : 'WhatsApp Number'}</span>
                    </label>
                    <input
                      type="text"
                      value={settingsForm.whatsappNumber || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                      className="w-full border border-[#c4c7c7] rounded-xl py-2.5 px-3 text-[14px] dir-ltr bg-white font-mono"
                      placeholder="e.g. 01012345678 or +201012345678"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-label-caps text-[#000000] font-bold mb-1 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-[#000000]">phone_in_talk</span>
                      <span>{language === 'ar' ? 'رقم الاتصال المباشر (Phone Call Number)' : 'Direct Phone Number'}</span>
                    </label>
                    <input
                      type="text"
                      value={settingsForm.phoneNumber || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, phoneNumber: e.target.value })}
                      className="w-full border border-[#c4c7c7] rounded-xl py-2.5 px-3 text-[14px] dir-ltr bg-white font-mono"
                      placeholder="e.g. 01012345678"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Us (تواصل معنا) */}
              <div className="space-y-3 p-4 bg-[#f9f9f9] rounded-xl border border-[#c4c7c7]/20">
                <h3 className="font-label-caps text-[13px] font-bold text-[#000000] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">contact_support</span>
                  <span>{language === 'ar' ? 'تواصل معنا وخدمة العملاء' : 'Contact Us'}</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-label-caps text-[#747878] mb-1">
                      بيانات التواصل بالعربية
                    </label>
                    <textarea
                      rows={3}
                      value={settingsForm.contactAr || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, contactAr: e.target.value })}
                      className="w-full border border-[#c4c7c7] rounded-xl p-3 text-[13px]"
                      placeholder="الهاتف والواتساب والبريد..."
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-label-caps text-[#747878] mb-1">
                      Contact Details in English
                    </label>
                    <textarea
                      rows={3}
                      value={settingsForm.contactEn || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, contactEn: e.target.value })}
                      className="w-full border border-[#c4c7c7] rounded-xl p-3 text-[13px]"
                      placeholder="Phone, WhatsApp & Email..."
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Policy (الشحن والتوصيل) */}
              <div className="space-y-3 p-4 bg-[#f9f9f9] rounded-xl border border-[#c4c7c7]/20">
                <h3 className="font-label-caps text-[13px] font-bold text-[#000000] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">local_shipping</span>
                  <span>{language === 'ar' ? 'سياسة الشحن والتوصيل' : 'Shipping Policy'}</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-label-caps text-[#747878] mb-1">
                      السياسة بالعربية
                    </label>
                    <textarea
                      rows={3}
                      value={settingsForm.shippingAr || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, shippingAr: e.target.value })}
                      className="w-full border border-[#c4c7c7] rounded-xl p-3 text-[13px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-label-caps text-[#747878] mb-1">
                      Policy in English
                    </label>
                    <textarea
                      rows={3}
                      value={settingsForm.shippingEn || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, shippingEn: e.target.value })}
                      className="w-full border border-[#c4c7c7] rounded-xl p-3 text-[13px]"
                    />
                  </div>
                </div>
              </div>

              {/* Returns & Exchanges (الاسترجاع والاستبدال) */}
              <div className="space-y-3 p-4 bg-[#f9f9f9] rounded-xl border border-[#c4c7c7]/20">
                <h3 className="font-label-caps text-[13px] font-bold text-[#000000] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">autorenew</span>
                  <span>{language === 'ar' ? 'سياسة الاستبدال والاسترجاع' : 'Returns & Exchange Policy'}</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-label-caps text-[#747878] mb-1">
                      السياسة بالعربية
                    </label>
                    <textarea
                      rows={3}
                      value={settingsForm.returnsAr || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, returnsAr: e.target.value })}
                      className="w-full border border-[#c4c7c7] rounded-xl p-3 text-[13px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-label-caps text-[#747878] mb-1">
                      Policy in English
                    </label>
                    <textarea
                      rows={3}
                      value={settingsForm.returnsEn || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, returnsEn: e.target.value })}
                      className="w-full border border-[#c4c7c7] rounded-xl p-3 text-[13px]"
                    />
                  </div>
                </div>
              </div>

              {/* Privacy Policy (سياسة الخصوصية) */}
              <div className="space-y-3 p-4 bg-[#f9f9f9] rounded-xl border border-[#c4c7c7]/20">
                <h3 className="font-label-caps text-[13px] font-bold text-[#000000] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">security</span>
                  <span>{language === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-label-caps text-[#747878] mb-1">
                      السياسة بالعربية
                    </label>
                    <textarea
                      rows={3}
                      value={settingsForm.privacyAr || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, privacyAr: e.target.value })}
                      className="w-full border border-[#c4c7c7] rounded-xl p-3 text-[13px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-label-caps text-[#747878] mb-1">
                      Policy in English
                    </label>
                    <textarea
                      rows={3}
                      value={settingsForm.privacyEn || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, privacyEn: e.target.value })}
                      className="w-full border border-[#c4c7c7] rounded-xl p-3 text-[13px]"
                    />
                  </div>
                </div>
              </div>

              {/* Copyright Text (حقوق النشر والملكية) */}
              <div className="space-y-3 p-4 bg-[#f9f9f9] rounded-xl border border-[#c4c7c7]/20">
                <h3 className="font-label-caps text-[13px] font-bold text-[#000000] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">copyright</span>
                  <span>{language === 'ar' ? 'حقوق النشر والملكية (Copyright) بالفوتر' : 'Footer Copyright Text'}</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-label-caps text-[#747878] mb-1">
                      نص حقوق النشر بالعربية
                    </label>
                    <input
                      type="text"
                      value={settingsForm.copyrightAr || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, copyrightAr: e.target.value })}
                      className="w-full border border-[#c4c7c7] rounded-xl p-3 text-[13px]"
                      placeholder="© 2025 ميزون إيليجانت مصر. جميع الحقوق محفوظة."
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-label-caps text-[#747878] mb-1">
                      Copyright Text in English
                    </label>
                    <input
                      type="text"
                      value={settingsForm.copyrightEn || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, copyrightEn: e.target.value })}
                      className="w-full border border-[#c4c7c7] rounded-xl p-3 text-[13px]"
                      placeholder="© 2025 TOUZA STORE EGYPT. ALL RIGHTS RESERVED."
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#000000] text-white py-3.5 rounded-xl font-label-caps font-bold hover:bg-[#2f3131] transition-all cursor-pointer shadow-md text-[15px]"
              >
                {language === 'ar' ? 'حفظ إعدادات الواجهة' : 'Save Store Settings'}
              </button>
            </form>
          </div>
        )}

        {/* PAYMENT SETTINGS TAB */}
        {activeTab === 'payment_settings' && (
          <div className="space-y-6 fade-in-up max-w-5xl mx-auto">
            {/* Header Title */}
            <div className="bg-white p-6 rounded-2xl border border-[#c4c7c7]/30 shadow-xs space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">payments</span>
                </div>
                <div>
                  <h2 className="font-display text-[22px] font-bold text-black">
                    {language === 'ar' ? 'إعدادات وسائل الدفع (فودافون كاش، أورانج كاش، إنستا باي)' : 'Payment Methods Configuration'}
                  </h2>
                  <p className="font-body text-[13px] text-[#5e5e5c]">
                    {language === 'ar'
                      ? 'التحكم المركزي في أرقام المحافظ والحسابات البنكية وإتاحة أو تفعيل طرق الدفع وإرشادات الشراء للعملاء'
                      : 'Manage Vodafone Cash numbers, Orange Cash wallet, InstaPay accounts, enable/disable options, and payment instructions.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Notifications / Toast */}
            {paymentSaveSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 text-[14px] font-bold rounded-2xl flex items-center gap-2 shadow-xs">
                <span className="material-symbols-outlined text-emerald-600">check_circle</span>
                <span>{paymentSaveSuccess}</span>
              </div>
            )}
            {paymentSaveError && (
              <div className="p-4 bg-red-50 border border-red-300 text-red-800 text-[14px] font-bold rounded-2xl flex items-center gap-2 shadow-xs">
                <span className="material-symbols-outlined text-red-600">error</span>
                <span>{paymentSaveError}</span>
              </div>
            )}

            <form onSubmit={handleSavePaymentSettings} className="space-y-6">
              {/* 1. VODAFONE CASH CARD */}
              <div className="bg-white p-6 rounded-2xl border border-red-200 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-red-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-red-100 text-red-700 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[22px]">phonelink_ring</span>
                    </div>
                    <div>
                      <h3 className="font-display text-[18px] font-bold text-red-950">
                        {language === 'ar' ? 'محفظة فودافون كاش (Vodafone Cash)' : 'Vodafone Cash Wallet'}
                      </h3>
                      <p className="text-[12px] text-red-700">
                        {language === 'ar' ? 'استلام الأموال عبر تحويل المحفظة الإلكترونية' : 'Collect payments via mobile wallet transfer'}
                      </p>
                    </div>
                  </div>

                  {/* Toggle switch */}
                  <label className="relative inline-flex items-center cursor-pointer gap-2">
                    <input
                      type="checkbox"
                      checked={settingsForm.enableVodafoneCash !== false}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, enableVodafoneCash: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    <span className="text-[13px] font-label-caps font-bold text-gray-700">
                      {settingsForm.enableVodafoneCash !== false
                        ? language === 'ar' ? 'مُفعل' : 'Enabled'
                        : language === 'ar' ? 'معطل' : 'Disabled'}
                    </span>
                  </label>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[13px] font-label-caps font-bold text-gray-800 mb-1">
                      {language === 'ar' ? 'رقم محفظة فودافون كاش المخصص للاستلام *' : 'Vodafone Cash Phone Number *'}
                    </label>
                    <input
                      type="tel"
                      value={settingsForm.vodafoneCashNumber || ''}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, vodafoneCashNumber: e.target.value })
                      }
                      placeholder="010XXXXXXXX"
                      className="w-full border border-red-300 rounded-xl p-3 text-[15px] font-mono dir-ltr text-right rtl:text-right bg-red-50/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[12px] font-label-caps text-gray-700 mb-1">
                        {language === 'ar' ? 'تعليمات الشراء باللغة العربية' : 'Arabic Instructions'}
                      </label>
                      <textarea
                        rows={3}
                        value={settingsForm.vodafoneCashInstructionsAr || ''}
                        onChange={(e) =>
                          setSettingsForm({ ...settingsForm, vodafoneCashInstructionsAr: e.target.value })
                        }
                        placeholder="يرجى تحويل المبلغ المطلوبة إلى رقم المحفظة أعلاه ثم إدخال رقم الهاتف المحول منه..."
                        className="w-full border border-gray-300 rounded-xl p-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-label-caps text-gray-700 mb-1">
                        {language === 'ar' ? 'تعليمات الشراء باللغة الإنجليزية' : 'English Instructions'}
                      </label>
                      <textarea
                        rows={3}
                        value={settingsForm.vodafoneCashInstructionsEn || ''}
                        onChange={(e) =>
                          setSettingsForm({ ...settingsForm, vodafoneCashInstructionsEn: e.target.value })
                        }
                        placeholder="Please transfer total amount to Vodafone Cash number above and provide sender phone..."
                        className="w-full border border-gray-300 rounded-xl p-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. ORANGE CASH CARD */}
              <div className="bg-white p-6 rounded-2xl border border-orange-300 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-orange-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-orange-100 text-[#ff6600] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[22px]">phone_android</span>
                    </div>
                    <div>
                      <h3 className="font-display text-[18px] font-bold text-orange-950">
                        {language === 'ar' ? 'محفظة أورانج كاش (Orange Cash)' : 'Orange Cash Wallet'}
                      </h3>
                      <p className="text-[12px] text-orange-700">
                        {language === 'ar' ? 'استلام الأموال عبر تحويل محفظة أورانج كاش الإلكترونية' : 'Collect payments via Orange Cash mobile wallet'}
                      </p>
                    </div>
                  </div>

                  {/* Toggle switch */}
                  <label className="relative inline-flex items-center cursor-pointer gap-2">
                    <input
                      type="checkbox"
                      checked={settingsForm.enableOrangeCash !== false}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, enableOrangeCash: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ff6600]"></div>
                    <span className="text-[13px] font-label-caps font-bold text-gray-700">
                      {settingsForm.enableOrangeCash !== false
                        ? language === 'ar' ? 'مُفعل' : 'Enabled'
                        : language === 'ar' ? 'معطل' : 'Disabled'}
                    </span>
                  </label>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[13px] font-label-caps font-bold text-gray-800 mb-1">
                      {language === 'ar' ? 'رقم محفظة أورانج كاش المخصص للاستلام *' : 'Orange Cash Phone Number *'}
                    </label>
                    <input
                      type="tel"
                      value={settingsForm.orangeCashNumber || ''}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, orangeCashNumber: e.target.value })
                      }
                      placeholder="012XXXXXXXX"
                      className="w-full border border-orange-300 rounded-xl p-3 text-[15px] font-mono dir-ltr text-right rtl:text-right bg-orange-50/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ff6600]"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[12px] font-label-caps text-gray-700 mb-1">
                        {language === 'ar' ? 'تعليمات الشراء باللغة العربية' : 'Arabic Instructions'}
                      </label>
                      <textarea
                        rows={3}
                        value={settingsForm.orangeCashInstructionsAr || ''}
                        onChange={(e) =>
                          setSettingsForm({ ...settingsForm, orangeCashInstructionsAr: e.target.value })
                        }
                        placeholder="يرجى تحويل المبلغ المطلوب إلى رقم محفظة أورانج كاش أعلاه ثم إدخال رقم الهاتف المحول منه..."
                        className="w-full border border-gray-300 rounded-xl p-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#ff6600]"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-label-caps text-gray-700 mb-1">
                        {language === 'ar' ? 'تعليمات الشراء باللغة الإنجليزية' : 'English Instructions'}
                      </label>
                      <textarea
                        rows={3}
                        value={settingsForm.orangeCashInstructionsEn || ''}
                        onChange={(e) =>
                          setSettingsForm({ ...settingsForm, orangeCashInstructionsEn: e.target.value })
                        }
                        placeholder="Please transfer total amount to Orange Cash wallet number above and provide sender phone..."
                        className="w-full border border-gray-300 rounded-xl p-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#ff6600]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. INSTAPAY CARD */}
              <div className="bg-white p-6 rounded-2xl border border-purple-200 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-purple-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[22px]">account_balance</span>
                    </div>
                    <div>
                      <h3 className="font-display text-[18px] font-bold text-purple-950">
                        {language === 'ar' ? 'حساب إنستا باي (InstaPay)' : 'InstaPay Account'}
                      </h3>
                      <p className="text-[12px] text-purple-700">
                        {language === 'ar' ? 'التحويل المباشر اللحظي بين البنوك والمحافظ' : 'Instant bank transfer via IPA or phone'}
                      </p>
                    </div>
                  </div>

                  {/* Toggle switch */}
                  <label className="relative inline-flex items-center cursor-pointer gap-2">
                    <input
                      type="checkbox"
                      checked={settingsForm.enableInstaPay !== false}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, enableInstaPay: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    <span className="text-[13px] font-label-caps font-bold text-gray-700">
                      {settingsForm.enableInstaPay !== false
                        ? language === 'ar' ? 'مُفعل' : 'Enabled'
                        : language === 'ar' ? 'معطل' : 'Disabled'}
                    </span>
                  </label>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[13px] font-label-caps font-bold text-gray-800 mb-1">
                        {language === 'ar' ? 'عنوان أو حساب إنستا باي (IPA) *' : 'InstaPay IPA / Address *'}
                      </label>
                      <input
                        type="text"
                        value={settingsForm.instaPayAccount || settingsForm.instaPayAddress || ''}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            instaPayAccount: e.target.value,
                            instaPayAddress: e.target.value,
                          })
                        }
                        placeholder="touza@instapay"
                        className="w-full border border-purple-300 rounded-xl p-3 text-[15px] font-mono bg-purple-50/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-label-caps font-bold text-gray-800 mb-1">
                        {language === 'ar' ? 'رقم الهاتف المرتبط بإنستا باي (اختياري)' : 'Associated Phone Number (Optional)'}
                      </label>
                      <input
                        type="tel"
                        value={settingsForm.instaPayPhone || ''}
                        onChange={(e) =>
                          setSettingsForm({ ...settingsForm, instaPayPhone: e.target.value })
                        }
                        placeholder="010XXXXXXXX"
                        className="w-full border border-purple-300 rounded-xl p-3 text-[15px] font-mono dir-ltr text-right rtl:text-right bg-purple-50/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[12px] font-label-caps text-gray-700 mb-1">
                        {language === 'ar' ? 'تعليمات الشراء باللغة العربية' : 'Arabic Instructions'}
                      </label>
                      <textarea
                        rows={3}
                        value={settingsForm.instaPayInstructionsAr || ''}
                        onChange={(e) =>
                          setSettingsForm({ ...settingsForm, instaPayInstructionsAr: e.target.value })
                        }
                        placeholder="قم بالتحويل عبر تطبيق إنستا باي إلى الحساب الموضح أعلاه ثم ادخل مرجع التحويل..."
                        className="w-full border border-gray-300 rounded-xl p-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-label-caps text-gray-700 mb-1">
                        {language === 'ar' ? 'تعليمات الشراء باللغة الإنجليزية' : 'English Instructions'}
                      </label>
                      <textarea
                        rows={3}
                        value={settingsForm.instaPayInstructionsEn || ''}
                        onChange={(e) =>
                          setSettingsForm({ ...settingsForm, instaPayInstructionsEn: e.target.value })
                        }
                        placeholder="Transfer via InstaPay app to handle above then enter reference ID..."
                        className="w-full border border-gray-300 rounded-xl p-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. CASH ON DELIVERY (COD) CARD */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gray-100 text-gray-800 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[22px]">payments</span>
                    </div>
                    <div>
                      <h3 className="font-display text-[18px] font-bold text-gray-900">
                        {language === 'ar' ? 'الدفع نقداً عند الاستلام (COD)' : 'Cash on Delivery (COD)'}
                      </h3>
                      <p className="text-[12px] text-gray-500">
                        {language === 'ar' ? 'تحصيل قيمة الطلب كاش عند التسليم' : 'Collect cash directly upon delivery'}
                      </p>
                    </div>
                  </div>

                  {/* Toggle switch */}
                  <label className="relative inline-flex items-center cursor-pointer gap-2">
                    <input
                      type="checkbox"
                      checked={settingsForm.enableCashOnDelivery !== false}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, enableCashOnDelivery: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                    <span className="text-[13px] font-label-caps font-bold text-gray-700">
                      {settingsForm.enableCashOnDelivery !== false
                        ? language === 'ar' ? 'مُفعل' : 'Enabled'
                        : language === 'ar' ? 'معطل' : 'Disabled'}
                    </span>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-label-caps text-gray-700 mb-1">
                      {language === 'ar' ? 'ملاحظة أو تعليمات كاش عند الاستلام (عربي)' : 'Arabic COD Instructions'}
                    </label>
                    <textarea
                      rows={2}
                      value={settingsForm.codInstructionsAr || ''}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, codInstructionsAr: e.target.value })
                      }
                      placeholder="ستقوم بدفع المبلغ الإجمالي نقداً للمندوب عند استلام الشحنة."
                      className="w-full border border-gray-300 rounded-xl p-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-label-caps text-gray-700 mb-1">
                      {language === 'ar' ? 'ملاحظة أو تعليمات كاش عند الاستلام (إنجليزي)' : 'English COD Instructions'}
                    </label>
                    <textarea
                      rows={2}
                      value={settingsForm.codInstructionsEn || ''}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, codInstructionsEn: e.target.value })
                      }
                      placeholder="You will pay the exact total amount in cash to courier upon delivery."
                      className="w-full border border-gray-300 rounded-xl p-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>
              </div>

              {/* SAVE BUTTON */}
              <button
                type="submit"
                className="w-full bg-[#000000] text-white py-4 rounded-xl font-label-caps font-bold hover:bg-[#2f3131] transition-all cursor-pointer shadow-md text-[16px] flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">save</span>
                <span>{language === 'ar' ? 'حفظ إعدادات وسائل الدفع' : 'Save Payment Settings'}</span>
              </button>
            </form>
          </div>
        )}

        {/* REVIEWS MANAGEMENT TAB */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            {/* Top Reviews KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-[#c4c7c7]/30 shadow-xs flex items-center justify-between">
                <div>
                  <p className="font-label-caps text-[11px] text-[#747878]">
                    {language === 'ar' ? 'إجمالي التقييمات' : 'Total Reviews'}
                  </p>
                  <p className="font-display text-[26px] font-bold text-[#000000] mt-1">
                    {reviews.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-[#000000]/5 rounded-2xl flex items-center justify-center text-[#000000]">
                  <span className="material-symbols-outlined text-[26px]">rate_review</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#c4c7c7]/30 shadow-xs flex items-center justify-between">
                <div>
                  <p className="font-label-caps text-[11px] text-[#747878]">
                    {language === 'ar' ? 'متوسط التقيمات' : 'Average Rating'}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <p className="font-display text-[26px] font-bold text-[#000000]">
                      {reviews.length > 0
                        ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length).toFixed(1)
                        : '5.0'}
                    </p>
                    <span className="material-symbols-outlined text-[#f59e0b] text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      star
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-[#f59e0b]/10 rounded-2xl flex items-center justify-center text-[#f59e0b]">
                  <span className="material-symbols-outlined text-[26px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    grade
                  </span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#c4c7c7]/30 shadow-xs flex items-center justify-between">
                <div>
                  <p className="font-label-caps text-[11px] text-[#747878]">
                    {language === 'ar' ? 'تقييمات 5 نجوم' : '5-Star Reviews'}
                  </p>
                  <p className="font-display text-[26px] font-bold text-[#2e7d32] mt-1">
                    {reviews.filter((r) => r.rating === 5).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-[#2e7d32]/10 rounded-2xl flex items-center justify-center text-[#2e7d32]">
                  <span className="material-symbols-outlined text-[26px]">thumb_up</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#c4c7c7]/30 shadow-xs flex items-center justify-between">
                <div>
                  <p className="font-label-caps text-[11px] text-[#747878]">
                    {language === 'ar' ? 'عملاء مؤكدين' : 'Verified Clients'}
                  </p>
                  <p className="font-display text-[26px] font-bold text-[#000000] mt-1">
                    {reviews.filter((r) => r.orderNumber || r.userId).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-[#000000]/5 rounded-2xl flex items-center justify-center text-[#000000]">
                  <span className="material-symbols-outlined text-[26px]">verified</span>
                </div>
              </div>
            </div>

            {/* Filter and Action Header */}
            <div className="bg-white p-4 md:p-6 rounded-2xl border border-[#c4c7c7]/30 shadow-xs flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
              <div className="flex-1 flex flex-col sm:flex-row gap-3">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <span className="material-symbols-outlined absolute right-3 rtl:right-3 ltr:left-3 top-1/2 -translate-y-1/2 text-[#747878] text-[20px]">
                    search
                  </span>
                  <input
                    type="text"
                    value={reviewSearchTerm}
                    onChange={(e) => setReviewSearchTerm(e.target.value)}
                    placeholder={
                      language === 'ar'
                        ? 'ابحث باسم العميل، المنتج، أو نص التقييم...'
                        : 'Search by client name, product, or review text...'
                    }
                    className="w-full bg-[#f3f3f4] border border-[#c4c7c7]/40 rounded-xl py-2.5 px-10 text-[14px] focus:outline-none focus:border-[#000000]"
                  />
                </div>

                {/* Star Filter */}
                <select
                  value={reviewStarFilter}
                  onChange={(e) =>
                    setReviewStarFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))
                  }
                  className="bg-[#f3f3f4] border border-[#c4c7c7]/40 rounded-xl py-2.5 px-4 text-[13px] font-body focus:outline-none focus:border-[#000000] cursor-pointer"
                >
                  <option value="all">{language === 'ar' ? 'جميع التقييمات' : 'All Star Ratings'}</option>
                  <option value="5">{language === 'ar' ? '⭐⭐⭐⭐⭐ (5 نجوم)' : '5 Stars'}</option>
                  <option value="4">{language === 'ar' ? '⭐⭐⭐⭐ (4 نجوم)' : '4 Stars'}</option>
                  <option value="3">{language === 'ar' ? '⭐⭐⭐ (3 نجوم)' : '3 Stars'}</option>
                  <option value="2">{language === 'ar' ? '⭐⭐ (نجمتان)' : '2 Stars'}</option>
                  <option value="1">{language === 'ar' ? '⭐ (نجمة واحدة)' : '1 Star'}</option>
                </select>
              </div>

              <div className="flex flex-wrap sm:flex-nowrap gap-2 shrink-0">
                {/* Reset Default Reviews Button */}
                <button
                  type="button"
                  onClick={handleResetDefaultReviews}
                  className="bg-[#f3f3f4] text-[#444748] hover:bg-[#e4e4e5] border border-[#c4c7c7]/50 px-4 py-2.5 rounded-xl font-label-caps text-[12px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                  title={language === 'ar' ? 'إعادة ضبط واستعادة تقييمات الموقع الافتراضية' : 'Reset default site reviews'}
                >
                  <span className="material-symbols-outlined text-[18px]">restart_alt</span>
                  <span>{language === 'ar' ? 'استعادة التقييمات الافتراضية' : 'Restore Defaults'}</span>
                </button>

                {/* Add Manual Review Button */}
                <button
                  type="button"
                  onClick={() => {
                    setNewReviewForm({
                      productId: products[0]?.id || '',
                      productTitle: products[0]?.nameAr || products[0]?.name || '',
                      userName: '',
                      userPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600',
                      rating: 5,
                      comment: '',
                      orderNumber: 'الإسكندرية، مصر',
                    });
                    setIsAddReviewModalOpen(true);
                  }}
                  className="bg-[#000000] text-white hover:bg-[#2f3131] px-5 py-2.5 rounded-xl font-label-caps text-[13px] font-bold transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2 shrink-0"
                >
                  <span className="material-symbols-outlined text-[18px]">add_comment</span>
                  <span>{language === 'ar' ? 'إضافة تقييم جديد' : 'Add Manual Review'}</span>
                </button>
              </div>
            </div>

            {/* Reviews List */}
            {loadingReviews ? (
              <div className="bg-white p-12 rounded-2xl border border-[#c4c7c7]/30 text-center font-body text-[#747878]">
                {language === 'ar' ? 'جاري تحميل التقييمات من قاعدة البيانات...' : 'Loading reviews...'}
              </div>
            ) : filteredReviews.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-[#c4c7c7]/30 text-center space-y-3">
                <span className="material-symbols-outlined text-[48px] text-[#c4c7c7]">
                  rate_review
                </span>
                <h3 className="font-display text-[18px] font-bold text-[#000000]">
                  {language === 'ar' ? 'لا توجد تقييمات مطابقة' : 'No reviews found'}
                </h3>
                <p className="font-body text-[13px] text-[#747878]">
                  {language === 'ar'
                    ? 'لم يتم العثور على تقييمات بناءً على البحث أو الفلتر المحدد.'
                    : 'No product reviews match your search or filter.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="bg-white p-5 rounded-2xl border border-[#c4c7c7]/30 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow relative group"
                  >
                    <div className="space-y-3">
                      {/* Top Row: User & Product */}
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex items-center gap-2.5">
                          {rev.userPhoto ? (
                            <img
                              src={rev.userPhoto}
                              alt={rev.userName}
                              className="w-10 h-10 rounded-full object-cover border border-[#c4c7c7]/40 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-[#000000] text-white font-bold flex items-center justify-center text-[14px] shrink-0">
                              {(rev.userName || 'U')[0].toUpperCase()}
                            </div>
                          )}
                          <div>
                            <h4 className="font-body text-[14px] font-bold text-[#000000]">
                              {rev.userName || (language === 'ar' ? 'عميل ميزون' : 'Verified Client')}
                            </h4>
                            <p className="font-body text-[11px] text-[#2e7d32] font-semibold flex items-center gap-1">
                              <span>✓</span>
                              <span>
                                {rev.orderNumber || (language === 'ar' ? 'مشتري مؤكد' : 'Verified')}
                              </span>
                            </p>
                          </div>
                        </div>

                        {/* Star Rating Display */}
                        <div className="flex text-[#f59e0b]">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className="material-symbols-outlined text-[16px]"
                              style={{
                                fontVariationSettings: star <= (rev.rating || 5) ? "'FILL' 1" : "'FILL' 0",
                                color: star <= (rev.rating || 5) ? '#f59e0b' : '#d1d5db',
                              }}
                            >
                              star
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Product Name Badge */}
                      <div className="inline-block bg-[#f3f3f4] px-3 py-1 rounded-lg border border-[#c4c7c7]/30 text-[12px] font-label-caps text-[#444748]">
                        📦 {rev.productTitle || (language === 'ar' ? 'منتج عام' : 'Product')}
                      </div>

                      {/* Review Comment */}
                      <p className="font-body text-[14px] text-[#222222] leading-relaxed bg-[#f9f9f9] p-3 rounded-xl border border-[#c4c7c7]/20 italic">
                        "{rev.comment}"
                      </p>
                    </div>

                    {/* Bottom Actions Row */}
                    <div className="flex justify-between items-center pt-3 border-t border-[#c4c7c7]/20 text-[12px] text-[#747878] font-body">
                      <span>
                        {rev.createdAt?.toDate
                          ? new Date(rev.createdAt.toDate()).toLocaleDateString('ar-EG')
                          : language === 'ar' ? 'مؤخراً' : 'Recently'}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEditReviewModal(rev)}
                          className="text-[#000000] hover:bg-[#f3f3f4] px-3 py-1.5 rounded-lg font-label-caps text-[12px] flex items-center gap-1 transition-colors cursor-pointer border border-[#c4c7c7]/30"
                          title={language === 'ar' ? 'تعديل التقييم' : 'Edit Review'}
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                          <span>{language === 'ar' ? 'تعديل' : 'Edit'}</span>
                        </button>

                        <button
                          onClick={() => setReviewToDelete(rev)}
                          className="text-[#ba1a1a] hover:bg-[#ba1a1a]/10 px-3 py-1.5 rounded-lg font-label-caps text-[12px] flex items-center gap-1 transition-colors cursor-pointer border border-[#ba1a1a]/20"
                          title={language === 'ar' ? 'حذف التقييم' : 'Delete Review'}
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                          <span>{language === 'ar' ? 'حذف' : 'Delete'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* NEWSLETTER & CLIENT BROADCAST TAB */}
        {activeTab === 'newsletter' && (
          <div className="space-y-6">
            {/* Top Newsletter KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-[#c4c7c7]/30 shadow-xs flex items-center justify-between">
                <div>
                  <p className="font-label-caps text-[11px] text-[#747878]">
                    {language === 'ar' ? 'إجمالي المشتركين' : 'Total Subscribers'}
                  </p>
                  <p className="font-display text-[26px] font-bold text-[#000000] mt-1">
                    {subscribers.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-[#000000]/5 rounded-2xl flex items-center justify-center text-[#000000]">
                  <span className="material-symbols-outlined text-[26px]">mark_email_unread</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#c4c7c7]/30 shadow-xs flex items-center justify-between">
                <div>
                  <p className="font-label-caps text-[11px] text-[#747878]">
                    {language === 'ar' ? 'حسابات نشطة' : 'Active Subscriptions'}
                  </p>
                  <p className="font-display text-[26px] font-bold text-[#2e7d32] mt-1">
                    {subscribers.filter((s) => s.status !== 'unsubscribed').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-[#2e7d32]/10 rounded-2xl flex items-center justify-center text-[#2e7d32]">
                  <span className="material-symbols-outlined text-[26px]">verified</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#c4c7c7]/30 shadow-xs flex items-center justify-between">
                <div>
                  <p className="font-label-caps text-[11px] text-[#747878]">
                    {language === 'ar' ? 'الحملات المرسلة' : 'Sent Campaigns'}
                  </p>
                  <p className="font-display text-[26px] font-bold text-[#000000] mt-1">
                    {campaigns.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-[#000000]/5 rounded-2xl flex items-center justify-center text-[#000000]">
                  <span className="material-symbols-outlined text-[26px]">send</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#c4c7c7]/30 shadow-xs flex items-center justify-between">
                <div>
                  <p className="font-label-caps text-[11px] text-[#747878]">
                    {language === 'ar' ? 'نسبة الوصول' : 'Est. Delivery Rate'}
                  </p>
                  <p className="font-display text-[26px] font-bold text-[#000000] mt-1">
                    99.4%
                  </p>
                </div>
                <div className="w-12 h-12 bg-[#000000]/5 rounded-2xl flex items-center justify-center text-[#000000]">
                  <span className="material-symbols-outlined text-[26px]">insights</span>
                </div>
              </div>
            </div>

            {/* Subscriber Actions & Controls Bar */}
            <div className="bg-white p-5 rounded-2xl border border-[#c4c7c7]/30 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-[20px] text-[#747878]">
                  search
                </span>
                <input
                  type="text"
                  placeholder={
                    language === 'ar'
                      ? 'البحث بالإيميل أو المصدر...'
                      : 'Search by email address or source...'
                  }
                  value={subscriberSearch}
                  onChange={(e) => setSubscriberSearch(e.target.value)}
                  className="w-full border border-[#c4c7c7] rounded-xl py-2.5 pr-10 pl-4 text-[13px] bg-white text-[#000000] focus:outline-none focus:border-[#000000]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyAllEmails}
                  className="bg-[#f3f3f4] text-[#000000] hover:bg-[#000000] hover:text-white border border-[#c4c7c7]/40 px-4 py-2.5 rounded-xl font-label-caps text-[12px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                >
                  <span className="material-symbols-outlined text-[18px]">content_copy</span>
                  <span>{copySuccessMsg || (language === 'ar' ? 'نسخ قائمة الإيميلات' : 'Copy Email List')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsBroadcastModalOpen(true)}
                  className="bg-[#000000] text-white hover:bg-[#2f3131] px-5 py-2.5 rounded-xl font-label-caps text-[13px] font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
                >
                  <span className="material-symbols-outlined text-[20px]">forward_to_inbox</span>
                  <span>{language === 'ar' ? 'إرسال نشرة بريدية جديدة' : 'Create Broadcast Campaign'}</span>
                </button>
              </div>
            </div>

            {/* Subscribers Table List */}
            <div className="bg-white rounded-2xl border border-[#c4c7c7]/30 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-[#c4c7c7]/30 bg-[#f9f9f9] flex justify-between items-center">
                <h3 className="font-display text-[16px] font-bold text-[#000000]">
                  {language === 'ar' ? 'قائمة إيميلات العملاء المشتركين' : 'Subscribed Client Emails'}
                </h3>
                <span className="font-label-caps text-[12px] text-[#747878]">
                  {language === 'ar' ? `عرض ${filteredSubscribers.length} بريد` : `Showing ${filteredSubscribers.length} emails`}
                </span>
              </div>

              {loadingSubscribers ? (
                <div className="p-12 text-center font-body text-[#747878]">
                  {language === 'ar' ? 'جاري تحميل المشتركين من قاعدة البيانات...' : 'Loading subscribers...'}
                </div>
              ) : filteredSubscribers.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <span className="material-symbols-outlined text-[48px] text-[#c4c7c7]">
                    unsubscribe
                  </span>
                  <p className="font-display text-[18px] font-bold text-[#000000]">
                    {language === 'ar' ? 'لا يوجد مشتركين حتى الآن' : 'No newsletter subscribers found'}
                  </p>
                  <p className="font-body text-[13px] text-[#747878]">
                    {language === 'ar'
                      ? 'عندما يسجل العملاء إيميلاتهم في الموقع للخصومات، ستظهر حساباتهم هنا تلقائياً.'
                      : 'When clients subscribe via the web footer or popup, their emails will appear here.'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-right dir-rtl font-body text-[13px]">
                    <thead className="bg-[#f3f3f4] text-[#444748] font-label-caps text-[11px] uppercase border-b border-[#c4c7c7]/30">
                      <tr>
                        <th className="py-3 px-4 text-right">#</th>
                        <th className="py-3 px-4 text-right">{language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}</th>
                        <th className="py-3 px-4 text-right">{language === 'ar' ? 'تاريخ الاشتراك' : 'Subscribed Date'}</th>
                        <th className="py-3 px-4 text-right">{language === 'ar' ? 'المصدر' : 'Source'}</th>
                        <th className="py-3 px-4 text-right">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                        <th className="py-3 px-4 text-center">{language === 'ar' ? 'إجراء' : 'Action'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#c4c7c7]/20">
                      {filteredSubscribers.map((sub, idx) => (
                        <tr key={sub.id} className="hover:bg-[#f9f9f9] transition-colors">
                          <td className="py-3.5 px-4 font-mono text-[#747878]">{idx + 1}</td>
                          <td className="py-3.5 px-4 font-bold text-[#000000] dir-ltr text-right">{sub.email}</td>
                          <td className="py-3.5 px-4 text-[#444748]">
                            {sub.subscribedAt
                              ? new Date(sub.subscribedAt).toLocaleDateString('ar-EG', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })
                              : '—'}
                          </td>
                          <td className="py-3.5 px-4 text-[#444748]">
                            <span className="bg-[#f3f3f4] px-2.5 py-1 rounded-md text-[11px] font-label-caps border border-[#c4c7c7]/30">
                              {sub.source || 'الموقع الإلكتروني'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[11px] font-label-caps font-bold inline-flex items-center gap-1 ${
                                sub.status === 'unsubscribed'
                                  ? 'bg-[#ba1a1a]/10 text-[#ba1a1a]'
                                  : 'bg-[#2e7d32]/10 text-[#2e7d32]'
                              }`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                              {sub.status === 'unsubscribed'
                                ? (language === 'ar' ? 'ملغي' : 'Unsubscribed')
                                : (language === 'ar' ? 'نشط' : 'Active')}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => setSubscriberToDelete(sub)}
                              className="text-[#ba1a1a] hover:bg-[#ba1a1a]/10 p-2 rounded-lg transition-colors cursor-pointer"
                              title={language === 'ar' ? 'حذف البريد' : 'Delete email'}
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Campaign Broadcast History Log */}
            {campaigns.length > 0 && (
              <div className="bg-white rounded-2xl border border-[#c4c7c7]/30 p-6 shadow-xs space-y-4">
                <h3 className="font-display text-[18px] font-bold text-[#000000] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[22px]">history</span>
                  <span>{language === 'ar' ? 'سجل النشرات البريدية المرسلة سابقاً' : 'Previously Broadcast Campaigns'}</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {campaigns.map((camp) => (
                    <div
                      key={camp.id}
                      className="border border-[#c4c7c7]/30 rounded-2xl p-4 bg-[#f9f9f9] space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-display text-[16px] font-bold text-[#000000]">
                          {camp.title}
                        </h4>
                        <span className="bg-[#2e7d32]/10 text-[#2e7d32] text-[11px] font-label-caps px-2.5 py-0.5 rounded-full font-bold">
                          {camp.status || 'تم الإرسال'}
                        </span>
                      </div>

                      <p className="font-body text-[13px] text-[#444748] line-clamp-2">
                        {camp.content}
                      </p>

                      <div className="flex flex-wrap justify-between items-center pt-2 border-t border-[#c4c7c7]/20 text-[12px] text-[#747878] gap-2">
                        <span>
                          {language === 'ar' ? `المستلمون: ${camp.recipientCount} مشترك` : `Recipients: ${camp.recipientCount}`}
                        </span>
                        {camp.promoCode && (
                          <span className="font-mono font-bold bg-[#000000] text-white px-2 py-0.5 rounded-md text-[11px]">
                            {camp.promoCode}
                          </span>
                        )}
                        <span>
                          {camp.sentAt
                            ? new Date(camp.sentAt).toLocaleDateString('ar-EG', {
                                month: 'short',
                                day: 'numeric',
                              })
                            : ''}
                        </span>
                      </div>

                      <div className="pt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenGmailForCampaign(camp.title, camp.content, camp.promoCode)}
                          className="px-3 py-1.5 rounded-lg bg-[#000000] text-white text-[11px] font-bold flex items-center gap-1 hover:bg-[#333333] transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[14px]">mail</span>
                          <span>{language === 'ar' ? 'إرسال عبر Gmail' : 'Send via Gmail'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenMailtoForCampaign(camp.title, camp.content, camp.promoCode)}
                          className="px-3 py-1.5 rounded-lg border border-[#c4c7c7] text-[#000000] text-[11px] font-bold flex items-center gap-1 hover:bg-[#f3f3f4] transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                          <span>{language === 'ar' ? 'تطبيق البريد' : 'Mail App'}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* GOOGLE AI STUDIO CODE SYNC TAB */}
        {activeTab === 'ai_studio_sync' && (
          <AiStudioSyncTab
            products={products}
            categories={categories}
            storeSettings={storeSettings}
            promoCodes={promoCodes}
            language={language}
          />
        )}
      </main>

      {/* Add / Edit Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-3xl w-full rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[#c4c7c7]/30 pb-4">
              <h3 className="font-display text-[22px] font-bold text-[#000000]">
                {editingProduct
                  ? language === 'ar' ? 'تعديل بيانات المنتج' : 'Edit Product'
                  : language === 'ar' ? 'إضافة منتج جديد' : 'Add New Product'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1.5 hover:bg-[#f3f3f4] rounded-full transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-5 text-[14px]">
              {/* Names */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-caps text-[11px] text-[#747878] mb-1">
                    اسم المنتج بالإنجليزي *
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-[#c4c7c7] rounded-xl py-2 px-3"
                    required
                  />
                </div>
                <div>
                  <label className="block font-label-caps text-[11px] text-[#747878] mb-1">
                    اسم المنتج بالعربي
                  </label>
                  <input
                    type="text"
                    value={formData.nameAr || ''}
                    onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                    className="w-full border border-[#c4c7c7] rounded-xl py-2 px-3"
                  />
                </div>
              </div>

              {/* Category Selector */}
              <div className="p-4 bg-[#f9f9f9] rounded-2xl border border-[#c4c7c7]/40 space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <label className="block font-label-caps text-[13px] font-bold text-[#000000]">
                      {language === 'ar' ? '🏷️ تصنيف وقسم المنتج *' : '🏷️ Product Category *'}
                    </label>
                    <p className="text-[11px] text-[#747878]">
                      {language === 'ar'
                        ? 'اضغط على القسم المطلوب (قميص، تيشيرت، بنطلون، إلخ) ليتم تصنيف المنتج داخله فوراً'
                        : 'Click on the desired category to instantly assign the product'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsProductModalOpen(false);
                      setActiveTab('categories');
                      handleOpenAddCategoryModal();
                    }}
                    className="text-[12px] font-label-caps text-[#8c6d37] hover:text-[#000000] underline font-bold cursor-pointer flex items-center gap-1"
                  >
                    <span>+ {language === 'ar' ? 'إضافة قسم جديد' : 'New Category'}</span>
                  </button>
                </div>

                {/* Quick Selection Buttons Grid */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {categories.map((cat) => {
                    const isSelected =
                      formData.category === cat.nameEn ||
                      formData.category === cat.nameAr ||
                      formData.categoryAr === cat.nameAr;

                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            category: cat.nameEn,
                            categoryAr: cat.nameAr,
                          });
                        }}
                        className={`px-3 py-2 rounded-xl text-[12px] sm:text-[13px] font-bold transition-all cursor-pointer flex items-center gap-2 border shadow-2xs ${
                          isSelected
                            ? 'bg-[#000000] text-white border-[#000000] ring-2 ring-[#c5a059]'
                            : 'bg-white text-[#222222] border-[#c4c7c7]/60 hover:border-[#000000] hover:bg-[#f3f3f4]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[17px]">
                          {cat.icon || 'label'}
                        </span>
                        <span>{cat.nameAr}</span>
                        <span className="text-[10px] opacity-70 font-mono">({cat.nameEn})</span>
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#c4c7c7]/20">
                  <div>
                    <label className="block text-[11px] text-[#747878] mb-1">
                      {language === 'ar' ? 'الاسم البرمجي / الإنجليزي:' : 'Category ID / English Name:'}
                    </label>
                    <select
                      value={formData.category || (categories[0]?.nameEn || 'Shirts')}
                      onChange={(e) => {
                        const selectedVal = e.target.value;
                        const match = categories.find(
                          (c) => c.nameEn === selectedVal || c.nameAr === selectedVal
                        );
                        if (match) {
                          setFormData({
                            ...formData,
                            category: match.nameEn,
                            categoryAr: match.nameAr,
                          });
                        } else {
                          setFormData({
                            ...formData,
                            category: selectedVal,
                          });
                        }
                      }}
                      className="w-full border border-[#c4c7c7] rounded-xl py-2 px-3 bg-white font-body text-[13px] focus:border-[#000000] focus:outline-none"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.nameEn}>
                          {cat.nameAr} — {cat.nameEn}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#747878] mb-1">
                      {language === 'ar' ? 'اسم التصنيف الظاهر في المتجر (بالعربية):' : 'Display Arabic Category Name:'}
                    </label>
                    <input
                      type="text"
                      value={formData.categoryAr || ''}
                      onChange={(e) => setFormData({ ...formData, categoryAr: e.target.value })}
                      placeholder="مثال: قميص"
                      className="w-full border border-[#c4c7c7] rounded-xl py-2 px-3 text-[13px] bg-white font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Price Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                <div>
                  <label className="block font-label-caps text-[11px] text-[#747878] mb-1">
                    السعر الحالي (ج.م) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.price || 0}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full border border-[#c4c7c7] rounded-xl py-2 px-3 font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-label-caps text-[11px] text-[#747878] mb-1">
                    السعر قبل الخصم (ج.م)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.originalPrice || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        originalPrice: e.target.value ? Number(e.target.value) : 0,
                      })
                    }
                    placeholder="مثال: 3200 (اتركه 0 إذا لا يوجد خصم)"
                    className="w-full border border-[#c4c7c7] rounded-xl py-2 px-3 text-[#747878]"
                  />
                </div>

                <div>
                  <label className="block font-label-caps text-[11px] text-[#747878] mb-1">
                    العنوان الفرعي (Subtitle)
                  </label>
                  <input
                    type="text"
                    value={formData.subtitle || ''}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    className="w-full border border-[#c4c7c7] rounded-xl py-2 px-3"
                  />
                </div>
              </div>

              {/* Descriptions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-caps text-[11px] text-[#747878] mb-1">
                    الوصف بالعربية
                  </label>
                  <textarea
                    rows={3}
                    value={formData.descriptionAr || ''}
                    onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                    className="w-full border border-[#c4c7c7] rounded-xl py-2 px-3"
                  />
                </div>
                <div>
                  <label className="block font-label-caps text-[11px] text-[#747878] mb-1">
                    Description in English
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full border border-[#c4c7c7] rounded-xl py-2 px-3"
                  />
                </div>
              </div>

              {/* Color Variants with Specific Images */}
              <div className="space-y-3 p-4 bg-[#f9f9f9] rounded-xl border border-[#c4c7c7]/20">
                <div className="flex justify-between items-center">
                  <div>
                    <label className="block font-label-caps text-[12px] font-bold text-[#000000]">
                      ألوان المنتج وصورة كل لون (Product Color Variants & Photos)
                    </label>
                    <p className="text-[11px] text-[#747878] font-body mt-0.5">
                      يمكنك تحديد لون وإرفاق/رفع صورة مخصصة له، لتتغير صورة المنتج في المتجر فور اختيار العميل للون.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddColorField}
                    className="text-[12px] font-label-caps text-[#000000] underline font-bold cursor-pointer shrink-0"
                  >
                    + إضافة لون جديد
                  </button>
                </div>

                {formData.colors && formData.colors.length > 0 ? (
                  <div className="space-y-3 mt-2">
                    {formData.colors.map((col, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-white rounded-xl border border-[#c4c7c7]/30 shadow-xs space-y-2.5"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                          {/* Hex Color Picker */}
                          <div className="sm:col-span-2 flex items-center gap-2">
                            <input
                              type="color"
                              value={col.hex || '#111111'}
                              onChange={(e) => handleUpdateColor(idx, 'hex', e.target.value)}
                              className="w-8 h-8 rounded-lg cursor-pointer border border-[#c4c7c7] p-0 bg-transparent shrink-0"
                              title="اختر درجة اللون"
                            />
                            <input
                              type="text"
                              value={col.hex || '#111111'}
                              onChange={(e) => handleUpdateColor(idx, 'hex', e.target.value)}
                              placeholder="#111111"
                              className="w-full border border-[#c4c7c7] rounded-lg py-1 px-2 text-[12px] font-mono dir-ltr"
                            />
                          </div>

                          {/* Name En */}
                          <div className="sm:col-span-3">
                            <input
                              type="text"
                              value={col.name || ''}
                              onChange={(e) => handleUpdateColor(idx, 'name', e.target.value)}
                              placeholder="اسم اللون (Noir/Beige)"
                              className="w-full border border-[#c4c7c7] rounded-lg py-1.5 px-2.5 text-[13px]"
                            />
                          </div>

                          {/* Name Ar */}
                          <div className="sm:col-span-3">
                            <input
                              type="text"
                              value={col.nameAr || ''}
                              onChange={(e) => handleUpdateColor(idx, 'nameAr', e.target.value)}
                              placeholder="الاسم بالعربي (أسود/بيج)"
                              className="w-full border border-[#c4c7c7] rounded-lg py-1.5 px-2.5 text-[13px]"
                            />
                          </div>

                          {/* Delete Color */}
                          <div className="sm:col-span-4 flex justify-end">
                            <button
                              type="button"
                              onClick={() => handleRemoveColorField(idx)}
                              className="text-[#ba1a1a] hover:bg-[#ba1a1a]/10 px-2.5 py-1 rounded-lg text-[12px] font-label-caps flex items-center gap-1 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                              <span>حذف اللون</span>
                            </button>
                          </div>
                        </div>

                        {/* Color Specific Image URL or Direct File Upload */}
                        <div className="flex flex-col sm:flex-row gap-2 items-center bg-[#f3f3f4] p-2 rounded-lg">
                          <span className="text-[12px] font-label-caps text-[#444748] shrink-0">
                            صورة هذا اللون:
                          </span>
                          <input
                            type="text"
                            value={col.imageUrl || ''}
                            onChange={(e) => handleUpdateColor(idx, 'imageUrl', e.target.value)}
                            placeholder="ضع رابط صورة هذا اللون هنا (https://...)"
                            className="flex-1 w-full border border-[#c4c7c7] bg-white rounded-lg py-1 px-2.5 text-[12px] dir-ltr"
                          />
                          <label className="bg-[#000000] text-white hover:bg-[#2f3131] px-3 py-1 rounded-lg text-[11px] font-label-caps cursor-pointer shrink-0 flex items-center gap-1 transition-colors">
                            <span className="material-symbols-outlined text-[14px]">upload</span>
                            <span>رفع صورة</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  handleFileUploadForColor(idx, e.target.files[0]);
                                }
                              }}
                            />
                          </label>
                          {col.imageUrl && (
                            <img
                              src={col.imageUrl}
                              alt={col.name}
                              className="w-8 h-8 rounded-md object-cover border border-[#c4c7c7] shrink-0 bg-white"
                            />
                          )}
                        </div>

                        {/* Color Specific Custom Sizes */}
                        <div className="mt-2 pt-2 border-t border-[#c4c7c7]/30 bg-white/80 p-2.5 rounded-lg">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5 mb-2">
                            <span className="text-[12px] font-bold text-[#000000] flex items-center gap-1">
                              <span className="material-symbols-outlined text-[16px] text-[#444748]">straighten</span>
                              <span>مقاسات خاصة بهذا الموديل/اللون (اختياري):</span>
                            </span>
                            <span className="text-[11px] text-[#747878]">
                              {col.sizes && col.sizes.length > 0
                                ? `(${col.sizes.length} مقاس محدد لهذا الموديل)`
                                : 'يستخدم المقاسات العامة للمنتج تلقائياً'}
                            </span>
                          </div>

                          {/* Quick Preset Buttons for Color */}
                          <div className="flex items-center gap-1.5 flex-wrap mb-2">
                            <span className="text-[11px] font-bold text-[#555555] ml-1">تعبئة أوتوماتيكية:</span>
                            <button
                              type="button"
                              onClick={() => handleAddQuickSizesPresetToColor(idx, 'clothing-standard')}
                              className="px-2 py-0.5 bg-white border border-[#c4c7c7] text-[#000000] rounded-md text-[10px] font-label-caps hover:bg-black hover:text-white transition-colors cursor-pointer"
                              title="إضافة S, M, L, XL, XXL"
                            >
                              + حروف (S-XXL)
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAddQuickSizesPresetToColor(idx, 'clothing-extended')}
                              className="px-2 py-0.5 bg-white border border-[#c4c7c7] text-[#000000] rounded-md text-[10px] font-label-caps hover:bg-black hover:text-white transition-colors cursor-pointer"
                              title="إضافة XS, S, M, L, XL, 2XL, 3XL"
                            >
                              + حروف (XS-3XL)
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAddQuickSizesPresetToColor(idx, 'pants')}
                              className="px-2 py-0.5 bg-white border border-[#c4c7c7] text-[#000000] rounded-md text-[10px] font-label-caps hover:bg-black hover:text-white transition-colors cursor-pointer"
                              title="إضافة 30, 32, 34, 36, 38, 40"
                            >
                              + بناطيل (30-40)
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAddQuickSizesPresetToColor(idx, 'numeric-clothing')}
                              className="px-2 py-0.5 bg-white border border-[#c4c7c7] text-[#000000] rounded-md text-[10px] font-label-caps hover:bg-black hover:text-white transition-colors cursor-pointer"
                              title="إضافة 36, 38, 40, 42, 44, 46"
                            >
                              + أرقام (36-46)
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAddQuickSizesPresetToColor(idx, 'shoes')}
                              className="px-2 py-0.5 bg-white border border-[#c4c7c7] text-[#000000] rounded-md text-[10px] font-label-caps hover:bg-black hover:text-white transition-colors cursor-pointer"
                              title="إضافة 37, 38, 39, 40, 41, 42, 43, 44, 45"
                            >
                              + أحذية (37-45)
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAddQuickSizesPresetToColor(idx, 'free-size')}
                              className="px-2 py-0.5 bg-white border border-[#c4c7c7] text-[#000000] rounded-md text-[10px] font-label-caps hover:bg-black hover:text-white transition-colors cursor-pointer"
                            >
                              + مقاس موحد (Free Size)
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCopyGeneralSizesToColor(idx)}
                              className="px-2 py-0.5 bg-[#f3f3f4] border border-[#c4c7c7] text-[#000000] rounded-md text-[10px] font-label-caps hover:bg-black hover:text-white transition-colors cursor-pointer font-bold"
                              title="نسخ المقاسات العامة للمنتج إلى هذا الموديل"
                            >
                              📋 نسخ العامة
                            </button>
                            {col.sizes && col.sizes.length > 0 && (
                              <button
                                type="button"
                                onClick={() => handleClearColorSizes(idx)}
                                className="px-2 py-0.5 text-[#ba1a1a] hover:bg-[#ba1a1a]/10 rounded-md text-[10px] font-label-caps transition-colors cursor-pointer"
                                title="إعادة تعيين للاعتماد على المقاسات العامة للمنتج"
                              >
                                ✕ مسح
                              </button>
                            )}
                          </div>

                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <input
                              type="text"
                              placeholder="أو اكتب مقاس يدوي (مثال: S, M, L أو 38, 39, 40)..."
                              className="flex-1 min-w-[200px] border border-[#c4c7c7] bg-white rounded-lg py-1 px-2.5 text-[12px]"
                              id={`color-sizes-input-${idx}`}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  const val = (e.currentTarget.value || '').trim();
                                  if (val) {
                                    handleAddSizesToColor(idx, val);
                                    e.currentTarget.value = '';
                                  }
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const inputEl = document.getElementById(`color-sizes-input-${idx}`) as HTMLInputElement;
                                if (inputEl && inputEl.value.trim()) {
                                  handleAddSizesToColor(idx, inputEl.value.trim());
                                  inputEl.value = '';
                                }
                              }}
                              className="px-2.5 py-1 bg-[#000000] text-white rounded-lg text-[11px] font-label-caps hover:bg-[#2f3131] transition-colors cursor-pointer"
                            >
                              + إضافة
                            </button>
                          </div>

                          {/* Color sizes badges list */}
                          {col.sizes && col.sizes.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                              {col.sizes.map((szObj, sIdx) => (
                                <span
                                  key={sIdx}
                                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold border transition-colors ${
                                    szObj.inStock
                                      ? 'bg-white text-black border-[#000000]'
                                      : 'bg-gray-100 text-gray-400 border-gray-300 line-through'
                                  }`}
                                >
                                  <button
                                    type="button"
                                    onClick={() => handleToggleColorSizeStock(idx, sIdx)}
                                    title={szObj.inStock ? 'انقر لجعله غير متوفر' : 'انقر لجعله متوفر'}
                                    className="cursor-pointer"
                                  >
                                    {szObj.size} {szObj.inStock ? '✓' : '(نفذ)'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveColorSize(idx, sIdx)}
                                    className="text-red-500 hover:text-red-700 cursor-pointer font-bold"
                                    title="حذف هذا المقاس"
                                  >
                                    ×
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[12px] text-[#747878] italic py-2">
                    لا يوجد ألوان مضافة حالياً. اضغط "+ إضافة لون جديد" بالأعلى.
                  </p>
                )}
              </div>

              {/* Product Sizes Management */}
              <div className="space-y-3 p-4 bg-[#f9f9f9] rounded-xl border border-[#c4c7c7]/20">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <label className="block font-label-caps text-[13px] font-bold text-[#000000]">
                        مقاسات المنتج (Product Sizes)
                      </label>
                      <p className="text-[11px] text-[#747878] font-body mt-0.5">
                        اختر مجموعة مقاسات جاهزة بضغطة زر واحدة، أو أضف مقاسات مخصصة يدوياً.
                      </p>
                    </div>

                    {formData.sizes && formData.sizes.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, sizes: [] }))}
                        className="text-[11px] text-[#ba1a1a] hover:bg-[#ba1a1a]/10 px-2 py-1 rounded-md font-label-caps transition-colors cursor-pointer"
                        title="مسح جميع المقاسات الحالية"
                      >
                        ✕ مسح جميع المقاسات
                      </button>
                    )}
                  </div>

                  {/* Preset Quick Fill Groups */}
                  <div className="p-2.5 bg-white rounded-lg border border-[#c4c7c7]/30 space-y-2">
                    <div className="text-[11px] font-bold text-[#333333] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px] text-black">auto_awesome</span>
                      <span>مجموعات مقاسات جاهزة بنقرة واحدة (تعبئة أوتوماتيكية):</span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleAddQuickSizesPreset('clothing-standard')}
                        className="px-2.5 py-1 bg-[#f3f3f4] border border-[#c4c7c7] text-[#000000] rounded-lg text-[11px] font-bold font-label-caps hover:bg-black hover:text-white transition-colors cursor-pointer shadow-2xs"
                        title="إضافة S, M, L, XL, XXL"
                      >
                        👕 حروف ملابس (S - XXL)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddQuickSizesPreset('clothing-extended')}
                        className="px-2.5 py-1 bg-[#f3f3f4] border border-[#c4c7c7] text-[#000000] rounded-lg text-[11px] font-bold font-label-caps hover:bg-black hover:text-white transition-colors cursor-pointer shadow-2xs"
                        title="إضافة XS, S, M, L, XL, 2XL, 3XL"
                      >
                        👕 حروف موسعة (XS - 3XL)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddQuickSizesPreset('pants')}
                        className="px-2.5 py-1 bg-[#f3f3f4] border border-[#c4c7c7] text-[#000000] rounded-lg text-[11px] font-bold font-label-caps hover:bg-black hover:text-white transition-colors cursor-pointer shadow-2xs"
                        title="إضافة 30, 32, 34, 36, 38, 40"
                      >
                        👖 أرقام بناطيل (30 - 40)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddQuickSizesPreset('numeric-clothing')}
                        className="px-2.5 py-1 bg-[#f3f3f4] border border-[#c4c7c7] text-[#000000] rounded-lg text-[11px] font-bold font-label-caps hover:bg-black hover:text-white transition-colors cursor-pointer shadow-2xs"
                        title="إضافة 36, 38, 40, 42, 44, 46"
                      >
                        🔢 مقاسات أرقام (36 - 46)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddQuickSizesPreset('shoes')}
                        className="px-2.5 py-1 bg-[#f3f3f4] border border-[#c4c7c7] text-[#000000] rounded-lg text-[11px] font-bold font-label-caps hover:bg-black hover:text-white transition-colors cursor-pointer shadow-2xs"
                        title="إضافة 37, 38, 39, 40, 41, 42, 43, 44, 45"
                      >
                        👟 أحذية وكوتشي (37 - 45)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddQuickSizesPreset('shoes-women')}
                        className="px-2.5 py-1 bg-[#f3f3f4] border border-[#c4c7c7] text-[#000000] rounded-lg text-[11px] font-bold font-label-caps hover:bg-black hover:text-white transition-colors cursor-pointer shadow-2xs"
                        title="إضافة 36, 37, 38, 39, 40, 41"
                      >
                        👠 أحذية حريمي (36 - 41)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddQuickSizesPreset('free-size')}
                        className="px-2.5 py-1 bg-[#f3f3f4] border border-[#c4c7c7] text-[#000000] rounded-lg text-[11px] font-bold font-label-caps hover:bg-black hover:text-white transition-colors cursor-pointer shadow-2xs"
                        title="إضافة مقاس موحد Free Size"
                      >
                        🏷️ مقاس موحد (Free Size)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddQuickSizesPreset('oversize')}
                        className="px-2.5 py-1 bg-[#f3f3f4] border border-[#c4c7c7] text-[#000000] rounded-lg text-[11px] font-bold font-label-caps hover:bg-black hover:text-white transition-colors cursor-pointer shadow-2xs"
                        title="إضافة Over Size 1, Over Size 2"
                      >
                        🎽 أوفر سايز (Oversize)
                      </button>
                    </div>

                    {/* Single Quick-Click Size Chips */}
                    <div className="pt-2 border-t border-[#f0f0f0]">
                      <span className="text-[10px] text-[#747878] font-bold block mb-1">
                        أو اضغط على أي مقاس مفرد لإضافته فوراً:
                      </span>
                      <div className="flex items-center gap-1 flex-wrap">
                        {['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '30', '32', '34', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', 'Free Size'].map((szKey) => {
                          const isAlreadyAdded = formData.sizes?.some((s) => s.size.toLowerCase() === szKey.toLowerCase());
                          return (
                            <button
                              key={szKey}
                              type="button"
                              onClick={() => {
                                if (!isAlreadyAdded) {
                                  setFormData((prev) => ({
                                    ...prev,
                                    sizes: [...(prev.sizes || []), { size: szKey, inStock: true }],
                                  }));
                                }
                              }}
                              disabled={isAlreadyAdded}
                              className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-all cursor-pointer ${
                                isAlreadyAdded
                                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300'
                                  : 'bg-white text-black border border-gray-300 hover:border-black hover:bg-black hover:text-white active:scale-95'
                              }`}
                            >
                              +{szKey}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Custom Size Input Field */}
                <div className="flex gap-2 items-center bg-white p-2 rounded-xl border border-[#c4c7c7]/30">
                  <input
                    type="text"
                    value={customSizeInput}
                    onChange={(e) => setCustomSizeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomSize();
                      }
                    }}
                    placeholder="اكتب مقاس يدوي هنا (مثلاً: 38 أو عدة مقاسات مفصولة بفواصل: 36, 37, 38)..."
                    className="flex-1 border-none py-1 px-2 text-[13px] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddCustomSize()}
                    className="bg-[#000000] text-white hover:bg-[#2f3131] px-3 py-1.5 rounded-lg text-[12px] font-label-caps font-bold cursor-pointer shrink-0"
                  >
                    + إضافة المقاس
                  </button>
                </div>

                {/* List of current sizes */}
                {formData.sizes && formData.sizes.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-2">
                    {formData.sizes.map((sz, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 bg-white rounded-xl border border-[#c4c7c7]/30 shadow-2xs gap-1"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <input
                            type="text"
                            value={sz.size}
                            onChange={(e) => handleUpdateSize(idx, 'size', e.target.value)}
                            className="w-16 border border-[#c4c7c7] rounded-md py-0.5 px-1.5 text-[12px] font-bold font-mono text-center focus:outline-none focus:border-[#000000]"
                          />
                          <label className="flex items-center gap-1 cursor-pointer text-[11px] text-[#444748] shrink-0">
                            <input
                              type="checkbox"
                              checked={!!sz.inStock}
                              onChange={(e) => handleUpdateSize(idx, 'inStock', e.target.checked)}
                              className="w-3.5 h-3.5 accent-black"
                            />
                            <span>متوفر</span>
                          </label>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveSizeField(idx)}
                          className="text-[#ba1a1a] hover:bg-[#ba1a1a]/10 p-1 rounded transition-colors cursor-pointer shrink-0"
                          title="حذف هذا المقاس"
                        >
                          <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[12px] text-[#747878] italic py-1">
                    لا يوجد مقاسات مضافة. اكتب المقاس بالأعلى واضغط "+ إضافة المقاس".
                  </p>
                )}
              </div>

              {/* Images URLs */}
              <div className="space-y-2 p-4 bg-[#f9f9f9] rounded-xl border border-[#c4c7c7]/20">
                <div className="flex justify-between items-center">
                  <label className="block font-label-caps text-[12px] font-bold text-[#000000]">
                    معرض الصور العام للمنتج (General Product Gallery)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddImageField}
                    className="text-[12px] font-label-caps text-[#000000] underline font-bold cursor-pointer"
                  >
                    + إضافة رابط صورة آخر
                  </button>
                </div>

                {formData.images?.map((url, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => handleUpdateImageUrl(i, e.target.value)}
                      placeholder="https://..."
                      className="flex-1 border border-[#c4c7c7] rounded-xl py-1.5 px-3 text-[13px] dir-ltr"
                    />
                    <label className="bg-[#000000] text-white hover:bg-[#2f3131] px-2.5 py-1.5 rounded-xl text-[11px] font-label-caps cursor-pointer shrink-0 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleFileUploadForMainImage(i, e.target.files[0]);
                          }
                        }}
                      />
                    </label>
                    {url && (
                      <img src={url} alt="preview" className="w-8 h-8 rounded object-cover border" />
                    )}
                    {formData.images!.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveImageField(i)}
                        className="text-[#ba1a1a] p-1"
                      >
                        <span className="material-symbols-outlined text-[18px]">remove_circle</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Homepage & Badges Toggles */}
              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-3 cursor-pointer font-label-caps text-[13px] p-3.5 bg-[#f0f7f2] rounded-xl border border-[#2e7d32]/30">
                  <input
                    type="checkbox"
                    checked={!!(formData.showOnHome || formData.isFeatured)}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        showOnHome: e.target.checked,
                        isFeatured: e.target.checked,
                      })
                    }
                    className="w-5 h-5 accent-[#2e7d32]"
                  />
                  <div>
                    <span className="font-bold text-[#000000] text-[14px] block">
                      {language === 'ar' ? '⭐ إظهار هذا المنتج في الصفحة الرئيسية (Homepage Display)' : '⭐ Show this product on the Homepage'}
                    </span>
                    <span className="text-[12px] text-[#444748] font-body block">
                      {language === 'ar'
                        ? 'عند التفعيل، سيظهر هذا المنتج مباشرة في قسم معروضات الرئيسية للمتجر.'
                        : 'When enabled, this product will be highlighted in the main homepage gallery.'}
                    </span>
                  </div>
                </label>

                <div className="flex flex-wrap gap-6 items-center pt-1">
                  <label className="flex items-center gap-2 cursor-pointer font-label-caps text-[13px]">
                    <input
                      type="checkbox"
                      checked={!!formData.isNewArrival}
                      onChange={(e) => setFormData({ ...formData, isNewArrival: e.target.checked })}
                      className="w-4 h-4 accent-black"
                    />
                    <span>عرض في قسم "وصل حديثاً" (New Arrival)</span>
                  </label>
                </div>
              </div>

              {/* Submit / Cancel */}
              <div className="flex gap-4 pt-4 border-t border-[#c4c7c7]/30">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="w-1/3 border border-[#000000] text-[#000000] py-3 rounded-xl font-label-caps font-bold hover:bg-[#f3f3f4] transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="w-2/3 bg-[#000000] text-white py-3 rounded-xl font-label-caps font-bold hover:bg-[#2f3131] transition-all cursor-pointer shadow-md"
                >
                  {editingProduct ? 'حفظ التعديلات' : 'إضافة المنتج فوراً'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Manual Review Modal */}
      {isAddReviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-2xl p-6 space-y-5 shadow-2xl relative">
            <div className="flex justify-between items-center border-b border-[#c4c7c7]/30 pb-3">
              <h3 className="font-display text-[20px] font-bold text-[#000000]">
                {language === 'ar' ? 'إضافة تقييم جديد للمنتج' : 'Add Manual Review'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddReviewModalOpen(false)}
                className="p-1 hover:bg-[#f3f3f4] rounded-full transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateReviewSubmit} className="space-y-4">
              {/* Select Product */}
              <div>
                <label className="block text-[12px] font-label-caps text-[#444748] mb-1">
                  اختر المنتج المقيم *
                </label>
                <select
                  value={newReviewForm.productId}
                  onChange={(e) => {
                    const pid = e.target.value;
                    const p = products.find((prod) => prod.id === pid);
                    setNewReviewForm({
                      ...newReviewForm,
                      productId: pid,
                      productTitle: p ? (language === 'ar' ? p.nameAr || p.name : p.name) : '',
                    });
                  }}
                  required
                  className="w-full border border-[#c4c7c7] bg-white rounded-xl py-2.5 px-3 text-[13px] focus:outline-none focus:border-[#000000]"
                >
                  {products.map((prod) => (
                    <option key={prod.id} value={prod.id}>
                      {language === 'ar' ? prod.nameAr || prod.name : prod.name} ({formatPrice(prod.price)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Customer Name & Photo URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-label-caps text-[#444748] mb-1">
                    اسم العميل *
                  </label>
                  <input
                    type="text"
                    value={newReviewForm.userName}
                    onChange={(e) => setNewReviewForm({ ...newReviewForm, userName: e.target.value })}
                    placeholder="مثال: ياسمين أحمد"
                    required
                    className="w-full border border-[#c4c7c7] rounded-xl py-2.5 px-3 text-[13px] focus:outline-none focus:border-[#000000]"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-label-caps text-[#444748] mb-1">
                    رابط صورة العميل الشخصية
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={newReviewForm.userPhoto}
                      onChange={(e) => setNewReviewForm({ ...newReviewForm, userPhoto: e.target.value })}
                      placeholder="https://..."
                      className="w-full border border-[#c4c7c7] rounded-xl py-2.5 px-3 text-[13px] focus:outline-none focus:border-[#000000]"
                    />
                    {newReviewForm.userPhoto && (
                      <img
                        src={newReviewForm.userPhoto}
                        alt="Preview"
                        className="w-9 h-9 rounded-full object-cover border border-[#c4c7c7] shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600';
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Rating Stars */}
              <div>
                <label className="block text-[12px] font-label-caps text-[#444748] mb-1">
                  التقييم بالنجوم (1 إلى 5)
                </label>
                <div className="flex gap-2 items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReviewForm({ ...newReviewForm, rating: star })}
                      className="text-[26px] focus:outline-none cursor-pointer hover:scale-110 transition-transform"
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{
                          fontVariationSettings: star <= newReviewForm.rating ? "'FILL' 1" : "'FILL' 0",
                          color: star <= newReviewForm.rating ? '#f59e0b' : '#d1d5db',
                        }}
                      >
                        star
                      </span>
                    </button>
                  ))}
                  <span className="font-body text-[13px] font-bold text-[#000000] mr-2">
                    ({newReviewForm.rating} من 5)
                  </span>
                </div>
              </div>

              {/* Order Number / Badge Tag */}
              <div>
                <label className="block text-[12px] font-label-caps text-[#444748] mb-1">
                  رقم الطلب / وسم التوثيق
                </label>
                <input
                  type="text"
                  value={newReviewForm.orderNumber}
                  onChange={(e) => setNewReviewForm({ ...newReviewForm, orderNumber: e.target.value })}
                  placeholder="مثال: ME-9821 أو مشتري مؤكد"
                  className="w-full border border-[#c4c7c7] rounded-xl py-2.5 px-3 text-[13px] focus:outline-none focus:border-[#000000]"
                />
              </div>

              {/* Comment Text */}
              <div>
                <label className="block text-[12px] font-label-caps text-[#444748] mb-1">
                  نص التقييم والتجربة *
                </label>
                <textarea
                  rows={3}
                  value={newReviewForm.comment}
                  onChange={(e) => setNewReviewForm({ ...newReviewForm, comment: e.target.value })}
                  placeholder="اكتب تجربة العميل عن الخامة والجودة..."
                  required
                  className="w-full border border-[#c4c7c7] rounded-xl p-3 text-[13px] focus:outline-none focus:border-[#000000]"
                />
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddReviewModalOpen(false)}
                  className="w-1/3 border border-[#000000] text-[#000000] py-2.5 rounded-xl font-label-caps font-bold hover:bg-[#f3f3f4] text-[13px] cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="w-2/3 bg-[#000000] text-white py-2.5 rounded-xl font-label-caps font-bold hover:bg-[#2f3131] text-[13px] cursor-pointer shadow-md"
                >
                  نشر التقييم الآن
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Review Modal */}
      {isEditReviewModalOpen && editingReview && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-2xl p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[#c4c7c7]/30 pb-3">
              <h3 className="font-display text-[20px] font-bold text-[#000000]">
                {language === 'ar' ? 'تعديل التقييم' : 'Edit Review'}
              </h3>
              <button
                onClick={() => {
                  setIsEditReviewModalOpen(false);
                  setEditingReview(null);
                }}
                className="p-1 hover:bg-[#f3f3f4] rounded-full transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleUpdateReviewSubmit} className="space-y-4">
              {/* Product Selection */}
              <div>
                <label className="block text-[12px] font-label-caps text-[#444748] mb-1">
                  المنتج المرتبط بالتقييم
                </label>
                <select
                  value={editReviewForm.productId}
                  onChange={(e) => {
                    const selProd = products.find((p) => p.id === e.target.value);
                    setEditReviewForm({
                      ...editReviewForm,
                      productId: e.target.value,
                      productTitle: selProd ? (language === 'ar' ? selProd.nameAr || selProd.name : selProd.name) : editReviewForm.productTitle,
                    });
                  }}
                  className="w-full border border-[#c4c7c7] rounded-xl py-2.5 px-3 text-[13px] bg-white focus:outline-none focus:border-[#000000]"
                >
                  {products.map((prod) => (
                    <option key={prod.id} value={prod.id}>
                      {language === 'ar' ? prod.nameAr || prod.name : prod.name} ({formatPrice(prod.price)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Customer Name & Photo URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-label-caps text-[#444748] mb-1">
                    اسم العميل *
                  </label>
                  <input
                    type="text"
                    value={editReviewForm.userName}
                    onChange={(e) => setEditReviewForm({ ...editReviewForm, userName: e.target.value })}
                    required
                    className="w-full border border-[#c4c7c7] rounded-xl py-2.5 px-3 text-[13px] focus:outline-none focus:border-[#000000]"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-label-caps text-[#444748] mb-1">
                    رابط صورة العميل الشخصية
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={editReviewForm.userPhoto}
                      onChange={(e) => setEditReviewForm({ ...editReviewForm, userPhoto: e.target.value })}
                      placeholder="https://..."
                      className="w-full border border-[#c4c7c7] rounded-xl py-2.5 px-3 text-[13px] focus:outline-none focus:border-[#000000]"
                    />
                    {editReviewForm.userPhoto && (
                      <img
                        src={editReviewForm.userPhoto}
                        alt="Preview"
                        className="w-9 h-9 rounded-full object-cover border border-[#c4c7c7] shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600';
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Rating Stars */}
              <div>
                <label className="block text-[12px] font-label-caps text-[#444748] mb-1">
                  التقييم بالنجوم (1 إلى 5)
                </label>
                <div className="flex gap-2 items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setEditReviewForm({ ...editReviewForm, rating: star })}
                      className="text-[26px] focus:outline-none cursor-pointer hover:scale-110 transition-transform"
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{
                          fontVariationSettings: star <= editReviewForm.rating ? "'FILL' 1" : "'FILL' 0",
                          color: star <= editReviewForm.rating ? '#f59e0b' : '#d1d5db',
                        }}
                      >
                        star
                      </span>
                    </button>
                  ))}
                  <span className="font-body text-[13px] font-bold text-[#000000] mr-2">
                    ({editReviewForm.rating} من 5)
                  </span>
                </div>
              </div>

              {/* Order Number / Badge Tag */}
              <div>
                <label className="block text-[12px] font-label-caps text-[#444748] mb-1">
                  رقم الطلب / وسم التوثيق
                </label>
                <input
                  type="text"
                  value={editReviewForm.orderNumber}
                  onChange={(e) => setEditReviewForm({ ...editReviewForm, orderNumber: e.target.value })}
                  className="w-full border border-[#c4c7c7] rounded-xl py-2.5 px-3 text-[13px] focus:outline-none focus:border-[#000000]"
                />
              </div>

              {/* Comment Text */}
              <div>
                <label className="block text-[12px] font-label-caps text-[#444748] mb-1">
                  نص التقييم والتجربة *
                </label>
                <textarea
                  rows={3}
                  value={editReviewForm.comment}
                  onChange={(e) => setEditReviewForm({ ...editReviewForm, comment: e.target.value })}
                  required
                  className="w-full border border-[#c4c7c7] rounded-xl p-3 text-[13px] focus:outline-none focus:border-[#000000]"
                />
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditReviewModalOpen(false);
                    setEditingReview(null);
                  }}
                  className="w-1/3 border border-[#000000] text-[#000000] py-2.5 rounded-xl font-label-caps font-bold hover:bg-[#f3f3f4] text-[13px] cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="w-2/3 bg-[#000000] text-white py-2.5 rounded-xl font-label-caps font-bold hover:bg-[#2f3131] text-[13px] cursor-pointer shadow-md"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Product Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 space-y-5 shadow-2xl text-center">
            <div className="w-14 h-14 bg-red-100 text-[#ba1a1a] rounded-full flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[32px]">delete_forever</span>
            </div>
            <div>
              <h3 className="font-display text-[20px] font-bold text-[#000000]">
                {language === 'ar' ? 'تأكيد حذف المنتج' : 'Delete Product Confirmation'}
              </h3>
              <p className="font-body text-[14px] text-[#5e5e5c] mt-2">
                {language === 'ar'
                  ? `هل أنت تأكد من حذف المنتج "${productToDelete.nameAr || productToDelete.name}" نهائياً من المتجر؟`
                  : `Are you sure you want to permanently delete "${productToDelete.name}"?`}
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="w-1/2 border border-[#c4c7c7] text-[#000000] py-2.5 rounded-xl font-label-caps font-bold hover:bg-[#f3f3f4] text-[13px] cursor-pointer"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteProduct}
                className="w-1/2 bg-[#ba1a1a] text-white py-2.5 rounded-xl font-label-caps font-bold hover:bg-[#961212] text-[13px] cursor-pointer shadow-md"
              >
                {language === 'ar' ? 'نعم، احذف المنتج' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Review Confirmation Modal */}
      {reviewToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 space-y-5 shadow-2xl text-center">
            <div className="w-14 h-14 bg-red-100 text-[#ba1a1a] rounded-full flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[32px]">rate_review</span>
            </div>
            <div>
              <h3 className="font-display text-[20px] font-bold text-[#000000]">
                {language === 'ar' ? 'تأكيد حذف التقييم' : 'Delete Review Confirmation'}
              </h3>
              <p className="font-body text-[14px] text-[#5e5e5c] mt-2">
                {language === 'ar'
                  ? `هل أنت تأكد من حذف تقييم العميل "${reviewToDelete.userName}" نهائياً؟`
                  : `Are you sure you want to delete review by "${reviewToDelete.userName}"?`}
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setReviewToDelete(null)}
                className="w-1/2 border border-[#c4c7c7] text-[#000000] py-2.5 rounded-xl font-label-caps font-bold hover:bg-[#f3f3f4] text-[13px] cursor-pointer"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteReview}
                className="w-1/2 bg-[#ba1a1a] text-white py-2.5 rounded-xl font-label-caps font-bold hover:bg-[#961212] text-[13px] cursor-pointer shadow-md"
              >
                {language === 'ar' ? 'نعم، احذف التقييم' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Order Confirmation Modal */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 space-y-5 shadow-2xl text-center">
            <div className="w-14 h-14 bg-red-100 text-[#ba1a1a] rounded-full flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[32px]">delete_forever</span>
            </div>
            <div>
              <h3 className="font-display text-[20px] font-bold text-[#000000]">
                {language === 'ar' ? 'تأكيد حذف الطلب' : 'Delete Order Confirmation'}
              </h3>
              <p className="font-body text-[14px] text-[#5e5e5c] mt-2">
                {language === 'ar'
                  ? `هل أنت تأكد من حذف الطلب رقم (${orderToDelete.orderNumber}) للعميل "${orderToDelete.shippingAddress?.fullName || orderToDelete.userEmail}" نهائياً من قاعدة البيانات؟`
                  : `Are you sure you want to permanently delete order (${orderToDelete.orderNumber})?`}
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setOrderToDelete(null)}
                className="w-1/2 border border-[#c4c7c7] text-[#000000] py-2.5 rounded-xl font-label-caps font-bold hover:bg-[#f3f3f4] text-[13px] cursor-pointer"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteOrder}
                className="w-1/2 bg-[#ba1a1a] text-white py-2.5 rounded-xl font-label-caps font-bold hover:bg-[#961212] text-[13px] cursor-pointer shadow-md"
              >
                {language === 'ar' ? 'نعم، احذف الطلب' : 'Yes, Delete Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Subscriber Confirmation Modal */}
      {subscriberToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 space-y-5 shadow-2xl text-center">
            <div className="w-14 h-14 bg-red-100 text-[#ba1a1a] rounded-full flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[32px]">delete_forever</span>
            </div>
            <div>
              <h3 className="font-display text-[20px] font-bold text-[#000000]">
                {language === 'ar' ? 'تأكيد حذف المشترك' : 'Delete Subscriber Confirmation'}
              </h3>
              <p className="font-body text-[14px] font-mono font-bold text-[#ba1a1a] mt-2 dir-ltr">
                {subscriberToDelete.email}
              </p>
              <p className="font-body text-[13px] text-[#747878] mt-1">
                {language === 'ar'
                  ? 'هل أنت متأكد من مسح هذا البريد من القائمة البريدية نهائياً؟ لن يعود في أي جلسة قادمة.'
                  : 'Are you sure you want to permanently delete this subscriber? It will not reappear in future sessions.'}
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSubscriberToDelete(null)}
                className="w-1/2 border border-[#c4c7c7] text-[#000000] py-2.5 rounded-xl font-label-caps font-bold hover:bg-[#f3f3f4] text-[13px] cursor-pointer"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteSubscriber}
                className="w-1/2 bg-[#ba1a1a] text-white py-2.5 rounded-xl font-label-caps font-bold hover:bg-[#961212] text-[13px] cursor-pointer shadow-md"
              >
                {language === 'ar' ? 'نعم، احذف البريد' : 'Yes, Delete Email'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-xl w-full rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[#c4c7c7]/30 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 bg-[#000000] text-white rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">category</span>
                </div>
                <div>
                  <h3 className="font-display text-[20px] font-bold text-[#000000]">
                    {editingCategory
                      ? language === 'ar' ? 'تعديل بيانات التصنيف' : 'Edit Category'
                      : language === 'ar' ? 'إضافة تصنيف جديد للبوتيك' : 'Add New Category'}
                  </h3>
                  <p className="font-body text-[12px] text-[#747878]">
                    {language === 'ar'
                      ? 'يظهر التصنيف تلقائياً في واجهة المتجر وفلاتر المنتجات'
                      : 'Appears automatically on storefront and filters'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1.5 hover:bg-[#f3f3f4] rounded-full transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 text-[14px]">
              {/* Category Name Ar & En */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-caps text-[11px] text-[#747878] mb-1 font-bold">
                    اسم التصنيف بالعربية *
                  </label>
                  <input
                    type="text"
                    value={categoryForm.nameAr}
                    onChange={(e) => setCategoryForm({ ...categoryForm, nameAr: e.target.value })}
                    placeholder="مثال: فساتين السهرة"
                    className="w-full border border-[#c4c7c7] rounded-xl py-2.5 px-3 font-body focus:border-[#000000] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-label-caps text-[11px] text-[#747878] mb-1 font-bold">
                    Category Name in English *
                  </label>
                  <input
                    type="text"
                    value={categoryForm.nameEn}
                    onChange={(e) => setCategoryForm({ ...categoryForm, nameEn: e.target.value })}
                    placeholder="e.g. Evening Gowns"
                    className="w-full border border-[#c4c7c7] rounded-xl py-2.5 px-3 font-body focus:border-[#000000] focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Description Ar & En */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-caps text-[11px] text-[#747878] mb-1">
                    الوصف بالعربية
                  </label>
                  <textarea
                    rows={2}
                    value={categoryForm.descriptionAr || ''}
                    onChange={(e) =>
                      setCategoryForm({ ...categoryForm, descriptionAr: e.target.value })
                    }
                    placeholder="توصيف فرعي لطبيعة القطع داخل القسم..."
                    className="w-full border border-[#c4c7c7] rounded-xl py-2 px-3 font-body focus:border-[#000000] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-label-caps text-[11px] text-[#747878] mb-1">
                    Description in English
                  </label>
                  <textarea
                    rows={2}
                    value={categoryForm.descriptionEn || ''}
                    onChange={(e) =>
                      setCategoryForm({ ...categoryForm, descriptionEn: e.target.value })
                    }
                    placeholder="Short summary for international visitors..."
                    className="w-full border border-[#c4c7c7] rounded-xl py-2 px-3 font-body focus:border-[#000000] focus:outline-none"
                  />
                </div>
              </div>

              {/* Icon Selector */}
              <div>
                <label className="block font-label-caps text-[11px] text-[#747878] mb-1 font-bold">
                  أيقونة التصنيف (Material Icon)
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {[
                    'styler',
                    'dry_cleaning',
                    'checkroom',
                    'apparel',
                    'view_column',
                    'card_giftcard',
                    'step_into',
                    'diamond',
                    'woman',
                    'sculpture',
                  ].map((iconName) => (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => setCategoryForm({ ...categoryForm, icon: iconName })}
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center cursor-pointer transition-all ${
                        categoryForm.icon === iconName
                          ? 'bg-[#000000] text-white border-[#000000] shadow-sm'
                          : 'bg-[#f9f9f9] text-[#444748] border-[#c4c7c7]/40 hover:border-[#000000]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">{iconName}</span>
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={categoryForm.icon || 'styler'}
                  onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                  placeholder="أو اكتب اسم الأيقونة..."
                  className="w-full border border-[#c4c7c7] rounded-xl py-1.5 px-3 font-mono text-[12px]"
                />
              </div>

              {/* Image URL & File Upload */}
              <div className="space-y-2 p-4 bg-[#f9f9f9] rounded-xl border border-[#c4c7c7]/20">
                <label className="block font-label-caps text-[11px] font-bold text-[#000000]">
                  صورة غلاف التصنيف (Category Header Cover)
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={categoryForm.imageUrl || ''}
                    onChange={(e) => setCategoryForm({ ...categoryForm, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 border border-[#c4c7c7] rounded-xl py-2 px-3 text-[13px] bg-white font-mono"
                  />
                  <label className="bg-[#000000] text-white hover:bg-[#333333] px-4 py-2 rounded-xl font-label-caps text-[12px] font-bold cursor-pointer transition-colors shrink-0 flex items-center justify-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">upload_file</span>
                    <span>رفع صورة</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUploadForCategoryImage(file);
                      }}
                    />
                  </label>
                </div>

                {categoryForm.imageUrl && (
                  <div className="relative h-28 rounded-xl overflow-hidden border border-[#c4c7c7]/40 mt-2">
                    <img
                      src={categoryForm.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-white text-[12px] font-bold">
                      معاينة الصورة الحالية
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-[#c4c7c7]/30">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-[#c4c7c7] font-label-caps text-[13px] font-bold hover:bg-[#f3f3f4] cursor-pointer"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#000000] text-white font-label-caps text-[13px] font-bold hover:bg-[#222222] shadow-md cursor-pointer flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">check</span>
                  <span>
                    {editingCategory
                      ? language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'
                      : language === 'ar' ? 'إضافة التصنيف' : 'Create Category'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Category Confirmation Modal */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 space-y-5 shadow-2xl text-center">
            <div className="w-14 h-14 bg-red-100 text-[#ba1a1a] rounded-full flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[32px]">category</span>
            </div>
            <div>
              <h3 className="font-display text-[20px] font-bold text-[#000000]">
                {language === 'ar' ? 'تأكيد حذف التصنيف' : 'Delete Category Confirmation'}
              </h3>
              <p className="font-body text-[14px] text-[#5e5e5c] mt-2">
                {language === 'ar'
                  ? `هل أنت تأكد من حذف تصنيف "${categoryToDelete.nameAr}" (${categoryToDelete.nameEn})؟ لن تؤثر عملية الحذف على المنتجات المسجلة بالفعل.`
                  : `Are you sure you want to delete category "${categoryToDelete.nameEn}"?`}
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
                className="w-1/2 border border-[#c4c7c7] text-[#000000] py-2.5 rounded-xl font-label-caps font-bold hover:bg-[#f3f3f4] text-[13px] cursor-pointer"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteCategory}
                className="w-1/2 bg-[#ba1a1a] text-white py-2.5 rounded-xl font-label-caps font-bold hover:bg-[#961212] text-[13px] cursor-pointer shadow-md"
              >
                {language === 'ar' ? 'نعم، احذف التصنيف' : 'Yes, Delete Category'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Email Campaign Modal */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-2xl w-full rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl relative my-8">
            <div className="flex justify-between items-center border-b border-[#c4c7c7]/30 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#000000] text-white rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">forward_to_inbox</span>
                </div>
                <div>
                  <h3 className="font-display text-[20px] font-bold text-[#000000]">
                    {language === 'ar' ? 'إرسال نشرة بريدية للمشتركين' : 'Broadcast Email Campaign'}
                  </h3>
                  <p className="font-label-caps text-[11px] text-[#747878]">
                    {language === 'ar'
                      ? `سيتم إرسال الرسالة إلى جميع المشتركين (${subscribers.length} عميل)`
                      : `Will send to all ${subscribers.length} subscribers`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBroadcastModalOpen(false)}
                className="p-1.5 hover:bg-[#f3f3f4] rounded-full transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSendBroadcastCampaign} className="space-y-4 text-[14px]">
              <div>
                <label className="block font-label-caps text-[11px] font-bold text-[#000000] mb-1">
                  {language === 'ar' ? 'عنوان البريد الإلكتروني (Subject) *' : 'Email Subject Line *'}
                </label>
                <input
                  type="text"
                  value={campaignTitle}
                  onChange={(e) => setCampaignTitle(e.target.value)}
                  placeholder={
                    language === 'ar'
                      ? 'مثال: 🔥 تشكيلة الشتاء الفاخرة وصلت الآن + خصم خاص ٢٠٪ للمشتركين'
                      : 'e.g., Summer Atelier Preview + 20% Off Private Code'
                  }
                  required
                  className="w-full border border-[#c4c7c7] rounded-xl py-2.5 px-3.5 bg-white text-[#000000] focus:outline-none focus:border-[#000000]"
                />
              </div>

              <div>
                <label className="block font-label-caps text-[11px] font-bold text-[#000000] mb-1">
                  {language === 'ar' ? 'مقدمة الرسالة (Preview Text)' : 'Preview Subtitle Text'}
                </label>
                <input
                  type="text"
                  value={campaignPreview}
                  onChange={(e) => setCampaignPreview(e.target.value)}
                  placeholder={
                    language === 'ar'
                      ? 'مقدمة تظهر بجوار عنوان الإيميل في صندوق الوارد...'
                      : 'Brief text showing next to the subject in inbox...'
                  }
                  className="w-full border border-[#c4c7c7] rounded-xl py-2.5 px-3.5 bg-white text-[#000000] focus:outline-none focus:border-[#000000]"
                />
              </div>

              <div>
                <label className="block font-label-caps text-[11px] font-bold text-[#000000] mb-1">
                  {language === 'ar' ? 'محتوى النشرة البريدية (Email Body) *' : 'Email Body Content *'}
                </label>
                <textarea
                  value={campaignContent}
                  onChange={(e) => setCampaignContent(e.target.value)}
                  rows={5}
                  placeholder={
                    language === 'ar'
                      ? 'اكتب رسالة العميل، تفاصيل العرض، الروابط، أو التحية الخاصة...'
                      : 'Write your newsletter announcements, collection links, and custom copy...'
                  }
                  required
                  className="w-full border border-[#c4c7c7] rounded-xl py-2.5 px-3.5 bg-white text-[#000000] focus:outline-none focus:border-[#000000]"
                />
              </div>

              <div>
                <label className="block font-label-caps text-[11px] font-bold text-[#000000] mb-1">
                  {language === 'ar' ? 'إرفاق كود خصم حصري (اختياري)' : 'Attach Promo Code (Optional)'}
                </label>
                <select
                  value={campaignPromo}
                  onChange={(e) => setCampaignPromo(e.target.value)}
                  className="w-full border border-[#c4c7c7] rounded-xl py-2.5 px-3.5 bg-white text-[#000000]"
                >
                  <option value="">{language === 'ar' ? '— بدون كود خصم —' : '— No Promo Code —'}</option>
                  {promoCodes.map((p) => (
                    <option key={p.id} value={p.code}>
                      {p.code} ({p.discountPercent}% خصم - {p.descriptionAr || p.description})
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-[#f3f4f6] border border-[#d1d5db] rounded-xl p-3.5 text-[12px] text-[#374151] space-y-1">
                <span className="font-bold flex items-center gap-1 text-[#000000]">
                  <span className="material-symbols-outlined text-[16px]">info</span>
                  {language === 'ar' ? 'كيفية الإرسال الفعلي:' : 'How Actual Sending Works:'}
                </span>
                <p>
                  {language === 'ar'
                    ? 'عند الضغط على إرسال، سيتم تسجيل الحملة وفتح نافذة إنشاء رسالة في Gmail تلقائياً مع وضع كافة إيميلات المشتركين في خانة BCC السرية للحفاظ على خصوصيتهم وإرسالها لهم مباشرة.'
                    : 'Clicking Send will log the campaign and automatically open Gmail compose with all active subscriber emails prefilled in BCC.'}
                </p>
              </div>

              <div className="pt-4 border-t border-[#c4c7c7]/30 flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsBroadcastModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-[#c4c7c7] text-[#000000] font-label-caps font-bold hover:bg-[#f3f3f4] text-[13px] cursor-pointer"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={sendingBroadcast}
                  className="bg-[#000000] text-white px-7 py-2.5 rounded-xl font-label-caps font-bold hover:bg-[#2f3131] text-[13px] transition-all cursor-pointer shadow-md flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">forward_to_inbox</span>
                  <span>
                    {sendingBroadcast
                      ? (language === 'ar' ? 'جاري الإرسال...' : 'Sending...')
                      : (language === 'ar' ? `إرسال وحفظ (${subscribers.length} مشترك)` : `Send & Save (${subscribers.length} clients)`)}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
