'use client';

import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TrendingUp } from "lucide-react";
import Link from "next/link";

interface MonthCardProps {
   note: {
      id: string;
      month: string;
      lastUpdate?: Date;
      date: string;
      createdAt: string;
      balance: number
      extract: {
         earnings: string[];
         expenses: string[];
      };
   }
}

export function MonthCard({ note }: MonthCardProps) {
   const date = new Date(note.date)

   return (
      <Link href={`/${note.id}/month`} className="rounded-md text-left flex flex-col gap-3 bg-slate-800 p-5 overflow-hidden relative outline-none hover:ring-2 hover:ring-slate-600 focus-visible:ring-2 focus-visible:ring-lime-400">
         <div className="flex items-start justify-between w-full">
            <div className="flex flex-col gap-2">
               <h2 className="text-xl">{`${date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`}</h2>

               <span className="text-sm text-slate-200">
               {note.lastUpdate ? 'Ultima atualização' : 'Criado'}{' '}

               <strong
                     title={format(note.createdAt, 'dd/MM/yyyy')}
                  >
                     {formatDistanceToNow(note.createdAt, { locale: ptBR, addSuffix: true })}
                  </strong>
               </span>
            </div>

            <span className="text-xs text-green-700 flex items-center gap-1 pt-[6px]">
               {note.balance} <TrendingUp size={16} className="text-green-500" />
            </span>
         </div>

         <div>
            <div className="text-green-500 text-base">
               Ganhos:

               <ul className="list-disc ml-8 text-gray-300 text-sm">
                  {note.extract.earnings.length > 0 ? (
                     note.extract.earnings.map(earning => (
                        <li key={earning}>{earning}</li>
                     ))
                  ) : (
                     <li>Nenhum ganho foi cadastrado</li>
                  )}
               </ul>
            </div>

            <div className="mt-4 text-red-500 text-base">
               Gastos:

               <ul className="list-disc ml-8 text-gray-300 text-sm">
                  {note.extract.expenses.length > 0 ? (
                     note.extract.expenses.map(expense => (
                        <li key={expense}>{expense}</li>
                     ))
                  ) : (
                     <li>Nenhum gasto foi cadastrado</li>
                  )}
               </ul>
            </div>
         </div>

         <div className="absolute bottom-0 left-0 right-0 h-1/2 mt-3 bg-gradient-to-t from-black/60 to-black/0 pointer-events-none" />
      </Link>
   )
}
