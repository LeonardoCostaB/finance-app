import gql from "graphql-tag";

import { loginTypeDefs } from "./login/type-defs";
import { userTypeDefs } from "./createUser/type-defs";

import { loginResolvers } from "./login/resolvers";
import { userResolvers } from "./createUser/resolvers";

const rootTypeDefs = gql`
   type Query {
      _root: Boolean
   }

   type Mutation {
      _root: Boolean
   }

   type Subscription {
      _root: Boolean
   }
`;

const rootResolvers = {
   Query: {
      _root: () => true
   },

   Mutation: {
      _root: () => true
   },
};

export const typeDefs = [
   rootTypeDefs,
   loginTypeDefs,
   userTypeDefs
];
export const resolvers = [
   rootResolvers,
   loginResolvers,
   userResolvers,
];
