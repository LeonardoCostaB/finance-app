export function savingsMonth(month: string, saving?: User['economy']['extract']) {
   const monthDate = new Date(month).getMonth();
   const yearDate = new Date(month).getFullYear();

   const savingOfMouth =
      saving
         ?.filter((saving) => {
            const savingMonthDate = new Date(saving.date).getMonth();
            const savingYearDate = new Date(saving.date).getFullYear();

            return monthDate === savingMonthDate && yearDate === savingYearDate;
         })
         .reduce((acc, curr) => curr.value + acc, 0) || 0;

   return savingOfMouth;
}
