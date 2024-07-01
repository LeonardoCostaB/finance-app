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

   type User {
      id: String!
      name: String!
      economy: Int
      email: String!
      avatar: Avatar
   }
`;
