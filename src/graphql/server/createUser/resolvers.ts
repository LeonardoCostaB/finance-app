import { CreateUserApi } from "./data-source"

type User = {
   data: {
      userName: string
      email: string
      password: string
   }
}

interface UserResolvers {
   createUser: (_: any, { data }: User, { dataSources }: { dataSources: { createUserApi: CreateUserApi } }) => any;
}

const createUser: UserResolvers['createUser'] = async (_, { data }, { dataSources }) => {
   const { email, userName, password } = data;

   return dataSources.createUserApi.createUser({ email, userName, password });
};

export const createUserResolvers = {
   Mutation: {
      createUser,
   },
}
