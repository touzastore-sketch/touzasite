import React, { useState, useMemo, useEffect } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  LayoutGrid,
  Tag,
  SlidersHorizontal,
  X,
  FilterX,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Category, Product, StoreSettings } from '../types';
import { ProductCard } from './ProductCard';
import { PRODUCTS } from '../data/products';
import { useLanguage } from '../context/LanguageContext';
import { DEFAULT_CATEGORIES } from '../data/defaultCategories';
import { CategorySection } from './CategorySection';
import { ScrollReveal } from './ScrollReveal';

interface CollectionsViewProps {
  onSelectProduct: (product: Product) => void;
  wishlistIds: string[];
  onToggleWishlist: (product: Product) => void;
  onAddToCart: (product: Product, color: string, size: string) => void;
  onNavigateHome?: () => void;
  initialCategory?: string;
  products?: Product[];
  categories?: Category[];
  storeSettings?: StoreSettings;
}

export const CollectionsView: React.FC<CollectionsViewProps> = ({
  onSelectProduct,
  wishlistIds,
  onToggleWishlist,
  onAddToCart,
  onNavigateHome,
  initialCategory = 'All',
  products: customProducts,
  categories: customCategories = DEFAULT_CATEGORIES,
  storeSettings,
}) => {
  const allProducts = customProducts || PRODUCTS;
  const categoriesList = customCategories || DEFAULT_CATEGORIES;
  const { language, formatPrice, t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'All');

  // Calculate highest price in catalog dynamically
  const maxCatalogPrice = useMemo(() => {
    if (!allProducts || allProducts.length === 0) return 10000;
    const maxP = Math.max(...allProducts.map((p) => p.price));
    return Math.ceil(maxP / 500) * 500 || 10000;
  }, [allProducts]);

  // Default maxPrice set to highest catalog price so no products are hidden initially
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('Featured');
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  // Pagination & URL State
  const getInitialPageFromUrl = () => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const p = parseInt(params.get('page') || '1', 10);
      return isNaN(p) || p < 1 ? 1 : p;
    }
    return 1;
  };

  const [currentPage, setCurrentPage] = useState<number>(getInitialPageFromUrl);
  const [itemsPerPage, setItemsPerPage] = useState<number>(9);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, maxPrice, selectedColor, selectedSize, sortBy]);

  const colors = [
    { name: 'Noir', hex: '#000000' },
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Beige', hex: '#E5DCC4' },
    { name: 'Ivory', hex: '#F9F8F3' },
    { name: 'Silver', hex: '#D8D8D8' },
  ];

  const sizes = ['XS', 'S', 'M', 'L', 'XL', '34', '36', '38', '40'];

  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    // Category filter
    if (selectedCategory !== 'All') {
      if (selectedCategory === 'New Arrivals') {
        result = result.filter((p) => p.isNewArrival);
      } else {
        result = result.filter((p) => {
          if (!p.category && !p.categoryAr) return false;
          const pCatEn = p.category?.toLowerCase()?.trim() || '';
          const pCatAr = p.categoryAr?.trim() || '';
          const sel = selectedCategory.trim();
          const selLower = sel.toLowerCase();

          const targetCat = categoriesList.find(
            (c) =>
              c.nameEn?.toLowerCase() === selLower ||
              c.nameAr?.trim() === sel ||
              c.id === sel
          );

          if (targetCat) {
            const tEn = targetCat.nameEn?.toLowerCase()?.trim() || '';
            const tAr = targetCat.nameAr?.trim() || '';
            return (
              p.category === targetCat.nameEn ||
              p.category === targetCat.nameAr ||
              p.categoryAr === targetCat.nameAr ||
              p.categoryAr === targetCat.nameEn ||
              (tEn && pCatEn === tEn) ||
              (tAr && pCatAr === tAr) ||
              (tEn && pCatEn.includes(tEn)) ||
              (tAr && pCatAr.includes(tAr))
            );
          }

          return (
            p.category === selectedCategory ||
            p.categoryAr === selectedCategory ||
            pCatEn === selLower ||
            pCatAr === sel ||
            pCatEn.includes(selLower) ||
            pCatAr.includes(sel)
          );
        });
      }
    }

    // Price filter
    result = result.filter((p) => p.price <= maxPrice);

    // Color filter
    if (selectedColor) {
      result = result.filter((p) =>
        p.colors.some((c) => c.name.toLowerCase() === selectedColor.toLowerCase())
      );
    }

    // Size filter
    if (selectedSize) {
      result = result.filter((p) =>
        p.sizes.some((s) => s.size === selectedSize)
      );
    }

    // Sort
    if (sortBy === 'Price: Low to High') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'Price: High to Low') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'Newest Arrivals') {
      result.sort((a, b) => (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0));
    }

    return result;
  }, [selectedCategory, maxPrice, selectedColor, selectedSize, sortBy]);

  const totalItems = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  // Sync state with URL parameters so links are copyable and Facebook Ads ready
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      params.set('view', 'shop');
      if (selectedCategory && selectedCategory !== 'All') {
        params.set('category', selectedCategory);
      } else {
        params.delete('category');
      }
      if (currentPage > 1) {
        params.set('page', currentPage.toString());
      } else {
        params.delete('page');
      }
      const newSearch = params.toString() ? `?${params.toString()}` : '?view=shop';
      if (window.location.search !== newSearch) {
        window.history.replaceState({}, '', newSearch);
      }
    }
  }, [selectedCategory, currentPage]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedProducts = filteredProducts.slice(startIndex, endIndex);

  const handleCopyPageLink = () => {
    if (typeof window !== 'undefined') {
      const currentUrl = window.location.href;
      navigator.clipboard.writeText(currentUrl).then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 3000);
      });
    }
  };

  return (
    <div className="pt-24 pb-20 max-w-[1440px] mx-auto w-full px-5 md:px-16">
      {/* Top Navigation & Return to Home Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-[#c5a059]/20 shadow-xs">
        <button
          type="button"
          onClick={() => {
            if (onNavigateHome) {
              onNavigateHome();
            } else if (typeof window !== 'undefined') {
              window.location.href = '/';
            }
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#000000] text-white font-label-caps text-[13px] font-bold hover:bg-[#222222] transition-all cursor-pointer shadow-xs active:scale-[0.98]"
        >
          {language === 'ar' ? (
            <ArrowRight className="w-4.5 h-4.5" />
          ) : (
            <ArrowLeft className="w-4.5 h-4.5" />
          )}
          <span>{language === 'ar' ? 'الرجوع للرئيسية' : 'Back to Home'}</span>
        </button>

        <div className="font-body text-[13px] text-[#747878]">
          {language === 'ar' ? 'تصفح كافة المعروضات والقطع الحصرية' : 'Explore All Exclusive Pieces'}
        </div>
      </div>

      {/* Header Banner */}
      <ScrollReveal>
        <div className="mb-8 text-center max-w-3xl mx-auto">
          <h1 className="font-display text-[32px] md:text-[50px] text-[#000000] mb-3 leading-tight font-bold">
            {language === 'ar'
              ? (storeSettings?.collectionsTitleAr || 'استايلك يبدأ من هنا')
              : (storeSettings?.collectionsTitleEn || "Your Style Starts Here")}
          </h1>
          <p className="font-body text-[15px] md:text-[17px] text-[#444748] leading-relaxed">
            {language === 'ar'
              ? (storeSettings?.collectionsSubtitleAr || 'تشكيلة راقية صُممت بعناية فائقة لتمنحك إطلالة جذابة تناسب جميع المناسبات في مصر.')
              : (storeSettings?.collectionsSubtitleEn || 'A curated selection of luxury pieces tailored with precision and unhurried elegance.')}
          </p>
        </div>
      </ScrollReveal>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters - Desktop */}
        <aside className="w-full lg:w-1/4 xl:w-1/5 shrink-0 hidden lg:block pr-6 border-r border-[#c4c7c7]/20 rtl:border-r-0 rtl:border-l rtl:pl-6 rtl:pr-0">
          <div className="sticky top-[100px] space-y-7">
            {/* Filter: Categories */}
            <div className="border-b border-[#c4c7c7]/30 pb-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display text-[18px] text-[#000000] font-bold">
                  {language === 'ar' ? 'الأقسام والتصنيفات' : 'Categories'}
                </h3>
                {selectedCategory !== 'All' && (
                  <button
                    onClick={() => setSelectedCategory('All')}
                    className="text-[11px] font-label-caps text-[#747878] hover:text-[#000000] underline"
                  >
                    {language === 'ar' ? 'عرض الكل' : 'Clear'}
                  </button>
                )}
              </div>

              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('All')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-body transition-colors cursor-pointer ${
                    selectedCategory === 'All'
                      ? 'bg-[#000000] text-white font-bold shadow-2xs'
                      : 'text-[#444748] hover:bg-[#f3f3f4] hover:text-[#000000]'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4" />
                    <span>{language === 'ar' ? 'جميع المنتجات' : 'All Products'}</span>
                  </span>
                  <span className={`text-[11px] font-mono ${selectedCategory === 'All' ? 'text-white/80' : 'text-[#747878]'}`}>
                    {allProducts.length}
                  </span>
                </button>

                {categoriesList.map((cat) => {
                  const isSelected =
                    selectedCategory === cat.nameEn ||
                    selectedCategory === cat.nameAr;
                  const count = allProducts.filter(
                    (p) =>
                      p.category === cat.nameEn ||
                      p.category === cat.nameAr ||
                      p.categoryAr === cat.nameAr
                  ).length;

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.nameEn)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-body transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#000000] text-white font-bold shadow-2xs'
                          : 'text-[#444748] hover:bg-[#f3f3f4] hover:text-[#000000]'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-[#c5a059]" />
                        <span>{language === 'ar' ? cat.nameAr : cat.nameEn}</span>
                      </span>
                      <span className={`text-[11px] font-mono ${isSelected ? 'text-white/80' : 'text-[#747878]'}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter: Price */}
            <div className="border-b border-[#c4c7c7]/30 pb-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display text-[18px] text-[#000000] font-bold">
                  {language === 'ar' ? 'السعر' : 'Price'}
                </h3>
                {maxPrice < maxCatalogPrice && (
                  <button
                    onClick={() => setMaxPrice(10000)}
                    className="text-[11px] font-label-caps text-[#747878] hover:text-[#000000] underline"
                  >
                    {language === 'ar' ? 'عرض الكل' : 'Show All'}
                  </button>
                )}
              </div>

              {/* Quick Preset Range Pills */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                <button
                  onClick={() => setMaxPrice(10000)}
                  className={`px-3 py-1 text-[11px] font-label-caps rounded-full border transition-all cursor-pointer ${
                    maxPrice >= maxCatalogPrice
                      ? 'bg-[#000000] text-white border-[#000000] font-bold shadow-2xs'
                      : 'bg-white text-[#444748] border-[#c4c7c7] hover:border-[#000000]'
                  }`}
                >
                  {language === 'ar' ? 'كل الأسعار' : 'All Prices'}
                </button>
                <button
                  onClick={() => setMaxPrice(1000)}
                  className={`px-2.5 py-1 text-[11px] font-label-caps rounded-full border transition-all cursor-pointer ${
                    maxPrice === 1000
                      ? 'bg-[#000000] text-white border-[#000000] font-bold shadow-2xs'
                      : 'bg-white text-[#444748] border-[#c4c7c7] hover:border-[#000000]'
                  }`}
                >
                  {language === 'ar' ? 'حتى 1,000 ج.م' : 'Under 1,000'}
                </button>
                <button
                  onClick={() => setMaxPrice(2000)}
                  className={`px-2.5 py-1 text-[11px] font-label-caps rounded-full border transition-all cursor-pointer ${
                    maxPrice === 2000
                      ? 'bg-[#000000] text-white border-[#000000] font-bold shadow-2xs'
                      : 'bg-white text-[#444748] border-[#c4c7c7] hover:border-[#000000]'
                  }`}
                >
                  {language === 'ar' ? 'حتى 2,000 ج.م' : 'Under 2,000'}
                </button>
                <button
                  onClick={() => setMaxPrice(3000)}
                  className={`px-2.5 py-1 text-[11px] font-label-caps rounded-full border transition-all cursor-pointer ${
                    maxPrice === 3000
                      ? 'bg-[#000000] text-white border-[#000000] font-bold shadow-2xs'
                      : 'bg-white text-[#444748] border-[#c4c7c7] hover:border-[#000000]'
                  }`}
                >
                  {language === 'ar' ? 'حتى 3,000 ج.م' : 'Under 3,000'}
                </button>
              </div>

              {/* Range Slider */}
              <div className="space-y-2">
                <input
                  type="range"
                  min="500"
                  max={maxCatalogPrice}
                  step="100"
                  value={Math.min(maxPrice, maxCatalogPrice)}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#000000] h-1.5 bg-[#eeeeee] rounded-full appearance-none cursor-pointer"
                />
                <div className="flex justify-between font-label-caps text-[#444748] text-[12px] dir-ltr">
                  <span>{formatPrice(500)}</span>
                  <span className="font-bold text-[#000000]">
                    {maxPrice >= maxCatalogPrice
                      ? (language === 'ar' ? 'الكل (بلا حد)' : 'All Prices')
                      : `${formatPrice(maxPrice)}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Filter: Color */}
            <div className="border-b border-[#c4c7c7]/30 pb-5">
              <h3 className="font-display text-[18px] text-[#000000] mb-3 font-bold">
                {language === 'ar' ? 'اللون' : 'Color'}
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {colors.map((c) => {
                  const isSelected = selectedColor === c.name;
                  return (
                    <button
                      key={c.name}
                      onClick={() =>
                        setSelectedColor(isSelected ? null : c.name)
                      }
                      title={c.name}
                      className={`w-7 h-7 rounded-full border transition-all cursor-pointer ${
                        isSelected
                          ? 'ring-2 ring-[#000000] ring-offset-2 border-transparent scale-110'
                          : 'border-[#c4c7c7] hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.hex }}
                    />
                  );
                })}
              </div>
              {selectedColor && (
                <button
                  onClick={() => setSelectedColor(null)}
                  className="mt-3 text-[12px] font-label-caps text-[#747878] hover:text-[#000000] underline"
                >
                  {language === 'ar' ? 'إلغاء تصفية اللون' : 'Clear color'}
                </button>
              )}
            </div>

            {/* Filter: Size */}
            <div className="pb-5">
              <h3 className="font-display text-[18px] text-[#000000] mb-3 font-bold">
                {language === 'ar' ? 'المقاس' : 'Size'}
              </h3>
              <div className="flex flex-wrap gap-2">
                {sizes.map((sz) => {
                  const isSelected = selectedSize === sz;
                  return (
                    <button
                      key={sz}
                      onClick={() =>
                        setSelectedSize(isSelected ? null : sz)
                      }
                      className={`w-8 h-8 rounded border font-label-caps text-[12px] transition-colors cursor-pointer ${
                        isSelected
                          ? 'border-[#000000] bg-[#000000] text-white font-bold'
                          : 'border-[#c4c7c7] text-[#444748] hover:border-[#000000]'
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid Area */}
        <div id="product-grid-section" className="w-full lg:w-3/4 xl:w-4/5 flex flex-col scroll-mt-28">
          {/* Classic Category Quick Bar (Horizontal Scrolling Pills) */}
          <div className="mb-6 overflow-x-auto no-scrollbar pb-1">
            <div className="flex items-center gap-2 min-w-max">
              <button
                type="button"
                onClick={() => setSelectedCategory('All')}
                className={`px-4 py-2 rounded-xl text-[13px] font-body transition-all cursor-pointer flex items-center gap-2 border shadow-2xs ${
                  selectedCategory === 'All'
                    ? 'bg-[#000000] text-white border-[#000000] font-bold ring-1 ring-black'
                    : 'bg-white text-[#444748] border-[#c4c7c7]/50 hover:border-[#000000] hover:text-[#000000]'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span>{language === 'ar' ? 'الكل' : 'All'}</span>
                <span className={`text-[10px] font-mono ${selectedCategory === 'All' ? 'text-white/80' : 'text-[#747878]'}`}>
                  ({allProducts.length})
                </span>
              </button>

              {categoriesList.map((cat) => {
                const isSelected =
                  selectedCategory === cat.nameEn ||
                  selectedCategory === cat.nameAr;
                const count = allProducts.filter(
                  (p) =>
                    p.category === cat.nameEn ||
                    p.category === cat.nameAr ||
                    p.categoryAr === cat.nameAr
                ).length;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.nameEn)}
                    className={`px-4 py-2 rounded-xl text-[13px] font-body transition-all cursor-pointer flex items-center gap-2 border shadow-2xs ${
                      isSelected
                        ? 'bg-[#000000] text-white border-[#000000] font-bold ring-1 ring-black'
                        : 'bg-white text-[#444748] border-[#c4c7c7]/50 hover:border-[#000000] hover:text-[#000000]'
                    }`}
                  >
                    <Tag className="w-4 h-4 text-[#c5a059]" />
                    <span>{language === 'ar' ? cat.nameAr : cat.nameEn}</span>
                    {count > 0 && (
                      <span className={`text-[10px] font-mono ${isSelected ? 'text-white/80' : 'text-[#747878]'}`}>
                        ({count})
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Top Control Bar */}
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#c4c7c7]/30">
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden flex items-center gap-2 font-label-caps text-[#000000] border border-[#c4c7c7] px-4 py-2 rounded-full cursor-pointer text-[13px]"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {language === 'ar' ? 'تصفية المنتجات' : 'Filters'}
            </button>
            <div className="hidden lg:block font-body text-[14px] text-[#444748]">
              {language === 'ar'
                ? `عرض ${startIndex + 1} - ${Math.min(endIndex, totalItems)} من أصل ${totalItems} قطعة`
                : `Showing ${startIndex + 1} - ${Math.min(endIndex, totalItems)} of ${totalItems} products`}
            </div>
            <div className="relative flex items-center">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-transparent border border-[#747878]/30 rounded-lg px-3 py-1.5 font-label-caps text-[#000000] text-[13px] pr-8 cursor-pointer focus:ring-0 focus:outline-none"
              >
                <option value="Featured">{language === 'ar' ? 'ترتيب: المميزة' : 'Sort By: Featured'}</option>
                <option value="Price: Low to High">{language === 'ar' ? 'السعر: من الأقل للأعلى' : 'Price: Low to High'}</option>
                <option value="Price: High to Low">{language === 'ar' ? 'السعر: من الأعلى للأقل' : 'Price: High to Low'}</option>
                <option value="Newest Arrivals">{language === 'ar' ? 'الأحدث أولاً' : 'Newest Arrivals'}</option>
              </select>
            </div>
          </div>

          {/* Mobile Filters Modal */}
          {mobileFilterOpen && (
            <div className="lg:hidden mb-6 p-5 bg-[#ffffff] border border-[#c4c7c7]/40 rounded-2xl space-y-5 shadow-md">
              <div className="flex items-center justify-between border-b border-[#c4c7c7]/30 pb-3">
                <h3 className="font-display text-[18px] text-[#000000] font-bold">
                  {language === 'ar' ? 'تصفية المنتجات' : 'Filter Products'}
                </h3>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 text-[#747878] hover:text-[#000000]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Category Filter */}
              <div>
                <h4 className="font-label-caps text-[13px] font-bold text-[#000000] mb-2">
                  {language === 'ar' ? 'الأقسام والتصنيفات' : 'Category'}
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setSelectedCategory('All')}
                    className={`px-3 py-1.5 rounded-xl text-[12px] font-body border cursor-pointer ${
                      selectedCategory === 'All'
                        ? 'bg-[#000000] text-white border-[#000000] font-bold'
                        : 'bg-white text-[#444748] border-[#c4c7c7]'
                    }`}
                  >
                    {language === 'ar' ? 'الكل' : 'All'}
                  </button>
                  {categoriesList.map((cat) => {
                    const isSelected =
                      selectedCategory === cat.nameEn ||
                      selectedCategory === cat.nameAr;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.nameEn)}
                        className={`px-3 py-1.5 rounded-xl text-[12px] font-body border cursor-pointer ${
                          isSelected
                            ? 'bg-[#000000] text-white border-[#000000] font-bold'
                            : 'bg-white text-[#444748] border-[#c4c7c7]'
                        }`}
                      >
                        {language === 'ar' ? cat.nameAr : cat.nameEn}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Price Filter */}
              <div>
                <h4 className="font-label-caps text-[13px] font-bold text-[#000000] mb-2">
                  {language === 'ar' ? 'السعر' : 'Price'}
                </h4>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <button
                    onClick={() => setMaxPrice(10000)}
                    className={`px-3 py-1 text-[11px] font-label-caps rounded-full border transition-all cursor-pointer ${
                      maxPrice >= maxCatalogPrice
                        ? 'bg-[#000000] text-white border-[#000000] font-bold'
                        : 'bg-white text-[#444748] border-[#c4c7c7]'
                    }`}
                  >
                    {language === 'ar' ? 'كل الأسعار' : 'All Prices'}
                  </button>
                  <button
                    onClick={() => setMaxPrice(1000)}
                    className={`px-2.5 py-1 text-[11px] font-label-caps rounded-full border transition-all cursor-pointer ${
                      maxPrice === 1000
                        ? 'bg-[#000000] text-white border-[#000000] font-bold'
                        : 'bg-white text-[#444748] border-[#c4c7c7]'
                    }`}
                  >
                    {language === 'ar' ? 'حتى 1,000 ج.م' : 'Under 1,000'}
                  </button>
                  <button
                    onClick={() => setMaxPrice(2000)}
                    className={`px-2.5 py-1 text-[11px] font-label-caps rounded-full border transition-all cursor-pointer ${
                      maxPrice === 2000
                        ? 'bg-[#000000] text-white border-[#000000] font-bold'
                        : 'bg-white text-[#444748] border-[#c4c7c7]'
                    }`}
                  >
                    {language === 'ar' ? 'حتى 2,000 ج.م' : 'Under 2,000'}
                  </button>
                  <button
                    onClick={() => setMaxPrice(3000)}
                    className={`px-2.5 py-1 text-[11px] font-label-caps rounded-full border transition-all cursor-pointer ${
                      maxPrice === 3000
                        ? 'bg-[#000000] text-white border-[#000000] font-bold'
                        : 'bg-white text-[#444748] border-[#c4c7c7]'
                    }`}
                  >
                    {language === 'ar' ? 'حتى 3,000 ج.م' : 'Under 3,000'}
                  </button>
                </div>
                <input
                  type="range"
                  min="500"
                  max={maxCatalogPrice}
                  step="100"
                  value={Math.min(maxPrice, maxCatalogPrice)}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#000000] h-1.5 bg-[#eeeeee] rounded-full appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[11px] font-label-caps text-[#444748] mt-1 dir-ltr">
                  <span>{formatPrice(500)}</span>
                  <span className="font-bold text-[#000000]">
                    {maxPrice >= maxCatalogPrice
                      ? (language === 'ar' ? 'الكل (بلا حد)' : 'All Prices')
                      : `${formatPrice(maxPrice)}`}
                  </span>
                </div>
              </div>

              {/* Mobile Color Filter */}
              <div>
                <h4 className="font-label-caps text-[13px] font-bold text-[#000000] mb-2">
                  {language === 'ar' ? 'اللون' : 'Color'}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {colors.map((c) => {
                    const isSelected = selectedColor === c.name;
                    return (
                      <button
                        key={c.name}
                        onClick={() => setSelectedColor(isSelected ? null : c.name)}
                        className={`w-7 h-7 rounded-full border transition-all ${
                          isSelected ? 'ring-2 ring-black border-transparent' : 'border-[#c4c7c7]'
                        }`}
                        style={{ backgroundColor: c.hex }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Mobile Size Filter */}
              <div>
                <h4 className="font-label-caps text-[13px] font-bold text-[#000000] mb-2">
                  {language === 'ar' ? 'المقاس' : 'Size'}
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {sizes.map((sz) => {
                    const isSelected = selectedSize === sz;
                    return (
                      <button
                        key={sz}
                        onClick={() => setSelectedSize(isSelected ? null : sz)}
                        className={`w-8 h-8 rounded border text-[12px] font-label-caps ${
                          isSelected ? 'bg-black text-white font-bold' : 'border-[#c4c7c7] text-[#444748]'
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('All');
                    setMaxPrice(10000);
                    setSelectedColor(null);
                    setSelectedSize(null);
                  }}
                  className="w-1/2 py-2.5 border border-[#c4c7c7] text-[#000000] font-label-caps rounded-xl text-[13px] font-bold"
                >
                  {language === 'ar' ? 'إعادة ضبط' : 'Reset All'}
                </button>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-1/2 bg-[#000000] text-white py-2.5 font-label-caps rounded-xl text-[13px] font-bold shadow-xs"
                >
                  {language === 'ar' ? 'تطبيق التصفية' : 'Apply Filters'}
                </button>
              </div>
            </div>
          )}

          {/* Grid Layout */}
          {displayedProducts.length === 0 ? (
            <div className="py-16 text-center bg-[#fafafa] rounded-2xl border border-dashed border-[#c4c7c7]/50 p-8 my-4">
              <FilterX className="w-12 h-12 text-[#c4c7c7] mx-auto mb-3" />
              <p className="font-display text-[20px] text-[#000000] font-bold mb-2">
                {language === 'ar' ? 'لا توجد منتجات تطابق اختياراتك حالياً' : 'No products match your selected filters'}
              </p>
              <p className="font-body text-[14px] text-[#747878] mb-6 max-w-md mx-auto">
                {language === 'ar'
                  ? 'يرجى تغيير نطاق السعر أو إلغاء فلترة المقاسات والألوان للوصول إلى كافة المعروضات.'
                  : 'Try adjusting the price range or clearing color and size filters to view all pieces.'}
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setMaxPrice(10000);
                  setSelectedColor(null);
                  setSelectedSize(null);
                }}
                className="px-6 py-3 bg-[#000000] text-white font-label-caps text-[13px] font-bold rounded-xl shadow-xs hover:bg-[#222222] transition-all cursor-pointer"
              >
                {language === 'ar' ? 'إعادة عرض جميع المنتجات' : 'Reset Filters & Show All'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {displayedProducts.map((p, idx) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  priority={idx < 6}
                  onSelectProduct={onSelectProduct}
                  isWishlisted={wishlistIds.includes(p.id)}
                  onToggleWishlist={(product, e) => {
                    e.stopPropagation();
                    onToggleWishlist(product);
                  }}
                  onQuickAdd={(product, color, size) => {
                    onAddToCart(product, color, size);
                  }}
                  aspectRatio="portrait"
                />
              ))}
            </div>
          )}

          {/* Numbered Pagination Control (Only shown when multiple pages exist) */}
          {totalPages > 1 && (
            <div className="mt-12 pt-6 border-t border-[#c4c7c7]/30 flex justify-center items-center gap-4">
              {/* Numbered Page Buttons */}
              <div className="flex items-center gap-1.5 dir-ltr">
                {/* Previous Page Button */}
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => {
                    setCurrentPage((prev) => Math.max(1, prev - 1));
                    const elem = document.getElementById('product-grid-section');
                    if (elem) elem.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`p-2 rounded-xl border flex items-center justify-center cursor-pointer transition-colors ${
                    currentPage === 1
                      ? 'text-[#c4c7c7] border-[#c4c7c7]/30 cursor-not-allowed bg-[#f9f9f9]'
                      : 'text-[#000000] border-[#c4c7c7] hover:bg-[#000000] hover:text-white'
                  }`}
                  title={language === 'ar' ? 'الصفحة السابقة' : 'Previous Page'}
                >
                  <ChevronLeft className="w-4.5 h-4.5" />
                </button>

                {/* Individual Page Number Buttons */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                  const isActive = pageNum === currentPage;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => {
                        setCurrentPage(pageNum);
                        const elem = document.getElementById('product-grid-section');
                        if (elem) elem.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className={`w-9 h-9 rounded-xl font-label-caps font-bold text-[13px] flex items-center justify-center transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#000000] text-white shadow-xs scale-105'
                          : 'bg-[#f3f3f4] text-[#444748] hover:bg-[#e5e5e7] hover:text-[#000000]'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {/* Next Page Button */}
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => {
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
                    const elem = document.getElementById('product-grid-section');
                    if (elem) elem.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`p-2 rounded-xl border flex items-center justify-center cursor-pointer transition-colors ${
                    currentPage === totalPages
                      ? 'text-[#c4c7c7] border-[#c4c7c7]/30 cursor-not-allowed bg-[#f9f9f9]'
                      : 'text-[#000000] border-[#c4c7c7] hover:bg-[#000000] hover:text-white'
                  }`}
                  title={language === 'ar' ? 'الصفحة التالية' : 'Next Page'}
                >
                  <ChevronRight className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
