/**
 * One-off brand asset generator for FINFIX MOTORS LIMITED.
 * Reads the uploaded logo and produces: full logo, favicon, apple icon, OG image.
 * Run: bun scripts/generate-brand-assets.ts
 */
import sharp from "sharp";
import path from "path";

const SRC = "/home/z/my-project/upload/finfix motors.jpg";
const OUT = "/home/z/my-project/public/images";

const CROP = { left: 195, top: 185, width: 690, height: 690 };

async function main() {
  const meta = await sharp(SRC).metadata();
  console.log(`Source: ${meta.width}x${meta.height}`);

  // 1. Full logo (as uploaded, optimized)
  await sharp(SRC).jpeg({ quality: 92 }).toFile(path.join(OUT, "finfix-logo.jpg"));
  console.log("OK finfix-logo.jpg");

  // 2. Favicon / app icons (tight crop on the emblem)
  await sharp(SRC)
    .extract(CROP)
    .resize(512, 512)
    .png()
    .toFile(path.join(OUT, "finfix-icon.png"));
  await sharp(SRC)
    .extract(CROP)
    .resize(180, 180)
    .png()
    .toFile(path.join(OUT, "finfix-apple-icon.png"));
  console.log("OK finfix-icon.png + finfix-apple-icon.png");

  // 3. Open Graph image 1200x630 — logo centered on its own paper background
  await sharp(SRC)
    .resize(1200, 630, {
      fit: "contain",
      background: { r: 237, g: 236, b: 234 },
    })
    .flatten({ background: { r: 237, g: 236, b: 234 } })
    .jpeg({ quality: 88 })
    .toFile(path.join(OUT, "og-finfix.jpg"));
  console.log("OK og-finfix.jpg");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
