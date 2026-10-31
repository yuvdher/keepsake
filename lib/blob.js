import { del } from '@vercel/blob';

// Removes uploaded photos from storage. Ignores anything that is not a Vercel Blob URL.
export async function removeBlobs(urls) {
  const u = (urls || []).filter((x) => /\.public\.blob\.vercel-storage\.com\//.test(x));
  if (!u.length || !process.env.BLOB_READ_WRITE_TOKEN) return;
  try { await del(u); } catch (e) { console.error('blob delete failed', e); }
}
