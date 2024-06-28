'use client'

import Image from "next/image";
import { NewNoteCard } from "@/components/new-note-card";
import { NoteCard } from "@/components/note-card";
import { useEffect, useState } from "react";
import { Header } from "@/components/header";

export interface Note {
   id: string;
   balance: number;
   month: string;
   date: Date;
   lastUpdate?: Date;
   content: string;
}

export default function Home() {
   const [search, setSearch] = useState('');
   const [notes, setNotes] = useState<Note[]>([]);

   function onNoteCreated(content: string) {
      const newNote: Note = {
         id: crypto.randomUUID(),
         month: new Date().toLocaleString('pt-BR', { month: 'long' }),
         date: new Date(),
         balance: +Math.random().toFixed(2),
         content,
      }

      const notesArray = [newNote, ...notes]

      setNotes(notesArray);

      localStorage.setItem('notes', JSON.stringify(notesArray))
   }

   function onNoteDeleted(id: string) {
      const notesArray = notes.filter(note => note.id!== id);

      setNotes(notesArray);

      localStorage.setItem('notes', JSON.stringify(notesArray));
   }

   function handleSearch(search: string) {
      setSearch(search);
   }

   const filteredNotes = search !== '' ?
      notes.filter(note => note.month.toLowerCase().includes(search.toLowerCase())) :
      notes;

   useEffect(() => {
      const notesOnLocalStorage = localStorage.getItem('notes');

      if (notesOnLocalStorage) {
         const notesArray = JSON.parse(notesOnLocalStorage) as Note[]

         const orderByDate = notesArray.sort((a, b) => {
            return new Date(a.date).getTime() - new Date(b.date).getTime()
         })

         setNotes(orderByDate);
      }
   }, [])

   return (
      <>
         <Header search={{ onSearch: handleSearch }} />

         <div className="mx-auto max-w-6xl my-12 space-y-6 px-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[250px]">
               {filteredNotes.map(note => (
                  <NoteCard
                  key={note.id}
                  note={{
                     id: note.id,
                     balance: note.balance,
                     month: note.month,
                     date: note.date,
                     content: note.content
                  }}
                  onNoteDeleted={onNoteDeleted}
                  />
               ))}

               <NewNoteCard onNoteCreated={onNoteCreated} />
            </div>
         </div>
      </>
   );
}
