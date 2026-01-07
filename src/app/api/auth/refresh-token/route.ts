import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import axios from 'axios';
import { hashToken } from '@/graphql/server/login/utils/create-hash';
import { createAccessToken } from '@/graphql/server/login/utils/login-repositories';

type StoredRefreshToken = {
   tokenHash: string;
   expiresAt: string;
   revokedAt?: string;
   sessionId: string;
   subscriber: {
      id: string;
   };
};

/* MELHORIAS FUTURAS:
   - Implementar um mecanismo de blacklist para tokens revogados, para aumentar a segurança.
   - Adicionar logs detalhados para monitorar tentativas de uso de tokens inválidos ou expirados.
   - Adicionar rotação automática de refresh tokens para melhorar a segurança.
   - Implementar testes automatizados para cobrir os diferentes cenários de uso do refresh token.
*/

export async function POST() {
   const nextCookies = cookies();
   const refreshToken = nextCookies.get('refresh-token')?.value;

   if (!refreshToken) {
      return new NextResponse(JSON.stringify({ message: 'Refresh token not provided' }), {
         status: 401,
      });
   }

   try {
      const query = `
         query GET_TOKEN_BY_USER($tokenHash: String!) {
            refreshToken(where: { tokenHash: $tokenHash }) {
               tokenHash
               expiresAt
               revokedAt
               subscriber {
                  id
               }
            }
         }
      `;

      const variables = {
         tokenHash: hashToken(refreshToken as string),
      };

      const { data: cms } = await axios.post(
         process.env.BASE_URL as string,
         {
            query,
            variables,
         },
         {
            headers: {
               'Content-Type': 'application/json',
               Authorization: process.env.AUTH_TOKEN,
            },
         },
      );
      const storedToken = cms.data.refreshToken as StoredRefreshToken;

      if (!storedToken) {
         return new NextResponse(JSON.stringify({ message: 'Invalid or expired refresh token' }), {
            status: 401,
         });
      }

      if (new Date(storedToken.expiresAt) < new Date()) {
         const query = `
            mutation UPDATE_TOKEN($tokenHash: String!, $revokedAt: String!) {
               updateRefreshToken(
                  where: { tokenHash: $tokenHash },
                  data: { revokedAt: $revokedAt }
               ) {
                  id
                  sessionId
               }

               publishRefreshToken(where: { tokenHash: $tokenHash }) {
                  id
               }
            }
         `;
         const variables = {
            tokenHash: storedToken.tokenHash,
            revokedAt: new Date().toISOString(),
         };

         await axios.post(
            process.env.BASE_URL as string,
            {
               query,
               variables,
            },
            {
               headers: {
                  'Content-Type': 'application/json',
                  Authorization: process.env.AUTH_TOKEN,
               },
            },
         );

         return new NextResponse(JSON.stringify({ message: 'Invalid or expired refresh token' }), {
            status: 401,
         });
      }

      if (storedToken.revokedAt) {
         return new NextResponse(JSON.stringify({ message: 'Invalid session' }), {
            status: 401,
         });
      }

      const newAccessToken = createAccessToken({
         sub: storedToken.subscriber.id,
         sessionId: storedToken.sessionId,
      });

      nextCookies.set('auth-access-token', newAccessToken, {
         httpOnly: true,
         secure: process.env.NODE_ENV === 'production',
         maxAge: 24 * 60 * 60, // 1 day
         expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
         sameSite: 'lax',
         path: '/',
      });

      return new NextResponse(JSON.stringify({ success: true }), { status: 200 });
   } catch (error) {
      if (error instanceof axios.AxiosError) {
         const data = error.response?.data;

         console.error('Axios error:', {
            error,
            json: JSON.stringify(data, null, 2),
         });
      }

      return new NextResponse(JSON.stringify({ message: 'Token verification failed' }), {
         status: 401,
      });
   }
}
