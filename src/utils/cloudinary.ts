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
 * Unsigned upload to Cloudinary for images. Returns the secure_url string.
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
      return data.secure_url;
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

  // If URL already contains transformations right after upload/
  if (url.includes('/upload/f_auto') || url.includes('/upload/q_auto') || url.includes('/video/')) {
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

  if (url.includes('/upload/')) {
    return url.replace('/upload/', `/upload/${transformString}/`);
  }

  return url;
}

/**
 * Formats a Cloudinary video URL to deliver a universally supported MP4 video
 * with auto quality optimization (q_auto, f_mp4) and .mp4 extension for HTML5 video compatibility.
 */
export function getOptimizedVideoUrl(url: string): string {
  if (!url || typeof url !== 'string') return '';
  if (!url.includes('res.cloudinary.com') && !url.includes('cloudinary.com')) {
    return url;
  }

  let formattedUrl = url;

  // Insert q_auto,f_mp4 if no transformation is present
  if (!formattedUrl.includes('/upload/q_auto') && !formattedUrl.includes('/upload/f_mp4') && !formattedUrl.includes('/upload/f_auto')) {
    formattedUrl = formattedUrl.replace('/upload/', '/upload/q_auto,f_mp4/');
  } else if (formattedUrl.includes('/upload/f_auto,q_auto,vc_auto/')) {
    formattedUrl = formattedUrl.replace('/upload/f_auto,q_auto,vc_auto/', '/upload/q_auto,f_mp4/');
  }

  // Ensure URL ends with .mp4 extension so HTML5 video tag recognizes MIME type
  if (!formattedUrl.toLowerCase().endsWith('.mp4')) {
    if (/\.[a-zA-Z0-9]+$/.test(formattedUrl)) {
      formattedUrl = formattedUrl.replace(/\.[a-zA-Z0-9]+$/, '.mp4');
    } else {
      formattedUrl += '.mp4';
    }
  }

  return formattedUrl;
}

