import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import { AppProvider } from '@/context/apollo-client';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
   title: 'Monthly Finance App',
   description: 'Aplicativo de registro de nota',
};

export default function RootLayout({
   children,
}: Readonly<{
   children: React.ReactNode;
}>) {
   return (
      <html lang="pt-br">
         <head>
            <link rel="manifest" href="/manifest.json" />
            <link rel="apple-touch-icon" href="/icon-pwa-mac.png" />
            <link rel="shortcut icon" href="/icon-pwa-google.png" />
            <meta
               name="viewport"
               content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover"
            />
         </head>
         <body className={`${inter.className} bg-slate-900 text-slate-50 lg:flex`}>
            <AppProvider>
               {children}

               <Toaster richColors position="top-right" duration={5000} />
            </AppProvider>
         </body>
      </html>
   );
}
