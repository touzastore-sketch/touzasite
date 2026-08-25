import React, { useState } from 'react';
import {
  Code2,
  Copy,
  Check,
  Download,
  Sparkles,
  Layers,
  Database,
  Terminal,
  FileCode,
  ExternalLink,
  RefreshCw,
  Cpu,
  CheckCircle2,
} from 'lucide-react';
import { Category, Product, PromoCode, StoreSettings } from '../types';
import { safeJsonStringify, isBannedProductId } from '../firebase';

interface AiStudioSyncTabProps {
  products: Product[];
  categories: Category[];
  storeSettings: StoreSettings | null;
  promoCodes: PromoCode[];
  language: 'ar' | 'en';
}

export const AiStudioSyncTab: React.FC<AiStudioSyncTabProps> = ({
  products,
  categories,
  storeSettings,
  promoCodes,
  language,
}) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [activeCodeView, setActiveCodeView] = useState<'products' | 'categories' | 'prompt' | 'fullJson'>('products');

  const validProducts = (products || []).filter((p) => !isBannedProductId(p.id));

  const copyToClipboard = async (text: string, sectionKey: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedSection(sectionKey);
      setTimeout(() => setCopiedSection(null), 2500);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const downloadFile = (filename: string, content: string, contentType: string = 'text/plain;charset=utf-8;') => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Generate src/data/products.ts content
  const generateProductsTsContent = () => {
    const productsJson = safeJsonStringify(validProducts, 2);
    return `import { Product } from '../types';

export const PRODUCTS: Product[] = ${productsJson};

export const getLocalizedProductName = (product: Product, language: 'ar' | 'en' = 'en'): string => {
  if (language === 'ar' && product.nameAr) {
    return product.nameAr;
  }
  return product.name;
};

export const getLocalizedProductCategory = (product: Product, language: 'ar' | 'en' = 'en'): string => {
  if (language === 'ar' && product.categoryAr) {
    return product.categoryAr;
  }
  return product.category;
};

export const getLocalizedProductDescription = (product: Product, language: 'ar' | 'en' = 'en'): string => {
  if (language === 'ar' && product.descriptionAr) {
    return product.descriptionAr;
  }
  return product.description || '';
};

export const getLocalizedProductDetails = (product: Product, language: 'ar' | 'en' = 'en'): string[] => {
  if (language === 'ar' && product.detailsAr && product.detailsAr.length > 0) {
    return product.detailsAr;
  }
  return product.details || [];
};
`;
  };

  // Generate src/data/defaultCategories.ts content
  const generateCategoriesTsContent = () => {
    const categoriesJson = safeJsonStringify(categories, 2);
    return `import { Category } from '../types';

export const DEFAULT_CATEGORIES: Category[] = ${categoriesJson};
`;
  };

  // Generate AI Prompt for Google AI Studio
  const generateAiStudioPrompt = () => {
    return `قم بتحديث ملف src/data/products.ts في المشروع ليحتوي على أحدث المنتجات والتعديلات التي قمت بإجرائها في المتجر كالتالي:

\`\`\`typescript
${generateProductsTsContent()}
\`\`\`

يرجى أيضاً التأكد من حفظ جميع المنتجات (${validProducts.length} منتج) ومقاساتها وصورها وتصنيفاتها.`;
  };

  // Generate Full Database Export JSON
  const generateFullJsonContent = () => {
    return safeJsonStringify(
      {
        exportedAt: new Date().toISOString(),
        productCount: products.length,
        categoryCount: categories.length,
        products,
        categories,
        storeSettings,
        promoCodes,
      },
      2
    );
  };

  const currentActiveCode =
    activeCodeView === 'products'
      ? generateProductsTsContent()
      : activeCodeView === 'categories'
      ? generateCategoriesTsContent()
      : activeCodeView === 'prompt'
      ? generateAiStudioPrompt()
      : generateFullJsonContent();

  return (
    <div className="space-y-6 fade-in-up">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-[#c4c7c7]/30 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center shadow-md shrink-0">
              <Code2 className="w-6 h-6 text-[#c5a059]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-[22px] font-bold text-black">
                  {language === 'ar' ? 'مزامنة وتصدير الكود لـ Google AI Studio' : 'Google AI Studio Live Code Sync'}
                </h2>
                <span className="bg-emerald-100 text-emerald-800 text-[11px] font-label-caps px-2.5 py-0.5 rounded-full font-bold inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  {language === 'ar' ? 'محدث لحظياً' : 'Live Sync'}
                </span>
              </div>
              <p className="font-body text-[13px] text-[#5e5e5c] mt-1">
                {language === 'ar'
                  ? 'أي تعديل أو إضافة منتجات تجريها في لوحة التحكم يتم تحديث كود TypeScript الخاص بها هنا فورياً لنسخه أو إرساله لـ Google AI Studio.'
                  : 'Any changes made in the dashboard instantly generate matching TypeScript code ready to sync with Google AI Studio files.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => copyToClipboard(generateAiStudioPrompt(), 'prompt-top')}
              className="bg-black text-white hover:bg-[#222222] px-4 py-2.5 rounded-xl font-label-caps text-[13px] font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              {copiedSection === 'prompt-top' ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">{language === 'ar' ? 'تم نسخ البرومبت!' : 'Prompt Copied!'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#c5a059]" />
                  <span>{language === 'ar' ? 'نسخ البرومبت السريع للذكاء الاصطناعي' : 'Copy AI Prompt'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => downloadFile('products.ts', generateProductsTsContent())}
              className="bg-[#f3f3f4] text-black hover:bg-[#e5e5e5] border border-[#c4c7c7]/50 px-4 py-2.5 rounded-xl font-label-caps text-[13px] font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{language === 'ar' ? 'تحميل products.ts' : 'Download products.ts'}</span>
            </button>
          </div>
        </div>

        {/* Live Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-[#c4c7c7]/20">
          <div className="bg-[#f9f9f9] p-3 rounded-xl border border-[#c4c7c7]/30">
            <span className="text-[11px] font-label-caps text-[#747878] block">
              {language === 'ar' ? 'المنتجات الجاهزة للمزامنة' : 'Synced Products'}
            </span>
            <span className="font-display text-[20px] font-bold text-black">{products.length} منتج</span>
          </div>
          <div className="bg-[#f9f9f9] p-3 rounded-xl border border-[#c4c7c7]/30">
            <span className="text-[11px] font-label-caps text-[#747878] block">
              {language === 'ar' ? 'الأقسام والتصنيفات' : 'Synced Categories'}
            </span>
            <span className="font-display text-[20px] font-bold text-black">{categories.length} قسم</span>
          </div>
          <div className="bg-[#f9f9f9] p-3 rounded-xl border border-[#c4c7c7]/30">
            <span className="text-[11px] font-label-caps text-[#747878] block">
              {language === 'ar' ? 'أكواد الخصم النشطة' : 'Active Promo Codes'}
            </span>
            <span className="font-display text-[20px] font-bold text-black">{promoCodes.length} كود</span>
          </div>
          <div className="bg-[#f9f9f9] p-3 rounded-xl border border-[#c4c7c7]/30">
            <span className="text-[11px] font-label-caps text-[#747878] block">
              {language === 'ar' ? 'حالة المزامنة السحابية' : 'Cloud Firestore'}
            </span>
            <span className="font-display text-[15px] font-bold text-emerald-700 flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>{language === 'ar' ? 'متصل ومحفوظ' : 'Connected'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Code Viewer & Switcher Tabs */}
      <div className="bg-white rounded-2xl border border-[#c4c7c7]/30 shadow-xs overflow-hidden">
        {/* Navigation Selector Bar */}
        <div className="bg-[#1e1e1e] p-3 flex flex-wrap items-center justify-between gap-3 border-b border-black">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveCodeView('products')}
              className={`px-3.5 py-1.5 rounded-lg text-[12px] font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeCodeView === 'products'
                  ? 'bg-white text-black shadow-xs'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <FileCode className="w-4 h-4 text-blue-400" />
              <span>src/data/products.ts ({products.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveCodeView('categories')}
              className={`px-3.5 py-1.5 rounded-lg text-[12px] font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeCodeView === 'categories'
                  ? 'bg-white text-black shadow-xs'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Layers className="w-4 h-4 text-amber-400" />
              <span>src/data/defaultCategories.ts</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveCodeView('prompt')}
              className={`px-3.5 py-1.5 rounded-lg text-[12px] font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeCodeView === 'prompt'
                  ? 'bg-white text-black shadow-xs'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Sparkles className="w-4 h-4 text-[#c5a059]" />
              <span>{language === 'ar' ? '🤖 برومبت جاهز للـ AI' : '🤖 AI Studio Prompt'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveCodeView('fullJson')}
              className={`px-3.5 py-1.5 rounded-lg text-[12px] font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeCodeView === 'fullJson'
                  ? 'bg-white text-black shadow-xs'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Database className="w-4 h-4 text-purple-400" />
              <span>{language === 'ar' ? 'نسخة JSON شاملة' : 'Full Store JSON'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => copyToClipboard(currentActiveCode, activeCodeView)}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3 py-1.5 rounded-lg text-[12px] font-label-caps font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {copiedSection === activeCodeView ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">{language === 'ar' ? 'تم النسخ!' : 'Copied!'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'نسخ هذا الكود' : 'Copy Code'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                const filename =
                  activeCodeView === 'products'
                    ? 'products.ts'
                    : activeCodeView === 'categories'
                    ? 'defaultCategories.ts'
                    : activeCodeView === 'prompt'
                    ? 'ai-prompt.txt'
                    : 'touza-store-data.json';
                downloadFile(filename, currentActiveCode);
              }}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3 py-1.5 rounded-lg text-[12px] font-label-caps font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="تحميل الملف"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'تحميل كملف' : 'Download'}</span>
            </button>
          </div>
        </div>

        {/* Code Content Display */}
        <div className="bg-[#121212] p-4 sm:p-6 text-gray-100 font-mono text-[13px] leading-relaxed max-h-[550px] overflow-y-auto dir-ltr text-left selection:bg-white selection:text-black">
          <pre className="whitespace-pre font-mono text-[12px] sm:text-[13px] text-emerald-300">
            <code>{currentActiveCode}</code>
          </pre>
        </div>

        {/* Instructions / Footer Tip */}
        <div className="p-4 bg-[#f9f9f9] border-t border-[#c4c7c7]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[13px] font-body text-[#5e5e5c]">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-black shrink-0" />
            <span>
              {language === 'ar'
                ? '💡 طريقة الاستخدام: انسخ البرومبت أو كود الملف أعلاه وضعه في محادثة Google AI Studio ليتم تحديث ملفات المشروع مباشرة.'
                : '💡 Usage: Copy the prompt or code above and paste it in Google AI Studio chat to update project files directly.'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => copyToClipboard(generateAiStudioPrompt(), 'prompt-bottom')}
            className="bg-black text-white hover:bg-[#222222] px-3.5 py-1.5 rounded-lg font-label-caps text-[12px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
          >
            {copiedSection === 'prompt-bottom' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>{language === 'ar' ? 'تم نسخ البرومبت!' : 'Copied!'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-[#c5a059]" />
                <span>{language === 'ar' ? 'نسخ البرومبت' : 'Copy Prompt'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
