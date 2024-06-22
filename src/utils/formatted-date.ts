const months = [
   "Janeiro",
   "Fevereiro",
   "Março",
   "Abril",
   "Maio",
   "Junho",
   "Julho",
   "Agosto",
   "Setembro",
   "Outubro",
   "Novembro",
   "Dezembro",
]


export function formattedDate() {
   const date = new Date();

   const month = date.getMonth();

   return months[month];
}
