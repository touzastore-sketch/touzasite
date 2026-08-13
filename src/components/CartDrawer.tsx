import React from 'react';
import { CartItem } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { getLocalizedProductName } from '../data/products';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (cartItemId: string, newQty: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  const { language, formatPrice, t, direction } = useLanguage();

  if (!isOpen) return null;

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer */}
      <aside className={`absolute inset-y-0 ${direction === 'rtl' ? 'left-0 pr-10' : 'right-0 pl-10'} max-w-full flex`}>
        <div className="w-screen max-w-md bg-[#ffffff] shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-6 py-5 border-b border-[#c4c7c7]/30 flex justify-between items-center bg-[#f9f9f9]">
            <h2 className="font-display text-[22px] md:text-[24px] text-[#000000] flex items-center gap-2">
              <span className="material-symbols-outlined text-[24px]">shopping_bag</span>
              {t('cart.title', 'Shopping Bag')} ({totalItemsCount})
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 text-[#000000] hover:bg-[#747878]/10 rounded-full transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[24px]">close</span>
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4">
                <div className="w-20 h-20 bg-[#f3f3f4] rounded-full flex items-center justify-center mb-5">
                  <span className="material-symbols-outlined text-[42px] text-[#747878]">
                    shopping_bag
                  </span>
                </div>
                <p className="font-display text-[22px] text-[#000000] mb-2 font-bold">
                  {t('cart.emptyTitle', 'Your bag is empty')}
                </p>
                <p className="font-body text-[14px] text-[#444748] mb-8 leading-relaxed max-w-xs">
                  {t('cart.emptySubtitle', 'Discover our timeless collections and find your new wardrobe essential.')}
                </p>
                <button
                  onClick={onClose}
                  className="bg-[#000000] text-white py-3.5 px-8 font-label-caps rounded-lg hover:bg-[#2f3131] transition-all cursor-pointer shadow-sm active:scale-[0.99] text-[14px]"
                >
                  {t('cart.explore', 'Explore Collections')}
                </button>
              </div>
            ) : (
              cartItems.map((item) => {
                const name = getLocalizedProductName(item.product, language);
                const colorObj = item.product.colors?.find((c) => c.name === item.selectedColor);
                const itemImage = colorObj?.imageUrl || item.product.images[0];
                return (
                  <div
                    key={item.id}
                    className="flex gap-4 pb-5 border-b border-[#c4c7c7]/30 items-start"
                  >
                    <img
                      src={itemImage || '/images/touza_green_shirt.jpg'}
                      alt={name}
                      onError={(e) => {
                        e.currentTarget.src = '/images/touza_green_shirt.jpg';
                      }}
                      className="w-20 h-24 object-cover bg-[#f3f3f4] shrink-0 rounded-lg border border-[#747878]/10"
                    />
                    <div className="flex-1 flex flex-col justify-between h-full">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="font-display text-[16px] text-[#000000] font-semibold leading-snug">
                            {name}
                          </h3>
                          <button
                            onClick={() => onRemoveItem(item.id)}
                            className="text-[#747878] hover:text-[#ba1a1a] transition-colors p-1 cursor-pointer"
                            title={t('cart.remove', 'Remove')}
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              delete
                            </span>
                          </button>
                        </div>
                        <p className="font-body text-[13px] text-[#444748] mt-1">
                          {t('cart.color', 'Color')}: {item.selectedColor} | {t('cart.size', 'Size')}: {item.selectedSize}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5 dir-ltr">
                          <span className="font-body text-[15px] font-bold text-[#000000]">
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
                      <div className="flex items-center gap-3 mt-3">
                        <button
                          onClick={() =>
                            onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))
                          }
                          className="w-7 h-7 border border-[#c4c7c7] rounded-md flex items-center justify-center hover:border-[#000000] transition-colors cursor-pointer font-bold text-[14px]"
                        >
                          -
                        </button>
                        <span className="font-body text-[14px] font-bold text-[#000000] w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 border border-[#c4c7c7] rounded-md flex items-center justify-center hover:border-[#000000] transition-colors cursor-pointer font-bold text-[14px]"
                        >
                          +
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
            <div className="p-6 border-t border-[#c4c7c7]/40 bg-[#f9f9f9]">
              <div className="space-y-2 mb-6">
                <div className="flex justify-between font-label-caps text-[#444748]">
                  <span>{t('cart.subtotal', 'Subtotal')}</span>
                  <span className="font-bold text-[#000000] text-[17px] dir-ltr">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between font-label-caps text-[#444748] text-[12px]">
                  <span>{t('cart.delivery', 'Express Delivery')}</span>
                  <span className="text-[#2e7d32] font-bold">{t('cart.free', 'Complimentary')}</span>
                </div>
                <p className="text-[12px] text-[#747878] font-body mt-1">
                  {t('cart.taxInfo', 'All duties & delivery across Egypt included.')}
                </p>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onProceedToCheckout();
                }}
                className="w-full bg-[#000000] text-white py-4 rounded-lg font-label-caps hover:bg-[#2f3131] transition-all cursor-pointer text-center shadow-md active:scale-[0.99] text-[15px]"
              >
                {t('cart.checkout', 'Proceed to Checkout')}
              </button>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};
