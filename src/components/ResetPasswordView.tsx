import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, KeyRound, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { verifyResetCode, confirmNewPassword } from '../firebase';

interface ResetPasswordViewProps {
  onOpenLogin: () => void;
  onNavigateHome: () => void;
  initialOobCode?: string | null;
}

export const ResetPasswordView: React.FC<ResetPasswordViewProps> = ({
  onOpenLogin,
  onNavigateHome,
  initialOobCode,
}) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [oobCode, setOobCode] = useState<string | null>(initialOobCode || null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isVerifyingCode, setIsVerifyingCode] = useState<boolean>(true);
  const [codeError, setCodeError] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Extract oobCode from URL if not explicitly passed
  useEffect(() => {
    let codeToUse = initialOobCode;

    if (!codeToUse && typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(
        window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash
      );
      codeToUse = searchParams.get('oobCode') || hashParams.get('oobCode');
    }

    setOobCode(codeToUse || null);

    if (!codeToUse) {
      setIsVerifyingCode(false);
      setCodeError(
        isAr
          ? 'رمز إعادة الضبط غير موجود في الرابط. يرجى استخدام الرابط المرسل إلى بريدك الإلكتروني.'
          : 'Reset code is missing in the URL. Please use the link sent to your email.'
      );
      return;
    }

    // Verify code with Firebase Auth
    let isSubscribed = true;
    setIsVerifyingCode(true);
    setCodeError(null);

    verifyResetCode(codeToUse)
      .then((email) => {
        if (isSubscribed) {
          setUserEmail(email);
          setIsVerifyingCode(false);
        }
      })
      .catch((err: any) => {
        console.error('[ResetPasswordView] Code verification failed:', err);
        if (isSubscribed) {
          setIsVerifyingCode(false);
          const errorCode = err?.code || '';
          if (errorCode === 'auth/expired-action-code') {
            setCodeError(
              isAr
                ? 'رابط إعادة ضبط كلمة المرور انتهت صلاحيته. يرجى طلب رابط جديد.'
                : 'The password reset link has expired. Please request a new one.'
            );
          } else if (errorCode === 'auth/invalid-action-code') {
            setCodeError(
              isAr
                ? 'رابط إعادة ضبط كلمة المرور غير صالح أو تمت استخدامه سابقاً.'
                : 'The password reset link is invalid or has already been used.'
            );
          } else if (errorCode === 'auth/user-disabled') {
            setCodeError(
              isAr
                ? 'تم تعطيل هذا الحساب. يرجى التواصل مع الدعم الفني.'
                : 'This user account has been disabled.'
            );
          } else {
            setCodeError(
              isAr
                ? 'فشل التحقق من رابط إعادة الضبط. يرجى المحاولة لاحقاً.'
                : 'Failed to verify the reset code. Please try again later.'
            );
          }
        }
      });

    return () => {
      isSubscribed = false;
    };
  }, [initialOobCode, isAr]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!oobCode) {
      setSubmitError(
        isAr
          ? 'رمز إعادة الضبط غير موجود في الرابط'
          : 'Reset code is missing'
      );
      return;
    }

    if (newPassword.length < 6) {
      setSubmitError(
        isAr
          ? 'يجب أن تحتوي كلمة المرور على 6 أحرف أو أرقام على الأقل'
          : 'Password must be at least 6 characters'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setSubmitError(
        isAr
          ? 'كلمتا المرور غير متطابقتين'
          : 'Passwords do not match'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('[ResetPasswordView] Confirming password reset for code:', oobCode);
      await confirmNewPassword(oobCode, newPassword);
      console.log('[ResetPasswordView] Password reset successfully confirmed!');
      setIsSuccess(true);
    } catch (err: any) {
      console.error('[ResetPasswordView] Password confirm error:', err);
      const errorCode = err?.code || '';
      let msg = isAr
        ? 'فشل تعيين كلمة المرور الجديدة. يرجى المحاولة لاحقاً.'
        : 'Failed to reset password. Please try again later.';

      if (errorCode === 'auth/expired-action-code') {
        msg = isAr
          ? 'رابط إعادة الضبط انتهت صلاحيته. يرجى طلب رابط جديد.'
          : 'The reset link has expired. Please request a new one.';
      } else if (errorCode === 'auth/invalid-action-code') {
        msg = isAr
          ? 'رابط إعادة الضبط غير صالح أو مستخدم مسبقاً.'
          : 'The reset link is invalid or already used.';
      } else if (errorCode === 'auth/weak-password') {
        msg = isAr
          ? 'كلمة المرور ضعيفة جداً. استخدم كلمة مرور أقوى.'
          : 'Password is too weak. Please choose a stronger password.';
      }

      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-16 px-4 bg-[#fafafa]">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-[#c5a059]/30 p-8 sm:p-10 relative overflow-hidden">
        {/* Brand Accent Top Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#000000] via-[#c5a059] to-[#000000]" />

        {/* Header Icon & Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-[#000000]/5 border border-[#c5a059]/40 flex items-center justify-center mx-auto mb-4 text-[#000000] shadow-2xs">
            <KeyRound className="w-8 h-8 text-[#c5a059]" />
          </div>
          <h2 className="font-display text-2xl font-bold text-[#000000] mb-2">
            {isAr ? 'إعادة ضبط كلمة المرور' : 'Reset Your Password'}
          </h2>
          <p className="font-body text-sm text-[#747878]">
            {isAr
              ? 'توزا كاجوال • حماية وأمان حسابك'
              : 'TOUZA Casual • Secure Your Account'}
          </p>
        </div>

        {/* State 1: Verifying Reset Link */}
        {isVerifyingCode && (
          <div className="py-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-full border-2 border-[#c5a059]/30 border-t-[#c5a059] animate-spin mx-auto" />
            <p className="font-body text-sm text-[#444748] font-semibold">
              {isAr ? 'جاري التحقق من صحة رابط إعادة الضبط...' : 'Verifying reset link...'}
            </p>
          </div>
        )}

        {/* State 2: Invalid or Expired Link Error */}
        {!isVerifyingCode && codeError && (
          <div className="space-y-6 text-center">
            <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-sm rounded-xl flex items-start gap-3 text-start">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold mb-1">{isAr ? 'عفواً، تعذر الاستمرار' : 'Unable to proceed'}</p>
                <p className="text-xs leading-relaxed">{codeError}</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={onOpenLogin}
                className="w-full py-3.5 bg-[#000000] text-white font-label-caps rounded-xl text-sm font-bold shadow-md hover:bg-[#222222] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{isAr ? 'طلب رابط جديد (نسيت كلمة المرور)' : 'Request New Reset Link'}</span>
              </button>
              <button
                type="button"
                onClick={onNavigateHome}
                className="w-full py-3 border border-[#c4c7c7] text-[#000000] font-label-caps rounded-xl text-sm font-semibold hover:bg-black/5 transition-all cursor-pointer"
              >
                {isAr ? 'العودة للصفحة الرئيسية' : 'Return to Home'}
              </button>
            </div>
          </div>
        )}

        {/* State 3: Password Changed Successfully */}
        {!isVerifyingCode && !codeError && isSuccess && (
          <div className="space-y-6 text-center">
            <div className="p-5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex flex-col items-center gap-3">
              <CheckCircle className="w-12 h-12 text-emerald-600 shrink-0" />
              <div>
                <h3 className="font-bold text-base mb-1">
                  {isAr ? 'تم تغيير كلمة المرور بنجاح!' : 'Password Reset Successful!'}
                </h3>
                <p className="text-xs text-emerald-700 leading-relaxed">
                  {isAr
                    ? 'يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة الخاصة بك.'
                    : 'You can now sign in using your new password.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenLogin}
              className="w-full py-4 bg-[#000000] text-white font-label-caps rounded-xl text-sm font-bold shadow-lg hover:bg-[#222222] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{isAr ? 'تسجيل الدخول الآن 🔓' : 'Sign In Now 🔓'}</span>
            </button>
          </div>
        )}

        {/* State 4: Active Form to Enter New Password */}
        {!isVerifyingCode && !codeError && !isSuccess && (
          <form onSubmit={handleSubmit} className="space-y-5">
            {userEmail && (
              <div className="p-3 bg-[#fafafa] border border-[#c4c7c7]/50 rounded-xl text-xs text-[#444748] flex items-center justify-between dir-ltr">
                <span className="font-semibold text-[#000000]">{userEmail}</span>
                <span className="text-[10px] uppercase font-bold text-[#c5a059] bg-black px-2 py-0.5 rounded">
                  {isAr ? 'البريد الإلكتروني' : 'Account Email'}
                </span>
              </div>
            )}

            {submitError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {/* New Password Input */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#000000] uppercase font-label-caps">
                {isAr ? 'كلمة المرور الجديدة' : 'New Password'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#747878]" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-3 text-sm bg-white border border-[#c4c7c7] rounded-xl focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#747878] hover:text-[#000000]"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password Input */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#000000] uppercase font-label-caps">
                {isAr ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#747878]" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-3 text-sm bg-white border border-[#c4c7c7] rounded-xl focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#747878] hover:text-[#000000]"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-[#000000] text-white font-label-caps rounded-xl text-sm font-bold shadow-md hover:bg-[#222222] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>{isAr ? 'جاري الحفظ...' : 'Saving...'}</span>
                </>
              ) : (
                <>
                  <span>{isAr ? 'تأكيد كلمة المرور الجديدة' : 'Reset Password'}</span>
                  <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
