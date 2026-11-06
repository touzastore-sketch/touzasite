import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Check,
  Banknote,
  Landmark,
  Smartphone,
  PhoneCall,
  CheckCircle,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { CartItem, ShippingAddress, StoreSettings, PromoCode } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { getLocalizedProductName } from '../data/products';
import { saveUserOrder, safeJsonStringify } from '../firebase';
import { trackTikTokInitiateCheckout, trackTikTokPurchase } from '../utils/tiktokPixel';
import { getWhatsAppOrderUrl, WhatsAppOrderDetails, formatWhatsAppNumber } from '../utils/whatsapp';

interface CheckoutViewProps {
  cartItems: CartItem[];
  onBackToShop: () => void;
  onClearCart: () => void;
  user: User | null;
  onSignInGoogle?: () => Promise<void>;
  onOpenAccountModal?: () => void;
  storeSettings?: StoreSettings;
  promoCodes?: PromoCode[];
  onUsePromoCode?: (promoId: string) => Promise<void>;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  cartItems,
  onBackToShop,
  onClearCart,
  user,
  storeSettings,
  promoCodes = [],
  onUsePromoCode,
}) => {
  const { language, formatPrice, t } = useLanguage();
  const [step, setStep] = useState<'shipping' | 'payment' | 'confirmation'>('shipping');
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromoCode, setAppliedPromoCode] = useState<PromoCode | null>(null);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountFixedAmount, setDiscountFixedAmount] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Customer Shipping & Contact Information (No password or email required)
  const [address, setAddress] = useState<ShippingAddress>({
    fullName: user?.displayName || '',
    street: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
    country: language === 'ar' ? 'مصر' : 'Egypt',
    phone: '',
  });

  const [orderNotes, setOrderNotes] = useState('');

  // Payment method: 'cod' | 'instapay' | 'vodafone_cash' | 'orange_cash'
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'instapay' | 'vodafone_cash' | 'orange_cash'>('cod');
  const [transferRef, setTransferRef] = useState('');

  const [liveSettings, setLiveSettings] = useState<StoreSettings | undefined>(storeSettings);

  useEffect(() => {
    if (storeSettings) {
      setLiveSettings(storeSettings);
    }
  }, [storeSettings]);

  useEffect(() => {
    const handleSettingsUpdate = (e: any) => {
      if (e.detail) {
        setLiveSettings(e.detail);
      }
    };
    window.addEventListener('touza_settings_updated', handleSettingsUpdate);
    return () => window.removeEventListener('touza_settings_updated', handleSettingsUpdate);
  }, []);

  const activeSettings = liveSettings || (() => {
    try {
      const saved = localStorage.getItem('maison_settings_v4') || localStorage.getItem('maison_settings');
      return saved ? JSON.parse(saved) : undefined;
    } catch {
      return undefined;
    }
  })();

  // Auto-switch payment method if current is disabled in store settings
  useEffect(() => {
    const isCodEnabled = activeSettings?.enableCashOnDelivery !== false;
    const isInstaPayEnabled = activeSettings?.enableInstaPay !== false;
    const isVodaEnabled = activeSettings?.enableVodafoneCash !== false;
    const isOrangeEnabled = activeSettings?.enableOrangeCash !== false;

    if (paymentMethod === 'cod' && !isCodEnabled) {
      if (isInstaPayEnabled) setPaymentMethod('instapay');
      else if (isVodaEnabled) setPaymentMethod('vodafone_cash');
      else if (isOrangeEnabled) setPaymentMethod('orange_cash');
    } else if (paymentMethod === 'instapay' && !isInstaPayEnabled) {
      if (isCodEnabled) setPaymentMethod('cod');
      else if (isVodaEnabled) setPaymentMethod('vodafone_cash');
      else if (isOrangeEnabled) setPaymentMethod('orange_cash');
    } else if (paymentMethod === 'vodafone_cash' && !isVodaEnabled) {
      if (isCodEnabled) setPaymentMethod('cod');
      else if (isInstaPayEnabled) setPaymentMethod('instapay');
      else if (isOrangeEnabled) setPaymentMethod('orange_cash');
    } else if (paymentMethod === 'orange_cash' && !isOrangeEnabled) {
      if (isCodEnabled) setPaymentMethod('cod');
      else if (isInstaPayEnabled) setPaymentMethod('instapay');
      else if (isVodaEnabled) setPaymentMethod('vodafone_cash');
    }
  }, [activeSettings, paymentMethod]);

  const [orderNumber, setOrderNumber] = useState('');
  const [whatsappOrderUrl, setWhatsappOrderUrl] = useState('');

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  const discountAmount = discountFixedAmount > 0
    ? Math.min(subtotal, discountFixedAmount)
    : (subtotal * discountPercent) / 100;

  const isFreeShipping = activeSettings?.shippingFree !== false && (Number(activeSettings?.shippingFee) <= 0 || activeSettings?.shippingFee === undefined);
  const shipping = isFreeShipping ? 0 : (Number(activeSettings?.shippingFee) || 0);
  const total = Math.max(0, subtotal - discountAmount + shipping);

  // Trigger TikTok InitiateCheckout event once on mounting CheckoutView
  useEffect(() => {
    if (cartItems && cartItems.length > 0) {
      trackTikTokInitiateCheckout(cartItems, total, 'EGP');
    }
  }, []);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    setPromoSuccess('');

    const query = promoCode.trim().toUpperCase();
    if (!query) {
      setPromoError(language === 'ar' ? 'يرجى إدخال رمز الخصم' : 'Please enter promo code');
      return;
    }

    const found = promoCodes.find((p) => p.code.trim().toUpperCase() === query);

    if (!found) {
      if (query === 'ELEGAN10' || query === 'WELCOME10' || query === 'TOUZA10') {
        setDiscountPercent(10);
        setDiscountFixedAmount(0);
        setAppliedPromoCode(null);
        setPromoSuccess(language === 'ar' ? 'تم تطبيق خصم 10% بنجاح!' : '10% Discount Applied!');
        return;
      }
      setDiscountPercent(0);
      setDiscountFixedAmount(0);
      setAppliedPromoCode(null);
      setPromoError(language === 'ar' ? 'كود غير صحيح. يرجى التأكد وإعادة المحاولة' : 'Invalid promo code');
      return;
    }

    if (!found.isActive) {
      setDiscountPercent(0);
      setDiscountFixedAmount(0);
      setAppliedPromoCode(null);
      setPromoError(language === 'ar' ? 'هذا الكود غير فعّال حالياً' : 'This promo code is currently inactive');
      return;
    }

    const currentUses = found.usedCount || 0;
    const limit = found.maxUses || 0;

    if (limit > 0 && currentUses >= limit) {
      setDiscountPercent(0);
      setDiscountFixedAmount(0);
      setAppliedPromoCode(null);
      setPromoError(
        language === 'ar'
          ? `عذراً، هذا الكود استنفذ الحد الأقصى لعدد العملاء (${limit} عميل)`
          : `Sorry, this promo code has reached its maximum limit (${limit})`
      );
      return;
    }

    const isFixed = found.discountType === 'fixed' || (Boolean(found.discountAmount) && !found.discountPercent);

    if (isFixed) {
      const amountVal = found.discountAmount || found.discountPercent || 0;
      setDiscountFixedAmount(amountVal);
      setDiscountPercent(0);
      setAppliedPromoCode(found);
      setPromoSuccess(
        language === 'ar'
          ? `تم تطبيق خصم ${amountVal} ج.م بنجاح!`
          : `${amountVal} EGP Discount Applied!`
      );
    } else {
      const percentVal = found.discountPercent || found.discountAmount || 0;
      setDiscountPercent(percentVal);
      setDiscountFixedAmount(0);
      setAppliedPromoCode(found);
      setPromoSuccess(
        language === 'ar'
          ? `تم تطبيق خصم ${percentVal}% بنجاح!`
          : `${percentVal}% Discount Applied!`
      );
    }
  };

  const handleProceedToPayment = () => {
    setSubmitError('');
    if (!address.fullName.trim() || !address.phone.trim() || !address.street.trim() || !address.city.trim()) {
      setSubmitError(
        language === 'ar'
          ? 'يرجى ملء بيانات التوصيل الأساسية (الاسم، رقم الموبايل، المحافظة، والعنوان) للمتابعة.'
          : 'Please fill in all required shipping details (Full Name, Phone, City, and Address).'
      );
      return;
    }
    setStep('payment');
  };

  const handlePlaceOrder = async () => {
    setSubmitError('');

    if (!address.fullName.trim() || !address.phone.trim() || !address.street.trim() || !address.city.trim()) {
      setSubmitError(
        language === 'ar'
          ? 'يرجى ملء بيانات التوصيل (الاسم ورقم الهاتف والعنوان والمحافظة).'
          : 'Please complete your shipping details.'
      );
      setStep('shipping');
      return;
    }

    if ((paymentMethod === 'instapay' || paymentMethod === 'vodafone_cash' || paymentMethod === 'orange_cash') && !transferRef.trim()) {
      setSubmitError(
        language === 'ar'
          ? 'يرجى إدخال رقم الهاتف أو رقم العملية المحول منها للتحقق من التحويل.'
          : 'Please enter the transfer sender phone number or reference ID.'
      );
      return;
    }

    setIsSubmitting(true);
    const generatedOrderNum = 'TZ-EG-' + Math.floor(100000 + Math.random() * 900000);

    const paymentLabel =
      paymentMethod === 'cod'
        ? 'الدفع عند الاستلام (كاش)'
        : paymentMethod === 'instapay'
        ? `إنستا باي (InstaPay) - المحول: ${transferRef}`
        : paymentMethod === 'vodafone_cash'
        ? `فودافون كاش (Vodafone Cash) - المحول: ${transferRef}`
        : `أورانج كاش (Orange Cash) - المحول: ${transferRef}`;

    // Target store WhatsApp number
    const storeWhatsapp = activeSettings?.whatsappNumber || '01070606272';

    const orderPayload: WhatsAppOrderDetails = {
      orderNumber: generatedOrderNum,
      customerName: address.fullName.trim(),
      customerPhone: address.phone.trim(),
      governorate: address.city.trim(),
      address: address.street.trim(),
      apartment: address.apartment?.trim(),
      notes: orderNotes.trim(),
      items: cartItems.map((item) => ({
        title: getLocalizedProductName(item.product, language),
        selectedColor: item.selectedColor,
        selectedSize: item.selectedSize,
        quantity: item.quantity,
        price: item.product.price,
      })),
      subtotal,
      discountAmount,
      promoCode: appliedPromoCode?.code || (discountPercent > 0 ? `${discountPercent}%` : undefined),
      shippingFee: shipping,
      total,
      paymentMethod: paymentLabel,
    };

    const generatedWaUrl = getWhatsAppOrderUrl(storeWhatsapp, orderPayload);

    try {
      if (appliedPromoCode && onUsePromoCode) {
        try {
          await onUsePromoCode(appliedPromoCode.id);
        } catch (pErr) {
          console.warn('Failed to increment promo code usage count:', pErr);
        }
      }

      // Save order to Firestore so it appears in the store owner's Admin Dashboard
      await saveUserOrder(user?.uid, user?.email, {
        orderNumber: generatedOrderNum,
        items: cartItems.map((item) => {
          const colorObj = item.product.colors?.find((c) => c.name === item.selectedColor);
          const rawImg = colorObj?.imageUrl || (item.product.images && item.product.images.length > 0 ? item.product.images[0] : '') || '';
          return {
            productId: item.product.id,
            title: getLocalizedProductName(item.product, language),
            price: item.product.price,
            quantity: item.quantity,
            selectedColor: item.selectedColor,
            selectedSize: item.selectedSize,
            image: rawImg,
          };
        }),
        subtotal,
        discountAmount,
        shipping,
        total,
        status: 'confirmed',
        shippingAddress: {
          fullName: address.fullName,
          street: address.street,
          apartment: address.apartment || '',
          city: address.city,
          state: address.state || '',
          zipCode: address.zipCode || '',
          country: address.country,
          phone: address.phone,
          notes: orderNotes.trim(),
        },
        paymentMethod: paymentLabel,
        notes: orderNotes.trim(),
        promoCode: appliedPromoCode?.code || (discountPercent > 0 ? `${discountPercent}%` : undefined),
        isWhatsAppOrder: true,
      });

      // Track TikTok Purchase
      try {
        trackTikTokPurchase({
          orderNumber: generatedOrderNum,
          items: cartItems.map((item) => ({
            productId: item.product.id,
            title: getLocalizedProductName(item.product, language),
            price: item.product.price,
            quantity: item.quantity,
          })),
          total: total,
          currency: 'EGP',
        });
      } catch (ttErr) {
        console.debug('TikTok Pixel purchase error:', ttErr);
      }

      setOrderNumber(generatedOrderNum);
      setWhatsappOrderUrl(generatedWaUrl);
      setStep('confirmation');
      onClearCart();

      // Automatically open WhatsApp in a new window/tab
      try {
        const opened = window.open(generatedWaUrl, '_blank');
        if (!opened) {
          window.location.href = generatedWaUrl;
        }
      } catch {
        // Fallback handled by direct button in confirmation view
      }
    } catch (err: any) {
      console.error('Failed to save order to Firestore:', err);
      // Even if Firestore has transient error, proceed with WhatsApp transmission so the customer is never blocked
      setOrderNumber(generatedOrderNum);
      setWhatsappOrderUrl(generatedWaUrl);
      setStep('confirmation');
      onClearCart();
      try {
        window.open(generatedWaUrl, '_blank');
      } catch {}
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-24 pb-20 max-w-[1280px] mx-auto w-full px-4 sm:px-6 md:px-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-5 border-b border-[#c4c7c7]/30">
        <div>
          <button
            onClick={onBackToShop}
            className="flex items-center gap-2 font-label-caps text-[#5e5e5c] hover:text-[#000000] transition-colors mb-2 cursor-pointer text-[13px]"
          >
            {language === 'ar' ? (
              <ArrowRight className="w-4.5 h-4.5" />
            ) : (
              <ArrowLeft className="w-4.5 h-4.5" />
            )}
            {t('checkout.backToShop', 'Return to Shopping')}
          </button>
          <h1 className="font-display text-[26px] md:text-[36px] text-[#000000] font-bold">
            {language === 'ar' ? 'إتمام الطلب وتأكيده عبر واتساب' : 'Checkout & WhatsApp Order'}
          </h1>
        </div>

        {/* Step Indicator */}
        {step !== 'confirmation' && (
          <div className="flex items-center gap-3 font-label-caps text-[13px]">
            <span
              onClick={() => setStep('shipping')}
              className={`cursor-pointer ${
                step === 'shipping' ? 'text-[#000000] font-bold underline' : 'text-[#747878]'
              }`}
            >
              1. {language === 'ar' ? 'بيانات التوصيل' : 'Shipping'}
            </span>
            <span className="text-[#c4c7c7]">/</span>
            <span
              onClick={() => {
                if (address.fullName && address.phone && address.city && address.street) {
                  setStep('payment');
                }
              }}
              className={`cursor-pointer ${
                step === 'payment' ? 'text-[#000000] font-bold underline' : 'text-[#747878]'
              }`}
            >
              2. {language === 'ar' ? 'طريقة الدفع وتأكيد الواتساب' : 'Payment & WhatsApp'}
            </span>
          </div>
        )}
      </div>

      {/* Trust & Guest Badge */}
      {step !== 'confirmation' && (
        <div className="mb-6 p-3.5 sm:p-4 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl flex items-center justify-between gap-3 text-emerald-900 text-xs sm:text-sm font-medium">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <MessageCircle className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-emerald-950">
                {language === 'ar' ? 'طلب فوري ومباشر عبر واتساب 💬' : 'Instant Direct Order via WhatsApp 💬'}
              </p>
              <p className="text-[11px] sm:text-xs text-emerald-800">
                {language === 'ar'
                  ? 'لا تحتاج لتسجيل دخول أو كلمة مرور. املأ بياناتك وسيصل الطلب مباشرة إلى واتساب المتجر.'
                  : 'No account, email, or password required. Your order will be sent directly to our official WhatsApp.'}
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-emerald-700 text-xs shrink-0 bg-white/80 px-2.5 py-1 rounded-lg border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{language === 'ar' ? 'طلب آمن وسريع' : 'Secure & Fast'}</span>
          </div>
        </div>
      )}

      {step === 'confirmation' ? (
        /* Order Confirmation View */
        <div className="max-w-2xl mx-auto py-8 sm:py-12 text-center fade-in-up">
          <div className="w-20 h-20 bg-[#25D366] text-white rounded-full flex items-center justify-center mx-auto mb-5 shadow-xl animate-bounce">
            <MessageCircle className="w-10 h-10" />
          </div>

          <span className="inline-block px-3.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-label-caps font-bold text-xs mb-3">
            {language === 'ar' ? 'تم تجهيز الطلب بنجاح' : 'Order Ready!'}
          </span>

          <h2 className="font-display text-[28px] md:text-[38px] text-[#000000] mb-3 font-bold">
            {language === 'ar' ? 'شكراً لطلبك من توزا (TOUZA)' : 'Thank You For Your Order'}
          </h2>

          <p className="font-body text-[15px] sm:text-[16px] text-[#444748] mb-6 max-w-lg mx-auto leading-relaxed">
            {language === 'ar'
              ? 'تم تسجيل طلبك بنجاح برقم: '
              : 'Your order has been created with ID: '}{' '}
            <strong className="text-[#000000] font-mono dir-ltr inline-block px-3 py-1 bg-gray-100 rounded-lg text-base border border-gray-300">
              {orderNumber}
            </strong>
          </p>

          {/* Direct WhatsApp Action Button */}
          {whatsappOrderUrl && (
            <div className="my-6 p-5 sm:p-6 bg-emerald-50 border-2 border-emerald-400 rounded-2xl shadow-sm text-center space-y-3">
              <p className="font-bold text-emerald-950 text-[15px]">
                {language === 'ar'
                  ? '👇 اضغط هنا لإرسال تفاصيل الطلب عبر واتساب وتأكيد الشحن فوراً:'
                  : '👇 Click below to send your order details via WhatsApp:'}
              </p>
              <a
                href={whatsappOrderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 bg-[#25D366] hover:bg-[#20ba5a] text-white font-label-caps font-bold text-[16px] rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <MessageCircle className="w-6 h-6 fill-current" />
                <span>{language === 'ar' ? 'إرسال الطلب عبر واتساب الآن 💬' : 'Send Order to WhatsApp Now 💬'}</span>
                <ExternalLink className="w-4 h-4 opacity-80" />
              </a>
              <p className="text-[12px] text-emerald-800">
                {language === 'ar'
                  ? 'خدمة العملاء جاهزة للرد عليك وتأكيد ميعاد التوصيل.'
                  : 'Our customer support is ready to confirm delivery time with you.'}
              </p>
            </div>
          )}

          {/* Order Summary Details Box */}
          <div className="bg-[#f9f9f9] p-5 sm:p-6 rounded-2xl text-right rtl:text-right ltr:text-left mb-8 space-y-3 border border-[#c4c7c7]/40 text-xs sm:text-sm">
            <div className="flex justify-between font-label-caps border-b border-[#c4c7c7]/30 pb-2">
              <span className="text-[#666]">{language === 'ar' ? 'الاسم' : 'Customer Name'}</span>
              <span className="text-[#000000] font-bold">{address.fullName}</span>
            </div>
            <div className="flex justify-between font-label-caps border-b border-[#c4c7c7]/30 pb-2">
              <span className="text-[#666]">{language === 'ar' ? 'رقم الهاتف' : 'Phone'}</span>
              <span className="text-[#000000] font-bold font-mono dir-ltr">{address.phone}</span>
            </div>
            <div className="flex justify-between font-label-caps border-b border-[#c4c7c7]/30 pb-2">
              <span className="text-[#666]">{language === 'ar' ? 'العنوان والمحافظة' : 'Address'}</span>
              <span className="text-[#000000] font-bold">{address.street}, {address.city}</span>
            </div>
            <div className="flex justify-between font-label-caps border-b border-[#c4c7c7]/30 pb-2">
              <span className="text-[#666]">{language === 'ar' ? 'طريقة الدفع' : 'Payment Method'}</span>
              <span className="text-[#000000] font-bold">
                {paymentMethod === 'cod'
                  ? 'الدفع عند الاستلام (كاش)'
                  : paymentMethod === 'instapay'
                  ? 'إنستا باي (InstaPay)'
                  : paymentMethod === 'vodafone_cash'
                  ? 'فودافون كاش'
                  : 'أورانج كاش'}
              </span>
            </div>
            <div className="flex justify-between font-label-caps pt-1 font-bold text-base">
              <span>{language === 'ar' ? 'المبلغ الإجمالي' : 'Total Amount'}</span>
              <span className="text-[#000000] dir-ltr">{formatPrice(total)}</span>
            </div>
          </div>

          <button
            onClick={onBackToShop}
            className="bg-[#000000] text-white py-3.5 px-8 font-label-caps rounded-xl hover:bg-[#2f3131] transition-colors shadow-md cursor-pointer text-sm font-bold"
          >
            {t('checkout.continueShopping', 'Continue Shopping')}
          </button>
        </div>
      ) : (
        /* Form & Summary Split */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Main Form Left Column */}
          <div className="lg:col-span-7 space-y-6">
            {submitError && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-[13px] sm:text-[14px] rounded-xl font-bold flex items-center gap-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {step === 'shipping' && (
              <div className="space-y-5 bg-white p-5 sm:p-7 rounded-2xl border border-[#c4c7c7]/40 shadow-xs">
                <div className="flex items-center justify-between border-b border-[#c4c7c7]/30 pb-3">
                  <h2 className="font-display text-[18px] sm:text-[22px] text-[#000000] font-bold flex items-center gap-2">
                    <Truck className="w-5 h-5" />
                    <span>{language === 'ar' ? 'بيانات العميل والشحن' : 'Shipping Address'}</span>
                  </h2>
                  <span className="text-xs text-[#747878] font-label-caps">
                    {language === 'ar' ? 'خطوة 1 من 2' : 'Step 1 of 2'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                  <div className="md:col-span-2">
                    <label className="block font-label-caps text-[#444748] text-[12px] font-bold mb-1">
                      {language === 'ar' ? 'الاسم بالكامل *' : 'Full Name *'}
                    </label>
                    <input
                      type="text"
                      placeholder={language === 'ar' ? 'أدخل اسمك الثلاثي' : 'Enter your full name'}
                      value={address.fullName}
                      onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                      className="w-full input-minimal py-2.5 px-3.5 border border-[#c4c7c7] rounded-xl text-[14px] sm:text-[15px] focus:border-black focus:ring-1 focus:ring-black outline-hidden"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-label-caps text-[#444748] text-[12px] font-bold mb-1">
                      {language === 'ar' ? 'رقم الموبايل / واتساب للتواصل *' : 'Phone / WhatsApp Number *'}
                    </label>
                    <input
                      type="tel"
                      placeholder="010XXXXXXXX"
                      value={address.phone}
                      onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                      className="w-full input-minimal py-2.5 px-3.5 border border-[#c4c7c7] rounded-xl text-[14px] sm:text-[15px] dir-ltr text-right rtl:text-right font-mono focus:border-black focus:ring-1 focus:ring-black outline-hidden"
                      required
                    />
                    <p className="text-[11px] text-[#747878] mt-1">
                      {language === 'ar' ? 'سيتم استخدام هذا الرقم للتواصل معك وتأكيد الطلب وشحنه.' : 'Will be used for order confirmation & delivery.'}
                    </p>
                  </div>

                  <div>
                    <label className="block font-label-caps text-[#444748] text-[12px] font-bold mb-1">
                      {language === 'ar' ? 'المحافظة / المدينة *' : 'City / Governorate *'}
                    </label>
                    <input
                      type="text"
                      placeholder={language === 'ar' ? 'بورسعيد، القاهرة، الإسكندرية...' : 'Port Said, Cairo, Alexandria...'}
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      className="w-full input-minimal py-2.5 px-3.5 border border-[#c4c7c7] rounded-xl text-[14px] sm:text-[15px] focus:border-black focus:ring-1 focus:ring-black outline-hidden"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-label-caps text-[#444748] text-[12px] font-bold mb-1">
                      {language === 'ar' ? 'الشقة / الدور (اختياري)' : 'Apartment / Floor'}
                    </label>
                    <input
                      type="text"
                      placeholder={language === 'ar' ? 'شقة 4، الدور 3' : 'Apt 4, 3rd Floor'}
                      value={address.apartment}
                      onChange={(e) => setAddress({ ...address, apartment: e.target.value })}
                      className="w-full input-minimal py-2.5 px-3.5 border border-[#c4c7c7] rounded-xl text-[14px] sm:text-[15px] focus:border-black focus:ring-1 focus:ring-black outline-hidden"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-label-caps text-[#444748] text-[12px] font-bold mb-1">
                      {language === 'ar' ? 'العنوان بالتفصيل (اسم الشارع، رقم العمارة، علامة مميزة) *' : 'Street Address *'}
                    </label>
                    <input
                      type="text"
                      placeholder={language === 'ar' ? 'اسم الشارع، رقم العمارة أو علامة مميزة بجوارك' : 'Street name, building number'}
                      value={address.street}
                      onChange={(e) => setAddress({ ...address, street: e.target.value })}
                      className="w-full input-minimal py-2.5 px-3.5 border border-[#c4c7c7] rounded-xl text-[14px] sm:text-[15px] focus:border-black focus:ring-1 focus:ring-black outline-hidden"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-label-caps text-[#444748] text-[12px] font-bold mb-1">
                      {language === 'ar' ? 'ملاحظات إضافية على الطلب (اختياري)' : 'Order Notes (Optional)'}
                    </label>
                    <textarea
                      rows={2}
                      placeholder={language === 'ar' ? 'أي تعليمات للمندوب أو مقاسات خاصة...' : 'Any special delivery instructions...'}
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      className="w-full input-minimal py-2 px-3.5 border border-[#c4c7c7] rounded-xl text-[13px] sm:text-[14px] focus:border-black focus:ring-1 focus:ring-black outline-hidden resize-none"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleProceedToPayment}
                  className="w-full bg-[#000000] text-white py-3.5 sm:py-4 rounded-xl font-label-caps hover:bg-[#2f3131] transition-all cursor-pointer shadow-md mt-2 text-[14px] sm:text-[15px] font-bold flex items-center justify-center gap-2 active:scale-[0.99]"
                >
                  <span>{language === 'ar' ? 'متابعة إلى اختيار طريقة الدفع' : 'Continue to Payment Method'}</span>
                  {language === 'ar' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            )}

            {step === 'payment' && (
              <div className="space-y-5 bg-white p-5 sm:p-7 rounded-2xl border border-[#c4c7c7]/40 shadow-xs fade-in-up">
                <div className="flex items-center justify-between border-b border-[#c4c7c7]/30 pb-3">
                  <h2 className="font-display text-[18px] sm:text-[22px] text-[#000000] font-bold">
                    {language === 'ar' ? 'اختر طريقة الدفع المناسبة' : 'Select Payment Method'}
                  </h2>
                  <span className="text-xs text-[#747878] font-label-caps">
                    {language === 'ar' ? 'خطوة 2 من 2' : 'Step 2 of 2'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Option 1: Cash on Delivery */}
                  {activeSettings?.enableCashOnDelivery !== false && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cod')}
                      className={`p-4 border rounded-xl font-label-caps text-[13px] flex flex-col items-center justify-center text-center gap-2 cursor-pointer transition-all ${
                        paymentMethod === 'cod'
                          ? 'border-[#000000] bg-[#000000] text-white font-bold shadow-md'
                          : 'border-[#c4c7c7] bg-white text-[#5e5e5c] hover:border-[#000000]'
                      }`}
                    >
                      <Banknote className="w-6 h-6" />
                      <span>{language === 'ar' ? 'كاش عند الاستلام' : 'Cash on Delivery'}</span>
                    </button>
                  )}

                  {/* Option 2: InstaPay */}
                  {activeSettings?.enableInstaPay !== false && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('instapay')}
                      className={`p-4 border rounded-xl font-label-caps text-[13px] flex flex-col items-center justify-center text-center gap-2 cursor-pointer transition-all ${
                        paymentMethod === 'instapay'
                          ? 'border-[#000000] bg-[#000000] text-white font-bold shadow-md'
                          : 'border-[#c4c7c7] bg-white text-[#5e5e5c] hover:border-[#000000]'
                      }`}
                    >
                      <Landmark className="w-6 h-6" />
                      <span>{language === 'ar' ? 'إنستا باي (InstaPay)' : 'InstaPay'}</span>
                    </button>
                  )}

                  {/* Option 3: Vodafone Cash */}
                  {activeSettings?.enableVodafoneCash !== false && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('vodafone_cash')}
                      className={`p-4 border rounded-xl font-label-caps text-[13px] flex flex-col items-center justify-center text-center gap-2 cursor-pointer transition-all ${
                        paymentMethod === 'vodafone_cash'
                          ? 'border-[#000000] bg-[#000000] text-white font-bold shadow-md'
                          : 'border-[#c4c7c7] bg-white text-[#5e5e5c] hover:border-[#000000]'
                      }`}
                    >
                      <PhoneCall className="w-6 h-6" />
                      <span>{language === 'ar' ? 'فودافون كاش' : 'Vodafone Cash'}</span>
                    </button>
                  )}

                  {/* Option 4: Orange Cash */}
                  {activeSettings?.enableOrangeCash !== false && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('orange_cash')}
                      className={`p-4 border rounded-xl font-label-caps text-[13px] flex flex-col items-center justify-center text-center gap-2 cursor-pointer transition-all ${
                        paymentMethod === 'orange_cash'
                          ? 'border-[#ff6600] bg-[#ff6600] text-white font-bold shadow-md'
                          : 'border-[#c4c7c7] bg-white text-[#5e5e5c] hover:border-[#ff6600] hover:text-[#ff6600]'
                      }`}
                    >
                      <Smartphone className="w-6 h-6" />
                      <span>{language === 'ar' ? 'أورانج كاش' : 'Orange Cash'}</span>
                    </button>
                  )}
                </div>

                {/* Details box according to selected method */}
                {paymentMethod === 'cod' && activeSettings?.enableCashOnDelivery !== false && (
                  <div className="p-4 bg-[#f9f9f9] border border-[#c4c7c7]/30 rounded-xl space-y-2 text-[14px]">
                    <div className="flex items-center gap-2 text-[#2e7d32] font-bold">
                      <CheckCircle className="w-5 h-5" />
                      <span>{language === 'ar' ? 'الدفع نقداً عند استلام الشحنة' : 'Pay Cash Upon Receipt'}</span>
                    </div>
                    <p className="text-[#5e5e5c] text-[13px] leading-relaxed">
                      {language === 'ar'
                        ? (activeSettings?.codInstructionsAr || 'ستقوم بدفع المبلغ الإجمالي للمندوب عند وصول الشحنة إلى عنوانك مباشرة.')
                        : (activeSettings?.codInstructionsEn || 'You will pay the exact total amount in cash directly to the courier upon delivery.')}
                    </p>
                  </div>
                )}

                {paymentMethod === 'instapay' && activeSettings?.enableInstaPay !== false && (
                  <div className="p-5 bg-purple-50 border border-purple-200 rounded-xl space-y-4 text-[14px]">
                    <div className="space-y-1">
                      <p className="font-bold text-purple-900 font-label-caps">
                        {language === 'ar' ? 'بيانات تحويل إنستا باي (InstaPay):' : 'InstaPay Transfer Details:'}
                      </p>
                      <div className="p-3 bg-white rounded-lg border border-purple-200 font-mono text-[14px] text-purple-950 space-y-1">
                        <p><strong>Account / IPA:</strong> {activeSettings?.instaPayAccount || activeSettings?.instaPayAddress || 'm.fathyabdallah95@instapay'}</p>
                        {activeSettings?.instaPayPhone && (
                          <p><strong>Phone Number:</strong> {activeSettings.instaPayPhone}</p>
                        )}
                        <p className="text-[12px] text-purple-700 font-sans">
                          {language === 'ar' ? `المبلغ المطلوب تحويله: ${formatPrice(total)}` : `Amount to transfer: ${formatPrice(total)}`}
                        </p>
                      </div>
                      {(activeSettings?.instaPayInstructionsAr || activeSettings?.instaPayInstructionsEn) && (
                        <p className="text-[#555] text-[13px] leading-relaxed pt-1 font-sans">
                          {language === 'ar' ? activeSettings.instaPayInstructionsAr : activeSettings.instaPayInstructionsEn}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[12px] font-label-caps font-bold text-purple-900 mb-1">
                        {language === 'ar' ? 'رقم الموبايل المحول منه أو رقم العملية *' : 'Sender Phone / Reference ID *'}
                      </label>
                      <input
                        type="text"
                        value={transferRef}
                        onChange={(e) => setTransferRef(e.target.value)}
                        placeholder="010XXXXXXXX / Ref-123456"
                        className="w-full bg-white border border-purple-300 rounded-lg p-2.5 text-[14px] font-mono"
                        required
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'vodafone_cash' && activeSettings?.enableVodafoneCash !== false && (
                  <div className="p-5 bg-red-50 border border-red-200 rounded-xl space-y-4 text-[14px]">
                    <div className="space-y-1">
                      <p className="font-bold text-red-900 font-label-caps">
                        {language === 'ar' ? 'بيانات تحويل محفظة فودافون كاش:' : 'Vodafone Cash Wallet Details:'}
                      </p>
                      <div className="p-3 bg-white rounded-lg border border-red-200 font-mono text-[14px] text-red-950 space-y-1">
                        <p><strong>Wallet Number:</strong> {activeSettings?.vodafoneCashNumber || '01070606272'}</p>
                        <p className="text-[12px] text-red-700 font-sans">
                          {language === 'ar' ? `المبلغ المطلوب تحويله: ${formatPrice(total)}` : `Amount to transfer: ${formatPrice(total)}`}
                        </p>
                      </div>
                      {(activeSettings?.vodafoneCashInstructionsAr || activeSettings?.vodafoneCashInstructionsEn) && (
                        <p className="text-[#555] text-[13px] leading-relaxed pt-1 font-sans">
                          {language === 'ar' ? activeSettings.vodafoneCashInstructionsAr : activeSettings.vodafoneCashInstructionsEn}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[12px] font-label-caps font-bold text-red-900 mb-1">
                        {language === 'ar' ? 'رقم محفظة فودافون كاش المحول منها *' : 'Sender Vodafone Cash Number *'}
                      </label>
                      <input
                        type="tel"
                        value={transferRef}
                        onChange={(e) => setTransferRef(e.target.value)}
                        placeholder="010XXXXXXXX"
                        className="w-full bg-white border border-red-300 rounded-lg p-2.5 text-[14px] font-mono"
                        required
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'orange_cash' && activeSettings?.enableOrangeCash !== false && (
                  <div className="p-5 bg-orange-50 border border-orange-200 rounded-xl space-y-4 text-[14px]">
                    <div className="space-y-1">
                      <p className="font-bold text-orange-950 font-label-caps flex items-center gap-1.5">
                        <Smartphone className="w-4.5 h-4.5 text-[#ff6600]" />
                        <span>{language === 'ar' ? 'بيانات تحويل محفظة أورانج كاش (Orange Cash):' : 'Orange Cash Wallet Details:'}</span>
                      </p>
                      <div className="p-3 bg-white rounded-lg border border-orange-200 font-mono text-[14px] text-orange-950 space-y-1">
                        <p><strong>Wallet Number:</strong> {activeSettings?.orangeCashNumber || '01070606272'}</p>
                        <p className="text-[12px] text-orange-700 font-sans">
                          {language === 'ar' ? `المبلغ المطلوب تحويله: ${formatPrice(total)}` : `Amount to transfer: ${formatPrice(total)}`}
                        </p>
                      </div>
                      {(activeSettings?.orangeCashInstructionsAr || activeSettings?.orangeCashInstructionsEn) && (
                        <p className="text-[#555] text-[13px] leading-relaxed pt-1 font-sans">
                          {language === 'ar' ? activeSettings.orangeCashInstructionsAr : activeSettings.orangeCashInstructionsEn}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[12px] font-label-caps font-bold text-orange-950 mb-1">
                        {language === 'ar' ? 'رقم محفظة أورانج كاش المحول منها *' : 'Sender Orange Cash Number *'}
                      </label>
                      <input
                        type="tel"
                        value={transferRef}
                        onChange={(e) => setTransferRef(e.target.value)}
                        placeholder="012XXXXXXXX"
                        className="w-full bg-white border border-orange-300 rounded-lg p-2.5 text-[14px] font-mono focus:border-[#ff6600] focus:ring-1 focus:ring-[#ff6600] outline-hidden"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-3 sm:gap-4 pt-3">
                  <button
                    type="button"
                    onClick={() => setStep('shipping')}
                    className="w-1/3 border border-[#000000] text-[#000000] py-3.5 rounded-xl font-label-caps hover:bg-[#f3f3f4] transition-colors cursor-pointer text-[13px] sm:text-[14px] font-bold"
                  >
                    {language === 'ar' ? 'تعديل العنوان' : 'Back'}
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handlePlaceOrder}
                    className="w-2/3 py-3.5 sm:py-4 rounded-xl font-label-caps font-bold transition-all shadow-lg text-[14px] sm:text-[16px] flex items-center justify-center gap-2 cursor-pointer bg-[#25D366] hover:bg-[#20ba5a] text-white active:scale-[0.98]"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>{language === 'ar' ? 'جاري تجهيز الطلب...' : 'Processing...'}</span>
                      </div>
                    ) : (
                      <>
                        <MessageCircle className="w-5 h-5 fill-current" />
                        <span>
                          {language === 'ar' ? 'تأكيد الطلب وإرسال عبر واتساب 💬' : 'Confirm & Send to WhatsApp'}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column Order Summary */}
          <div className="lg:col-span-5 bg-[#ffffff] border border-[#c4c7c7]/40 p-5 sm:p-6 rounded-2xl h-fit space-y-5 shadow-xs">
            <h2 className="font-display text-[18px] sm:text-[20px] text-[#000000] border-b border-[#c4c7c7]/30 pb-3 font-bold flex items-center justify-between">
              <span>{t('checkout.orderSummary', 'Order Summary')}</span>
              <span className="text-xs bg-[#000000] text-white px-2.5 py-0.5 rounded-full font-mono font-bold">
                {cartItems.reduce((acc, item) => acc + item.quantity, 0)} {language === 'ar' ? 'قطع' : 'items'}
              </span>
            </h2>

            {/* Items List */}
            <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
              {cartItems.map((item) => {
                const name = getLocalizedProductName(item.product, language);
                const colorObj = item.product.colors?.find((c) => c.name === item.selectedColor);
                const rawImg = colorObj?.imageUrl || (item.product.images && item.product.images.length > 0 ? item.product.images[0] : '') || '';

                return (
                  <div key={item.id} className="flex gap-3 items-center border-b border-[#c4c7c7]/20 pb-3">
                    <img
                      src={rawImg || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=300'}
                      alt={name}
                      className="w-14 h-16 object-cover bg-[#f3f3f4] shrink-0 rounded-lg border border-[#747878]/10"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-display text-[14px] sm:text-[15px] text-[#000000] truncate font-bold">
                        {name}
                      </h4>
                      <p className="font-body text-[12px] text-[#747878]">
                        {item.selectedColor} | {item.selectedSize} × {item.quantity}
                      </p>
                    </div>
                    <span className="font-body text-[14px] text-[#000000] font-bold dir-ltr">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Promo Code Form */}
            <form onSubmit={handleApplyPromo} className="space-y-2 pt-2 border-t border-[#c4c7c7]/30">
              <label className="block font-label-caps text-[12px] text-[#444748] font-bold">
                {language === 'ar' ? 'هل لديك كود خصم؟' : 'Have a Promo Code?'}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="TOUZA10"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 input-minimal py-2 px-3 border border-[#c4c7c7] rounded-xl text-[13px] uppercase font-mono tracking-wider focus:border-black outline-hidden"
                />
                <button
                  type="submit"
                  className="bg-[#000000] text-white px-4 py-2 rounded-xl font-label-caps text-[12px] font-bold hover:bg-[#2f3131] transition-colors cursor-pointer"
                >
                  {language === 'ar' ? 'تطبيق' : 'Apply'}
                </button>
              </div>
              {promoError && <p className="text-[12px] text-red-600 font-bold">{promoError}</p>}
              {promoSuccess && <p className="text-[12px] text-emerald-600 font-bold">{promoSuccess}</p>}
            </form>

            {/* Calculations Breakdown */}
            <div className="space-y-2 pt-3 border-t border-[#c4c7c7]/30 text-[13px] sm:text-[14px]">
              <div className="flex justify-between font-label-caps text-[#5e5e5c]">
                <span>{language === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</span>
                <span className="font-bold text-[#000000] dir-ltr">{formatPrice(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between font-label-caps text-emerald-700 font-bold">
                  <span>{language === 'ar' ? 'قيمة الخصم' : 'Discount'}</span>
                  <span className="dir-ltr">-{formatPrice(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between font-label-caps text-[#5e5e5c]">
                <span>
                  {language === 'ar'
                    ? (activeSettings?.shippingLabelAr || 'الشحن لجميع المحافظات')
                    : (activeSettings?.shippingLabelEn || 'Shipping across Egypt')}
                </span>
                {shipping === 0 ? (
                  <span className="text-emerald-700 font-bold">{language === 'ar' ? 'مجاني ✨' : 'Free'}</span>
                ) : (
                  <span className="font-bold text-[#000000] dir-ltr">{formatPrice(shipping)}</span>
                )}
              </div>

              <div className="flex justify-between font-label-caps text-[16px] sm:text-[17px] font-bold text-[#000000] pt-2 border-t border-[#c4c7c7]/40">
                <span>{language === 'ar' ? 'الإجمالي المطلوب' : 'Total Amount'}</span>
                <span className="dir-ltr text-[18px]">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
