export const compressImageFile = (
  file: File,
  maxWidth = 800,
  quality = 0.72
): Promise<string> => {
  return new Promise((resolve) => {
    if (!file) {
      resolve('');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) {
        resolve('');
        return;
      }

      const img = new Image();
      img.onload = () => {
        try {
          let currentMaxWidth = maxWidth;
          let currentQuality = quality;

          const renderToJpeg = (targetWidth: number, targetQuality: number): string => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            if (width > targetWidth || height > targetWidth) {
              if (width > height) {
                height = Math.round((height * targetWidth) / width);
                width = targetWidth;
              } else {
                width = Math.round((width * targetWidth) / height);
                height = targetWidth;
              }
            }

            canvas.width = Math.max(width, 1);
            canvas.height = Math.max(height, 1);

            const ctx = canvas.getContext('2d');
            if (!ctx) return '';

            // Fill solid white background so PNGs/transparent images don't turn black
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            return canvas.toDataURL('image/jpeg', targetQuality);
          };

          let result = renderToJpeg(currentMaxWidth, currentQuality);

          // If result exceeds 200KB base64 size (~260,000 chars), compress further to 600px
          if (result.length > 260000) {
            result = renderToJpeg(600, 0.65);
          }

          if (result) {
            resolve(result);
            return;
          }
        } catch (err) {
          console.warn('Canvas compression error:', err);
        }
        resolve(dataUrl);
      };

      img.onerror = () => {
        // Return original dataUrl if img.onerror
        resolve(dataUrl);
      };
      img.src = dataUrl;
    };

    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
};

