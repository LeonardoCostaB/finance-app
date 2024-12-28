export function formatToYear(months: Months[]) {
   const years = months.map((month) => new Date(month.date).getFullYear());

   return Array.from(new Set(years)) as number[];
}
