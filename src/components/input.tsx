'use client';

import clsx from 'clsx';

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
      typeNumber?: {
         min?: number;
         max?: number;
      };
      required?: boolean;
      classNames?: string;
   };
   error?: {
      show: boolean;
      message?: string;
   };
}

export function Input({
   container,
   inputProps: { type, register, typeNumber, classNames, id, required },
   labelProps: { text, filled, largeText, labelClasses },
   error,
}: InputProps) {
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
            type={type}
            id={id}
            min={typeNumber?.min}
            maxLength={typeNumber?.max}
            {...register}
            className={`h-full w-full rounded-lg bg-gray-800 px-4 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${classNames ?? ''} ${error?.show ? 'ring-2 ring-red-500' : ''}`}
         />

         {error?.message && (
            <span className="absolute -bottom-5 left-3 text-xs text-red-500">{error.message}</span>
         )}
      </div>
   );
}
