export function MonthlyBillsPaid(expenses?: Months['expenses']) {
   return expenses
   ?.flatMap(expense => expense.extract)
   .filter(extract => extract.date.paidOut)
   .reduce((acc, curr) => curr.value + acc, 0) ?? 0
}
