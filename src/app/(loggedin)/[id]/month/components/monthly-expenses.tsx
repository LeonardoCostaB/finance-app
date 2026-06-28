import { useCallback, useEffect, useState } from 'react';
import { useMutation } from '@apollo/client';
import * as Dialog from '@radix-ui/react-dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { z } from 'zod';
import clsx from 'clsx';

import { Input } from '@/components/input';
import { FormattedPrice } from '@/components/formatted-price';
import { InformationModal } from '@/components/information-modal';
import { SubmitButton } from '@/components/submit-button';
import { UpdateMonthSubItems } from './update-month-sub-items';

import { useLoggedIn } from '@/hooks/use-loggedIn';
import { GET_USER_BY_EMAIL } from '@/context/loggedIn-context';
import {
   CREATE_EXPENSE_ITEM,
   DELETE_EXPENSE,
   DELETE_EXPENSE_ITEM,
   PAY_EXPENSE_ITEM,
} from '@/graphql/client/mutations/month';

import { Check, ChevronDown, ChevronUp, Handshake, Loader2Icon, Trash2, X } from 'lucide-react';
import { formatCurrency } from '@/utils/client/format-currency';

interface MonthlyExpensesProps {
   monthId: string;
   expense: Expenses;
}

const createNewExpenseFormSchema = z.object({
   name: z
      .string()
      .min(3, 'Mínimo 3 caracteres')
      .transform((name) => (name[0].toUpperCase() + name.substring(1)).trim()),
   value: z.number().min(1, 'Mínimo R$ 1'),
   link: z.union([z.literal(''), z.string()]),
   notes: z.union([z.literal(''), z.string().min(5, 'Mínimo de 5 caracteres')]),
});

type CreateNewExpenseFormData = z.infer<typeof createNewExpenseFormSchema>;

