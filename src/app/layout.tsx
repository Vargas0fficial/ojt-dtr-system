import type { Metadata } from 'next';
import './globals.css';
import AuthProvider from './AuthProvider';

export const metadata: Metadata = {
  title: 'OJT DTR',
  description: 'OJT Daily Time Record',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}