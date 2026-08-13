import React, { useState } from 'react';
import { Product } from '../types';
import { PRODUCTS } from '../data/products';
import { useLanguage } from '../context/LanguageContext';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  products?: Product[];
}

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
    <div className="fixed inset-0 z-50 overflow-hidden flex flex-col bg-[#ffffff]/98 backdrop-blur-md fade-in-up">
      {/* Top Search Bar */}
      <div className="max-w-[1280px] w-full mx-auto px-6 py-8 flex items-center justify-between border-b border-[#c4c7c7]/30">
        <div className="flex-1 flex items-center gap-4 mr-6 ltr:mr-6 rtl:ml-6 rtl:mr-0">
          <span className="material-symbols-outlined text-[28px] text-[#747878]">search</span>
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
            className="w-full bg-transparent border-none text-[20px] md:text-[28px] font-display text-[#000000] focus:outline-none placeholder-[#747878]"
          />
        </div>
        <button
          onClick={onClose}
          className="p-2 text-[#000000] hover:opacity-70 transition-opacity cursor-pointer shrink-0"
          title={language === 'ar' ? 'إغلاق البحث' : 'Close Search'}
        >
          <span className="material-symbols-outlined text-[28px]">close</span>
        </button>
      </div>

      {/* Results or Empty State */}
      <div className="max-w-[1280px] w-full mx-auto px-6 py-12 overflow-y-auto flex-1">
        {query.trim() === '' ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-[48px] text-[#c4c7c7] mb-3 block">search</span>
            <p className="font-display text-[20px] text-[#747878]">
              {language === 'ar'
                ? 'اكتب اسم المنتج أو التصنيف للبحث...'
                : 'Type product or category name to search...'}
            </p>
          </div>
        ) : searchResults.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-[48px] text-[#c4c7c7] mb-3 block">search_off</span>
            <p className="font-display text-[22px] text-[#747878]">
              {language === 'ar'
                ? `لم نجد أي نتائج مطابقة لـ "${query}"`
                : `No results found for "${query}"`}
            </p>
          </div>
        ) : (
          <div>
            <p className="font-label-caps text-[#747878] mb-6">
              {language === 'ar'
                ? `تم العثور على ${searchResults.length} قطعة`
                : `Found ${searchResults.length} items`}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {searchResults.map((p) => {
                const displayName = (language === 'ar' && p.nameAr) ? p.nameAr : p.name;
                const displayCategory = (language === 'ar' && p.categoryAr) ? p.categoryAr : p.category;

                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      onClose();
                      onSelectProduct(p);
                    }}
                    className="group cursor-pointer flex gap-4 items-center p-3 rounded-2xl hover:bg-[#f3f3f4] transition-colors border border-transparent hover:border-[#c4c7c7]/30"
                  >
                    <img
                      src={p.images[0] || '/images/touza_green_shirt.jpg'}
                      alt={displayName}
                      onError={(e) => {
                        e.currentTarget.src = '/images/touza_green_shirt.jpg';
                      }}
                      className="w-16 h-20 object-cover bg-[#f3f3f4] rounded-xl shrink-0"
                    />
                    <div className="overflow-hidden">
                      <h4 className="font-display text-[16px] md:text-[18px] text-[#000000] group-hover:underline truncate">
                        {displayName}
                      </h4>
                      <p className="font-body text-[12px] text-[#747878] mt-0.5">{displayCategory}</p>
                      <p className="font-body text-[14px] text-[#000000] font-bold mt-1">
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
