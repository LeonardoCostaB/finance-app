'use client';

import * as Dialog from '@radix-ui/react-dialog';
import clsx from 'clsx';
import React, { ReactNode, useState } from 'react';

interface InformationModalProps {
   button: {
      icon: ReactNode;
      title?: string;
      text?: string;
      buttonClasses?: string;
      disabled?: boolean;
      onclick?: () => void;
   };
   modal: {
      title: string;
   };
   children: ReactNode;
}

export function InformationModal({ button, modal, children }: InformationModalProps) {
   const [shouldShowModal, setShouldShowModal] = useState(false);

   return (
      <Dialog.Root open={shouldShowModal} onOpenChange={(open) => setShouldShowModal(open)}>
         <Dialog.Trigger
            type="button"
            className={clsx('p-1 disabled:cursor-no-drop disabled:opacity-50', {
               [`${button.buttonClasses}`]: button.buttonClasses,
               'flex items-center gap-2': button.text,
            })}
            title={button.title}
            disabled={button.disabled}
            onClick={button?.onclick}
         >
            {button.icon}
            {button.text}
         </Dialog.Trigger>

         <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/30" />

            <Dialog.Content className="fixed left-1/2 top-1/2 ml-11 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-slate-700 p-4">
               <Dialog.Title className="mb-4 inline-block w-full text-center text-xl">
                  {modal.title}
               </Dialog.Title>

               {children}
            </Dialog.Content>
         </Dialog.Portal>
      </Dialog.Root>
   );
}
