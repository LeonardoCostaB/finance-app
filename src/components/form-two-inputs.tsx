import clsx from 'clsx';
import { Input } from './input';
import { Loader2, SendHorizontal, Trash2 } from 'lucide-react';
import { ChangeEvent, FormEvent, useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { formatCurrency } from '@/utils/client/format-currency';

interface FormTwoInputsProps {
   newInput?: {
      toggleOpen: boolean;
      isVisible: boolean;
      onToggleOpen?: (open: boolean) => void;
   };
   inputs: {
      firstInput: {
         id: string;
         type?: string;
         name: string;
         value?: string;
      };
      secondInput: {
         id: string;
         type?: string;
         name: string;
         value?: string | number;
      };
      onSubmit: (data: {
         first: string;
         second: string;
         type: 'create' | 'update';
      }) => Promise<void>;
      onDelete?: (paymentName?: string) => Promise<void>;
   };
}

export function FormTwoInputs({ newInput, inputs }: FormTwoInputsProps) {
   const [firstInputValue, setFirstInputValue] = useState(inputs.firstInput.value);
   const [valueWithMask, setValueWithMask] = useState('');

   const [error, setError] = useState(false);
   const [isLoading, setIsLoading] = useState(false);
   const [isDeleteLoading, setIsDeleteLoading] = useState(false);

   const handleFormatPrice = useCallback((value: string) => {
      value = value.replace(/\D/g, '');

      if (!value) {
         setValueWithMask('');
         return;
      }

      const numberValue = Number(value);

      const formattedValue = formatCurrency(numberValue);

      setValueWithMask(formattedValue);
   }, []);

   async function handleOnSubmit(e: FormEvent) {
      e.preventDefault();

      setIsLoading(true);

      const target = e.target as HTMLFormElement;
      const formData = new FormData(target);

      const firstInput = formData.get(inputs.firstInput.id) as string;
      const secondInput = formData.get(inputs.secondInput.id) as string;

      if (!firstInput || !secondInput) {
         setError(true);

         return toast.info('Preencha os campos: "nome" e "valor"');
      }

      await inputs.onSubmit({
         first: firstInput,
         second: secondInput,
         type: newInput ? 'create' : 'update',
      });

      if (newInput) target.reset();

      setError(false);
      setIsLoading(false);
   }

   async function handleOnDelete() {
      setIsDeleteLoading(true);
      await inputs.onDelete?.(inputs.firstInput.value);
      setIsDeleteLoading(false);
   }

   useEffect(() => {
      if (inputs.secondInput.type === 'number') {
         handleFormatPrice(inputs.secondInput.value?.toString() ?? '');
         return;
      }

      setValueWithMask('');
   }, [inputs.secondInput.value, inputs.secondInput.type, handleFormatPrice]);

   return (
      <form
         className={clsx('relative flex w-full items-stretch transition-all last:mb-0', {
            'mb-8': !newInput,
            'invisible mb-0 max-h-0 opacity-0': !newInput?.toggleOpen && newInput?.isVisible,
            'visible mb-8 max-h-20 opacity-100': newInput?.toggleOpen,
         })}
         onSubmit={handleOnSubmit}
      >
         <Input
            container={{
               classNames: 'border-slate-600',
            }}
            labelProps={{
               text: inputs.firstInput.name,
               filled: true,
               labelClasses: 'bg-slate-900 lg:bg-slate-800',
            }}
            inputProps={{
               id: inputs.firstInput.id,
               type: inputs.firstInput.type ?? 'text',
               classNames: 'bg-slate-900 lg:bg-slate-800 disabled:cursor-no-drop',
               register: {
                  name: inputs.firstInput.id,
                  ...(inputs.secondInput.value ? { value: firstInputValue } : {}),
                  onChange: (e: ChangeEvent<HTMLInputElement>) =>
                     setFirstInputValue(e.target.value),
               },
            }}
            error={{
               show: error,
            }}
         />

         <Input
            container={{
               classNames: 'border-slate-600 !w-[calc(100%-80px)] ml-3 mr-1',
            }}
            labelProps={{
               text: inputs.secondInput.name,
               filled: true,
               labelClasses: 'bg-slate-900 lg:bg-slate-800',
            }}
            inputProps={{
               id: inputs.secondInput.id,
               type: 'text',
               classNames: 'bg-slate-900 lg:bg-slate-800 disabled:cursor-no-drop',
               register: {
                  name: inputs.secondInput.id,
                  ...(inputs.secondInput.value ? { value: valueWithMask } : {}),
                  onChange: (e: ChangeEvent<HTMLInputElement>) => handleFormatPrice(e.target.value),
               },
            }}
            error={{
               show: error,
            }}
         />

         {inputs.onDelete && (
            <button
               type="button"
               className="mr-1 w-10 rounded-lg border border-slate-600 p-2 disabled:cursor-no-drop disabled:opacity-50"
               onClick={handleOnDelete}
               disabled={isDeleteLoading}
            >
               {isDeleteLoading ? (
                  <Loader2 size={18} className="animate-spin" />
               ) : (
                  <Trash2 size={18} />
               )}
            </button>
         )}

         <button
            type="submit"
            className="w-10 rounded-lg border border-slate-600 p-2 disabled:cursor-no-drop disabled:opacity-50"
            disabled={isLoading}
         >
            {isLoading ? (
               <Loader2 size={18} className="animate-spin" />
            ) : (
               <SendHorizontal size={18} />
            )}
         </button>
      </form>
   );
}
