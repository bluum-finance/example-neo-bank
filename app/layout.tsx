import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Neo Bank By Bluum Finance',
  description: 'Modern banking experience',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head />
      <body className={`${inter.variable} ${inter.className} dark bg-[#0E231F]`}>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
