const prod = process.env.NODE_ENV === 'production';
const S = (v, n) => (typeof v === 'string' ? v.trim().slice(0, n) : '');
const N = (v, a, b, d) => { v = Number(v); return Number.isFinite(v) ? Math.min(b, Math.max(a, v)) : d; };
const th = (v) => (['0', '1', '2', '3'].includes(String(v)) ? String(v) : '0');
// Only our own Blob storage is accepted in production. Data URLs are allowed in local dev only.
const okUrl = (u) =>
  typeof u === 'string' &&
  ((u.length < 300 && /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\/[\w\-./]+$/i.test(u)) ||
    (!prod && u.length < 2_500_000 && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(u)));

export function clean(b) {
  if (!b || typeof b !== 'object') return { error: 'Invalid request.' };
  const msg = S(b.msg, 2000);
  if (!msg) return { error: 'Please write a message first.' };
  const photos = Array.isArray(b.photos) ? b.photos.slice(0, 3) : [];
  if (!photos.every(okUrl)) return { error: 'One of the photos was not accepted.' };
  let tk = null;
  if (b.tk && typeof b.tk === 'object') {
    const t = b.tk;
    tk = { title: S(t.title, 60), a: S(t.a, 40), b: S(t.b, 40), place: S(t.place, 80), date: S(t.date, 10), time: S(t.time, 5), msg: S(t.msg, 200), th: th(t.th), no: S(t.no, 8) };
  }
  let bq = null;
  if (b.bq && typeof b.bq === 'object' && Array.isArray(b.bq.fl)) {
    bq = {
      w: ['0', '1', '2', '3'].includes(String(b.bq.w)) ? String(b.bq.w) : '0',
      fl: b.bq.fl.slice(0, 14).map((f) => ({ t: Math.round(N(f?.t, 0, 6, 0)), x: N(f?.x, 0, 300, 150), y: N(f?.y, 0, 360, 120), r: N(f?.r, -90, 90, 0) })),
    };
  }
  const days = [7, 30].includes(Number(b.days)) ? Number(b.days) : 0;
  return { value: { to: S(b.to, 60), from: S(b.from, 60), msg, tk, bq, photos, expires: days ? new Date(Date.now() + days * 864e5) : null } };
}
