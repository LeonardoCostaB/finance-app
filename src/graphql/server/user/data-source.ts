import axios from 'axios';
import { RESTDataSource } from 'apollo-datasource-rest';

interface UserApiResponse {
   getUser: {
      data: {
         subscriber: User;
      };
   };
}

export class UserApi extends RESTDataSource {
   private headers: { ['Content-Type']: string; Authorization: string };

   constructor() {
      super();
      this.baseURL = process.env.BASE_URL;
      this.headers = {
         'Content-Type': 'application/json',
         Authorization: process.env.AUTH_TOKEN as string,
      };
   }

   private async getUser(
      id: string,
   ): Promise<UserApiResponse['getUser']['data']['subscriber'] | undefined> {
      const query = `
         query GET_SUBSCRIBER($id: ID!) {
            subscriber(where: { id: $id }) {
               id
               name
               email
               monthlySalary
               commonPayment
               benefits
               economy {
                  id
                  extract
               }
               avatar {
                  id
                  url
               }
               months {
                  id
                  title
                  date
                  createdAt
                  expenses
                  earnings
               }
            }
         }
      `;
      const variables = { id };

      try {
         const { data: user } = await axios.post<UserApiResponse['getUser']>(
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

   getUserById(id: string): Promise<UserApiResponse['getUser']['data']['subscriber'] | undefined> {
      return this.getUser(id);
   }
}
