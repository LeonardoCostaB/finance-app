import { GraphQLError } from 'graphql';
import { RefreshTokenApi } from './data-sources';
import { LoginApi } from '../login/data-source';
import { createJwtToken } from '../login/utils/login-repositories';
import { cookies } from 'next/headers';
import { UserApi } from '../user/data-source';

interface RefreshTokenResolvers {
   refreshToken: (
      _: any,
      data: { refreshTokenId: string },
      context: {
         isLoggedIn: string;
         dataSources: { loginApi: LoginApi; userApi: UserApi; refreshTokenApi: RefreshTokenApi };
      },
   ) => any;
}

const refreshToken: RefreshTokenResolvers['refreshToken'] = async (
   _,
   { refreshTokenId },
   { isLoggedIn, dataSources },
) => {
   const user = await dataSources.userApi.getUserById(isLoggedIn);

   if (!user?.id) {
      throw new GraphQLError('Invalid refresh token');
   }

   const newSessionToken = createJwtToken({
      id: user.id,
   });

   const data = await dataSources.refreshTokenApi.refreshToken(refreshTokenId, newSessionToken);

   cookies().set({
      name: 'refresh-token',
      value: data.id,
      secure: true,
      httpOnly: true,
      maxAge: data.expiresIn, // 7 days
      path: '/', // onde o cookie vai ser válido,
   });

   cookies().set({
      name: 'auth-token',
      value: newSessionToken,
      secure: true,
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      path: '/', // onde o cookie vai ser válido,
   });

   cookies().set({
      name: 'isLoggedIn',
      value: 'true',
      secure: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      path: '/', // onde o cookie vai ser válido,
   });

   return {
      token: newSessionToken,
      refreshToken: data,
   };
};

export const refreshTokenResolvers = {
   Mutation: {
      refreshToken,
   },
};
