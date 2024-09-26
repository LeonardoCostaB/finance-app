import gql from 'graphql-tag';

export const UPDATE_USER = gql`
   mutation UpdateUser($userId: String!, $data: UpdateUserInput!) {
      updateUser(userId: $userId, data: $data) {
         id
         name
         email
         profession
         dateOfBirth
         location {
            city
            state
            country
         }
         owner
         economy {
            id
            extract {
               date
               value
            }
         }
         monthlySalary {
            id
            salary
            createAt
         }
         avatar {
            id
            url
         }
         commonPayment {
            id
            name
            value
            date {
               published
            }
         }
         benefits {
            id
            name
            value
         }
         months {
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
   }
`;

export const SAVE_ECONOMY = gql`
   mutation SaveEconomy($data: SaveEconomyInput) {
      saveEconomy(data: $data) {
         id
         extract {
            date
            value
         }
      }
   }
`;
