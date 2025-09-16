import sharp from "sharp";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IMAGES_DIR = path.resolve(__dirname, "../../images");

export async function processAndSaveImage(req, res, next) {
  try {
    if (!req.file) return next();
    await fs.mkdir(IMAGES_DIR, { recursive: true });

    const base = Date.now() + "-" + Math.random().toString(16).slice(2);
    const filename = `${base}.webp`;
    const outPath = path.join(IMAGES_DIR, filename);

    await sharp(req.file.buffer)
      .resize({ width: 800, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outPath);

    req.processedImageFilename = filename; // utilisé par le contrôleur
    next();
  } catch (err) {
    next(err);
  }
}

export async function deleteImageByUrl(imageUrl) {
  try {
    if (!imageUrl) return;
    const name = imageUrl.split("/images/")[1];
    if (!name) return;
    const filePath = path.join(IMAGES_DIR, name);
    console.log("filePath", filePath)
    await fs.unlink(filePath).catch(() => {});
  } catch {}
}
