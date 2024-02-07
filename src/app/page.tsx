import Image from "next/image";
import { NewNoteCard } from "@/components/new-note-card";
import { NoteCard } from "@/components/note-card";

export default function Home() {
   return (
      <div className="mx-auto max-w-6xl my-12 space-y-6">
         <Image
            src="/nlw-expert-logo.svg"
            alt="logo escrito nlw expert"
            width={124}
            height={24}
         />

         <form className="w-full">
            <input
               type="text"
               placeholder="Busque em suas notas..."
               className="w-full bg-transparent text-3xl font-semibold tracking-tight outline-none placeholder:text-slate-500"
            />
         </form>

         <div className="h-px bg-slate-700" />

         <div className="grid grid-cols-3 gap-6 auto-rows-[250px]">
            <NewNoteCard />

            <NoteCard note={{date: new Date(), content: "Hello World"}} />
         </div>
      </div>
   );
}
