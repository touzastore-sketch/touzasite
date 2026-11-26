import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { StoreSettings } from '../types';
import { SocialLinks } from './SocialLinks';
import { addNewsletterSubscriber } from '../firebase';
import { formatWhatsAppNumber } from '../utils/whatsapp';

interface FooterProps {
  onNavigate?: (view: 'shop', category?: string) => void;
  onOpenPolicyModal?: (title: string, content: string) => void;
  storeSettings?: StoreSettings;
}

const FooterComponent: React.FC<FooterProps> = ({
  onNavigate,
  onOpenPolicyModal,
  storeSettings,
}) => {
  const { language, t } = useLanguage();
  const isAr = language === 'ar';

  const [subName, setSubName] = useState('');
  const [subEmail, setSubEmail] = useState('');
  const [subPhone, setSubPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleLinkClick = (title: string, content: string) => {
    if (onOpenPolicyModal) {
      onOpenPolicyModal(title, content);
    }
  };

  const handleDiscountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subEmail.trim()) return;
    setSubmitting(true);
    try {
      await addNewsletterSubscriber(subEmail.trim());
    } catch (err) {
      console.error('Newsletter save error:', err);
    } finally {
      setSubmitting(false);
      setSubscribed(true);
      setSubName('');
      setSubEmail('');
      setSubPhone('');
    }
  };

  const stripEmojis = (str?: string): string =>
    (str || '')
      .replace(/\p{Extended_Pictographic}|\uFE0F|\u200D/gu, '')
      .replace(/[ \t]{2,}/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

  const copyrightNotice =
    stripEmojis(isAr ? storeSettings?.copyrightAr : storeSettings?.copyrightEn) ||
    (isAr
      ? 'جميع الحقوق محفوظة - توزا ٢٠٢٦'
      : '© 2026 TOUZA. ALL RIGHTS RESERVED.');

  const shippingText =
    stripEmojis(isAr ? storeSettings?.shippingAr : storeSettings?.shippingEn) ||
    (isAr
      ? 'نوفر خدمة التوصيل السريع لجميع محافظات مصر.'
      : 'Express delivery nationwide across Egypt.');

  const returnsText =
    stripEmojis(isAr ? storeSettings?.returnsAr : storeSettings?.returnsEn) ||
    (isAr
      ? 'يمكنكم الاستبدال أو الاسترجاع خلال 14 يوماً من تاريخ الاستلام.'
      : 'Returns accepted within 14 days of delivery.');

  const privacyText =
    stripEmojis(isAr ? storeSettings?.privacyAr : storeSettings?.privacyEn) ||
    (isAr
      ? 'تلتزم توزا بحماية بياناتكم الشخصية وعدم مشاركتها مع أطراف خارجية إلا لغرض الشحن.'
      : 'TOUZA respects your privacy and stores personal data securely.');

  const contactText =
    stripEmojis(isAr ? storeSettings?.contactAr : storeSettings?.contactEn) ||
    (isAr
      ? 'للطلب والاستفسار : 01070606272\nالعنوان : بورسعيد شارع ٢٣ يوليو امام قاعة البوريفاج\nيوجد شحن لجميع المحافظات'
      : 'For orders and inquiries: 01070606272\nAddress: Port Said, 23 July Street, opposite Al Bourivage Hall.');

  const branchesText = stripEmojis(isAr ? storeSettings?.branchesAr : storeSettings?.branchesEn);

  const newsletterTitle =
    stripEmojis(isAr ? storeSettings?.newsletterTitleAr : storeSettings?.newsletterTitleEn) ||
    (isAr ? 'احصل على خصم ١٠٪ على أول طلب' : 'Get 10% off your first order');

  const newsletterSubtitle =
    stripEmojis(isAr ? storeSettings?.newsletterSubtitleAr : storeSettings?.newsletterSubtitleEn) ||
    (isAr
      ? 'سجّل بياناتك لتصلك أحدث إصدارات توزا الرجالية والعروض الخاصة قبل الجميع.'
      : 'Sign up to our newsletter and be the first to hear about new seasonal launches and private offers.');

  const whatsappDigits = formatWhatsAppNumber(storeSettings?.whatsappNumber || '01070606272');
  const whatsappUrl = `https://wa.me/${whatsappDigits}`;

  return (
    <footer id="footer" className="bg-[#ecebe7] text-[#111111] w-full border-t border-[#dcd9d1]">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 md:px-14 pt-14 md:pt-20 pb-12">
        {/* Top Row: Iconic Oversized Serif Wordmark */}
        <div className="mb-12 md:mb-16">
          <div className="brand-wordmark text-[50px] sm:text-[64px] md:text-[74px] leading-[0.95] text-[#111111] font-normal">
            TOUZA
          </div>
          <div className="font-editorial text-[28px] sm:text-[36px] md:text-[42px] leading-[1.2] text-[#111111]/85 font-normal mt-1">
            {isAr ? 'للأزياء الرجالية' : '& Essentials'}
          </div>
        </div>

        {/* Main Split Grid: Left (Links + Contact) | Right (Get Discount Form) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Half: 2 Clean Vertical Columns (Links & Contact) */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-8 sm:gap-12">
            {/* Column 1: Links */}
            <ul className="space-y-2.5 text-[14px] font-body text-[#222222]">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate?.('shop', 'All')}
                  className="hover:underline underline-offset-4 cursor-pointer text-start"
                >
                  {isAr ? 'جميع القطع' : 'Shop All'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate?.('shop', 'New Arrivals')}
                  className="hover:underline underline-offset-4 cursor-pointer text-start"
                >
                  {isAr ? 'وصل حديثاً' : 'New Arrivals'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() =>
                    handleLinkClick(
                      isAr ? 'سياسة الاستبدال والاسترجاع' : 'Returns & refunds',
                      returnsText
                    )
                  }
                  className="hover:underline underline-offset-4 cursor-pointer text-start"
                >
                  {isAr ? 'الاسترجاع والاستبدال' : 'Returns & refunds'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() =>
                    handleLinkClick(
                      isAr ? 'معلومات الشحن والتوصيل' : 'Shipping & delivery',
                      shippingText
                    )
                  }
                  className="hover:underline underline-offset-4 cursor-pointer text-start"
                >
                  {isAr ? 'الشحن والتوصيل' : 'Shipping & delivery'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() =>
                    handleLinkClick(
                      isAr ? 'تواصل معنا والطلبات' : 'Orders & WhatsApp',
                      contactText
                    )
                  }
                  className="hover:underline underline-offset-4 cursor-pointer text-start"
                >
                  {isAr ? 'الطلبات والدفع' : 'Orders & payment'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() =>
                    handleLinkClick(
                      isAr ? 'سياسة الخصوصية' : 'Privacy Policy',
                      privacyText
                    )
                  }
                  className="hover:underline underline-offset-4 cursor-pointer text-start"
                >
                  {isAr ? 'سياسة الخصوصية' : 'Privacy Policy'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() =>
                    handleLinkClick(
                      isAr ? 'تواصل معنا' : 'Contact Us',
                      contactText
                    )
                  }
                  className="hover:underline underline-offset-4 cursor-pointer text-start"
                >
                  {t('nav.contact', 'تواصل معنا')}
                </button>
              </li>
            </ul>

            {/* Column 2: Contact & Atelier Address */}
            <div className="space-y-4 text-[14px] font-body text-[#222222]">
              <h3 className="text-[12px] tracking-[0.12em] uppercase text-[#111111] font-medium">
                {isAr ? 'تواصل معنا' : 'CONTACT'}
              </h3>

              <div className="space-y-1.5 leading-[1.7] text-[#333333]">
                <p className="font-medium text-[#111111]">TOUZA</p>
                {branchesText ? (
                  <p className="whitespace-pre-line">{branchesText}</p>
                ) : (
                  <>
                    <p>{isAr ? 'بورسعيد — شارع ٢٣ يوليو' : 'Port Said, 23 July Street'}</p>
                    <p>{isAr ? 'أمام قاعة البوريفاج' : 'Opposite Al Bourivage Hall'}</p>
                    <p>{isAr ? 'مصر' : 'Egypt'}</p>
                  </>
                )}
              </div>

              <div>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4 text-[#111111] hover:opacity-70 transition-opacity dir-ltr inline-block tabular-nums"
                >
                  WhatsApp: {storeSettings?.whatsappNumber || '01070606272'}
                </a>
              </div>

              <div className="pt-2 opacity-75">
                <SocialLinks variant="horizontal" storeSettings={storeSettings} />
              </div>
            </div>
          </div>

          {/* Right Half: Bread & Boxers Signature 3-Field Discount Newsletter Form */}
          <div className="lg:col-span-6 space-y-5 max-w-xl">
            <h2 className="font-editorial text-[34px] sm:text-[42px] leading-[1.1] text-[#111111] font-normal">
              {newsletterTitle}
            </h2>

            <p className="font-body text-[14px] sm:text-[15px] text-[#333333] leading-[1.7]">
              {newsletterSubtitle}
            </p>

            {subscribed ? (
              <div className="p-4 border border-[#111111] bg-white/60 text-[#111111] font-body text-[14px]">
                {isAr
                  ? 'تم تسجيلك بنجاح! ستصلك عروض توزا الخاصة قريباً.'
                  : 'You’re on the list. Welcome to TOUZA.'}
              </div>
            ) : (
              <form onSubmit={handleDiscountSubmit} className="space-y-3 pt-1">
                <input
                  type="text"
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  placeholder={isAr ? 'الاسم' : 'NAME'}
                  className="w-full h-[46px] px-4 bg-transparent border border-[#333333]/65 rounded-none text-[13px] text-[#111111] placeholder:text-[#555555] placeholder:tracking-[0.1em] focus:border-[#111111] focus:outline-none"
                />
                <input
                  type="email"
                  required
                  value={subEmail}
                  onChange={(e) => setSubEmail(e.target.value)}
                  placeholder={isAr ? 'البريد الإلكتروني' : 'EMAIL'}
                  className="w-full h-[46px] px-4 bg-transparent border border-[#333333]/65 rounded-none text-[13px] text-[#111111] placeholder:text-[#555555] placeholder:tracking-[0.1em] focus:border-[#111111] focus:outline-none"
                />
                <input
                  type="tel"
                  value={subPhone}
                  onChange={(e) => setSubPhone(e.target.value)}
                  placeholder={isAr ? 'رقم الهاتف (واتساب)' : 'PHONE'}
                  className="w-full h-[46px] px-4 bg-transparent border border-[#333333]/65 rounded-none text-[13px] text-[#111111] placeholder:text-[#555555] placeholder:tracking-[0.1em] focus:border-[#111111] focus:outline-none"
                />
                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-7 h-[46px] bg-transparent border border-[#333333]/80 text-[#111111] hover:bg-[#111111] hover:text-white transition-colors duration-200 rounded-none text-[12px] tracking-[0.12em] uppercase font-medium cursor-pointer disabled:opacity-50"
                  >
                    {submitting
                      ? isAr
                        ? 'جاري التسجيل...'
                        : 'SENDING...'
                      : isAr
                      ? 'احصل على الخصم'
                      : 'GET MY DISCOUNT'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Quiet Copyright Bottom Line */}
        <div className="mt-14 pt-6 border-t border-[#d5d2ca] flex flex-col sm:flex-row justify-between items-center gap-3 text-[12px] font-body text-[#6e6c68]">
          <span>{copyrightNotice}</span>
          <span className="tracking-[0.14em] uppercase text-[#111111]/80 font-medium">
            {isAr ? 'توزا للأزياء الرجالية • TOUZA' : 'TOUZA MENSWEAR'}
          </span>
        </div>
      </div>
    </footer>
  );
};

export const Footer = React.memo(FooterComponent);
