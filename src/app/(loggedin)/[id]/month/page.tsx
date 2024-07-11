'use client'

import { Header } from "@/components/header";
import { Input } from "@/components/input";
import { MonthlyEarnings } from "@/components/monthly-earnings";
import { MonthlyExpenses } from "@/components/monthly-expenses";
import { SubmitButton } from "@/components/submit-button";
import { GET_USER_BY_EMAIL } from "@/context/loggedIn-context";
import { CREATE_EARNING_OR_EXPENSE } from "@/graphql/front-end/querys";
import { useLoggedIn } from "@/hooks/use-loggedIn";
import { useMutation } from "@apollo/client";
import clsx from "clsx";
import { CircleFadingPlus } from "lucide-react";
import { FormEvent, useEffect, useState } from "react"
import { toast } from "sonner";

export default function Month({ params }: { params: { id: string } }) {
   const { user, updateUser } = useLoggedIn();
   const [createEarningOrExpense, { loading }] = useMutation(CREATE_EARNING_OR_EXPENSE);

   const [month, setMonth] = useState<User['months'] | undefined>([]);

   const [toggleLayout, setToggleLayout] = useState<'profit' | 'spent'>('profit');
   const [shouldShowModal, setShouldShowModal] = useState(false);

   async function handleOnCreateBlock(e: FormEvent) {
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
            }
         },
         update: (cache, { data }) => {
            const existingData: { user: User } | null = cache.readQuery({
               query: GET_USER_BY_EMAIL,
               variables: { email: '' },
            });

            if (existingData) {
               const months = [
                  ...existingData.user.months.filter((month: any) => month.id !== params.id),
                  ...existingData.user.months.filter((month: any) => month.id === params.id).map((month: any) => ([
                     {
                        ...month,
                        earnings: data.createEarningOrExpense.earnings ?? month.earnings,
                        expenses: data.createEarningOrExpense.expenses ?? month.expenses,
                     }
                  ]))[0]
               ]

               const updatedData = {
                  ...existingData.user,
                  months,
               };

               cache.writeQuery({
                  query: GET_USER_BY_EMAIL,
                  data: updatedData,
                  variables: { email: '' },
               });

               updateUser(updatedData)
            } else {
               if (user) {
                  const months = [
                     ...user.months.filter((month: any) => month.id !== params.id),
                     ...user.months.filter((month: any) => month.id === params.id).map((month: any) => ([
                        {
                           ...month,
                           earnings: data.createEarningOrExpense.earnings ?? month.earnings,
                           expenses: data.createEarningOrExpense.expenses ?? month.expenses,
                        }
                     ]))[0]
                  ]

                  const updatedData = {
                     ...user,
                     months,
                  };

                  cache.writeQuery({
                     query: GET_USER_BY_EMAIL,
                     data: updatedData,
                     variables: { email: '' },
                  });

                  updateUser(updatedData)
               }
            }
         },
         onError: (error) => {
            console.log(error)
            toast.error(error.message);
         },
      })
   }

   useEffect(() => {
      setMonth(user?.months.filter(month => month.id === params.id))
   }, [params.id, user])

   console.log(month)

   return month && user && user.months ? (
      <>
         <Header />

         <main className="flex flex-col items-center max-w-7xl mx-auto mb-20">
            <div className="relative flex items-center justify-center w-1/2">
               <h1 className="text-4xl">{month[0]?.title}</h1>

               <div className="absolute right-0">
                  <div className="relative">
                     <button type="button" onClick={() => setShouldShowModal(!shouldShowModal)}>
                        <CircleFadingPlus size={24} />
                     </button>

                     <div className={clsx(
                        'absolute px-2 py-4 rounded-lg left-1/2 -translate-x-1/2 bg-slate-700 transition-all ease-linear',
                        {
                           'max-h-0 opacity-0 invisible': !shouldShowModal,
                           'max-h-80 opacity-1 visible': shouldShowModal,
                        }
                     )}>
                        <h2 className="text-center mb-4">
                           Criar um novo bloco de {toggleLayout === 'profit' ? 'ganho' : 'despesa'}
                        </h2>

                        <form className="flex w-[300px] flex-col gap-4" onSubmit={handleOnCreateBlock}>
                           <Input
                              labelProps={{
                                 text: 'Titulo',
                                 filled: true,
                                 labelClasses: 'bg-slate-700'
                              }}
                              inputProps={{
                                 type: 'text',
                                 id: 'block-title',
                                 classNames: 'bg-slate-700'
                              }}
                           />

                           <SubmitButton
                              type="submit"
                              text="Criar"
                              loading={loading}
                              bgColor={{
                                 color: 'bg-indigo-500',
                                 hover: 'bg-indigo-700'
                              }}
                           />
                        </form>
                     </div>
                  </div>
               </div>
            </div>

            <div className="flex justify-center mt-10 w-1/2">
               <button
                  type="button"
                  className={clsx(
                     "text-xl flex-1 flex flex-col items-center gap-4 transition-all",
                     {
                        'text-green-500': toggleLayout === 'profit',
                        'text-slate-700': toggleLayout ==='spent',
                     }
                  )}
                  onClick={() => setToggleLayout('profit')}
               >
                  Ganhos

                  <span className={clsx(
                     "block w-full h-1 bg-green-500 transition-all ease-linear",
                     {
                        'bg-green-500': toggleLayout === 'profit',
                        'bg-slate-700': toggleLayout ==='spent',
                     }
                  )} />
               </button>

               <button
                  type="button"
                  className={clsx(
                     "text-xl flex-1 flex flex-col items-center gap-4 transition-all",
                     {
                        'text-red-400': toggleLayout === 'spent',
                        'text-slate-700': toggleLayout ==='profit',
                     }
                  )}
                  onClick={() => setToggleLayout('spent')}
               >
                  Despesas

                  <span className={clsx(
                     "block w-full h-1 transition-all ease-linear",
                     {
                        'bg-red-400': toggleLayout === 'spent',
                        'bg-slate-700': toggleLayout ==='profit',
                     }
                  )} />
               </button>
            </div>

            {month.map((month) => (
               toggleLayout === 'profit' ? (
                  month.earnings.map(earning => (
                     <MonthlyEarnings
                        key={earning.title}
                        monthId={params.id}
                        earnings={{
                           title: earning.title,
                           extract: earning.extract,
                        }}
                     />
                  ))
               ) : (
                  month.expenses.map(expense => (
                     <MonthlyExpenses
                        key={expense.title}
                        monthId={params.id}
                        expense={{
                           title: expense.title,
                           extract: expense.extract,
                        }}
                     />
                  ))
               )
            ))}
         </main>
      </>
   ) : params.id === 'new' ? (
      <h1>Novo mês</h1>
   ) : (
      <h1>Not Found</h1>
   )
}
