'use client';

import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface MonthCardProps {
   note: {
      id: string;
      month: string;
      lastUpdate?: Date;
      date: string;
      createdAt: string;
      balance: number;
      extract: {
         earnings: string[];
         expenses: string[];
      };
   };
}

export function MonthCard({ note }: MonthCardProps) {
   const date = new Date(note.date);

   return (
      <Link
         href={`/${note.id}/month`}
         className="group relative flex flex-col rounded-3xl bg-slate-800 bg-clip-padding px-5 py-7 hover:ring-2 hover:ring-slate-600 focus-visible:ring-2 focus-visible:ring-lime-400"
      >
         <div className="relative z-20 flex h-full flex-col">
            <div className="flex w-full items-start justify-between">
               <div className="flex flex-col gap-2 capitalize">
                  <h2 className="text-xl">{`${date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).replace(' de', '')}`}</h2>
               </div>

               <span className="flex items-center gap-1 pt-[6px] text-xs text-green-700">
                  {note.balance} <TrendingUp size={16} className="text-green-500" />
               </span>
            </div>

            <div>
               <div className="text-base text-green-500">
                  Ganhos:
                  <ul className="ml-8 list-disc text-sm text-gray-300">
                     {note.extract.earnings.length > 0 ? (
                        note.extract.earnings.map((earning) => <li key={earning}>{earning}</li>)
                     ) : (
                        <li>Nenhum ganho foi cadastrado</li>
                     )}
                  </ul>
               </div>

               <div className="mt-4 text-base text-red-500">
                  Gastos:
                  <ul className="ml-8 list-disc text-sm text-gray-300">
                     {note.extract.expenses.length > 0 ? (
                        note.extract.expenses.map((expense) => <li key={expense}>{expense}</li>)
                     ) : (
                        <li>Nenhum gasto foi cadastrado</li>
                     )}
                  </ul>
               </div>
            </div>

            <span className="flex flex-1 items-end gap-1 text-sm text-slate-200">
               {note.lastUpdate ? 'Ultima atualização' : 'Criado'}{' '}
               <strong title={format(note.createdAt, 'dd/MM/yyyy')}>
                  {formatDistanceToNow(note.createdAt, { locale: ptBR, addSuffix: true })}
               </strong>
            </span>
         </div>
      </Link>
   );
}
