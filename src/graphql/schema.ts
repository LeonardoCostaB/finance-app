import gql from 'graphql-tag';

import { loginTypeDefs } from './server/login/type-defs';
import { createUserTypeDefs } from './server/createUser/type-defs';
import { userTypeDefs } from './server/user/type-defs';

import { loginResolvers } from './server/login/resolvers';
import { createUserResolvers } from './server/createUser/resolvers';
import { userResolvers } from './server//user/resolvers';
import { monthResolvers } from './server/month/resolvers';
import { monthTypeDefs } from './server/month/type-defs';
import { economyTypeDefs } from './server/economy/type-defs';
import { economyResolvers } from './server/economy/resolvers';
import { refreshTokenResolvers } from './server/refreshToken/resolvers';
import { refreshTopkenTypeDefs } from './server/refreshToken/type-defs';

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
      _root: () => true,
   },

   Mutation: {
      _root: () => true,
   },
};

export const typeDefs = [
   rootTypeDefs,
   loginTypeDefs,
   createUserTypeDefs,
   userTypeDefs,
   monthTypeDefs,
   economyTypeDefs,
   refreshTopkenTypeDefs,
];
export const resolvers = [
   rootResolvers,
   loginResolvers,
   createUserResolvers,
   userResolvers,
   monthResolvers,
   economyResolvers,
   refreshTokenResolvers,
];
