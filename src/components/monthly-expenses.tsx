import { FormattedPrice } from "./formatted-price";
import * as Dialog from "@radix-ui/react-dialog";
import { Input } from "./input";
import { Handshake, Info, Trash2 } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";

interface MonthlyExpensesProps {
   extract: {
      title: string;
      expenses: Array<{
         id: string;
         name: string;
         value: number;
         date: {
            published: string;
            paidOut?: string;
         };
      }>;
   }
}

const createNewExpenseFormSchema = z.object({
   name: z.string().min(3, 'Mínimo 3 caracteres'),
   value: z.number().min(1, 'Mínimo R$ 1'),
   link: z.union([z.literal(''), z.string()]),
   notes: z.union([z.literal(''), z.string().min(5, 'Mínimo de 5 caracteres')]),
});

type CreateNewExpenseFormData = z.infer<typeof createNewExpenseFormSchema>;

export function MonthlyExpenses({ extract }: MonthlyExpensesProps) {
   const {
      register,
      handleSubmit,
      watch,
      reset,
      formState: { errors },
   } = useForm<CreateNewExpenseFormData>({
      resolver: zodResolver(createNewExpenseFormSchema),
      defaultValues: {
         value: 0,
         link: '',
      },
   });

   const [expenses, setExpenses] = useState<MonthlyExpensesProps['extract']['expenses']>([])
   const [shouldShowModal, setShouldShowModal] = useState(false);

   function handleOnSubmit(data: CreateNewExpenseFormData) {
      console.log(data);

      setExpenses([
         ...expenses,
         {
            id: data.name,
            name: data.name,
            value: data.value,
            date: {
               published: new Date().toISOString(),
            }
         }
      ]);

      reset();
      setShouldShowModal(false);
   }

   useEffect(() => {
      setExpenses(extract.expenses);
   }, [])

   return (
      <div className="w-1/2 p-4 mt-6 bg-slate-800 rounded-lg box-border">
         <div className="flex items-center justify-between mb-5 px-1">
            <h3 className="text-xl">{extract.title}</h3>

            <FormattedPrice
               price={expenses.reduce((a, b) => a + b.value, 0)}
               style="spent"
               classNames="text-xl"
            />
         </div>

         <ul className="flex flex-col items-center justify-center">
            {expenses.map((expense) => (
               <li
                  key={expense.id}
                  className="py-4 px-1 border-b w-full flex items-center justify-between text-sm text-gray-400"
               >
                  {expense.name}

                  <div className="flex items-center gap-2">
                     <FormattedPrice price={expense.value} style="normal" classNames="text-sm" />


                     <button type="button" title="Informações">
                        <Info size={16} className="text-blue-400" />
                     </button>

                     <button type="button" title="Realizei o pagamento">
                        <Handshake size={16} className="text-green-400" />
                     </button>

                     <button type="button" title="Deletar despesa">
                        <Trash2 size={16} className="text-red-400" />
                     </button>
                  </div>

               </li>
            ))}
         </ul>

         <div className="w-full flex justify-end mt-6">
            <Dialog.Root open={shouldShowModal} onOpenChange={(open) => setShouldShowModal(open)}>
               <Dialog.Trigger type="button" className="border p-2 rounded-lg">
                  Adicionar mais +
               </Dialog.Trigger>

               <Dialog.Portal>
                  <Dialog.Overlay className="absolute inset-0 bg-black/30" />

                  <Dialog.Content className="max-w-md w-full p-4 ml-11 rounded-xl bg-slate-700 absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2">
                     <Dialog.Title className="inline-block w-full mb-4 text-xl text-center">
                        Adicionar despesa
                     </Dialog.Title>

                     <form className="flex flex-col gap-7" onSubmit={handleSubmit(handleOnSubmit)}>
                        <Input
                           labelProps={{
                              text: 'Nome:',
                              filled: watch('name')?.length > 0,
                              labelClasses: 'bg-slate-700'
                           }}
                           inputProps={{
                              id: 'expense-name',
                              type: 'text',
                              required: true,
                              classNames: 'bg-slate-700',
                              register: { ...register('name') }
                           }}
                           error={{
                              show:!!errors.name,
                              message: errors.name?.message,
                           }}
                        />

                        <Input
                           labelProps={{
                              text: 'Valor:',
                              filled: watch('value')?.toString().length > 0,
                              labelClasses: 'bg-slate-700'
                           }}
                           inputProps={{
                              id: 'expense-value',
                              type: 'number',
                              required: true,
                              classNames: 'bg-slate-700',
                              register: { ...register('value', { valueAsNumber: true }) }
                           }}
                           error={{
                              show:!!errors.value,
                              message: errors.value?.message,
                           }}
                        />

                        <div>
                           <span className="mb-4 inline-block text-sm">Informações Adicionais</span>

                           <div className="flex flex-col gap-7">
                              <Input
                                 labelProps={{
                                    text: 'Link:',
                                    filled: watch('link')?.length > 0,
                                    labelClasses: 'bg-slate-700'
                                 }}
                                 inputProps={{
                                    id: 'expense-value',
                                    type: 'text',
                                    classNames: 'bg-slate-700',
                                    register: { ...register('link') }
                                 }}
                                 error={{
                                    show:!!errors.link,
                                    message: errors.link?.message,
                                 }}
                              />

                              <Input
                                 container={{
                                    classNames: 'h-full'
                                 }}
                                 labelProps={{
                                    text: 'Anotações:',
                                    filled: watch('notes')?.length > 0,
                                    labelClasses: 'bg-slate-700'
                                 }}
                                 inputProps={{
                                    id: 'expense-notes',
                                    type: 'textarea',
                                    classNames: 'bg-slate-700 pt-3 min-h-24 max-h-60',
                                    register: { ...register('notes') }
                                 }}
                                 error={{
                                    show:!!errors.notes,
                                    message: errors.notes?.message,
                                 }}
                              />
                           </div>
                        </div>

                        <button type="submit">
                           Salvar
                        </button>
                     </form>
                  </Dialog.Content>
               </Dialog.Portal>
            </Dialog.Root>
         </div>
      </div>
   )
}
