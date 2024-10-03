import axios from 'axios';
import { RESTDataSource } from 'apollo-datasource-rest';
import { GraphQLError } from 'graphql';
import { normalizeId } from '@/utils/normalize-id';
import { randomUUID } from 'crypto';

interface UserApiResponse {
   getUser: {
      data: {
         subscriber: User;
      };
   };
   updateUser: {
      data: {
         updateSubscriber: User;
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
               profession
               dateOfBirth
               location
               owner
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

         return {
            ...user.data.subscriber,
            monthlySalary: user.data.subscriber.monthlySalary?.length
               ? user.data.subscriber.monthlySalary.sort(
                    (a, b) => new Date(b.createAt).getTime() - new Date(a.createAt).getTime(),
                 )
               : user.data.subscriber.monthlySalary,
         };
      } catch (error: any) {
         console.log(error);
      }
   }

   private async updateUser({
      userId,
      data,
   }: {
      userId: string;
      data: {
         monthlySalary: number;
         name: string;
         profession: string;
         location: {
            city: string;
            state: string;
         };
      };
   }) {
      const user = await this.getUserById(userId);

      if (!user) {
         throw new GraphQLError('User not found');
      }

      const { monthlySalary, name, profession, location } = data;

      const verifyIfProfessionISEqual =
         profession && normalizeId(user.profession) === normalizeId(profession);
      const verifyIfLocationIsEqual =
         location?.city === user.location?.city && location?.state === user.location?.state;
      const verifyIfNameIsEqual = user.name === name;
      const checkIfIsEqualLastSalary = user.monthlySalary?.length
         ? user.monthlySalary.sort(
              (a, b) => new Date(b.createAt).getTime() - new Date(a.createAt).getTime(),
           )[0].salary === monthlySalary
         : false;

      if (
         verifyIfProfessionISEqual &&
         verifyIfLocationIsEqual &&
         verifyIfNameIsEqual &&
         checkIfIsEqualLastSalary
      ) {
         throw new GraphQLError('Não dectetamos nenhuma mudança nos dados');
      }

      const query = `
         mutation UpdateSubscriber(
            $userId: ID!,
            $name: String!,
            $profession: String,
            $monthlySalary: Json,
            $state: String!,
            $city: String!,
            $country: String!
         ) {
            updateSubscriber(
               data: {
                  name: $name,
                  monthlySalary: $monthlySalary,
                  profession: $profession,
                  location: {
                     city: $city,
                     state: $state,
                     country: $country
                  }
               }
               where: {
                  id: $userId
               }
            ) {
               id
               name
               email
               profession
               dateOfBirth
               location
               owner
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
            publishSubscriber(where: {id: $userId}) {
               id
            }
         }
      `;

      const variables = {
         userId,
         name: data.name,
         profession: data.profession,
         monthlySalary: checkIfIsEqualLastSalary
            ? user.monthlySalary
            : [
                 ...(user.monthlySalary?.length ? user.monthlySalary : []),
                 {
                    id: randomUUID(),
                    salary: monthlySalary,
                    createAt: new Date().toISOString(),
                 },
              ],
         state: data.location.state,
         city: data.location.city,
         country: 'Brasil',
      };

      try {
         const { data: user } = await axios.post<UserApiResponse['updateUser']>(
            this.baseURL as string,
            {
               query,
               variables,
            },
            { headers: this.headers },
         );

         return {
            ...user.data.updateSubscriber,
            monthlySalary: user.data.updateSubscriber.monthlySalary?.length
               ? user.data.updateSubscriber.monthlySalary.sort(
                    (a, b) => new Date(b.createAt).getTime() - new Date(a.createAt).getTime(),
                 )
               : user.data.updateSubscriber.monthlySalary,
         };
      } catch (error: any) {
         console.log(error);

         throw new GraphQLError('Tivemos um error ao atualizar seu dados, tente novamente');
      }
   }

   getUserById(id: string): Promise<UserApiResponse['getUser']['data']['subscriber'] | undefined> {
      return this.getUser(id);
   }

   updateUserById({
      userId,
      data,
   }: {
      userId: string;
      data: {
         monthlySalary: number;
         name: string;
         profession: string;
         location: {
            city: string;
            state: string;
         };
      };
   }) {
      return this.updateUser({ userId, data });
   }

   async createCommonPayment({
      userId,
      data,
   }: {
      userId: string;
      data: { name: string; value: number };
   }) {
      const user = await this.getUserById(userId);

      if (!user) {
         throw new GraphQLError('User not found');
      }

      if (!data.name || !data.value) {
         throw new GraphQLError('Nome ou valor não preenchido');
      }

      if (
         user?.commonPayment?.some(
            (payment) => normalizeId(payment.name) === normalizeId(data.name),
         )
      ) {
         throw new GraphQLError('Já existe um pagamento com esse nome');
      }

      const query = `
         mutation MyMutation($userId: ID!, $commonPayments: Json) {
            updateSubscriber(
               data: {
                  commonPayment: $commonPayments
               }
               where: {
                  id: $userId
               }
            ) {
               commonPayment
            }

            publishSubscriber(where: {id: $userId}) {
               id
            }
         }
      `;

      const commonPaymentJson = {
         id: data.name,
         name: data.name,
         value: data.value,
         date: {
            published: new Date().toISOString(),
         },
      };

      const variables = {
         userId,
         commonPayments: user.commonPayment?.length
            ? [...user.commonPayment, commonPaymentJson]
            : [commonPaymentJson],
      };

      try {
         const { data: cms } = await axios.post(
            this.baseURL as string,
            {
               query,
               variables,
            },
            { headers: this.headers },
         );

         return cms.data.updateSubscriber.commonPayment;
      } catch (error: any) {
         console.log(error.response.data);

         throw new GraphQLError('Tivemos um error ao atualizar seu dados, tente novamente');
      }
   }
}
