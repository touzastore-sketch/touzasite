import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { CartItem, ShippingAddress, StoreSettings } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { getLocalizedProductName } from '../data/products';
import { saveUserOrder, safeJsonStringify, signInWithEmail, signUpWithEmail } from '../firebase';

interface CheckoutViewProps {
  cartItems: CartItem[];
  onBackToShop: () => void;
  onClearCart: () => void;
  user: User | null;
  onSignInGoogle: () => Promise<void>;
  onOpenAccountModal?: () => void;
  storeSettings?: StoreSettings;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  cartItems,
  onBackToShop,
  onClearCart,
  user,
  onSignInGoogle,
  onOpenAccountModal,
  storeSettings,
}) => {
  const { language, formatPrice, t } = useLanguage();
  const [step, setStep] = useState<'shipping' | 'payment' | 'confirmation'>('shipping');
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Inline Checkout Auth State
  const [checkoutAuthMode, setCheckoutAuthMode] = useState<'google' | 'signin' | 'signup'>('google');
  const [checkoutEmail, setCheckoutEmail] = useState('');
  const [checkoutPassword, setCheckoutPassword] = useState('');
  const [checkoutConfirmPassword, setCheckoutConfirmPassword] = useState('');
  const [checkoutFullName, setCheckoutFullName] = useState('');
  const [checkoutUsername, setCheckoutUsername] = useState('');
  const [checkoutPhone, setCheckoutPhone] = useState('');
  const [checkoutAuthError, setCheckoutAuthError] = useState<string | null>(null);
  const [isSubmittingCheckoutAuth, setIsSubmittingCheckoutAuth] = useState(false);

  // Address defaults cleared out (no hardcoded static mock addresses)
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

  useEffect(() => {
    if (user?.displayName && !address.fullName) {
      setAddress((prev) => ({ ...prev, fullName: user.displayName || '' }));
    }
  }, [user]);

  // Payment method: 'cod' | 'instapay' | 'vodafone_cash'
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'instapay' | 'vodafone_cash'>('cod');
  const [transferRef, setTransferRef] = useState('');

  // Auto-switch payment method if current is disabled in store settings
  useEffect(() => {
    const isCodEnabled = storeSettings?.enableCashOnDelivery !== false;
    const isInstaPayEnabled = storeSettings?.enableInstaPay !== false;
    const isVodaEnabled = storeSettings?.enableVodafoneCash !== false;

    if (paymentMethod === 'cod' && !isCodEnabled) {
      if (isInstaPayEnabled) setPaymentMethod('instapay');
      else if (isVodaEnabled) setPaymentMethod('vodafone_cash');
    } else if (paymentMethod === 'instapay' && !isInstaPayEnabled) {
      if (isCodEnabled) setPaymentMethod('cod');
      else if (isVodaEnabled) setPaymentMethod('vodafone_cash');
    } else if (paymentMethod === 'vodafone_cash' && !isVodaEnabled) {
      if (isCodEnabled) setPaymentMethod('cod');
      else if (isInstaPayEnabled) setPaymentMethod('instapay');
    }
  }, [storeSettings, paymentMethod]);

  const [orderNumber, setOrderNumber] = useState('');

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );
  const discountAmount = (subtotal * discountPercent) / 100;
  const shipping = 0; // Express complimentary
  const total = subtotal - discountAmount + shipping;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    setPromoSuccess('');
    if (promoCode.trim().toUpperCase() === 'ELEGAN10' || promoCode.trim().toUpperCase() === 'WELCOME') {
      setDiscountPercent(10);
      setPromoSuccess(language === 'ar' ? 'تم تطبيق خصم 10% بنجاح!' : '10% Privilege Discount Applied!');
    } else if (promoCode.trim() !== '') {
      setPromoError(language === 'ar' ? 'كود غير صحيح. جرب "ELEGAN10"' : 'Invalid code. Try "ELEGAN10"');
    }
  };

  const handleCheckoutEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutAuthError(null);
    if (!checkoutEmail.trim() || !checkoutPassword) {
      setCheckoutAuthError(language === 'ar' ? 'يرجى إدخال البريد الإلكتروني وكلمة المرور' : 'Please enter email and password');
      return;
    }
    setIsSubmittingCheckoutAuth(true);
    try {
      await signInWithEmail(checkoutEmail, checkoutPassword);
    } catch (err: any) {
      console.error('Checkout sign in error:', err);
      let msg = language === 'ar' ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة' : 'Invalid email or password';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = language === 'ar' ? 'بيانات الدخول غير صحيحة. يرجى التأكد وإعادة المحاولة' : 'Invalid credentials. Please check and try again.';
      } else if (err.message) {
        msg += `: ${err.message}`;
      }
      setCheckoutAuthError(msg);
    } finally {
      setIsSubmittingCheckoutAuth(false);
    }
  };

  const handleCheckoutEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutAuthError(null);
    if (!checkoutFullName.trim() || !checkoutUsername.trim() || !checkoutEmail.trim() || !checkoutPhone.trim() || !checkoutPassword || !checkoutConfirmPassword) {
      setCheckoutAuthError(language === 'ar' ? 'يرجى ملء كافة حقول التسجيل' : 'Please fill all registration fields');
      return;
    }
    if (checkoutPassword.length < 6) {
      setCheckoutAuthError(language === 'ar' ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters');
      return;
    }
    if (checkoutPassword !== checkoutConfirmPassword) {
      setCheckoutAuthError(language === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match');
      return;
    }

    setIsSubmittingCheckoutAuth(true);
    try {
      await signUpWithEmail(checkoutFullName, checkoutUsername, checkoutEmail, checkoutPhone, checkoutPassword);
    } catch (err: any) {
      console.error('Checkout sign up error:', err);
      let msg = language === 'ar' ? 'فشل إنشاء الحساب' : 'Failed to create account';
      if (err.code === 'auth/email-already-in-use') {
        msg = language === 'ar' ? 'البريد الإلكتروني مستخدم بالفعل. يمكنك تسجيل الدخول به مباشرة' : 'Email already in use. Please sign in instead.';
      } else if (err.code === 'auth/weak-password') {
        msg = language === 'ar' ? 'كلمة المرور ضعيفة جداً' : 'Password is too weak';
      } else if (err.code === 'auth/operation-not-allowed') {
        msg = language === 'ar' ? 'تسجيل الدخول بالبريد غير مفعّل في معلمات Firebase. استخدم تسجيل الدخول بـ Google' : 'Email/password sign-in is disabled in Firebase.';
      } else if (err.message) {
        msg += `: ${err.message}`;
      }
      setCheckoutAuthError(msg);
    } finally {
      setIsSubmittingCheckoutAuth(false);
    }
  };

  const handleProceedToPayment = () => {
    setSubmitError('');
    if (!address.fullName.trim() || !address.street.trim() || !address.city.trim() || !address.phone.trim()) {
      setSubmitError(language === 'ar' ? 'يرجى ملء كافة الحقول الأساسية للعنوان (الاسم الكامل، الشارع، المدينة، ورقم الهاتف)' : 'Please fill all required address fields');
      return;
    }
    setStep('payment');
  };

  const handlePlaceOrder = async () => {
    setSubmitError('');

    if (!user) {
      setSubmitError(language === 'ar' ? 'يجب تسجيل الدخول (عن طريق Google أو البريد الإلكتروني) أولاً لإتمام الطلب' : 'You must sign in (via Google or Email) to place an order');
      return;
    }

    if ((paymentMethod === 'instapay' || paymentMethod === 'vodafone_cash') && !transferRef.trim()) {
      setSubmitError(language === 'ar' ? 'يرجى إدخال رقم الهاتف أو رقم العملية المحول منها للتحقق' : 'Please enter the transfer sender phone number or reference ID');
      return;
    }

    setIsSubmitting(true);
    const generatedOrderNum = 'TZ-EG-' + Math.floor(100000 + Math.random() * 900000);

    const paymentLabel =
      paymentMethod === 'cod'
        ? 'الدفع عند الاستلام (كاش)'
        : paymentMethod === 'instapay'
        ? `إنستا باي (InstaPay) - المحول: ${transferRef}`
        : `فودافون كاش (Vodafone Cash) - المحول: ${transferRef}`;

    try {
      const savedOrder = await saveUserOrder(user.uid, user.email || '', {
        orderNumber: generatedOrderNum,
        items: cartItems.map((item) => ({
          productId: item.product.id,
          title: getLocalizedProductName(item.product, language),
          price: item.product.price,
          quantity: item.quantity,
          selectedColor: item.selectedColor,
          selectedSize: item.selectedSize,
          image: item.product.images[0],
        })),
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
        },
        paymentMethod: paymentLabel,
      });

      // Update local cache so account modal displays order instantly with 0ms lag
      try {
        const cacheKey = `maison_orders_${user.uid}`;
        const existingCache = localStorage.getItem(cacheKey);
        const existingOrders = existingCache ? JSON.parse(existingCache) : [];
        localStorage.setItem(cacheKey, safeJsonStringify([savedOrder, ...existingOrders]));
      } catch (cacheErr) {
        console.warn('Failed to save order to local cache:', cacheErr);
      }

      setOrderNumber(generatedOrderNum);
      setStep('confirmation');
      onClearCart();
    } catch (err: any) {
      console.error('Failed to save order to Firestore:', err);
      setSubmitError(
        language === 'ar'
          ? 'حدث خطأ أثناء حفظ الطلب في Firestore، يرجى إعادة المحاولة: ' + (err?.message || '')
          : 'Failed to place order: ' + (err?.message || '')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-24 pb-20 max-w-[1280px] mx-auto w-full px-5 md:px-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-5 border-b border-[#c4c7c7]/30">
        <div>
          <button
            onClick={onBackToShop}
            className="flex items-center gap-2 font-label-caps text-[#5e5e5c] hover:text-[#000000] transition-colors mb-2 cursor-pointer text-[13px]"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            {t('checkout.backToShop', 'Return to Shopping')}
          </button>
          <h1 className="font-display text-[28px] md:text-[36px] text-[#000000] font-bold">
            {t('checkout.title', 'Secure Checkout')}
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
              1. {t('checkout.shippingTitle', 'Shipping')}
            </span>
            <span className="text-[#c4c7c7]">&gt;</span>
            <span
              onClick={() => step === 'payment' && setStep('payment')}
              className={`${
                step === 'payment' ? 'text-[#000000] font-bold underline' : 'text-[#747878]'
              }`}
            >
              2. {t('checkout.paymentTitle', 'Payment')}
            </span>
            <span className="text-[#c4c7c7]">&gt;</span>
            <span className="text-[#747878]">3. {language === 'ar' ? 'التأكيد' : 'Confirmation'}</span>
          </div>
        )}
      </div>

      {/* Mandatory Google Sign-In Status Bar / Box */}
      {step !== 'confirmation' && (
        <div className="mb-8">
          {user ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="w-10 h-10 rounded-full border border-emerald-300" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                    {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-emerald-900 text-[14px]">
                    <span className="material-symbols-outlined text-[18px] text-emerald-600">verified</span>
                    <span>{user.displayName || user.email}</span>
                  </div>
                  <p className="text-[12px] text-emerald-700">
                    {language === 'ar' ? 'تم تسجيل الدخول بحساب Google. سيتم إرسال وحفظ الطلب مباشرة في حسابك.' : 'Signed in with Google. Order will be recorded under your account.'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 md:p-8 bg-white border border-[#c4c7c7]/60 rounded-3xl space-y-6 shadow-sm">
              {/* Header */}
              <div className="space-y-1.5 text-center sm:text-start border-b border-[#c4c7c7]/20 pb-5">
                <div className="flex items-center justify-center sm:justify-start gap-2.5 text-[#000000] font-bold font-display text-xl">
                  <span className="material-symbols-outlined text-[26px] text-[#000000]">account_circle</span>
                  <span>{language === 'ar' ? 'سجّل الدخول لإتمام الطلب' : 'Sign In or Create Account to Continue'}</span>
                </div>
                <p className="text-xs text-[#5e5e5c] leading-relaxed">
                  {language === 'ar'
                    ? 'قم بتسجيل الدخول بحساب Google بضغطة زر واحدة، أو استخدم بريدك الإلكتروني لتتبع طلبك وحفظ بيانات الشحن بكل أمان.'
                    : 'Sign in instantly with Google or use your email address to save shipping info and track your order.'}
                </p>
              </div>

              {/* Step 1: Quick Google Button */}
              <div className="bg-[#f8f9fa] border border-[#c4c7c7]/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#c4c7c7]/40 flex items-center justify-center shrink-0 shadow-2xs">
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.1 0-5.74-2.09-6.68-4.92H1.21v3.15C3.21 21.36 7.32 24 12 24z"/>
                      <path fill="#FBBC05" d="M5.32 14.28c-.24-.72-.38-1.49-.38-2.28s.14-1.56.38-2.28V6.57H1.21C.44 8.11 0 9.99 0 12s.44 3.89 1.21 5.43l4.11-3.15z"/>
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.32 0 3.21 2.64 1.21 6.57l4.11 3.15c.94-2.83 3.58-4.92 6.68-4.92z"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#000000]">
                      {language === 'ar' ? 'الدخول السريع بضغطة زر' : 'Quick 1-Click Sign In'}
                    </h4>
                    <p className="text-xs text-[#747878]">
                      {language === 'ar' ? 'الأسهل والأسرع لإصدار الفاتورة بدون كتابة كلمة مرور' : 'Fastest option, no password required'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onSignInGoogle}
                  className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2.5 bg-[#000000] text-white px-5 py-2.5 rounded-xl font-body font-bold text-xs hover:bg-[#2f3131] transition-all cursor-pointer shadow-sm active:scale-98"
                >
                  <span>{language === 'ar' ? 'متابعة باستخدام Google' : 'Continue with Google'}</span>
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </button>
              </div>

              {/* Divider */}
              <div className="relative my-2 flex items-center justify-center">
                <div className="border-t border-[#c4c7c7]/30 w-full"></div>
                <span className="bg-white px-4 text-xs font-bold text-[#747878] shrink-0 uppercase tracking-wider">
                  {language === 'ar' ? 'أو بالبريد الإلكتروني' : 'OR WITH EMAIL'}
                </span>
                <div className="border-t border-[#c4c7c7]/30 w-full"></div>
              </div>

              {/* Step 2: Email Sign In vs Sign Up Tabs */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 bg-[#f3f3f4] p-1 rounded-xl border border-[#c4c7c7]/20">
                  <button
                    type="button"
                    onClick={() => { setCheckoutAuthMode('signin'); setCheckoutAuthError(null); }}
                    className={`py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      checkoutAuthMode === 'signin' || checkoutAuthMode === 'google'
                        ? 'bg-white text-black shadow-xs font-black'
                        : 'text-[#747878] hover:text-black'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">login</span>
                    <span>{language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setCheckoutAuthMode('signup'); setCheckoutAuthError(null); }}
                    className={`py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      checkoutAuthMode === 'signup'
                        ? 'bg-white text-black shadow-xs font-black'
                        : 'text-[#747878] hover:text-black'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">person_add</span>
                    <span>{language === 'ar' ? 'إنشاء حساب جديد' : 'Create Account'}</span>
                  </button>
                </div>

                {checkoutAuthError && (
                  <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2.5 animate-fadeIn">
                    <span className="material-symbols-outlined text-lg shrink-0">error</span>
                    <span>{checkoutAuthError}</span>
                  </div>
                )}

                {/* Sub-Form: Sign In */}
                {(checkoutAuthMode === 'signin' || checkoutAuthMode === 'google') && (
                  <form onSubmit={handleCheckoutEmailSignIn} className="space-y-3 bg-[#fdfdfd] p-4 rounded-2xl border border-[#c4c7c7]/20">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[#1f1f1f] mb-1">
                          {language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                        </label>
                        <input
                          type="email"
                          value={checkoutEmail}
                          onChange={(e) => setCheckoutEmail(e.target.value)}
                          required
                          placeholder="example@domain.com"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#c4c7c7] text-xs bg-white focus:outline-none focus:border-black transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#1f1f1f] mb-1">
                          {language === 'ar' ? 'كلمة المرور' : 'Password'}
                        </label>
                        <input
                          type="password"
                          value={checkoutPassword}
                          onChange={(e) => setCheckoutPassword(e.target.value)}
                          required
                          placeholder="••••••••"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#c4c7c7] text-xs bg-white focus:outline-none focus:border-black transition-colors"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingCheckoutAuth}
                      className="w-full bg-[#000000] text-white py-3 rounded-xl font-bold text-xs hover:bg-[#2f3131] transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
                    >
                      {isSubmittingCheckoutAuth ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>{language === 'ar' ? 'جاري الدخول...' : 'Signing in...'}</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-base">login</span>
                          <span>{language === 'ar' ? 'تسجيل الدخول ومتابعة الشراء' : 'Sign In & Continue'}</span>
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* Sub-Form: Sign Up */}
                {checkoutAuthMode === 'signup' && (
                  <form onSubmit={handleCheckoutEmailSignUp} className="space-y-3 bg-[#fdfdfd] p-4 rounded-2xl border border-[#c4c7c7]/20">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[#1f1f1f] mb-1">
                          {language === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                        </label>
                        <input
                          type="text"
                          value={checkoutFullName}
                          onChange={(e) => setCheckoutFullName(e.target.value)}
                          required
                          placeholder={language === 'ar' ? 'أحمد محمد' : 'Ahmed Mohamed'}
                          className="w-full px-3.5 py-2 rounded-xl border border-[#c4c7c7] text-xs bg-white focus:outline-none focus:border-black transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#1f1f1f] mb-1">
                          {language === 'ar' ? 'اسم المستخدم' : 'Username'}
                        </label>
                        <input
                          type="text"
                          value={checkoutUsername}
                          onChange={(e) => setCheckoutUsername(e.target.value)}
                          required
                          placeholder="ahmed_touza"
                          className="w-full px-3.5 py-2 rounded-xl border border-[#c4c7c7] text-xs bg-white focus:outline-none focus:border-black transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[#1f1f1f] mb-1">
                          {language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                        </label>
                        <input
                          type="email"
                          value={checkoutEmail}
                          onChange={(e) => setCheckoutEmail(e.target.value)}
                          required
                          placeholder="example@domain.com"
                          className="w-full px-3.5 py-2 rounded-xl border border-[#c4c7c7] text-xs bg-white focus:outline-none focus:border-black transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#1f1f1f] mb-1">
                          {language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                        </label>
                        <input
                          type="tel"
                          value={checkoutPhone}
                          onChange={(e) => setCheckoutPhone(e.target.value)}
                          required
                          placeholder="01012345678"
                          className="w-full px-3.5 py-2 rounded-xl border border-[#c4c7c7] text-xs bg-white focus:outline-none focus:border-black transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[#1f1f1f] mb-1">
                          {language === 'ar' ? 'كلمة المرور' : 'Password'}
                        </label>
                        <input
                          type="password"
                          value={checkoutPassword}
                          onChange={(e) => setCheckoutPassword(e.target.value)}
                          required
                          placeholder="••••••••"
                          className="w-full px-3.5 py-2 rounded-xl border border-[#c4c7c7] text-xs bg-white focus:outline-none focus:border-black transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#1f1f1f] mb-1">
                          {language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                        </label>
                        <input
                          type="password"
                          value={checkoutConfirmPassword}
                          onChange={(e) => setCheckoutConfirmPassword(e.target.value)}
                          required
                          placeholder="••••••••"
                          className="w-full px-3.5 py-2 rounded-xl border border-[#c4c7c7] text-xs bg-white focus:outline-none focus:border-black transition-colors"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingCheckoutAuth}
                      className="w-full bg-[#000000] text-white py-3 rounded-xl font-bold text-xs hover:bg-[#2f3131] transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2 mt-1"
                    >
                      {isSubmittingCheckoutAuth ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>{language === 'ar' ? 'جاري إنشاء الحساب...' : 'Creating Account...'}</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-base">person_add</span>
                          <span>{language === 'ar' ? 'إنشاء حساب جديد وتأكيد الدخول' : 'Create Account & Continue'}</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {step === 'confirmation' ? (
        /* Order Confirmation View */
        <div className="max-w-2xl mx-auto py-10 text-center fade-in-up">
          <div className="w-16 h-16 bg-[#000000] text-white rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg">
            <span className="material-symbols-outlined text-[32px]">check</span>
          </div>
          <p className="font-label-caps text-[#2e7d32] font-bold text-[14px] mb-2">{t('checkout.successTitle', 'Order Confirmed!')}</p>
          <h2 className="font-display text-[30px] md:text-[42px] text-[#000000] mb-4 font-bold">
            {language === 'ar' ? 'شكراً لطلبك من TOUZA' : 'Thank You For Your Order'}
          </h2>
          <p className="font-body text-[16px] text-[#444748] mb-8 max-w-lg mx-auto leading-relaxed">
            {language === 'ar' ? 'شكراً لتسوقك من توزا (TOUZA).' : 'Thank you for shopping at TOUZA.'}{' '}
            {language === 'ar' ? 'رقم الطلب الخاص بك هو:' : 'Order ID:'}{' '}
            <strong className="text-[#000000] font-mono dir-ltr inline-block px-3 py-1 bg-gray-100 rounded-lg">{orderNumber}</strong>
          </p>

          {user && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 font-body text-[14px] rounded-xl font-medium inline-block text-start">
              {language === 'ar'
                ? `✓ تم حفظ طلبك بنجاح في حسابك (${user.email}). سنقوم بالتواصل معك لتأكيد الشحن.`
                : `✓ Your order has been saved securely to your account (${user.email}).`}
            </div>
          )}

          <div className="bg-[#f3f3f4] p-6 rounded-2xl text-right rtl:text-right ltr:text-left mb-8 space-y-3 border border-[#747878]/10">
            <div className="flex justify-between font-label-caps border-b border-[#c4c7c7]/40 pb-2 text-[14px]">
              <span>{t('checkout.fullName', 'Customer Name')}</span>
              <span className="text-[#000000] font-bold">{address.fullName}</span>
            </div>
            <div className="flex justify-between font-label-caps border-b border-[#c4c7c7]/40 pb-2 text-[14px]">
              <span>{t('checkout.street', 'Street Address')}</span>
              <span className="text-[#000000] font-bold">{address.street}, {address.city}</span>
            </div>
            <div className="flex justify-between font-label-caps border-b border-[#c4c7c7]/40 pb-2 text-[14px]">
              <span>{language === 'ar' ? 'طريقة الدفع' : 'Payment Method'}</span>
              <span className="text-[#000000] font-bold">
                {paymentMethod === 'cod' ? 'الدفع عند الاستلام (كاش)' : paymentMethod === 'instapay' ? 'إنستا باي (InstaPay)' : 'فودافون كاش (Vodafone Cash)'}
              </span>
            </div>
            <div className="flex justify-between font-label-caps text-[14px]">
              <span>{language === 'ar' ? 'موعد التوصيل المتوقع' : 'Estimated Delivery'}</span>
              <span className="text-[#000000] font-bold">{language === 'ar' ? 'خلال ٢-٤ أيام عمل' : '2-4 Business Days'}</span>
            </div>
          </div>

          <button
            onClick={onBackToShop}
            className="bg-[#000000] text-white py-4 px-10 font-label-caps rounded-xl hover:bg-[#2f3131] transition-colors shadow-md cursor-pointer text-[15px]"
          >
            {t('checkout.continueShopping', 'Continue Shopping')}
          </button>
        </div>
      ) : (
        /* Form & Summary Split */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Form Left Column */}
          <div className="lg:col-span-7 space-y-6">
            {submitError && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-[14px] rounded-xl font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">error</span>
                <span>{submitError}</span>
              </div>
            )}

            {step === 'shipping' && (
              <div className="space-y-5">
                <h2 className="font-display text-[22px] text-[#000000] border-b border-[#c4c7c7]/40 pb-3 font-bold">
                  {t('checkout.shippingTitle', 'Shipping Address')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block font-label-caps text-[#444748] text-[12px] mb-1">
                      {language === 'ar' ? 'الاسم بالكامل *' : 'Full Name *'}
                    </label>
                    <input
                      type="text"
                      placeholder={language === 'ar' ? 'أدخل اسمك الثلاثي' : 'Enter your full name'}
                      value={address.fullName}
                      onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                      className="w-full input-minimal py-2.5 px-3 border border-[#c4c7c7] rounded-lg text-[15px]"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block font-label-caps text-[#444748] text-[12px] mb-1">
                      {language === 'ar' ? 'العنوان / الشارع *' : 'Street Address *'}
                    </label>
                    <input
                      type="text"
                      placeholder={language === 'ar' ? 'اسم الشارع، رقم العمارة' : 'Street name, building number'}
                      value={address.street}
                      onChange={(e) => setAddress({ ...address, street: e.target.value })}
                      className="w-full input-minimal py-2.5 px-3 border border-[#c4c7c7] rounded-lg text-[15px]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-label-caps text-[#444748] text-[12px] mb-1">
                      {language === 'ar' ? 'الشقة / الدور' : 'Apartment / Floor'}
                    </label>
                    <input
                      type="text"
                      placeholder={language === 'ar' ? 'شقة 4، الدور 3' : 'Apt 4, 3rd Floor'}
                      value={address.apartment}
                      onChange={(e) => setAddress({ ...address, apartment: e.target.value })}
                      className="w-full input-minimal py-2.5 px-3 border border-[#c4c7c7] rounded-lg text-[15px]"
                    />
                  </div>
                  <div>
                    <label className="block font-label-caps text-[#444748] text-[12px] mb-1">
                      {language === 'ar' ? 'المدينة / المحافظة *' : 'City / Governorate *'}
                    </label>
                    <input
                      type="text"
                      placeholder={language === 'ar' ? 'القاهرة، الجيزة، الإسكندرية...' : 'Cairo, Giza, Alexandria...'}
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      className="w-full input-minimal py-2.5 px-3 border border-[#c4c7c7] rounded-lg text-[15px]"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block font-label-caps text-[#444748] text-[12px] mb-1">
                      {language === 'ar' ? 'رقم الهاتف للعد والتواصل *' : 'Phone Number *'}
                    </label>
                    <input
                      type="tel"
                      placeholder="010XXXXXXXX"
                      value={address.phone}
                      onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                      className="w-full input-minimal py-2.5 px-3 border border-[#c4c7c7] rounded-lg text-[15px] dir-ltr text-right rtl:text-right font-mono"
                      required
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleProceedToPayment}
                  className="w-full bg-[#000000] text-white py-4 rounded-xl font-label-caps hover:bg-[#2f3131] transition-all cursor-pointer shadow-md mt-4 text-[15px] font-bold"
                >
                  {language === 'ar' ? 'الانتقال إلى خيارات الدفع' : 'Continue to Payment'}
                </button>
              </div>
            )}

            {step === 'payment' && (
              <div className="space-y-5 fade-in-up">
                <h2 className="font-display text-[22px] text-[#000000] border-b border-[#c4c7c7]/40 pb-3 font-bold">
                  {language === 'ar' ? 'اختر طريقة الدفع' : 'Select Payment Method'}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Option 1: Cash on Delivery */}
                  {storeSettings?.enableCashOnDelivery !== false && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cod')}
                      className={`p-4 border rounded-xl font-label-caps text-[13px] flex flex-col items-center justify-center text-center gap-2 cursor-pointer transition-all ${
                        paymentMethod === 'cod'
                          ? 'border-[#000000] bg-[#000000] text-white font-bold shadow-md'
                          : 'border-[#c4c7c7] bg-white text-[#5e5e5c] hover:border-[#000000]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[24px]">payments</span>
                      <span>{language === 'ar' ? 'كاش عند الاستلام' : 'Cash on Delivery'}</span>
                    </button>
                  )}

                  {/* Option 2: InstaPay */}
                  {storeSettings?.enableInstaPay !== false && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('instapay')}
                      className={`p-4 border rounded-xl font-label-caps text-[13px] flex flex-col items-center justify-center text-center gap-2 cursor-pointer transition-all ${
                        paymentMethod === 'instapay'
                          ? 'border-[#000000] bg-[#000000] text-white font-bold shadow-md'
                          : 'border-[#c4c7c7] bg-white text-[#5e5e5c] hover:border-[#000000]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[24px]">account_balance</span>
                      <span>{language === 'ar' ? 'إنستا باي (InstaPay)' : 'InstaPay'}</span>
                    </button>
                  )}

                  {/* Option 3: Vodafone Cash */}
                  {storeSettings?.enableVodafoneCash !== false && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('vodafone_cash')}
                      className={`p-4 border rounded-xl font-label-caps text-[13px] flex flex-col items-center justify-center text-center gap-2 cursor-pointer transition-all ${
                        paymentMethod === 'vodafone_cash'
                          ? 'border-[#000000] bg-[#000000] text-white font-bold shadow-md'
                          : 'border-[#c4c7c7] bg-white text-[#5e5e5c] hover:border-[#000000]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[24px]">phonelink_ring</span>
                      <span>{language === 'ar' ? 'فودافون كاش' : 'Vodafone Cash'}</span>
                    </button>
                  )}
                </div>

                {/* Details box according to selected method */}
                {paymentMethod === 'cod' && storeSettings?.enableCashOnDelivery !== false && (
                  <div className="p-4 bg-[#f9f9f9] border border-[#c4c7c7]/30 rounded-xl space-y-2 text-[14px]">
                    <div className="flex items-center gap-2 text-[#2e7d32] font-bold">
                      <span className="material-symbols-outlined">check_circle</span>
                      <span>{language === 'ar' ? 'الدفع نقداً عند استلام الشحنة' : 'Pay Cash Upon Receipt'}</span>
                    </div>
                    <p className="text-[#5e5e5c] text-[13px] leading-relaxed">
                      {language === 'ar'
                        ? (storeSettings?.codInstructionsAr || 'ستقوم بدفع المبلغ الإجمالي للمندوب عند وصول الشحنة إلى عنوانك مباشرة.')
                        : (storeSettings?.codInstructionsEn || 'You will pay the exact total amount in cash directly to the courier upon delivery.')}
                    </p>
                  </div>
                )}

                {paymentMethod === 'instapay' && storeSettings?.enableInstaPay !== false && (
                  <div className="p-5 bg-purple-50 border border-purple-200 rounded-xl space-y-4 text-[14px]">
                    <div className="space-y-1">
                      <p className="font-bold text-purple-900 font-label-caps">
                        {language === 'ar' ? 'بيانات تحويل إنستا باي (InstaPay):' : 'InstaPay Transfer Details:'}
                      </p>
                      <div className="p-3 bg-white rounded-lg border border-purple-200 font-mono text-[14px] text-purple-950 space-y-1">
                        <p><strong>Account / IPA:</strong> {storeSettings?.instaPayAccount || storeSettings?.instaPayAddress || 'touza@instapay'}</p>
                        {storeSettings?.instaPayPhone && (
                          <p><strong>Phone Number:</strong> {storeSettings.instaPayPhone}</p>
                        )}
                        <p className="text-[12px] text-purple-700 font-sans">
                          {language === 'ar' ? `المبلغ المطلوب تحويله: ${formatPrice(total)}` : `Amount to transfer: ${formatPrice(total)}`}
                        </p>
                      </div>
                      {(storeSettings?.instaPayInstructionsAr || storeSettings?.instaPayInstructionsEn) && (
                        <p className="text-[#555] text-[13px] leading-relaxed pt-1 font-sans">
                          {language === 'ar' ? storeSettings.instaPayInstructionsAr : storeSettings.instaPayInstructionsEn}
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

                {paymentMethod === 'vodafone_cash' && storeSettings?.enableVodafoneCash !== false && (
                  <div className="p-5 bg-red-50 border border-red-200 rounded-xl space-y-4 text-[14px]">
                    <div className="space-y-1">
                      <p className="font-bold text-red-900 font-label-caps">
                        {language === 'ar' ? 'بيانات تحويل محفظة فودافون كاش:' : 'Vodafone Cash Wallet Details:'}
                      </p>
                      <div className="p-3 bg-white rounded-lg border border-red-200 font-mono text-[14px] text-red-950 space-y-1">
                        <p><strong>Wallet Number:</strong> {storeSettings?.vodafoneCashNumber || '01012345678'}</p>
                        <p className="text-[12px] text-red-700 font-sans">
                          {language === 'ar' ? `المبلغ المطلوب تحويله: ${formatPrice(total)}` : `Amount to transfer: ${formatPrice(total)}`}
                        </p>
                      </div>
                      {(storeSettings?.vodafoneCashInstructionsAr || storeSettings?.vodafoneCashInstructionsEn) && (
                        <p className="text-[#555] text-[13px] leading-relaxed pt-1 font-sans">
                          {language === 'ar' ? storeSettings.vodafoneCashInstructionsAr : storeSettings.vodafoneCashInstructionsEn}
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

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep('shipping')}
                    className="w-1/3 border border-[#000000] text-[#000000] py-3.5 rounded-xl font-label-caps hover:bg-[#f3f3f4] transition-colors cursor-pointer text-[14px]"
                  >
                    {language === 'ar' ? 'رجوع للعنوان' : 'Back'}
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting || !user}
                    onClick={handlePlaceOrder}
                    className={`w-2/3 py-3.5 rounded-xl font-label-caps font-bold transition-all shadow-md text-[15px] flex items-center justify-center gap-2 cursor-pointer ${
                      !user
                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        : 'bg-[#000000] text-white hover:bg-[#2f3131]'
                    }`}
                  >
                    {isSubmitting ? (
                      <span>{language === 'ar' ? 'جاري تأكيد الطلب وحفظه...' : 'Saving Order...'}</span>
                    ) : (
                      <span>
                        {t('checkout.placeOrder', 'تاكيد الطلب الآن')} ({formatPrice(total)})
                      </span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column Order Summary */}
          <div className="lg:col-span-5 bg-[#ffffff] border border-[#c4c7c7]/40 p-6 rounded-2xl h-fit space-y-5 shadow-xs">
            <h2 className="font-display text-[20px] text-[#000000] border-b border-[#c4c7c7]/30 pb-3 font-bold">
              {t('checkout.orderSummary', 'Order Summary')} ({cartItems.reduce((acc, item) => acc + item.quantity, 0)})
            </h2>

            {/* Items List */}
            <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
              {cartItems.map((item) => {
                const name = getLocalizedProductName(item.product, language);
                return (
                  <div key={item.id} className="flex gap-3 items-center">
                    <img
                      src={item.product.images[0]}
                      alt={name}
                      className="w-14 h-16 object-cover bg-[#f3f3f4] shrink-0 rounded-md border border-[#747878]/10"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-display text-[15px] text-[#000000] truncate font-medium">
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

            {/* Promo Code Input */}
            <form onSubmit={handleApplyPromo} className="pt-2 border-t border-[#c4c7c7]/30">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={language === 'ar' ? 'كود خصم (مثال: ELEGAN10)' : 'Privilege Code (e.g. ELEGAN10)'}
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 input-minimal text-[13px] py-1.5 px-3 border border-[#c4c7c7] rounded-lg"
                />
                <button
                  type="submit"
                  className="bg-[#000000] text-white px-4 py-1.5 font-label-caps text-[12px] rounded-lg hover:bg-[#2f3131] transition-colors cursor-pointer"
                >
                  {language === 'ar' ? 'تطبيق' : 'Apply'}
                </button>
              </div>
              {promoError && (
                <p className="text-[12px] text-[#ba1a1a] mt-1 font-body">{promoError}</p>
              )}
              {promoSuccess && (
                <p className="text-[12px] text-[#2e7d32] mt-1 font-body font-medium">
                  {promoSuccess}
                </p>
              )}
            </form>

            {/* Price Calculations */}
            <div className="border-t border-[#c4c7c7]/30 pt-3 space-y-2 font-body text-[14px]">
              <div className="flex justify-between text-[#444748]">
                <span>{t('cart.subtotal', 'Subtotal')}</span>
                <span className="text-[#000000] font-bold dir-ltr">{formatPrice(subtotal)}</span>
              </div>
              {discountPercent > 0 && (
                <div className="flex justify-between text-[#2e7d32]">
                  <span>خصم كود التخفيض ({discountPercent}%)</span>
                  <span className="dir-ltr">-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#444748]">
                <span>{t('cart.delivery', 'Express Shipping')}</span>
                <span className="text-[#2e7d32] font-bold">{t('cart.free', 'Complimentary')}</span>
              </div>

              <div className="flex justify-between font-display text-[20px] text-[#000000] pt-3 border-t border-[#c4c7c7]/30 font-bold">
                <span>{t('checkout.total', 'Total')}</span>
                <span className="dir-ltr">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
