import { auth } from '../firebase';

export const CLOUDINARY_CLOUD_NAME =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CLOUDINARY_CLOUD_NAME) || 's1vv6dqw';
export const CLOUDINARY_UPLOAD_PRESET =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CLOUDINARY_UPLOAD_PRESET) || 'tooooza_img';
export const CLOUDINARY_API_KEY =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CLOUDINARY_API_KEY) || '571788221518155';

export const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
export const CLOUDINARY_VIDEO_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`;

export interface CloudinaryUploadOptions {
  folder?: string;
  tags?: string[];
}

export interface VideoUploadProgressCallback {
  (progress: { loaded: number; total: number; percent: number }): void;
}

export type MediaUploadProgressCallback = (progress: { loaded: number; total: number; percent: number }) => void;

export interface CloudMediaItem {
  id: string;
  url: string;
  publicId?: string;
  originalName: string;
  format?: string;
  bytes?: number;
  width?: number;
  height?: number;
  folder?: string;
  resourceType: 'image' | 'video';
  uploadedAt: string;
}

/**
 * Universal direct upload to Cloudinary for images and videos with real-time progress tracking.
 */
export function uploadMediaToCloudinary(
  file: File,
  options: CloudinaryUploadOptions = {},
  onProgress?: MediaUploadProgressCallback
): Promise<CloudMediaItem> {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }

    const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov|ogg|m4v)$/i.test(file.name);
    const endpoint = isVideo ? CLOUDINARY_VIDEO_UPLOAD_URL : CLOUDINARY_UPLOAD_URL;

    const xhr = new XMLHttpRequest();
    const formData = new FormData();

    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    if (CLOUDINARY_API_KEY) {
      formData.append('api_key', CLOUDINARY_API_KEY);
    }

    if (options.folder && options.folder !== 'tooooza_img') {
      formData.append('folder', options.folder);
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
          const data = JSON.parse(xhr.responseText);
          if (data && data.secure_url) {
            const finalUrl = isVideo
              ? data.secure_url
              : ensureAutoOptimizedCloudinaryUrl(data.secure_url);

            const item: CloudMediaItem = {
              id: data.asset_id || data.public_id || 'media-' + Date.now(),
              url: finalUrl,
              publicId: data.public_id,
              originalName: file.name,
              format: data.format || (file.name.split('.').pop() || ''),
              bytes: data.bytes || file.size,
              width: data.width,
              height: data.height,
              folder: options.folder || 'tooooza_img',
              resourceType: isVideo ? 'video' : 'image',
              uploadedAt: new Date().toISOString(),
            };
            resolve(item);
          } else {
            reject(new Error('No secure_url received from Cloudinary'));
          }
        } catch {
          reject(new Error('Failed to parse Cloudinary response'));
        }
      } else {
        try {
          const errResp = JSON.parse(xhr.responseText);
          reject(new Error(errResp?.error?.message || `Upload failed with status ${xhr.status}`));
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error during upload to Cloudinary'));
    };

    xhr.open('POST', endpoint, true);
    xhr.send(formData);
  });
}

/**
 * Ensures any Cloudinary image URL contains f_auto,q_auto right after /image/upload/ or /upload/ (for images).
 * E.g.:
 * https://res.cloudinary.com/s1vv6dqw/image/upload/v12345/abc.jpg
 * -> https://res.cloudinary.com/s1vv6dqw/image/upload/f_auto,q_auto/v12345/abc.jpg
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
 */
export async function uploadToCloudinary(
  file: File | Blob,
  options: CloudinaryUploadOptions = {}
): Promise<string> {
  if (!file) return '';

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  if (CLOUDINARY_API_KEY) {
    formData.append('api_key', CLOUDINARY_API_KEY);
  }

  // Apply custom folder if specified and different from the preset's configured asset folder
  if (options.folder && options.folder !== 'tooooza_img') {
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
    console.error('Cloudinary upload error:', errorData);
    throw new Error(errorData?.error?.message || `فشل رفع الصورة إلى Cloudinary (كود ${response.status})`);
  }

  const data = await response.json();
  if (data && data.secure_url) {
    return ensureAutoOptimizedCloudinaryUrl(data.secure_url);
  }
  throw new Error('لم يتم استلام رابط صالح من Cloudinary');
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
    if (CLOUDINARY_API_KEY) {
      formData.append('api_key', CLOUDINARY_API_KEY);
    }

    if (options.folder && options.folder !== 'tooooza_img') {
      formData.append('folder', options.folder);
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
  'https://res.cloudinary.com/s1vv6dqw/video/upload/ac_none,vc_h264,q_auto/v1789030762/touza_header_videos/pmec37wvaue03zau8f4z.mp4?v=1789030817345';

/**
 * Formats a Cloudinary video URL or public ID to deliver a reliable, directly playable HTTPS video URL.
 * Strips the audio track (`ac_none`) and ensures H.264 encoding (`vc_h264`) so Safari on macOS / iOS
 * never classifies it as 'Media with sound', ensuring 100% automatic playback without user gestures.
 */
export function getOptimizedVideoUrl(url?: string): string {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return DEFAULT_HEADER_VIDEO_URL;
  }
  let formattedUrl = url.trim();

  // If passed an old deprecated/deleted Cloudinary video asset ID or invalid cloud
  if (
    formattedUrl.includes('pb3glshlcqx6jhuapcpq') ||
    formattedUrl.includes('vz8cdlvj2jqpd9ueb9uk') ||
    formattedUrl.includes('qazdrpcx')
  ) {
    return DEFAULT_HEADER_VIDEO_URL;
  }

  // If passed an insecure http URL, upgrade to https
  if (formattedUrl.startsWith('http://')) {
    formattedUrl = 'https://' + formattedUrl.slice(7);
  }

  // If given a public ID or relative path without full domain
  if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
    // If it's a local static path (like /hero-video.mp4, /desert-video.mp4 or /soli.mp4)
    if (formattedUrl.startsWith('/') && !formattedUrl.includes('touza_')) {
      return formattedUrl;
    }
    // Clean leading slashes
    const cleanPublicId = formattedUrl.replace(/^\/+/, '');
    const hasExt = cleanPublicId.match(/\.(mp4|webm|mov|ogg|m4v)$/i);
    const finalId = hasExt ? cleanPublicId : `${cleanPublicId}.mp4`;
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/video/upload/ac_none,vc_h264,q_auto/${finalId}`;
  }

  // Handle Cloudinary domain URLs
  if (formattedUrl.includes('res.cloudinary.com') || formattedUrl.includes('cloudinary.com')) {
    // Fix accidental image/upload resource type for video files
    if (formattedUrl.includes('/image/upload/')) {
      formattedUrl = formattedUrl.replace('/image/upload/', '/video/upload/');
    }

    // Ensure Cloudinary video upload URL has ac_none,vc_h264,q_auto for Safari macOS autoplay
    if (formattedUrl.includes('/video/upload/')) {
      // If already contains ac_none, keep as is or normalize
      if (!formattedUrl.includes('ac_none')) {
        const uploadIdx = formattedUrl.indexOf('/video/upload/');
        const base = formattedUrl.substring(0, uploadIdx + '/video/upload/'.length);
        const afterUpload = formattedUrl.substring(uploadIdx + '/video/upload/'.length);
        const parts = afterUpload.split('/');
        let startIndex = 0;
        const knownPrefixes = ['c_', 'w_', 'h_', 'q_', 'f_', 'so_', 'eo_', 'ac_', 'vc_', 'e_', 'b_', 'co_', 'fl_', 'g_', 'l_', 'u_', 'z_', 'dpr_', 'ar_', 'du_', 'fps_', 'br_'];
        const isTransformationSegment = (seg: string) => {
          if (!seg || /^v\d+$/.test(seg)) return false;
          if (seg.includes(',')) return true;
          return knownPrefixes.some((p) => seg.startsWith(p));
        };
        if (parts.length > 1 && isTransformationSegment(parts[0])) {
          startIndex = 1;
        }
        const rest = parts.slice(startIndex).join('/');
        formattedUrl = `${base}ac_none,vc_h264,q_auto/${rest}`;
      }
    }
  }

  return formattedUrl;
}

