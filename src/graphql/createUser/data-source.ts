import { RESTDataSource } from "apollo-datasource-rest";
import axios from "axios";
import bcrypt from 'bcryptjs';

/*
   Em sistemas de login é muito importante não ter cache
*/

type UserApiParams = {
   createUser: {
      userName: string;
      email: string;
      password: string;
   }
}

export class UserApi extends RESTDataSource {
   constructor() {
      super();
      this.baseURL = process.env.BASE_URL as string;
   }

   async createUser(data: UserApiParams['createUser']) {
      let passHash: string = '';

      if (data.password) {
         passHash = await bcrypt.hash(data.password, 12);
      }

      const mutation = `
         mutation MyMutation($name:String!, $email: String!, $pass: String!) {
            createSubscriber(data: {name: $name, email: $email, password: $pass}) {
               id
            }
         }
      `;

      const variables = {
         name: data.userName,
         email: data.email,
         pass: passHash
      }

      const headers = {
         'Content-Type': 'application/json',
         'Authorization': process.env.AUTH_TOKEN as string,
      };

      try {
         const { data } = await axios.post(
            this.baseURL as string,
            {
               query: mutation,
               variables,
            },
            {
               headers,
            }
         )

         return {
            userName: data.userName,
            authenticated: false
         }

      } catch (error: any) {
         return {
            error: error.response.data.errors,
         }
      }
   }
}
