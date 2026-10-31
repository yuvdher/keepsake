import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export function GET(req) {
  const s = new URL(req.url).searchParams.has('s');
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 90px', background: '#f5efe3', color: '#171310' }}>
        <div style={{ display: 'flex', fontSize: 30, color: '#c2303a', letterSpacing: 6 }}>KEEPSAKE</div>
        <div style={{ display: 'flex', fontSize: 92, marginTop: 24, lineHeight: 1.05 }}>{s ? 'Someone left you a surprise…' : 'For the little moments.'}</div>
        <div style={{ display: 'flex', fontSize: 34, marginTop: 32, color: '#6d645a' }}>{s ? 'Open it to see what is inside.' : 'Messages, tickets, bouquets and surprises.'}</div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
