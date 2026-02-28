import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { PostHogProvider } from '@/providers/posthog-provider';
import { AuthProvider } from '@/providers/auth-provider';
import { Navbar } from '@/components/navbar';


const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FunCity — NYC Discovery Board',
  description: 'Discover and share the best spots in New York City',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <PostHogProvider>
          <AuthProvider>
            <Navbar />
            <main>{children}</main>
          </AuthProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
