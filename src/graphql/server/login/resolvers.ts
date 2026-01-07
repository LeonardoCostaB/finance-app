import { NextRequest } from 'next/server';
import { LoginApi } from './data-source';
import { GraphQLError } from 'graphql';

type Login = {
   data: {
      email: string;
      password: string;
   };
};

interface LoginResolvers {
   login: (_: any, { data }: Login, context: { dataSources: { loginApi: LoginApi } }) => any;

   logout: (
      _: any,
      __: any,
      {
         req,
         isLoggedIn,
         dataSources,
      }: { req: NextRequest; isLoggedIn: string; dataSources: { loginApi: LoginApi } },
   ) => any;
}

const login: LoginResolvers['login'] = async (_, { data }, { dataSources }) => {
   const { email, password } = data;

   const { success } = await dataSources.loginApi.login(email, password);

   return {
      success,
   };
};

const logout: LoginResolvers['logout'] = async (_, __, { req, isLoggedIn, dataSources }) => {
   if (!isLoggedIn) {
      throw new GraphQLError('permission denied');
   }

   const accessToken = req.cookies.get('auth-access-token')?.value as string;
   return await dataSources.loginApi.logout(accessToken);
};

export const loginResolvers = {
   Mutation: {
      login,
      logout,
   },
};
