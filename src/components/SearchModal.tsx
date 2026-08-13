import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Product } from '../types';
import { PRODUCTS } from '../data/products';
import { useLanguage } from '../context/LanguageContext';
import { getOptimizedImageUrl } from '../utils/cloudinary';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  products?: Product[];
}

const FALLBACK_IMAGE = 'https://res.cloudinary.com/qazdrpcx/image/upload/v1786595479/touza_products/reuodzuouk8woxkq38zz.jpg';

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
  products: customProducts,
}) => {
  const { language, formatPrice } = useLanguage();
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const allProducts = customProducts || PRODUCTS;

  const searchResults = query.trim()
    ? allProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          (p.nameAr && p.nameAr.toLowerCase().includes(query.toLowerCase())) ||
          p.category.toLowerCase().includes(query.toLowerCase()) ||
          (p.categoryAr && p.categoryAr.toLowerCase().includes(query.toLowerCase())) ||
          p.description.toLowerCase().includes(query.toLowerCase()) ||
          (p.descriptionAr && p.descriptionAr.toLowerCase().includes(query.toLowerCase()))
      )
    : [];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex flex-col bg-[#ffffff]/98 backdrop-blur-md animate-fade-in">
      {/* Top Search Bar */}
      <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex items-center justify-between border-b border-[#c4c7c7]/30">
        <div className="flex-1 flex items-center gap-3 sm:gap-4 ltr:mr-4 rtl:ml-4">
          <Search className="w-6 h-6 sm:w-7 sm:h-7 text-[#747878] shrink-0" />
          <input
            type="text"
            placeholder={
              language === 'ar'
                ? 'ابحث عن منتج...'
                : 'Search for products...'
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent border-none text-[18px] sm:text-[22px] md:text-[28px] font-display text-[#000000] focus:outline-none placeholder-[#747878]"
          />
        </div>
        <button
          onClick={onClose}
          className="p-2 text-[#000000] hover:opacity-70 transition-opacity cursor-pointer shrink-0 rounded-full hover:bg-black/5"
          title={language === 'ar' ? 'إغلاق البحث' : 'Close Search'}
        >
          <X className="w-6 h-6 sm:w-7 sm:h-7" />
        </button>
      </div>

      {/* Results or Empty State */}
      <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 overflow-y-auto flex-1 hide-scrollbar">
        {query.trim() === '' ? (
          <div className="text-center py-16">
            <Search className="w-12 h-12 text-[#c4c7c7] mx-auto mb-3" />
            <p className="font-display text-[18px] sm:text-[20px] text-[#747878]">
              {language === 'ar'
                ? 'اكتب اسم المنتج أو التصنيف للبحث...'
                : 'Type product or category name to search...'}
            </p>
          </div>
        ) : searchResults.length === 0 ? (
          <div className="text-center py-16">
            <Search className="w-12 h-12 text-[#c4c7c7] mx-auto mb-3" />
            <p className="font-display text-[20px] sm:text-[22px] text-[#747878]">
              {language === 'ar'
                ? `لم نجد أي نتائج مطابقة لـ "${query}"`
                : `No results found for "${query}"`}
            </p>
          </div>
        ) : (
          <div>
            <p className="font-label-caps text-[#747878] mb-6 text-[12px] sm:text-[13px]">
              {language === 'ar'
                ? `تم العثور على ${searchResults.length} قطعة`
                : `Found ${searchResults.length} items`}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {searchResults.map((p) => {
                const displayName = (language === 'ar' && p.nameAr) ? p.nameAr : p.name;
                const displayCategory = (language === 'ar' && p.categoryAr) ? p.categoryAr : p.category;
                const rawImg = (p.images && p.images.length > 0 ? p.images[0] : '') || FALLBACK_IMAGE;
                const itemImage = getOptimizedImageUrl(rawImg, { width: 300 });

                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      onClose();
                      onSelectProduct(p);
                    }}
                    className="group cursor-pointer flex gap-4 items-center p-3 rounded-2xl hover:bg-[#f3f3f4] transition-colors border border-transparent hover:border-[#c4c7c7]/30 bg-white sm:bg-transparent"
                  >
                    <img
                      src={itemImage}
                      alt={displayName}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        if (!e.currentTarget.dataset.failed) {
                          e.currentTarget.dataset.failed = 'true';
                          e.currentTarget.src = FALLBACK_IMAGE;
                        }
                      }}
                      className="w-16 h-20 object-cover bg-[#f3f3f4] rounded-xl shrink-0 border border-black/5"
                    />
                    <div className="overflow-hidden min-w-0">
                      <h4 className="font-display text-[15px] sm:text-[17px] text-[#000000] group-hover:underline truncate font-bold">
                        {displayName}
                      </h4>
                      <p className="font-body text-[12px] text-[#747878] mt-0.5">{displayCategory}</p>
                      <p className="font-body text-[14px] text-[#000000] font-extrabold mt-1">
                        {formatPrice(p.price)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
