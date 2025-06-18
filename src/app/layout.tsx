import './globals.css';
import { ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'Chatbot',
  description: 'Next-generation conversational AI interface',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="neurochat-theme"
        >
          <Navbar />
          <main className="min-h-screen pt-16">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}