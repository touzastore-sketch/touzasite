import React, { useState } from 'react';
import { Heart, ShoppingBag, CheckCircle2 } from 'lucide-react';
import { Product } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { getLocalizedProductName, getLocalizedProductSubtitle } from '../data/products';
import { getOptimizedImageUrl } from '../utils/cloudinary';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (product: Product) => void;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product, e: React.MouseEvent) => void;
  onQuickAdd?: (product: Product, color: string, size: string, e?: React.MouseEvent) => void;
  aspectRatio?: 'portrait' | 'wide' | 'square';
  isLargeCard?: boolean;
  priority?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelectProduct,
  isWishlisted,
  onToggleWishlist,
  onQuickAdd,
  aspectRatio = 'portrait',
  isLargeCard = false,
  priority = false,
}) => {
  const { language, formatPrice, t } = useLanguage();
  const [activeColorIndex, setActiveColorIndex] = useState(0);

  const getAspectClass = () => {
    if (aspectRatio === 'wide') return 'aspect-[16/9] max-h-[320px]';
    if (aspectRatio === 'square') return 'aspect-square max-h-[300px]';
    return 'aspect-[3/4] max-h-[380px] sm:max-h-[360px] w-full';
  };

  const activeColor = product.colors?.[activeColorIndex];
  const activeSizes = (activeColor?.sizes && activeColor.sizes.length > 0) ? activeColor.sizes : (product.sizes || []);

  const rawImg = activeColor?.imageUrl || product.images?.[0];
  const fallbackImage = 'https://res.cloudinary.com/qazdrpcx/image/upload/v1786595479/touza_products/reuodzuouk8woxkq38zz.jpg';
  const displayImage = getOptimizedImageUrl(rawImg && rawImg.trim() ? rawImg : fallbackImage, { width: 500 });

  const displayName = getLocalizedProductName(product, language);
  const displaySubtitle = getLocalizedProductSubtitle(product, language);

  const [selectedSize, setSelectedSize] = useState<string>(() => {
    return activeSizes.find((s) => s.inStock)?.size || activeSizes[0]?.size || 'M';
  });
  const [isAddedSuccess, setIsAddedSuccess] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      setIsLoaded(true);
    }
  }, []);

  React.useEffect(() => {
    const currentSizes = (activeColor?.sizes && activeColor.sizes.length > 0) ? activeColor.sizes : (product.sizes || []);
    if (currentSizes.length > 0 && !currentSizes.some((s) => s.size === selectedSize && s.inStock)) {
      const firstInStock = currentSizes.find((s) => s.inStock)?.size || currentSizes[0]?.size;
      if (firstInStock) setSelectedSize(firstInStock);
    }
  }, [activeColorIndex, product]);

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onQuickAdd) {
      const chosenColor = activeColor?.name || product.colors?.[0]?.name || 'Noir';
      onQuickAdd(product, chosenColor, selectedSize, e);
      setIsAddedSuccess(true);
      setTimeout(() => setIsAddedSuccess(false), 2200);
    }
  };

  return (
    <div
      onClick={() => onSelectProduct(product)}
      className="group cursor-pointer flex flex-col justify-between transition-all duration-300 ease-out rounded-2xl p-3 sm:p-2.5 bg-white shadow-xs hover:shadow-xl hover:shadow-black/10 border border-[#c4c7c7]/20 hover:border-[#000000]/25 hover:-translate-y-0.5"
    >
      <div>
        <div
          className={`relative overflow-hidden bg-[#fafafa] rounded-xl flex items-center justify-center border border-[#c4c7c7]/20 ${getAspectClass()} mb-3`}
        >
          {!isLoaded && (
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse z-0" />
          )}
          {displayImage && (
            <img
              ref={imgRef}
              src={displayImage}
              alt={displayName}
              onLoad={() => setIsLoaded(true)}
              onError={(e) => {
                setIsLoaded(true);
                if (!e.currentTarget.dataset.failed) {
                  e.currentTarget.dataset.failed = 'true';
                  e.currentTarget.src = fallbackImage;
                } else {
                  e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400"><rect width="100%" height="100%" fill="%23f5f5f7"/><text x="50%" y="50%" fill="%23888888" font-family="sans-serif" font-size="16" text-anchor="middle" font-weight="bold">TOUZA</text></svg>';
                }
              }}
              className={`w-full h-full object-contain p-1.5 transition-all duration-300 ease-out group-hover:scale-105 ${
                isLoaded ? 'opacity-100' : 'opacity-90'
              }`}
              loading="eager"
              decoding="async"
              fetchPriority="high"
              referrerPolicy="no-referrer"
            />
          )}

          {/* Wishlist Button */}
          <button
            type="button"
            onClick={(e) => onToggleWishlist(product, e)}
            className="absolute top-2 right-2 sm:top-3 sm:right-3 w-8 h-8 sm:w-9 sm:h-9 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-[#000000] opacity-90 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white z-10 cursor-pointer shadow-xs"
            title={isWishlisted ? t('product.removeFromWishlist', 'Remove') : t('product.addToWishlist', 'Add')}
          >
            <Heart
              className={`w-4 h-4 sm:w-4.5 sm:h-4.5 transition-colors ${
                isWishlisted ? 'fill-[#ba1a1a] text-[#ba1a1a]' : 'text-[#000000]'
              }`}
            />
          </button>

          {/* Badge */}
          {product.originalPrice && product.originalPrice > product.price ? (
            <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 bg-[#ba1a1a] text-white px-2 py-0.5 font-label-caps font-bold text-[9px] sm:text-[10px] tracking-wider shadow-xs rounded-md">
              {language === 'ar'
                ? `خصم ${Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%`
                : `-${Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF`}
            </div>
          ) : product.isNewArrival ? (
            <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 bg-white/90 px-2 py-0.5 font-label-caps text-[#000000] text-[9px] sm:text-[10px] tracking-widest shadow-xs rounded-md font-bold">
              {t('product.newArrival', 'New Arrival')}
            </div>
          ) : null}
        </div>

        <div className="flex justify-between items-start px-0.5 sm:px-1 gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
          <div className="min-w-0 flex-1">
            <h3
              className={`font-display text-[#000000] ${
                isLargeCard ? 'text-[17px] sm:text-[20px] md:text-[24px]' : 'text-[14px] sm:text-[16px] md:text-[18px]'
              } font-bold group-hover:text-[#444748] transition-colors leading-snug line-clamp-1`}
            >
              {displayName}
            </h3>
            {displaySubtitle && (
              <p className="font-body text-[11px] sm:text-[12px] text-[#747878] mt-0.5 line-clamp-1">
                {displaySubtitle}
              </p>
            )}

            {/* Color Dots/Swatches */}
            {product.colors && product.colors.length > 0 && (
              <div className="flex items-center gap-1 sm:gap-1.5 mt-1.5" onClick={(e) => e.stopPropagation()}>
                {product.colors.map((col, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveColorIndex(idx);
                    }}
                    onMouseEnter={() => setActiveColorIndex(idx)}
                    title={language === 'ar' && col.nameAr ? col.nameAr : col.name}
                    className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border transition-all cursor-pointer ${
                      activeColorIndex === idx
                        ? 'ring-1 ring-[#000000] ring-offset-1 border-transparent scale-110'
                        : 'border-[#747878]/30 hover:scale-105 opacity-80'
                    }`}
                    style={{ backgroundColor: col.hex }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col items-end shrink-0 dir-ltr text-right">
            <span className="font-body text-[13px] sm:text-[15px] font-bold text-[#000000]">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="font-body text-[11px] sm:text-[12px] text-[#747878] line-through font-semibold opacity-75">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        </div>

        {/* Sizes Selection */}
        {activeSizes && activeSizes.length > 0 && (
          <div className="mt-1.5 pt-1 border-t border-[#f0f0f0]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-1 px-0.5">
              <span className="font-body text-[10px] sm:text-[11px] font-bold text-[#555555]">
                {language === 'ar' ? 'المقاس:' : 'Size:'}
              </span>
              <span className="font-body text-[10px] sm:text-[11px] font-bold text-[#000000] bg-[#f0f0f2] px-1.5 py-0.2 rounded">
                {selectedSize}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1">
              {activeSizes.map((sObj) => {
                const isSelected = selectedSize === sObj.size;
                if (!sObj.inStock) {
                  return (
                    <span
                      key={sObj.size}
                      className="px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold font-body text-[#999999] bg-[#f5f5f5] rounded border border-[#e0e0e0] line-through cursor-not-allowed opacity-60"
                      title={language === 'ar' ? 'غير متوفر' : 'Out of Stock'}
                    >
                      {sObj.size}
                    </span>
                  );
                }
                return (
                  <button
                    key={sObj.size}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSize(sObj.size);
                    }}
                    className={`px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-[11px] font-bold font-body rounded transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-[#000000] text-white border-[#000000] shadow-xs scale-105'
                        : 'bg-white text-[#333333] border-[#cccccc] hover:border-[#000000] hover:bg-[#f8f8f8]'
                    }`}
                  >
                    {sObj.size}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Add To Cart Button */}
      {onQuickAdd && (
        <div className="mt-2 pt-1.5 sm:pt-2 border-t border-[#f0f0f0]">
          <button
            type="button"
            onClick={handleAddToCartClick}
            className={`w-full py-2 sm:py-2.5 px-2 sm:px-3 rounded-xl font-label-caps text-[12px] sm:text-[13px] font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition-all cursor-pointer shadow-xs ${
              isAddedSuccess
                ? 'bg-[#2e7d32] text-white'
                : 'bg-[#000000] text-white hover:bg-[#222222] active:scale-[0.98]'
            }`}
          >
            {isAddedSuccess ? (
              <CheckCircle2 className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white" />
            ) : (
              <ShoppingBag className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white" />
            )}
            <span>
              {isAddedSuccess
                ? language === 'ar'
                  ? 'تمت الإضافة ✓'
                  : 'Added ✓'
                : language === 'ar'
                ? 'إضافة للسلة'
                : 'Add to Cart'}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
