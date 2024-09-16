import clsx from 'clsx';
import { Input } from './input';
import { SendHorizontal } from 'lucide-react';
import { ChangeEvent, FormEvent, useState } from 'react';
import { toast } from 'sonner';

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
   };
}

export function FormTwoInputs({ newInput, inputs }: FormTwoInputsProps) {
   const [error, setError] = useState(false);
   const [firstInputValue, setFirstInputValue] = useState(inputs.firstInput.value);
   const [secondInputValue, setSecondInputValue] = useState(inputs.secondInput.value);

   function handleOnSubmit(e: FormEvent) {
      e.preventDefault();

      const target = e.target as HTMLFormElement;
      const formData = new FormData(target);

      const firstInput = formData.get(inputs.firstInput.id) as string;
      const secondInput = formData.get(inputs.secondInput.id) as string;

      if (!firstInput || !secondInput) {
         setError(true);

         return toast.info('Preencha os campos: "nome" e "valor"');
      }

      console.log(firstInput, secondInput);

      setError(false);
      toast.success('Novo pagamento salvo');
   }

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
               labelClasses: 'bg-slate-800',
            }}
            inputProps={{
               id: inputs.firstInput.id,
               type: inputs.firstInput.type ?? 'text',
               classNames: 'bg-slate-800 disabled:cursor-no-drop',
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
               labelClasses: 'bg-slate-800',
            }}
            inputProps={{
               id: inputs.secondInput.id,
               type: inputs.secondInput.type ?? 'text',
               classNames: 'bg-slate-800 disabled:cursor-no-drop',
               register: {
                  name: inputs.secondInput.id,
                  ...(inputs.secondInput.value ? { value: secondInputValue } : {}),
                  onChange: (e: ChangeEvent<HTMLInputElement>) =>
                     setSecondInputValue(e.target.value),
               },
            }}
            error={{
               show: error,
            }}
         />

         <button type="submit" className="w-10 rounded-lg border border-slate-600 p-2">
            <SendHorizontal size={18} />
         </button>
      </form>
   );
}
