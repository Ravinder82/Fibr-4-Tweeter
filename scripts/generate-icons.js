// Generates raster icons from icons/fibr.svg
// Outputs: icons/icon16.png, icon32.png, icon48.png, icon128.jpeg
// Requires: npm i -D sharp

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ICON_DIR = path.resolve(__dirname, '..', 'icons');
const SRC_SVG = path.join(ICON_DIR, 'fibr.svg');

async function ensureSvgExists() {
  if (!fs.existsSync(SRC_SVG)) {
    throw new Error(`Source SVG not found: ${SRC_SVG}`);
  }
}

async function generatePng(size) {
  const out = path.join(ICON_DIR, `icon${size}.png`);
  await sharp(SRC_SVG)
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(out);
  return out;
}

async function generateJpeg(size) {
  const out = path.join(ICON_DIR, `icon${size}.jpeg`);
  await sharp(SRC_SVG)
    .resize(size, size, { fit: 'cover' })
    .jpeg({ quality: 90, mozjpeg: true })
    .toFile(out);
  return out;
}

(async () => {
  try {
    await ensureSvgExists();
    const pngSizes = [16, 32, 48];
    for (const s of pngSizes) {
      const file = await generatePng(s);
      console.log(`✓ Wrote ${file}`);
    }
    const jpeg128 = await generateJpeg(128);
    console.log(`✓ Wrote ${jpeg128}`);
    console.log('All icons generated successfully.');
  } catch (err) {
    console.error('Icon generation failed:', err);
    process.exit(1);
  }
})();
