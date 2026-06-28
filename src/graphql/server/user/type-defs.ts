import { gql } from '@apollo/client';

export const userTypeDefs = gql`
   extend type Query {
      user(data: UserInput!): User!
   }

   extend type Mutation {
      updateUser(userId: String!, data: UpdateUserInput!): User

      createCommonPayments(
         userId: String!
         data: CommonPaymentsAndBenefitsInput
         type: CommonPaymentRequestType
      ): [Extract]

      deleteCommonPayments(userId: String!, paymentName: String!): [Extract]

      updateAllMonths(userId: String!): [Months]
   }

   enum CommonPaymentRequestType {
      create
      update
   }

   input CommonPaymentsAndBenefitsInput {
      name: String!
      value: Int!
   }

   input LocationInput {
      city: String
      state: String
   }

   input UserInput {
      email: String!
   }

   input UpdateUserInput {
      name: String!
      profession: String!
      location: LocationInput!
      monthlySalary: Int
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

   type MonthlySalary {
      id: String
      salary: Int
      createAt: String
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
      monthlySalary: [MonthlySalary]
      email: String!
      avatar: Avatar
      months: [Months]
   }
`;
