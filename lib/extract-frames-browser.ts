/**
 * Extract frames from a video in the browser using canvas.
 * Returns an array of Blobs (JPEG images) at evenly spaced intervals.
 */
export async function extractFramesBrowser(
  file: File,
  frameCount: number = 10,
  onProgress?: (pct: number) => void,
): Promise<Blob[]> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';

    const objectUrl = URL.createObjectURL(file);
    video.src = objectUrl;

    const frames: Blob[] = [];
    let currentFrame = 0;
    let timestamps: number[] = [];

    video.onloadedmetadata = () => {
      const duration = video.duration;
      if (!duration || !isFinite(duration)) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Kan videoduur niet bepalen'));
        return;
      }

      // Calculate timestamps at even intervals
      const interval = duration / (frameCount + 1);
      timestamps = Array.from({ length: frameCount }, (_, i) => interval * (i + 1));

      // Seek to first timestamp
      video.currentTime = timestamps[0];
    };

    video.onseeked = async () => {
      if (currentFrame >= timestamps.length) return;

      // Draw current frame to canvas
      const canvas = document.createElement('canvas');
      // Cap resolution at 1280px for reasonable file sizes
      const maxDim = 1280;
      let w = video.videoWidth;
      let h = video.videoHeight;
      if (w > maxDim || h > maxDim) {
        const scale = maxDim / Math.max(w, h);
        w = Math.round(w * scale);
        h = Math.round(h * scale);
      }
      canvas.width = w;
      canvas.height = h;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Canvas context niet beschikbaar'));
        return;
      }

      ctx.drawImage(video, 0, 0, w, h);

      // Convert canvas to JPEG blob
      const blob = await new Promise<Blob | null>((res) =>
        canvas.toBlob(res, 'image/jpeg', 0.85),
      );

      if (blob) {
        frames.push(blob);
      }

      currentFrame++;
      onProgress?.(Math.round((currentFrame / timestamps.length) * 100));

      if (currentFrame < timestamps.length) {
        // Seek to next timestamp
        video.currentTime = timestamps[currentFrame];
      } else {
        // All frames extracted
        URL.revokeObjectURL(objectUrl);
        resolve(frames);
      }
    };

    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Video kon niet worden geladen'));
    };
  });
}
