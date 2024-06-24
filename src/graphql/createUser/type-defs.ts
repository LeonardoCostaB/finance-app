import { gql } from "@apollo/client";

export const userTypeDefs = gql`
   extend type Mutation {
      createUser(data: CreateUserInput!): User!
   }

   input CreateUserInput {
      userName: String!
      email: String!
      password: String!
   }

   type User {
      userName: String
      authenticated: Boolean
   }
`;
