import gql from "graphql-tag";

import { loginTypeDefs } from "./login/type-defs";
import { createUserTypeDefs } from "./createUser/type-defs";
import { userTypeDefs } from "./user/type-defs";

import { loginResolvers } from "./login/resolvers";
import { createUserResolvers } from "./createUser/resolvers";
import { userResolvers } from "./user/resolvers";
import { monthResolvers } from "./server/month/resolvers";
import { monthTypeDefs } from "./server/month/type-defs";

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
   createUserTypeDefs,
   userTypeDefs,
   monthTypeDefs,
];
export const resolvers = [
   rootResolvers,
   loginResolvers,
   createUserResolvers,
   userResolvers,
   monthResolvers,
];
