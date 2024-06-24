import axios from "axios";
import bcrypt from 'bcryptjs';

import { RESTDataSource } from "apollo-datasource-rest";
import { createJwtToken } from "./utils/login-repositories";

interface LoginApiResponse {
   getUser: {
      data: {
         subscriber: {
            name: string;
            email: string;
            password: string;
         }
      }
   }
}

export class LoginApi extends RESTDataSource {
   constructor() {
      super();
      this.baseURL = process.env.BASE_URL;
   }

   async verifyUser(email: string): Promise<LoginApiResponse['getUser']['data']['subscriber'] | undefined>{
      const query = `
         query GET_SUBSCRIBER($email: String) {
            subscriber(where: { email: $email }) {
               name,
               email,
               password
            }
         }
      `;

      const variables = { email };
      const headers = {
         'Content-Type': 'application/json',
         'Authorization': process.env.AUTH_TOKEN as string,
      };

      try {
         const { data: user } = await axios.post<LoginApiResponse['getUser']>(
            this.baseURL as string,
            {
               query,
               variables
            },
            { headers }
         )

         return user.data.subscriber;

      } catch (error: any) {
         console.log(error)
      }
   }

   async login(email: string, password: string) {
      const verifyUser = await this.verifyUser(email);

      if (!verifyUser) {
         throw new Error("User or password incorrect")
      }

      const hash = await bcrypt.compare(password, verifyUser.password);

      if (!hash) {
         throw new Error("User or password incorrect")
      }

      const token = createJwtToken({ name: verifyUser.name, email });

      return {
         token,
      }
   }

   async logout(userName: string) {
      // const user = await this.getUser(userName);

      // if (user[0].id !== this.context.loggedUserId) {
      //    throw new Error("You are not this user");
      // }

      // await this.patch(user[0].id, { token: "" }, { cacheOptions: { ttl: 0 } });
      // this.context.res.clearCookie('jwtToken')

      return true;
   }
}
