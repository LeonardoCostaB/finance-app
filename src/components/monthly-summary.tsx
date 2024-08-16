import { ChevronDown } from 'lucide-react';
import { FormattedPrice } from './formatted-price';
import { useEffect, useState } from 'react';
import { calculateMonthySummary } from '@/utils/calculate-monthy-sumary';
import { MonthlyBillsPaid } from '@/utils/monthly-bills-paid';
import { savingsMonth } from '@/utils/savings-month';

export function MonthlySummary({
   month,
   monthlySalary,
   userEconomy,
}: {
   month: Months[];
   monthlySalary?: number;
   userEconomy?: Array<{ date: string; value: number }>;
}) {
   const [monthlySummary, setMonthlySummary] = useState<{
      expense?: number;
      earning?: number;
      balance?: number;
      paidBills: number;
   }>({
      expense: 0,
      earning: 0,
      paidBills: 0,
   });
   const [shouldShowSummary, setShouldShowSummary] = useState(false);

   useEffect(() => {
      setMonthlySummary({
         expense: calculateMonthySummary({
            type: 'expenses',
            month,
         }),
         earning:
            calculateMonthySummary({
               type: 'earnings',
               month,
            }) + (monthlySalary ?? 0),
         paidBills: MonthlyBillsPaid(month.flatMap((month) => month.expenses) ?? []),
      });
   }, []);

   return (
      <div
         className={`mt-10 flex h-max w-full max-w-[300px] flex-col items-center gap-4 rounded-lg bg-slate-800 p-4 transition-all duration-500 max-lg:relative max-lg:max-w-full max-lg:overflow-hidden ${shouldShowSummary ? 'max-h-96' : 'max-lg:max-h-14'}`}
      >
         <button
            type="button"
            className={`absolute right-4 transition-all duration-500 ${shouldShowSummary ? 'rotate-180' : 'rotate-0'} lg:hidden`}
            onClick={() => setShouldShowSummary(!shouldShowSummary)}
         >
            <ChevronDown />
         </button>

         <h3>Resumo Mensal</h3>

         <div className="flex w-full flex-col items-center gap-4 border-b border-b-slate-400 pb-4">
            <span>
               Ganhos: <FormattedPrice price={monthlySummary.earning} style="profit" />
            </span>

            <span>
               Despesas: <FormattedPrice price={monthlySummary.expense} style="spent" />
            </span>

            <span>
               Balanço:{' '}
               <FormattedPrice
                  price={(monthlySummary.earning ?? 0) - (monthlySummary.expense ?? 0)}
                  style="average"
               />
            </span>
         </div>

         <div className="flex flex-col items-center gap-4">
            {monthlySummary.paidBills > 0 && (
               <span>
                  Pagou:{' '}
                  <FormattedPrice
                     price={monthlySummary.paidBills}
                     style="normal"
                     classNames="text-sm"
                  />
                  /
                  <FormattedPrice
                     price={monthlySummary.expense}
                     style="spent"
                     classNames="text-sm"
                  />
               </span>
            )}

            <span>
               Poupou:{' '}
               <FormattedPrice price={savingsMonth(month[0].date, userEconomy)} style="normal" />
            </span>

            <span>
               Saldo Final:{' '}
               <FormattedPrice
                  price={
                     (monthlySummary.earning ?? 0) -
                     (monthlySummary.expense ?? 0) -
                     savingsMonth(month[0].date, userEconomy)
                  }
                  style="profit"
               />
            </span>
         </div>
      </div>
   );
}
