'use client';

import { useLoggedIn } from '@/hooks/use-loggedIn';
import { ArrowLeft, Construction, PiggyBank, User, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LogoutButton } from './menu/LogoutButton';

interface HeaderProps {
   search?: {
      onSearch: (search: string) => void;
   };
   backToPage?: boolean;
}

export function Header({ search, backToPage }: HeaderProps) {
   const { getUser, user } = useLoggedIn();

   const [shouldShowMobileMenu, setShouldShowMobileMenu] = useState(false);

   useEffect(() => {
      getUser();
   }, []);

   return (
      <header className="relative mb-10 flex w-full items-center justify-end gap-2 border-b border-slate-800 p-8 max-lg:p-4 max-sm:mb-4">
         <div className="flex items-center justify-between gap-4 max-lg:w-full max-lg:flex-row-reverse lg:flex-1">
            <div className="flex items-center gap-2 rounded-md p-2 text-xs ring-2 ring-lime-400 max-lg:p-1 max-sm:text-[10px] lg:mr-4">
               <PiggyBank size={25} className="max-lg:hidden" />

               <strong>
                  {user?.economy?.extract
                     ? user.economy.extract
                          .reduce((a, b) => a + b.value, 0)
                          .toLocaleString('pt-BR', { currency: 'BRL', style: 'currency' })
                     : 'R$ 00,00'}
               </strong>
            </div>

            {search && (
               <form className="left-20 flex w-[calc(100%-170px)] justify-center lg:absolute lg:left-1/2 lg:w-96 lg:-translate-x-1/2">
                  <input
                     type="text"
                     placeholder="Encontrar mês"
                     className="h-10 w-full rounded-full border border-gray-500 bg-transparent text-center text-base font-semibold tracking-tight outline-none placeholder:text-slate-500 focus:border-white"
                     onChange={(e) => search.onSearch(e.target.value)}
                  />
               </form>
            )}

            {backToPage && window.innerWidth <= 600 ? (
               <Link href={'/'}>
                  <ArrowLeft size={18} />
               </Link>
            ) : (
               <div className="flex items-center gap-3">
                  <span className="max-lg:hidden">{user?.name}</span>

                  <button
                     type="button"
                     className="h-10 w-10 overflow-hidden rounded-full bg-slate-700"
                     onClick={() => setShouldShowMobileMenu(true)}
                  >
                     {user?.avatar?.url ? (
                        <Image
                           src={user?.avatar.url as string}
                           alt={`Foto de ${user?.name}`}
                           width={40}
                           height={40}
                        />
                     ) : (
                        <User size={40} className="p-1" />
                     )}
                  </button>

                  <div
                     className={`fixed inset-0 z-40 bg-slate-900 transition-all duration-200 ease-in-out ${shouldShowMobileMenu ? '' : '-translate-x-full'}`}
                  >
                     <div className="flex items-center justify-between">
                        <button
                           type="button"
                           className="pl-4"
                           onClick={() => setShouldShowMobileMenu(false)}
                        >
                           <X size={24} />
                        </button>

                        <ul>
                           <LogoutButton />
                        </ul>
                     </div>

                     <div className="flex h-3/4 flex-col items-center justify-center gap-4">
                        <Construction size={50} />

                        <p className="text-2xl">Área em construção...</p>
                     </div>
                  </div>
               </div>
            )}
         </div>
      </header>
   );
}
