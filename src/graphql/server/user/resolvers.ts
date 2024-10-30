import { GraphQLError } from 'graphql';
import { UserApi } from './data-source';
import { LoginApi } from '../login/data-source';

export type AddExpenseItem = {
   data: {
      title: string;
      id: string;
      name: string;
      value: number;
      date: string;
      link?: string;
      notes?: string;
   };
};

interface UserResolvers {
   user: (
      _: any,
      __: any,
      context: { isLoggedIn: string; dataSources: { userApi: UserApi; loginApi: LoginApi } },
   ) => any;

   updateUser: (
      _: any,
      {
         userId,
         data,
      }: {
         userId: string;
         data: {
            monthlySalary: number;
            name: string;
            profession: string;
            location: {
               city: string;
               state: string;
            };
         };
      },
      context: { isLoggedIn: string; dataSources: { userApi: UserApi; loginApi: LoginApi } },
   ) => any;

   createCommonPayments: (
      _: any,
      {
         userId,
         data,
         type,
      }: {
         userId: string;
         data: {
            name: string;
            value: number;
         };
         type: 'create' | 'update';
      },
      context: { isLoggedIn: string; dataSources: { userApi: UserApi; loginApi: LoginApi } },
   ) => any;

   deleteCommonPayments: (
      _: any,
      {
         userId,
         paymentName,
      }: {
         userId: string;
         paymentName: string;
      },
      context: { isLoggedIn: string; dataSources: { userApi: UserApi; loginApi: LoginApi } },
   ) => any;
}

const user: UserResolvers['user'] = async (_, __, { isLoggedIn, dataSources }) => {
   if (!isLoggedIn) {
      await dataSources.loginApi.logout(isLoggedIn);

      throw new GraphQLError('Unauthenticated');
   }

   const userData = await dataSources.userApi.getUserById(isLoggedIn);

   return userData;
};

const updateUser: UserResolvers['updateUser'] = async (
   _,
   { userId, data },
   { isLoggedIn, dataSources },
) => {
   if (!isLoggedIn) {
      await dataSources.loginApi.logout(isLoggedIn);

      throw new GraphQLError('Unauthenticated');
   }

   if (userId !== isLoggedIn) {
      throw new GraphQLError(
         'Esse item pode não existir ou você não tem autorização para acessa-lo',
      );
   }

   const userData = await dataSources.userApi.updateUserById({ userId: isLoggedIn, data });

   return userData;
};

const createCommonPayments: UserResolvers['createCommonPayments'] = async (
   _,
   { userId, data, type },
   { isLoggedIn, dataSources },
) => {
   if (!isLoggedIn) {
      await dataSources.loginApi.logout(isLoggedIn);
      throw new GraphQLError('Unauthenticated');
   }

   if (userId !== isLoggedIn) {
      throw new GraphQLError(
         'Esse item pode não existir ou você não tem autorização para acessa-lo',
      );
   }

   const createCommonPayment = await dataSources.userApi.createCommonPayment({
      userId,
      data,
      type,
   });

   return createCommonPayment;
};

const deleteCommonPayments: UserResolvers['deleteCommonPayments'] = async (
   _,
   { userId, paymentName },
   { isLoggedIn, dataSources },
) => {
   if (!isLoggedIn) {
      await dataSources.loginApi.logout(isLoggedIn);
      throw new GraphQLError('Unauthenticated');
   }

   if (userId !== isLoggedIn) {
      throw new GraphQLError(
         'Esse item pode não existir ou você não tem autorização para acessa-lo',
      );
   }

   const createCommonPayment = await dataSources.userApi.deleteCommonPayment({
      userId,
      paymentName,
   });

   return createCommonPayment;
};

export const userResolvers = {
   Query: {
      user,
   },
   Mutation: {
      updateUser,
      createCommonPayments,
      deleteCommonPayments,
   },
};
