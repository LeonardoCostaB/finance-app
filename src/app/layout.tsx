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
         <body className={`${inter.className} bg-slate-900 text-slate-50 lg:flex`}>
            <AppProvider>
               {children}

               <Toaster richColors position="top-right" duration={5000} />
            </AppProvider>
         </body>
      </html>
   );
}
