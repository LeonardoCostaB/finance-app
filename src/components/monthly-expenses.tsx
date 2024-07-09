import { FormattedPrice } from "./formatted-price";
import * as Dialog from "@radix-ui/react-dialog";
import { Input } from "./input";
import { Check, Handshake, Info, Loader2Icon, Trash2 } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { InformationModal } from "./information-modal";
import Link from "next/link";
import { useMutation } from "@apollo/client";
import { CREATE_EXPENSE_ITEM, DELETE_EXPENSE_ITEM, PAY_EXPENSE_ITEM } from "@/graphql/front-end/querys";
import { toast } from "sonner";
import { SubmitButton } from "./submit-button";

interface MonthlyExpensesProps {
   monthId: string
   expense: Expenses;
}

const createNewExpenseFormSchema = z.object({
   name: z.string().min(3, 'Mínimo 3 caracteres'),
   value: z.number().min(1, 'Mínimo R$ 1'),
   link: z.union([z.literal(''), z.string()]),
   notes: z.union([z.literal(''), z.string().min(5, 'Mínimo de 5 caracteres')]),
});

type CreateNewExpenseFormData = z.infer<typeof createNewExpenseFormSchema>;

export function MonthlyExpenses({ monthId, expense }: MonthlyExpensesProps) {
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

   const [createExpenseItem, { loading }] = useMutation(CREATE_EXPENSE_ITEM);
   const [deleteExpenseItem, { loading: deleteLoading }] = useMutation(DELETE_EXPENSE_ITEM);
   const [payExpenseItem, { loading: payLoading }] = useMutation(PAY_EXPENSE_ITEM);;

   const [expenses, setExpenses] = useState<MonthlyExpensesProps['expense']['extract']>([])
   const [shouldShowModal, setShouldShowModal] = useState(false);

   function handleOnSubmit(data: CreateNewExpenseFormData) {
      createExpenseItem({
         variables: {
            data: {
               title: expense.title,
               name: data.name,
               value: data.value,
               link: data.link,
               notes: data.notes
             }
         },
         onCompleted: (data) => {
            setExpenses([...data.addExpenseItem.expenses[0].extract]);

            reset();
            setShouldShowModal(false);
            toast.success('Despesa criada com sucesso!');
         },
         onError: (error) => {
            toast.error(error.message);
         },
      })
   }

   function handleOnDeleteExpenseItem(expenseItemId: string) {
      deleteExpenseItem({
         variables: {
            data: {
               monthId: "clyc8umdi153k07m0uglojucv",
               expenseTitle: expense.title,
               expenseItemId
             }
         },
         onCompleted: (data) => {
            if (data.deleteExpenseItem) {
               setExpenses(prev => prev.filter(prev => prev.id !== expenseItemId));
            }
         },
         onError: (error) => {
            toast.error(error.message);
         },
      });
   }

   function handleOnPayExpense(expenseItemId: string) {
      payExpenseItem({
         variables: {
            data: {
               monthId: "clyc8umdi153k07m0uglojucv",
               expenseTitle: expense.title,
               expenseItemId
             }
         },
         onCompleted: (data) => {
            if (data.payExpense.expenses) {
               setExpenses([...data.payExpense.expenses[0].extract]);
            }
         },
         onError: (error) => {
            toast.error(error.message);
         },
      });
   }

   useEffect(() => {
      setExpenses(expense.extract);
   }, [])

   return (
      <div className="w-1/2 p-4 mt-6 bg-slate-800 rounded-lg box-border">
         <div className="flex items-center justify-between mb-5 px-1">
            <h3 className="text-xl">{expense.title}</h3>

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

                     <InformationModal
                        button={{
                           icon: <Info size={16} className="text-blue-400" />,
                           title: 'Informações'
                        }}
                        modal={{
                           title: expense.name,
                        }}
                     >
                        <div>
                           <div>
                              <span>Data de Publicação:</span>
                              <span>
                                 {new Date(expense.date.published).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                              </span>
                           </div>

                           {expense.date.paidOut && (
                              <div>
                                 <span>Data de Pagamento:</span>
                                 <span>
                                    {new Date(expense.date.paidOut).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                                 </span>
                              </div>
                           )}

                           {expense.link && (
                              <div>
                                 <span>Link:</span>
                                 <Link href={expense.link} target="_blank">{expense.link}</Link>
                              </div>
                           )}

                           {expense.notes && (
                              <div>
                                 <span>Notas:</span>
                                 <span>{expense.notes}</span>
                              </div>
                           )}
                        </div>
                     </InformationModal>

                     {expense.date?.paidOut ? (
                        <span className="inline-block p-1" title="Pago">
                           <Check size={16} className="text-green-400" />
                        </span>
                     ) : (
                        <InformationModal
                           button={{
                              icon: <Handshake size={16} className="text-green-400" />,
                              title: 'Marcar como pago'
                           }}
                           modal={{
                              title: 'Deseja marca como pago ?'
                           }}
                        >
                           <div>
                              <p>
                                 Essa cobrança deixará de contar em sua despesa mensal
                              </p>

                              <SubmitButton
                                 type="button"
                                 loading={payLoading}
                                 bgColor={{ color: 'bg-green-400', hover: 'bg-green-600' }}
                                 onClick={() => handleOnPayExpense(expense.id)}
                              />
                           </div>
                        </InformationModal>
                     )}

                     <InformationModal
                        button={{
                           icon: <Trash2 size={16} className="text-red-400" />,
                           title: 'Deletar despesa'
                        }}
                        modal={{
                           title: 'Deletar despesa'
                        }}
                     >
                        <div>
                           <p>
                              Ao deletar essa despesa ela será perdida para sempre
                           </p>

                           <SubmitButton
                              type="button"
                              loading={deleteLoading}
                              bgColor={{ color: 'bg-red-400', hover: 'bg-red-600' }}
                              onClick={() => handleOnDeleteExpenseItem(expense.name)}
                           />
                        </div>
                     </InformationModal>
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

                        <button
                           type="submit"
                           className="w-full rounded-lg flex items-center justify-center bg-indigo-500 py-2 text-white transition-all duration-300 ease-out hover:bg-indigo-700"
                           disabled={loading}
                        >
                           {loading ? (
                              <Loader2Icon size={24} className="animate-spin" />
                           ) : (
                              'Entrar'
                           )}
                        </button>
                     </form>
                  </Dialog.Content>
               </Dialog.Portal>
            </Dialog.Root>
         </div>
      </div>
   )
}
