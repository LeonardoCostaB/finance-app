export function MonthlyBillsPaid(expenses?: Months['expenses']) {
   if (!expenses) return 0

   return expenses
      .flatMap(expense => expense?.extract)
      .filter(extract => extract.date.paidOut)
      .reduce((acc, curr) => curr.value + acc, 0)
}
