import gql from "graphql-tag";

export const CREATE_EXPENSE_ITEM = gql`
   mutation AddExpenseItem($data: ExpenseItemInput) {
      addExpenseItem(data: $data) {
         id
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

export const PAY_EXPENSE_ITEM = gql`
   mutation PayExpense($data: PayExpenseInput) {
      payExpense(data: $data) {
         expenses {
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
