'use client';

import clsx from 'clsx';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

interface InputProps {
   container?: {
      classNames: string;
   };
   labelProps: {
      visible?: boolean;
      text: string;
      filled: boolean;
      largeText?: boolean;
      labelClasses?: string;
   };
   inputProps: {
      type: string;
      id: string;
      register?: any;
      disabled?: boolean;
      classNames?: string;
      required?: boolean;
   };
   error?: {
      show: boolean;
      message?: string;
   };
   tutorial?: boolean;
}

export function PasswordInput({
   container,
   inputProps: {
      id,
      register,
      disabled,
      classNames,
      required,
   },
   labelProps: {
      text,
      visible,
      filled,
      largeText,
      labelClasses
   },
   error,
   tutorial = false,
}: InputProps) {
   const [toggleSeePassword, setToggleSeePassword] =
      useState<string>('password');
   const [tutorialForPass, setTutorialForPass] = useState<boolean>(false);

   return (
      <div
         className={`input-wrapper relative flex h-10 w-full rounded-lg border border-gray-300 ${container ? container.classNames : ''}`}
      >
         <label
            htmlFor={id}
            className={clsx(
               `absolute left-3 top-2 bg-gray-800 px-1 text-sm transition-all duration-100 ease-linear ${labelClasses ?? ''}`,
               {
                  filled,
                  'larger-text top-3 text-xs max-md:text-[10px]': largeText,
               },
            )}
         >
            {text} {required && <span className="text-red-500">*</span>}
         </label>

         <input
            type={toggleSeePassword}
            id={id}
            className={`h-full w-full rounded-lg bg-gray-800 px-4 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${classNames ?? ''} ${error?.show ? 'ring-2 ring-red-500' : ''}`}
            {...register}
            onFocus={tutorial ? () => setTutorialForPass(true) : () => false}
            onBlur={ tutorial ? () => setTutorialForPass(false): () => false}
            disabled={disabled}
         />

         {tutorialForPass && (
            <div className="absolute left-[calc(-42%+-10px)] -top-6 w-fit rounded-md bg-white p-4 text-sm text-black shadow-md">
               Sua senha deve conter:
               <ul className="ml-8 list-disc text-xs text-black">
                  <li>No mínimo 8 caracteres</li>
                  <li>Uma letra maiúscula</li>
                  <li>Um número</li>
               </ul>
               <div className="absolute left-[calc(100%+-10px)] top-1/2 h-5 w-5 -translate-y-1/2 rotate-45 bg-white" />
            </div>
         )}


         <button
            type="button"
            className={clsx('absolute top-1/2 -translate-y-1/2 right-2 text-sm text-white')}
            onClick={() =>
               setToggleSeePassword((prev) =>
                  prev === 'password' ? 'text' : 'password',
               )
            }
         >
            {toggleSeePassword === 'password' ? (
               <Eye size={16} />
            ) : (
               <EyeOff size={16} />
            )}
         </button>


         {error?.message && (
            <span className="absolute -bottom-5 left-3 text-xs text-red-500">{error.message}</span>
         )}
      </div>
   );
}
