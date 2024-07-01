import { GraphQLError } from "graphql";
import { UserApi } from "./data-source";

type User = {
   data: {
      id: string;
   }
}

interface UserResolvers {
   user: (
      _: any,
      __: any,
      context: { isLoggedIn: string, dataSources: { userApi: UserApi } }
   ) => any;
}

const user: UserResolvers['user'] = async (_, __, { isLoggedIn, dataSources }) => {
   if (!isLoggedIn) throw new GraphQLError('Unauthenticated');

   const userData = await dataSources.userApi.getUserById(isLoggedIn);

   return userData;
};

export const userResolvers = {
   Query: {
      user,
   },
}
