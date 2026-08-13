import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { useLanguage } from '../context/LanguageContext';
import { getUserOrders, SavedOrder, logOut, saveProductReview, FirestoreReviewData, safeJsonStringify } from '../firebase';
import { uploadToCloudinary } from '../utils/cloudinary';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSignInGoogle: () => Promise<void>;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  user,
  onSignInGoogle,
}) => {
  const { language, formatPrice, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'vip'>('orders');
  const [orders, setOrders] = useState<SavedOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Custom User Profile Photo state
  const [customPhoto, setCustomPhoto] = useState<string>('');

  const defaultAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600';
  const currentDisplayPhoto = customPhoto || user?.photoURL || defaultAvatar;

  useEffect(() => {
    if (user) {
      const savedPhoto = localStorage.getItem(`maison_user_photo_${user.uid}`);
      if (savedPhoto) {
        setCustomPhoto(savedPhoto);
      } else {
        setCustomPhoto(user.photoURL || '');
      }
    } else {
      setCustomPhoto('');
    }
  }, [user]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert(
        language === 'ar'
          ? 'حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 10 ميجابايت'
          : 'Image is too large. Please select an image under 10MB.'
      );
      return;
    }

    try {
      const url = await uploadToCloudinary(file, { folder: 'touza_users' });
      if (url) {
        setCustomPhoto(url);
        if (user) {
          localStorage.setItem(`maison_user_photo_${user.uid}`, url);
        }
      }
    } catch (err) {
      console.error('Cloudinary profile photo upload failed:', err);
    }
  };

  const handleResetPhoto = () => {
    setCustomPhoto('');
    if (user) {
      localStorage.removeItem(`maison_user_photo_${user.uid}`);
    }
  };

  // Review modal state inside account
  const [reviewItem, setReviewItem] = useState<{
    productId: string;
    productTitle: string;
    orderNumber: string;
  } | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccessMessage, setReviewSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      const cacheKey = `maison_orders_${user.uid}`;
      let hasCache = false;
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setOrders(parsed);
            setLoadingOrders(false);
            hasCache = true;
          }
        }
      } catch (e) {
        console.warn('Failed to parse cached user orders', e);
      }

      if (!hasCache) {
        setLoadingOrders(true);
      }

      getUserOrders(user.uid)
        .then((data) => {
          setOrders(data);
          try {
            localStorage.setItem(cacheKey, safeJsonStringify(data));
          } catch (e) {
            console.error('Failed to save orders cache', e);
          }
        })
        .catch((err) => {
          console.error('Failed to load orders:', err);
        })
        .finally(() => {
          setLoadingOrders(false);
        });
    } else {
      setOrders([]);
    }
  }, [isOpen, user]);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'delivered':
        return {
          labelAr: 'تم التوصيل بنجاح ✓',
          labelEn: 'Delivered ✓',
          badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          stepIndex: 3,
        };
      case 'shipped':
        return {
          labelAr: 'تم الشحن وفي الطريق 🚚',
          labelEn: 'Shipped & En Route 🚚',
          badgeBg: 'bg-purple-100 text-purple-900 border-purple-300',
          stepIndex: 2,
        };
      case 'processing':
        return {
          labelAr: 'جاري التحضير والتجهيز ✂️',
          labelEn: 'Processing ✂️',
          badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
          stepIndex: 1,
        };
      case 'cancelled':
        return {
          labelAr: 'تم إلغاء الطلب ✕',
          labelEn: 'Order Cancelled ✕',
          badgeBg: 'bg-red-100 text-red-800 border-red-300',
          stepIndex: -1,
        };
      case 'confirmed':
      case 'pending':
      default:
        return {
          labelAr: 'مؤكد ومسجل 📋',
          labelEn: 'Order Confirmed 📋',
          badgeBg: 'bg-blue-100 text-blue-900 border-blue-300',
          stepIndex: 0,
        };
    }
  };

  if (!isOpen) return null;

  const handleGoogleAuth = async () => {
    setIsSigningIn(true);
    try {
      await onSignInGoogle();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logOut();
      setOrders([]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenReviewModal = (productId: string, productTitle: string, orderNumber: string) => {
    setReviewItem({ productId, productTitle, orderNumber });
    setRating(5);
    setComment('');
    setReviewSuccessMessage(null);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !reviewItem || !comment.trim()) return;

    setIsSubmittingReview(true);
    try {
      const reviewData: FirestoreReviewData = {
        productId: reviewItem.productId,
        productTitle: reviewItem.productTitle,
        orderNumber: reviewItem.orderNumber,
        rating,
        comment: comment.trim(),
        userId: user.uid,
        userName: user.displayName || user.email || (language === 'ar' ? 'عميل توزا' : 'TOUZA Client'),
        userPhoto: currentDisplayPhoto,
      };

      await saveProductReview(reviewData);
      setReviewSuccessMessage(
        language === 'ar' ? 'تم تقديم تقييمك بنجاح! شكراً لمشاركتك رأيك.' : 'Review submitted successfully! Thank you for your feedback.'
      );
      setTimeout(() => {
        setReviewItem(null);
        setReviewSuccessMessage(null);
      }, 2000);
    } catch (error) {
      console.error('Failed to submit review:', error);
      alert(language === 'ar' ? 'حدث خطأ أثناء حفظ التقييم. يرجى المحاولة مرة أخرى.' : 'Failed to save review. Please try again.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#ffffff] max-w-xl w-full rounded-2xl p-6 md:p-8 relative shadow-2xl space-y-6 fade-in-up border border-[#c4c7c7]/30">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-[#c4c7c7]/30 pb-4">
          <div>
            <span className="font-label-caps text-[11px] text-[#747878]">
              {language === 'ar' ? 'حساب العميل' : 'TOUZA STORE Client Portal'}
            </span>
            <h2 className="font-display text-[26px] text-[#000000] font-bold">
              {language === 'ar' ? 'حساب TOUZA STORE' : 'TOUZA STORE Account'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#000000] hover:bg-[#f3f3f4] rounded-full transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        {/* Content depending on login state */}
        {!user ? (
          /* Not Logged In View */
          <div className="py-8 px-4 text-center space-y-6">
            <div className="w-20 h-20 bg-[#f3f3f4] rounded-full flex items-center justify-center mx-auto shadow-inner">
              <span className="material-symbols-outlined text-[42px] text-[#000000]">account_circle</span>
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h3 className="font-display text-[22px] text-[#000000] font-bold">
                {language === 'ar' ? 'سجّل الدخول لمتابعة طلباتك' : 'Sign in to access your orders'}
              </h3>
              <p className="font-body text-[14px] text-[#444748] leading-relaxed">
                {language === 'ar'
                  ? 'قم بتسجيل الدخول بواسطة حساب Google الخاص بك لعرض جميع طلباتك السابقة وسجل مشترياتك بأمان تام ومحفوظة لحسابك فقط.'
                  : 'Sign in with your Google account to view order history, track deliveries, and keep your data safe.'}
              </p>
            </div>

            <button
              onClick={handleGoogleAuth}
              disabled={isSigningIn}
              className="w-full max-w-sm mx-auto flex items-center justify-center gap-3 bg-[#ffffff] text-[#1f1f1f] border border-[#747878]/30 py-3.5 px-6 rounded-xl font-body text-[15px] font-bold hover:bg-[#f8f9fa] hover:border-[#000000] transition-all cursor-pointer shadow-sm"
            >
              {/* Google Colored Logo */}
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.1 0-5.74-2.09-6.68-4.92H1.21v3.15C3.21 21.36 7.32 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.32 14.28c-.24-.72-.38-1.49-.38-2.28s.14-1.56.38-2.28V6.57H1.21C.44 8.11 0 9.99 0 12s.44 3.89 1.21 5.43l4.11-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.32 0 3.21 2.64 1.21 6.57l4.11 3.15c.94-2.83 3.58-4.92 6.68-4.92z"
                />
              </svg>
              <span>
                {isSigningIn
                  ? language === 'ar' ? 'جاري الاتصال بـ Google...' : 'Connecting to Google...'
                  : language === 'ar' ? 'متابعة باستخدام Google' : 'Continue with Google'}
              </span>
            </button>
          </div>
        ) : (
          /* Logged In View */
          <div className="space-y-6">
            {/* User Profile Bar */}
            <div className="p-4 bg-[#f3f3f4] rounded-xl flex items-center justify-between border border-[#c4c7c7]/30">
              <div className="flex items-center gap-3">
                <div className="relative group shrink-0">
                  <img
                    src={currentDisplayPhoto}
                    alt={user.displayName || 'User'}
                    className="w-13 h-13 rounded-full border-2 border-white shadow-xs object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = defaultAvatar;
                    }}
                  />
                  <label
                    htmlFor="header-photo-upload"
                    className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title={language === 'ar' ? 'تغيير الصورة الشخصية' : 'Change Profile Picture'}
                  >
                    <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                  </label>
                  <input
                    id="header-photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>
                <div>
                  <h3 className="font-display text-[16px] text-[#000000] font-bold">
                    {user.displayName || (language === 'ar' ? 'عميل مميز' : 'Valued Client')}
                  </h3>
                  <p className="font-body text-[13px] text-[#747878] truncate max-w-[220px] sm:max-w-xs">
                    {user.email}
                  </p>
                </div>
              </div>

              <button
                onClick={handleSignOut}
                className="font-label-caps text-[12px] text-[#ba1a1a] hover:underline cursor-pointer border border-[#ba1a1a]/30 px-3 py-1.5 rounded-lg hover:bg-[#ba1a1a]/5 transition-colors"
              >
                {language === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}
              </button>
            </div>

            {/* Tab selector */}
            <div className="flex border-b border-[#c4c7c7]/30 font-label-caps text-[12px]">
              <button
                onClick={() => setActiveTab('orders')}
                className={`pb-3 px-4 transition-colors cursor-pointer ${
                  activeTab === 'orders'
                    ? 'border-b-2 border-[#000000] font-bold text-[#000000]'
                    : 'text-[#747878] hover:text-[#000000]'
                }`}
              >
                {language === 'ar' ? `سجل الطلبات (${orders.length})` : `Order History (${orders.length})`}
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`pb-3 px-4 transition-colors cursor-pointer ${
                  activeTab === 'profile'
                    ? 'border-b-2 border-[#000000] font-bold text-[#000000]'
                    : 'text-[#747878] hover:text-[#000000]'
                }`}
              >
                {language === 'ar' ? 'بيانات الحساب' : 'Profile Details'}
              </button>
              <button
                onClick={() => setActiveTab('vip')}
                className={`pb-3 px-4 transition-colors cursor-pointer ${
                  activeTab === 'vip'
                    ? 'border-b-2 border-[#000000] font-bold text-[#000000]'
                    : 'text-[#747878] hover:text-[#000000]'
                }`}
              >
                {language === 'ar' ? 'العضوية والامتيازات' : 'VIP Privilege'}
              </button>
            </div>

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-4 max-h-[340px] overflow-y-auto pr-1">
                {loadingOrders ? (
                  <div className="py-8 text-center text-[#747878] font-body text-[14px]">
                    {language === 'ar' ? 'جاري تحميل الطلبات الخاص بك...' : 'Loading your orders...'}
                  </div>
                ) : orders.length === 0 ? (
                  <div className="py-10 text-center space-y-2 bg-[#f9f9f9] rounded-xl p-6 border border-[#c4c7c7]/20">
                    <span className="material-symbols-outlined text-[36px] text-[#c4c7c7]">
                      shopping_bag
                    </span>
                    <p className="font-display text-[18px] text-[#000000] font-bold">
                      {language === 'ar' ? 'لا توجد طلبات سابقة' : 'No previous orders'}
                    </p>
                    <p className="font-body text-[13px] text-[#747878]">
                      {language === 'ar'
                        ? 'عند قيامك بطلب أي منتجات، ستظهر جميع تفاصيل شحناتك هنا حصرياً.'
                        : 'Your order details and tracking history will appear here once placed.'}
                    </p>
                  </div>
                ) : (
                  orders.map((ord) => {
                    const statusInfo = getStatusInfo(ord.status);
                    return (
                      <div
                        key={ord.id}
                        className="p-4 bg-[#f9f9f9] border border-[#c4c7c7]/30 rounded-xl space-y-3.5 shadow-2xs"
                      >
                        <div className="flex justify-between items-start border-b border-[#c4c7c7]/20 pb-3">
                          <div>
                            <p className="font-label-caps text-[#000000] font-bold text-[14px] dir-ltr">
                              {ord.orderNumber}
                            </p>
                            <p className="font-body text-[12px] text-[#747878]">
                              {ord.createdAt?.toDate
                                ? new Date(ord.createdAt.toDate()).toLocaleDateString(
                                    language === 'ar' ? 'ar-EG' : 'en-US'
                                  )
                                : language === 'ar' ? 'اليوم' : 'Today'}
                            </p>
                          </div>
                          <div className="text-right">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-lg text-[11px] font-label-caps font-bold border ${statusInfo.badgeBg}`}
                            >
                              {language === 'ar' ? statusInfo.labelAr : statusInfo.labelEn}
                            </span>
                            <p className="font-body font-bold text-[#000000] mt-1 dir-ltr text-[15px]">
                              {formatPrice(ord.total)}
                            </p>
                          </div>
                        </div>

                        {/* Order Tracking Progress Stepper */}
                        {ord.status === 'cancelled' ? (
                          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-[12px] font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">cancel</span>
                            <span>{language === 'ar' ? 'تم إلغاء هذا الطلب.' : 'This order was cancelled.'}</span>
                          </div>
                        ) : (
                          <div className="py-2.5 px-3 bg-white border border-[#c4c7c7]/30 rounded-xl">
                            <div className="text-[11px] font-label-caps text-[#747878] mb-2 flex justify-between items-center">
                              <span>{language === 'ar' ? 'تتبع حالة الشحنة:' : 'Order Tracking:'}</span>
                              <span className="font-bold text-[#000000]">
                                {language === 'ar' ? statusInfo.labelAr : statusInfo.labelEn}
                              </span>
                            </div>

                            <div className="grid grid-cols-4 gap-1 relative pt-1">
                              {[
                                { titleAr: 'مؤكد', titleEn: 'Confirmed', icon: 'receipt_long' },
                                { titleAr: 'تحضير', titleEn: 'Preparing', icon: 'package_2' },
                                { titleAr: 'تم الشحن', titleEn: 'Shipped', icon: 'local_shipping' },
                                { titleAr: 'تم التوصيل', titleEn: 'Delivered', icon: 'home_pin' },
                              ].map((st, sIdx) => {
                                const isPassed = statusInfo.stepIndex >= sIdx;
                                const isCurrent = statusInfo.stepIndex === sIdx;
                                return (
                                  <div key={sIdx} className="flex flex-col items-center text-center relative z-10">
                                    <div
                                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                                        isCurrent
                                          ? 'bg-[#000000] text-white ring-4 ring-black/10 scale-110 font-bold shadow-xs'
                                          : isPassed
                                          ? 'bg-emerald-600 text-white font-bold'
                                          : 'bg-[#f3f3f4] text-[#a0a0a0] border border-[#c4c7c7]/40'
                                      }`}
                                    >
                                      <span className="material-symbols-outlined text-[14px]">{st.icon}</span>
                                    </div>
                                    <span
                                      className={`text-[10px] mt-1 font-label-caps leading-tight ${
                                        isCurrent
                                          ? 'font-bold text-[#000000]'
                                          : isPassed
                                          ? 'font-semibold text-emerald-800'
                                          : 'text-[#a0a0a0]'
                                      }`}
                                    >
                                      {language === 'ar' ? st.titleAr : st.titleEn}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Items list */}
                        <div className="space-y-2 pt-1">
                          {ord.items.map((item, idx) => (
                            <div key={idx} className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:items-center text-[13px] font-body bg-white p-2.5 rounded-lg border border-[#c4c7c7]/20">
                              <div className="flex gap-3 items-center flex-1 min-w-0">
                                {item.image && (
                                  <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-10 h-12 object-cover rounded bg-[#f3f3f4] shrink-0"
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-[#000000] font-medium truncate">{item.title}</p>
                                  <p className="text-[#747878] text-[11px]">
                                    {item.selectedColor} | {item.selectedSize} × {item.quantity}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-[#c4c7c7]/10">
                                <span className="text-[#000000] font-semibold dir-ltr">
                                  {formatPrice(item.price * item.quantity)}
                                </span>
                                <button
                                  onClick={() => handleOpenReviewModal(item.productId, item.title, ord.orderNumber)}
                                  className="bg-[#000000] text-white hover:bg-[#2f3131] px-2.5 py-1 rounded text-[11px] font-label-caps font-bold transition-all flex items-center gap-1 cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-[14px]">star</span>
                                  {language === 'ar' ? 'تقييم القطعة' : 'Write Review'}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="pt-2 border-t border-[#c4c7c7]/20 text-[12px] font-body text-[#5e5e5c] flex justify-between">
                          <span>{ord.shippingAddress?.street}, {ord.shippingAddress?.city}</span>
                          <span>{ord.paymentMethod === 'credit_card' ? (language === 'ar' ? 'الدفع عند الاستلام' : 'Cash on Delivery') : 'Card'}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-5 font-body text-[15px] text-[#444748]">
                {/* Photo Management Box */}
                <div className="bg-[#f9f9f9] p-5 rounded-2xl border border-[#c4c7c7]/30 flex flex-col sm:flex-row items-center gap-5">
                  <div className="relative group shrink-0">
                    <img
                      src={currentDisplayPhoto}
                      alt={user.displayName || 'User Photo'}
                      className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = defaultAvatar;
                      }}
                    />
                    <label
                      htmlFor="tab-photo-upload"
                      className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      title={language === 'ar' ? 'رفع صورة جديدة' : 'Upload New Photo'}
                    >
                      <span className="material-symbols-outlined text-[24px]">photo_camera</span>
                    </label>
                  </div>

                  <div className="space-y-2 text-center sm:text-start flex-1">
                    <h4 className="font-display font-bold text-[#000000] text-[16px]">
                      {language === 'ar' ? 'الصورة الشخصية للتقييمات' : 'Profile Avatar for Reviews'}
                    </h4>
                    <p className="text-[12px] text-[#747878] leading-relaxed">
                      {language === 'ar'
                        ? 'يمكنك رفع صورا خاصة بك. تظهر هذه الصورة تلقائياً عند كتابتك لأي تقييم على منتجاتنا، وفي حال عدم رفع صورة يتم استخدام الصورة الافتراضية الأتوماتيكية.'
                        : 'Upload your own custom photo. This photo will automatically appear when writing product reviews. If not provided, an automatic avatar is used.'}
                    </p>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                      <label
                        htmlFor="tab-photo-upload"
                        className="bg-[#000000] text-white hover:bg-[#2f3131] px-4 py-2 rounded-xl text-[12px] font-label-caps font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                      >
                        <span className="material-symbols-outlined text-[16px]">upload</span>
                        <span>{language === 'ar' ? 'رفع صورة جديدة' : 'Upload Photo'}</span>
                      </label>
                      <input
                        id="tab-photo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />

                      {customPhoto && (
                        <button
                          type="button"
                          onClick={handleResetPhoto}
                          className="bg-white text-[#ba1a1a] border border-[#ba1a1a]/30 hover:bg-[#ba1a1a]/5 px-3 py-2 rounded-xl text-[12px] font-label-caps font-bold transition-all cursor-pointer flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                          <span>{language === 'ar' ? 'حذف واستعادة الافتراضية' : 'Reset Photo'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Account Info Box */}
                <div className="bg-[#f9f9f9] p-4 rounded-xl border border-[#c4c7c7]/30 space-y-3">
                  <div className="flex justify-between py-2 border-b border-[#c4c7c7]/20">
                    <span className="font-label-caps text-[11px] text-[#747878]">
                      {language === 'ar' ? 'اسم الحساب' : 'Account Name'}
                    </span>
                    <span className="font-medium text-[#000000]">{user.displayName || '—'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#c4c7c7]/20">
                    <span className="font-label-caps text-[11px] text-[#747878]">
                      {language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                    </span>
                    <span className="font-medium text-[#000000] dir-ltr">{user.email}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#c4c7c7]/20">
                    <span className="font-label-caps text-[11px] text-[#747878]">
                      {language === 'ar' ? 'معرف المستخدم (UID)' : 'Account User ID'}
                    </span>
                    <span className="font-mono text-[12px] text-[#747878] dir-ltr truncate max-w-[180px]">
                      {user.uid}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* VIP Tab */}
            {activeTab === 'vip' && (
              <div className="p-6 bg-[#000000] text-white rounded-xl text-center space-y-3 shadow-lg">
                <span className="material-symbols-outlined text-[36px] text-[#D8D8D8]">
                  workspace_premium
                </span>
                <h3 className="font-display text-[22px] font-bold">
                  {language === 'ar' ? 'عضوية عائلة توزا' : 'TOUZA VIP Club Status'}
                </h3>
                <p className="font-body text-[13px] text-white/80 leading-relaxed">
                  {language === 'ar'
                    ? 'بكونك مسجلاً بحساب Google، تتمتع بمعاينة التشكيلات الجديدة قبل طرحها رسميًا مع خدمة توصيل مجانية وسريعة.'
                    : 'As a verified Google client, enjoy private atelier previews and dedicated fashion concierge services.'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Review Dialog Sub-modal */}
        {reviewItem && (
          <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-[#c4c7c7]/30 space-y-4 fade-in-up">
              <div className="flex justify-between items-center border-b border-[#c4c7c7]/30 pb-3">
                <h3 className="font-display text-[20px] font-bold text-[#000000]">
                  {language === 'ar' ? 'تقييم المنتج' : 'Review Product'}
                </h3>
                <button
                  onClick={() => setReviewItem(null)}
                  className="p-1 rounded-full text-[#747878] hover:bg-[#f3f3f4]"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <p className="font-body text-[14px] font-semibold text-[#000000]">
                {reviewItem.productTitle}
              </p>

              {reviewSuccessMessage ? (
                <div className="p-4 bg-[#2e7d32]/10 border border-[#2e7d32]/30 text-[#2e7d32] rounded-xl font-body text-[14px] text-center font-bold">
                  {reviewSuccessMessage}
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <label className="block font-label-caps text-[12px] text-[#747878] mb-1.5">
                      {language === 'ar' ? 'اختر التقييم (من 1 إلى 5 نجوم)' : 'Select Rating (1 to 5 Stars)'}
                    </label>
                    <div className="flex gap-2 items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setRating(star)}
                          className="text-[28px] focus:outline-none transition-transform hover:scale-110 cursor-pointer"
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{
                              fontVariationSettings: star <= rating ? "'FILL' 1" : "'FILL' 0",
                              color: star <= rating ? '#f59e0b' : '#d1d5db',
                            }}
                          >
                            star
                          </span>
                        </button>
                      ))}
                      <span className="font-body text-[14px] text-[#000000] font-bold ml-2">
                        {rating} / 5
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block font-label-caps text-[12px] text-[#747878] mb-1.5">
                      {language === 'ar' ? 'رأيك في المنتج والخامة والتجربة' : 'Your Review & Experience'}
                    </label>
                    <textarea
                      rows={3}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder={
                        language === 'ar'
                          ? 'اكتب رأيك بصراحة عن جودة القماش، المقاس، والسرعة...'
                          : 'Share your thoughts on sizing, fabric quality, craftsmanship...'
                      }
                      required
                      className="w-full p-3 border border-[#c4c7c7] rounded-xl font-body text-[14px] focus:outline-none focus:border-[#000000]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingReview || !comment.trim()}
                    className="w-full bg-[#000000] text-white py-3 rounded-xl font-label-caps text-[14px] font-bold hover:bg-[#2f3131] transition-colors cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    {isSubmittingReview
                      ? language === 'ar' ? 'جاري الحفظ...' : 'Saving...'
                      : language === 'ar' ? 'نشر التقييم' : 'Submit Review'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