/**
 * Dynamically derives a video poster frame URL matching the current active video.
 * If the video is hosted on Cloudinary, it uses frame 0 (so_0,f_jpg,q_auto) of the exact video.
 * If not available, returns null so the browser auto-selects the first frame and never shows an outdated thumbnail.
 */
export function getVideoPosterUrl(videoUrl?: string | null): string | null {
  if (!videoUrl || typeof videoUrl !== 'string') return null;
  const trimmed = videoUrl.trim();
  if (!trimmed) return null;

  // Cloudinary video URL: dynamically derive frame 0 thumbnail image of this exact active video using .jpg transformation
  if (trimmed.includes('cloudinary.com') && (trimmed.includes('/video/upload/') || trimmed.includes('/image/upload/'))) {
    const url = trimmed.replace('/image/upload/', '/video/upload/');
    const uploadIdx = url.indexOf('/video/upload/');
    const base = url.substring(0, uploadIdx + '/video/upload/'.length);
    const afterUpload = url.substring(uploadIdx + '/video/upload/'.length);

    const parts = afterUpload.split('/');
    let startIndex = 0;

    const knownPrefixes = ['c_', 'w_', 'h_', 'q_', 'f_', 'so_', 'eo_', 'ac_', 'vc_', 'e_', 'b_', 'co_', 'fl_', 'g_', 'l_', 'u_', 'z_', 'dpr_', 'ar_', 'du_', 'fps_', 'br_'];
    const isTransformationSegment = (seg: string) => {
      if (!seg || /^v\d+$/.test(seg)) return false;
      if (seg.includes(',')) return true;
      return knownPrefixes.some((p) => seg.startsWith(p));
    };

    if (parts.length > 1 && isTransformationSegment(parts[0])) {
      startIndex = 1;
    }

    const rest = parts.slice(startIndex).join('/');
    const restJpg = rest.replace(/\.(mp4|webm|mov|ogg|m4v)(\?.*)?$/i, (_match, _ext, query) => '.jpg' + (query || ''));
    return `${base}so_0,f_jpg,q_auto/${restJpg}`;
  }

  // Return null so the browser auto-selects the first frame of the active video
  return null;
}

