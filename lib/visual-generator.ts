import sharp from 'sharp';
import { supabase } from './supabase';
import type { AnalysisResult } from './supabase';

const SIGNED_URL_EXPIRY = 60 * 60 * 24 * 365; // 1 year in seconds

/**
 * Generate annotated visual guides for each implementation step.
 * Takes the original extracted frames and overlays highlights, arrows, and labels.
 * Uploads to the 'visuals' bucket and returns signed URLs (valid 1 year).
 */
export async function generateVisualGuides(
  analysisId: string,
  result: AnalysisResult,
): Promise<AnalysisResult> {
  const updatedResult = { ...result };
  const phases = updatedResult.implementation_plan.phases;

  for (let phaseIdx = 0; phaseIdx < phases.length; phaseIdx++) {
    const phase = phases[phaseIdx];

    for (let stepIdx = 0; stepIdx < phase.steps.length; stepIdx++) {
      const step = phase.steps[stepIdx];

      // Get the frame for this step — stored as storage path in frame_urls
      const frameRef = result.frame_urls[step.frame_index] || result.frame_urls[0];
      if (!frameRef) continue;

      try {
        // Download frame via service-role client (private bucket)
        const frameStoragePath = extractStoragePath(frameRef);
        const { data: frameData, error: downloadError } = await supabase.storage
          .from('videos')
          .download(frameStoragePath);

        if (downloadError || !frameData) {
          console.error(`[Visual] Frame downloaden mislukt: ${downloadError?.message}`);
          continue;
        }

        const frameBuffer = Buffer.from(await frameData.arrayBuffer());

        // Generate before/after images
        const beforeBuffer = await createBeforeImage(frameBuffer, step.location, phase.color);
        const afterBuffer = await createAfterImage(frameBuffer, step.title, step.location, phase.color, stepIdx + 1);

        const beforePath = `${analysisId}/phase-${phaseIdx + 1}-step-${stepIdx + 1}-before.jpg`;
        const afterPath = `${analysisId}/phase-${phaseIdx + 1}-step-${stepIdx + 1}-after.jpg`;

        // Upload both
        const [beforeUpload, afterUpload] = await Promise.all([
          supabase.storage.from('visuals').upload(beforePath, beforeBuffer, { contentType: 'image/jpeg', upsert: true }),
          supabase.storage.from('visuals').upload(afterPath, afterBuffer, { contentType: 'image/jpeg', upsert: true }),
        ]);

        // Generate signed read URLs (1 year validity)
        if (!beforeUpload.error) {
          const { data: signedBefore } = await supabase.storage
            .from('visuals')
            .createSignedUrl(beforePath, SIGNED_URL_EXPIRY);
          if (signedBefore) step.visual_before_url = signedBefore.signedUrl;
        }

        if (!afterUpload.error) {
          const { data: signedAfter } = await supabase.storage
            .from('visuals')
            .createSignedUrl(afterPath, SIGNED_URL_EXPIRY);
          if (signedAfter) step.visual_after_url = signedAfter.signedUrl;
        }
      } catch (err) {
        console.error(`[Visual] Fout bij fase ${phaseIdx + 1}, stap ${stepIdx + 1}:`, err);
        // Non-critical — continue with other steps
      }
    }
  }

  return updatedResult;
}

function extractStoragePath(urlOrPath: string): string {
  if (!urlOrPath.startsWith('http')) return urlOrPath;
  const match = urlOrPath.match(/\/storage\/v1\/object\/(?:sign\/|public\/)?[^/]+\/(.+?)(?:\?|$)/);
  if (match) return match[1];
  return urlOrPath;
}

