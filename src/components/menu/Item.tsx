'use client'

import clsx from 'clsx';
import Link from 'next/link';
import { MouseEventHandler, ReactNode } from 'react';
import { usePathname } from 'next/navigation';

interface ItemProps {
   url?: string;
   text: string;
   icon: ReactNode;
   onClickFunction?: MouseEventHandler<HTMLButtonElement> | undefined;
   className?: string;
}

export function Item({
   url,
   text,
   icon,
   className = '',
   onClickFunction,
}: ItemProps) {
   const pathName = usePathname();

   return (
      <li className="transition-all hover:bg-gray-100 dark:hover:bg-gray-800">
         {url ? (
            <Link
               href={url}
               className={clsx(
                  `flex h-20 w-20 flex-col items-center justify-center text-xs font-light text-gray-600 dark:hover:dark:text-white`,
                  {
                     className: className !== '',
                     'bg-gray-100 dark:bg-gray-800 dark:text-white':
                        pathName === url,
                  },
               )}
            >
               {icon}

               {text}
            </Link>
         ) : (
            <button
               className={`flex h-20 w-20 flex-col items-center justify-center text-xs font-light text-gray-600 transition-all dark:text-gray-200 ${className}`}
               onClick={onClickFunction}
            >
               {icon}

               {text}
            </button>
         )}
      </li>
   );
}
