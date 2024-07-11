import { GraphQLError } from "graphql";
import { LoginApi } from "../../login/data-source";
import { MonthApi } from "./data-sources";
import { UserApi } from "@/graphql/user/data-source";

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

interface MonthResolvers {
   createMonth: (
      _: any,
      { data }: { data: { month: string, year: string } },
      context: { isLoggedIn: string, dataSources: { monthApi: MonthApi, loginApi: LoginApi, userApi: UserApi } }
   ) => any

   createEarningOrExpense: (
      _: any,
      { data }: { data: { monthId: string, title: string, type: 'earnings' | 'expenses' } },
      context: { isLoggedIn: string, dataSources: { monthApi: MonthApi, loginApi: LoginApi } }
   ) => any

   createEarningItem: (
      _: any,
      { data }: { monthId: string, data: AddExpenseItem['data'] },
      context: { isLoggedIn: string, dataSources: { monthApi: MonthApi, loginApi: LoginApi } }
   ) => any

   deleteEarningItem: (
      _: any,
      { data }: { data: { monthId: string, earningItemId: string, earningTitle: string } },
      context: { isLoggedIn: string, dataSources: { monthApi: MonthApi, loginApi: LoginApi } }
   ) => any

   addExpenseItem: (
      _: any,
      { data }: { monthId: string, data: AddExpenseItem['data'] },
      context: { isLoggedIn: string, dataSources: { monthApi: MonthApi, loginApi: LoginApi } }
   ) => any

   payExpense: (
      _: any,
      { data }: { data: { monthId: string, expenseItemId: string, expenseTitle: string } },
      context: { isLoggedIn: string, dataSources: { monthApi: MonthApi, loginApi: LoginApi } }
   ) => any

   deleteExpenseItem: (
      _: any,
      { data }: { data: { monthId: string, expenseItemId: string, expenseTitle: string } },
      context: { isLoggedIn: string, dataSources: { monthApi: MonthApi, loginApi: LoginApi } }
   ) => any
}

const createMonth: MonthResolvers['createMonth'] = async (_, { data }, { isLoggedIn, dataSources }) => {
   if (!isLoggedIn) {
      await dataSources.loginApi.logout(isLoggedIn);
      throw new GraphQLError('Unauthenticated')
   }

   const user = await dataSources.userApi.getUserById(isLoggedIn);

   if (user?.id !== isLoggedIn) {
      throw new GraphQLError('Você não tem permisão pra acessar esse item');
   }

   const createMonth = await dataSources.monthApi.createMonth(data, user?.months);

   return createMonth;
}

const createEarningOrExpense: MonthResolvers['createEarningOrExpense'] = async (_, { data }, { isLoggedIn, dataSources }) => {
   if (!isLoggedIn) {
      await dataSources.loginApi.logout(isLoggedIn);
      throw new GraphQLError('Unauthenticated')
   }

   const createEarnings = await dataSources.monthApi.createEarningOrExpense({
      monthId: data.monthId,
      title: data.title,
      type: data.type,
   });

   return createEarnings;
}

const createEarningItem: MonthResolvers['createEarningItem'] = async (_, { monthId, data }, { isLoggedIn, dataSources }) => {
   if (!isLoggedIn) {
      await dataSources.loginApi.logout(isLoggedIn);

      throw new GraphQLError('Unauthenticated')
   }

   const createEarningItem = await dataSources.monthApi.createEarningItem({ monthId, data });

   return createEarningItem;
};

const deleteEarningItem: MonthResolvers['deleteEarningItem'] = async (_, { data: { monthId, earningItemId, earningTitle } }, { isLoggedIn, dataSources }) => {
   if (!isLoggedIn) {
      await dataSources.loginApi.logout(isLoggedIn);

      throw new GraphQLError('Unauthenticated')
   }

   const deleteExpenseItem = await dataSources.monthApi.deleteEarningItem({
      monthId,
      earningItemId,
      earningTitle
   });

   return deleteExpenseItem;
}

const addExpenseItem: MonthResolvers['addExpenseItem'] = async (_, { monthId, data }, { isLoggedIn, dataSources }) => {
   if (!isLoggedIn) {
      await dataSources.loginApi.logout(isLoggedIn);

      throw new GraphQLError('Unauthenticated')
   }

   const updateMonthlyExpenseItem = await dataSources.monthApi.addExpenseItem({ monthId, data });

   return updateMonthlyExpenseItem;
};

const deleteExpenseItem: MonthResolvers['deleteExpenseItem'] = async (_, { data: { monthId, expenseTitle, expenseItemId } }, { isLoggedIn, dataSources }) => {
   if (!isLoggedIn) {
      await dataSources.loginApi.logout(isLoggedIn);

      throw new GraphQLError('Unauthenticated')
   }

   const deleteExpenseItem = await dataSources.monthApi.deleteExpenseItem({
      monthId,
      expenseTitle,
      expenseItemId
   });

   return deleteExpenseItem;
}

const payExpense: MonthResolvers['payExpense'] = async (_, { data: { monthId, expenseTitle, expenseItemId } }, { isLoggedIn, dataSources }) => {
   if (!isLoggedIn) {
      await dataSources.loginApi.logout(isLoggedIn);

      throw new GraphQLError('Unauthenticated')
   }

   const updatePainOut = await dataSources.monthApi.payExpense({
      monthId,
      expenseTitle,
      expenseItemId
   });

   return updatePainOut;
}

export const monthResolvers = {
   Mutation: {
      createMonth,

      createEarningOrExpense,
      createEarningItem,
      deleteEarningItem,

      addExpenseItem,
      deleteExpenseItem,
      payExpense,
   },
}
