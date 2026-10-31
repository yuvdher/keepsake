import { NextResponse } from 'next/server';
import { randomBytes, randomInt, createHash } from 'node:crypto';
import { insertSurprise, recentCount, sha } from '../../../lib/db.js';
import { clean } from '../../../lib/validate.js';

const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no look-alike characters
const makeId = () => Array.from({ length: 6 }, () => A[randomInt(A.length)]).join('');
const err = (error, status = 400) => NextResponse.json({ error }, { status });

export async function POST(req) {
  try {
    const text = await req.text();
    if (text.length > (process.env.NODE_ENV === 'production' ? 60_000 : 6_000_000)) return err('That is too large.', 413);
    let body;
    try { body = JSON.parse(text); } catch { return err('Invalid request.'); }
    const c = clean(body);
    if (c.error) return err(c.error);

    const ip = (req.headers.get('x-forwarded-for') || 'local').split(',')[0].trim();
    const ipHash = createHash('sha256').update((process.env.IP_SALT || 'keepsake') + ip).digest('hex').slice(0, 32);
    if ((await recentCount(ipHash)) >= 15) return err('You are making surprises quickly. Please try again in a little while.', 429);

    const key = randomBytes(18).toString('hex');
    for (let i = 0; i < 6; i++) {
      const id = makeId();
      if (await insertSurprise({ ...c.value, id, keyHash: sha(key), ipHash })) {
        const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
        return NextResponse.json({ id, key, url: `${origin}/surprise/${id}` }, { status: 201 });
      }
    }
    return err('Could not create the link. Please try again.', 500);
  } catch (e) {
    console.error(e);
    return err('Something went wrong on our side.', 500);
  }
}
