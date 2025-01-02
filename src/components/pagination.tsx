'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { useEffect } from 'react';

interface PaginationProps {
   pages: number[];
   currentPage: { index: number; year: number };
}

export function Pagination({ pages, currentPage }: PaginationProps) {
   const router = useRouter();

   function handleOnPreviusPage() {
      const { index } = currentPage;

      if (index > 1) router.push(`/?page=${index - 1}&year=${pages[index - 2]}`);
   }

   function handleOnNextPage() {
      const { index } = currentPage;

      if (index < pages.length) router.push(`/?page=${index + 1}&year=${pages[index]}`);
   }

   useEffect(() => {
      if (!currentPage.index) return;

      window.localStorage.setItem('pageRef', `?page=${currentPage.index}&year=${currentPage.year}`);
   }, [currentPage]);

   if (pages.length <= 1) return <></>;

   return (
      <div className="flex items-center justify-end gap-3">
         <button
            type="button"
            className={clsx(
               'flex h-6 w-6 cursor-pointer items-center justify-center rounded-full transition-all hover:bg-white/15',
               {
                  'disabled:cursor-default disabled:hover:bg-transparent':
                     pages.indexOf(currentPage.year) === 0,
               },
            )}
            onClick={handleOnPreviusPage}
            disabled={pages.indexOf(currentPage.year) === 0}
         >
            <ChevronLeft size={16} />
         </button>

         {pages.map((page, i) => (
            <Link
               key={page}
               href={`/?page=${i + 1}&year=${page}`}
               className={clsx(
                  'flex h-10 w-10 items-center justify-center gap-2 rounded-full text-xs transition-all',
                  {
                     'text-gray-500 hover:bg-white/15 hover:text-white':
                        currentPage.index - 1 !== i,
                     'bg-indigo-400 hover:bg-indigo-400': currentPage.index - 1 === i,
                  },
               )}
            >
               {page}
            </Link>
         ))}

         <button
            type="button"
            className={clsx(
               'flex h-6 w-6 cursor-pointer items-center justify-center rounded-full transition-all hover:bg-white/15',
               {
                  'disabled:cursor-default disabled:hover:bg-transparent':
                     currentPage.index >= pages.length,
               },
            )}
            onClick={handleOnNextPage}
            disabled={currentPage.index >= pages.length}
         >
            <ChevronRight size={16} />
         </button>
      </div>
   );
}
