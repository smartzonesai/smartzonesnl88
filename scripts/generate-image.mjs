#!/usr/bin/env node
// scripts/generate-image.mjs
import fs from 'node:fs';
import path from 'node:path';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('Error: GEMINI_API_KEY environment variable not set.');
  process.exit(1);
}

const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent?key=${GEMINI_API_KEY}`;

const args = process.argv.slice(2);
function getArg(flag) {
  const i = args.indexOf(flag);
  return i !== -1 && args[i + 1] ? args[i + 1] : null;
}

const prompt = getArg('--prompt');
const outputPath = getArg('--output') || './generated-image.png';
const aspect = getArg('--aspect') || '16:9';

if (!prompt) {
  console.error('Usage: node generate-image.mjs --prompt "..." --output ./path.png [--aspect 16:9]');
  process.exit(1);
}

const fullPrompt = `${prompt}\n\nAspect ratio: ${aspect}. High quality, production-ready.`;

async function generateImage() {
  console.log(`Generating: "${prompt.substring(0, 80)}..."`);
  console.log(`Output: ${outputPath}`);

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: fullPrompt }] }],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error(`API error (${response.status}):`, err);
    process.exit(1);
  }

  const data = await response.json();
  const parts = data.candidates?.[0]?.content?.parts || [];

  for (const part of parts) {
    if (part.inlineData) {
      const buffer = Buffer.from(part.inlineData.data, 'base64');
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(outputPath, buffer);
      console.log(`✓ Saved: ${outputPath} (${(buffer.length / 1024).toFixed(0)}KB)`);
      return;
    }
    if (part.text) {
      console.log('Model response:', part.text);
    }
  }

  console.error('No image was generated. Try adjusting the prompt.');
  process.exit(1);
}

generateImage().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
