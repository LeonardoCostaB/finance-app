'use client';

import { useLoggedIn } from '@/hooks/use-loggedIn';
import { PiggyBank, User } from 'lucide-react';
import { useEffect } from 'react';
import Image from 'next/image';

interface HeaderProps {
   search?: {
      onSearch: (search: string) => void;
   };
}

export function Header({ search }: HeaderProps) {
   const { getUser, user } = useLoggedIn();

   useEffect(() => {
      getUser();
   }, []);

   return (
      <header className="relative flex w-full items-center justify-end gap-2 p-8 max-lg:p-4">
         {search && (
            <form className="absolute left-20 flex w-[calc(100%-200px)] justify-center lg:left-1/2 lg:w-96 lg:-translate-x-1/2">
               <input
                  type="text"
                  placeholder="Encontrar mês"
                  className="h-10 w-full rounded-full border border-gray-500 bg-transparent text-center text-base font-semibold tracking-tight outline-none placeholder:text-slate-500 focus:border-white"
                  onChange={(e) => search.onSearch(e.target.value)}
               />
            </form>
         )}

         <div className="flex items-center gap-4 max-lg:w-full max-lg:flex-row-reverse max-lg:justify-between">
            {user?.economy?.extract && (
               <div className="flex items-center gap-2 rounded-md p-2 text-xs ring-2 ring-lime-400 max-lg:p-1 max-sm:text-[10px] lg:mr-4">
                  <PiggyBank size={25} className="max-lg:hidden" />

                  <strong>
                     {user.economy.extract
                        .reduce((a, b) => a + b.value, 0)
                        .toLocaleString('pt-BR', { currency: 'BRL', style: 'currency' })}
                  </strong>
               </div>
            )}

            <span className="max-lg:hidden">{user?.name}</span>

            <button type="button" className="h-10 w-10 overflow-hidden rounded-full bg-slate-700">
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
         </div>
      </header>
   );
}
