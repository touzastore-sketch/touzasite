import React from 'react';
import { ShoppingBag, X, Trash2, Plus, Minus, ArrowRight, ArrowLeft } from 'lucide-react';
import { CartItem } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { getLocalizedProductName } from '../data/products';
import { getOptimizedImageUrl } from '../utils/cloudinary';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (cartItemId: string, newQty: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onProceedToCheckout: () => void;
}

const FALLBACK_IMAGE = 'https://res.cloudinary.com/qazdrpcx/image/upload/v1786595479/touza_products/reuodzuouk8woxkq38zz.jpg';

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  const { language, formatPrice, t, direction } = useLanguage();

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div id="cart-drawer-modal" className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        id="cart-drawer-backdrop"
        onClick={onClose}
        className="fixed inset-0 bg-black/65 backdrop-blur-xs transition-opacity animate-fade-in cursor-pointer z-40"
        aria-label={language === 'ar' ? 'إغلاق السلة' : 'Close bag'}
      />

      {/* Drawer */}
      <aside
        id="cart-drawer-aside"
        className={`fixed top-0 bottom-0 ${
          direction === 'rtl' ? 'left-0' : 'right-0'
        } w-full sm:w-[460px] max-w-full flex flex-col z-50 shadow-2xl h-[100dvh] max-h-[100dvh] bg-[#ffffff] transition-transform duration-300 ease-out`}
      >
        <div className="w-full h-full flex flex-col justify-between overflow-hidden">
          {/* Header */}
          <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#c4c7c7]/30 flex justify-between items-center bg-[#f9f9f9] shrink-0 pt-[max(0.875rem,env(safe-area-inset-top))]">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-[#000000] shrink-0" />
              <h2 className="font-display text-[17px] sm:text-[20px] md:text-[22px] text-[#000000] font-bold truncate">
                {t('cart.title', 'Shopping Bag')}
              </h2>
              <span className="text-[12px] sm:text-[13px] bg-[#000000] text-white px-2 py-0.5 rounded-full font-sans font-bold shrink-0">
                {totalItemsCount}
              </span>
            </div>

            {/* Prominent High-Contrast Close Button */}
            <button
              id="cart-drawer-close-btn"
              onClick={onClose}
              type="button"
              className="w-11 h-11 min-w-[44px] min-h-[44px] sm:w-10 sm:h-10 sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center text-[#000000] bg-[#e8e8e8] hover:bg-[#000000] hover:text-white rounded-full transition-all cursor-pointer shrink-0 active:scale-90 z-30 border border-[#c4c7c7] shadow-sm ml-2 rtl:ml-0 rtl:mr-2"
              aria-label="Close cart"
              title={language === 'ar' ? 'إغلاق السلة' : 'Close cart'}
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 space-y-3.5 sm:space-y-4 overscroll-contain">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4">
                <div className="w-20 h-20 bg-[#f3f3f4] rounded-full flex items-center justify-center mb-5 border border-[#c4c7c7]/30">
                  <ShoppingBag className="w-10 h-10 text-[#747878]" />
                </div>
                <p className="font-display text-[20px] sm:text-[22px] text-[#000000] mb-2 font-bold">
                  {t('cart.emptyTitle', 'Your bag is empty')}
                </p>
                <p className="font-body text-[13px] sm:text-[14px] text-[#444748] mb-8 leading-relaxed max-w-xs">
                  {t('cart.emptySubtitle', 'Discover our timeless collections and find your new wardrobe essential.')}
                </p>
                <button
                  id="cart-empty-explore-btn"
                  onClick={onClose}
                  className="bg-[#000000] text-white py-3.5 px-8 font-label-caps rounded-lg hover:bg-[#2f3131] transition-all cursor-pointer shadow-sm active:scale-[0.99] text-[13px] sm:text-[14px] font-bold"
                >
                  {t('cart.explore', 'Explore Collections')}
                </button>
              </div>
            ) : (
              cartItems.map((item) => {
                const name = getLocalizedProductName(item.product, language);
                const colorObj = item.product.colors?.find((c) => c.name === item.selectedColor);
                const rawImg = colorObj?.imageUrl || (item.product.images && item.product.images.length > 0 ? item.product.images[0] : '') || FALLBACK_IMAGE;
                const itemImage = getOptimizedImageUrl(rawImg, { width: 300 });

                return (
                  <div
                    key={item.id}
                    className="flex gap-3.5 sm:gap-4 pb-3.5 sm:pb-4 border-b border-[#c4c7c7]/30 items-start bg-white rounded-lg p-2.5 sm:p-0"
                  >
                    {/* Product Thumbnail Image */}
                    <div className="relative w-20 sm:w-24 h-24 sm:h-28 bg-[#f3f3f4] shrink-0 rounded-lg overflow-hidden border border-[#000000]/10 shadow-2xs">
                      <img
                        src={itemImage}
                        alt={name}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          if (!e.currentTarget.dataset.failed) {
                            e.currentTarget.dataset.failed = 'true';
                            e.currentTarget.src = FALLBACK_IMAGE;
                          }
                        }}
                        className="w-full h-full object-cover object-top"
                      />
                    </div>

                    {/* Product Info & Controls */}
                    <div className="flex-1 flex flex-col justify-between min-h-[96px] sm:min-h-[112px]">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-display text-[14px] sm:text-[16px] text-[#000000] font-bold leading-snug line-clamp-2">
                            {name}
                          </h3>
                          <button
                            onClick={() => onRemoveItem(item.id)}
                            className="text-[#747878] hover:text-[#ba1a1a] p-1.5 cursor-pointer shrink-0 rounded-md hover:bg-red-50 transition-colors"
                            title={t('cart.remove', 'Remove')}
                          >
                            <Trash2 className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                          </button>
                        </div>

                        {/* Selected Options */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-1 font-body text-[12px] sm:text-[13px] text-[#555555]">
                          {item.selectedColor && (
                            <span className="inline-flex items-center gap-1 bg-[#f3f3f4] px-2 py-0.5 rounded text-[11px] sm:text-[12px] font-medium text-[#1a1c1c]">
                              {item.selectedColor}
                            </span>
                          )}
                          {item.selectedSize && (
                            <span className="inline-flex items-center gap-1 bg-[#f3f3f4] px-2 py-0.5 rounded text-[11px] sm:text-[12px] font-bold text-[#1a1c1c]">
                              {item.selectedSize}
                            </span>
                          )}
                        </div>

                        {/* Price Display */}
                        <div className="flex items-center gap-2 mt-1.5 dir-ltr">
                          <span className="font-body text-[15px] sm:text-[16px] font-extrabold text-[#000000]">
                            {formatPrice(item.product.price)}
                          </span>
                          {item.product.originalPrice && item.product.originalPrice > item.product.price && (
                            <span className="font-body text-[12px] text-[#747878] line-through">
                              {formatPrice(item.product.originalPrice)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-3 mt-2 sm:mt-3">
                        <button
                          onClick={() =>
                            onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))
                          }
                          className="w-8 h-8 sm:w-8 sm:h-8 border border-[#c4c7c7] rounded-md flex items-center justify-center hover:border-[#000000] hover:bg-black hover:text-white transition-all cursor-pointer text-[13px] font-bold active:scale-95 bg-white"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-body text-[14px] font-extrabold text-[#000000] min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 sm:w-8 sm:h-8 border border-[#c4c7c7] rounded-md flex items-center justify-center hover:border-[#000000] hover:bg-black hover:text-white transition-all cursor-pointer text-[13px] font-bold active:scale-95 bg-white"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Subtotal & Checkout */}
          {cartItems.length > 0 && (
            <div className="p-4 sm:p-6 border-t border-[#c4c7c7]/40 bg-[#f9f9f9] shrink-0 pb-[max(1.25rem,env(safe-area-inset-bottom))] space-y-3">
              <div className="space-y-1.5">
                <div className="flex justify-between font-label-caps text-[#444748] text-[13px] sm:text-[14px]">
                  <span>{t('cart.subtotal', 'Subtotal')}</span>
                  <span className="font-bold text-[#000000] text-[17px] sm:text-[18px] dir-ltr">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between font-label-caps text-[#444748] text-[11px] sm:text-[12px]">
                  <span>{t('cart.delivery', 'Express Delivery')}</span>
                  <span className="text-[#2e7d32] font-bold">{t('cart.free', 'Complimentary')}</span>
                </div>
                <p className="text-[11px] sm:text-[12px] text-[#747878] font-body">
                  {t('cart.taxInfo', 'All duties & delivery across Egypt included.')}
                </p>
              </div>

              <div className="space-y-2 pt-1">
                <button
                  id="cart-drawer-checkout-btn"
                  onClick={() => {
                    onClose();
                    onProceedToCheckout();
                  }}
                  className="w-full bg-[#000000] text-white py-3.5 sm:py-4 rounded-xl font-label-caps hover:bg-[#2f3131] transition-all cursor-pointer text-center shadow-md active:scale-[0.99] text-[14px] sm:text-[15px] font-bold flex items-center justify-center gap-2"
                >
                  <span>{t('cart.checkout', 'Proceed to Checkout')}</span>
                  {direction === 'rtl' ? (
                    <ArrowLeft className="w-4 h-4" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                </button>

                <button
                  id="cart-drawer-continue-shopping-btn"
                  onClick={onClose}
                  className="w-full bg-transparent text-[#555555] hover:text-[#000000] py-2 rounded-lg font-body text-[13px] transition-colors cursor-pointer text-center"
                >
                  {language === 'ar' ? '← متابعة التسوق في المتجر' : '← Continue Shopping'}
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};

