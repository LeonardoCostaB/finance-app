import axios from 'axios';
import bcrypt from 'bcryptjs';
import { GraphQLError } from 'graphql';

import { RESTDataSource } from 'apollo-datasource-rest';
import { createJwtToken } from './utils/login-repositories';
import { cookies } from 'next/headers';

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
               refreshToken {
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
         console.log(error);
      }
   }

   private async saveCookieToDb(user: {
      id: string;
      email: string;
      password: string;
      refreshToken: { id: string };
   }) {
      const token = createJwtToken({ id: user.id });

      const query = `
         mutation UPDATE_SUBSCRIBER(
            $token: String,
            $createRefreshToken: RefreshTokenUpdateOneInlineInput,
            $id: ID!,
            $userRefreshTokenId: String
         ) {
            updateSubscriber(
               data: {
                  sessionToken: $token,
                  refreshToken: $createRefreshToken
               },
               where: {
                  id: $id
               }
            ) {
               id
               refreshToken {
                  id
               }
            }

            publishSubscriber(to: PUBLISHED, where: { id: $id }) {
               __typename
            }

            publishRefreshToken(where: { userId: $userRefreshTokenId }) {
               id
            }
         }
      `;

      const createRefreshToken = user?.refreshToken?.id
         ? {
              update: {
                 where: {
                    userId: user.id,
                 },
                 data: {
                    expiresIn: Date.now() + 1000 * 60 * 60 * 24 * 7,
                 },
              },
           }
         : {
              create: {
                 userId: user.id,
                 expiresIn: Date.now() + 1000 * 60 * 60 * 24 * 7,
              },
           };

      const variables = {
         token,
         createRefreshToken,
         id: user.id,
         userRefreshTokenId: user.id,
      };

      try {
         const { data: cms } = await axios.post(
            this.baseURL as string,
            { query, variables },
            {
               headers: this.headers,
            },
         );

         return {
            token,
            refreshToken: cms.data.updateSubscriber.refreshToken.id,
         };
      } catch (error: any) {
         console.log(error.response.data);

         return { error: error.response.data.errors };
      }
   }

   private async deleteCookieToDb(userId: string) {
      const query = `
         mutation MyMutation($token: String!, $id: ID!) {
            updateSubscriber(data: {sessionToken: $token}, where: {id: $id}) {
               id
            }

            publishManySubscribers(to: PUBLISHED, where: {id: $id}) {
               __typename
            }
         }
      `;
      const variables = {
         token: '',
         id: userId,
      };

      try {
         await axios.post(
            this.baseURL as string,
            { query, variables },
            {
               headers: this.headers,
            },
         );

         return true;
      } catch (error: any) {
         console.log(error.response.data.errors[0].extensions.failedActions);

         return { error: error.response.data.errors };
      }
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

      const data = await this.saveCookieToDb({ ...verifyUser, email });

      if (typeof data.token !== 'string')
         throw new GraphQLError('Obtivemos um error ao válidar o usuário');

      // cookies().set({
      //    name: 'refresh-token',
      //    value: data.refreshToken,
      //    secure: true,
      //    httpOnly: true,
      //    maxAge: 1000 * 60 * 60 * 24 * 60, // 7 days
      //    path: '/', // onde o cookie vai ser válido,
      // });

      cookies().set({
         name: 'auth-token',
         value: data.token,
         secure: true,
         httpOnly: true,
         maxAge: 1000 * 60 * 60 * 24 * 60, // 7 days
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
         token: data.token,
      };
   }

   async logout(userId: string) {
      await this.deleteCookieToDb(userId);

      cookies().delete('auth-token');
      cookies().delete('isLoggedIn');
      cookies().delete('refresh-token');

      return true;
   }
}
