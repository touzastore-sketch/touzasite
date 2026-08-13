import React from 'react';
import { Product } from '../types';
import { PRODUCTS, getLocalizedProductName, getLocalizedProductCategory } from '../data/products';
import { useLanguage } from '../context/LanguageContext';

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistIds: string[];
  onSelectProduct: (product: Product) => void;
  onRemoveWishlist: (product: Product) => void;
  onAddToCart: (product: Product, color: string, size: string) => void;
}

export const WishlistModal: React.FC<WishlistModalProps> = ({
  isOpen,
  onClose,
  wishlistIds,
  onSelectProduct,
  onRemoveWishlist,
  onAddToCart,
}) => {
  const { language, formatPrice, t, direction } = useLanguage();

  if (!isOpen) return null;

  const wishlistedProducts = PRODUCTS.filter((p) => wishlistIds.includes(p.id));

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
            <h2 className="font-display text-[22px] md:text-[24px] text-[#000000] flex items-center gap-2 font-bold">
              <span className="material-symbols-outlined text-[24px] text-[#ba1a1a]">favorite</span>
              {t('nav.wishlist', 'المفضلة / المحفوظات')} ({wishlistedProducts.length})
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 text-[#000000] hover:bg-[#747878]/10 rounded-full transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[24px]">close</span>
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
            {wishlistedProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4">
                <div className="w-20 h-20 bg-[#f3f3f4] rounded-full flex items-center justify-center mb-5">
                  <span className="material-symbols-outlined text-[42px] text-[#ba1a1a]">
                    favorite_border
                  </span>
                </div>
                <p className="font-display text-[22px] text-[#000000] mb-2 font-bold">
                  {language === 'ar' ? 'قائمة المفضلة فارغة حالياً' : 'Your wishlist is empty'}
                </p>
                <p className="font-body text-[14px] text-[#444748] mb-8 leading-relaxed max-w-xs">
                  {language === 'ar'
                    ? 'اضغط على علامة القلب على أي قطعة لإضافتها إلى قائمتك المفضلة وحفظها للرجوع إليها لاحقاً.'
                    : 'Click the heart icon on any piece to save your favorite luxury items for later.'}
                </p>
                <button
                  onClick={onClose}
                  className="bg-[#000000] text-white py-3.5 px-8 font-label-caps rounded-lg hover:bg-[#2f3131] transition-all cursor-pointer shadow-sm text-[14px]"
                >
                  {t('cart.explore', 'تصفح التشكيلة')}
                </button>
              </div>
            ) : (
              wishlistedProducts.map((item) => {
                const name = getLocalizedProductName(item, language);
                const category = getLocalizedProductCategory(item, language);
                return (
                  <div
                    key={item.id}
                    className="flex gap-4 p-3 rounded-xl hover:bg-[#f3f3f4] transition-colors border border-[#c4c7c7]/20 items-start"
                  >
                    <img
                      src={item.images[0] || '/images/touza_green_shirt.jpg'}
                      alt={name}
                      onError={(e) => {
                        e.currentTarget.src = '/images/touza_green_shirt.jpg';
                      }}
                      className="w-20 h-24 object-cover bg-[#f3f3f4] rounded-lg shrink-0 cursor-pointer border border-[#747878]/10"
                      onClick={() => {
                        onClose();
                        onSelectProduct(item);
                      }}
                    />
                    <div className="flex-1 flex flex-col justify-between h-full min-w-0">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h3
                            onClick={() => {
                              onClose();
                              onSelectProduct(item);
                            }}
                            className="font-display text-[16px] text-[#000000] font-bold cursor-pointer hover:underline truncate"
                          >
                            {name}
                          </h3>
                          <button
                            onClick={() => onRemoveWishlist(item)}
                            className="text-[#747878] hover:text-[#ba1a1a] transition-colors p-1 cursor-pointer shrink-0"
                            title="Remove"
                          >
                            <span className="material-symbols-outlined text-[18px]">close</span>
                          </button>
                        </div>
                        <p className="font-body text-[12px] text-[#444748] mt-0.5">{category}</p>
                        <p className="font-body text-[15px] font-bold text-[#000000] mt-1 dir-ltr">
                          {formatPrice(item.price)}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          onAddToCart(
                            item,
                            item.colors[0]?.name || 'Noir',
                            item.sizes.find((s) => s.inStock)?.size || '36'
                          );
                        }}
                        className="w-full bg-[#000000] text-white py-2 rounded-lg font-label-caps text-[12px] hover:bg-[#2f3131] transition-colors cursor-pointer mt-3 shadow-xs"
                      >
                        {t('detail.addToCart', 'أضف إلى السلة')}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </aside>
    </div>
  );
};
