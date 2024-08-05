import { gql } from "@apollo/client";

export const monthTypeDefs = gql`
   extend type Mutation {
      createMonth(data: MonthInput): Months

      createEarningOrExpense(data: CreateEarningOrExpenseInput): CreateEarningOrExpenseRes
      deleteEarning(data: DeleteBlockInput): DeleteBlock!
      deleteExpense(data: DeleteBlockInput): DeleteBlock!

      createEarningItem(monthId: String!, data: ExpenseItemInput): CreateEarningItemResponse
      deleteEarningItem(data: PayEarningInput): Boolean!

      addExpenseItem(monthId: String!, data: ExpenseItemInput): ExpenseItemResponse
      payExpense(data: PayExpenseInput): ExpenseItemResponse
      deleteExpenseItem(data: PayExpenseInput): Boolean!
   }

   # Global
   enum TypeCreateEarningOrExpense {
      earnings
      expenses
   }

   input CreateEarningOrExpenseInput {
      monthId: String!
      title: String!
      type: TypeCreateEarningOrExpense!
   }

   type CreateEarningOrExpenseRes {
      earnings: [Expenses]
      expenses: [Expenses]
   }

   # Earnings
   type CreateEarningItemResponse {
      id: String!
      earnings: [Expenses]!
   }

   type DeleteBlock {
      id: ID!
   }

   input PayEarningInput {
      monthId: String!
      earningTitle: String!
      earningItemId: String!
   }

   input DeleteBlockInput {
      monthId: String!
      title: String!
   }

   # Expenses
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

   type ExpenseItemResponse {
      id: String!
      expenses: [Expenses]!
   }

   # Month
   input MonthInput {
      month: String!
      year: String!
   }

   type Months {
      id: ID!
      title: String!
      createdAt: String!
      date: String
      expenses: [Expenses]
      earnings: [Expenses]
   }
`;
