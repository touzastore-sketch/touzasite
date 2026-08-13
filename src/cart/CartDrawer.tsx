import React from 'react';
import { CartItem } from '../types';

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
  if (!isOpen) return null;

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer */}
      <aside className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#ffffff] shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-6 py-6 border-b border-[#c4c7c7]/30 flex justify-between items-center">
            <h2 className="font-display text-[26px] text-[#000000]">
              Shopping Bag ({cartItems.reduce((acc, item) => acc + item.quantity, 0)})
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-[#000000] hover:opacity-70 transition-opacity cursor-pointer"
            >
              <span className="material-symbols-outlined text-[24px]">close</span>
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <span className="material-symbols-outlined text-[56px] text-[#747878] mb-4">
                  shopping_bag
                </span>
                <p className="font-display text-[24px] text-[#000000] mb-2">
                  Your bag is empty
                </p>
                <p className="font-body text-[14px] text-[#444748] mb-6">
                  Discover our timeless collections and find your new wardrobe essential.
                </p>
                <button
                  onClick={onClose}
                  className="bg-[#000000] text-white py-3 px-8 font-label-caps rounded-full hover:bg-[#2f3131] transition-colors cursor-pointer"
                >
                  Explore Collections
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 pb-6 border-b border-[#c4c7c7]/30"
                >
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-24 h-32 object-cover bg-[#f3f3f4] shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="font-display text-[18px] text-[#000000]">
                          {item.product.name}
                        </h3>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="text-[#747878] hover:text-[#000000] transition-colors p-1 cursor-pointer"
                          title="Remove item"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            delete
                          </span>
                        </button>
                      </div>
                      <p className="font-body text-[13px] text-[#444748] mt-1">
                        Color: {item.selectedColor} | Size: {item.selectedSize}
                      </p>
                      <p className="font-body text-[15px] font-medium text-[#000000] mt-2">
                        ${item.product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                    </div>

                    {/* Quantity Stepper */}
                    <div className="flex items-center gap-3 mt-4">
                      <button
                        onClick={() =>
                          onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))
                        }
                        className="w-7 h-7 border border-[#c4c7c7] flex items-center justify-center hover:border-[#000000] transition-colors cursor-pointer"
                      >
                        -
                      </button>
                      <span className="font-body text-[14px] font-semibold text-[#000000] w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 border border-[#c4c7c7] flex items-center justify-center hover:border-[#000000] transition-colors cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Subtotal & Checkout */}
          {cartItems.length > 0 && (
            <div className="p-6 border-t border-[#c4c7c7]/40 bg-[#f9f9f9]">
              <div className="space-y-2 mb-6">
                <div className="flex justify-between font-label-caps text-[#444748]">
                  <span>Subtotal</span>
                  <span className="font-bold text-[#000000] text-[16px]">
                    ${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between font-label-caps text-[#444748] text-[11px]">
                  <span>Express Delivery</span>
                  <span className="text-[#000000]">Complimentary</span>
                </div>
                <p className="text-[12px] text-[#747878] font-body mt-1">
                  Taxes and duties calculated at checkout.
                </p>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onProceedToCheckout();
                }}
                className="w-full bg-[#000000] text-white py-4 rounded-lg font-label-caps hover:bg-[#2f3131] transition-all cursor-pointer text-center shadow-md active:scale-[0.99]"
              >
                Proceed to Checkout
              </button>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};
