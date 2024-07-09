import { GraphQLError } from "graphql";
import { UserApi } from "./data-source";
import { LoginApi } from "../login/data-source";

export type AddExpenseItem = {
   data: {
      title: string;
      id: string;
      name: string;
      value: number;
      date: string;
      link?: string;
      notes?: string;
   }
}

interface UserResolvers {
   user: (
      _: any,
      __: any,
      context: { isLoggedIn: string, dataSources: { userApi: UserApi, loginApi: LoginApi } }
   ) => any;

   addExpenseItem: (
      _: any,
      { data }: AddExpenseItem,
      context: { isLoggedIn: string, dataSources: { userApi: UserApi, loginApi: LoginApi } }
   ) => any

   payExpense: (
      _: any,
      { data }: { data: { monthId: string, expenseItemId: string, expenseTitle: string } },
      context: { isLoggedIn: string, dataSources: { userApi: UserApi, loginApi: LoginApi } }
   ) => any

   deleteExpenseItem: (
      _: any,
      { data }: { data: { monthId: string, expenseItemId: string, expenseTitle: string } },
      context: { isLoggedIn: string, dataSources: { userApi: UserApi, loginApi: LoginApi } }
   ) => any
}

const user: UserResolvers['user'] = async (_, __, { isLoggedIn, dataSources }) => {
   if (!isLoggedIn) {
      await dataSources.loginApi.logout(isLoggedIn);

      throw new GraphQLError('Unauthenticated')
   }

   const userData = await dataSources.userApi.getUserById(isLoggedIn);

   return userData;
};

const addExpenseItem: UserResolvers['addExpenseItem'] = async (_, { data }, { isLoggedIn, dataSources }) => {
   if (!isLoggedIn) {
      await dataSources.loginApi.logout(isLoggedIn);

      throw new GraphQLError('Unauthenticated')
   }

   const updateMonthlyExpenseItem = await dataSources.userApi.addExpenseItem(data);

   return updateMonthlyExpenseItem;
};

const deleteExpenseItem: UserResolvers['deleteExpenseItem'] = async (_, { data: { monthId, expenseTitle, expenseItemId } }, { isLoggedIn, dataSources }) => {
   if (!isLoggedIn) {
      await dataSources.loginApi.logout(isLoggedIn);

      throw new GraphQLError('Unauthenticated')
   }

   const deleteExpenseItem = await dataSources.userApi.deleteExpenseItem({
      monthId,
      expenseTitle,
      expenseItemId
   });

   return deleteExpenseItem;
}

const payExpense: UserResolvers['payExpense'] = async (_, { data: { monthId, expenseTitle, expenseItemId } }, { isLoggedIn, dataSources }) => {
   if (!isLoggedIn) {
      await dataSources.loginApi.logout(isLoggedIn);

      throw new GraphQLError('Unauthenticated')
   }

   const updatePainOut = await dataSources.userApi.payExpense({
      monthId,
      expenseTitle,
      expenseItemId
   });

   return updatePainOut;
}

export const userResolvers = {
   Query: {
      user,
   },
   Mutation: {
      addExpenseItem,
      deleteExpenseItem,
      payExpense,
   },
}
