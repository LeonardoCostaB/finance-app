import { gql } from "@apollo/client";

export const economyTypeDefs = gql`
   extend type Mutation {
      saveEconomy(data: SaveEconomyInput): Economy
   }

   type EconomyExtract {
      date: String
      value: Int
   }

   type Economy {
      id: String!
      extract: [EconomyExtract]
   }

   input EconomyExtractInput {
      date: String!
      value: Int!
   }

   input SaveEconomyInput {
      userId: ID!
      economyId: ID
      extract: [EconomyExtractInput]
   }
`;
