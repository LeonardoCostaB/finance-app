import axios from 'axios';
import bcrypt from 'bcryptjs';
import { GraphQLError } from 'graphql';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

import { RESTDataSource } from 'apollo-datasource-rest';
import { createAccessToken, createRefeshToken } from './utils/login-repositories';
import { cookies } from 'next/headers';
import { hashToken } from './utils/create-hash';

interface LoginApiResponse {
   getUser: {
      data: {
         subscriber: {
            id: string;
            password: string;
            refreshToken: { id: string };
         };
      };
   };
}

type saveCookieToDbProps = {
   id: string;
   hashedRefreshToken: string | null;
   expiresAt: string;
   sessionId: string;
};

export class LoginApi extends RESTDataSource {
   private headers: { ['Content-Type']: string; Authorization: string };

   constructor() {
      super();
      this.baseURL = process.env.BASE_URL;
      this.headers = {
         'Content-Type': 'application/json',
         Authorization: process.env.AUTH_TOKEN as string,
      };
   }

   private async verifyUser(
      email: string,
   ): Promise<LoginApiResponse['getUser']['data']['subscriber'] | undefined> {
      const query = `
         query GET_SUBSCRIBER($email: String) {
            subscriber(where: { email: $email }) {
               id,
               password
               refreshTokens {
                  id
               }
            }
         }
      `;
      const variables = { email };

      try {
         const { data: user } = await axios.post<LoginApiResponse['getUser']>(
            this.baseURL as string,
            {
               query,
               variables,
            },
            { headers: this.headers },
         );

         return user.data.subscriber;
      } catch (error: any) {
         console.error({
            error: error,
            errorJson: JSON.stringify(error.response.data, null, 2),
         });
      }
   }

   private async saveCookieToDb(token: saveCookieToDbProps): Promise<{ success: boolean }> {
      const query = `
         mutation UPDATE_SUBSCRIBER(
            $id: ID!
            $tokenHash: String!
            $expiresAt: String!
            $sessionId: String!
         ) {
            updateSubscriber(
               data: {
                  refreshTokens: {
                     create: {
                        tokenHash: $tokenHash
                        expiresAt: $expiresAt
                        sessionId: $sessionId
                        subscriber: {
                           connect: {
                              id: $id
                           }
                        }
                     }
                  }
               },
               where: {
                  id: $id
               }
            ) {
               id
               refreshTokens {
                  id
               }
            }

            publishSubscriber(to: PUBLISHED, where: { id: $id }) {
               __typename
            }

            publishRefreshToken(where: { tokenHash: $tokenHash}) {
               id
            }
            }
      `;

      const variables = {
         id: token.id,
         tokenHash: token.hashedRefreshToken,
         expiresAt: token.expiresAt,
         sessionId: token.sessionId,
      };

      try {
         await axios.post(
            this.baseURL as string,
            { query, variables },
            {
               headers: this.headers,
            },
         );
         return {
            success: true,
         };
      } catch (error: any) {
         console.error({
            error: error,
            errorJson: JSON.stringify(error.response.data, null, 2),
         });

         return {
            success: false,
         };
      }
   }

   private async deleteCookieToDb(userSession: { sub: string; tokenId: string } | null) {
      const query = `
         mutation UPDATE_TOKEN($tokenId: ID!, $revokedAt: String!) {
            updateRefreshToken(
               where: { id: $tokenId },
               data: { revokedAt: $revokedAt }
            ) {
               id
            }

            publishRefreshToken(where: { id: $tokenId }) {
               id
            }
         }
      `;

      const variables = {
         tokenId: userSession?.tokenId,
         revokedAt: new Date().toISOString(),
      };

      await axios.post(
         this.baseURL as string,
         { query, variables },
         {
            headers: this.headers,
         },
      );
   }

   async login(email: string, password: string) {
      const verifyUser = await this.verifyUser(email);
      if (!verifyUser) {
         throw new GraphQLError('Usuário não existe ou sua solicitação ainda não foi aprovada...', {
            extensions: {
               code: 'FORBIDDEN',
            },
         });
      }

      const hash = await bcrypt.compare(password, verifyUser.password);
      if (!hash) {
         throw new GraphQLError('Email ou senha incorreta, tente novamente...');
      }

      const sessionId = crypto.randomUUID();

      const accessToken = createAccessToken({
         sub: verifyUser.id,
         sessionId,
      });
      const refreshToken = createRefeshToken();
      const hashedRefreshToken = hashToken(refreshToken);

      const { success } = await this.saveCookieToDb({
         id: verifyUser.id,
         hashedRefreshToken,
         expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
         sessionId,
      });

      if (!success) {
         throw new GraphQLError('Error ao fazer login', {
            extensions: {
               code: 'INTERNAL_SERVER_ERROR',
            },
         });
      }

      cookies().set('auth-access-token', accessToken, {
         httpOnly: true,
         secure: process.env.NODE_ENV === 'production',
         sameSite: 'lax',
         maxAge: 24 * 60 * 60, // 1 day
         expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
         path: '/',
      });

      cookies().set('refresh-token', refreshToken, {
         httpOnly: true,
         secure: process.env.NODE_ENV === 'production',
         sameSite: 'strict',
         maxAge: 365 * 24 * 60 * 60, // 1 year
         expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
         path: '/api/auth/refresh-token',
      });

      return {
         success: true,
      };
   }

   async logout(accessToken: string) {
      const decodedToken = jwt.decode(accessToken) as { sub: string; sessionId: string } | null;

      try {
         const query = `
            query GET_SUBSCRIBER($id: ID!, $sessionId: String!) {
               subscriber(where: {
                  id: $id
               }) {
                  id
                  refreshTokens(where: {
                     sessionId: $sessionId
                  }) {
                     id
                  }
               }
            }
         `;

         const variables = { id: decodedToken?.sub, sessionId: decodedToken?.sessionId };

         const { data: cms } = await axios.post(
            this.baseURL as string,
            {
               query,
               variables,
            },
            { headers: this.headers },
         );

         const subscriber = cms.data.subscriber as { id: string; refreshTokens: { id: string }[] };

         if (subscriber.refreshTokens.length === 0) {
            throw new GraphQLError('No active session found', {
               extensions: {
                  code: 'FORBIDDEN',
               },
            });
         }

         await this.deleteCookieToDb({
            sub: subscriber.id,
            tokenId: subscriber.refreshTokens[0].id,
         });

         cookies().delete({
            name: 'refresh-token',
            path: '/api/auth/refresh-token',
         });
         cookies().delete('auth-access-token');

         return true;
      } catch (error) {
         if (error instanceof axios.AxiosError) {
            const data = error.response?.data;

            console.error('Axios error during logout:', JSON.stringify(data, null, 2));
         } else if (error instanceof GraphQLError) {
            throw error;
         }

         throw new GraphQLError('Error during logout process', {
            extensions: {
               code: 'INTERNAL_SERVER_ERROR',
            },
         });
      }
   }
}
