import { NextRequest, NextResponse } from 'next/server';
import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';

import { typeDefs, resolvers } from '../../../graphql/schema';

import { LoginApi } from '@/graphql/server/login/data-source';
import { CreateUserApi } from '@/graphql/server/createUser/data-source';
import { userIsLoggedIn } from '@/utils/verify-user';
import { UserApi } from '@/graphql/server/user/data-source';
import { MonthApi } from '@/graphql/server/month/data-sources';
import { EconomyApi } from '@/graphql/server/economy/data-sources';
import { RefreshTokenApi } from '@/graphql/server/refreshToken/data-sources';

interface CustomContext {
   dataSources: {
      loginApi: LoginApi;
      createUserApi: CreateUserApi;
      userApi: UserApi;
      monthApi: MonthApi;
   };
   isLoggedIn: string;
}

const apolloServer = new ApolloServer<CustomContext>({ typeDefs, resolvers });

const handler = startServerAndCreateNextHandler<NextRequest, CustomContext>(apolloServer, {
   context: async (req) => ({
      req,
      res: new NextResponse(),
      dataSources: {
         loginApi: new LoginApi(),
         createUserApi: new CreateUserApi(),
         userApi: new UserApi(),
         monthApi: new MonthApi(await userIsLoggedIn()),
         economyApi: new EconomyApi(),
         refreshTokenApi: new RefreshTokenApi(await userIsLoggedIn()),
      },
      isLoggedIn: await userIsLoggedIn(),
   }),
});

export async function GET(request: NextRequest) {
   return await handler(request);
}

export async function POST(request: NextRequest) {
   return await handler(request);
}
