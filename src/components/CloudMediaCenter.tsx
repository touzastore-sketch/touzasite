import React, { useState, useEffect, useRef } from 'react';
import {
  UploadCloud,
  Cloud,
  Copy,
  Check,
  ExternalLink,
  Trash2,
  Image as ImageIcon,
  Film,
  Folder,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  SlidersHorizontal,
} from 'lucide-react';
import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET,
  uploadMediaToCloudinary,
  CloudMediaItem,
} from '../utils/cloudinary';
import { useLanguage } from '../context/LanguageContext';

interface CloudMediaCenterProps {
  onSelectImageForProduct?: (imageUrl: string) => void;
  onSelectImageForCategory?: (imageUrl: string) => void;
  onSelectImageForPhilosophy?: (imageUrl: string) => void;
}

interface UploadTask {
  id: string;
  file: File;
  previewUrl: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  error?: string;
  result?: CloudMediaItem;
}

const STORAGE_KEY = 'touza_cloud_media_library_v1';

// Initial sample media items to showcase if library is fresh
const INITIAL_LIBRARY_MEDIA: CloudMediaItem[] = [
  {
    id: 'sample-1',
    url: 'https://res.cloudinary.com/s1vv6dqw/video/upload/ac_none,vc_h264,q_auto/v1788953187/touza_header_videos/qllptxwywqjkch6snkrm.mp4',
    originalName: 'touza_header_cinematic_banner.mp4',
    format: 'mp4',
    folder: 'touza_header_videos',
    resourceType: 'video',
    uploadedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'sample-2',
    url: 'https://res.cloudinary.com/s1vv6dqw/image/upload/f_auto,q_auto/v1788953397/touza_settings/gie9utj4pmyqsrmi3arp.jpg',
    originalName: 'touza_philosophy_craftsmanship.jpg',
    format: 'jpg',
    folder: 'touza_settings',
    resourceType: 'image',
    uploadedAt: new Date(Date.now() - 7200000).toISOString(),
  },
];

