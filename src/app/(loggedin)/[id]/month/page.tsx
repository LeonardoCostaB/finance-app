'use client'

import { FormEvent, useEffect, useState } from "react"
import { toast } from "sonner";
import { useMutation } from "@apollo/client";
import clsx from "clsx";

import { useLoggedIn } from "@/hooks/use-loggedIn";
import { GET_USER_BY_EMAIL } from "@/context/loggedIn-context";
import { CREATE_EARNING_OR_EXPENSE } from "@/graphql/client/mutations/month";

import { CircleEllipsis, CircleFadingPlus, PiggyBank } from "lucide-react";
import { FormattedPrice } from "@/components/formatted-price";
import { Header } from "@/components/header";
import { Input } from "@/components/input";
import { MonthlyEarnings } from "@/components/monthly-earnings";
import { MonthlyExpenses } from "@/components/monthly-expenses";
import { SubmitButton } from "@/components/submit-button";
import { MoreOptions } from "@/components/more-options";
import { savingsMonth } from "@/utils/savings-month";
import { calculateMonthySummary } from "@/utils/calculate-monthy-sumary";
import { MonthlyBillsPaid } from "@/utils/monthly-bills-paid";

export default function Month({ params }: { params: { id: string } }) {
   const { user, updateUser } = useLoggedIn();
   const [createEarningOrExpense, { loading }] = useMutation(CREATE_EARNING_OR_EXPENSE);

   const [month, setMonth] = useState<User['months'] | undefined>([]);
   const [monthlySummary, setMonthlySummary] = useState<{
      expense?: number;
      earning?: number;
      balance?: number;
      paidBills: number;
   }>({
      expense: 0,
      earning: 0,
      paidBills: 0
   })

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
                  data: {
                     user: updatedData,
                  },
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
                     data: {
                        user: updatedData,
                     },
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

      setMonthlySummary({
         expense: calculateMonthySummary({
            type: 'expenses',
            month: user?.months.filter(month => month.id === params.id),
         }),
         earning: calculateMonthySummary({
            type: 'earnings',
            month: user?.months.filter(month => month.id === params.id),
         }) + (user?.monthlySalary ?? 0),
         paidBills: MonthlyBillsPaid(user?.months.flatMap(month => month.expenses) ?? [])
      })
   }, [params.id, user])

   return month && month.length > 0 ? (
      <>
         <Header />

         <main className="flex relative max-w-6xl items-stretch justify-center gap-8 mx-auto mb-20">
            <div className="flex flex-col items-center w-full">
               <div className="flex items-center justify-center w-full">
                  <h1 className="text-4xl">{month[0]?.title}</h1>

                  <div className="absolute flex items-center gap-4 right-0">
                     <div className="relative flex">
                        <button type="button" onClick={() => setShouldShowModal(!shouldShowModal)}>
                           <CircleFadingPlus size={24} />
                        </button>

                        <div className={clsx(
                           'absolute px-2 py-4 rounded-lg top-8 left-1/2 -translate-x-1/2 bg-slate-700 transition-all ease-linear',
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

                     <MoreOptions month={month[0].date} />
                  </div>
               </div>

               <div className="flex justify-center mt-10 w-full bg-slate-800 p-4 rounded-xl">
                  <button
                     type="button"
                     className={clsx(
                        "text-xl flex-1 flex flex-col items-center gap-4 transition-all",
                        {
                           'text-green-500': toggleLayout === 'profit',
                           'text-slate-500': toggleLayout ==='spent',
                        }
                     )}
                     onClick={() => setToggleLayout('profit')}
                  >
                     Ganhos

                     <span className={clsx(
                        "block w-full h-1 bg-green-500 transition-all ease-linear",
                        {
                           'bg-green-500': toggleLayout === 'profit',
                           'bg-slate-500': toggleLayout ==='spent',
                        }
                     )} />
                  </button>

                  <button
                     type="button"
                     className={clsx(
                        "text-xl flex-1 flex flex-col items-center gap-4 transition-all",
                        {
                           'text-red-400': toggleLayout === 'spent',
                           'text-slate-500': toggleLayout ==='profit',
                        }
                     )}
                     onClick={() => setToggleLayout('spent')}
                  >
                     Despesas

                     <span className={clsx(
                        "block w-full h-1 transition-all ease-linear",
                        {
                           'bg-red-400': toggleLayout === 'spent',
                           'bg-slate-500': toggleLayout ==='profit',
                        }
                     )} />
                  </button>
               </div>

               {toggleLayout === 'profit' && user && user.monthlySalary > 0 && (
                  <span className="flex w-full items-center justify-between p-4 mt-6 text-xl bg-slate-800 rounded-lg box-border">
                     Salario: <FormattedPrice price={user.monthlySalary} style="profit" />
                  </span>
               )}

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
            </div>

            <div className="max-w-[300px] h-max flex flex-col items-center gap-4 w-full mt-20 p-4 rounded-lg bg-slate-800">
               <h3>Resumo Mensal</h3>

               <div className="flex flex-col items-center gap-4 border-b w-full pb-4 border-b-slate-400">
                  <span>
                     Ganhos: <FormattedPrice price={monthlySummary.earning} style="profit" />
                  </span>

                  <span>
                     Despesas: <FormattedPrice price={monthlySummary.expense} style="spent" />
                  </span>

                  <span>
                     Balanço: <FormattedPrice price={(monthlySummary.earning ?? 0) - (monthlySummary.expense ?? 0)} style="average" />
                  </span>
               </div>

               <div className="flex flex-col items-center gap-4">
                  {monthlySummary.paidBills > 0 && (
                     <span>
                        Pagou: <FormattedPrice price={monthlySummary.paidBills} style="normal" classNames="text-sm" />/<FormattedPrice price={monthlySummary.expense} style="spent" classNames="text-sm" />
                     </span>
                  )}

                  <span>
                     Poupou: <FormattedPrice price={savingsMonth(month[0].date, user?.economy?.extract)} style="normal" />
                  </span>

                  <span>
                     Saldo Final: <FormattedPrice
                        price={(monthlySummary.earning ?? 0) - (monthlySummary.expense ?? 0) - (savingsMonth(month[0].date, user?.economy?.extract))}
                        style="profit"
                     />
                  </span>
               </div>
            </div>
         </main>
      </>
   ) : params.id === 'new' ? (
      <h1>Novo mês</h1>
   ) : (
      <h1>Not Found</h1>
   )
}