async function createBeforeImage(frameBuffer: Buffer, location: string, color: string): Promise<Buffer> {
  const metadata = await sharp(frameBuffer).metadata();
  const width = metadata.width || 1280;
  const height = metadata.height || 720;

  const overlayWidth = Math.round(width * 0.6);
  const overlayHeight = Math.round(height * 0.5);
  const overlayX = Math.round((width - overlayWidth) / 2);
  const overlayY = Math.round((height - overlayHeight) / 2);
  const displayText = escapeXml(location.slice(0, 50));
  const labelWidth = Math.min(width - 40, 500);

  const svgOverlay = Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect x="${overlayX}" y="${overlayY}" width="${overlayWidth}" height="${overlayHeight}"
            fill="${color}" fill-opacity="0.15"
            stroke="${color}" stroke-width="3" stroke-dasharray="12,6" rx="8" ry="8"/>
      <line x1="${overlayX}" y1="${overlayY}" x2="${overlayX + 30}" y2="${overlayY}" stroke="${color}" stroke-width="4"/>
      <line x1="${overlayX}" y1="${overlayY}" x2="${overlayX}" y2="${overlayY + 30}" stroke="${color}" stroke-width="4"/>
      <line x1="${overlayX + overlayWidth}" y1="${overlayY}" x2="${overlayX + overlayWidth - 30}" y2="${overlayY}" stroke="${color}" stroke-width="4"/>
      <line x1="${overlayX + overlayWidth}" y1="${overlayY}" x2="${overlayX + overlayWidth}" y2="${overlayY + 30}" stroke="${color}" stroke-width="4"/>
      <line x1="${overlayX}" y1="${overlayY + overlayHeight}" x2="${overlayX + 30}" y2="${overlayY + overlayHeight}" stroke="${color}" stroke-width="4"/>
      <line x1="${overlayX}" y1="${overlayY + overlayHeight}" x2="${overlayX}" y2="${overlayY + overlayHeight - 30}" stroke="${color}" stroke-width="4"/>
      <line x1="${overlayX + overlayWidth}" y1="${overlayY + overlayHeight}" x2="${overlayX + overlayWidth - 30}" y2="${overlayY + overlayHeight}" stroke="${color}" stroke-width="4"/>
      <line x1="${overlayX + overlayWidth}" y1="${overlayY + overlayHeight}" x2="${overlayX + overlayWidth}" y2="${overlayY + overlayHeight - 30}" stroke="${color}" stroke-width="4"/>
      <rect x="${(width - labelWidth) / 2}" y="${height - 60}" width="${labelWidth}" height="40"
            fill="rgba(0,0,0,0.75)" rx="6" ry="6"/>
      <text x="${width / 2}" y="${height - 34}"
            text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="white">
        ${displayText}
      </text>
      <rect x="20" y="20" width="180" height="32" fill="${color}" rx="6" ry="6"/>
      <text x="110" y="42" text-anchor="middle" font-family="Arial, sans-serif"
            font-size="13" font-weight="bold" fill="white">
        HUIDIGE SITUATIE
      </text>
    </svg>
  `);

  return sharp(frameBuffer)
    .composite([{ input: svgOverlay, top: 0, left: 0 }])
    .jpeg({ quality: 85 })
    .toBuffer();
}

async function createAfterImage(
  frameBuffer: Buffer,
  title: string,
  location: string,
  color: string,
  stepNumber: number,
): Promise<Buffer> {
  const metadata = await sharp(frameBuffer).metadata();
  const width = metadata.width || 1280;
  const height = metadata.height || 720;

  const displayTitle = escapeXml(title.slice(0, 45));
  const displayLocation = escapeXml(location.slice(0, 50));
  const labelWidth = Math.min(width - 40, 520);

  const markers = [
    { x: width * 0.25, y: height * 0.35 },
    { x: width * 0.75, y: height * 0.35 },
    { x: width * 0.5, y: height * 0.6 },
  ];

  const svgOverlay = Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="rgba(0,0,0,0.2)"/>
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto" fill="${color}">
          <polygon points="0 0, 10 3.5, 0 7" />
        </marker>
      </defs>
      <line x1="${width * 0.2}" y1="${height * 0.5}" x2="${width * 0.45}" y2="${height * 0.4}"
            stroke="${color}" stroke-width="3" marker-end="url(#arrowhead)" stroke-opacity="0.8"/>
      <line x1="${width * 0.5}" y1="${height * 0.4}" x2="${width * 0.75}" y2="${height * 0.5}"
            stroke="${color}" stroke-width="3" marker-end="url(#arrowhead)" stroke-opacity="0.8"/>
      ${markers.map((m, i) => `
        <circle cx="${m.x}" cy="${m.y}" r="18" fill="${color}" stroke="white" stroke-width="2"/>
        <text x="${m.x}" y="${m.y + 6}" text-anchor="middle" font-family="Arial, sans-serif"
              font-size="16" font-weight="bold" fill="white">${i + 1}</text>
      `).join('')}
      <rect x="${(width - labelWidth) / 2}" y="${height - 90}" width="${labelWidth}" height="70"
            fill="rgba(0,0,0,0.8)" rx="8" ry="8"/>
      <text x="${width / 2}" y="${height - 62}"
            text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="bold"
            fill="${color}">
        Stap ${stepNumber}: ${displayTitle}
      </text>
      <text x="${width / 2}" y="${height - 38}"
            text-anchor="middle" font-family="Arial, sans-serif" font-size="13"
            fill="rgba(255,255,255,0.7)">
        ${displayLocation}
      </text>
      <rect x="20" y="20" width="160" height="32" fill="#34A853" rx="6" ry="6"/>
      <text x="100" y="42" text-anchor="middle" font-family="Arial, sans-serif"
            font-size="13" font-weight="bold" fill="white">
        AANBEVELING
      </text>
    </svg>
  `);

  return sharp(frameBuffer)
    .composite([{ input: svgOverlay, top: 0, left: 0 }])
    .jpeg({ quality: 85 })
    .toBuffer();
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
