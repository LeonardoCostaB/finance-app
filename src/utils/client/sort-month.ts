export function sortMonth(months: Months[]) {
   return months.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}
