'use client'

import { NewMonthCard } from "@/components/new-month-card";
import { MonthCard } from "@/components/month-card";
import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { useLoggedIn } from "@/hooks/use-loggedIn";

export interface Note {
   id: string;
   balance: number;
   month: string;
   date: Date;
   lastUpdate?: Date;
   content: string;
}

export default function Home() {
   const { user } = useLoggedIn()

   const [search, setSearch] = useState('');
   const [months, setMonths] = useState<Months[] | undefined>([]);

   function onNoteCreated(content: string) {}

   function handleSearch(search: string) {
      setSearch(search);
   }

   // const filteredNotes = search !== '' ?
   //    notes.filter(note => note.month.toLowerCase().includes(search.toLowerCase())) :
   //    notes;

   useEffect(() => {
      setMonths(user?.months);
   }, [user])

   return (
      <>
         <Header search={{ onSearch: handleSearch }} />

         <div className="mx-auto max-w-6xl my-12 space-y-6 px-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[250px]">
               {months && months.length > 0 ? (
                  months.map(month => (
                     <MonthCard
                        key={month.id}
                        note={{
                           id: month.id,
                           balance: 0,
                           extract: {
                              earnings: month.earnings.slice(0, 2).map(earning => earning.title),
                              expenses: month.expenses.slice(0, 2).map(expense => expense.title),
                           },
                           createdAt: month.createdAt,
                           date: month.date,
                           month: month.title,
                        }}
                     />
                  ))
               ) : (
                   <>Carregando</>
               )}

               <NewMonthCard nextMonth={months?.map(month => month.createdAt)[0]} onNoteCreated={onNoteCreated} />
            </div>
         </div>
      </>
   );
}
