import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Product } from '../types';
import { ProductCard } from './ProductCard';
import { PRODUCTS, getLocalizedProductName, getLocalizedProductCategory, getLocalizedProductDescription, getLocalizedProductDetails } from '../data/products';
import { useLanguage } from '../context/LanguageContext';
import { getProductReviews, saveProductReview, SavedReview } from '../firebase';
import { getOptimizedImageUrl } from '../utils/cloudinary';

interface ProductDetailProps {
  product: Product;
  products?: Product[];
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

export const ProductDetail: React.FC<ProductDetailProps> = ({
  product,
  products = [],
  onAddToCart,
  onBuyNow,
  onSelectProduct,
  isWishlisted,
  onToggleWishlist,
  onOpenImageModal,
  onOpenSizeGuide,
  user,
  onSignInGoogle,
  onNavigate,
}) => {
  const { language, formatPrice, t } = useLanguage();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(
    product.colors[0]?.name || 'Noir'
  );
  const [selectedSize, setSelectedSize] = useState(
    product.sizes.find((s) => s.inStock)?.size || product.sizes[0]?.size || '36'
  );
  const [activeColorImage, setActiveColorImage] = useState<string | null>(
    product.colors[0]?.imageUrl || null
  );

  useEffect(() => {
    if (product?.colors && product.colors.length > 0) {
      setSelectedColor(product.colors[0].name);
      setActiveColorImage(product.colors[0].imageUrl || null);
      setSelectedImageIndex(0);
    }
  }, [product?.id]);

  const handleSelectColor = (colorObj: { name: string; nameAr?: string; hex: string; imageUrl?: string }) => {
    setSelectedColor(colorObj.name);
    if (colorObj.imageUrl) {
      setActiveColorImage(colorObj.imageUrl);
    }
  };

  const [openAccordions, setOpenAccordions] = useState<{ [key: string]: boolean }>({
    description: true,
    details: false,
    shipping: false,
  });

  // Product Reviews State
  const [reviews, setReviews] = useState<SavedReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);

