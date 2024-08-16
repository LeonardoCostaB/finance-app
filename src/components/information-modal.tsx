'use client';

import * as Dialog from '@radix-ui/react-dialog';
import clsx from 'clsx';
import { X } from 'lucide-react';
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
      openAtTheBottom?: boolean;
   };
   children: ReactNode;
}

export function InformationModal({ button, modal, children }: InformationModalProps) {
   const [shouldShowModal, setShouldShowModal] = useState(false);
   const [animation, setAnimations] = useState(false);

   return (
      <Dialog.Root
         open={shouldShowModal}
         onOpenChange={async (open) => {
            if (!open && window.innerWidth <= 1024) {
               setAnimations(open);
               await new Promise((resolve) => setTimeout(() => resolve(true), 500));
            }
            setAnimations(open);
            setShouldShowModal(open);
         }}
      >
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
            <Dialog.Overlay className="fixed inset-0 z-40 animate-overlayShow bg-black/30" />

            <Dialog.Content
               className={clsx(
                  'fixed z-40 w-full max-w-md rounded-xl bg-slate-700 p-4 transition-all duration-500 max-lg:animate-contentMobileShow lg:left-1/2 lg:top-1/2 lg:ml-11 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:animate-contentShow',
                  {
                     'add-new-block-mobile': modal.openAtTheBottom,
                     'invisible max-h-0 opacity-0': window.innerWidth <= 1024 && !animation,
                     'opacity-1 visible max-h-80': window.innerWidth <= 1024 && animation,
                  },
               )}
            >
               <div className="mb-4 flex w-full items-center lg:justify-center">
                  <Dialog.Title className="inline-block w-full text-center text-xl max-lg:pl-6">
                     {modal.title}
                  </Dialog.Title>

                  <Dialog.DialogClose className="lg:hidden">
                     <X />
                  </Dialog.DialogClose>
               </div>

               {children}
            </Dialog.Content>
         </Dialog.Portal>
      </Dialog.Root>
   );
}
