export function savingsMonth(month: string, saving?: User['economy']['extract']) {
   const monthDate = new Date(month).getMonth();

   const savingOfMouth = saving?.find(saving => {
      const savingDate = new Date(saving.date).getMonth();
      return monthDate === savingDate;
   })

   return savingOfMouth;
}
