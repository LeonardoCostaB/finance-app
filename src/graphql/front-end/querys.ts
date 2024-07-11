import gql from "graphql-tag";

export const CREATE_EARNING_OR_EXPENSE = gql`
   mutation createEarningOrExpense($data: CreateEarningOrExpenseInput) {
      createEarningOrExpense (data: $data) {
         earnings {
            title
            extract {
               id
               name
               value
               date {
                  published
               }
               link
               notes
            }
         }
         expenses {
            title
            extract {
               id
               name
               value
               date {
                  published
               }
               link
               notes
            }
         }
      }
   }
`

export const CREATE_EARNING_ITEM = gql`
   mutation CreateEarningItem($monthId: String!, $data: ExpenseItemInput) {
      createEarningItem(monthId: $monthId, data: $data) {
         id
         earnings {
            title
            extract {
               id
               name
               value
               date {
                  published
               }
               link
               notes
            }
         }
      }
   }
`

export const DELETE_EARNING_ITEM = gql`
   mutation DeleteEarningItem($data: PayEarningInput) {
      deleteEarningItem(data: $data)
   }
`

export const CREATE_EXPENSE_ITEM = gql`
   mutation AddExpenseItem($monthId: String!, $data: ExpenseItemInput) {
      addExpenseItem(monthId: $monthId, data: $data) {
         id
         expenses {
            title
            extract {
               id
               name
               value
               date {
                  published
                  paidOut
               }
               link
               notes
            }
         }
      }
   }
`

export const PAY_EXPENSE_ITEM = gql`
   mutation PayExpense($data: PayExpenseInput) {
      payExpense(data: $data) {
         expenses {
            title,
            extract {
               id
               name
               value
               date {
                  published
                  paidOut
               }
               link
               value
            }
         }
      }
   }
`

export const DELETE_EXPENSE_ITEM = gql`
   mutation DeleteExpenseItem($data: PayExpenseInput) {
      deleteExpenseItem(data: $data)
   }
`
