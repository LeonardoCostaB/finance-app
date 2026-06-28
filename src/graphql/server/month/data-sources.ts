import axios from 'axios';
import { RESTDataSource } from 'apollo-datasource-rest';
import { AddExpenseItem } from './resolvers';
import { normalizeId } from '@/utils/normalize-id';
import { GraphQLError } from 'graphql';
import { randomUUID } from 'crypto';

export class MonthApi extends RESTDataSource {
   private headers: { ['Content-Type']: string; Authorization: string };
   private userId: string | null;

   constructor(isLoggedIn: string | null) {
      super();
      this.baseURL = process.env.BASE_URL;
      this.userId = isLoggedIn;
      this.headers = {
         'Content-Type': 'application/json',
         Authorization: process.env.AUTH_TOKEN as string,
      };
   }

   private verifyUserAuthenticity(currentUserId: string | null, dbUserId: string) {
      if (!currentUserId || currentUserId !== dbUserId) {
         throw new Error('Você não tem permissão para acessar esse item');
      }
   }

   private async getMonthById(id: string) {
      const query = `
         query GET_MONTH($id: ID!) {
            month(where: {id: $id}) {
               id
               title
               user {
                  id
               }
               expenses
               earnings
            }
         }
      `;

      const variables = { id };

      try {
         const { data } = await axios.post<{ data: { month: Months } }>(
            this.baseURL as string,
            {
               query,
               variables,
            },
            { headers: this.headers },
         );

         return data.data.month;
      } catch (error) {
         console.log(error);
      }
   }

   async createMonth(data: { month: string; year: string }, user?: User) {
      const months = user?.months?.map((month) => ({
         month: new Date(month.date).getMonth().toString(),
         year: new Date(month.date).getFullYear().toString(),
      }));

      const verifyIfMonthExists = months?.filter(
         (month) => month.month === data.month && month.year === data.year,
      );

      if (verifyIfMonthExists && verifyIfMonthExists?.length > 0)
         throw new GraphQLError('Você já cadastrou esse mês');

      const date = new Date(`${data.year}-${String(+data.month + 1)}-10`);

      const query = `
         mutation CREATE_MONTH(
            $ref: String!,
            $title: String!,
            $date: String!,
            $id: ID!
            $expenses: [Json!]
         ) {
            createMonth(data: {
               ref: $ref,
               title: $title,
               date: $date,
               user: {connect: {id: $id}},
               expenses: $expenses,
               earnings: [],
            }) {
               id
               title
               createdAt
               date
               expenses
               earnings
            }

            publishMonth(where: {ref: $ref}) {
               id
            }
         }
      `;

      const commonPayments = user?.commonPayment?.map((payment) => {
         return {
            ...payment,
            id: `${normalizeId(payment.name)}-${randomUUID()}`,
         };
      });

      const variables = {
         ref: `${date.toLocaleDateString('pt-BR', { month: 'long', year: '2-digit' }).replace(/\s/g, '-')}-${this.userId}`,
         title: date.toLocaleDateString('pt-BR', { month: 'long' }),
         date,
         id: this.userId,
         expenses: commonPayments
            ? [
                 {
                    id: `${normalizeId('comuns')}-${randomUUID()}`,
                    title: 'Comuns',
                    created: new Date().toISOString(),
                    extract: commonPayments,
                 },
              ]
            : [],
      };

      try {
         const { data: cms } = await axios.post<{ data: { createMonth: Months } }>(
            this.baseURL as string,
            { query, variables },
            { headers: this.headers },
         );

         return cms.data.createMonth;
      } catch (e: any) {
         console.log(e.response.data);
      }
   }

