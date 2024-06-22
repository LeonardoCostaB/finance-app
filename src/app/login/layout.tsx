import '../globals.css';
// import { useApp } from '@/hooks/useApp';
// import { userIsLoggedIn } from '@/utils/userIsLoggedIn';
import Image from 'next/image';
import { useEffect } from 'react';

export const metadata = {
   title: 'Template Admin',
   description: 'Template Admin Creation',
};

export default function LoggedInLayout({
   children,
}: {
   children: React.ReactNode;
}) {
   // const { theme } = useApp();

   // useEffect(() => {
   //    userIsLoggedIn();
   // }, []);

   return (
      <div className={`flex w-full`}>
         <picture className='w-full'>
            <img
               src="https://picsum.photos/1200/1200?random=2"
               alt="Imagens aleatória para tela de login"
               width={1200}
               height={1200}
               // objectFit="cover"
               className="hidden h-screen w-full md:block"
            />
         </picture>

         <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-gray-300 dark:bg-gray-800 dark:text-gray-200">
            {children}
         </div>
      </div>
   );
}
