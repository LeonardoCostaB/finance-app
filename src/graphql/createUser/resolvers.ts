import { UserApi } from "./data-source"

type User = {
   data: {
      userName: string
      email: string
      password: string
   }
}

interface UserResolvers {
   createUser: (_: any, { data }: User, { dataSources }: { dataSources: { userApi: UserApi } }) => any;
}
   
const createUser: UserResolvers['createUser'] = async (_, { data }, { dataSources }) => {
   const { email, userName, password } = data;

   return dataSources.userApi.createUser({ email, userName, password });
};

export const userResolvers = {
   Mutation: {
      createUser,
   },
}