   async deleteMonth(monthId: string) {
      const month = await this.getMonthById(monthId);

      if (!month) {
         throw new Error('Month not found');
      }

      this.verifyUserAuthenticity(this.userId, month.user?.id);

      const query = `
         mutation deleteMonth($monthId: ID!, $userId: ID!) {
            deleteMonth(where: { id: $monthId }) {
               id
            }

            publishSubscriber(where: {id: $userId}, to: PUBLISHED) {
               id
            }
         }
      `;

      const variables = {
         monthId,
         userId: this.userId,
      };

      try {
         const { data: cms } = await axios.post(
            this.baseURL as string,
            { query, variables },
            { headers: this.headers },
         );

         return {
            id: cms.data.deleteMonth.id,
         };
      } catch (e: any) {
         console.log(e.response.data.errors);
         throw new GraphQLError('Tivemos um erro ao deletar ao mês, tente novamente');
      }
   }

   async createEarningOrExpense({
      monthId,
      title,
      type,
   }: {
      monthId: string;
      title: string;
      type: 'earnings' | 'expenses';
   }) {
      const month = await this.getMonthById(monthId);

      if (!month) {
         throw new Error('Month not found');
      }

      this.verifyUserAuthenticity(this.userId, month.user?.id);

      let query = '';
      let variables: any = {};

      if (type === 'expenses') {
         const expenses = month?.expenses?.filter(
            (expense) => normalizeId(expense.title) === normalizeId(title),
         );

         if (expenses && expenses.length > 0)
            throw new Error('Você já tem uma despesa cadastrado com esse título');

         query = `
            mutation CREATE_EXPENSES($expenses: [Json!], $monthId: ID!) {
               updateMonth(
                  data: {expenses: $expenses},
                  where: {id: $monthId}
               ) {
                  expenses
               }

               publishManyMonths(where: {id: $monthId}, to: PUBLISHED) {
                  __typename
               }
            }
         `;

         variables = {
            monthId,
            expenses: [
               ...month.expenses,
               {
                  id: `${normalizeId(title)}-${randomUUID()}`,
                  title: title,
                  created: new Date().toISOString(),
                  extract: [],
               },
            ],
         };
      } else {
         const earnings = month?.earnings?.filter(
            (earning) => normalizeId(earning.title) === normalizeId(title),
         );

         if (earnings && earnings?.length > 0)
            throw new Error('Você já tem um ganho cadastrado com esse título');

         query = `
            mutation CREATE_EARNINGS($earnings: [Json!], $monthId: ID!) {
               updateMonth(
                  data: {earnings: $earnings},
                  where: {id: $monthId}
               ) {
                  earnings
               }

               publishManyMonths(where: {id: $monthId}, to: PUBLISHED) {
                  __typename
               }
            }
         `;

         variables = {
            monthId,
            earnings: [
               ...month.earnings,
               {
                  id: `${normalizeId(title)}-${randomUUID()}`,
                  title: title,
                  created: new Date().toISOString(),
                  extract: [],
               },
            ],
         };
      }

      try {
         const { data: createEarnings } = await axios.post(
            this.baseURL as string,
            { query, variables },
            { headers: this.headers },
         );

         return createEarnings.data.updateMonth;
      } catch (error) {
         console.log(error);

         throw new GraphQLError('Tivemos um erro, tente novamente mais tarde');
      }
   }

   async deleteEarning({ monthId, title }: { monthId: string; title: string }) {
      const month = await this.getMonthById(monthId);

      if (!month) {
         throw new GraphQLError('Month not found');
      }

      this.verifyUserAuthenticity(this.userId, month.user?.id);

      const earnings = month.earnings.filter(
         (earning) => normalizeId(earning.title) !== normalizeId(title),
      );

      const query = `
         mutation DELETE_EARNINGS($monthId: ID!, $earnings: [Json!]) {
            updateMonth(data: {earnings: $earnings}, where: {id: $monthId}) {
               id
            }
            publishMonth(where: {id: $monthId}) {
               id
            }
         }
      `;

      const variables = {
         monthId,
         earnings,
      };

      try {
         const { data: cms } = await axios.post(
            this.baseURL as string,
            { query, variables },
            { headers: this.headers },
         );

         return {
            id: cms.data.updateMonth.id,
         };
      } catch (error: any) {
         console.log(error.response.data);
         throw new GraphQLError('Tivemos um erro, tente novamente mais tarde');
      }
   }

