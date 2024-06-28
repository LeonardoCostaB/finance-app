import axios from "axios";
import bcrypt from 'bcryptjs';

import { RESTDataSource } from "apollo-datasource-rest";
import { createJwtToken } from "./utils/login-repositories";
import { cookies } from "next/headers";

interface LoginApiResponse {
   getUser: {
      data: {
         subscriber: {
            id: string;
            password: string;
         }
      }
   }
}

export class LoginApi extends RESTDataSource {
   private headers: { ['Content-Type']: string; Authorization: string }

   constructor() {
      super();
      this.baseURL = process.env.BASE_URL;
      this.headers = {
         'Content-Type': 'application/json',
         'Authorization': process.env.AUTH_TOKEN as string,
      }
   }

   private async verifyUser(email: string): Promise<LoginApiResponse['getUser']['data']['subscriber'] | undefined>{
      const query = `
         query GET_SUBSCRIBER($email: String) {
            subscriber(where: { email: $email }) {
               id,
               password
            }
         }
      `;
      const variables = { email };

      try {
         const { data: user } = await axios.post<LoginApiResponse['getUser']>(
            this.baseURL as string,
            {
               query,
               variables
            },
            { headers: this.headers }
         )

         return user.data.subscriber;

      } catch (error: any) {
         console.log(error)
      }
   }

   private async saveCookieToDb(user: { id: string, email: string, password: string }) {
      const token = createJwtToken({ id: user.id })

      const query = `
         mutation MyMutation($token: String!, $id: ID!) {
            updateSubscriber(data: { sessionToken: $token }, where: { id: $id }) {
               id
            }

            publishManySubscribers(to: PUBLISHED, where: { id: $id }) {
               __typename
            }
         }
      `
      const variables = {
         token,
         id: user.id,
      }

      try {
         await axios.post(
            this.baseURL as string,
            { query, variables },
            {
               headers: this.headers,
            }
         );

         return token;

      } catch (error: any) {
         console.log(error.response.data.errors[0].extensions.failedActions)

         return { error: error.response.data.errors }
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
      `
      const variables = {
         token: '',
         id: userId,
      }

      try {
         await axios.post(
            this.baseURL as string,
            { query, variables },
            {
               headers: this.headers,
            }
         );

         return true;

      } catch (error: any) {
         console.log(error.response.data.errors[0].extensions.failedActions)

         return { error: error.response.data.errors }
      }
   }

   async login(email: string, password: string) {
      const verifyUser = await this.verifyUser(email);

      if (!verifyUser) {
         throw new Error("Usuário não existe ou sua solicitação ainda não foi aprovada...");
      }

      const hash = await bcrypt.compare(password, verifyUser.password);

      if (!hash) {
         throw new Error("Email ou senha incorreta, tente novamente...")
      }

      const token = await this.saveCookieToDb({ ...verifyUser, email });

      if (typeof token !== 'string') throw new Error("Obtivemos um error ao válidar o usuário");

      cookies().set({
         name: 'auth-token',
         value: token,
         secure: true,
         httpOnly: true,
         maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
         path: "/", // onde o cookie vai ser válido,
      })

      cookies().set({
         name: 'isLoggedIn',
         value: 'true',
         secure: true,
         maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
         path: "/", // onde o cookie vai ser válido,
      })

      return {
         token,
      }
   }

   async logout(userId: string) {
      // const user = await this.getUser(userName);

      // if (user[0].id !== this.context.loggedUserId) {
      //    throw new Error("You are not this user");
      // }

      // await this.patch(user[0].id, { token: "" }, { cacheOptions: { ttl: 0 } });
      // this.context.res.clearCookie('jwtToken')

      await this.deleteCookieToDb(userId)

      cookies().delete('auth-token')
      cookies().delete('isLoggedIn')

      return true;
   }
}
