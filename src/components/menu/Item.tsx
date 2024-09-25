'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { MouseEventHandler, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Loader2Icon } from 'lucide-react';

interface ItemProps {
   url?: string;
   text: string;
   icon: ReactNode;
   onClickFunction?: MouseEventHandler<HTMLButtonElement> | undefined;
   className?: string;
   loading?: boolean;
}

export function Item({ url, text, icon, className = '', onClickFunction, loading }: ItemProps) {
   const pathName = usePathname();

   return (
      <li className="transition-all lg:hover:bg-gray-800">
         {url ? (
            <Link
               href={url}
               className={clsx(
                  'flex h-20 w-20 flex-col items-center justify-center gap-2 text-xs font-light text-white max-lg:h-auto max-lg:w-20 max-lg:gap-1 max-lg:py-2 max-lg:text-white lg:hover:bg-slate-800 lg:hover:opacity-100',
                  {
                     className: className !== '',
                     'active-item lg:bg-slate-800': pathName === url,
                     'opacity-50': pathName !== url,
                  },
               )}
            >
               {icon}

               {text}
            </Link>
         ) : (
            <button
               className={`flex h-20 w-20 flex-col items-center justify-center text-xs font-light text-white transition-all dark:text-gray-200 ${className}`}
               onClick={onClickFunction}
               disabled={loading}
            >
               {loading ? (
                  <Loader2Icon size={24} className="animate-spin" />
               ) : (
                  <>
                     {icon}

                     {text}
                  </>
               )}
            </button>
         )}
      </li>
   );
}
