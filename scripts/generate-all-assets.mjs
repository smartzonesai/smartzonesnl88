#!/usr/bin/env node
// scripts/generate-all-assets.mjs
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const manifest = JSON.parse(fs.readFileSync('./image-manifest.json', 'utf-8'));

async function main() {
  for (const asset of manifest.assets) {
    console.log(`\n--- Generating: ${asset.name} ---`);
    try {
      execSync(
        `node scripts/generate-image.mjs --prompt "${asset.prompt.replace(/"/g, '\\"')}" --output "${asset.output}" --aspect "${asset.aspect || '16:9'}"`,
        { stdio: 'inherit' }
      );
    } catch (err) {
      console.error(`Failed to generate ${asset.name}:`, err.message);
    }
    // Rate limiting pause
    await new Promise(r => setTimeout(r, 2000));
  }
  console.log('\n✓ All assets generated.');
}

main();
