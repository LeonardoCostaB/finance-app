'use client'

import { Note } from "../../page";
import { FormattedPrice } from "@/components/formatted-price";
import { Header } from "@/components/header";
import { MonthlyExpenses } from "@/components/monthly-expenses";
import clsx from "clsx";
import { useEffect, useState } from "react"

export default function Month({ params }: { params: { id: string } }) {
   const [month, setMonth] = useState<Note | undefined>({} as Note);
   const [toggleLayout, setToggleLayout] = useState<'profit' | 'spent'>('profit');

   useEffect(() => {
      const monthStorage = localStorage.getItem('notes');

      if (monthStorage) {
         const monthArray = JSON.parse(monthStorage) as Note[]

         const filterById = monthArray.find(month => month.id === params.id)

         setMonth(filterById);
      }
   }, [])

   return month ? (
      <>
         <Header />

         <main className="flex flex-col items-center max-w-7xl mx-auto mb-20">
            <h1 className="text-4xl">{month.month}</h1>

            <div className="flex justify-center mt-10 w-1/2">
               <button
                  type="button"
                  className={clsx(
                     "text-xl flex-1 flex flex-col items-center gap-4 transition-all",
                     {
                        'text-green-500': toggleLayout === 'profit',
                        'text-slate-700': toggleLayout ==='spent',
                     }
                  )}
                  onClick={() => setToggleLayout('profit')}
               >
                  Ganhos

                  <span className={clsx(
                     "block w-full h-1 bg-green-500 transition-all ease-linear",
                     {
                        'bg-green-500': toggleLayout === 'profit',
                        'bg-slate-700': toggleLayout ==='spent',
                     }
                  )} />
               </button>

               <button
                  type="button"
                  className={clsx(
                     "text-xl flex-1 flex flex-col items-center gap-4 transition-all",
                     {
                        'text-red-400': toggleLayout === 'spent',
                        'text-slate-700': toggleLayout ==='profit',
                     }
                  )}
                  onClick={() => setToggleLayout('spent')}
               >
                  Despesas

                  <span className={clsx(
                     "block w-full h-1 transition-all ease-linear",
                     {
                        'bg-red-400': toggleLayout === 'spent',
                        'bg-slate-700': toggleLayout ==='profit',
                     }
                  )} />
               </button>
            </div>

            {toggleLayout === 'profit' ? (
               <section className="w-1/2 p-4 mt-6 bg-slate-800 rounded-lg box-border">
                  <div className="flex items-center justify-between mb-5 px-1">
                     <h3 className="text-xl">Alguma coisa</h3>

                     <FormattedPrice price={3000} style="profit" classNames="text-xl" />
                  </div>

                  <ul className="flex flex-col items-center justify-center">
                     <li className="py-4 px-1 border-b w-full flex items-center justify-between text-sm text-gray-400">
                        Site 2

                        <FormattedPrice price={1000} style="normal" classNames="text-sm" />
                     </li>

                     <li className="py-4 px-1 border-b w-full flex items-center justify-between text-sm text-gray-400">
                        Site 2

                        <FormattedPrice price={1000} style="normal" classNames="text-sm" />
                     </li>

                     <li className="py-4 px-1 border-b w-full flex items-center justify-between text-sm text-gray-400">
                        Site 2

                        <FormattedPrice price={1000} style="normal" classNames="text-sm" />
                     </li>
                  </ul>

                  <div className="w-full flex justify-end mt-6">
                     <button type="button" className="border p-2 rounded-lg">Adicionar mais +</button>
                  </div>
               </section>
            ) : (
               <MonthlyExpenses extract={{
                  title: 'Moveis',
                  expenses: [
                     {
                        id: 'cama',
                        name: 'cama',
                        value: 2000,
                        date: {
                           published: '2022-01-01',
                           paidOut: '2022-01-31',
                        }
                     },
                     {
                        id: 'guarda-roupa',
                        name: 'Guarda Roupa',
                        value: 2000,
                        date: {
                           published: '2022-01-01',
                           paidOut: '2022-01-31',
                        }
                     },
                     {
                        id: 'televisao',
                        name: 'Televisao',
                        value: 2500,
                        date: {
                           published: '2022-01-01',
                           paidOut: '2022-01-31',
                        }
                     }
                  ]
               }} />
            )}

         </main>
      </>
   ) : params.id === 'new' ? (
      <h1>Novo mês</h1>
   ) : (
      <h1>Not Found</h1>
   )
}
