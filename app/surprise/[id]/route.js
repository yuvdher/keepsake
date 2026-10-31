import fs from 'node:fs';
import path from 'node:path';
import { getSurprise } from '../../../lib/db.js';

export const dynamic = 'force-dynamic';

const seed = (o) =>
  `<script>window.__S=${JSON.stringify(o).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029')}</script>`;

async function shell(req) {
  try { return fs.readFileSync(path.join(process.cwd(), 'public', 'app.html'), 'utf8'); }
  catch { return (await fetch(new URL('/app.html', req.url))).text(); }
}

export async function GET(req, { params }) {
  let r = null;
  try { r = await getSurprise(params.id.toUpperCase()); } catch (e) { console.error(e); }
  const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
  const data = r && !r.gone ? { to: r.to, from: r.from, msg: r.msg, tk: r.tk, bq: r.bq, photos: r.photos } : { gone: true };
  // The preview card never includes the private message.
  const meta = `<title>Someone left you a surprise</title><meta name="description" content="Open it to see what's inside."><meta name="robots" content="noindex,nofollow"><meta property="og:title" content="Someone left you a surprise"><meta property="og:description" content="Open it to see what's inside."><meta property="og:image" content="${origin}/og?s=1"><meta name="twitter:card" content="summary_large_image">`;
  const html = (await shell(req)).replace(/<!--META-->[\s\S]*?<!--\/META-->/, () => meta).replace('<!--SEED-->', () => seed(data));
  return new Response(html, {
    status: data.gone ? 404 : 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' },
  });
}
