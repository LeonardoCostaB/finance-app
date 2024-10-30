'use client';

import { useEffect } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

import '../globals.css';

export default function LoggedInLayout({ children }: { children: React.ReactNode }) {
   const router = useRouter();

   useEffect(() => {
      if (Cookies.get('isLoggedIn')) {
         router.push('/');
      }
   }, []);

   return (
      <div className={'flex w-full'}>
         <picture className="w-full max-lg:hidden">
            <img
               src="https://picsum.photos/1200/1200?random=2"
               alt="Imagens aleatória para tela de login"
               width={1200}
               height={1200}
               className="hidden h-screen w-full md:block"
            />
         </picture>

         <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-gray-300 dark:bg-gray-800 dark:text-gray-200">
            {children}
         </div>
      </div>
   );
}
