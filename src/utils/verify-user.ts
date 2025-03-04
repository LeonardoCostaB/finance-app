import { CreateUserApi } from '@/graphql/server/createUser/data-source';
import { RefreshTokenApi } from '@/graphql/server/refreshToken/data-sources';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

async function verifyJwtToken(token: string) {
   try {
      const { id } = jwt.verify(token, process.env.JWL_SECRET_KEY as string) as jwtTokenId;

      const userApi = new CreateUserApi();
      userApi.initialize({} as any);
      const foundUser = await userApi.getUserById(id);
      const refreshToken = new RefreshTokenApi(foundUser.id);

      if (foundUser.token !== token) {
         await refreshToken.refreshToken(foundUser.refreshToken, token);

         return foundUser.id;
      }

      return id;
   } catch (error) {
      console.log(error);
      return '';
   }
}

export async function userIsLoggedIn() {
   let loggedUserId = '';

   const headerCookie = cookies().get('auth-token');

   if (headerCookie && headerCookie.value) {
      loggedUserId = await verifyJwtToken(headerCookie.value);
   }

   return loggedUserId;
}
