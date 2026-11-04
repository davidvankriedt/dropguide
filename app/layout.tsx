import { Analytics } from "@vercel/analytics/next"

import './globals.css';
import 'leaflet/dist/leaflet.css';

export const metadata = {
  title: 'Keg Drop Helper',
  description: 'Driver keg drop and loading dock guide',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 antialiased">{children}</body>
    </html>
  );
}