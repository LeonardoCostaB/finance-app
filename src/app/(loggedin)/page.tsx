'use client';

import { NewMonthCard } from '@/components/new-month-card';
import { MonthCard } from '@/components/month-card';
import { useEffect, useState } from 'react';
import { Header } from '@/components/header';
import { useLoggedIn } from '@/hooks/use-loggedIn';

export interface Note {
   id: string;
   balance: number;
   month: string;
   date: Date;
   lastUpdate?: Date;
   content: string;
}

export default function Home() {
   const { user } = useLoggedIn();

   // const [search, setSearch] = useState('');
   const [months, setMonths] = useState<Months[] | undefined>([]);

   function onMonthCreated(month: Months) {
      setMonths([...(months ?? []), month]);
   }

   // function handleSearch(search: string) {
   //    setSearch(search);
   // }

   // const filteredNotes = search !== '' ?
   //    notes.filter(note => note.month.toLowerCase().includes(search.toLowerCase())) :
   //    notes;

   useEffect(() => {
      if (user && user.months.length > 0) {
         setMonths(user.months);
      } else {
         setMonths(undefined);
      }
   }, [user]);

   return (
      <>
         <Header search={{ onSearch: () => false }} />

         <div className="mx-auto my-12 max-w-6xl space-y-6 px-5 max-lg:mb-20">
            <div className="grid auto-rows-[250px] grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
               <NewMonthCard onMonthCreated={onMonthCreated} />

               {months && months.length > 0 ? (
                  months.map((month) => (
                     <MonthCard
                        key={month.id}
                        note={{
                           id: month.id,
                           balance: 0,
                           extract: {
                              earnings: month.earnings.slice(0, 2).map((earning) => earning.title),
                              expenses: month.expenses.slice(0, 2).map((expense) => expense.title),
                           },
                           createdAt: month.createdAt,
                           date: month.date,
                           month: month.title,
                        }}
                     />
                  ))
               ) : months === undefined ? (
                  <></>
               ) : (
                  <>Carregando...</>
               )}
            </div>
         </div>
      </>
   );
}
