import { gql } from "@apollo/client";

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

   type User {
      id: String!
      name: String!
      economy: Economy
      commonPayment: [CommonPaymentsAndBenefits]
      benefits: [CommonPaymentsAndBenefits]
      monthlySalary: Int
      email: String!
      avatar: Avatar
      months: [Months]
   }
`;
