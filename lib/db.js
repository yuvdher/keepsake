import { neon } from '@neondatabase/serverless';
import { createHash } from 'node:crypto';

// With DATABASE_URL set, data lives in Postgres. Without it (local dev only) it lives in memory.
const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;
const NO_DB = !process.env.DATABASE_URL && process.env.NODE_ENV === 'production'; // never keep data in memory on the live site
const mem = (globalThis.__ks ||= new Map());
let ready;
const ensure = () =>
  sql && (ready ||= (async () => {
    await sql`create table if not exists surprises (
      id text primary key, to_name text not null default '', from_name text not null default '',
      message text not null, ticket jsonb, bouquet jsonb, photos jsonb not null default '[]',
      key_hash text not null, ip_hash text not null,
      created_at timestamptz not null default now(), expires_at timestamptz)`;
    await sql`create index if not exists surprises_ip on surprises (ip_hash, created_at)`;
    await sql`create index if not exists surprises_exp on surprises (expires_at)`;
  })());

export const sha = (s) => createHash('sha256').update(s).digest('hex');

export async function recentCount(ipHash) {
  if (NO_DB) throw new Error('DATABASE_URL is not set');
  if (!sql) return [...mem.values()].filter((v) => v.ipHash === ipHash && v.created > Date.now() - 36e5).length;
  await ensure();
  const r = await sql`select count(*)::int as n from surprises where ip_hash=${ipHash} and created_at > now() - interval '1 hour'`;
  return r[0].n;
}

export async function insertSurprise(r) {
  if (NO_DB) throw new Error('DATABASE_URL is not set');
  if (!sql) {
    if (mem.has(r.id)) return false;
    mem.set(r.id, { ...r, created: Date.now() });
    return true;
  }
  await ensure();
  const exp = r.expires ? r.expires.toISOString() : null;
  const o = await sql`insert into surprises (id,to_name,from_name,message,ticket,bouquet,photos,key_hash,ip_hash,expires_at)
    values (${r.id},${r.to},${r.from},${r.msg},${r.tk ? JSON.stringify(r.tk) : null}::jsonb,${r.bq ? JSON.stringify(r.bq) : null}::jsonb,
    ${JSON.stringify(r.photos)}::jsonb,${r.keyHash},${r.ipHash},${exp}::timestamptz)
    on conflict (id) do nothing returning id`;
  return o.length > 0;
}

// Returns the public fields, { gone: true } if expired, or null if it does not exist.
export async function getSurprise(id) {
  if (NO_DB) throw new Error('DATABASE_URL is not set');
  let row = null;
  if (!sql) {
    const v = mem.get(id);
    if (v) row = { to: v.to, from: v.from, msg: v.msg, tk: v.tk, bq: v.bq, photos: v.photos, exp: v.expires };
  } else {
    await ensure();
    const o = await sql`select to_name,from_name,message,ticket,bouquet,photos,expires_at from surprises where id=${id}`;
    if (o[0]) row = { to: o[0].to_name, from: o[0].from_name, msg: o[0].message, tk: o[0].ticket, bq: o[0].bouquet, photos: o[0].photos, exp: o[0].expires_at };
  }
  if (!row) return null;
  if (row.exp && new Date(row.exp) < new Date()) return { gone: true };
  const { exp, ...pub } = row;
  return pub;
}

// Deletes only if the edit key matches. Returns { photos } or null.
export async function deleteSurprise(id, keyHash) {
  if (NO_DB) throw new Error('DATABASE_URL is not set');
  if (!sql) {
    const v = mem.get(id);
    if (!v || v.keyHash !== keyHash) return null;
    mem.delete(id);
    return { photos: v.photos };
  }
  await ensure();
  const o = await sql`delete from surprises where id=${id} and key_hash=${keyHash} returning photos`;
  return o[0] ? { photos: o[0].photos } : null;
}

export async function deleteExpired() {
  if (NO_DB) throw new Error('DATABASE_URL is not set');
  if (!sql) {
    const out = [];
    for (const [k, v] of mem) if (v.expires && v.expires < new Date()) { out.push(...v.photos); mem.delete(k); }
    return out;
  }
  await ensure();
  const o = await sql`delete from surprises where expires_at is not null and expires_at < now() returning photos`;
  return o.flatMap((r) => r.photos || []);
}
