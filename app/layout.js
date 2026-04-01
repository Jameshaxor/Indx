import './globals.css';
import { AuthProvider } from '@/lib/auth-context';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Indx – Indian Stock Market Dashboard',
  description: 'Real-time Indian market intelligence powered by AI',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
