import { LoginApi } from './data-source';

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
      { isLoggedIn, dataSources }: { isLoggedIn: string; dataSources: { loginApi: LoginApi } },
   ) => any;
}

const login: LoginResolvers['login'] = async (_, { data }, { dataSources }) => {
   const { email, password } = data;

   const { token } = await dataSources.loginApi.login(email, password);

   return {
      token,
   };
};

const logout: LoginResolvers['logout'] = async (_, __, { isLoggedIn, dataSources }) => {
   return await dataSources.loginApi.logout(isLoggedIn);
};

export const loginResolvers = {
   Mutation: {
      login,
      logout,
   },
};
