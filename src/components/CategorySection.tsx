import React from 'react';
import { Category, Product } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { getOptimizedImageUrl } from '../utils/cloudinary';

interface CategorySectionProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryName: string) => void;
  products?: Product[];
  titleAr?: string;
  titleEn?: string;
  subtitleAr?: string;
  subtitleEn?: string;
}

export const CategorySection: React.FC<CategorySectionProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  products = [],
  titleAr = 'تصنيفات المتجر الحصرية',
  titleEn = 'Boutique Collections',
  subtitleAr = 'تصفح بالقسم',
  subtitleEn = 'COLLECTIONS & SECTIONS',
}) => {
  const { language } = useLanguage();

  const getProductCount = (categoryNameEn: string, categoryNameAr: string) => {
    if (categoryNameEn === 'All') return products.length;
    return products.filter((p) => {
      if (!p.category && !p.categoryAr) return false;
      const pCatEn = p.category?.toLowerCase()?.trim() || '';
      const pCatAr = p.categoryAr?.trim() || '';
      const cEn = categoryNameEn.toLowerCase().trim();
      const cAr = categoryNameAr.trim();
      return (
        pCatEn === cEn ||
        p.category === categoryNameEn ||
        p.category === categoryNameAr ||
        pCatAr === cAr ||
        p.categoryAr === categoryNameEn ||
        (cEn && pCatEn.includes(cEn)) ||
        (cAr && pCatAr.includes(cAr))
      );
    }).length;
  };

  const defaultCategoryImages: Record<string, string> = {
    Shirts: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=600',
    'T-Shirts': 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=600',
    Pants: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=600',
    Polo: 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&q=80&w=600',
    'Hoodies & Sweatshirts': 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=600',
    'Jackets & Coats': 'https://images.unsplash.com/photo-1544022613-e87ce7526edb?auto=format&fit=crop&q=80&w=600',
    Shorts: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&q=80&w=600',
    Accessories: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&q=80&w=600',
  };

  return (
    <section className="py-8 px-4 sm:px-6 md:px-16 max-w-[1440px] mx-auto w-full">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
        <div>
          <span className="font-label-caps text-[#8c734b] mb-1.5 block text-[12px] md:text-[13px] tracking-widest font-semibold">
            {language === 'ar' ? subtitleAr : subtitleEn}
          </span>
          <h2 className="font-display text-[26px] sm:text-[32px] md:text-[38px] text-[#000000] font-bold tracking-tight leading-tight">
            {language === 'ar' ? titleAr : titleEn}
          </h2>
        </div>

        {/* All Products Button */}
        <button
          type="button"
          onClick={() => onSelectCategory('All')}
          className={`px-5 py-2.5 rounded-xl text-[13px] font-label-caps font-semibold transition-all duration-300 cursor-pointer flex items-center gap-2.5 border shadow-2xs group ${
            selectedCategory === 'All'
              ? 'bg-[#000000] text-white border-[#000000] shadow-md ring-2 ring-[#c5a059]'
              : 'bg-white text-[#000000] border-[#000000]/20 hover:border-[#000000] hover:bg-[#000000] hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">grid_view</span>
          <span>{language === 'ar' ? 'جميع التشكيلات' : 'All Collections'}</span>
          <span
            className={`px-2.5 py-0.5 text-[11px] rounded-full font-mono transition-colors ${
              selectedCategory === 'All'
                ? 'bg-[#c5a059] text-black font-bold'
                : 'bg-[#f3f3f4] text-[#747878] group-hover:bg-white/20 group-hover:text-white'
            }`}
          >
            {products.length}
          </span>
        </button>
      </div>

      {/* Category Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5 sm:gap-6 lg:gap-7">
        {categories.map((cat) => {
          const isSelected =
            selectedCategory === cat.nameEn || selectedCategory === cat.nameAr;
          const count = getProductCount(cat.nameEn, cat.nameAr);
          const rawBg = cat.imageUrl || defaultCategoryImages[cat.nameEn] || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=600';
          const bgImage = getOptimizedImageUrl(rawBg, { width: 600 });

          return (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.nameEn)}
              className={`group relative h-[210px] sm:h-[230px] md:h-[250px] rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 flex flex-col justify-between p-4 shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_14px_36px_rgba(0,0,0,0.18)] transform hover:-translate-y-1.5 border ${
                isSelected
                  ? 'ring-2 ring-[#c5a059] border-[#c5a059] shadow-lg'
                  : 'border-[#c5a059]/25 hover:border-[#c5a059]'
              }`}
            >
              {/* Full Background Image with Zoom on Hover */}
              <div className="absolute inset-0 z-0 overflow-hidden">
                <img
                  src={bgImage}
                  alt={cat.nameAr}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = '/images/touza_green_shirt.jpg';
                  }}
                  className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110"
                />
                {/* Elegant Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/20 group-hover:from-black/95 group-hover:via-black/55 group-hover:to-black/35 transition-all duration-500" />
              </div>

              {/* Glassmorphism Icon & Gold Count Badge */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="w-9 h-9 rounded-full bg-black/35 backdrop-blur-md border border-white/25 text-white/90 flex items-center justify-center group-hover:border-[#c5a059] group-hover:text-[#c5a059] transition-all duration-300 shadow-sm">
                  <span className="material-symbols-outlined text-[19px]">
                    {cat.icon || 'styler'}
                  </span>
                </div>

                <span className="text-[11px] font-mono tracking-wider px-2.5 py-1 rounded-full bg-black/45 backdrop-blur-md text-[#dfc38c] border border-[#c5a059]/35 shadow-xs">
                  {count} {language === 'ar' ? 'قطعة' : 'pcs'}
                </span>
              </div>

              {/* Category Name & Subtitle */}
              <div className="relative z-10 pt-4">
                <h3 className="font-display text-[17px] sm:text-[19px] font-bold text-white group-hover:text-[#f4e8d1] transition-colors duration-300 leading-tight mb-1 drop-shadow-sm">
                  {language === 'ar' ? cat.nameAr : cat.nameEn}
                </h3>
                {(cat.descriptionAr || cat.descriptionEn) && (
                  <p className="font-body text-[12px] text-white/80 group-hover:text-white transition-colors duration-300 line-clamp-1">
                    {language === 'ar' ? cat.descriptionAr : cat.descriptionEn}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

