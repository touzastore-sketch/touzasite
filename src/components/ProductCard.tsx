import React, { useState } from 'react';
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
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelectProduct,
  isWishlisted,
  onToggleWishlist,
  onQuickAdd,
  aspectRatio = 'portrait',
  isLargeCard = false,
}) => {
  const { language, formatPrice, t } = useLanguage();
  const [activeColorIndex, setActiveColorIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>(() => {
    return product.sizes?.find((s) => s.inStock)?.size || product.sizes?.[0]?.size || 'M';
  });
  const [isAddedSuccess, setIsAddedSuccess] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      setIsLoaded(true);
    }
  }, []);

  const getAspectClass = () => {
    if (aspectRatio === 'wide') return 'aspect-[16/9] max-h-[300px]';
    if (aspectRatio === 'square') return 'aspect-square max-h-[280px]';
    // Proportional aspect ratio that scales smoothly on all mobile viewports
    return 'aspect-[3/4] max-h-[320px] sm:max-h-[360px] w-full';
  };

  const activeColor = product.colors?.[activeColorIndex];
  const rawImg = activeColor?.imageUrl || product.images?.[0];
  const fallbackImage = 'https://res.cloudinary.com/qazdrpcx/image/upload/v1786595479/touza_products/reuodzuouk8woxkq38zz.jpg';
  const displayImage = getOptimizedImageUrl(rawImg && rawImg.trim() ? rawImg : fallbackImage, { width: 600 });

  const displayName = getLocalizedProductName(product, language);
  const displaySubtitle = getLocalizedProductSubtitle(product, language);

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
      className="group cursor-pointer flex flex-col justify-between transition-all duration-350 ease-out rounded-2xl p-2.5 bg-white shadow-xs hover:shadow-xl hover:shadow-black/10 border border-[#c4c7c7]/20 hover:border-[#000000]/25 hover:-translate-y-1"
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
              className="w-full h-full object-contain p-1.5 transition-all duration-350 ease-out group-hover:scale-105 opacity-100"
              loading="eager"
              decoding="async"
              referrerPolicy="no-referrer"
            />
          )}

          {/* Wishlist Button */}
          <button
            type="button"
            onClick={(e) => onToggleWishlist(product, e)}
            className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-[#000000] opacity-90 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white z-10 cursor-pointer shadow-xs"
            title={isWishlisted ? t('product.removeFromWishlist', 'Remove') : t('product.addToWishlist', 'Add')}
          >
            <span
              className="material-symbols-outlined text-[18px]"
              style={{
                fontVariationSettings: isWishlisted ? "'FILL' 1" : "'FILL' 0",
                color: isWishlisted ? '#ba1a1a' : '#000000',
              }}
            >
              favorite
            </span>
          </button>

          {/* Badge */}
          {product.originalPrice && product.originalPrice > product.price ? (
            <div className="absolute bottom-3 left-3 bg-[#ba1a1a] text-white px-2.5 py-0.5 font-label-caps font-bold text-[10px] tracking-wider shadow-xs rounded-md">
              {language === 'ar'
                ? `خصم ${Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%`
                : `-${Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF`}
            </div>
          ) : product.isNewArrival ? (
            <div className="absolute bottom-3 left-3 bg-white/90 px-2.5 py-0.5 font-label-caps text-[#000000] text-[10px] tracking-widest shadow-xs rounded-md font-bold">
              {t('product.newArrival', 'New Arrival')}
            </div>
          ) : null}
        </div>

        <div className="flex justify-between items-start px-1 gap-2 mb-2">
          <div className="min-w-0 flex-1">
            <h3
              className={`font-display text-[#000000] ${
                isLargeCard ? 'text-[20px] md:text-[24px]' : 'text-[16px] md:text-[18px]'
              } font-bold group-hover:text-[#444748] transition-colors leading-snug line-clamp-1`}
            >
              {displayName}
            </h3>
            {displaySubtitle && (
              <p className="font-body text-[12px] text-[#747878] mt-0.5 line-clamp-1">
                {displaySubtitle}
              </p>
            )}

            {/* Color Dots/Swatches */}
            {product.colors && product.colors.length > 0 && (
              <div className="flex items-center gap-1.5 mt-2" onClick={(e) => e.stopPropagation()}>
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
                    className={`w-3.5 h-3.5 rounded-full border transition-all cursor-pointer ${
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
            <span className="font-body text-[15px] font-bold text-[#000000]">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="font-body text-[12px] text-[#747878] line-through font-semibold opacity-75">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        </div>

        {/* Sizes Selection */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="mt-2 pt-1.5 border-t border-[#f0f0f0]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-1 px-0.5">
              <span className="font-body text-[11px] font-bold text-[#555555]">
                {language === 'ar' ? 'المقاس:' : 'Size:'}
              </span>
              <span className="font-body text-[11px] font-bold text-[#000000] bg-[#f0f0f2] px-1.5 py-0.2 rounded">
                {selectedSize}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1">
              {product.sizes.map((sObj) => {
                const isSelected = selectedSize === sObj.size;
                if (!sObj.inStock) {
                  return (
                    <span
                      key={sObj.size}
                      className="px-1.5 py-0.5 text-[10px] font-bold font-body text-[#999999] bg-[#f5f5f5] rounded border border-[#e0e0e0] line-through cursor-not-allowed opacity-60"
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
                    className={`px-2 py-0.5 text-[11px] font-bold font-body rounded transition-all cursor-pointer border ${
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
        <div className="mt-2 pt-2 border-t border-[#f0f0f0]">
          <button
            type="button"
            onClick={handleAddToCartClick}
            className={`w-full py-2.5 px-3 rounded-xl font-label-caps text-[13px] font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
              isAddedSuccess
                ? 'bg-[#2e7d32] text-white'
                : 'bg-[#000000] text-white hover:bg-[#222222] active:scale-[0.98]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {isAddedSuccess ? 'check_circle' : 'shopping_bag'}
            </span>
            <span>
              {isAddedSuccess
                ? language === 'ar'
                  ? 'تمت الإضافة للسلة ✓'
                  : 'Added to Cart ✓'
                : language === 'ar'
                ? 'إضافة إلى السلة'
                : 'Add to Cart'}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