export function MonthlyExpenses({ monthId, expense }: MonthlyExpensesProps) {
   const { user, updateUser } = useLoggedIn();

   const {
      register,
      handleSubmit,
      setValue,
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
   const [payExpenseItem, { loading: payLoading }] = useMutation(PAY_EXPENSE_ITEM);
   const [deleteExpense, { loading: deleteExpenseLoading }] = useMutation(DELETE_EXPENSE);

   const [expenses, setExpenses] = useState<MonthlyExpensesProps['expense']['extract']>([]);
   const [shouldShowModal, setShouldShowModal] = useState(false);
   const [shouldShowListOptions, setShouldShowListOptions] = useState(false);
   const [valueWithMask, setValueWithMask] = useState('');

   const handleFormatPrice = useCallback((value: string) => {
      value = value.replace(/\D/g, '');
      setValue('value', +value);
      console.log(value);

      if (!value) {
         setValueWithMask('');
         return;
      }

      const numberValue = Number(value);

      const formattedValue = formatCurrency(numberValue);

      setValueWithMask(formattedValue);
   }, []);

   async function handleOnSubmit(data: CreateNewExpenseFormData) {
      await createExpenseItem({
         variables: {
            monthId,
            data: {
               title: expense.title,
               name: data.name,
               value: data.value,
               link: data.link,
               notes: data.notes,
            },
         },
         update: (cache, { data }) => {
            if (user) {
               const newExpensesItems = [...(data.addExpenseItem.expenses as Months['expenses'])];

               const updatedData = {
                  ...user,
                  months: [
                     ...user.months.filter((month) => month.id !== monthId),
                     ...user.months
                        .filter((month) => month.id === monthId)
                        .map((month) => ({
                           ...month,
                           expenses: newExpensesItems,
                        })),
                  ],
               };

               cache.writeQuery({
                  query: GET_USER_BY_EMAIL,
                  data: {
                     user: updatedData,
                  },
                  variables: { email: '' },
               });

               updateUser(updatedData);

               setExpenses(
                  updatedData.months
                     .filter((month) => month.id === monthId)[0]
                     .expenses.filter((exp) => exp.title === expense.title)[0].extract,
               );
            }
         },
         onCompleted: () => {
            reset();
            setShouldShowModal(false);
            toast.success('Despesa criada com sucesso!');
         },
         onError: (error) => {
            toast.error(error.message);
         },
      });
   }

   function handleOnDeleteBlock() {
      deleteExpense({
         variables: {
            data: {
               monthId,
               title: expense.title,
            },
         },
         update: (cache) => {
            const existingData: { user: User } | null = cache.readQuery({
               query: GET_USER_BY_EMAIL,
               variables: { email: '' },
            });

            if (existingData) {
               const updatedData = {
                  ...existingData.user,
                  months: [
                     ...existingData.user.months.filter((month) => month.id !== monthId),
                     ...existingData.user.months
                        .filter((month) => month.id === monthId)
                        .map((month) => ({
                           ...month,
                           expenses: month.expenses.filter((exp) => exp.title !== expense.title),
                        })),
                  ],
               };

               cache.writeQuery({
                  query: GET_USER_BY_EMAIL,
                  data: {
                     user: updatedData,
                  },
                  variables: { email: '' },
               });

               updateUser(updatedData);
            }
         },
         onCompleted: () => {
            toast.success('Bloco de despesas excluído com sucesso!');
         },
         onError: (error) => {
            toast.error(error.message);
         },
      });
   }

   function handleOnDeleteExpenseItem(expenseItemId: string) {
      deleteExpenseItem({
         variables: {
            data: {
               monthId,
               expenseTitle: expense.title,
               expenseItemId,
            },
         },
         update: (cache) => {
            const existingData: { user: User } | null = cache.readQuery({
               query: GET_USER_BY_EMAIL,
               variables: { email: '' },
            });

            if (existingData) {
               const updatedData = {
                  ...existingData.user,
                  months: [
                     ...existingData.user.months.filter((month) => month.id !== monthId),
                     ...existingData.user.months
                        .filter((month) => month.id === monthId)
                        .map((month) => {
                           const expenses = month.expenses.flatMap((ex) => {
                              const extract = ex.extract.filter(
                                 (extract) => extract.id !== expenseItemId,
                              );

                              return {
                                 ...ex,
                                 extract,
                              };
                           });

                           return {
                              ...month,
                              expenses,
                           };
                        }),
                  ],
               };

               cache.writeQuery({
                  query: GET_USER_BY_EMAIL,
                  data: {
                     user: updatedData,
                  },
                  variables: { email: '' },
               });

               updateUser(updatedData);

               setExpenses((prev) => prev.filter((prev) => prev.id !== expenseItemId));
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
               monthId,
               expenseTitle: expense.title,
               expenseItemId,
            },
         },
         update: (cache, { data }) => {
            const existingData: { user: User } | null = cache.readQuery({
               query: GET_USER_BY_EMAIL,
               variables: { email: '' },
            });

            if (existingData) {
               const updatedData = {
                  ...existingData.user,
                  months: [
                     ...existingData.user.months.filter((month) => month.id !== monthId),
                     ...existingData.user.months
                        .filter((month) => month.id === monthId)
                        .map((month) => ({
                           ...month,
                           expenses: data.payExpense.expenses,
                        })),
                  ],
               };

               cache.writeQuery({
                  query: GET_USER_BY_EMAIL,
                  data: {
                     user: updatedData,
                  },
                  variables: { email: '' },
               });

               updateUser(updatedData);

               setExpenses([
                  ...data.payExpense.expenses.find((ex: Expenses) => ex.title === expense.title)
                     .extract,
               ]);
            }
         },
         onError: (error) => {
            console.log(error);
            toast.error(error.message);
         },
      });
   }

   useEffect(() => {
      setExpenses([...expense.extract].sort((a, b) => b.value - a.value));
   }, [expense.extract]);

   return (
      <div className="mt-6 box-border w-full rounded-lg bg-slate-800 p-4 first:mt-0">
         <div className="mb-5 flex items-center justify-between px-1">
            <h3 className="text-xl capitalize">{expense.title}</h3>

            <div className="flex items-center gap-2">
               <FormattedPrice
                  price={expenses.reduce((a, b) => a + b.value, 0)}
                  style="spent"
                  classNames="text-xl"
               />

               {expenses.length > 1 && (
                  <div className="relative flex items-center">
                     <button
                        type="button"
                        onClick={() => setShouldShowListOptions(!shouldShowListOptions)}
                     >
                        <svg
                           xmlns="http://www.w3.org/2000/svg"
                           width="18"
                           height="18"
                           viewBox="0 0 24 24"
                           fill="none"
                           stroke="currentColor"
                           strokeWidth="2"
                           strokeLinecap="round"
                           strokeLinejoin="round"
                           className="lucide lucide-ellipsis-vertical"
                        >
                           <circle cx="12" cy="12" r="1" />
                           <circle cx="12" cy="5" r="1" />
                           <circle cx="12" cy="19" r="1" />
                        </svg>
                     </button>

                     <div
                        className={clsx(
                           'absolute right-0 top-8 w-max overflow-hidden rounded-lg bg-slate-700 transition-all duration-300',
                           {
                              'max-h-0': !shouldShowListOptions,
                              'max-h-40': shouldShowListOptions,
                           },
                        )}
                     >
                        <ul>
                           <li>
                              <button
                                 type="button"
                                 onClick={() => {
                                    setExpenses((prev) =>
                                       [...prev].sort((a, b) => b.value - a.value),
                                    );
                                    setShouldShowListOptions(false);
                                 }}
                                 className="flex w-full cursor-pointer items-center gap-1 p-3 text-center text-sm hover:bg-slate-600"
                              >
                                 <ChevronUp size={16} /> Maior para o menor
                              </button>
                           </li>

                           <li>
                              <button
                                 type="button"
                                 onClick={() => {
                                    setExpenses((prev) =>
                                       [...prev].sort((a, b) => a.value - b.value),
                                    );
                                    setShouldShowListOptions(false);
                                 }}
                                 className="flex w-full cursor-pointer items-center gap-1 p-3 text-center text-sm hover:bg-slate-600"
                              >
                                 <ChevronDown size={16} /> Menor para o maior
                              </button>
                           </li>
                        </ul>
                     </div>
                  </div>
               )}
            </div>
         </div>

         <ul
            id="month-sub-items"
            className="flex max-h-[285px] flex-col items-center overflow-y-auto"
         >
            {expenses.map((expenseItem) => (
               <li
                  key={expenseItem.id}
                  className="flex w-full items-center justify-between border-b px-1 py-4 text-sm text-gray-400"
               >
                  {expenseItem.name}

                  <div className="flex items-center gap-2">
                     <FormattedPrice
                        price={expenseItem.value}
                        style="normal"
                        classNames="text-sm"
                     />

                     <UpdateMonthSubItems
                        monthId={monthId}
                        extract={expenseItem}
                        blockTitle={expense.title}
                        type="expenses"
                     />

                     {expenseItem.date?.paidOut ? (
                        <span className="inline-block p-1" title="Pago">
                           <Check size={16} className="text-green-400" />
                        </span>
                     ) : (
                        <InformationModal
                           button={{
                              icon: <Handshake size={16} className="text-green-400" />,
                              title: 'Marcar como pago',
                           }}
                           modal={{
                              title: expenseItem.name,
                              openAtTheBottom: true,
                              centeredTitle: true,
                           }}
                        >
                           <div className="flex flex-col items-center gap-4">
                              <p>Deseja marca como paga?</p>

                              <SubmitButton
                                 type="button"
                                 loading={payLoading}
                                 bgColor={{ color: 'bg-green-400', hover: 'bg-green-600' }}
                                 onClick={() => handleOnPayExpense(expenseItem.id)}
                                 text="Pagar"
                              />
                           </div>
                        </InformationModal>
                     )}

                     <InformationModal
                        button={{
                           icon: <Trash2 size={16} className="text-red-400" />,
                           title: 'Deletar despesa',
                        }}
                        modal={{
                           title: expenseItem.name,
                           openAtTheBottom: true,
                           centeredTitle: true,
                        }}
                     >
                        <div className="flex flex-col items-center gap-4">
                           <p>Essa despesa será excluída para sempre</p>

                           <SubmitButton
                              type="button"
                              loading={deleteLoading}
                              bgColor={{ color: 'bg-red-400', hover: 'bg-red-600' }}
                              onClick={() => handleOnDeleteExpenseItem(expenseItem.id)}
                              text="Deletar"
                           />
                        </div>
                     </InformationModal>
                  </div>
               </li>
            ))}
         </ul>

         <div className="mt-6 flex w-full justify-end gap-2">
            <Dialog.Root open={shouldShowModal} onOpenChange={(open) => setShouldShowModal(open)}>
               <Dialog.Trigger type="button" className="rounded-lg border p-2">
                  {expenses.length > 0 ? 'Adicionar mais +' : 'Adicione uma despesa'}
               </Dialog.Trigger>

               <Dialog.Portal>
                  <Dialog.Overlay className="fixed inset-0 z-40 animate-overlayShow bg-black/30" />

                  <Dialog.Content className="fixed left-1/2 top-1/2 z-40 w-full max-w-md -translate-x-1/2 -translate-y-1/2 animate-contentShow rounded-xl bg-slate-700 p-4 max-lg:w-[95%] lg:ml-11">
                     <div className="mb-4 flex w-full items-center lg:justify-center">
                        <Dialog.Title className="inline-block w-full text-center text-xl capitalize max-lg:pl-7">
                           {expense.title}
                        </Dialog.Title>

                        <Dialog.DialogClose className="lg:hidden">
                           <X />
                        </Dialog.DialogClose>
                     </div>

                     <form className="flex flex-col gap-7" onSubmit={handleSubmit(handleOnSubmit)}>
                        <Input
                           labelProps={{
                              text: 'Nome:',
                              filled: watch('name')?.length > 0,
                              labelClasses: 'bg-slate-700',
                           }}
                           inputProps={{
                              id: 'expense-name',
                              type: 'text',
                              required: true,
                              classNames: 'bg-slate-700',
                              register: { ...register('name') },
                           }}
                           error={{
                              show: !!errors.name,
                              message: errors.name?.message,
                           }}
                        />

                        <Input
                           labelProps={{
                              text: 'Valor:',
                              filled: watch('value')?.toString().length > 0,
                              labelClasses: 'bg-slate-700',
                           }}
                           inputProps={{
                              id: 'expense-value',
                              type: 'text',
                              required: true,
                              classNames: 'bg-slate-700',
                              register: {
                                 value: valueWithMask,
                                 onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                                    handleFormatPrice(e.target.value),
                              },
                           }}
                           error={{
                              show: !!errors.value,
                              message: errors.value?.message,
                           }}
                        />
                        <input type="hidden" {...register('value', { valueAsNumber: true })} />

                        <div>
                           <span className="mb-4 inline-block text-sm">Informações Adicionais</span>

                           <div className="flex flex-col gap-7">
                              <Input
                                 labelProps={{
                                    text: 'Link:',
                                    filled: watch('link')?.length > 0,
                                    labelClasses: 'bg-slate-700',
                                 }}
                                 inputProps={{
                                    id: 'expense-value',
                                    type: 'text',
                                    classNames: 'bg-slate-700',
                                    register: { ...register('link') },
                                 }}
                                 error={{
                                    show: !!errors.link,
                                    message: errors.link?.message,
                                 }}
                              />

                              <Input
                                 container={{
                                    classNames: 'h-full',
                                 }}
                                 labelProps={{
                                    text: 'Anotações:',
                                    filled: watch('notes')?.length > 0,
                                    labelClasses: 'bg-slate-700',
                                 }}
                                 inputProps={{
                                    id: 'expense-notes',
                                    type: 'textarea',
                                    classNames: 'bg-slate-700 pt-3 min-h-24 max-h-60',
                                    register: { ...register('notes') },
                                 }}
                                 error={{
                                    show: !!errors.notes,
                                    message: errors.notes?.message,
                                 }}
                              />
                           </div>
                        </div>

                        <button
                           type="submit"
                           className="flex w-full items-center justify-center rounded-lg bg-indigo-500 py-2 text-white transition-all duration-300 ease-out hover:bg-indigo-700"
                           disabled={loading}
                        >
                           {loading ? (
                              <Loader2Icon size={24} className="animate-spin" />
                           ) : (
                              'Adicionar'
                           )}
                        </button>
                     </form>
                  </Dialog.Content>
               </Dialog.Portal>
            </Dialog.Root>

            <InformationModal
               button={{
                  icon: <Trash2 size={20} />,
                  buttonClasses:
                     'w-[42px] flex p-0 items-center justify-center border border-white rounded-lg transition-all hover:bg-red-400 hover:border-red-400',
               }}
               modal={{
                  title: expense.title,
                  openAtTheBottom: true,
                  centeredTitle: true,
               }}
            >
               <div className="flex flex-col items-center gap-4">
                  <p>Esse bloco será excluído para sempre</p>

                  <SubmitButton
                     type="button"
                     loading={deleteExpenseLoading}
                     bgColor={{ color: 'bg-red-400', hover: 'bg-red-600' }}
                     onClick={handleOnDeleteBlock}
                     text="Deletar"
                  />
               </div>
            </InformationModal>
         </div>
      </div>
   );
}
