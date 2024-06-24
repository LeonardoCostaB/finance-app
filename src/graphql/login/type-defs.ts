import { gql } from "@apollo/client";

export const loginTypeDefs = gql`
   extend type Mutation {
      login(data: LoginInput!): Login!
      logout(userName: String!): Boolean!
   }

   input LoginInput {
      email: String!
      password: String!
   }

   type Login {
      token: String!
   }
`;
