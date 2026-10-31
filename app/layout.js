export const metadata = { title: 'Keepsake' };
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#f5efe3', color: '#171310', font: '16px/1.6 system-ui, sans-serif' }}>{children}</body>
    </html>
  );
}
