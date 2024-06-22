'use client';

import { formattedDate } from "@/utils/formatted-date";
import * as Dialog from "@radix-ui/react-dialog";
import { CircleFadingPlus, X } from "lucide-react";
import { ChangeEvent, FormEvent, MouseEvent, useState } from "react";
import { toast } from "sonner";

interface NewNoteCardProps {
   onNoteCreated: (content: string) => void;
}

export function NewNoteCard({ onNoteCreated }: NewNoteCardProps) {
   const [isRecording, setIsRecording] = useState(false);
   const [shouldShowOnboarding, setShouldShowOnboarding] = useState<boolean>(true);
   const [content, setContent] = useState<string>('');

   function handleStartEditor() {
      setShouldShowOnboarding(false);
   }

   function handleContentChange(ev: ChangeEvent<HTMLTextAreaElement>) {
      setContent(ev.target.value);

      if (ev.target.value === '') {
         setShouldShowOnboarding(true);
      }
   }

   function handleSaveNote(ev: FormEvent) {
      ev.preventDefault();

      onNoteCreated(content);

      setContent('');
      setShouldShowOnboarding(true);

      toast.success('Mensagem salva com sucesso');
   }

   function handleStartRecording() {
      const isSpeechRecognitionAPIAvailable = 'SpeechRecognition' in window ||
         'webkitSpeechRecognition' in window;

      if (!isSpeechRecognitionAPIAvailable) {
         return alert('Seu nevegador não suporta essa funcionalidade 😔')
      }


      setIsRecording(true);
      setShouldShowOnboarding(false);

      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

      const speechRecognition = new SpeechRecognitionAPI();

      speechRecognition.lang = "pt-BR";
      speechRecognition.continuous = true; // só parar a gravação qnd eu pedir
      speechRecognition.maxAlternatives = 1; // caso não entenda a palavra, ele vai trazer sugestões
      speechRecognition.interimResults = false; // vai mostrando a palavra ao mesmo tempo que eu falo

      speechRecognition.onresult = (e) => {
         const transcription = Array.from(e.results).reduce((text, result) => {
            return text.concat(result[0].transcript);
         }, '')

         setContent(transcription);
      }

      speechRecognition.onerror = (e) => {
         console.error(e)
      }

      speechRecognition.start();
   }

   function handleStopRecording(e: MouseEvent) {
      e.stopPropagation()
      e.preventDefault();
      setIsRecording(false);
   }

   return (
      <Dialog.Root>
         <Dialog.Trigger className="rounded-md flex flex-col items-center outline-none bg-slate-700 p-5 gap-3 space-y-3 text-left hover:ring-2 hover:ring-slate-600 focus-visible:ring-2 focus-visible:ring-lime-400">
            <span className="text-lg text-center font-medium text-slate-200">
               {formattedDate()}
            </span>

            <p className="text-sm leading-6 text-slate-400">
               Ainda não há registro para esse mês
            </p>

            <div className="w-full flex items-center justify-center">
               <CircleFadingPlus size={100} />
            </div>

         </Dialog.Trigger>

         <Dialog.Portal>
            <Dialog.Overlay className="inset-0 fixed bg-black/60" />

            <Dialog.Content className="fixed overflow-hidden inset-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-[640px] w-full md:h-[60vh] bg-slate-700 md:rounded-md flex flex-col outline-none">
               <Dialog.Close className="absolute right-0 top-0 bg-slate-800 p-1.5 text-slate-400 hover:text-slate-100">
                  <X className="size-5"/>
               </Dialog.Close>

               <form onSubmit={handleSaveNote} className="flex-1 flex flex-col">
                  <div className="flex flex-1 flex-col gap-3 p-5">
                     <span className="text-sm font-medium text-slate-200">
                        Adicionar nota
                     </span>

                     {shouldShowOnboarding ? (
                        <p className="text-sm leading-6 text-slate-400">
                           Comece{' '}
                           <button
                              type="button"
                              className="font-medium text-lime-400 hover:underline"
                              onClick={handleStartRecording}
                           >
                              Gravando uma nota
                           </button>{' '}
                           em aúdio ou se preferir{' '}
                           <button
                              type="button"
                              className="font-medium text-lime-400 hover:underline"
                              onClick={handleStartEditor}
                           >
                              Utilize somente texto
                           </button>
                        </p>
                     ) : (
                        <textarea
                           autoFocus
                           className="text-sm leading-6 text-slate-400 bg-transparent resize-none flex-1 outline-none"
                           onChange={handleContentChange}
                           value={content}
                        />
                     )}
                  </div>

                  {isRecording ? (
                     <button
                        type="button"
                        className="w-full flex items-center justify-center bg-slate-900 py-4 text-center text-sm text-slate-300 outline-none font-medium transition-colors hover:text-slate-100"
                        onClick={handleStopRecording}
                     >
                        <span className="size-3 rounded-full bg-red-500 animate-pulse" />
                        Gravando! (clique p/ interromper)
                     </button>
                  ) : (
                     <button
                        type="submit"
                        className="w-full bg-lime-400 py-4 text-center text-sm text-lime-950 outline-none font-medium transition-colors hover:bg-lime-500 disabled:opacity-50 disabled:cursor-no-drop disabled:hover:bg-lime-400"
                        disabled={shouldShowOnboarding || content === ''}
                     >
                        Salvar nota
                     </button>
                  )}

               </form>
            </Dialog.Content>
         </Dialog.Portal>
      </Dialog.Root>
   )
}
