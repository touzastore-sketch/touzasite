import React, { useState } from 'react';
import { Heart, Check, ShoppingBag } from 'lucide-react';
import { Product } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { getLocalizedProductName, getLocalizedProductCategory } from '../data/products';
import { getOptimizedImageUrl } from '../utils/cloudinary';
import { triggerFlyToCart } from '../utils/flyToCart';

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

const ProductCardComponent: React.FC<ProductCardProps> = ({
  product,
  onSelectProduct,
  isWishlisted,
  onToggleWishlist,
  onQuickAdd,
  aspectRatio = 'portrait',
  priority = false,
}) => {
  const { language, formatPrice, t } = useLanguage();
  const isAr = language === 'ar';
  const [activeColorIndex, setActiveColorIndex] = useState(0);
  const [addedSize, setAddedSize] = useState<string | null>(null);

  const getAspectClass = () => {
    if (aspectRatio === 'wide') return 'aspect-[16/10]';
    if (aspectRatio === 'square') return 'aspect-square';
    return 'aspect-[3/4]';
  };

  const activeColor = product.colors?.[activeColorIndex];
  const activeSizes =
    activeColor?.sizes && activeColor.sizes.length > 0
      ? activeColor.sizes
      : product.sizes || [];

  const firstAvailableSize =
    activeSizes.find((s) => s.inStock)?.size || activeSizes[0]?.size || 'L';

  const [selectedSize, setSelectedSize] = useState<string>(firstAvailableSize);

  React.useEffect(() => {
    const stillValid = activeSizes.some(
      (s) => s.size === selectedSize && s.inStock
    );
    if (!stillValid) {
      setSelectedSize(firstAvailableSize);
    }
  }, [activeColorIndex, product.id, firstAvailableSize]);

  const rawImg = activeColor?.imageUrl || product.images?.[0];
  const fallbackImage =
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400"><rect width="100%" height="100%" fill="%23f2f2f0"/><text x="50%" y="50%" fill="%238a8782" font-family="serif" font-size="16" letter-spacing="4" text-anchor="middle">TOUZA</text></svg>';
  const displayImage =
    rawImg && rawImg.trim()
      ? getOptimizedImageUrl(rawImg, { width: 640, quality: 'auto:good' })
      : fallbackImage;

  const displayName = getLocalizedProductName(product, language);
  const displayCategory = getLocalizedProductCategory(product, language);

  const [imgSrc, setImgSrc] = useState<string>(displayImage);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    setImgSrc(displayImage);
    setHasError(false);
    setIsLoaded(false);
  }, [displayImage]);

  React.useEffect(() => {
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setIsLoaded(true);
    }
  }, [imgSrc]);

  const handleDirectAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onQuickAdd) {
      onSelectProduct(product);
      return;
    }
    const chosenColor = activeColor?.name || product.colors?.[0]?.name || 'Noir';
    const chosenSize = selectedSize || firstAvailableSize;
    triggerFlyToCart(imgRef.current || (e.currentTarget as HTMLElement), imgSrc);
    onQuickAdd(product, chosenColor, chosenSize, e);
    setAddedSize(chosenSize);
    setTimeout(() => setAddedSize(null), 1600);
  };

  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  return (
    <article
      onClick={() => onSelectProduct(product)}
      className="group cursor-pointer flex flex-col h-full bg-[#ffffff]"
    >
      {/* Bread & Boxers Light Studio Frame */}
      <div
        className={`relative overflow-hidden bg-[#f2f2f0] w-full ${getAspectClass()} mb-3`}
      >
        {!isLoaded && (
          <div className="absolute inset-0 bg-[#ecebe7] animate-pulse z-0" />
        )}

        {imgSrc && (
          <img
            key={imgSrc}
            ref={imgRef}
            src={imgSrc}
            alt={displayName}
            onLoad={() => setIsLoaded(true)}
            onError={() => {
              if (!hasError) {
                setHasError(true);
                setImgSrc(fallbackImage);
              }
              setIsLoaded(true);
            }}
            className={`w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03] ${
              isLoaded ? 'opacity-100' : 'opacity-90'
            }`}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            fetchPriority={priority ? 'high' : 'auto'}
            referrerPolicy="no-referrer"
          />
        )}

        {/* Top-Start Bread & Boxers Flush Ribbon Tag (Burgundy for Offer / Ink for New) */}
        {discountPercent > 0 ? (
          <span className="absolute top-0 start-0 bg-[#7f1d1d] text-white px-2.5 py-1 text-[11px] font-medium tracking-[0.03em] tabular-nums z-10">
            {isAr ? `خصم -${discountPercent}%` : `Special -${discountPercent}%`}
          </span>
        ) : product.isNewArrival ? (
          <span className="absolute top-0 start-0 bg-[#111111] text-white px-2.5 py-1 text-[10px] font-medium tracking-[0.08em] uppercase z-10">
            {isAr ? 'وصل حديثاً' : 'New In'}
          </span>
        ) : null}

        {/* Bottom-Start Fit / Category Label (Bread & Boxers Signature Square Tag) */}
        {displayCategory && (
          <span className="absolute bottom-2.5 start-2.5 bg-[#111111]/90 text-white px-2.5 py-1 text-[10px] tracking-[0.1em] uppercase font-medium z-10">
            {displayCategory}
          </span>
        )}

        {/* Subtle Wishlist Heart */}
        <button
          type="button"
          onClick={(e) => onToggleWishlist(product, e)}
          className={`absolute top-2 end-2 w-8 h-8 flex items-center justify-center transition-opacity duration-200 cursor-pointer z-10 ${
            isWishlisted
              ? 'opacity-100 text-[#111111]'
              : 'opacity-70 sm:opacity-0 sm:group-hover:opacity-100 text-[#111111] hover:opacity-100'
          }`}
          title={
            isWishlisted
              ? t('product.removeFromWishlist', 'Remove')
              : t('product.addToWishlist', 'Save')
          }
          aria-label={
            isWishlisted
              ? t('product.removeFromWishlist', 'Remove')
              : t('product.addToWishlist', 'Save')
          }
        >
          <Heart
            className={`w-4 h-4 stroke-[1.5] transition-colors ${
              isWishlisted ? 'fill-[#111111] text-[#111111]' : ''
            }`}
          />
        </button>
      </div>

      {/* Exact Bread & Boxers Typography + Mobile-First Size Picker & Add to Cart */}
      <div className="flex flex-col flex-1 gap-1 px-0.5">
        <h3 className="font-body text-[13.5px] sm:text-[14px] font-normal text-[#111111] leading-snug line-clamp-1 group-hover:underline underline-offset-4 decoration-[#111111]/40">
          {displayName}
        </h3>

        <div className="flex items-baseline gap-2.5 tabular-nums dir-ltr w-fit">
          <span
            className={`text-[13px] sm:text-[14px] font-medium ${
              discountPercent > 0 ? 'text-[#9e352d]' : 'text-[#111111]'
            }`}
          >
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-[12.5px] text-[#6e6c68] line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Subtle Swatches when multiple colors exist */}
        {product.colors && product.colors.length > 1 && (
          <div
            className="flex items-center gap-1.5 pt-1"
            onClick={(e) => e.stopPropagation()}
          >
            {product.colors.map((col, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveColorIndex(idx);
                }}
                onMouseEnter={() => setActiveColorIndex(idx)}
                title={isAr && col.nameAr ? col.nameAr : col.name}
                aria-label={isAr && col.nameAr ? col.nameAr : col.name}
                className={`w-3 h-3 rounded-full transition-all cursor-pointer ${
                  activeColorIndex === idx
                    ? 'ring-1 ring-[#111111] ring-offset-2'
                    : 'border border-black/20 opacity-75 hover:opacity-100'
                }`}
                style={{ backgroundColor: col.hex }}
              />
            ))}
          </div>
        )}

        {/* Bottom-Aligned Size Selector + Animated Add to Cart (Mobile & Desktop) */}
        <div
          className="mt-auto pt-2 flex flex-col gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          {activeSizes.length > 0 && (
            <div className="flex items-center flex-wrap gap-1">
              {activeSizes.map((sObj) => {
                const isSelected = selectedSize === sObj.size;
                if (!sObj.inStock) {
                  return (
                    <span
                      key={sObj.size}
                      aria-disabled="true"
                      className="min-w-[26px] sm:min-w-[28px] h-[26px] sm:h-[27px] px-1.5 border border-[#ebe8e2] bg-[#faf9f7] text-[#b5b2ac] text-[10px] sm:text-[11px] font-medium line-through flex items-center justify-center cursor-not-allowed select-none"
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
                    aria-pressed={isSelected}
                    className={`min-w-[26px] sm:min-w-[28px] h-[26px] sm:h-[27px] px-1.5 border rounded-none text-[10px] sm:text-[11px] font-medium transition-colors duration-150 cursor-pointer flex items-center justify-center active:scale-95 ${
                      isSelected
                        ? 'bg-[#111111] text-white border-[#111111]'
                        : 'bg-[#ffffff] text-[#111111] border-[#d8d5ce] hover:border-[#111111]'
                    }`}
                  >
                    {sObj.size}
                  </button>
                );
              })}
            </div>
          )}

          {onQuickAdd && (
            <button
              type="button"
              onClick={handleDirectAddToCart}
              className={`w-full h-[38px] sm:h-[40px] border border-[#111111] rounded-none text-[10.5px] sm:text-[11.5px] font-medium tracking-[0.09em] uppercase transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 active:scale-[0.97] ${
                addedSize
                  ? 'bg-[#111111] text-white'
                  : 'bg-[#ffffff] text-[#111111] hover:bg-[#111111] hover:text-white btn-atc-sheen btn-atc-sheen-dark'
              }`}
            >
              {addedSize ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[2.2] shrink-0" />
                  <span className="truncate">
                    {isAr ? `تمت الإضافة · ${addedSize}` : `ADDED · ${addedSize}`}
                  </span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5 stroke-[1.7] animate-atc-icon shrink-0" />
                  <span className="truncate">
                    {isAr ? 'أضف للسلة' : 'ADD TO CART'}
                  </span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

export const ProductCard = React.memo(ProductCardComponent);
