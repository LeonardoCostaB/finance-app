import { AccessTokenPayload } from '@/graphql/server/login/utils/login-repositories';

import jwt from 'jsonwebtoken';

function verifyJwtToken(token: string) {
   try {
      const decodedToken = jwt.verify(
         token,
         process.env.JWT_SECRET_KEY as string,
      ) as AccessTokenPayload;

      return decodedToken.sub;
   } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
         console.error('Invalid token:', error.message);
      } else {
         console.error('Token verification error:', error);
      }

      return null;
   }
}

export function userIsLoggedIn(tokenFromHeader?: string | null) {
   let loggedUserId = null;

   if (tokenFromHeader) {
      loggedUserId = verifyJwtToken(tokenFromHeader);
   }

   return loggedUserId;
}
