export function savingsMonth(month: string, saving?: User['economy']['extract']) {
   const monthDate = new Date(month).getMonth();

   const savingOfMouth =
      saving
         ?.filter((saving) => {
            const savingDate = new Date(saving.date).getMonth();
            return monthDate === savingDate;
         })
         .reduce((acc, curr) => curr.value + acc, 0) || 0;

   return savingOfMouth;
}
