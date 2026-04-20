/**
 * Client-side video compression using browser MediaRecorder API.
 * Re-encodes the video at a lower bitrate to stay under Supabase's 50MB limit.
 */

const MAX_SIZE_BYTES = 45 * 1024 * 1024; // 45MB target (safe margin under 50MB)

export async function compressVideo(
  file: File,
  onProgress?: (pct: number) => void,
): Promise<File> {
  // If already under limit, return as-is
  if (file.size <= MAX_SIZE_BYTES) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;

    const objectUrl = URL.createObjectURL(file);
    video.src = objectUrl;

    video.onloadedmetadata = () => {
      const duration = video.duration;
      if (!duration || !isFinite(duration)) {
        // Can't determine duration, return original
        URL.revokeObjectURL(objectUrl);
        resolve(file);
        return;
      }

      // Calculate target bitrate to hit ~40MB
      // totalBits = targetBytes * 8, bitrate = totalBits / duration
      const targetBytes = 40 * 1024 * 1024;
      const targetBitsPerSecond = Math.floor((targetBytes * 8) / duration);
      // Clamp between 500kbps and 4Mbps
      const videoBitsPerSecond = Math.max(500_000, Math.min(targetBitsPerSecond, 4_000_000));

      // Set up canvas for re-encoding
      const canvas = document.createElement('canvas');
      // Scale down if resolution is very high
      const maxDim = 1280;
      let w = video.videoWidth;
      let h = video.videoHeight;
      if (w > maxDim || h > maxDim) {
        const scale = maxDim / Math.max(w, h);
        w = Math.round(w * scale);
        h = Math.round(h * scale);
      }
      // Ensure even dimensions (required by some codecs)
      w = w % 2 === 0 ? w : w - 1;
      h = h % 2 === 0 ? h : h - 1;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;

      // Capture stream from canvas
      const stream = canvas.captureStream(24); // 24 fps

      // Add audio track if video has audio
      try {
        const audioCtx = new AudioContext();
        const source = audioCtx.createMediaElementSource(video);
        const dest = audioCtx.createMediaStreamDestination();
        source.connect(dest);
        source.connect(audioCtx.destination); // needed for playback
        const audioTrack = dest.stream.getAudioTracks()[0];
        if (audioTrack) {
          stream.addTrack(audioTrack);
        }
      } catch {
        // No audio or audio capture not supported — continue without
      }

      // Set up MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : MediaRecorder.isTypeSupported('video/webm;codecs=vp8')
          ? 'video/webm;codecs=vp8'
          : 'video/webm';

      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond,
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        URL.revokeObjectURL(objectUrl);
        const blob = new Blob(chunks, { type: 'video/webm' });
        const compressedFile = new File(
          [blob],
          file.name.replace(/\.[^.]+$/, '.webm'),
          { type: 'video/webm' },
        );
        resolve(compressedFile);
      };

      recorder.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        // If compression fails, return original
        resolve(file);
      };

      // Draw frames to canvas as video plays
      let animFrame: number;
      const drawFrame = () => {
        if (video.paused || video.ended) return;
        ctx.drawImage(video, 0, 0, w, h);
        if (onProgress && duration) {
          const pct = Math.round((video.currentTime / duration) * 100);
          onProgress(pct);
        }
        animFrame = requestAnimationFrame(drawFrame);
      };

      video.onplay = () => {
        recorder.start(100); // collect data every 100ms
        drawFrame();
      };

      video.onended = () => {
        cancelAnimationFrame(animFrame);
        recorder.stop();
        stream.getTracks().forEach((t) => t.stop());
      };

      video.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(file); // fallback to original
      };

      // Start playback (triggers encoding)
      video.play().catch(() => {
        URL.revokeObjectURL(objectUrl);
        resolve(file); // fallback to original
      });
    };

    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Video kon niet worden geladen voor compressie'));
    };
  });
}
