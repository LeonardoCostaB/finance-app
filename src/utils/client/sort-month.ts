export function sortMonth(months: Months[]) {
   return months.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function sortSubItemsMonth(items: Earnings[] | Expenses[]) {
   return items.sort((a, b) => new Date(a?.created).getTime() - new Date(b?.created).getTime());
}
