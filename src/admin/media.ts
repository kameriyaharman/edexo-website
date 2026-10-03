import 'server-only';
import sharp from 'sharp';
import { db, schema } from '@/db';

const MAX_BYTES = 8 * 1024 * 1024;

/** Saves an uploaded image (resized, optimised) and returns its media id. */
export async function saveUpload(file: File, alt = ''): Promise<number> {
  if (file.size > MAX_BYTES) throw new Error('Image is larger than 8 MB');
  if (!/^image\/(png|jpe?g|webp|gif|avif|svg\+xml)$/.test(file.type)) throw new Error('Please upload a PNG, JPG, WEBP, GIF or SVG image');
  const input = Buffer.from(await file.arrayBuffer());

  let data: Buffer = input;
  let mime = file.type;
  let width: number | undefined;
  let height: number | undefined;

  if (file.type === 'image/svg+xml') {
    // keep SVG as-is, but refuse scripts
    if (/<script|on\w+=/i.test(input.toString('utf8'))) throw new Error('SVG contains scripts');
  } else {
    const img = sharp(input, { animated: false }).rotate();
    const meta = await img.metadata();
    const keepAlpha = meta.hasAlpha && (file.type === 'image/png' || file.type === 'image/webp');
    const pipeline = img.resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true });
    const out = keepAlpha
      ? await pipeline.png({ compressionLevel: 9 }).toBuffer({ resolveWithObject: true })
      : await pipeline.jpeg({ quality: 82, mozjpeg: true }).toBuffer({ resolveWithObject: true });
    data = out.data;
    mime = keepAlpha ? 'image/png' : 'image/jpeg';
    width = out.info.width;
    height = out.info.height;
  }

  const [row] = await db.insert(schema.media).values({
    filename: file.name.slice(0, 200), mime, width, height, size: data.length, alt, data,
  }).returning({ id: schema.media.id });
  return row.id;
}
