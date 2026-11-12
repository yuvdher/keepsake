export const metadata = { title: 'Privacy | Keepsake' };
const box = { maxWidth: 680, margin: '0 auto', padding: '56px 20px 80px' };
export default function Privacy() {
  return (
    <main style={box}>
      <a href="/" style={{ color: '#c2303a' }}>Back to Keepsake</a>
      <h1 style={{ fontFamily: 'Georgia, serif', fontWeight: 400, fontSize: 44 }}>Privacy</h1>
      <p>Keepsake has no accounts and no advertising or tracking cookies.</p>
      <h2>What we store</h2>
      <p>When you create a surprise link we store the names, message, optional ticket, bouquet and up to three photos you chose, so the link can open for the person you send it to. Anyone who has the link can view it, so share it only with people you trust.</p>
      <p>To limit abuse we keep a salted, one-way hash of your IP address next to each surprise. We cannot turn it back into your address.</p>
      <h2>What stays on your device</h2>
      <p>Photobooth photos never leave your browser. Game petals, badges and a list of your recent surprise links are saved in your browser&apos;s local storage.</p>
      <h2>Visit counts</h2>
      <p>We count visits with Vercel Web Analytics to see how many people use the site, and from which countries and devices. It does not use cookies. A visitor is recognised only by a short-lived anonymous code that is reset after about a day, so people cannot be followed across days or other websites.</p>
      <h2>Deleting and expiry</h2>
      <p>You can delete a surprise from the Surprise page on the device where you made it, which also removes its photos. Links you set to expire are removed automatically.</p>
      <h2>Contact</h2>
      <p>Questions or removal requests: message us on Instagram at <a href="https://www.instagram.com/keepsake924/">@keepsake924</a>.</p>
    </main>
  );
}