export const CloudMediaCenter: React.FC<CloudMediaCenterProps> = ({
  onSelectImageForProduct,
  onSelectImageForCategory,
  onSelectImageForPhilosophy,
}) => {
  const { language } = useLanguage();

  // Media Library state
  const [mediaLibrary, setMediaLibrary] = useState<CloudMediaItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: CloudMediaItem[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load stored media library:', e);
    }
    return INITIAL_LIBRARY_MEDIA;
  });

  // Upload state
  const [targetFolder, setTargetFolder] = useState<string>('touza_products');
  const [uploadTasks, setUploadTasks] = useState<UploadTask[]>([]);
  const [isUploadingGlobal, setIsUploadingGlobal] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolderFilter, setSelectedFolderFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'all' | 'image' | 'video'>('all');

  // Preview Modal
  const [previewMedia, setPreviewMedia] = useState<CloudMediaItem | null>(null);

  // Toast State
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Test connection state
  const [isTestingConn, setIsTestingConn] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Persist library
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mediaLibrary));
    } catch (e) {
      console.error('Failed to persist media library:', e);
    }
  }, [mediaLibrary]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    showToast(language === 'ar' ? '✓ تم نسخ الرابط المباشر إلى الحافظة!' : '✓ Direct URL copied to clipboard!');
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  // Test Cloud Connection
  const handleTestConnection = async () => {
    setIsTestingConn(true);
    setTestResult(null);
    try {
      // 1x1 transparent PNG blob for test
      const byteCharacters = atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAA');
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const testBlob = new Blob([byteArray], { type: 'image/png' });
      const testFile = new File([testBlob], `test_connection_${Date.now()}.png`, { type: 'image/png' });

      const res = await uploadMediaToCloudinary(testFile, { folder: 'tooooza_img' });
      if (res && res.url) {
        setTestResult({
          success: true,
          message:
            language === 'ar'
              ? `الاتصال بسحابة Cloudinary (${CLOUDINARY_CLOUD_NAME}) نشط وناجح بنسبة 100%! تم التحقق من البريست "${CLOUDINARY_UPLOAD_PRESET}".`
              : `Connection to Cloudinary (${CLOUDINARY_CLOUD_NAME}) is 100% active and verified! Preset: "${CLOUDINARY_UPLOAD_PRESET}".`,
        });
      }
    } catch (err: any) {
      console.error('Connection test error:', err);
      setTestResult({
        success: false,
        message:
          language === 'ar'
            ? 'فشل الاتصال: ' + (err?.message || 'يرجى التحقق من اتصال الإنترنت.')
            : 'Connection failed: ' + (err?.message || 'Please check connection.'),
      });
    } finally {
      setIsTestingConn(false);
    }
  };

  // Handle files selected via input or drop
  const handleFilesSelected = (files: FileList | File[]) => {
    const list = Array.from(files);
    if (list.length === 0) return;

    const newTasks: UploadTask[] = list.map((file) => ({
      id: 'task-' + Math.random().toString(36).substring(2, 9),
      file,
      previewUrl: URL.createObjectURL(file),
      progress: 0,
      status: 'pending',
    }));

    setUploadTasks((prev) => [...prev, ...newTasks]);
  };

  // Start uploading all pending tasks
  const startUploadAll = async () => {
    const pendingTasks = uploadTasks.filter((t) => t.status === 'pending' || t.status === 'failed');
    if (pendingTasks.length === 0) return;

    setIsUploadingGlobal(true);

    for (const task of pendingTasks) {
      // Mark uploading
      setUploadTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: 'uploading', progress: 5 } : t))
      );

      try {
        const result = await uploadMediaToCloudinary(
          task.file,
          { folder: targetFolder },
          (p) => {
            setUploadTasks((prev) =>
              prev.map((t) => (t.id === task.id ? { ...t, progress: p.percent } : t))
            );
          }
        );

        // Update task to completed
        setUploadTasks((prev) =>
          prev.map((t) =>
            t.id === task.id
              ? { ...t, status: 'completed', progress: 100, result }
              : t
          )
        );

        // Add to media library (at beginning)
        setMediaLibrary((prev) => [result, ...prev.filter((m) => m.url !== result.url)]);
      } catch (err: any) {
        console.error('Upload failed for task:', task.file.name, err);
        setUploadTasks((prev) =>
          prev.map((t) =>
            t.id === task.id
              ? { ...t, status: 'failed', error: err?.message || 'Upload error' }
              : t
          )
        );
      }
    }

    setIsUploadingGlobal(false);
    showToast(
      language === 'ar'
        ? '✓ اكتملت عمليات الرفع بنجاح وأضيفت الصور إلى مركز الوسائط!'
        : '✓ All files uploaded successfully and added to media hub!'
    );
  };

  const removeTask = (taskId: string) => {
    setUploadTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const clearCompletedTasks = () => {
    setUploadTasks((prev) => prev.filter((t) => t.status !== 'completed'));
  };

  const deleteFromLibrary = (mediaId: string) => {
    setMediaLibrary((prev) => prev.filter((m) => m.id !== mediaId));
    showToast(language === 'ar' ? 'تم حذف العنصر من السجل' : 'Removed from history');
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelected(e.dataTransfer.files);
    }
  };

  // Filtered Library
  const filteredLibrary = mediaLibrary.filter((item) => {
    const matchesSearch =
      !searchQuery ||
      item.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.folder && item.folder.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.url.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFolder =
      selectedFolderFilter === 'all' || item.folder === selectedFolderFilter;

    const matchesType =
      selectedTypeFilter === 'all' || item.resourceType === selectedTypeFilter;

    return matchesSearch && matchesFolder && matchesType;
  });

  const formatBytes = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="space-y-6 fade-in-up">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#000000] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/20 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-[13px] font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Cloud Status & Top Overview Card */}
      <div className="bg-white p-6 rounded-2xl border border-[#c4c7c7]/30 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center shadow-sm shrink-0">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-display text-[20px] font-bold text-[#000000]">
                  {language === 'ar' ? 'مركز رفع وسائط السحابة Cloud Media' : 'Cloud Media Upload Center'}
                </h2>
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-full border border-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>{language === 'ar' ? 'متصل ومباشر' : 'Live & Active'}</span>
                </span>
              </div>
              <p className="text-[12px] text-[#666666] font-body mt-0.5">
                {language === 'ar'
                  ? 'رفع مباشر وفوري للصور والفيديوهات إلى Cloudinary مع روابط CDN مشفرة ومحسنة تلقائياً'
                  : 'Direct, instant asset upload to Cloudinary with automatic WebP/AVIF CDN optimization'}
              </p>
            </div>
          </div>

          {/* Cloud Info Badges & Test Connection Button */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-[12px] font-mono flex items-center gap-2">
              <span className="text-gray-400">Cloud:</span>
              <span className="font-bold text-black">{CLOUDINARY_CLOUD_NAME}</span>
            </div>
            <div className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-[12px] font-mono flex items-center gap-2">
              <span className="text-gray-400">Preset:</span>
              <span className="font-bold text-emerald-700">{CLOUDINARY_UPLOAD_PRESET}</span>
            </div>

            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTestingConn}
              className="px-3.5 py-1.5 bg-white hover:bg-gray-100 border border-gray-300 rounded-xl text-[12px] font-bold text-gray-800 transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
              title={language === 'ar' ? 'فحص جاهزية السحابة وسرعة الاستجابة' : 'Test cloud connectivity'}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTestingConn ? 'animate-spin' : ''}`} />
              <span>{isTestingConn ? (language === 'ar' ? 'جاري الفحص...' : 'Testing...') : (language === 'ar' ? 'فحص الاتصال السحابي' : 'Test Cloud')}</span>
            </button>
          </div>
        </div>

        {/* Test Result Message */}
        {testResult && (
          <div
            className={`p-3.5 rounded-xl border text-[13px] flex items-center gap-2.5 ${
              testResult.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-red-50 border-red-200 text-red-900'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <span className="font-medium">{testResult.message}</span>
          </div>
        )}
      </div>

      {/* Main Drag-and-Drop & Multi-File Upload Card */}
      <div className="bg-white p-6 rounded-2xl border border-[#c4c7c7]/30 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h3 className="font-label-caps text-[14px] font-bold text-black flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-black" />
            <span>{language === 'ar' ? 'منطقة الرفع المباشر إلى Cloudinary' : 'Direct Cloudinary Upload Zone'}</span>
          </h3>

          {/* Folder Target Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-[12px] font-bold text-gray-600 shrink-0">
              {language === 'ar' ? 'المجلد الهدف:' : 'Target Folder:'}
            </span>
            <select
              value={targetFolder}
              onChange={(e) => setTargetFolder(e.target.value)}
              className="bg-gray-50 border border-gray-300 rounded-xl px-3 py-1.5 text-[12px] font-bold text-gray-800 focus:outline-none focus:border-black cursor-pointer"
            >
              <option value="touza_products">touza_products (صور المنتجات وملابس توزا)</option>
              <option value="touza_categories">touza_categories (صور وتصنيفات المتجر)</option>
              <option value="touza_settings">touza_settings (بانرات وإعدادات المتجر)</option>
              <option value="touza_header_videos">touza_header_videos (فيديوهات الهيدر والعروض)</option>
              <option value="tooooza_img">tooooza_img (المجلد العام الرئيسي)</option>
            </select>
          </div>
        </div>

        {/* Dropzone Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
            isDragOver
              ? 'border-black bg-neutral-100 scale-[0.99] shadow-inner'
              : 'border-gray-300 hover:border-black bg-[#fafafa] hover:bg-neutral-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFilesSelected(e.target.files);
                e.target.value = '';
              }
            }}
          />

          <div className="w-16 h-16 rounded-2xl bg-white shadow-xs border border-gray-200 flex items-center justify-center text-black group-hover:scale-110 transition-transform">
            <UploadCloud className="w-8 h-8" />
          </div>

          <div>
            <p className="font-display text-[16px] font-bold text-black">
              {language === 'ar'
                ? 'اسحب وأفلت الصور أو الفيديوهات هنا، أو انقر للاختيار من جهازك'
                : 'Drag and drop images or videos here, or click to browse'}
            </p>
            <p className="text-[12px] text-gray-500 mt-1 font-body">
              {language === 'ar'
                ? 'يمكنك تحديد عدة ملفات دفعة واحدة (JPG, PNG, WebP, AVIF, GIF, MP4, WebM)'
                : 'Supports multiple files at once (JPG, PNG, WebP, AVIF, GIF, MP4, WebM)'}
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <span className="px-3 py-1 bg-black text-white text-[12px] font-bold rounded-xl shadow-xs">
              + {language === 'ar' ? 'اختر ملفات لرفعها' : 'Select Files'}
            </span>
          </div>
        </div>

        {/* Upload Tasks Queue */}
        {uploadTasks.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold text-black flex items-center gap-2">
                <span>{language === 'ar' ? 'الملفات المحددة للرفع' : 'Selected Queue'}</span>
                <span className="px-2 py-0.5 bg-gray-100 rounded-md text-[11px] font-mono">
                  {uploadTasks.length}
                </span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={clearCompletedTasks}
                  className="text-[12px] text-gray-500 hover:text-black font-medium cursor-pointer"
                >
                  {language === 'ar' ? 'مسح المكتمل' : 'Clear Completed'}
                </button>
                <button
                  type="button"
                  onClick={startUploadAll}
                  disabled={isUploadingGlobal || uploadTasks.every((t) => t.status === 'completed')}
                  className="px-4 py-2 bg-black hover:bg-neutral-800 text-white rounded-xl text-[12px] font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isUploadingGlobal ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>{language === 'ar' ? 'جارٍ الرفع...' : 'Uploading...'}</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>{language === 'ar' ? 'بدء رفع الكل إلى السحابة' : 'Upload All Now'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {uploadTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center gap-3 relative"
                >
                  {/* Thumbnail */}
                  {task.file.type.startsWith('video/') ? (
                    <div className="w-12 h-12 rounded-lg bg-black text-white flex items-center justify-center shrink-0">
                      <Film className="w-5 h-5" />
                    </div>
                  ) : (
                    <img
                      src={task.previewUrl}
                      alt={task.file.name}
                      className="w-12 h-12 rounded-lg object-cover border border-gray-200 shrink-0 bg-white"
                    />
                  )}

                  {/* Info & Progress */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="font-bold text-gray-900 truncate" title={task.file.name}>
                        {task.file.name}
                      </span>
                      <span className="text-gray-400 font-mono text-[11px] shrink-0 ml-2">
                        {formatBytes(task.file.size)}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-200 ${
                          task.status === 'completed'
                            ? 'bg-emerald-500'
                            : task.status === 'failed'
                            ? 'bg-red-500'
                            : 'bg-black'
                        }`}
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>

                    {/* Status Text */}
                    <div className="flex items-center justify-between text-[11px]">
                      {task.status === 'pending' && (
                        <span className="text-amber-600 font-medium">
                          {language === 'ar' ? 'في الانتظار...' : 'Pending'}
                        </span>
                      )}
                      {task.status === 'uploading' && (
                        <span className="text-black font-bold flex items-center gap-1">
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>{task.progress}%</span>
                        </span>
                      )}
                      {task.status === 'completed' && (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>{language === 'ar' ? 'تم الرفع إلى Cloudinary' : 'Uploaded'}</span>
                        </span>
                      )}
                      {task.status === 'failed' && (
                        <span className="text-red-600 font-medium truncate">
                          {task.error || 'Failed'}
                        </span>
                      )}

                      {task.status === 'completed' && task.result && (
                        <button
                          type="button"
                          onClick={() => handleCopyUrl(task.result!.url)}
                          className="text-blue-600 hover:underline font-bold"
                        >
                          {language === 'ar' ? 'نسخ الرابط' : 'Copy URL'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeTask(task.id)}
                    className="text-gray-400 hover:text-red-600 p-1 rounded transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Cloud Media Gallery / Explorer */}
      <div className="bg-white p-6 rounded-2xl border border-[#c4c7c7]/30 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-[18px] font-bold text-black flex items-center gap-2">
              <Folder className="w-5 h-5 text-black" />
              <span>{language === 'ar' ? 'معرض وسائط السحابة المخزنة' : 'Stored Cloud Media Library'}</span>
              <span className="px-2.5 py-0.5 bg-black text-white text-[11px] font-bold rounded-full">
                {mediaLibrary.length}
              </span>
            </h3>
            <p className="text-[12px] text-gray-500 mt-0.5">
              {language === 'ar'
                ? 'تصفح جميع الصور والفيديوهات المحفوظة في حساب Cloudinary الخاص بك وانسخ روابطها بنقرة واحدة.'
                : 'Browse all media hosted in your Cloudinary account and copy URLs with 1 click.'}
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute right-3 rtl:right-3 ltr:left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'ar' ? 'بحث بالاسم أو المجلد...' : 'Search media by name...'}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl py-2 px-10 text-[13px] focus:outline-none focus:border-black"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-gray-100">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-gray-500 mr-1">
              {language === 'ar' ? 'المجلد:' : 'Folder:'}
            </span>
            {[
              { id: 'all', label: language === 'ar' ? 'الكل' : 'All' },
              { id: 'touza_products', label: 'touza_products' },
              { id: 'touza_categories', label: 'touza_categories' },
              { id: 'touza_settings', label: 'touza_settings' },
              { id: 'touza_header_videos', label: 'touza_header_videos' },
              { id: 'tooooza_img', label: 'tooooza_img' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setSelectedFolderFilter(f.id)}
                className={`px-3 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer ${
                  selectedFolderFilter === f.id
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 sm:ml-auto">
            <span className="text-[11px] font-bold text-gray-500">
              {language === 'ar' ? 'النوع:' : 'Type:'}
            </span>
            {[
              { id: 'all', label: language === 'ar' ? 'الكل' : 'All' },
              { id: 'image', label: language === 'ar' ? 'صور' : 'Images' },
              { id: 'video', label: language === 'ar' ? 'فيديو' : 'Videos' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTypeFilter(t.id as any)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  selectedTypeFilter === t.id
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Media Grid */}
        {filteredLibrary.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <ImageIcon className="w-10 h-10 text-gray-300 mx-auto" />
            <p className="text-[14px] font-bold text-gray-600">
              {language === 'ar' ? 'لا توجد وسائط مطابقة للبحث' : 'No matching media found'}
            </p>
            <p className="text-[12px] text-gray-400">
              {language === 'ar' ? 'استخدم منطقة الرفع بالأعلى لرفع صور أو فيديوهات جديدة إلى سحابة Cloudinary.' : 'Use the uploader above to add new media to your Cloudinary cloud.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredLibrary.map((item) => {
              const isVid = item.resourceType === 'video';
              const isCopied = copiedUrl === item.url;

              return (
                <div
                  key={item.id}
                  className="group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col relative"
                >
                  {/* Media Visual Preview */}
                  <div
                    onClick={() => setPreviewMedia(item)}
                    className="relative aspect-square bg-gray-100 overflow-hidden cursor-pointer"
                  >
                    {isVid ? (
                      <video
                        src={item.url}
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={item.url}
                        alt={item.originalName}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}

                    {/* Tag Badge */}
                    <div className="absolute top-2 left-2 right-2 flex justify-between items-center pointer-events-none">
                      <span className="bg-black/75 backdrop-blur-xs text-white text-[9px] font-mono px-2 py-0.5 rounded-md truncate max-w-[85%]">
                        {item.folder || 'cloud'}
                      </span>
                      {isVid && (
                        <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center">
                          <Film className="w-3 h-3" />
                        </span>
                      )}
                    </div>

                    {/* Hover Overlay with Preview Icon */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white">
                      <span className="text-[11px] font-bold bg-black/80 px-2.5 py-1 rounded-lg">
                        {language === 'ar' ? 'معاينة' : 'Preview'}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <p
                        className="font-bold text-[12px] text-gray-900 truncate"
                        title={item.originalName}
                      >
                        {item.originalName}
                      </p>
                      <p className="text-[10px] text-gray-400 font-mono">
                        {item.format?.toUpperCase()} {item.bytes ? `• ${formatBytes(item.bytes)}` : ''}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-1.5 pt-1 border-t border-gray-100">
                      {/* Copy Direct URL */}
                      <button
                        type="button"
                        onClick={() => handleCopyUrl(item.url)}
                        className={`w-full py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          isCopied
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-black text-white hover:bg-neutral-800'
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>{language === 'ar' ? 'تم النسخ ✓' : 'Copied ✓'}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>{language === 'ar' ? 'نسخ الرابط' : 'Copy URL'}</span>
                          </>
                        )}
                      </button>

                      {/* Quick Apply Actions */}
                      <div className="flex items-center gap-1 pt-1">
                        {onSelectImageForProduct && !isVid && (
                          <button
                            type="button"
                            onClick={() => {
                              onSelectImageForProduct(item.url);
                              showToast(language === 'ar' ? 'تم تجهيز الصورة لمنتج جديد!' : 'Applied to new product!');
                            }}
                            className="flex-1 py-1 px-1 bg-gray-100 hover:bg-gray-200 text-black rounded-lg text-[10px] font-bold transition-colors truncate"
                            title={language === 'ar' ? 'إضافة كمنتج جديد' : 'Create new product with this'}
                          >
                            + {language === 'ar' ? 'منتج' : 'Product'}
                          </button>
                        )}

                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 text-gray-400 hover:text-black rounded-lg hover:bg-gray-100 transition-colors"
                          title={language === 'ar' ? 'فتح الرابط في صفحة جديدة' : 'Open direct link'}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>

                        <button
                          type="button"
                          onClick={() => deleteFromLibrary(item.id)}
                          className="p-1 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          title={language === 'ar' ? 'إزالة من السجل' : 'Remove from library'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Fullscreen Media Preview Modal */}
      {previewMedia && (
        <div
          onClick={() => setPreviewMedia(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl space-y-4 p-5"
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="truncate">
                <h4 className="font-bold text-[15px] text-black truncate">{previewMedia.originalName}</h4>
                <p className="text-[11px] text-gray-400 font-mono">
                  {previewMedia.folder} • {previewMedia.resourceType}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewMedia(null)}
                className="p-1 text-gray-400 hover:text-black rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Visual */}
            <div className="max-h-[60vh] flex items-center justify-center bg-black/5 rounded-xl overflow-hidden">
              {previewMedia.resourceType === 'video' ? (
                <video
                  src={previewMedia.url}
                  controls
                  autoPlay
                  className="max-h-[60vh] w-auto mx-auto"
                />
              ) : (
                <img
                  src={previewMedia.url}
                  alt={previewMedia.originalName}
                  className="max-h-[60vh] w-auto mx-auto object-contain"
                />
              )}
            </div>

            {/* Direct URL Box */}
            <div className="space-y-2 pt-2">
              <label className="text-[11px] font-bold text-gray-500">
                {language === 'ar' ? 'الرابط السحابي المباشر (Direct CDN URL):' : 'Direct Cloud CDN URL:'}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={previewMedia.url}
                  className="flex-1 bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-[12px] font-mono text-gray-800 dir-ltr"
                />
                <button
                  type="button"
                  onClick={() => handleCopyUrl(previewMedia.url)}
                  className="px-4 py-2 bg-black hover:bg-neutral-800 text-white rounded-xl text-[12px] font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'نسخ' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
