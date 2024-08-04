import { LoginApi } from "@/graphql/login/data-source";
import { GraphQLError } from "graphql";
import { EconomyApi } from "./data-sources";

interface UserResolvers {
   saveEconomy: (
      _: any,
      {
         data
      }: {
         data: {
            userId: string
            economyId: string
            extract: Array<{
               date: string
               value: string
            }>
         }
      },
      context: { isLoggedIn: string, dataSources: { economyApi: EconomyApi, loginApi: LoginApi } }
   ) => any;
}

const saveEconomy: UserResolvers['saveEconomy'] = async (_, { data }, { isLoggedIn, dataSources }) => {
   if (!isLoggedIn) {
      await dataSources.loginApi.logout(isLoggedIn);
      throw new GraphQLError('Unauthenticated')
   }

   const saveEconomy = await dataSources.economyApi.saveEconomy(
      isLoggedIn,
      {
         userId: data.userId,
         economyId: data.economyId ?? '',
         extract: data.extract.map(extract => ({
            date: extract.date,
            value: +extract.value,
         })),
      }
   );

   return saveEconomy;
}

export const economyResolvers = {
   Mutation: {
      saveEconomy,
   }
}