   async deleteExpenses({ monthId, title }: { monthId: string; title: string }) {
      const month = await this.getMonthById(monthId);

      if (!month) {
         throw new GraphQLError('Month not found');
      }

      this.verifyUserAuthenticity(this.userId, month.user?.id);

      const expenses = month.expenses.filter(
         (expense) => normalizeId(expense.title) !== normalizeId(title),
      );

      const query = `
         mutation DELETE_EARNINGS($monthId: ID!, $expenses: [Json!]) {
            updateMonth(data: {expenses: $expenses}, where: {id: $monthId}) {
               id
            }
            publishMonth(where: {id: $monthId}) {
               id
            }
         }
      `;

      const variables = {
         monthId,
         expenses,
      };

      try {
         const { data: cms } = await axios.post(
            this.baseURL as string,
            { query, variables },
            { headers: this.headers },
         );

         return {
            id: cms.data.updateMonth.id,
         };
      } catch {
         throw new GraphQLError('Tivemos um erro, tente novamente mais tarde');
      }
   }

   async createEarningItem({ monthId, data }: { monthId: string; data: AddExpenseItem['data'] }) {
      const month = await this.getMonthById(monthId);

      if (!month) {
         throw new Error('Month not found');
      }

      this.verifyUserAuthenticity(this.userId, month.user?.id);

      const earnings = month.earnings?.filter((earning) => earning.title === data.title);

      if (!earnings) {
         throw new Error('Earning not found');
      }

      const earningItemExist = earnings
         .map((earning) => earning.extract)
         .reduce((acc, item) => acc.concat(item), [])
         .some((extract) => normalizeId(extract.name) === normalizeId(data.name));

      if (earningItemExist) throw new Error('Você já tem um item cadastrado com esse nome');

      const extract = {
         id: `${normalizeId(data.name)}-${randomUUID()}`,
         name: data.name,
         value: data.value * 100,
         date: {
            published: new Date().toISOString(),
         },
         link: data?.link,
         notes: data?.notes,
      };

      earnings[0].extract.push(extract);

      const expenseIndex = month.expenses.findIndex((i) => i.title === data.title);
      month.expenses[expenseIndex] = earnings[0];

      const query = `
         mutation CREATE_EARNINGS($earnings: [Json!], $monthId: ID!) {
            updateMonth(
               data: {earnings: $earnings},
               where: {id: $monthId}
            ) {
               id
               earnings
            }

            publishManyMonths(where: {id: $monthId}, to: PUBLISHED) {
               __typename
            }
         }
      `;

      const variables = {
         monthId,
         earnings: [...month.earnings],
      };

      try {
         const { data: createEarningItem } = await axios.post(
            this.baseURL as string,
            { query, variables },
            { headers: this.headers },
         );

         return createEarningItem.data.updateMonth;
      } catch (error) {
         console.log(error);
      }
   }

