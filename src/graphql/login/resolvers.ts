import { NextResponse } from "next/server";
import { LoginApi } from "./data-source"

type Login = {
   data: {
      email: string,
      password: string
   }
}

interface LoginResolvers {
   login: (_: any, { data }: Login, { res, dataSources }: { res: NextResponse, dataSources: { loginApi: LoginApi } }) => any;
   logout: (_: any, { userName }: { userName: string }, { dataSources }: { dataSources: { loginApi: LoginApi } }) => any;
}

const login: LoginResolvers['login'] = async (_, { data }, { res, dataSources }) => {
   const { email, password } = data;

   const { token } = await dataSources.loginApi.login(email, password);

   res.cookies.set({
      name: 'isLoggedIn',
      value: token,
      secure: true,
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      path: "/", // onde o cookie vai ser válido,
      sameSite: "strict",
   })

   return {
      token,
   }
};

const logout: LoginResolvers['logout'] = async (_, { userName }, { dataSources }) => {
   return dataSources.loginApi.logout(userName);
};

export const loginResolvers = {
   Mutation: {
      login,
      logout
   },
}
