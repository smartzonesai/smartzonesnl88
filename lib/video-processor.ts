import { supabase } from './supabase';
import { tmpdir } from 'os';
import { join } from 'path';
import { writeFile, readFile, unlink, mkdir } from 'fs/promises';
import { randomUUID } from 'crypto';

async function getFFmpeg() {
  const ffmpeg = await import('fluent-ffmpeg');
  return ffmpeg.default;
}

/**
 * Extract key frames from a video stored in Supabase.
 * Downloads the video using the service-role client (private bucket),
 * extracts frames with ffmpeg, uploads them back to the 'videos' bucket.
 */
export async function extractFrames(
  videoUrl: string,
  analysisId: string,
  frameCount: number = 10,
): Promise<string[]> {
  const workDir = join(tmpdir(), `sz-${analysisId}`);
  await mkdir(workDir, { recursive: true });

  const videoPath = join(workDir, 'input.mp4');
  const framesDir = join(workDir, 'frames');
  await mkdir(framesDir, { recursive: true });

  try {
    // Download video from Supabase Storage via service-role client (works with private bucket)
    const { data: videoData, error: downloadError } = await supabase.storage
      .from('videos')
      .download(videoUrl);

    if (downloadError || !videoData) {
      throw new Error(`Video downloaden mislukt: ${downloadError?.message}`);
    }

    const buffer = Buffer.from(await videoData.arrayBuffer());
    await writeFile(videoPath, buffer);

    const ffmpeg = await getFFmpeg();
    const duration = await getVideoDuration(ffmpeg, videoPath);
    const interval = duration / (frameCount + 1);

    // Extract frames at regular intervals
    const framePromises: Promise<void>[] = [];
    for (let i = 1; i <= frameCount; i++) {
      const timestamp = interval * i;
      const outputPath = join(framesDir, `frame-${String(i).padStart(3, '0')}.jpg`);
      framePromises.push(extractSingleFrame(ffmpeg, videoPath, outputPath, timestamp));
    }
    await Promise.all(framePromises);

    // Upload frames to 'videos' bucket (same bucket, organised by analysisId folder)
    const frameStoragePaths: string[] = [];
    for (let i = 1; i <= frameCount; i++) {
      const framePath = join(framesDir, `frame-${String(i).padStart(3, '0')}.jpg`);

      let frameBuffer: Buffer;
      try {
        frameBuffer = await readFile(framePath);
      } catch {
        continue;
      }

      const storagePath = `${analysisId}/frame-${String(i).padStart(3, '0')}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('videos')
        .upload(storagePath, frameBuffer, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (!uploadError) {
        frameStoragePaths.push(storagePath);
      }
    }

    return frameStoragePaths;
  } finally {
    await cleanupDir(workDir);
  }
}

function getVideoDuration(ffmpeg: typeof import('fluent-ffmpeg'), videoPath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err: Error | null, metadata: { format?: { duration?: number } }) => {
      if (err) reject(err);
      else resolve(metadata.format?.duration || 30);
    });
  });
}

function extractSingleFrame(
  ffmpeg: typeof import('fluent-ffmpeg'),
  videoPath: string,
  outputPath: string,
  timestamp: number,
): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .seekInput(timestamp)
      .frames(1)
      .output(outputPath)
      .outputOptions(['-q:v', '2'])
      .on('end', () => resolve())
      .on('error', (err: Error) => reject(err))
      .run();
  });
}

async function cleanupDir(dir: string) {
  try {
    const { readdir } = await import('fs/promises');
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        await cleanupDir(fullPath);
      } else {
        await unlink(fullPath);
      }
    }
    const { rmdir } = await import('fs/promises');
    await rmdir(dir);
  } catch {
    // Best effort cleanup
  }
}

/**
 * Download a frame from Supabase Storage via service-role client and convert to base64.
 * Works with private buckets — does NOT do a public fetch().
 *
 * Accepts either a storage path (e.g. "analysisId/frame-001.jpg")
 * or a full Supabase storage URL (parses the path from it).
 */
export async function frameUrlToBase64(urlOrPath: string): Promise<string> {
  // Extract storage path from full URL if needed
  const storagePath = extractStoragePath(urlOrPath);

  // Try videos bucket first, fall back to the URL itself for legacy public frames
  const { data, error } = await supabase.storage
    .from('videos')
    .download(storagePath);

  if (error || !data) {
    // Fallback: try a regular fetch (for backward compatibility with public URLs)
    console.warn(`[frameUrlToBase64] Storage download failed, trying fetch: ${storagePath}`);
    const response = await fetch(urlOrPath);
    if (!response.ok) {
      throw new Error(`Frame ophalen mislukt: ${response.status} ${response.statusText}`);
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    return buffer.toString('base64');
  }

  const buffer = Buffer.from(await data.arrayBuffer());
  return buffer.toString('base64');
}

/**
 * Extract the storage path from either a raw path or a full Supabase URL.
 * e.g. "https://xxx.supabase.co/storage/v1/object/videos/abc/frame-001.jpg"
 *   → "abc/frame-001.jpg"
 */
function extractStoragePath(urlOrPath: string): string {
  if (!urlOrPath.startsWith('http')) return urlOrPath;

  // Match pattern: /storage/v1/object/(sign|public)/<bucket>/<path>
  const match = urlOrPath.match(/\/storage\/v1\/object\/(?:sign\/|public\/)?[^/]+\/(.+?)(?:\?|$)/);
  if (match) return match[1];

  // Fallback: return as-is
  return urlOrPath;
}