   async updateEarningItem({
      monthId,
      data,
      type,
   }: {
      monthId: string;
      data: { title: string; id: string; name: string; value: number; link: string; notes: string };
      type: 'earnings' | 'expenses';
   }) {
      const month = await this.getMonthById(monthId);

      if (!month) {
         throw new Error('Month not found');
      }

      this.verifyUserAuthenticity(this.userId, month.user?.id);

      const earnings = month[type]?.filter((earning) => earning.title === data.title);

      if (!earnings) {
         throw new Error('Earning not found');
      }

      const monthExtract = earnings.flatMap((earning) => earning.extract);
      const verifyIfExist = monthExtract.find((extract) => extract.id === data.id);
      const itemNameExist = monthExtract.some(
         (extract) => normalizeId(extract.name) === normalizeId(data.name),
      );

      if (!verifyIfExist) throw new GraphQLError('Despesa não existe');
      if (!(normalizeId(verifyIfExist.name) === normalizeId(data.name)) && itemNameExist)
         throw new Error('Você já tem um item cadastrado com esse nome');

      const newExtract: MonthExtract = {
         ...verifyIfExist,
         value: data.value * 100,
         link: data.link,
         notes: data.notes,
         name: data.name,
      };

      const query = `
         mutation CREATE_EARNINGS($earnings: [Json!], $monthId: ID!) {
            updateMonth(
               data: {${type}: $earnings},
               where: {id: $monthId}
            ) {
               id
               ${type}
            }

            publishManyMonths(where: {id: $monthId}, to: PUBLISHED) {
               __typename
            }
         }
      `;

      const variables = {
         monthId,
         earnings: [
            ...month[type].filter((monthExtract) => monthExtract.title !== data.title),
            {
               title: data.title,
               extract: [
                  ...monthExtract.filter((monthExtract) => monthExtract.id !== data.id),
                  {
                     ...newExtract,
                  },
               ],
            },
         ],
      };

      try {
         const { data: createEarningItem } = await axios.post(
            this.baseURL as string,
            { query, variables },
            { headers: this.headers },
         );

         return createEarningItem.data.updateMonth;
      } catch (error) {
         console.log(error);
      }
   }

   async deleteEarningItem({
      monthId,
      earningTitle,
      earningItemId,
   }: {
      monthId: string;
      earningTitle: string;
      earningItemId: string;
   }) {
      const month = await this.getMonthById(monthId);

      if (!month) {
         throw new Error('Month not found');
      }

      this.verifyUserAuthenticity(this.userId, month.user?.id);

      const earnings = month.earnings?.filter(
         (month) => month.title.toLowerCase() === earningTitle.toLowerCase(),
      );

      if (!earnings || earnings.length <= 0) {
         throw new Error('item não encontrado');
      }

      const earningIndex = month.earnings.findIndex((i) => i.title === earningTitle);
      const removeEarningItem = earnings[0].extract.filter(
         (extract) => extract.id !== earningItemId,
      );

      month.earnings[earningIndex].extract = removeEarningItem;

      const query = `
         mutation MyMutation($id: ID!, $earnings: [Json!]) {
            updateMonth(
               data: {
                  earnings: $earnings
               },
               where: {id: $id}
            ) {
               id
               earnings
            }

            publishManyMonths(to: PUBLISHED, where: {id: $id}) {
               __typename
            }
         }
      `;

      const variables = {
         id: monthId,
         earnings: [...month.earnings],
      };

      try {
         await axios.post(
            this.baseURL as string,
            {
               query,
               variables,
            },
            { headers: this.headers },
         );

         return true;
      } catch (error: any) {
         console.log(error.response.data);

         return false;
      }
   }

   async deleteExpenseItem({
      monthId,
      expenseTitle,
      expenseItemId,
   }: {
      monthId: string;
      expenseTitle: string;
      expenseItemId: string;
   }) {
      const month = await this.getMonthById(monthId);
      const expenses = month?.expenses?.filter((month) => month.title === expenseTitle);

      if (!month) {
         throw new Error('Month not found');
      }

      this.verifyUserAuthenticity(this.userId, month.user?.id);

      if (!expenses || expenses.length <= 0) {
         throw new Error('Expense not found');
      }

      const expenseIndex = month.expenses.findIndex((i) => i.title === expenseTitle);
      const removeExpenseItem = expenses[0].extract.filter(
         (extract) => extract.id !== expenseItemId,
      );

      month.expenses[expenseIndex].extract = removeExpenseItem;

      const query = `
         mutation MyMutation($id: ID!, $expenses: [Json!]) {
            updateMonth(
               data: {
                  expenses: $expenses
               },
               where: {id: $id}
            ) {
               id
               expenses
            }

            publishManyMonths(to: PUBLISHED, where: {id: $id}) {
               __typename
            }
         }
      `;

      const variables = {
         id: monthId,
         expenses: [...month.expenses],
      };

      try {
         await axios.post(
            this.baseURL as string,
            {
               query,
               variables,
            },
            { headers: this.headers },
         );

         return true;
      } catch (error: any) {
         console.log(error.response.data);

         return false;
      }
   }

