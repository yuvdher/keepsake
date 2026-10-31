import { NextResponse } from 'next/server';
import { getSurprise, deleteSurprise, sha } from '../../../../lib/db.js';
import { removeBlobs } from '../../../../lib/blob.js';

const NS = { 'Cache-Control': 'no-store' };

export async function GET(_req, { params }) {
  try {
    const r = await getSurprise(params.id.toUpperCase());
    if (!r || r.gone) return NextResponse.json({ error: 'Not found' }, { status: 404, headers: NS });
    return NextResponse.json(r, { headers: NS });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500, headers: NS });
  }
}

export async function DELETE(req, { params }) {
  try {
    const key = req.headers.get('x-edit-key') || '';
    const r = key ? await deleteSurprise(params.id.toUpperCase(), sha(key)) : null;
    if (!r) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    await removeBlobs(r.photos);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
