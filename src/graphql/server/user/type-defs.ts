import { gql } from '@apollo/client';

export const userTypeDefs = gql`
   extend type Query {
      user(data: UserInput!): User!
   }

   input UserInput {
      email: String!
   }

   type Avatar {
      id: String
      url: String
   }

   type CommonPaymentsAndBenefits {
      id: String!
      name: String!
      date: DateExpenses!
      value: Int!
   }

   type Location {
      city: String
      state: String
      country: String
   }

   type User {
      id: String!
      name: String!
      economy: Economy
      profession: String
      dateOfBirth: String
      location: Location
      owner: Boolean
      commonPayment: [CommonPaymentsAndBenefits]
      benefits: [CommonPaymentsAndBenefits]
      monthlySalary: Int
      email: String!
      avatar: Avatar
      months: [Months]
   }
`;
