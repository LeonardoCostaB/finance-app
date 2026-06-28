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
         console.error({
            error,
            errorJson: JSON.stringify(error.response.data, null, 2),
         });
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
      type,
   }: {
      userId: string;
      data: { name: string; value: number };
      type: 'create' | 'update';
   }) {
      const user = await this.getUserById(userId);

      if (!user) {
         throw new GraphQLError('User not found');
      }

      if (!data.name || !data.value) {
         throw new GraphQLError('Nome ou valor não preenchido');
      }

      if (
         type === 'create' &&
         user?.commonPayment?.some(
            (payment) => normalizeId(payment.name) === normalizeId(data.name),
         )
      ) {
         throw new GraphQLError('Já existe um pagamento com esse nome');
      }

      const findPayment = user?.commonPayment?.find(
         (payment) => normalizeId(payment.name) === normalizeId(data.name),
      );

      if (
         type === 'update' &&
         normalizeId(findPayment?.name ?? '') === normalizeId(data.name) &&
         findPayment?.value === data.value
      ) {
         throw new GraphQLError('Você deve alterar algum dos valores para continuar');
      }

      const commonPaymentJson = {
         id: normalizeId(data.name),
         name: data.name,
         value: data.value,
         date: {
            published: new Date().toISOString(),
         },
      };

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
      let variables;

      const createCommonPayment = user.commonPayment?.length
         ? [...user.commonPayment, commonPaymentJson]
         : [commonPaymentJson];

      if (type === 'create') {
         variables = {
            userId,
            commonPayments: createCommonPayment,
         };
      }

      if (type === 'update') {
         const updateIndex = user.commonPayment?.findIndex(
            (commonPayment) => normalizeId(commonPayment.name) === normalizeId(data.name),
         );

         user.commonPayment[updateIndex] = commonPaymentJson;

         variables = {
            userId,
            commonPayments: user.commonPayment,
         };
      }

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

   async deleteCommonPayment({ userId, paymentName }: { userId: string; paymentName: string }) {
      const user = await this.getUserById(userId);

      if (!user) {
         throw new GraphQLError('User not found');
      }

      if (
         !paymentName ||
         !user?.commonPayment?.some(
            (payment) => normalizeId(payment.name) === normalizeId(paymentName),
         )
      ) {
         throw new GraphQLError('Pagamento não encontrado');
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

      const variables = {
         userId,
         commonPayments: user.commonPayment.filter(
            (payment) => payment.id !== normalizeId(paymentName),
         ),
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

   // async updateAllMonths({ userId }: { userId: string }) {
   //    const user = await this.getUserById(userId);

   //    if (!user) {
   //       throw new GraphQLError('User not found');
   //    }

   //    // atualizar todos os valores de earnings e expenses para o mesmo formato em * 100 para contabilizar centavos
   //    const updatedMonths = user.months.map((month) => {
   //       const updatedEarnings = month.earnings.map((earning) => {
   //          const updatedExtract = earning.extract.map((extract) => ({
   //             ...extract,
   //             value: extract.value * 100,
   //          }));
   //          return {
   //             ...earning,
   //             extract: updatedExtract,
   //          };
   //       });

   //       const updatedExpenses = month.expenses.map((expense) => {
   //          const updatedExtract = expense.extract.map((extract) => ({
   //             ...extract,
   //             value: extract.value * 100,
   //          }));
   //          return {
   //             ...expense,
   //             extract: updatedExtract,
   //          };
   //       });

   //       return {
   //          ...month,
   //          earnings: updatedEarnings,
   //          expenses: updatedExpenses,
   //       };
   //    });

   //    // atualizar todos os valores de commonPayment para o mesmo formato em * 100 para contabilizar centavos
   //    const updatedCommonPayment = user.commonPayment.map((payment) => ({
   //       ...payment,
   //       value: payment.value / 100,
   //    }));

   //    // const updatedBenefits = user.benefits?.map((benefit) => ({
   //    //    ...benefit,
   //    //    value: benefit.value * 100,
   //    // }));

   //    // atualizar tambem os valores de monthlySalary para o mesmo formato em * 100 para contabilizar centavos
   //    // const updatedMonthlySalary = user.monthlySalary.map((salary) => ({
   //    //    ...salary,
   //    //    salary: salary.salary / 100,
   //    // }));

   //    const updatedUser = {
   //       ...user,
   //       // months: {
   //       //    update: [
   //       //       ...updatedMonths.map((month) => ({
   //       //          where: { id: month.id },
   //       //          data: {
   //       //             ...month,
   //       //             id: undefined,
   //       //             createdAt: undefined,
   //       //          },
   //       //       })),
   //       //    ],
   //       // },
   //       commonPayment: updatedCommonPayment,
   //       // benefits: updatedBenefits,
   //       // monthlySalary: updatedMonthlySalary,
   //    };

   //    const query = `
   //       mutation UpdateSubscriber($userId: ID!, $commonPayments: Json, $monthlySalary: Json) {
   //          updateSubscriber(
   //             data: {
   //                commonPayment: $commonPayments,
   //                monthlySalary: $monthlySalary
   //             }
   //             where: {
   //                id: $userId
   //             }
   //          ) {
   //             id
   //             months {
   //                id
   //             }
   //          }
   //          publishSubscriber(where: {id: $userId}) {
   //             id
   //          }
   //       }
   //    `;

   //    console.log('Updating user months:', updatedUser.months);

   //    const variables = {
   //       userId,
   //       // months: updatedUser.months,
   //       commonPayments: updatedUser.commonPayment,
   //       // monthlySalary: updatedUser.monthlySalary,
   //    };

   //    // atualizar de 10 em 10 meses para não sobrecarregar o servidor
   //    // const chunkSize = 10;
   //    // const chunks = [];
   //    // for (let i = 0; i < updatedUser.months.update.length; i += chunkSize) {
   //    //    chunks.push(updatedUser.months.update.slice(i, i + chunkSize));
   //    // }

   //    // for (const chunk of chunks) {
   //    //    variables.months = { update: chunk };

   //    try {
   //       const { data: cms } = await axios.post(
   //          this.baseURL as string,
   //          {
   //             query,
   //             variables,
   //          },
   //          { headers: this.headers },
   //       );

   //       console.log('Updated months:', cms.data.updateSubscriber.months);
   //    } catch (error: any) {
   //       console.log(error.response.data);

   //       throw new GraphQLError('Tivemos um error ao atualizar seu dados, tente novamente');
   //    }
   //    // }
   // }
}