  useEffect(() => {
    if (product?.id) {
      setLoadingReviews(true);
      getProductReviews(product.id)
        .then((data) => setReviews(data))
        .catch((err) => console.error('Error fetching product reviews:', err))
        .finally(() => setLoadingReviews(false));
    }
  }, [product?.id]);

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      if (onSignInGoogle) await onSignInGoogle();
      return;
    }
    if (!newComment.trim()) return;

    setIsSubmittingReview(true);
    try {
      const savedPhoto = localStorage.getItem(`maison_user_photo_${user.uid}`);
      const userPhoto = savedPhoto || user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600';

      const saved = await saveProductReview({
        productId: product.id,
        productTitle: getLocalizedProductName(product, language),
        rating: newRating,
        comment: newComment.trim(),
        userId: user.uid,
        userName: user.displayName || user.email || (language === 'ar' ? 'عميل توزا' : 'TOUZA Client'),
        userPhoto,
      });

      setReviews((prev) => [saved, ...prev]);
      setNewComment('');
      setReviewMessage(language === 'ar' ? 'تم إضافة تقييمك بنجاح! شكراً لك.' : 'Your review was submitted successfully!');
      setTimeout(() => setReviewMessage(null), 3500);
    } catch (err) {
      console.error('Failed to submit review:', err);
      alert(language === 'ar' ? 'فشل حفظ التقييم. يرجى التأكد من تسجيل الدخول.' : 'Failed to save review. Please make sure you are signed in.');
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

  // Gather all unique images including color variant images
  const colorImagesList = (product.colors || [])
    .map((c) => c.imageUrl)
    .filter((img): img is string => Boolean(img));
  const galleryImages = Array.from(new Set([...colorImagesList, ...(product.images || [])]));

  const currentImage =
    activeColorImage ||
    galleryImages[selectedImageIndex] ||
    product.images[0] ||
    '';

  const displayName = getLocalizedProductName(product, language);
  const displayCategory = getLocalizedProductCategory(product, language);
  const displayDescription = getLocalizedProductDescription(product, language);
  const displayDetails = getLocalizedProductDetails(product, language);

  // Related products for "Curated For You" (uses live products from Firestore if available)
  const sourceProducts = products && products.length > 0 ? products : PRODUCTS;
  const curatedProducts = sourceProducts.filter((p) => p.id !== product.id).slice(0, 3);
  const largeCurated = curatedProducts[0];
  const stackedCurated = curatedProducts.slice(1, 3);

  return (
    <div className="pt-24 pb-20 px-5 md:px-16 max-w-[1440px] mx-auto w-full">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex text-[#747878] font-label-caps text-[12px] mb-6">
        <ol className="inline-flex items-center space-x-1 md:space-x-2 flex-wrap">
          <li>
            <button
              type="button"
              onClick={() => onNavigate ? onNavigate('home') : null}
              className="hover:text-[#000000] hover:underline transition-colors cursor-pointer flex items-center gap-1 font-bold"
            >
              <span className="material-symbols-outlined text-[15px]">home</span>
              <span>{t('detail.breadcrumbHome', 'Home')}</span>
            </button>
          </li>
          <li className="flex items-center">
            <span className="material-symbols-outlined text-[14px] mx-1 text-[#c4c7c7]">chevron_right</span>
            <button
              type="button"
              onClick={() => onNavigate ? onNavigate('shop', 'All') : null}
              className="hover:text-[#000000] hover:underline transition-colors cursor-pointer font-bold"
            >
              {t('detail.breadcrumbShop', 'Shop')}
            </button>
          </li>
          <li aria-current="page" className="flex items-center">
            <span className="material-symbols-outlined text-[14px] mx-1 text-[#c4c7c7]">chevron_right</span>
            <span className="text-[#000000] font-bold line-clamp-1 max-w-[200px] sm:max-w-xs">{displayName}</span>
          </li>
        </ol>
      </nav>

      {/* Product Main Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-20">
        {/* Gallery Column */}
        <div className="lg:col-span-7 flex flex-col-reverse lg:flex-row gap-4 items-start">
          {/* Thumbnails */}
          {galleryImages.length > 1 && (
            <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible hide-scrollbar w-full lg:w-20 shrink-0">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedImageIndex(idx);
                    setActiveColorImage(img);
                  }}
                  className={`w-16 h-20 lg:w-full lg:h-24 bg-[#f3f3f4] shrink-0 focus:outline-none transition-all cursor-pointer overflow-hidden rounded-md ${
                    currentImage === img
                      ? 'border-2 border-[#000000] opacity-100'
                      : 'border border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={getOptimizedImageUrl(img || 'https://res.cloudinary.com/qazdrpcx/image/upload/v1786595479/touza_products/reuodzuouk8woxkq38zz.jpg', { width: 200 })}
                    alt={`${displayName} view ${idx + 1}`}
                    onError={(e) => {
                      e.currentTarget.src = 'https://res.cloudinary.com/qazdrpcx/image/upload/v1786595479/touza_products/reuodzuouk8woxkq38zz.jpg';
                    }}
                    className="w-full h-full object-cover object-center"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Main Display Image - Matched to Home Page Frame Aspect Ratio & Sleek Compact Size */}
          <div className="w-full max-w-[420px] sm:max-w-[460px] lg:max-w-[480px] aspect-[3/4] max-h-[460px] sm:max-h-[500px] lg:max-h-[540px] bg-[#fafafa] relative group cursor-crosshair overflow-hidden rounded-2xl border border-[#c4c7c7]/30 shadow-xs mx-auto lg:mx-0">
            <img
              src={getOptimizedImageUrl(currentImage || 'https://res.cloudinary.com/qazdrpcx/image/upload/v1786595479/touza_products/reuodzuouk8woxkq38zz.jpg', { width: 1000 })}
              alt={displayName}
              onError={(e) => {
                e.currentTarget.src = 'https://res.cloudinary.com/qazdrpcx/image/upload/v1786595479/touza_products/reuodzuouk8woxkq38zz.jpg';
              }}
              className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              referrerPolicy="no-referrer"
              loading="eager"
            />
            <button
              onClick={() => onOpenImageModal(currentImage)}
              className="absolute top-4 right-4 p-2.5 bg-white/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-white cursor-pointer shadow-md z-10"
              title="Fullscreen view"
            >
              <span className="material-symbols-outlined text-[#000000] text-[20px]">fullscreen</span>
            </button>
          </div>
        </div>

        {/* Product Details Column */}
        <div className="lg:col-span-5 flex flex-col py-1 lg:pl-4">
          <div className="mb-6">
            <h1 className="font-display text-[28px] md:text-[38px] text-[#000000] mb-3 leading-tight">
              {displayName}
            </h1>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className="font-body text-[24px] md:text-[28px] text-[#000000] font-bold dir-ltr">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <>
                  <span className="font-body text-[16px] md:text-[18px] text-[#747878] line-through dir-ltr">
                    {formatPrice(product.originalPrice)}
                  </span>
                  <span className="bg-[#ba1a1a] text-white px-2.5 py-1 rounded-md text-[11px] font-label-caps font-bold">
                    {language === 'ar'
                      ? `وفر ${Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%`
                      : `Save ${Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%`}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="h-[1px] w-full bg-[#c4c7c7]/40 mb-6" />

          {/* Color Selection */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <span className="font-label-caps text-[#444748]">
                {t('detail.color', 'COLOR')}:{' '}
                <span className="text-[#000000] ml-1 font-bold">
                  {(() => {
                    const matched = product.colors.find((c) => c.name === selectedColor);
                    if (language === 'ar' && matched?.nameAr) return matched.nameAr;
                    return selectedColor;
                  })()}
                </span>
              </span>
            </div>
            <div className="flex flex-wrap gap-3">
              {product.colors.map((c) => {
                const isSelected = selectedColor === c.name;
                const colLabel = language === 'ar' && c.nameAr ? c.nameAr : c.name;
                return (
                  <button
                    key={c.name}
                    onClick={() => handleSelectColor(c)}
                    aria-label={colLabel}
                    title={colLabel}
                    className={`h-9 px-3.5 rounded-full border text-[13px] font-body flex items-center gap-2 transition-all cursor-pointer relative ${
                      isSelected
                        ? 'ring-2 ring-[#000000] ring-offset-2 border-black font-bold bg-[#f3f3f4] text-[#000000] scale-105 shadow-xs'
                        : 'border-[#747878]/30 hover:border-[#000000] text-[#444748]'
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span>{colLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Size Selection */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <span className="font-label-caps text-[#444748]">{t('detail.size', 'SIZE')}</span>
              <button
                onClick={onOpenSizeGuide}
                className="font-label-caps text-[#444748] underline underline-offset-4 hover:text-[#000000] transition-colors cursor-pointer text-[13px]"
              >
                {t('detail.sizeGuide', 'Size Guide')}
              </button>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {product.sizes.map((s) => {
                const isSelected = selectedSize === s.size;
                if (!s.inStock) {
                  return (
                    <button
                      key={s.size}
                      disabled
                      className="py-2.5 border border-[#c4c7c7]/50 font-body text-[15px] text-[#747878] bg-[#ffffff] cursor-not-allowed text-center relative overflow-hidden opacity-50 rounded-md"
                    >
                      {s.size}
                      <div className="absolute inset-0 w-full h-[1px] bg-[#747878] top-1/2 -rotate-45" />
                    </button>
                  );
                }
                return (
                  <button
                    key={s.size}
                    onClick={() => setSelectedSize(s.size)}
                    className={`py-2.5 border font-body text-[15px] transition-all cursor-pointer text-center rounded-md ${
                      isSelected
                        ? 'border-[#000000] bg-[#f3f3f4] text-[#000000] font-bold shadow-xs'
                        : 'border-[#747878]/30 text-[#000000] hover:border-[#000000]'
                    }`}
                  >
                    {s.size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 mb-8">
            <div className="flex gap-3">
              <button
                onClick={() => onAddToCart(product, selectedColor, selectedSize)}
                className="flex-1 bg-[#000000] text-white py-3.5 rounded-lg font-label-caps hover:bg-[#2f3131] transition-all cursor-pointer flex justify-center items-center gap-2 shadow-sm active:scale-[0.99] text-[15px]"
              >
                <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
                {t('detail.addToCart', 'Add to Cart')}
              </button>
              <button
                onClick={() => onToggleWishlist(product)}
                className={`w-12 bg-white border border-[#747878]/30 rounded-lg flex items-center justify-center hover:border-[#000000] transition-colors cursor-pointer group ${
                  isWishlisted ? 'border-[#ba1a1a]' : ''
                }`}
                title={isWishlisted ? t('product.removeFromWishlist', 'Remove') : t('product.addToWishlist', 'Save')}
              >
                <span
                  className="material-symbols-outlined group-hover:scale-110 transition-transform text-[20px]"
                  style={{
                    fontVariationSettings: isWishlisted ? "'FILL' 1" : "'FILL' 0",
                    color: isWishlisted ? '#ba1a1a' : '#000000',
                  }}
                >
                  favorite
                </span>
              </button>
            </div>
            <button
              onClick={() => onBuyNow(product, selectedColor, selectedSize)}
              className="w-full bg-white border border-[#000000] text-[#000000] py-3.5 rounded-lg font-label-caps hover:bg-[#f3f3f4] transition-colors cursor-pointer shadow-sm active:scale-[0.99] text-[15px]"
            >
              {t('detail.buyNow', 'Buy it Now')}
            </button>
          </div>

          {/* Accordion Sections */}
          <div className="border-t border-[#c4c7c7]/40 flex flex-col">
            {/* Description */}
            <div className="border-b border-[#c4c7c7]/40 py-3.5">
              <button
                onClick={() => toggleAccordion('description')}
                className="w-full flex justify-between items-center font-label-caps text-[#000000] cursor-pointer text-left"
              >
                <span>{t('detail.description', 'Description')}</span>
                <span
                  className={`material-symbols-outlined text-[20px] transition-transform duration-300 ${
                    openAccordions.description ? 'rotate-180' : ''
                  }`}
                >
                  expand_more
                </span>
              </button>
              {openAccordions.description && (
                <div className="pt-3 font-body text-[15px] text-[#444748] leading-relaxed">
                  {displayDescription}
                </div>
              )}
            </div>

            {/* Details & Fit */}
            <div className="border-b border-[#c4c7c7]/40 py-3.5">
              <button
                onClick={() => toggleAccordion('details')}
                className="w-full flex justify-between items-center font-label-caps text-[#000000] cursor-pointer text-left"
              >
                <span>{t('detail.detailsFit', 'Details & Fit')}</span>
                <span
                  className={`material-symbols-outlined text-[20px] transition-transform duration-300 ${
                    openAccordions.details ? 'rotate-180' : ''
                  }`}
                >
                  expand_more
                </span>
              </button>
              {openAccordions.details && (
                <div className="pt-3 font-body text-[15px] text-[#444748] leading-relaxed">
                  <ul className="list-disc pl-5 rtl:pr-5 space-y-1">
                    {displayDetails.map((detail, idx) => (
                      <li key={idx}>{detail}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Shipping & Returns */}
            <div className="border-b border-[#c4c7c7]/40 py-3.5">
              <button
                onClick={() => toggleAccordion('shipping')}
                className="w-full flex justify-between items-center font-label-caps text-[#000000] cursor-pointer text-left"
              >
                <span>{t('detail.shippingReturns', 'Shipping & Returns')}</span>
                <span
                  className={`material-symbols-outlined text-[20px] transition-transform duration-300 ${
                    openAccordions.shipping ? 'rotate-180' : ''
                  }`}
                >
                  expand_more
                </span>
              </button>
              {openAccordions.shipping && (
                <div className="pt-3 font-body text-[15px] text-[#444748] leading-relaxed">
                  {t('detail.shippingPolicy', 'Complimentary express delivery across Egypt within 2-4 business days. Returns accepted within 14 days.')}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="mt-16 bg-white rounded-2xl p-6 md:p-10 border border-[#c4c7c7]/30 shadow-xs">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[#c4c7c7]/30 pb-6 mb-8 gap-4">
          <div>
            <span className="font-label-caps text-[#747878] text-[12px]">
              {language === 'ar' ? 'تجارب وآراء العملاء' : 'CLIENT REVIEWS'}
            </span>
            <h2 className="font-display text-[26px] md:text-[34px] font-bold text-[#000000]">
              {language === 'ar' ? 'تقييمات المنتجات' : 'Product Reviews'}
            </h2>
          </div>

          <div className="flex items-center gap-3 bg-[#f9f9f9] px-5 py-2.5 rounded-xl border border-[#c4c7c7]/30">
            <div className="flex text-[#f59e0b]">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  star
                </span>
              ))}
            </div>
            <span className="font-body text-[16px] font-bold text-[#000000]">
              {reviews.length > 0
                ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
                : '5.0'}
            </span>
            <span className="font-body text-[13px] text-[#747878]">
              ({reviews.length} {language === 'ar' ? 'تقييم' : 'reviews'})
            </span>
          </div>
        </div>

        {/* Review Form - Tied strictly to Google Auth */}
        <div className="mb-10 bg-[#f9f9f9] p-5 md:p-6 rounded-xl border border-[#c4c7c7]/30">
          <h3 className="font-display text-[18px] font-bold text-[#000000] mb-3">
            {language === 'ar' ? 'أضف تقييمك للمنتج' : 'Write a Review'}
          </h3>

          {!user ? (
            /* Auth Banner when not signed in */
            <div className="p-4 bg-white rounded-lg border border-[#c4c7c7]/30 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[28px] text-[#000000]">lock</span>
                <div>
                  <p className="font-body text-[14px] font-bold text-[#000000]">
                    {language === 'ar' ? 'يتطلب إضافة التقييم تسجيل الدخول بحساب Google' : 'Sign in with Google required to post a review'}
                  </p>
                  <p className="font-body text-[12px] text-[#747878]">
                    {language === 'ar' ? 'لحماية مصداقية التقييمات، يتم ربط كل تقييم بحساب العميل المسجل.' : 'Reviews are strictly tied to verified customer Google accounts.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onSignInGoogle}
                className="bg-[#000000] text-white hover:bg-[#2f3131] py-2.5 px-5 rounded-xl font-body text-[13px] font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.1 0-5.74-2.09-6.68-4.92H1.21v3.15C3.21 21.36 7.32 24 12 24z" />
                  <path fill="#FBBC05" d="M5.32 14.28c-.24-.72-.38-1.49-.38-2.28s.14-1.56.38-2.28V6.57H1.21C.44 8.11 0 9.99 0 12s.44 3.89 1.21 5.43l4.11-3.15z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.32 0 3.21 2.64 1.21 6.57l4.11 3.15c.94-2.83 3.58-4.92 6.68-4.92z" />
                </svg>
                <span>{language === 'ar' ? 'تسجيل الدخول بـ Google' : 'Sign in with Google'}</span>
              </button>
            </div>
          ) : (
            /* Logged in Review Form */
            <form onSubmit={handleAddReview} className="space-y-4">
              <div className="flex items-center gap-3">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#000000] text-white flex items-center justify-center font-bold text-[12px]">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-body text-[13px] font-bold text-[#000000]">{user.displayName || user.email}</p>
                  <p className="font-body text-[11px] text-[#2e7d32] font-semibold">✓ {language === 'ar' ? 'حساب موثق' : 'Verified Google Client'}</p>
                </div>
              </div>

              <div>
                <label className="block font-label-caps text-[11px] text-[#747878] mb-1">
                  {language === 'ar' ? 'التقييم بالنجوم' : 'Rating'}
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setNewRating(star)}
                      className="text-[24px] focus:outline-none transition-transform hover:scale-110 cursor-pointer"
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{
                          fontVariationSettings: star <= newRating ? "'FILL' 1" : "'FILL' 0",
                          color: star <= newRating ? '#f59e0b' : '#d1d5db',
                        }}
                      >
                        star
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <textarea
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={language === 'ar' ? 'اكتب رأيك بصراحة عن الخامة والتصميم والتفاصيل...' : 'Share your opinion on fabric quality, sizing, craftsmanship...'}
                  required
                  className="w-full p-3 bg-white border border-[#c4c7c7] rounded-xl font-body text-[14px] focus:outline-none focus:border-[#000000]"
                />
              </div>

              {reviewMessage && (
                <p className="font-body text-[13px] text-[#2e7d32] font-bold">{reviewMessage}</p>
              )}

              <button
                type="submit"
                disabled={isSubmittingReview || !newComment.trim()}
                className="bg-[#000000] text-white py-2.5 px-6 rounded-xl font-label-caps text-[13px] font-bold hover:bg-[#2f3131] transition-colors cursor-pointer shadow-sm disabled:opacity-50"
              >
                {isSubmittingReview ? (language === 'ar' ? 'جاري النشر...' : 'Posting...') : (language === 'ar' ? 'نشر التقييم' : 'Post Review')}
              </button>
            </form>
          )}
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {loadingReviews ? (
            <p className="text-center py-6 font-body text-[14px] text-[#747878]">
              {language === 'ar' ? 'جاري تحميل التقييمات...' : 'Loading reviews...'}
            </p>
          ) : reviews.length === 0 ? (
            <div className="text-center py-8 bg-[#f9f9f9] rounded-xl border border-[#c4c7c7]/20 p-6">
              <span className="material-symbols-outlined text-[32px] text-[#c4c7c7]">chat_bubble_outline</span>
              <p className="font-display text-[16px] font-bold text-[#000000] mt-1">
                {language === 'ar' ? 'لا توجد تقييمات لهذا المنتج بعد' : 'No reviews yet for this product'}
              </p>
              <p className="font-body text-[13px] text-[#747878] mt-1">
                {language === 'ar' ? 'كن أول من يشارك رأيه بعد تجربة هذا القطعة الفاخرة.' : 'Be the first to share your feedback after trying this piece.'}
              </p>
            </div>
          ) : (
            reviews.map((rev) => {
              const avatarPhoto = rev.userPhoto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600';
              return (
                <div key={rev.id} className="p-4 md:p-5 bg-[#ffffff] rounded-2xl border border-[#c4c7c7]/30 shadow-xs space-y-3 hover:border-[#000000]/30 transition-colors">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-[#000000]/10 shadow-xs shrink-0 bg-[#f3f3f4]">
                        <img
                          src={avatarPhoto}
                          alt={rev.userName}
                          className="w-full h-full object-cover object-center"
                        />
                      </div>
                      <div>
                        <h4 className="font-body text-[14px] font-bold text-[#000000] leading-tight">
                          {rev.userName || (language === 'ar' ? 'عميل توزا' : 'TOUZA Client')}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[#2e7d32] text-[11px] font-bold flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[13px]">verified</span>
                            <span>{language === 'ar' ? 'مشتري مؤكد' : 'Verified Purchase'}</span>
                          </span>
                          {rev.orderNumber && (
                            <span className="text-[#747878] text-[11px] font-mono">
                              ({rev.orderNumber})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex text-[#f59e0b] shrink-0">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className="material-symbols-outlined text-[18px]"
                          style={{ fontVariationSettings: star <= rev.rating ? "'FILL' 1" : "'FILL' 0" }}
                        >
                          star
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="font-body text-[14px] text-[#222222] leading-relaxed pt-1 font-medium">
                    "{rev.comment}"
                  </p>

                  {rev.createdAt && (
                    <p className="font-body text-[11px] text-[#747878] text-right">
                      {rev.createdAt?.toDate
                        ? new Date(rev.createdAt.toDate()).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')
                        : (typeof rev.createdAt === 'string' ? rev.createdAt : '')}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Curated For You Section */}
      <section className="mt-16">
        <h2 className="font-display text-[26px] md:text-[32px] text-[#000000] text-center mb-10">
          {t('detail.curatedTitle', 'Curated For You')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Large Featured Card */}
          {largeCurated && (
            <div className="md:col-span-8">
              <ProductCard
                product={largeCurated}
                onSelectProduct={onSelectProduct}
                isWishlisted={isWishlisted}
                onToggleWishlist={(p, e) => {
                  e.stopPropagation();
                  onToggleWishlist(p);
                }}
                aspectRatio="wide"
                isLargeCard
              />
            </div>
          )}

          {/* Stacked Cards Column */}
          <div className="md:col-span-4 flex flex-col gap-6">
            {stackedCurated.map((item) => (
              <ProductCard
                key={item.id}
                product={item}
                onSelectProduct={onSelectProduct}
                isWishlisted={isWishlisted}
                onToggleWishlist={(p, e) => {
                  e.stopPropagation();
                  onToggleWishlist(p);
                }}
                aspectRatio="portrait"
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
