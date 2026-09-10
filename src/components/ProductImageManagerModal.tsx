import React, { useState, useRef, useId } from 'react';
import { Product } from '../types';
import { uploadToCloudinary, ensureAutoOptimizedCloudinaryUrl, CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '../utils/cloudinary';
import { 
  Upload, 
  Image as ImageIcon, 
  CheckCircle, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  RefreshCw, 
  X, 
  ExternalLink,
  Check
} from 'lucide-react';

interface ProductImageManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  initialProductId?: string;
  onUpdateProduct: (product: Product) => Promise<void> | void;
  language?: 'ar' | 'en';
}

export const ProductImageManagerModal: React.FC<ProductImageManagerModalProps> = ({
  isOpen,
  onClose,
  products,
  initialProductId,
  onUpdateProduct,
  language = 'ar',
}) => {
  const fileInputId = useId();
  const [selectedProductId, setSelectedProductId] = useState<string>(() => {
    if (initialProductId && products.some((p) => p.id === initialProductId)) {
      return initialProductId;
    }
    // Default to first product with old cloud or first product
    const oldCloudProduct = products.find((p) => 
      p.images?.some((img) => img.includes('qazdrpcx')) || 
      p.colors?.some((c) => c.imageUrl?.includes('qazdrpcx'))
    );
    return oldCloudProduct?.id || products[0]?.id || '';
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'needs_update' | 'updated'>('all');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);
  const [uploadErrorMessage, setUploadErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [updatingColorIndex, setUpdatingColorIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const colorFileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const currentProduct = products.find((p) => p.id === selectedProductId) || products[0];

  const isOldCloud = (url?: string) => Boolean(url && url.includes('qazdrpcx'));
  const isNewCloud = (url?: string) => Boolean(url && url.includes(CLOUDINARY_CLOUD_NAME));

  const productNeedsUpdate = (p: Product) => {
    return p.images?.some((img) => isOldCloud(img)) || 
           !p.images?.some((img) => isNewCloud(img));
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      (p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.nameAr && p.nameAr.includes(searchTerm)) ||
      (p.id && p.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterMode === 'needs_update') {
      return productNeedsUpdate(p);
    }
    if (filterMode === 'updated') {
      return !productNeedsUpdate(p);
    }
    return true;
  });

  const currentIndex = products.findIndex((p) => p.id === currentProduct?.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < products.length - 1 && currentIndex >= 0;

  const handleGoToPrev = () => {
    if (hasPrev) {
      setSelectedProductId(products[currentIndex - 1].id);
      setUploadSuccessMessage(null);
      setUploadErrorMessage(null);
    }
  };

  const handleGoToNext = () => {
    if (hasNext) {
      setSelectedProductId(products[currentIndex + 1].id);
      setUploadSuccessMessage(null);
      setUploadErrorMessage(null);
    }
  };

  const handleUploadFile = async (file: File, targetColorIndex?: number) => {
    if (!file || !currentProduct) return;

    // Validate that file is an image
    if (!file.type.startsWith('image/')) {
      setUploadErrorMessage(
        language === 'ar' 
          ? 'يرجى اختيار ملف صورة صالح (PNG, JPG, WEBP, إلخ)' 
          : 'Please select a valid image file (PNG, JPG, WEBP, etc.)'
      );
      return;
    }

    setIsUploading(true);
    setUploadProgress(
      language === 'ar' 
        ? `جارٍ رفع الصورة إلى Cloudinary (${CLOUDINARY_CLOUD_NAME})...` 
        : `Uploading image to Cloudinary (${CLOUDINARY_CLOUD_NAME})...`
    );
    setUploadSuccessMessage(null);
    setUploadErrorMessage(null);

    try {
      // 1. Upload to Cloudinary with preset tooooza_img
      const rawUrl = await uploadToCloudinary(file);
      if (!rawUrl) {
        throw new Error('لم يتم استلام رابط الصورة من Cloudinary');
      }

      const optimizedUrl = ensureAutoOptimizedCloudinaryUrl(rawUrl);

      // 2. Prepare updated product data
      let updatedImages = [...(currentProduct.images || [])];
      let updatedColors = [...(currentProduct.colors || [])];

      if (typeof targetColorIndex === 'number' && targetColorIndex >= 0 && targetColorIndex < updatedColors.length) {
        // Specific color variant update
        updatedColors[targetColorIndex] = {
          ...updatedColors[targetColorIndex],
          imageUrl: optimizedUrl,
        };
        // Also if main image was old or empty, update it
        if (!updatedImages[0] || isOldCloud(updatedImages[0])) {
          updatedImages[0] = optimizedUrl;
        }
      } else {
        // Primary main image update
        if (updatedImages.length === 0) {
          updatedImages = [optimizedUrl];
        } else {
          updatedImages[0] = optimizedUrl;
        }

        // Also update primary color imageUrl if it was matching old image or empty
        if (updatedColors.length > 0) {
          updatedColors = updatedColors.map((col, idx) => {
            if (idx === 0 || !col.imageUrl || isOldCloud(col.imageUrl)) {
              return { ...col, imageUrl: optimizedUrl };
            }
            return col;
          });
        }
      }

      const updatedProduct: Product = {
        ...currentProduct,
        images: updatedImages,
        colors: updatedColors,
      };

      // 3. Save to Firestore & local state via parent callback
      await onUpdateProduct(updatedProduct);

      setUploadSuccessMessage(
        language === 'ar'
          ? `✅ تم رفع وحفظ الصورة الجديدة بنجاح للمنتج (${currentProduct.nameAr || currentProduct.name})!`
          : `✅ Image successfully uploaded & saved to database for ${currentProduct.name}!`
      );
    } catch (err: any) {
      console.error('Error uploading product image to Cloudinary:', err);
      setUploadErrorMessage(
        err?.message || (language === 'ar' ? 'فشل رفع الصورة إلى Cloudinary' : 'Failed to upload image to Cloudinary')
      );
    } finally {
      setIsUploading(false);
      setUploadProgress('');
      setUpdatingColorIndex(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUploadFile(e.dataTransfer.files[0]);
    }
  };

  const updatedCount = products.filter((p) => !productNeedsUpdate(p)).length;
  const needsUpdateCount = products.length - updatedCount;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white max-w-5xl w-full rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-[#c4c7c7]/30 my-auto">
        {/* Header */}
        <div className="bg-[#111111] text-white p-5 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-display font-bold text-[18px] sm:text-[20px] leading-tight">
                {language === 'ar' ? 'أداة تحديث واستبدال صور المنتجات' : 'Product Image Manager'}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-[12px] text-white/70">
                <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-[11px] text-white/90">
                  Cloud: {CLOUDINARY_CLOUD_NAME}
                </span>
                <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-[11px] text-white/90">
                  Preset: {CLOUDINARY_UPLOAD_PRESET}
                </span>
                <span className="text-white/40">|</span>
                <span className="text-white/80">
                  {language === 'ar' 
                    ? `إجمالي: ${products.length} منتج (${needsUpdateCount} بحاجة لصورة)` 
                    : `Total: ${products.length} items (${needsUpdateCount} need image)`}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            title={language === 'ar' ? 'إغلاق' : 'Close'}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
          {/* Sidebar: Products List (lg:col-span-4) */}
          <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-[#c4c7c7]/30 bg-[#f9f9f9] flex flex-col max-h-[260px] lg:max-h-none overflow-hidden">
            {/* Search & Filter */}
            <div className="p-3 border-b border-[#c4c7c7]/30 space-y-2 shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 text-[#747878] absolute start-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={language === 'ar' ? 'بحث بالاسم أو القسم...' : 'Search by name or category...'}
                  className="w-full ps-9 pe-3 py-1.5 bg-white border border-[#c4c7c7] rounded-xl text-[13px] focus:outline-none focus:border-[#000000]"
                />
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-1 text-[11px] font-label-caps font-bold">
                <button
                  type="button"
                  onClick={() => setFilterMode('all')}
                  className={`flex-1 py-1 px-2 rounded-lg transition-colors cursor-pointer text-center ${
                    filterMode === 'all'
                      ? 'bg-[#111111] text-white'
                      : 'bg-white text-[#747878] hover:bg-[#e4e4e5]'
                  }`}
                >
                  {language === 'ar' ? `الكل (${products.length})` : `All (${products.length})`}
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode('needs_update')}
                  className={`flex-1 py-1 px-2 rounded-lg transition-colors cursor-pointer text-center ${
                    filterMode === 'needs_update'
                      ? 'bg-[#ba1a1a] text-white'
                      : 'bg-white text-[#ba1a1a] hover:bg-[#fde8e8]'
                  }`}
                >
                  {language === 'ar' ? `بحاجة (${needsUpdateCount})` : `Needs (${needsUpdateCount})`}
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode('updated')}
                  className={`flex-1 py-1 px-2 rounded-lg transition-colors cursor-pointer text-center ${
                    filterMode === 'updated'
                      ? 'bg-[#2e7d32] text-white'
                      : 'bg-white text-[#2e7d32] hover:bg-[#e8f5e9]'
                  }`}
                >
                  {language === 'ar' ? `محدّث (${updatedCount})` : `Done (${updatedCount})`}
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#c4c7c7]/20">
              {filteredProducts.map((prod) => {
                const isSelected = prod.id === selectedProductId;
                const isProdUpdated = !productNeedsUpdate(prod);
                const firstImg = prod.images?.[0] || '';

                return (
                  <button
                    key={prod.id}
                    type="button"
                    onClick={() => {
                      setSelectedProductId(prod.id);
                      setUploadSuccessMessage(null);
                      setUploadErrorMessage(null);
                    }}
                    className={`w-full text-start p-3 transition-colors flex items-center gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-white border-s-4 border-[#000000] shadow-2xs'
                        : 'hover:bg-[#f1f1f2]'
                    }`}
                  >
                    <div className="relative w-12 h-14 rounded-lg bg-[#e4e4e5] overflow-hidden shrink-0 border border-[#c4c7c7]/40 flex items-center justify-center">
                      {firstImg ? (
                        <img
                          src={firstImg}
                          alt={prod.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // On error, show fallback icon
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-[#747878]" />
                      )}
                      {/* Cloud Status Dot */}
                      <span
                        className={`absolute top-1 end-1 w-2.5 h-2.5 rounded-full border border-white ${
                          isProdUpdated ? 'bg-[#2e7d32]' : 'bg-[#ba1a1a]'
                        }`}
                        title={isProdUpdated ? 'تم التحديث على السحابة الجديدة' : 'بحاجة لرفع صورة جديدة'}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`text-[13px] font-bold truncate ${isSelected ? 'text-[#000000]' : 'text-[#222222]'}`}>
                        {language === 'ar' && prod.nameAr ? prod.nameAr : prod.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#747878]">
                        <span className="truncate">{prod.categoryAr || prod.category}</span>
                        <span>•</span>
                        <span className="font-bold text-[#111111]">{prod.price} ج.م</span>
                      </div>
                      <div className="mt-1">
                        {isProdUpdated ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-[#2e7d32] font-bold">
                            <Check className="w-3 h-3" />
                            {language === 'ar' ? 'سحابة جديدة' : 'New Cloud'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] text-[#ba1a1a] font-bold">
                            <AlertCircle className="w-3 h-3" />
                            {language === 'ar' ? 'سيرفر قديم' : 'Old Server'}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}

              {filteredProducts.length === 0 && (
                <div className="p-6 text-center text-[#747878] text-[13px]">
                  {language === 'ar' ? 'لا توجد منتجات مطابقة للبحث' : 'No matching products found'}
                </div>
              )}
            </div>
          </div>

          {/* Main Area: Product Details & Image Uploader (lg:col-span-8) */}
          <div className="lg:col-span-8 flex flex-col overflow-y-auto p-4 sm:p-6 space-y-6 bg-white">
            {currentProduct ? (
              <>
                {/* Navigation & Header Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#c4c7c7]/30">
                  <div>
                    <span className="text-[11px] font-mono text-[#747878] uppercase tracking-wider block">
                      ID: {currentProduct.id} • {currentProduct.categoryAr || currentProduct.category}
                    </span>
                    <h3 className="font-display font-bold text-[20px] text-[#000000]">
                      {language === 'ar' && currentProduct.nameAr ? currentProduct.nameAr : currentProduct.name}
                    </h3>
                    {currentProduct.subtitle && (
                      <p className="text-[12px] text-[#747878]">{currentProduct.subtitle}</p>
                    )}
                  </div>

                  {/* Previous / Next Nav */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleGoToPrev}
                      disabled={!hasPrev}
                      className="px-3 py-1.5 bg-[#f3f3f4] hover:bg-[#e4e4e5] text-[#111111] rounded-xl text-[12px] font-bold font-label-caps flex items-center gap-1 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      title={language === 'ar' ? 'المنتج السابق' : 'Previous Product'}
                    >
                      <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                      <span>{language === 'ar' ? 'السابق' : 'Prev'}</span>
                    </button>
                    <span className="text-[12px] font-mono text-[#747878] px-1">
                      {currentIndex + 1} / {products.length}
                    </span>
                    <button
                      type="button"
                      onClick={handleGoToNext}
                      disabled={!hasNext}
                      className="px-3 py-1.5 bg-[#f3f3f4] hover:bg-[#e4e4e5] text-[#111111] rounded-xl text-[12px] font-bold font-label-caps flex items-center gap-1 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      title={language === 'ar' ? 'المنتج التالي' : 'Next Product'}
                    >
                      <span>{language === 'ar' ? 'التالي' : 'Next'}</span>
                      <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
                    </button>
                  </div>
                </div>

                {/* Status Messages */}
                {uploadSuccessMessage && (
                  <div className="p-3 bg-[#e8f5e9] border border-[#2e7d32]/30 rounded-xl text-[#2e7d32] text-[13px] flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 shrink-0" />
                    <span>{uploadSuccessMessage}</span>
                  </div>
                )}
                {uploadErrorMessage && (
                  <div className="p-3 bg-[#fde8e8] border border-[#ba1a1a]/30 rounded-xl text-[#ba1a1a] text-[13px] flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{uploadErrorMessage}</span>
                  </div>
                )}

                {/* Primary Image Upload Card */}
                <div className="bg-[#f9f9f9] rounded-2xl border border-[#c4c7c7]/40 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-[15px] text-[#000000] flex items-center gap-2">
                        <span>{language === 'ar' ? '🖼️ الصورة الرئيسية للمنتج' : '🖼️ Primary Product Image'}</span>
                        {isNewCloud(currentProduct.images?.[0]) ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#e8f5e9] text-[#2e7d32] border border-[#2e7d32]/30">
                            <Check className="w-3 h-3" />
                            {language === 'ar' ? 'السحابة الجديدة s1vv6dqw' : 'New Cloud s1vv6dqw'}
                          </span>
                        ) : isOldCloud(currentProduct.images?.[0]) ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#fde8e8] text-[#ba1a1a] border border-[#ba1a1a]/30 animate-pulse">
                            <AlertCircle className="w-3 h-3" />
                            {language === 'ar' ? 'سيرفر قديم (غير شغال)' : 'Old Cloud (Broken)'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#f3f3f4] text-[#747878] border border-[#c4c7c7]">
                            {language === 'ar' ? 'رابط خارجي' : 'External URL'}
                          </span>
                        )}
                      </h4>
                      <p className="text-[12px] text-[#747878] mt-0.5">
                        {language === 'ar'
                          ? 'ارفع الصورة الجديدة مباشرة من جهازك، وسيتم رفعها للسحابة وتحديث المنتج فوراً في قاعدة البيانات.'
                          : 'Upload the new image from your device; it will be saved to Cloudinary and database immediately.'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                    {/* Image Preview */}
                    <div className="md:col-span-5 flex flex-col items-center">
                      <div className="w-full max-w-[200px] h-[220px] rounded-xl bg-white border border-[#c4c7c7]/60 overflow-hidden shadow-xs relative flex items-center justify-center">
                        {currentProduct.images?.[0] ? (
                          <img
                            src={currentProduct.images[0]}
                            alt={currentProduct.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Replace broken display with helpful banner
                              e.currentTarget.style.display = 'none';
                              const parent = e.currentTarget.parentElement;
                              if (parent && !parent.querySelector('.img-err-fallback')) {
                                const errDiv = document.createElement('div');
                                errDiv.className = 'img-err-fallback p-3 text-center text-[#ba1a1a] text-[11px] flex flex-col items-center gap-2';
                                errDiv.innerHTML = '<span class="material-symbols-outlined text-[32px]">broken_image</span><span>الصورة القديمة غير متاحة<br/>ارفع صورة جديدة</span>';
                                parent.appendChild(errDiv);
                              }
                            }}
                          />
                        ) : (
                          <div className="text-center text-[#747878] text-[12px] p-4">
                            <ImageIcon className="w-8 h-8 mx-auto mb-1 text-[#747878]/50" />
                            <span>لا توجد صورة حالياً</span>
                          </div>
                        )}

                        {isUploading && updatingColorIndex === null && (
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white p-3 text-center">
                            <RefreshCw className="w-6 h-6 animate-spin text-white mb-2" />
                            <span className="text-[12px] font-bold font-label-caps">{uploadProgress}</span>
                          </div>
                        )}
                      </div>

                      {currentProduct.images?.[0] && (
                        <div className="mt-3 w-full space-y-1">
                          <div className="flex items-center gap-1 bg-[#f3f3f4] p-1.5 rounded-xl border border-[#c4c7c7]/60">
                            <input
                              type="text"
                              readOnly
                              value={currentProduct.images[0]}
                              className="text-[11px] font-mono bg-transparent text-[#222222] flex-1 px-1 focus:outline-none select-all dir-ltr"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(currentProduct.images[0]);
                                alert(language === 'ar' ? 'تم نسخ رابط الصورة!' : 'Image link copied!');
                              }}
                              className="px-2 py-1 bg-black text-white hover:bg-neutral-800 rounded-lg text-[10px] font-bold shrink-0 transition-colors"
                              title="نسخ الرابط"
                            >
                              نسخ
                            </button>
                            <a
                              href={currentProduct.images[0]}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 text-neutral-600 hover:text-black shrink-0"
                              title="فتح الرابط"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                          <p className="text-[10px] text-[#747878] font-mono text-center">
                            {currentProduct.images[0].includes('s1vv6dqw') 
                              ? 'سحابة s1vv6dqw المعتمدة (f_auto,q_auto) ✓' 
                              : 'رابط قديم — يرجى رفع صورة جديدة للتحديث'}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Drag & Drop Upload Zone */}
                    <div className="md:col-span-7">
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[190px] ${
                          isDragging
                            ? 'border-[#000000] bg-[#e8f5e9]'
                            : 'border-[#c4c7c7] hover:border-[#000000] bg-white hover:bg-[#fafafa]'
                        }`}
                      >
                        <input
                          id={fileInputId}
                          type="file"
                          ref={fileInputRef}
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleUploadFile(e.target.files[0]);
                              e.target.value = '';
                            }
                          }}
                        />

                        <div className="w-12 h-12 rounded-full bg-[#111111] text-white flex items-center justify-center mb-3 shadow-xs">
                          {isUploading && updatingColorIndex === null ? (
                            <RefreshCw className="w-6 h-6 animate-spin" />
                          ) : (
                            <Upload className="w-6 h-6" />
                          )}
                        </div>

                        <p className="font-bold text-[14px] text-[#000000]">
                          {language === 'ar' ? 'اضغط لاختيار صورة من جهازك' : 'Click to select image from device'}
                        </p>
                        <p className="text-[12px] text-[#747878] mt-1">
                          {language === 'ar'
                            ? 'أو اسحب ملف الصورة وأفلته هنا مباشرة'
                            : 'or drag and drop your image file here'}
                        </p>
                        <p className="text-[11px] text-[#747878]/70 mt-2 font-mono">
                          PNG, JPG, WEBP, GIF (Max 15MB)
                        </p>

                        <button
                          type="button"
                          className="mt-3 px-4 py-1.5 bg-[#000000] text-white rounded-xl text-[12px] font-bold font-label-caps hover:bg-[#222222] transition-colors pointer-events-none"
                        >
                          {language === 'ar' ? 'تصفح جهازك 📁' : 'Browse Files 📁'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Color Variants Images Section (If colors exist) */}
                {currentProduct.colors && currentProduct.colors.length > 0 && (
                  <div className="bg-[#f9f9f9] rounded-2xl border border-[#c4c7c7]/40 p-5 space-y-3">
                    <h4 className="font-bold text-[14px] text-[#000000]">
                      {language === 'ar' ? '🎨 صور ألوان المنتج (Color Variants)' : '🎨 Product Color Variant Images'}
                    </h4>
                    <p className="text-[12px] text-[#747878]">
                      {language === 'ar'
                        ? 'يمكنك أيضاً رفع صورة مخصصة لكل لون من ألوان هذا المنتج بشكل مستقل:'
                        : 'You can also upload a dedicated image for each individual color variant:'}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {currentProduct.colors.map((color, idx) => {
                        const hasNewCloud = isNewCloud(color.imageUrl);
                        const hasOldCloud = isOldCloud(color.imageUrl);

                        return (
                          <div
                            key={idx}
                            className="bg-white p-3 rounded-xl border border-[#c4c7c7]/50 flex items-center justify-between gap-3 shadow-2xs"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span
                                className="w-6 h-6 rounded-full border border-black/20 shrink-0 shadow-2xs"
                                style={{ backgroundColor: color.hex }}
                              />
                              <div className="min-w-0">
                                <p className="font-bold text-[13px] text-[#000000] truncate">
                                  {language === 'ar' && color.nameAr ? color.nameAr : color.name}
                                </p>
                                <div className="text-[11px]">
                                  {hasNewCloud ? (
                                    <span className="text-[#2e7d32] font-bold">✅ سحابة جديدة</span>
                                  ) : hasOldCloud ? (
                                    <span className="text-[#ba1a1a] font-bold">⚠️ سيرفر قديم</span>
                                  ) : (
                                    <span className="text-[#747878]">صورة افتراضية</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <label className="bg-[#111111] hover:bg-[#333333] text-white px-3 py-1.5 rounded-lg text-[11px] font-bold font-label-caps cursor-pointer shrink-0 flex items-center gap-1 transition-colors">
                              {isUploading && updatingColorIndex === idx ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Upload className="w-3.5 h-3.5" />
                              )}
                              <span>{language === 'ar' ? 'رفع صورة' : 'Upload'}</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={isUploading}
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    setUpdatingColorIndex(idx);
                                    handleUploadFile(e.target.files[0], idx);
                                    e.target.value = '';
                                  }
                                }}
                              />
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Additional Product Info Card */}
                <div className="p-4 bg-[#f3f3f4] rounded-xl text-[12px] text-[#444748] flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{language === 'ar' ? 'السعر الحالي:' : 'Price:'}</span>
                    <span className="font-mono text-[13px] font-bold text-[#111111]">{currentProduct.price} ج.م</span>
                    {currentProduct.originalPrice && (
                      <span className="line-through text-[#747878]">{currentProduct.originalPrice} ج.م</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{language === 'ar' ? 'المقاسات:' : 'Sizes:'}</span>
                    <div className="flex gap-1">
                      {currentProduct.sizes?.map((s, idx) => (
                        <span key={idx} className="bg-white px-1.5 py-0.5 rounded text-[11px] border border-[#c4c7c7]">
                          {s.size}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-12 text-center text-[#747878]">
                {language === 'ar' ? 'يرجى اختيار منتج من القائمة الجانبية' : 'Please select a product from the list'}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#f9f9f9] px-6 py-4 border-t border-[#c4c7c7]/30 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-[12px] text-[#747878]">
            {language === 'ar'
              ? '💡 يتم حفظ وتحديث الصورة مباشرة في Firestore وفي الذاكرة الحية للمتجر فور اكتمال الرفع.'
              : '💡 Images are instantly saved to Firestore and active store memory upon upload.'}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#111111] hover:bg-[#222222] text-white rounded-xl text-[13px] font-bold font-label-caps cursor-pointer transition-colors"
          >
            {language === 'ar' ? 'تم الانتهاء' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};
