'use client';

import clsx from 'clsx';
import { Check, ChevronDown } from 'lucide-react';
import { ChangeEvent, createRef, useEffect, useRef, useState } from 'react';

interface SelectInputProps {
   labelProps: {
      visible?: boolean;
      text: string;
   };
   selectProps: {
      id: string;
      placeholder: string;
      float?: boolean;
      register?: any;
      name: string;
      fields: {
         code: string | number;
         name: string;
      }[];
      onValue?: (value: string) => void;
      required?: boolean;
      disabled?: boolean;
      clearValue?: boolean;
      loadingFields?: boolean;
   };
   error?: {
      show: boolean;
      message?: string;
   };
}

export function SelectInput({ labelProps, selectProps, error }: SelectInputProps) {
   const [search, setSearch] = useState('');
   const [shouldShowOptions, setShouldShowOptions] = useState(false);
   const [selectValue, setSelectValue] = useState('');
   const [selectedValue, setSelectedValue] = useState('');

   const optionsContainerRef = useRef<HTMLUListElement>(null);
   const optionsInputRef = useRef<{ [key: string]: React.RefObject<HTMLInputElement> }>({});

   function handleChange(e: ChangeEvent<HTMLInputElement>) {
      setSelectValue(e.target.value);
      setSearch(e.target.value);
   }

   const fields =
      search !== ''
         ? selectProps.fields.filter((field) =>
              field.name.toLowerCase().includes(search.toLowerCase()),
           )
         : selectProps.fields;

   useEffect(() => {
      document.addEventListener('mousedown', (e) => {
         const target = e.target as Document;
         if (!optionsContainerRef.current?.contains(target)) {
            setShouldShowOptions(false);
         }
      });
   }, []);

   useEffect(() => {
      if (selectProps.clearValue) {
         setSelectValue('');
      }
   }, [selectProps.clearValue]);

   return (
      <div className="select-wrapper relative">
         <div
            id="open-options"
            className={`relative ${selectProps.disabled ? 'cursor-no-drop' : ''}`}
         >
            {labelProps.visible && (
               <label
                  htmlFor={selectProps.id}
                  className={clsx(
                     'absolute left-3 top-2 bg-white px-1 text-sm transition-all duration-100 ease-linear',
                     {
                        filled: selectValue || selectedValue,
                        'cursor-no-drop text-gray-300': selectProps.disabled,
                     },
                  )}
               >
                  {selectProps.loadingFields ? 'Carregando...' : labelProps.text}{' '}
                  {selectProps.required && <span className="text-red-500">*</span>}
               </label>
            )}

            <div id="select-button" className="flex h-10 w-full items-center justify-between">
               <input
                  id={selectProps.id}
                  type="text"
                  className={clsx(
                     'h-full w-full cursor-pointer rounded-lg border border-gray-300 bg-transparent pl-4 pr-10 text-sm outline-none focus-visible:border-0 focus-visible:ring-2 focus-visible:ring-blue-500',
                     {
                        'placeholder:text-white': !selectProps.disabled,
                        'ring-2 ring-red-500': !!error?.message,
                        'cursor-no-drop': selectProps.disabled,
                     },
                  )}
                  placeholder={selectProps.placeholder}
                  onChange={handleChange}
                  onClick={() => setShouldShowOptions(!shouldShowOptions)}
                  {...(selectValue ? { ...{ value: selectValue } } : { value: '' })}
                  disabled={selectProps.disabled}
                  autoComplete="no"
                  onBlur={(e) => (e.target.value = selectedValue)}
               />

               <ChevronDown
                  size={20}
                  className={clsx(
                     'arrow-input pointer-events-none absolute right-3 z-0 transition-all ease-linear',
                     {
                        'rotate-180': shouldShowOptions,
                        'rotate-0': !shouldShowOptions,
                        'text-gray-300': selectProps.disabled,
                     },
                  )}
               />
            </div>

            {error?.message && (
               <span className="absolute -bottom-5 left-3 text-xs text-red-500">
                  {error.message}
               </span>
            )}
         </div>

         <ul
            ref={optionsContainerRef}
            id="options-select"
            className={clsx('relative mt-2 w-full overflow-auto bg-slate-600 transition-all', {
               'visible max-h-[222px] opacity-100': shouldShowOptions,
               'invisible max-h-0 opacity-0': !shouldShowOptions,
               'absolute z-10': selectProps.float,
            })}
         >
            {fields?.map((field) => {
               if (!optionsInputRef.current[field.code]) {
                  optionsInputRef.current[field.code] = createRef<HTMLInputElement>();
               }

               return (
                  <li
                     key={field.name}
                     id="option"
                     className="relative flex cursor-pointer items-center gap-2 border-b border-slate-400 last:border-none"
                  >
                     <input
                        ref={optionsInputRef.current[field.code]}
                        type="radio"
                        id={`${field.name}`}
                        name={selectProps.name}
                        value={field.code}
                        className="[all:unset]"
                        {...selectProps.register}
                        onChange={(e) =>
                           e.target.checked &&
                           (setSelectValue(e.target.id),
                           setShouldShowOptions(false),
                           selectProps.onValue?.(String(field.code)),
                           setSelectedValue(e.target.id),
                           selectProps.register.onChange(e))
                        }
                        autoComplete="no"
                     />
                     <label htmlFor={`${field.name}`} className="h-full w-full p-2 text-sm">
                        {field.name}
                     </label>

                     <Check size={16} className="ml-auto hidden" />
                  </li>
               );
            })}
         </ul>
      </div>
   );
}
