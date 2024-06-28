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
   getUser: {
      data: {
         id: string;
         token: string;
      }
   }
}

export class UserApi extends RESTDataSource {
   constructor() {
      super();
      this.baseURL = process.env.BASE_URL as string;
   }

   async getUser(userId: string) {
      const query = `
         query GET_SUBSCRIBER($id: ID!) {
            subscriber(where: { id: $id }) {
               id,
               sessionToken
            }
         }
      `;

      const variables = { id: userId };
      const headers = {
         'Content-Type': 'application/json',
         'Authorization': process.env.AUTH_TOKEN as string,
      };

      try {
         const { data: user } = await axios.post(
            this.baseURL as string,
            {
               query,
               variables
            },
            { headers }
         )

         return {
            id: user.data.subscriber.id,
            token: user.data.subscriber.sessionToken,
         };

      } catch (error: any) {
         console.log(error)

         return {
            id: '',
            token: ''
         }
      }
   }

   async createUser(data: UserApiParams['createUser']) {
      let passHash: string = '';

      if (data.password) {
         passHash = await bcrypt.hash(data.password, 12);
      }

      const mutation = `
         mutation MyMutation($name:String!, $email: String!, $pass: String!) {
            createSubscriber(data: {name: $name, email: $email, password: $pass}) {
               name
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
         const { data: user } = await axios.post(
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
            userName: user.data.createSubscriber.name,
            authenticated: false
         }

      } catch (error: any) {
         return {
            error: error.response.data.errors,
         }
      }
   }
}
