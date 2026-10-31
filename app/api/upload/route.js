import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { randomUUID } from 'node:crypto';

const err = (error, status = 400) => NextResponse.json({ error }, { status });
const MAGIC = {
  'image/jpeg': (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  'image/png': (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
  'image/webp': (b) => b.slice(0, 4).toString() === 'RIFF' && b.slice(8, 12).toString() === 'WEBP',
};

export async function POST(req) {
  try {
    const f = (await req.formData()).get('file');
    if (!f || typeof f === 'string') return err('No photo received.');
    if (f.size > 1_500_000) return err('That photo is too large.', 413);
    const buf = Buffer.from(await f.arrayBuffer());
    if (!MAGIC[f.type] || !MAGIC[f.type](buf)) return err('Please choose a JPG, PNG or WebP photo.');

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const ext = f.type === 'image/png' ? 'png' : f.type === 'image/webp' ? 'webp' : 'jpg';
      const b = await put(`surprises/${randomUUID()}.${ext}`, buf, { access: 'public', contentType: f.type });
      return NextResponse.json({ url: b.url });
    }
    if (process.env.NODE_ENV === 'production') return err('Photo storage is not set up yet.', 500);
    return NextResponse.json({ url: `data:${f.type};base64,${buf.toString('base64')}` }); // local dev only
  } catch (e) {
    console.error(e);
    return err('Upload failed. Please try again.', 500);
  }
}
