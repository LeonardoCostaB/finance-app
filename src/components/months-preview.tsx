import Link from 'next/link';
import { NewMonthCard } from './new-month-card';
import { SwiperCustomSlide } from './swipper-slider';
import { FormattedPrice } from './formatted-price';

export function MonthPreview({
   months,
   currentMonth,
   userSalary,
}: {
   months?: Months[];
   currentMonth?: string;
   userSalary: number;
}) {
   if (!months?.length) return <></>;

   return (
      <aside className="mx-auto mb-10 max-w-6xl">
         <div className="flex w-[calc(100%-332px)] gap-4 max-xl:px-6 max-lg:w-full max-lg:gap-2 max-lg:p-4">
            <NewMonthCard onMonthCreated={() => {}} forThePreview />
            <SwiperCustomSlide
               slides={months
                  .filter((month) => month.id !== currentMonth)
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map((month) => {
                     return {
                        id: month.id,
                        children: (
                           <Link
                              key={month.id}
                              href={`/${month.id}/month`}
                              className="flex flex-1 flex-col items-center justify-between rounded-lg bg-slate-800 p-4 max-lg:p-2 max-lg:py-4"
                           >
                              <h5 className="capitalize max-lg:mb-2">{month.title}</h5>

                              <span className="flex flex-col items-center gap-1">
                                 <FormattedPrice
                                    style="normal"
                                    price={
                                       month.earnings
                                          .flatMap((earning) => earning.extract)
                                          .reduce((acc, extract) => acc + extract.value, 0) +
                                       userSalary -
                                       month.expenses
                                          .flatMap((earning) => earning.extract)
                                          .reduce((acc, extract) => acc + extract.value, 0)
                                    }
                                    classNames="text-sm"
                                 />
                              </span>
                           </Link>
                        ),
                     };
                  })}
               classNames="max-lg:flex-1"
            />
         </div>
      </aside>
   );
}
