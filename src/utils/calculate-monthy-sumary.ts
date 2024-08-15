export function calculateMonthySummary({
   type,
   month,
}: {
   type: 'earnings' | 'expenses';
   month?: Months[];
}) {
   if (type === 'expenses') {
      return (
         month
            ?.flatMap((month) => month[type])
            .filter((month) => month.extract.filter((extract) => !extract.date.paidOut))
            .flatMap((value) => value.extract)
            .reduce((acc, curr) => curr.value + acc, 0) ?? 0
      );
   }

   return (
      month
         ?.flatMap((month) => month[type])
         .flatMap((value) => value.extract)
         .reduce((acc, curr) => curr.value + acc, 0) ?? 0
   );
}
