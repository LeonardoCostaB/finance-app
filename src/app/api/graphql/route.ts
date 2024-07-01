import { NextRequest, NextResponse } from 'next/server';
import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';

import { typeDefs, resolvers } from '../../../graphql/schema';

import { LoginApi } from '@/graphql/login/data-source';
import { CreateUserApi } from '@/graphql/createUser/data-source';
import { userIsLoggedIn } from '@/utils/verify-user';
import { UserApi } from '@/graphql/user/data-source';

interface CustomContext {
   dataSources: {
      loginApi: LoginApi;
      createUserApi: CreateUserApi;
      userApi: UserApi;
   };
   isLoggedIn: string;
}

const apolloServer = new ApolloServer<CustomContext>({ typeDefs, resolvers, });

const handler = startServerAndCreateNextHandler<NextRequest, CustomContext>(apolloServer, {
   context: async (req) => ({
      req,
      res: new NextResponse(),
      dataSources: {
         loginApi: new LoginApi(),
         createUserApi: new CreateUserApi(),
         userApi: new UserApi(),
      },
      isLoggedIn: await userIsLoggedIn(),
   })
});

 export async function GET(request: NextRequest) {
   return handler(request);
 }

 export async function POST(request: NextRequest) {
   return handler(request);
 }
