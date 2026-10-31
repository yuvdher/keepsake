import { NextResponse } from 'next/server';
import { deleteExpired } from '../../../../lib/db.js';
import { removeBlobs } from '../../../../lib/blob.js';

export const dynamic = 'force-dynamic';

// Runs nightly (see vercel.json). Removes expired surprises and their photos.
export async function GET(req) {
  const s = process.env.CRON_SECRET;
  if (s && req.headers.get('authorization') !== `Bearer ${s}`) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await removeBlobs(await deleteExpired());
  return NextResponse.json({ ok: true });
}
