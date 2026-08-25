export const CLOUDINARY_CLOUD_NAME =
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'qazdrpcx';
export const CLOUDINARY_UPLOAD_PRESET =
  import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'touza1_imgg';

export const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
export const CLOUDINARY_VIDEO_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`;

export interface CloudinaryUploadOptions {
  folder?: string;
  tags?: string[];
}

export interface VideoUploadProgressCallback {
  (progress: { loaded: number; total: number; percent: number }): void;
}

/**
 * Ensures any Cloudinary image URL contains f_auto,q_auto right after /image/upload/ or /upload/ (for images).
 * E.g.:
 * https://res.cloudinary.com/qazdrpcx/image/upload/v12345/touza_products/abc.jpg
 * -> https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v12345/touza_products/abc.jpg
 */
export function ensureAutoOptimizedCloudinaryUrl(url?: string): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // Only apply to Cloudinary URLs
  if (!trimmed.includes('res.cloudinary.com') && !trimmed.includes('cloudinary.com')) {
    return trimmed;
  }

  // If URL is for video resource, do not apply image format auto
  if (
    trimmed.includes('/video/upload/') ||
    trimmed.includes('touza_header_videos') ||
    trimmed.includes('touza_videos') ||
    trimmed.match(/\.(mp4|webm|mov|ogg|m4v)(\?.*)?$/i)
  ) {
    return trimmed;
  }

  // If URL already has f_auto,q_auto or transformations
  if (
    trimmed.includes('/image/upload/f_auto') ||
    trimmed.includes('/image/upload/q_auto') ||
    trimmed.includes('/upload/f_auto') ||
    trimmed.includes('/upload/q_auto')
  ) {
    return trimmed;
  }

  // Handle standard /image/upload/
  if (trimmed.includes('/image/upload/')) {
    return trimmed.replace('/image/upload/', '/image/upload/f_auto,q_auto/');
  }

  // Handle generic /upload/
  if (trimmed.includes('/upload/')) {
    return trimmed.replace('/upload/', '/upload/f_auto,q_auto/');
  }

  return trimmed;
}

/**
 * Unsigned upload to Cloudinary for images. Returns the secure_url string with f_auto,q_auto.
 * Falls back to compressed base64 if network/Cloudinary upload encounters an error.
 */
export async function uploadToCloudinary(
  file: File | Blob,
  options: CloudinaryUploadOptions = {}
): Promise<string> {
  if (!file) return '';

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    if (options.folder) {
      formData.append('folder', options.folder);
    }
    if (options.tags && options.tags.length > 0) {
      formData.append('tags', options.tags.join(','));
    }

    const response = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.warn('Cloudinary upload warning:', errorData);
      throw new Error(errorData?.error?.message || `Cloudinary upload failed with status ${response.status}`);
    }

    const data = await response.json();
    if (data && data.secure_url) {
      return ensureAutoOptimizedCloudinaryUrl(data.secure_url);
    }
    throw new Error('No secure_url returned from Cloudinary');
  } catch (error) {
    console.warn('Direct Cloudinary upload error, falling back to local compression:', error);
    // Fallback: Dynamically compress to base64 using canvas helper if Cloudinary fails
    const { compressImageFile } = await import('./imageCompressor');
    if (file instanceof File) {
      return await compressImageFile(file, 800, 0.75);
    }
    return '';
  }
}

/**
 * Unsigned upload to Cloudinary for videos with real-time progress tracking.
 * Uses resource_type = 'video'.
 */
export function uploadVideoToCloudinary(
  file: File,
  options: CloudinaryUploadOptions = {},
  onProgress?: VideoUploadProgressCallback
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }

    const xhr = new XMLHttpRequest();
    const formData = new FormData();

    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    if (options.folder) {
      formData.append('folder', options.folder);
    } else {
      formData.append('folder', 'touza_videos');
    }

    if (options.tags && options.tags.length > 0) {
      formData.append('tags', options.tags.join(','));
    }

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        const percent = Math.round((e.loaded / e.total) * 100);
        onProgress({ loaded: e.loaded, total: e.total, percent });
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          if (response && response.secure_url) {
            resolve(response.secure_url);
          } else {
            reject(new Error('No secure_url in Cloudinary response'));
          }
        } catch {
          reject(new Error('Failed to parse Cloudinary response'));
        }
      } else {
        try {
          const errResp = JSON.parse(xhr.responseText);
          reject(new Error(errResp?.error?.message || `Video upload failed with status ${xhr.status}`));
        } catch {
          reject(new Error(`Video upload failed with status ${xhr.status}`));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error during video upload to Cloudinary'));
    };

    xhr.ontimeout = () => {
      reject(new Error('Video upload timed out'));
    };

    xhr.open('POST', CLOUDINARY_VIDEO_UPLOAD_URL, true);
    xhr.send(formData);
  });
}

/**
 * Formats a Cloudinary image URL with auto-format (f_auto), auto-quality (q_auto),
 * width scaling, progressive rendering, and DPR auto for lightning-fast image delivery.
 */
export function getOptimizedImageUrl(
  url: string,
  options?: {
    width?: number;
    height?: number;
    crop?: 'fill' | 'scale' | 'fit' | 'limit' | 'thumb';
    quality?: 'auto' | 'auto:good' | 'auto:eco' | 'auto:low' | string;
    format?: 'auto' | string;
  }
): string {
  if (!url || typeof url !== 'string') return '';

  // Only apply transformations if url is from Cloudinary
  if (!url.includes('res.cloudinary.com') && !url.includes('cloudinary.com')) {
    return url;
  }

  // If URL already contains full width or video transformations right after upload/
  if (url.includes('/video/')) {
    return url;
  }

  const width = options?.width || 500;
  const quality = options?.quality || 'auto:good';
  const format = options?.format || 'auto';
  const crop = options?.crop || 'limit';

  const transformParts = [`f_${format}`, `q_${quality}`, `w_${width}`, `c_${crop}`, 'fl_progressive', 'dpr_auto'];
  if (options?.height) {
    transformParts.push(`h_${options.height}`);
  }
  const transformString = transformParts.join(',');

  if (url.includes('/upload/f_auto,q_auto/')) {
    if (!options) return url;
    return url.replace('/upload/f_auto,q_auto/', `/upload/${transformString}/`);
  }

  if (url.includes('/upload/')) {
    return url.replace('/upload/', `/upload/${transformString}/`);
  }

  return url;
}

export const DEFAULT_HEADER_VIDEO_URL =
  'https://res.cloudinary.com/qazdrpcx/video/upload/v1787597556/touza_header_videos/vz8cdlvj2jqpd9ueb9uk.mp4';

/**
 * Formats a Cloudinary video URL or public ID to deliver a reliable, directly playable HTTPS video URL.
 * Guarantees compatibility with iOS Safari, Chrome, and desktop browsers.
 */
export function getOptimizedVideoUrl(url?: string): string {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return DEFAULT_HEADER_VIDEO_URL;
  }
  let formattedUrl = url.trim();

  // If passed an old deprecated/deleted Cloudinary video asset ID
  if (formattedUrl.includes('pb3glshlcqx6jhuapcpq')) {
    return DEFAULT_HEADER_VIDEO_URL;
  }

  // If passed an insecure http URL, upgrade to https
  if (formattedUrl.startsWith('http://')) {
    formattedUrl = 'https://' + formattedUrl.slice(7);
  }

  // If given a public ID or relative path without full domain
  if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
    // If it's a local static path (like /desert-video.mp4 or /soli.mp4)
    if (formattedUrl.startsWith('/') && !formattedUrl.includes('touza_')) {
      return formattedUrl;
    }
    // Clean leading slashes
    const cleanPublicId = formattedUrl.replace(/^\/+/, '');
    const hasExt = cleanPublicId.match(/\.(mp4|webm|mov|ogg|m4v)$/i);
    const finalId = hasExt ? cleanPublicId : `${cleanPublicId}.mp4`;
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/video/upload/${finalId}`;
  }

  // Handle Cloudinary domain URLs
  if (formattedUrl.includes('res.cloudinary.com') || formattedUrl.includes('cloudinary.com')) {
    // Fix accidental image/upload resource type for video files
    if (formattedUrl.includes('/image/upload/') && (
      formattedUrl.match(/\.(mp4|webm|mov|ogg|m4v)(\?.*)?$/i) ||
      formattedUrl.includes('touza_header_videos') ||
      formattedUrl.includes('touza_videos')
    )) {
      formattedUrl = formattedUrl.replace('/image/upload/', '/video/upload/');
    }

    // Clean up redundant or conflicting transformations so native H.264 MP4 streams directly
    formattedUrl = formattedUrl.replace(
      /\/upload\/(q_auto,f_mp4|f_auto,q_auto,vc_auto|f_mp4|q_auto)\//,
      '/upload/'
    );
  }

  return formattedUrl;
}

