import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { StoreSettings } from '../types';
import { SocialLinks } from './SocialLinks';

interface FooterProps {
  onNavigate?: (view: 'shop', category?: string) => void;
  onOpenPolicyModal?: (title: string, content: string) => void;
  storeSettings?: StoreSettings;
}

const FooterComponent: React.FC<FooterProps> = ({
  onOpenPolicyModal,
  storeSettings,
}) => {
  const { language, t } = useLanguage();

  const handleLinkClick = (title: string, content: string) => {
    if (onOpenPolicyModal) {
      onOpenPolicyModal(title, content);
    }
  };

  const copyrightNotice =
    (language === 'ar' ? storeSettings?.copyrightAr : storeSettings?.copyrightEn) ||
    (language === 'ar'
      ? 'جميع الحقوق محفوظة - سليمان ميديا - ٢٠٢٦'
      : 'ALL COPYRIGHT SOLIMAN MEDIA 2026');

  const shippingText =
    (language === 'ar' ? storeSettings?.shippingAr : storeSettings?.shippingEn) ||
    (language === 'ar'
      ? 'نوفر خدمة التوصيل السريع لجميع محافظات مصر.'
      : 'Express delivery nationwide across Egypt.');

  const returnsText =
    (language === 'ar' ? storeSettings?.returnsAr : storeSettings?.returnsEn) ||
    (language === 'ar'
      ? 'يمكنكم الاستبدال أو الاسترجاع خلال 14 يوماً من تاريخ الاستلام.'
      : 'Returns accepted within 14 days of delivery.');

  const privacyText =
    (language === 'ar' ? storeSettings?.privacyAr : storeSettings?.privacyEn) ||
    (language === 'ar'
      ? 'تلتزم توزا بحماية بياناتكم الشخصية وعدم مشاركتها مع أطراف خارجية إلا لغرض الشحن.'
      : 'TOUZA respects your privacy and stores personal data securely.');

  const contactText =
    (language === 'ar' ? storeSettings?.contactAr : storeSettings?.contactEn) ||
    (language === 'ar'
      ? 'للطلب والاستفسار : 01070606272 📲\nالعنوان : بورسعيد شارع ٢٣ يوليو امام قاعة البوريفاج \nيوجد شحن لجميع المحافظات 🚚'
      : 'For orders and inquiries: 01070606272 📲\nAddress: Port Said, 23 July Street, opposite Al Bourivage Hall.');

  const branchesText =
    (language === 'ar' ? storeSettings?.branchesAr : storeSettings?.branchesEn) ||
    (language === 'ar'
      ? 'العنوان : بورسعيد شارع ٢٣ يوليو امام قاعة البوريفاج | شحن لجميع المحافظات 🚚'
      : 'Port Said, 23 July Street, opposite Al Bourivage Hall | Shipping nationwide 🚚');

  return (
    <footer id="footer" className="bg-[#ffffff] w-full py-12 px-6 md:px-16 border-t border-[#747878]/15">
      <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left rtl:md:text-right">
        {/* Brand & Copyright */}
        <div className="flex flex-col items-center md:items-start space-y-1.5">
          <div className="font-display text-[24px] md:text-[28px] text-[#000000] font-bold tracking-wider">
            {language === 'ar'
              ? (storeSettings?.storeNameAr || 'توزا TOUZA')
              : (storeSettings?.storeNameEn || 'TOUZA CASUAL')}
          </div>
          <p className="font-body text-[13px] text-[#747878]">
            {language === 'ar'
              ? (storeSettings?.taglineAr || 'ملابس كاجوال رجالي فاخرة - بورسعيد | مصر')
              : (storeSettings?.taglineEn || 'Luxury Men Casual Wear - Portsaid | Egypt')}
          </p>
          <div className="pt-2 font-body text-[12px] text-[#555555] font-medium tracking-wide">
            {copyrightNotice}
          </div>
        </div>

        {/* Navigation Links & Social Media */}
        <div className="flex flex-col md:items-end gap-4">
          <div className="flex flex-wrap justify-center md:justify-end gap-x-6 lg:gap-x-8 gap-y-3 items-center">
            <button
              onClick={() =>
                handleLinkClick(
                  language === 'ar' ? 'معلومات الشحن والتوصيل' : 'Shipping Information',
                  shippingText
                )
              }
              className="font-label-caps text-[#444748] hover:text-[#000000] transition-colors cursor-pointer text-[13px]"
            >
              {language === 'ar' ? 'الشحن والتوصيل' : 'Shipping'}
            </button>
            <button
              onClick={() =>
                handleLinkClick(
                  language === 'ar' ? 'سياسة الاستبدال واسترجاع' : 'Returns & Exchanges',
                  returnsText
                )
              }
              className="font-label-caps text-[#444748] hover:text-[#000000] transition-colors cursor-pointer text-[13px]"
            >
              {language === 'ar' ? 'الاسترجاع والاستبدال' : 'Returns'}
            </button>
            <button
              onClick={() =>
                handleLinkClick(
                  language === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy',
                  privacyText
                )
              }
              className="font-label-caps text-[#444748] hover:text-[#000000] transition-colors cursor-pointer text-[13px]"
            >
              {language === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}
            </button>
            <button
              onClick={() =>
                handleLinkClick(
                  language === 'ar' ? 'تواصل معنا وخدمة العملاء' : 'Contact Us',
                  contactText
                )
              }
              className="font-label-caps text-[#444748] hover:text-[#000000] transition-colors cursor-pointer text-[13px]"
            >
              {t('nav.contact', 'تواصل معنا')}
            </button>
          </div>

          <div className="flex items-center justify-center md:justify-end gap-3 pt-1">
            <span className="font-label-caps text-[11px] text-[#747878]">
              {language === 'ar' ? 'وسائل التواصل:' : 'FOLLOW ATELIER:'}
            </span>
            <SocialLinks variant="horizontal" storeSettings={storeSettings} />
          </div>
        </div>
      </div>
    </footer>
  );
};

export const Footer = React.memo(FooterComponent);