/**
 * Appends a cache-busting timestamp query parameter (?v=timestamp or &v=timestamp)
 * to a video or media URL so browsers treat it as a fresh resource and refresh immediately.
 */
export function withCacheBuster(url?: string | null, timestamp: number = Date.now()): string {
  if (!url || typeof url !== 'string') return url || '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // Remove any existing v= parameter to avoid duplicate queries
  const withoutV = trimmed.replace(/([?&])v=\d+(&|$)/, '$1').replace(/[?&]$/, '');
  const separator = withoutV.includes('?') ? '&' : '?';
  return `${withoutV}${separator}v=${timestamp}`;
}

/**
 * Strips on-the-fly transformation segments from a Cloudinary video URL to retrieve
 * the raw uploaded video stream. This provides an immediate fallback for newly uploaded videos
 * while Cloudinary is still encoding server-side transformation derivatives.
 */
export function getRawVideoUrl(videoUrl?: string | null): string | undefined {
  if (!videoUrl || typeof videoUrl !== 'string') return undefined;
  const trimmed = videoUrl.trim();
  if (!trimmed) return undefined;

  if (trimmed.includes('cloudinary.com') && trimmed.includes('/video/upload/')) {
    // Strip everything between /video/upload/ and /v1234... or filename
    return trimmed.replace(
      /\/video\/upload\/(?:[a-zA-Z0-9_,:-]+\/)?(v\d+\/.*|[^\/]+$)/,
      '/video/upload/$1'
    );
  }

  return undefined;
}

