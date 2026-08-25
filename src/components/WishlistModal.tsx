import React from 'react';
import { Heart, X, ShoppingBag } from 'lucide-react';
import { Product } from '../types';
import { PRODUCTS, getLocalizedProductName, getLocalizedProductCategory } from '../data/products';
import { useLanguage } from '../context/LanguageContext';
import { getOptimizedImageUrl } from '../utils/cloudinary';

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistIds: string[];
  onSelectProduct: (product: Product) => void;
  onRemoveWishlist: (product: Product) => void;
  onAddToCart: (product: Product, color: string, size: string) => void;
  products?: Product[];
}

const FALLBACK_IMAGE = 'https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1786595479/touza_products/reuodzuouk8woxkq38zz.jpg';

export const WishlistModal: React.FC<WishlistModalProps> = ({
  isOpen,
  onClose,
  wishlistIds,
  onSelectProduct,
  onRemoveWishlist,
  onAddToCart,
  products = PRODUCTS,
}) => {
  const { language, formatPrice, t, direction } = useLanguage();

  if (!isOpen) return null;

  const currentProductsList = products && products.length > 0 ? products : PRODUCTS;
  const wishlistedProducts = currentProductsList.filter((p) => wishlistIds.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-fade-in"
      />

      {/* Drawer */}
      <aside
        className={`fixed inset-y-0 ${
          direction === 'rtl' ? 'left-0' : 'right-0'
        } w-full sm:w-[440px] max-w-full flex z-50 shadow-2xl transition-transform duration-300 ease-out`}
      >
        <div className="w-full h-full bg-[#ffffff] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-[#c4c7c7]/30 flex justify-between items-center bg-[#f9f9f9]">
            <h2 className="font-display text-[20px] sm:text-[22px] md:text-[24px] text-[#000000] flex items-center gap-2.5 font-bold">
              <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-[#ba1a1a] fill-[#ba1a1a]" />
              <span>{t('nav.wishlist', 'المفضلة / المحفوظات')}</span>
              <span className="text-[14px] bg-[#ba1a1a] text-white px-2 py-0.5 rounded-full font-sans font-medium">
                {wishlistedProducts.length}
              </span>
            </h2>
            <button
              onClick={onClose}
              className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-[#000000] hover:bg-[#747878]/15 rounded-full transition-colors cursor-pointer"
              aria-label="Close wishlist"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-4 hide-scrollbar">
            {wishlistedProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4">
                <div className="w-20 h-20 bg-[#f3f3f4] rounded-full flex items-center justify-center mb-5 border border-[#c4c7c7]/30">
                  <Heart className="w-10 h-10 text-[#ba1a1a]" />
                </div>
                <p className="font-display text-[20px] sm:text-[22px] text-[#000000] mb-2 font-bold">
                  {language === 'ar' ? 'قائمة المفضلة فارغة حالياً' : 'Your wishlist is empty'}
                </p>
                <p className="font-body text-[13px] sm:text-[14px] text-[#444748] mb-8 leading-relaxed max-w-xs">
                  {language === 'ar'
                    ? 'اضغط على علامة القلب على أي قطعة لإضافتها إلى قائمتك المفضلة وحفظها للرجوع إليها لاحقاً.'
                    : 'Click the heart icon on any piece to save your favorite luxury items for later.'}
                </p>
                <button
                  onClick={onClose}
                  className="bg-[#000000] text-white py-3.5 px-8 font-label-caps rounded-lg hover:bg-[#2f3131] transition-all cursor-pointer shadow-sm text-[13px] sm:text-[14px]"
                >
                  {t('cart.explore', 'تصفح التشكيلة')}
                </button>
              </div>
            ) : (
              wishlistedProducts.map((item) => {
                const name = getLocalizedProductName(item, language);
                const category = getLocalizedProductCategory(item, language);
                const rawImg = (item.images && item.images.length > 0 ? item.images[0] : '') || FALLBACK_IMAGE;
                const itemImage = getOptimizedImageUrl(rawImg, { width: 300 });

                return (
                  <div
                    key={item.id}
                    className="flex gap-3.5 sm:gap-4 p-3 rounded-xl hover:bg-[#f3f3f4] transition-colors border border-[#c4c7c7]/20 items-start bg-white"
                  >
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
                      className="w-20 sm:w-22 h-24 sm:h-26 object-cover bg-[#f3f3f4] rounded-lg shrink-0 cursor-pointer border border-[#747878]/10"
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
                            className="font-display text-[15px] sm:text-[16px] text-[#000000] font-bold cursor-pointer hover:underline truncate"
                          >
                            {name}
                          </h3>
                          <button
                            onClick={() => onRemoveWishlist(item)}
                            className="text-[#747878] hover:text-[#ba1a1a] transition-colors p-1 cursor-pointer shrink-0"
                            title="Remove"
                          >
                            <X className="w-4 h-4" />
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
                        className="w-full bg-[#000000] text-white py-2 rounded-lg font-label-caps text-[12px] hover:bg-[#2f3131] transition-colors cursor-pointer mt-3 shadow-xs flex items-center justify-center gap-1.5"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>{t('detail.addToCart', 'أضف إلى السلة')}</span>
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
