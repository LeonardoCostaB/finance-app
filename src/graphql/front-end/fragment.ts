import { gql } from '@apollo/client';

export const GQL_FRAGMENT_EARNING_EXPENSE  = gql`
   fragment earningAndExpense on CreateEarningOrExpenseRes {
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
`;