   async payExpense({
      monthId,
      expenseTitle,
      expenseItemId,
   }: {
      monthId: string;
      expenseTitle: string;
      expenseItemId: string;
   }) {
      const month = await this.getMonthById(monthId);
      const expenses = month?.expenses?.filter(
         (month) => normalizeId(month.title) === normalizeId(expenseTitle),
      );

      if (!month) {
         throw new Error('Month not found');
      }

      this.verifyUserAuthenticity(this.userId, month.user?.id);

      if (!expenses) {
         throw new Error('Expense not found');
      }

      const expenseItemIndex = expenses[0].extract.findIndex((i) => i.id === expenseItemId);
      const expenseIndex = month.expenses.findIndex((i) => i.title === expenseTitle);

      expenses[0].extract[expenseItemIndex].date.paidOut = new Date().toISOString();
      month.expenses[expenseIndex] = expenses[0];

      const query = `
         mutation MyMutation($id: ID!, $expenses: [Json!]) {
            updateMonth(
               data: {
                  expenses: $expenses
               },
               where: {id: $id}
            ) {
               id
               expenses
            }

            publishManyMonths(to: PUBLISHED, where: {id: $id}) {
               __typename
            }
         }
      `;

      const variables = {
         id: monthId,
         expenses: [...month.expenses],
      };

      try {
         const { data: payExpenseRes } = await axios.post(
            this.baseURL as string,
            {
               query,
               variables,
            },
            { headers: this.headers },
         );

         return payExpenseRes.data.updateMonth;
      } catch (error: any) {
         console.log(error.response.data);
      }
   }

   async addExpenseItem({ monthId, data }: { monthId: string; data: AddExpenseItem['data'] }) {
      const month = await this.getMonthById(monthId);

      const expenses = month?.expenses?.filter((month) => month.title === data.title);

      if (!month) {
         throw new Error('Month not found');
      }

      this.verifyUserAuthenticity(this.userId, month.user?.id);

      if (!expenses) {
         throw new Error('Expense not found');
      }

      const expenseItemExist = expenses
         .flatMap((expenseItem) => expenseItem?.extract)
         ?.some((extract) => normalizeId(extract.name) === normalizeId(data.name));

      if (expenseItemExist) throw new Error('Você já tem um item cadastrado com esse nome');

      const extract = {
         id: `${normalizeId(data.name)}-${randomUUID()}`,
         name: data.name,
         value: data.value * 100,
         date: {
            published: new Date().toISOString(),
         },
         link: data?.link,
         notes: data?.notes,
      };

      expenses[0].extract.push(extract);

      const expenseIndex = month.expenses.findIndex((i) => i.title === data.title);
      month.expenses[expenseIndex] = expenses[0];

      const query = `
         mutation MyMutation($id: ID!, $expenses: [Json!]) {
            updateMonth(
               data: {
                  expenses: $expenses
               },
               where: {id: $id}
            ) {
               id
               expenses
            }

            publishManyMonths(to: PUBLISHED, where: {id: $id}) {
               __typename
            }
         }
      `;

      const variables = {
         id: monthId,
         expenses: [...month.expenses],
      };

      try {
         const { data: updateExpense } = await axios.post(
            this.baseURL as string,
            {
               query,
               variables,
            },
            { headers: this.headers },
         );

         return updateExpense.data.updateMonth;
      } catch (error: any) {
         console.log(error.response.data);
      }
   }
}
