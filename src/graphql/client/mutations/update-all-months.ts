import gql from 'graphql-tag';

export const UPDATE_ALL_MONTHS = gql`
   mutation updateAllMonths($userId: String!) {
      updateAllMonths(userId: $userId) {
         id
         title
         createdAt
         date
         expenses {
            title
            created
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
         earnings {
            title
            created
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
`;
