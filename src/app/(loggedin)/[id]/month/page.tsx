'use client';

import { FormEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useMutation } from '@apollo/client';
import clsx from 'clsx';

import { useLoggedIn } from '@/hooks/use-loggedIn';
import { GET_USER_BY_EMAIL } from '@/context/loggedIn-context';
import { CREATE_EARNING_OR_EXPENSE } from '@/graphql/client/mutations/month';

import { CircleFadingPlus, X } from 'lucide-react';
import { FormattedPrice } from '@/components/formatted-price';
import { Header } from '@/components/header';
import { Input } from '@/components/input';
import { MonthlyEarnings } from '@/components/monthly-earnings';
import { MonthlyExpenses } from '@/components/monthly-expenses';
import { SubmitButton } from '@/components/submit-button';
import { MoreOptions } from '@/components/more-options';
import { MonthlySummary } from '@/components/monthly-summary';

export default function Month({ params }: { params: { id: string } }) {
   const { user, updateUser } = useLoggedIn();
   const [createEarningOrExpense, { loading }] = useMutation(CREATE_EARNING_OR_EXPENSE);

   const [month, setMonth] = useState<User['months'] | undefined>([]);

   const [toggleLayout, setToggleLayout] = useState<'profit' | 'spent'>('profit');
   const [shouldShowModal, setShouldShowModal] = useState(false);

   function handleOnCreateBlock(e: FormEvent) {
      e.preventDefault();

      const target = e.target as HTMLFormElement;
      const formData = new FormData(target);
      const title = formData.get('block-title');

      createEarningOrExpense({
         variables: {
            data: {
               monthId: params.id,
               title,
               type: toggleLayout === 'profit' ? 'earnings' : 'expenses',
            },
         },
         onCompleted: () => {
            toast.success('Bloco creado com sucesso');
            setShouldShowModal(false);
         },
         update: (cache, { data }) => {
            const existingData: { user: User } | null = cache.readQuery({
               query: GET_USER_BY_EMAIL,
               variables: { email: '' },
            });

            if (existingData) {
               const months = [
                  ...existingData.user.months.filter((month: any) => month.id !== params.id),
                  ...existingData.user.months
                     .filter((month: any) => month.id === params.id)
                     .map((month: any) => [
                        {
                           ...month,
                           earnings: data.createEarningOrExpense.earnings ?? month.earnings,
                           expenses: data.createEarningOrExpense.expenses ?? month.expenses,
                        },
                     ])[0],
               ];

               const updatedData = {
                  ...existingData.user,
                  months,
               };

               cache.writeQuery({
                  query: GET_USER_BY_EMAIL,
                  data: {
                     user: updatedData,
                  },
                  variables: { email: '' },
               });

               updateUser(updatedData);
            } else {
               if (user) {
                  const months = [
                     ...user.months.filter((month: any) => month.id !== params.id),
                     ...user.months
                        .filter((month: any) => month.id === params.id)
                        .map((month: any) => [
                           {
                              ...month,
                              earnings: data.createEarningOrExpense.earnings ?? month.earnings,
                              expenses: data.createEarningOrExpense.expenses ?? month.expenses,
                           },
                        ])[0],
                  ];

                  const updatedData = {
                     ...user,
                     months,
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
            }
         },
         onError: (error) => {
            console.log(error);
            toast.error(error.message);
         },
      });
   }

   useEffect(() => {
      setMonth(user?.months.filter((month) => month.id === params.id));
   }, [params.id, user]);

   return (
      <>
         <Header />

         <main className="relative mx-auto mb-20 flex max-w-6xl flex-col max-xl:px-6 max-lg:px-4">
            {month && month.length > 0 ? (
               <>
                  <div className="flex w-[calc(100%-332px)] items-center justify-center max-lg:w-full">
                     <h1 className="flex-1 pl-[80px] text-center text-4xl max-lg:pl-0 max-lg:text-left">
                        {month[0]?.title}
                     </h1>

                     <div className="flex items-center gap-4">
                        <div className="relative flex">
                           <button
                              type="button"
                              onClick={() => setShouldShowModal(!shouldShowModal)}
                           >
                              <CircleFadingPlus size={24} />
                           </button>

                           {shouldShowModal && (
                              <div className="fixed inset-0 z-40 animate-overlayShow bg-black/30 lg:hidden" />
                           )}

                           <div
                              className={clsx(
                                 'add-new-block-mobile absolute top-9 z-40 rounded-lg bg-slate-700 px-2 py-4 transition-all ease-linear max-lg:duration-500 lg:left-1/2 lg:-translate-x-1/2',
                                 {
                                    'invisible max-h-0 opacity-0': !shouldShowModal,
                                    'opacity-1 visible max-h-80': shouldShowModal,
                                 },
                              )}
                              onMouseLeave={() => setShouldShowModal(false)}
                           >
                              <div className="mb-4 flex w-full items-center lg:justify-center">
                                 <h2 className="text-center max-lg:w-full max-lg:pl-7">
                                    Criar um novo bloco de{' '}
                                    {toggleLayout === 'profit' ? 'ganho' : 'despesa'}
                                 </h2>

                                 <button
                                    type="button"
                                    className="lg:hidden"
                                    onClick={() => setShouldShowModal(false)}
                                 >
                                    <X size={28} />
                                 </button>
                              </div>

                              <form
                                 className="flex w-[300px] flex-col gap-4"
                                 onSubmit={handleOnCreateBlock}
                              >
                                 <Input
                                    labelProps={{
                                       text: 'Titulo',
                                       filled: true,
                                       labelClasses: 'bg-slate-700',
                                    }}
                                    inputProps={{
                                       type: 'text',
                                       id: 'block-title',
                                       classNames: 'bg-slate-700',
                                    }}
                                 />

                                 <SubmitButton
                                    type="submit"
                                    text="Criar"
                                    loading={loading}
                                    bgColor={{
                                       color: 'bg-indigo-500',
                                       hover: 'bg-indigo-700',
                                    }}
                                 />
                              </form>
                           </div>
                        </div>

                        <MoreOptions month={month[0].id} monthDate={month[0].date} />
                     </div>
                  </div>

                  <div className="flex items-stretch justify-center gap-8 max-lg:flex-col-reverse max-lg:gap-4">
                     <div className="flex w-full flex-col items-center">
                        <div className="justify-cente flex w-full rounded-xl bg-slate-800 p-4 lg:mt-10">
                           <button
                              type="button"
                              className={clsx(
                                 'flex flex-1 flex-col items-center gap-4 text-xl transition-all',
                                 {
                                    'text-green-500': toggleLayout === 'profit',
                                    'text-slate-500': toggleLayout === 'spent',
                                 },
                              )}
                              onClick={() => setToggleLayout('profit')}
                           >
                              Ganhos
                              <span
                                 className={clsx(
                                    'block h-1 w-full bg-green-500 transition-all ease-linear',
                                    {
                                       'bg-green-500': toggleLayout === 'profit',
                                       'bg-slate-500': toggleLayout === 'spent',
                                    },
                                 )}
                              />
                           </button>

                           <button
                              type="button"
                              className={clsx(
                                 'flex flex-1 flex-col items-center gap-4 text-xl transition-all',
                                 {
                                    'text-red-400': toggleLayout === 'spent',
                                    'text-slate-500': toggleLayout === 'profit',
                                 },
                              )}
                              onClick={() => setToggleLayout('spent')}
                           >
                              Despesas
                              <span
                                 className={clsx('block h-1 w-full transition-all ease-linear', {
                                    'bg-red-400': toggleLayout === 'spent',
                                    'bg-slate-500': toggleLayout === 'profit',
                                 })}
                              />
                           </button>
                        </div>

                        {toggleLayout === 'profit' && user && user.monthlySalary > 0 && (
                           <span className="mt-6 box-border flex w-full items-center justify-between rounded-lg bg-slate-800 p-4 text-xl">
                              Salario: <FormattedPrice price={user.monthlySalary} style="profit" />
                           </span>
                        )}

                        {month.map((month) =>
                           toggleLayout === 'profit'
                              ? month.earnings.map((earning) => (
                                   <MonthlyEarnings
                                      key={earning.title}
                                      monthId={params.id}
                                      earnings={{
                                         title: earning.title,
                                         extract: earning.extract,
                                      }}
                                   />
                                ))
                              : month.expenses.map((expense) => (
                                   <MonthlyExpenses
                                      key={expense.title}
                                      monthId={params.id}
                                      expense={{
                                         title: expense.title,
                                         extract: expense.extract,
                                      }}
                                   />
                                )),
                        )}
                     </div>

                     <MonthlySummary
                        month={month}
                        userEconomy={user?.economy?.extract}
                        monthlySalary={user?.monthlySalary}
                     />
                  </div>
               </>
            ) : (
               <h1>Not Found</h1>
            )}
         </main>
      </>
   );
}
