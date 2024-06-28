import { NextRequest, NextResponse } from 'next/server';
import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';

import { typeDefs, resolvers } from '../../../graphql/schema';

import { LoginApi } from '@/graphql/login/data-source';
import { UserApi } from '@/graphql/createUser/data-source';
import { userIsLoggedIn } from '@/utils/verify-user';

const apolloServer = new ApolloServer({ typeDefs, resolvers });

const handler = startServerAndCreateNextHandler<NextRequest>(apolloServer, {
   context: async (req, res) => ({
      req,
      res: new NextResponse(),
      dataSources: {
         loginApi: new LoginApi(),
         userApi: new UserApi(),
      },
      isLoggedIn: await userIsLoggedIn(),
   }),
});

 export async function GET(request: NextRequest) {
   return handler(request);
 }

 export async function POST(request: NextRequest) {
   return handler(request);
 }
