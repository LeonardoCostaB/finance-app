import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import { AppProvider } from '@/context/apollo-client';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
   title: 'note recording app',
   description: 'Aplicativo de registro de nota',
};

export default function RootLayout({
   children,
}: Readonly<{
   children: React.ReactNode;
}>) {
   return (
      <html lang="pt-br">
         <body className={`${inter.className} flex bg-slate-900 text-slate-50`}>
            <AppProvider>
               {children}

               <Toaster richColors position="top-right" duration={5000} />
            </AppProvider>
         </body>
      </html>
   );
}
