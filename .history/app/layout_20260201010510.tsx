import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from 'sonner';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin', 'vietnamese'],
});

export const metadata: Metadata = {
  title: 'Art Club Fund Manager',
  description: 'Quản lý quỹ CLB Nghệ Thuật - Hát, Nhảy, Rap, Nhạc Cụ',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
          <Toaster 
            position="top-center"
            richColors
            closeButton
            theme="dark"
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
