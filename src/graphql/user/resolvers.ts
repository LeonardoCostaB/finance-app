import { GraphQLError } from "graphql";
import { UserApi } from "./data-source";
import { LoginApi } from "../login/data-source";

type User = {
   data: {
      id: string;
   }
}

interface UserResolvers {
   user: (
      _: any,
      __: any,
      context: { isLoggedIn: string, dataSources: { userApi: UserApi, loginApi: LoginApi } }
   ) => any;
}

const user: UserResolvers['user'] = async (_, __, { isLoggedIn, dataSources }) => {
   if (!isLoggedIn) {
      await dataSources.loginApi.logout(isLoggedIn);

      throw new GraphQLError('Unauthenticated')
   }

   const userData = await dataSources.userApi.getUserById(isLoggedIn);

   return userData;
};

export const userResolvers = {
   Query: {
      user,
   },
}
