'use client';

import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TrendingUp, X } from "lucide-react";
import Link from "next/link";

interface NoteCardProps {
   note: {
      id: string;
      month: string;
      lastUpdate?: Date;
      date: Date;
      balance: number
      content: string;
   }
   onNoteDeleted: (id: string) => void;
}

export function NoteCard({ note, onNoteDeleted }: NoteCardProps) {
   const date = new Date(note.date)

   return (
      <Link href={`/${note.id}/month`} className="rounded-md text-left flex flex-col gap-3 bg-slate-800 p-5 overflow-hidden relative outline-none hover:ring-2 hover:ring-slate-600 focus-visible:ring-2 focus-visible:ring-lime-400">
         <div className="flex items-start justify-between w-full">
            <div className="flex flex-col gap-2">
               <h2 className="text-xl">{`${date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`}</h2>

               <span className="text-sm text-slate-200">
               {note.lastUpdate ? 'Ultima atualização' : 'Criado'}{' '}

               <strong
                     title={format(note.date, 'dd/MM/yyyy')}
                  >
                     {formatDistanceToNow(note.date, { locale: ptBR, addSuffix: true })}
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
                  <li>Salario</li>
                  <li>Salario</li>
               </ul>
            </div>

            <div className="mt-4 text-red-500 text-base">
               Gastos:

               <ul className="list-disc ml-8 text-gray-300 text-sm">
                  <li>Cartões</li>
                  <li>Site</li>
               </ul>
            </div>
         </div>

         <div className="absolute bottom-0 left-0 right-0 h-1/2 mt-3 bg-gradient-to-t from-black/60 to-black/0 pointer-events-none" />
      </Link>
   )
}
