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

export const CREATE_COMMON_PAYMENT = gql`
   mutation CreteCommonPayment(
      $userId: String!
      $data: CommonPaymentsAndBenefitsInput!
      $type: CommonPaymentRequestType
   ) {
      createCommonPayments(userId: $userId, data: $data, type: $type) {
         id
         name
         value
      }
   }
`;

export const DELETE_COMMON_PAYMENT = gql`
   mutation DeleteCommonPayment($userId: String!, $paymentName: String!) {
      deleteCommonPayments(userId: $userId, paymentName: $paymentName) {
         id
         name
         value
      }
   }
`;
