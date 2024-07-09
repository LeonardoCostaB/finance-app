'use client'

import * as Dialog from '@radix-ui/react-dialog'
import React, { ReactNode, useState } from 'react';

interface InformationModalProps {
   button: {
      icon: ReactNode;
      title?: string;
   }
   modal: {
      title: string;
   }
   children: ReactNode;
}

export function InformationModal({ button, modal, children }: InformationModalProps) {
   const [shouldShowModal, setShouldShowModal] = useState(false);

   return (
      <Dialog.Root open={shouldShowModal} onOpenChange={(open) => setShouldShowModal(open)}>
         <Dialog.Trigger type="button" className="p-1" title={button.title}>
            {button.icon}
         </Dialog.Trigger>

         <Dialog.Portal>
            <Dialog.Overlay className="absolute inset-0 bg-black/30" />

            <Dialog.Content className="max-w-md w-full p-4 ml-11 rounded-xl bg-slate-700 absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2">
               <Dialog.Title className="inline-block w-full mb-4 text-xl text-center">
                  {modal.title}
               </Dialog.Title>


               {children}
            </Dialog.Content>
         </Dialog.Portal>
      </Dialog.Root>
   )
}
