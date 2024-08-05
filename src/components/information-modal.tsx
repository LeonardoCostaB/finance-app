'use client'

import * as Dialog from '@radix-ui/react-dialog'
import clsx from 'clsx';
import React, { ReactNode, useState } from 'react';

interface InformationModalProps {
   button: {
      icon: ReactNode;
      title?: string;
      text?: string;
      buttonClasses?: string;
      disabled?: boolean;
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
         <Dialog.Trigger
            type="button"
            className={clsx(
               "p-1 disabled:opacity-50 disabled:cursor-no-drop",
               {
                  [`${button.buttonClasses}`]: button.buttonClasses,
                  'flex items-center gap-2': button.text,
               }
            )}
            title={button.title}
            disabled={button.disabled}
         >
            {button.icon}
            {button.text}
         </Dialog.Trigger>

         <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/30" />

            <Dialog.Content className="max-w-md w-full p-4 ml-11 rounded-xl bg-slate-700 fixed top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2">
               <Dialog.Title className="inline-block w-full mb-4 text-xl text-center">
                  {modal.title}
               </Dialog.Title>


               {children}
            </Dialog.Content>
         </Dialog.Portal>
      </Dialog.Root>
   )
}
