import './globals.css';
import { AuthProvider } from '@/lib/auth-context';

export const metadata = {
  title: 'Indx — AI-Powered Indian Market Intelligence',
  description: 'Real-time NIFTY & SENSEX data, Gemini AI insights, portfolio tracking, and tax optimization — built for Indian markets.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head><link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📊</text></svg>" /></head>
      <body><AuthProvider>{children}</AuthProvider></body>
    </html>
  );
}
