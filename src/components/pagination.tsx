'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
   pages: number[];
   currentPage: { number: number; index: number };
}

export function Pagination({ pages, currentPage }: PaginationProps) {
   const router = useRouter();

   function handleOnPreviusPage() {
      const { number } = currentPage;

      if (number > 1) router.push(`/?page=${number - 1}&year=${pages[number - 2]}`);
   }

   function handleOnNextPage() {
      const { number } = currentPage;

      if (number < pages.length) router.push(`/?page=${number + 1}&year=${pages[number]}`);
   }

   return (
      <>
         <button
            type="button"
            onClick={handleOnPreviusPage}
            disabled={pages.indexOf(currentPage.index) <= 0}
         >
            <ChevronLeft size={16} />
         </button>

         {pages.map((page, i) => (
            <Link
               key={page}
               href={`/?page=${i + 1}&year=${page}`}
               className="flex items-center gap-2"
            >
               {page}
            </Link>
         ))}

         <button
            type="button"
            onClick={handleOnNextPage}
            disabled={pages.indexOf(currentPage.index) + 1 >= pages.length}
         >
            <ChevronRight size={16} />
         </button>
      </>
   );
}
