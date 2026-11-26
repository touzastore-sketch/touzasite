import React, { useState, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import {
  ShoppingBag,
  Heart,
  Maximize2,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Star,
  MessageSquare,
  CheckCircle2,
  Check,
  MessageCircle,
} from 'lucide-react';
import { Product, StoreSettings } from '../types';
import { ProductCard } from './ProductCard';
import {
  getLocalizedProductName,
  getLocalizedProductCategory,
  getLocalizedProductDescription,
  getLocalizedProductDetails,
} from '../data/products';
import { useLanguage } from '../context/LanguageContext';
import { subscribeToProductReviews, saveProductReview, SavedReview } from '../firebase';
import { getOptimizedImageUrl } from '../utils/cloudinary';
import { trackTikTokViewContent } from '../utils/tiktokPixel';
import { getDirectProductWhatsAppUrl } from '../utils/whatsapp';
import { triggerFlyToCart } from '../utils/flyToCart';

interface ProductDetailProps {
  product: Product;
  products?: Product[];
  storeSettings?: StoreSettings;
  onAddToCart: (product: Product, color: string, size: string) => void;
  onBuyNow: (product: Product, color: string, size: string) => void;
  onSelectProduct: (product: Product) => void;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
  onOpenImageModal: (imageSrc: string) => void;
  onOpenSizeGuide: () => void;
  user?: User | null;
  onSignInGoogle?: () => Promise<void>;
  onNavigate?: (view: any, category?: string) => void;
}

const FALLBACK_SVG =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400"><rect width="100%" height="100%" fill="%23f4f3f0"/><text x="50%" y="50%" fill="%238c8984" font-family="sans-serif" font-size="14" letter-spacing="4" text-anchor="middle">TOUZA</text></svg>';

export const ProductDetail: React.FC<ProductDetailProps> = ({
  product,
  products = [],
  storeSettings,
  onAddToCart,
  onBuyNow,
  onSelectProduct,
  isWishlisted,
  onToggleWishlist,
  onOpenImageModal,
  onOpenSizeGuide,
  user,
  onNavigate,
}) => {
  const { language, formatPrice, t } = useLanguage();
  const isAr = language === 'ar';
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [justAdded, setJustAdded] = useState(false);
  const mainImgRef = useRef<HTMLImageElement>(null);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.name || 'Noir');
  const activeColorObj =
    product.colors?.find((c) => c.name === selectedColor) || product.colors?.[0];
  const activeSizes =
    activeColorObj?.sizes && activeColorObj.sizes.length > 0
      ? activeColorObj.sizes
      : product.sizes || [];

  const [selectedSize, setSelectedSize] = useState(
    activeSizes.find((s) => s.inStock)?.size || activeSizes[0]?.size || 'M'
  );
  const [activeColorImage, setActiveColorImage] = useState<string | null>(
    product.colors[0]?.imageUrl || null
  );

  useEffect(() => {
    if (product?.colors && product.colors.length > 0) {
      const firstCol = product.colors[0];
      setSelectedColor(firstCol.name);
      setActiveColorImage(firstCol.imageUrl || null);
      setSelectedImageIndex(0);
      const firstSizes =
        firstCol.sizes && firstCol.sizes.length > 0 ? firstCol.sizes : product.sizes;
      const initialSize =
        firstSizes?.find((s) => s.inStock)?.size || firstSizes?.[0]?.size || 'M';
      setSelectedSize(initialSize);
    }
    if (product) {
      trackTikTokViewContent(product, 1, 'EGP');
    }
  }, [product?.id]);

  const handleSelectColor = (colorObj: {
    name: string;
    nameAr?: string;
    hex: string;
    imageUrl?: string;
    sizes?: any[];
  }) => {
    setSelectedColor(colorObj.name);
    if (colorObj.imageUrl) {
      setActiveColorImage(colorObj.imageUrl);
    }
    const colorSizes =
      colorObj.sizes && colorObj.sizes.length > 0 ? colorObj.sizes : product.sizes;
    if (colorSizes && colorSizes.length > 0) {
      const currentMatch = colorSizes.find((s) => s.size === selectedSize && s.inStock);
      if (!currentMatch) {
        const firstInStock = colorSizes.find((s) => s.inStock)?.size || colorSizes[0]?.size;
        if (firstInStock) setSelectedSize(firstInStock);
      }
    }
  };

  const [openAccordions, setOpenAccordions] = useState<{ [key: string]: boolean }>({
    description: true,
    details: false,
    shipping: false,
  });

  const [reviews, setReviews] = useState<SavedReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);

  useEffect(() => {
    if (product?.id) {
      setLoadingReviews(true);
      const unsubscribe = subscribeToProductReviews(product.id, (data) => {
        setReviews(data);
        setLoadingReviews(false);
      });
      return () => unsubscribe();
    }
  }, [product?.id]);

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmittingReview(true);
    try {
      const finalName =
        reviewerName.trim() ||
        user?.displayName ||
        user?.email?.split('@')[0] ||
        (isAr ? 'عميل توزا' : 'TOUZA Client');
      const userPhoto =
        user?.photoURL ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600';

      const saved = await saveProductReview({
        productId: product.id,
        productTitle: getLocalizedProductName(product, language),
        rating: newRating,
        comment: newComment.trim(),
        userId: user?.uid || 'guest_' + Date.now(),
        userName: finalName,
        userPhoto,
      });

      setReviews((prev) => [saved, ...prev]);
      setNewComment('');
      setReviewerName('');
      setReviewMessage(
        isAr ? 'تم إضافة تقييمك بنجاح. شكراً لك.' : 'Your review has been submitted. Thank you.'
      );
      setTimeout(() => setReviewMessage(null), 3500);
    } catch (err) {
      console.error('Failed to submit review:', err);
      setReviewMessage(
        isAr ? 'تم استلام تقييمك بنجاح. شكراً لك.' : 'Your review has been submitted. Thank you.'
      );
      setTimeout(() => setReviewMessage(null), 3500);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const toggleAccordion = (key: string) => {
    setOpenAccordions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const colorImagesList = (product.colors || [])
    .map((c) => c.imageUrl)
    .filter((img): img is string => Boolean(img));
  const galleryImages = Array.from(new Set([...colorImagesList, ...(product.images || [])]));

  const currentImage =
    activeColorImage || galleryImages[selectedImageIndex] || product.images[0] || '';

  const displayName = getLocalizedProductName(product, language);
  const displayCategory = getLocalizedProductCategory(product, language);
  const displayDescription = getLocalizedProductDescription(product, language);
  const displayDetails = getLocalizedProductDetails(product, language);

  const sourceProducts = Array.isArray(products) ? products : [];
  const relatedProducts = sourceProducts.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <div className="pt-[116px] md:pt-[132px] pb-24 px-5 sm:px-8 md:px-14 max-w-[1440px] mx-auto w-full bg-[#ffffff]">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex text-[#6e6c68] font-body text-[12px] mb-8">
        <ol className="inline-flex items-center gap-1.5 flex-wrap">
          <li>
            <button
              type="button"
              onClick={() => (onNavigate ? onNavigate('home') : null)}
              className="hover:text-[#111111] transition-colors cursor-pointer"
            >
              {t('detail.breadcrumbHome', 'Home')}
            </button>
          </li>
          <li className="flex items-center gap-1.5">
            {isAr ? (
              <ChevronLeft className="w-3.5 h-3.5 text-[#c9c6bf]" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-[#c9c6bf]" />
            )}
            <button
              type="button"
              onClick={() => (onNavigate ? onNavigate('shop', 'All') : null)}
              className="hover:text-[#111111] transition-colors cursor-pointer"
            >
              {t('detail.breadcrumbShop', 'Shop')}
            </button>
          </li>
          <li aria-current="page" className="flex items-center gap-1.5">
            {isAr ? (
              <ChevronLeft className="w-3.5 h-3.5 text-[#c9c6bf]" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-[#c9c6bf]" />
            )}
            <span className="text-[#111111] font-medium line-clamp-1 max-w-[220px] sm:max-w-xs">
              {displayName}
            </span>
          </li>
        </ol>
      </nav>

      {/* Main Product Split */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 mb-24">
        {/* Studio Gallery Column */}
        <div className="lg:col-span-7 flex flex-col-reverse lg:flex-row gap-4 items-start">
          {galleryImages.length > 1 && (
            <div className="flex lg:flex-col gap-2.5 overflow-x-auto lg:overflow-visible hide-scrollbar w-full lg:w-[76px] shrink-0">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedImageIndex(idx);
                    setActiveColorImage(img);
                  }}
                  className={`w-16 h-20 lg:w-full lg:h-24 bg-[#f4f3f0] shrink-0 focus:outline-none transition-all cursor-pointer overflow-hidden rounded-none ${
                    currentImage === img
                      ? 'border border-[#111111] opacity-100'
                      : 'border border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={getOptimizedImageUrl(img, { width: 200 }) || FALLBACK_SVG}
                    alt={`${displayName} view ${idx + 1}`}
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_SVG;
                    }}
                    className="w-full h-full object-cover object-center"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Main Image Frame */}
          <div className="w-full flex-1 aspect-[3/4] max-h-[680px] bg-[#f4f3f0] relative group cursor-crosshair overflow-hidden rounded-none">
            <img
              ref={mainImgRef}
              key={currentImage}
              src={getOptimizedImageUrl(currentImage, { width: 1000 }) || FALLBACK_SVG}
              alt={displayName}
              onError={(e) => {
                e.currentTarget.src = FALLBACK_SVG;
              }}
              className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              referrerPolicy="no-referrer"
              loading="eager"
            />
            <button
              type="button"
              onClick={() => onOpenImageModal(currentImage)}
              className="absolute top-4 end-4 w-10 h-10 bg-white/85 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-white cursor-pointer z-10 border border-[#e6e4df]"
              title={isAr ? 'تكبير الصورة' : 'Fullscreen view'}
            >
              <Maximize2 className="w-4 h-4 text-[#111111]" />
            </button>
          </div>
        </div>

        {/* Product Details Column */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="space-y-3 mb-7">
            <span className="font-label-caps text-[11px] text-[#6e6c68] uppercase block">
              {displayCategory}
            </span>
            <h1 className="font-display text-[26px] sm:text-[32px] md:text-[36px] text-[#111111] font-semibold leading-[1.18] tracking-tight">
              {displayName}
            </h1>
            <div className="flex items-baseline gap-3 pt-1 flex-wrap">
              <span className="font-body text-[22px] md:text-[24px] text-[#111111] font-semibold dir-ltr tabular-nums">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <>
                  <span className="font-body text-[15px] text-[#8c8984] line-through dir-ltr tabular-nums">
                    {formatPrice(product.originalPrice)}
                  </span>
                  <span className="text-[#8a1c1c] text-[12px] font-label-caps font-semibold">
                    {isAr
                      ? `وفر ${Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%`
                      : `SAVE ${Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%`}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="h-[1px] w-full bg-[#e6e4df] mb-7" />

          {/* Color Selection */}
          <div className="mb-7">
            <div className="flex justify-between items-center mb-3">
              <span className="font-label-caps text-[11px] text-[#6e6c68] uppercase">
                {t('detail.color', 'COLOR')}:{' '}
                <span className="text-[#111111] ms-1 font-semibold">
                  {(() => {
                    const matched = product.colors.find((c) => c.name === selectedColor);
                    if (isAr && matched?.nameAr) return matched.nameAr;
                    return selectedColor;
                  })()}
                </span>
              </span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {product.colors.map((c) => {
                const isSelected = selectedColor === c.name;
                const colLabel = isAr && c.nameAr ? c.nameAr : c.name;
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => handleSelectColor(c)}
                    aria-label={colLabel}
                    title={colLabel}
                    className={`h-9 px-3.5 rounded-none border text-[13px] font-body flex items-center gap-2 transition-colors cursor-pointer ${
                      isSelected
                        ? 'border-[#111111] bg-[#f4f3f0] text-[#111111] font-medium'
                        : 'border-[#e6e4df] text-[#444444] hover:border-[#111111]'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/15 shrink-0"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span>{colLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Size Selection */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <span className="font-label-caps text-[11px] text-[#6e6c68] uppercase">
                {t('detail.size', 'SIZE')}
              </span>
              <button
                type="button"
                onClick={onOpenSizeGuide}
                className="font-body text-[12px] text-[#6e6c68] underline underline-offset-4 hover:text-[#111111] transition-colors cursor-pointer"
              >
                {t('detail.sizeGuide', 'Size Guide')}
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {activeSizes.map((s) => {
                const isSelected = selectedSize === s.size;
                if (!s.inStock) {
                  return (
                    <button
                      key={s.size}
                      type="button"
                      disabled
                      className="py-2.5 border border-[#e6e4df] font-body text-[14px] text-[#9c9992] bg-[#faf9f7] cursor-not-allowed text-center relative overflow-hidden opacity-60 rounded-none"
                    >
                      {s.size}
                      <div className="absolute inset-0 w-full h-[1px] bg-[#9c9992] top-1/2 -rotate-12" />
                    </button>
                  );
                }
                return (
                  <button
                    key={s.size}
                    type="button"
                    onClick={() => setSelectedSize(s.size)}
                    className={`py-2.5 border font-body text-[14px] transition-colors cursor-pointer text-center rounded-none ${
                      isSelected
                        ? 'border-[#111111] bg-[#111111] text-white font-medium'
                        : 'border-[#e6e4df] text-[#111111] hover:border-[#111111]'
                    }`}
                  >
                    {s.size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Primary Actions */}
          <div className="flex flex-col gap-3 mb-9">
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={(e) => {
                  triggerFlyToCart(
                    mainImgRef.current || (e.currentTarget as HTMLElement),
                    getOptimizedImageUrl(currentImage, { width: 400 })
                  );
                  onAddToCart(product, selectedColor, selectedSize);
                  setJustAdded(true);
                  setTimeout(() => setJustAdded(false), 1600);
                }}
                className="flex-1 bg-[#111111] text-white py-3.5 rounded-none font-label-caps hover:bg-[#262626] transition-all active:scale-[0.98] cursor-pointer flex justify-center items-center gap-2 text-[13px] font-semibold btn-atc-sheen"
              >
                {justAdded ? (
                  <>
                    <Check className="w-4 h-4 text-white stroke-[2.2]" />
                    <span>{isAr ? 'تمت الإضافة للسلة' : 'ADDED TO CART'}</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 text-white animate-atc-icon" />
                    <span>{isAr ? 'أضف للسلة' : t('detail.addToCart', 'Add to Cart')}</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => onToggleWishlist(product)}
                className={`w-12 bg-white border rounded-none flex items-center justify-center hover:border-[#111111] transition-colors cursor-pointer ${
                  isWishlisted ? 'border-[#8a1c1c]' : 'border-[#e6e4df]'
                }`}
                title={
                  isWishlisted
                    ? t('product.removeFromWishlist', 'Remove')
                    : t('product.addToWishlist', 'Save')
                }
              >
                <Heart
                  className={`w-4.5 h-4.5 ${
                    isWishlisted ? 'text-[#8a1c1c] fill-[#8a1c1c]' : 'text-[#111111]'
                  }`}
                />
              </button>
            </div>

            <button
              type="button"
              onClick={() => onBuyNow(product, selectedColor, selectedSize)}
              className="w-full bg-white border border-[#111111] text-[#111111] py-3.5 rounded-none font-label-caps hover:bg-[#f4f3f0] transition-colors cursor-pointer text-[13px] font-semibold"
            >
              {isAr ? 'إتمام الطلب السريع' : t('detail.buyNow', 'Buy Now')}
            </button>

            <a
              href={getDirectProductWhatsAppUrl(
                storeSettings?.whatsappNumber || '01070606272',
                displayName,
                product.price,
                selectedColor,
                selectedSize
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#1a6b3c] hover:bg-[#145730] text-white py-3.5 rounded-none font-label-caps font-semibold transition-colors cursor-pointer text-[13px] flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{isAr ? 'طلب مباشر عبر واتساب' : 'Direct Order via WhatsApp'}</span>
            </a>
          </div>

          {/* Accordion Sections */}
          <div className="border-t border-[#e6e4df] flex flex-col">
            <div className="border-b border-[#e6e4df] py-4">
              <button
                type="button"
                onClick={() => toggleAccordion('description')}
                className="w-full flex justify-between items-center font-label-caps text-[12px] text-[#111111] cursor-pointer text-start select-none"
              >
                <span className="font-semibold">{t('detail.description', 'Description')}</span>
                <ChevronDown
                  className={`w-4 h-4 text-[#111111] transition-transform duration-300 shrink-0 ${
                    openAccordions.description ? 'rotate-180' : 'rotate-0'
                  }`}
                />
              </button>
              {openAccordions.description && (
                <div className="pt-3.5 font-body text-[14px] text-[#444444] leading-[1.8] text-start">
                  {displayDescription ||
                    (isAr
                      ? 'قطعة مميزة مصممة بأعلى معايير الجودة والأناقة العصرية من توزا.'
                      : 'An exquisite piece tailored with the finest materials and modern restraint from TOUZA.')}
                </div>
              )}
            </div>

            <div className="border-b border-[#e6e4df] py-4">
              <button
                type="button"
                onClick={() => toggleAccordion('details')}
                className="w-full flex justify-between items-center font-label-caps text-[12px] text-[#111111] cursor-pointer text-start select-none"
              >
                <span className="font-semibold">{t('detail.detailsFit', 'Details & Fit')}</span>
                <ChevronDown
                  className={`w-4 h-4 text-[#111111] transition-transform duration-300 shrink-0 ${
                    openAccordions.details ? 'rotate-180' : 'rotate-0'
                  }`}
                />
              </button>
              {openAccordions.details && (
                <div className="pt-3.5 font-body text-[14px] text-[#444444] leading-[1.8] text-start">
                  <ul className="list-disc ps-5 space-y-1.5">
                    {displayDetails && displayDetails.length > 0 ? (
                      displayDetails.map((detail, idx) => <li key={idx}>{detail}</li>)
                    ) : (
                      <>
                        <li>
                          {isAr
                            ? 'خامات فاخرة عالية الجودة مختارة بعناية'
                            : 'Curated heavyweight luxury fabrics'}
                        </li>
                        <li>
                          {isAr
                            ? 'تصميم مريح وأنيق يناسب مختلف المناسبات'
                            : 'Relaxed contemporary fit for everyday versatility'}
                        </li>
                        <li>
                          {isAr ? 'صناعة متقنة وتشطيب فاخر' : 'Refined tailoring and clean finishing'}
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              )}
            </div>

            <div className="border-b border-[#e6e4df] py-4">
              <button
                type="button"
                onClick={() => toggleAccordion('shipping')}
                className="w-full flex justify-between items-center font-label-caps text-[12px] text-[#111111] cursor-pointer text-start select-none"
              >
                <span className="font-semibold">
                  {t('detail.shippingReturns', 'Shipping & Returns')}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-[#111111] transition-transform duration-300 shrink-0 ${
                    openAccordions.shipping ? 'rotate-180' : 'rotate-0'
                  }`}
                />
              </button>
              {openAccordions.shipping && (
                <div className="pt-3.5 font-body text-[14px] text-[#444444] leading-[1.8] text-start space-y-2">
                  <p>
                    {isAr
                      ? storeSettings?.shippingAr || 'نوفر خدمة التوصيل السريع لجميع محافظات مصر.'
                      : storeSettings?.shippingEn || 'Express delivery nationwide across Egypt.'}
                  </p>
                  <p className="text-[13px] text-[#6e6c68]">
                    {isAr
                      ? storeSettings?.shippingFree !== false &&
                        (Number(storeSettings?.shippingFee) <= 0 ||
                          storeSettings?.shippingFee === undefined)
                        ? 'الشحن مجاني لكافة المحافظات'
                        : `تكلفة الشحن: ${storeSettings?.shippingFee || 0} ج.م`
                      : storeSettings?.shippingFree !== false &&
                        (Number(storeSettings?.shippingFee) <= 0 ||
                          storeSettings?.shippingFee === undefined)
                      ? 'Free delivery across Egypt'
                      : `Delivery fee: ${storeSettings?.shippingFee || 0} EGP`}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="mt-16 pt-16 border-t border-[#e6e4df]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div className="space-y-1.5">
            <span className="font-label-caps text-[#6e6c68] text-[11px] uppercase block">
              {isAr ? 'آراء العملاء' : 'CLIENT REVIEWS'}
            </span>
            <h2 className="font-display text-[24px] md:text-[32px] font-semibold text-[#111111]">
              {isAr ? 'تقييمات المنتج' : 'Product Reviews'}
            </h2>
          </div>

          <div className="flex items-center gap-3 bg-[#faf9f7] px-4 py-2.5 border border-[#e6e4df]">
            <div className="flex text-[#111111] gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-4 h-4 fill-[#111111] text-[#111111]" />
              ))}
            </div>
            <span className="font-body text-[15px] font-semibold text-[#111111] tabular-nums">
              {reviews.length > 0
                ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
                : '5.0'}
            </span>
            <span className="font-body text-[12px] text-[#6e6c68] tabular-nums">
              ({reviews.length} {isAr ? 'تقييم' : 'reviews'})
            </span>
          </div>
        </div>

        {/* Review Form */}
        <div className="mb-10 bg-[#faf9f7] p-6 md:p-8 border border-[#e6e4df]">
          <h3 className="font-display text-[17px] font-semibold text-[#111111] mb-4">
            {isAr ? 'أضف تقييمك للمنتج' : 'Write a Review'}
          </h3>

          <form onSubmit={handleAddReview} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-label-caps text-[11px] text-[#6e6c68] mb-1.5">
                  {isAr ? 'الاسم (اختياري)' : 'NAME (OPTIONAL)'}
                </label>
                <input
                  type="text"
                  placeholder={isAr ? 'أدخل اسمك أو اتركه فارغاً' : 'Your name'}
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="w-full bg-white border border-[#d6d3cc] rounded-none px-3.5 py-2.5 text-[14px] focus:border-[#111111] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-label-caps text-[11px] text-[#6e6c68] mb-1.5">
                  {isAr ? 'التقييم' : 'RATING'}
                </label>
                <div className="flex gap-1 items-center h-[42px]">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setNewRating(star)}
                      className="focus:outline-none cursor-pointer p-0.5"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= newRating
                            ? 'fill-[#111111] text-[#111111]'
                            : 'text-[#d4d1ca] fill-transparent'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-[12px] font-medium text-[#111111] ms-2 tabular-nums">
                    {newRating} / 5
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block font-label-caps text-[11px] text-[#6e6c68] mb-1.5">
                {isAr ? 'رأيك في المنتج' : 'YOUR REVIEW'}
              </label>
              <textarea
                rows={3}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={
                  isAr
                    ? 'اكتب رأيك بصراحة عن الخامة والتصميم والمقاس...'
                    : 'Share your thoughts on fabric quality, fit, and craftsmanship...'
                }
                required
                className="w-full p-3.5 bg-white border border-[#d6d3cc] rounded-none font-body text-[14px] focus:outline-none focus:border-[#111111]"
              />
            </div>

            {reviewMessage && (
              <p className="font-body text-[13px] text-[#1a6b3c] font-medium">{reviewMessage}</p>
            )}

            <button
              type="submit"
              disabled={isSubmittingReview || !newComment.trim()}
              className="bg-[#111111] text-white py-3 px-7 rounded-none font-label-caps text-[12px] font-semibold hover:bg-[#2b2b2b] transition-colors cursor-pointer disabled:opacity-40"
            >
              {isSubmittingReview
                ? isAr
                  ? 'جاري النشر...'
                  : 'POSTING...'
                : isAr
                ? 'نشر التقييم'
                : 'POST REVIEW'}
            </button>
          </form>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {loadingReviews ? (
            <p className="text-center py-6 font-body text-[14px] text-[#6e6c68]">
              {isAr ? 'جاري تحميل التقييمات...' : 'Loading reviews...'}
            </p>
          ) : reviews.length === 0 ? (
            <div className="text-center py-10 bg-[#faf9f7] border border-[#e6e4df] p-6">
              <MessageSquare className="w-7 h-7 text-[#9c9992] mx-auto mb-2.5 stroke-[1.5]" />
              <p className="font-display text-[16px] font-semibold text-[#111111]">
                {isAr ? 'لا توجد تقييمات لهذا المنتج بعد' : 'No reviews yet for this piece'}
              </p>
              <p className="font-body text-[13px] text-[#6e6c68] mt-1">
                {isAr
                  ? 'كن أول من يشارك رأيه بعد تجربة هذه القطعة.'
                  : 'Be the first to share your impressions.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-6 bg-[#ffffff] border border-[#e6e4df] space-y-3"
                >
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <h4 className="font-display text-[15px] font-semibold text-[#111111] leading-tight">
                        {rev.userName || (isAr ? 'عميل توزا' : 'TOUZA Client')}
                      </h4>
                      <span className="text-[#6e6c68] text-[11px] flex items-center gap-1 mt-1">
                        <CheckCircle2 className="w-3 h-3 text-[#1a6b3c]" />
                        <span>{isAr ? 'مشتري مؤكد' : 'Verified Purchase'}</span>
                      </span>
                    </div>

                    <div className="flex text-[#111111] gap-0.5 shrink-0">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= rev.rating ? 'fill-[#111111] text-[#111111]' : 'text-[#d4d1ca]'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="font-body text-[14px] text-[#2a2a2a] leading-[1.75]">
                    “{rev.comment}”
                  </p>

                  {rev.createdAt && (
                    <p className="font-body text-[11px] text-[#8c8984] tabular-nums">
                      {rev.createdAt?.toDate
                        ? new Date(rev.createdAt.toDate()).toLocaleDateString(
                            isAr ? 'ar-EG' : 'en-US'
                          )
                        : typeof rev.createdAt === 'string'
                        ? rev.createdAt
                        : ''}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Related Products Grid */}
      {relatedProducts.length > 0 && (
        <section className="mt-20 pt-16 border-t border-[#e6e4df]">
          <div className="mb-10">
            <span className="font-label-caps text-[11px] text-[#6e6c68] uppercase block mb-1.5">
              {isAr ? 'قد يعجبك أيضاً' : 'YOU MAY ALSO LIKE'}
            </span>
            <h2 className="font-display text-[24px] md:text-[32px] font-semibold text-[#111111]">
              {t('detail.curatedTitle', 'Curated For You')}
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-12">
            {relatedProducts.map((item) => (
              <ProductCard
                key={item.id}
                product={item}
                onSelectProduct={onSelectProduct}
                isWishlisted={false}
                onToggleWishlist={(p, e) => {
                  e.stopPropagation();
                  onToggleWishlist(p);
                }}
                onQuickAdd={(p, color, size) => onAddToCart(p, color, size)}
                aspectRatio="portrait"
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
