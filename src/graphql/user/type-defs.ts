import { gql } from "@apollo/client";

export const userTypeDefs = gql`
   extend type Query {
      user(data: UserInput!): User!
   }

   extend type Mutation {
      addExpenseItem(data: ExpenseItemInput): ExpenseItemResponse
      payExpense(data: PayExpenseInput): ExpenseItemResponse
      deleteExpenseItem(data: PayExpenseInput): Boolean!
   }

   input UserInput {
      email: String!
   }

   input ExpenseItemInput {
      title: String!
      name: String!
      value: Int!
      link: String
      notes: String
   }

   input PayExpenseInput {
      monthId: String!
      expenseTitle: String!
      expenseItemId: String!
   }

   type Avatar {
      id: String
      url: String
   }

   type DateExpenses {
      published: String!
      paidOut: String
   }

   type Extract {
      id: String!
      name: String!
      value: Int!
      date: DateExpenses!
      link: String
      notes: String
   }

   type Expenses {
      title: String!
      extract: [Extract]
   }

   type Months {
      id: ID!
      title: String!
      expenses: [Expenses]
   }

   type User {
      id: String!
      name: String!
      economy: Int
      email: String!
      avatar: Avatar
      months: [Months]
   }

   type ExpenseItemResponse {
      id: String!
      expenses: [Expenses]!
   }
`;
