import React, { useState, useMemo, useEffect } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  SlidersHorizontal,
  X,
  FilterX,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Category, Product, StoreSettings } from '../types';
import { ProductCard } from './ProductCard';
import { useLanguage } from '../context/LanguageContext';
import { DEFAULT_CATEGORIES } from '../data/defaultCategories';
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
  const allProducts = Array.isArray(customProducts) ? customProducts : [];
  const categoriesList = customCategories || DEFAULT_CATEGORIES;
  const { language, formatPrice } = useLanguage();
  const isAr = language === 'ar';
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'All');

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  const matchesCategory = (p: Product, catName: string) => {
    if (!catName || catName === 'All') return true;
    if (catName === 'New Arrivals') return !!p.isNewArrival;

    const sel = catName.trim();
    const selLower = sel.toLowerCase();

    const targetCat = categoriesList.find(
      (c) =>
        c.id === sel ||
        c.nameEn?.toLowerCase()?.trim() === selLower ||
        c.nameAr?.trim() === sel
    );

    const pCatEn = (p.category || '').trim();
    const pCatEnLower = pCatEn.toLowerCase();
    const pCatAr = (p.categoryAr || '').trim();

    if (targetCat) {
      const tEn = (targetCat.nameEn || '').trim();
      const tEnLower = tEn.toLowerCase();
      const tAr = (targetCat.nameAr || '').trim();

      return (
        (tEnLower && pCatEnLower === tEnLower) ||
        (tAr && pCatAr === tAr) ||
        p.category === targetCat.nameEn ||
        p.category === targetCat.nameAr ||
        p.categoryAr === targetCat.nameAr ||
        p.categoryAr === targetCat.nameEn
      );
    }

    return (
      pCatEnLower === selLower ||
      pCatAr === sel ||
      p.category === catName ||
      p.categoryAr === catName
    );
  };

  const maxCatalogPrice = useMemo(() => {
    if (!allProducts || allProducts.length === 0) return 10000;
    const maxP = Math.max(...allProducts.map((p) => p.price));
    return Math.ceil(maxP / 500) * 500 || 10000;
  }, [allProducts]);

  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('Featured');
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  const getInitialPageFromUrl = () => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const p = parseInt(params.get('page') || '1', 10);
      return isNaN(p) || p < 1 ? 1 : p;
    }
    return 1;
  };

  const [currentPage, setCurrentPage] = useState<number>(getInitialPageFromUrl);
  const itemsPerPage = 12;

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, maxPrice, selectedColor, selectedSize, sortBy]);

  const colors = [
    { name: 'Noir', hex: '#111111' },
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Beige', hex: '#E5DCC4' },
    { name: 'Ivory', hex: '#F4F3F0' },
    { name: 'Silver', hex: '#B8B6B0' },
  ];

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '34', '36', '38', '40'];

  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    if (selectedCategory && selectedCategory !== 'All') {
      result = result.filter((p) => matchesCategory(p, selectedCategory));
    }

    result = result.filter((p) => p.price <= maxPrice);

    if (selectedColor) {
      result = result.filter((p) =>
        p.colors.some((c) => c.name.toLowerCase() === selectedColor.toLowerCase())
      );
    }

    if (selectedSize) {
      result = result.filter((p) =>
        p.sizes.some((s) => s.size === selectedSize)
      );
    }

    if (sortBy === 'Price: Low to High') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'Price: High to Low') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'Newest Arrivals') {
      result.sort((a, b) => (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0));
    }

    return result;
  }, [allProducts, categoriesList, selectedCategory, maxPrice, selectedColor, selectedSize, sortBy]);

  const totalItems = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

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

  const resetAllFilters = () => {
    setSelectedCategory('All');
    setMaxPrice(10000);
    setSelectedColor(null);
    setSelectedSize(null);
  };

  return (
    <div className="pt-[116px] md:pt-[132px] pb-24 max-w-[1440px] mx-auto w-full px-5 sm:px-8 md:px-14 bg-[#ffffff]">
      {/* Quiet Top Breadcrumb Bar */}
      <div className="flex items-center justify-between gap-4 pb-6 mb-10 border-b border-[#e6e4df]">
        <button
          type="button"
          onClick={() => {
            if (onNavigateHome) {
              onNavigateHome();
            } else if (typeof window !== 'undefined') {
              window.location.href = '/';
            }
          }}
          className="inline-flex items-center gap-2 text-[#111111] hover:text-[#6e6c68] font-label-caps text-[12px] transition-colors cursor-pointer"
        >
          {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          <span>{isAr ? 'الرجوع للرئيسية' : 'BACK TO HOME'}</span>
        </button>

        <span className="font-body text-[12px] text-[#6e6c68] tabular-nums">
          {isAr ? `${totalItems} قطعة` : `${totalItems} PIECES`}
        </span>
      </div>

      {/* Editorial Collection Header */}
      <ScrollReveal>
        <div className="mb-12 max-w-2xl space-y-3">
          <span className="font-label-caps text-[11px] text-[#6e6c68] uppercase block">
            {isAr ? 'تشكيلة توزا' : 'TOUZA COLLECTION'}
          </span>
          <h1 className="font-display text-[30px] sm:text-[40px] md:text-[48px] text-[#111111] leading-[1.12] font-semibold tracking-tight text-balance">
            {isAr
              ? (storeSettings?.collectionsTitleAr || 'استايلك يبدأ من هنا')
              : (storeSettings?.collectionsTitleEn || 'Everyday Essentials')}
          </h1>
          <p className="font-body text-[15px] text-[#6e6c68] leading-[1.75]">
            {isAr
              ? (storeSettings?.collectionsSubtitleAr || 'تشكيلة راقية صُممت بعناية فائقة لتمنحك إطلالة جذابة تناسب جميع المناسبات في مصر.')
              : (storeSettings?.collectionsSubtitleEn || 'A curated selection of refined casual pieces tailored with precision and lasting comfort.')}
          </p>
        </div>
      </ScrollReveal>

      <div className="flex flex-col lg:flex-row gap-10 lg:gap-12">
        {/* Desktop Sidebar Filters */}
        <aside className="w-full lg:w-[240px] shrink-0 hidden lg:block ltr:pr-8 ltr:border-r rtl:pl-8 rtl:border-l border-[#e6e4df]">
          <div className="sticky top-[104px] space-y-8">
            {/* Categories */}
            <div className="border-b border-[#e6e4df] pb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-label-caps text-[11px] font-semibold text-[#111111] uppercase">
                  {isAr ? 'الأقسام' : 'CATEGORIES'}
                </h3>
                {selectedCategory !== 'All' && (
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('All')}
                    className="text-[11px] font-body text-[#6e6c68] hover:text-[#111111] underline cursor-pointer"
                  >
                    {isAr ? 'إلغاء' : 'Reset'}
                  </button>
                )}
              </div>

              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('All')}
                  className={`w-full flex items-center justify-between py-1.5 text-[14px] font-body transition-colors cursor-pointer ${
                    selectedCategory === 'All'
                      ? 'text-[#111111] font-semibold'
                      : 'text-[#6e6c68] hover:text-[#111111]'
                  }`}
                >
                  <span>{isAr ? 'جميع المنتجات' : 'All Products'}</span>
                  <span className="text-[12px] tabular-nums text-[#6e6c68]">{allProducts.length}</span>
                </button>

                {categoriesList.map((cat) => {
                  const isSelected =
                    selectedCategory === cat.nameEn ||
                    selectedCategory === cat.nameAr;
                  const count = allProducts.filter((p) => matchesCategory(p, cat.nameEn)).length;

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.nameEn)}
                      className={`w-full flex items-center justify-between py-1.5 text-[14px] font-body transition-colors cursor-pointer ${
                        isSelected
                          ? 'text-[#111111] font-semibold'
                          : 'text-[#6e6c68] hover:text-[#111111]'
                      }`}
                    >
                      <span>{isAr ? cat.nameAr : cat.nameEn}</span>
                      <span className="text-[12px] tabular-nums text-[#6e6c68]">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price */}
            <div className="border-b border-[#e6e4df] pb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-label-caps text-[11px] font-semibold text-[#111111] uppercase">
                  {isAr ? 'السعر' : 'PRICE'}
                </h3>
                {maxPrice < maxCatalogPrice && (
                  <button
                    type="button"
                    onClick={() => setMaxPrice(10000)}
                    className="text-[11px] font-body text-[#6e6c68] hover:text-[#111111] underline cursor-pointer"
                  >
                    {isAr ? 'الكل' : 'All'}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-1.5 mb-4">
                {[
                  { label: isAr ? 'الكل' : 'All', value: 10000, active: maxPrice >= maxCatalogPrice },
                  { label: isAr ? 'حتى 1,000' : '≤ 1,000', value: 1000, active: maxPrice === 1000 },
                  { label: isAr ? 'حتى 2,000' : '≤ 2,000', value: 2000, active: maxPrice === 2000 },
                  { label: isAr ? 'حتى 3,000' : '≤ 3,000', value: 3000, active: maxPrice === 3000 },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setMaxPrice(opt.value)}
                    className={`py-2 px-2 text-[12px] font-body border transition-colors cursor-pointer rounded-none tabular-nums ${
                      opt.active
                        ? 'bg-[#111111] text-white border-[#111111] font-medium'
                        : 'bg-[#ffffff] text-[#444444] border-[#e6e4df] hover:border-[#111111]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <input
                  type="range"
                  min="500"
                  max={maxCatalogPrice}
                  step="100"
                  value={Math.min(maxPrice, maxCatalogPrice)}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#111111] h-[2px] bg-[#e6e4df] appearance-none cursor-pointer"
                />
                <div className="flex justify-between font-body text-[#6e6c68] text-[12px] dir-ltr tabular-nums">
                  <span>{formatPrice(500)}</span>
                  <span className="font-medium text-[#111111]">
                    {maxPrice >= maxCatalogPrice
                      ? (isAr ? 'الكل' : 'All')
                      : formatPrice(maxPrice)}
                  </span>
                </div>
              </div>
            </div>

            {/* Color */}
            <div className="border-b border-[#e6e4df] pb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-label-caps text-[11px] font-semibold text-[#111111] uppercase">
                  {isAr ? 'اللون' : 'COLOR'}
                </h3>
                {selectedColor && (
                  <button
                    type="button"
                    onClick={() => setSelectedColor(null)}
                    className="text-[11px] font-body text-[#6e6c68] hover:text-[#111111] underline cursor-pointer"
                  >
                    {isAr ? 'إلغاء' : 'Clear'}
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2.5">
                {colors.map((c) => {
                  const isSelected = selectedColor === c.name;
                  return (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setSelectedColor(isSelected ? null : c.name)}
                      title={c.name}
                      className={`w-6 h-6 rounded-full border transition-transform cursor-pointer ${
                        isSelected
                          ? 'ring-1 ring-[#111111] ring-offset-2 border-black/30 scale-105'
                          : 'border-black/20 hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.hex }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Size */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-label-caps text-[11px] font-semibold text-[#111111] uppercase">
                  {isAr ? 'المقاس' : 'SIZE'}
                </h3>
                {selectedSize && (
                  <button
                    type="button"
                    onClick={() => setSelectedSize(null)}
                    className="text-[11px] font-body text-[#6e6c68] hover:text-[#111111] underline cursor-pointer"
                  >
                    {isAr ? 'إلغاء' : 'Clear'}
                  </button>
                )}
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {sizes.map((sz) => {
                  const isSelected = selectedSize === sz;
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSelectedSize(isSelected ? null : sz)}
                      className={`h-9 border font-label-caps text-[11px] transition-colors cursor-pointer rounded-none ${
                        isSelected
                          ? 'border-[#111111] bg-[#111111] text-white font-semibold'
                          : 'border-[#e6e4df] text-[#444444] hover:border-[#111111]'
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
        <div id="product-grid-section" className="flex-1 flex flex-col scroll-mt-28 min-w-0">
          {/* Horizontal Category Tabs (Clean Architectural Underline Strip) */}
          <div className="mb-6 overflow-x-auto no-scrollbar border-b border-[#e6e4df]">
            <div className="flex items-center gap-6 min-w-max">
              <button
                type="button"
                onClick={() => setSelectedCategory('All')}
                className={`pb-3 text-[13px] font-body transition-colors cursor-pointer border-b-2 -mb-[1px] ${
                  selectedCategory === 'All'
                    ? 'border-[#111111] text-[#111111] font-semibold'
                    : 'border-transparent text-[#6e6c68] hover:text-[#111111]'
                }`}
              >
                {isAr ? `الكل (${allProducts.length})` : `All (${allProducts.length})`}
              </button>

              {categoriesList.map((cat) => {
                const isSelected =
                  selectedCategory === cat.nameEn ||
                  selectedCategory === cat.nameAr;
                const count = allProducts.filter((p) => matchesCategory(p, cat.nameEn)).length;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.nameEn)}
                    className={`pb-3 text-[13px] font-body transition-colors cursor-pointer border-b-2 -mb-[1px] ${
                      isSelected
                        ? 'border-[#111111] text-[#111111] font-semibold'
                        : 'border-transparent text-[#6e6c68] hover:text-[#111111]'
                    }`}
                  >
                    {isAr ? cat.nameAr : cat.nameEn}
                    {count > 0 && <span className="ms-1 text-[11px] tabular-nums opacity-70">({count})</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sort & Mobile Filter Row */}
          <div className="flex justify-between items-center mb-8 gap-4">
            <button
              type="button"
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden flex items-center gap-2 font-label-caps text-[#111111] border border-[#e6e4df] px-4 py-2.5 rounded-none cursor-pointer text-[12px] hover:border-[#111111]"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{isAr ? 'تصفية' : 'FILTER'}</span>
            </button>

            <div className="hidden lg:block font-body text-[13px] text-[#6e6c68] tabular-nums">
              {totalItems > 0
                ? isAr
                  ? `عرض ${startIndex + 1}–${Math.min(endIndex, totalItems)} من ${totalItems} قطعة`
                  : `Showing ${startIndex + 1}–${Math.min(endIndex, totalItems)} of ${totalItems} pieces`
                : isAr
                ? '٠ قطعة'
                : '0 pieces'}
            </div>

            <div className="relative flex items-center">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border border-[#e6e4df] rounded-none px-3.5 py-2 font-body text-[#111111] text-[13px] cursor-pointer focus:border-[#111111] focus:outline-none"
              >
                <option value="Featured">{isAr ? 'الترتيب: المميزة' : 'Sort: Featured'}</option>
                <option value="Price: Low to High">{isAr ? 'السعر: من الأقل للأعلى' : 'Price: Low to High'}</option>
                <option value="Price: High to Low">{isAr ? 'السعر: من الأعلى للأقل' : 'Price: High to Low'}</option>
                <option value="Newest Arrivals">{isAr ? 'الأحدث أولاً' : 'Newest Arrivals'}</option>
              </select>
            </div>
          </div>

          {/* Mobile Filter Panel */}
          {mobileFilterOpen && (
            <div className="lg:hidden mb-8 p-6 bg-[#faf9f7] border border-[#e6e4df] space-y-6">
              <div className="flex items-center justify-between border-b border-[#e6e4df] pb-3">
                <h3 className="font-label-caps text-[12px] font-semibold text-[#111111] uppercase">
                  {isAr ? 'تصفية المنتجات' : 'FILTERS'}
                </h3>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 text-[#6e6c68] hover:text-[#111111]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Price */}
              <div>
                <h4 className="font-label-caps text-[11px] font-semibold text-[#111111] uppercase mb-3">
                  {isAr ? 'السعر' : 'PRICE'}
                </h4>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {[
                    { label: isAr ? 'كل الأسعار' : 'All Prices', value: 10000, active: maxPrice >= maxCatalogPrice },
                    { label: isAr ? 'حتى 1,000' : '≤ 1,000', value: 1000, active: maxPrice === 1000 },
                    { label: isAr ? 'حتى 2,000' : '≤ 2,000', value: 2000, active: maxPrice === 2000 },
                    { label: isAr ? 'حتى 3,000' : '≤ 3,000', value: 3000, active: maxPrice === 3000 },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setMaxPrice(opt.value)}
                      className={`py-2 text-[12px] font-body border cursor-pointer ${
                        opt.active
                          ? 'bg-[#111111] text-white border-[#111111]'
                          : 'bg-white text-[#444444] border-[#e6e4df]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Color */}
              <div>
                <h4 className="font-label-caps text-[11px] font-semibold text-[#111111] uppercase mb-3">
                  {isAr ? 'اللون' : 'COLOR'}
                </h4>
                <div className="flex flex-wrap gap-2.5">
                  {colors.map((c) => {
                    const isSelected = selectedColor === c.name;
                    return (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setSelectedColor(isSelected ? null : c.name)}
                        className={`w-7 h-7 rounded-full border ${
                          isSelected ? 'ring-1 ring-[#111111] ring-offset-2 border-black/30' : 'border-black/20'
                        }`}
                        style={{ backgroundColor: c.hex }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Mobile Size */}
              <div>
                <h4 className="font-label-caps text-[11px] font-semibold text-[#111111] uppercase mb-3">
                  {isAr ? 'المقاس' : 'SIZE'}
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {sizes.map((sz) => {
                    const isSelected = selectedSize === sz;
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setSelectedSize(isSelected ? null : sz)}
                        className={`w-9 h-9 border text-[11px] font-label-caps ${
                          isSelected
                            ? 'bg-[#111111] text-white border-[#111111]'
                            : 'bg-white border-[#e6e4df] text-[#444444]'
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
                  onClick={resetAllFilters}
                  className="w-1/2 py-3 border border-[#111111] text-[#111111] font-label-caps text-[12px]"
                >
                  {isAr ? 'إعادة ضبط' : 'RESET'}
                </button>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-1/2 bg-[#111111] text-white py-3 font-label-caps text-[12px]"
                >
                  {isAr ? 'تطبيق' : 'APPLY'}
                </button>
              </div>
            </div>
          )}

          {/* Product Grid */}
          {displayedProducts.length === 0 ? (
            <div className="py-20 text-center bg-[#faf9f7] border border-[#e6e4df] p-8 my-2">
              <FilterX className="w-9 h-9 text-[#9c9992] mx-auto mb-4 stroke-[1.5]" />
              <p className="font-display text-[20px] text-[#111111] font-semibold mb-2">
                {isAr ? 'لا توجد منتجات تطابق اختياراتك' : 'No matching pieces found'}
              </p>
              <p className="font-body text-[14px] text-[#6e6c68] mb-6 max-w-md mx-auto">
                {isAr
                  ? 'جرّب تعديل نطاق السعر أو إلغاء تصفية المقاسات والألوان لعرض كافة المعروضات.'
                  : 'Try adjusting your price range or clearing filters to view the full collection.'}
              </p>
              <button
                type="button"
                onClick={resetAllFilters}
                className="px-7 py-3 bg-[#111111] text-white font-label-caps text-[12px] hover:bg-[#2b2b2b] transition-colors cursor-pointer"
              >
                {isAr ? 'عرض جميع المنتجات' : 'SHOW ALL PIECES'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-12">
              {displayedProducts.map((p, idx) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  priority={idx < 3}
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-14 pt-8 border-t border-[#e6e4df] flex justify-center items-center">
              <div className="flex items-center gap-1.5 dir-ltr">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => {
                    setCurrentPage((prev) => Math.max(1, prev - 1));
                    document.getElementById('product-grid-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`w-10 h-10 border flex items-center justify-center transition-colors ${
                    currentPage === 1
                      ? 'text-[#c9c6bf] border-[#e6e4df] cursor-not-allowed'
                      : 'text-[#111111] border-[#e6e4df] hover:border-[#111111] hover:bg-[#111111] hover:text-white cursor-pointer'
                  }`}
                  title={isAr ? 'الصفحة السابقة' : 'Previous Page'}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                  const isActive = pageNum === currentPage;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => {
                        setCurrentPage(pageNum);
                        document.getElementById('product-grid-section')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className={`w-10 h-10 border font-body text-[13px] tabular-nums flex items-center justify-center transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-[#111111] text-white border-[#111111] font-semibold'
                          : 'bg-[#ffffff] text-[#444444] border-[#e6e4df] hover:border-[#111111] hover:text-[#111111]'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => {
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
                    document.getElementById('product-grid-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`w-10 h-10 border flex items-center justify-center transition-colors ${
                    currentPage === totalPages
                      ? 'text-[#c9c6bf] border-[#e6e4df] cursor-not-allowed'
                      : 'text-[#111111] border-[#e6e4df] hover:border-[#111111] hover:bg-[#111111] hover:text-white cursor-pointer'
                  }`}
                  title={isAr ? 'الصفحة التالية' : 'Next Page'}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
