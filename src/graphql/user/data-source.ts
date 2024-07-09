import axios from "axios";
import { RESTDataSource } from "apollo-datasource-rest";
import { AddExpenseItem } from "./resolvers";

interface UserApiResponse {
   getUser: {
      data: {
         subscriber: User;
      }
   }
}

export class UserApi extends RESTDataSource {
   private headers: { ['Content-Type']: string; Authorization: string }

   constructor() {
      super();
      this.baseURL = process.env.BASE_URL;
      this.headers = {
         'Content-Type': 'application/json',
         'Authorization': process.env.AUTH_TOKEN as string,
      }
   }

   private async getMonthById(id: string) {
      const query = `
         query GET_MONTH($id: ID!) {
            month(where: {id: $id}) {
               id
               title
               expenses
            }
         }
      `;

      const variables = { id };

      try {
         const { data } = await axios.post<{data: { month: Months }}>(
            this.baseURL as string,
            {
               query,
               variables
            },
            { headers: this.headers }
         )

         return data.data.month.expenses;

      } catch (error) {
         console.log(error);
      }
   }

   private async getUser(id: string): Promise<UserApiResponse['getUser']['data']['subscriber'] | undefined>{
      const query = `
         query GET_SUBSCRIBER($id: ID!) {
            subscriber(where: { id: $id }) {
               id
               name
               email
               economy
               avatar {
                  id
                  url
               }
               months {
                  id
                  title
                  expenses
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
               variables
            },
            { headers: this.headers }
         )

         return user.data.subscriber;

      } catch (error: any) {
         console.log(error)
      }
   }

   async deleteExpenseItem({ monthId, expenseTitle, expenseItemId }: { monthId: string, expenseTitle: string, expenseItemId: string }) {
      const month = await this.getMonthById(monthId);
      const expenses = month?.filter(month => month.title === expenseTitle);

      if (!month) {
         throw new Error('Month not found');
      }

      if (!expenses) {
         throw new Error('Expense not found');
      }

      const expenseIndex = month.findIndex(i => i.title === expenseTitle);
      const removeExpenseItem = expenses[0].extract.filter(extract => extract.id !== expenseItemId);

      month[expenseIndex].extract = removeExpenseItem;

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
         expenses: [
            ...month,
         ],
      }

      try {
         await axios.post(
            this.baseURL as string,
            {
               query,
               variables
            },
            { headers: this.headers }
         )

         return true;

      } catch (error: any) {
         console.log(error.response.data)

         return false;
      }
   }

   async payExpense({ monthId, expenseTitle, expenseItemId }: { monthId: string, expenseTitle: string, expenseItemId: string }) {
      const month = await this.getMonthById(monthId);
      const expenses = month?.filter(month => month.title === expenseTitle)

      if (!month) {
         throw new Error('Month not found');
      }

      if (!expenses) {
         throw new Error('Expense not found');
      }

      const expenseItemIndex = expenses[0].extract.findIndex(i => i.id === expenseItemId);
      const expenseIndex = month.findIndex(i => i.title === expenseTitle);

      expenses[0].extract[expenseItemIndex].date.paidOut = new Date().toISOString();
      month[expenseIndex] = expenses[0];

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
         expenses: [
            ...month,
         ],
      }

      try {
         const { data: payExpenseRes } = await axios.post(
            this.baseURL as string,
            {
               query,
               variables
            },
            { headers: this.headers }
         )

         return payExpenseRes.data.updateMonth;

      } catch (error: any) {
         console.log(error.response.data)
      }
   }

   async addExpenseItem(data: AddExpenseItem['data']) {
      const month = await this.getMonthById('clyc8umdi153k07m0uglojucv');

      const expenses = month?.filter(month => month.title === data.title)

      if (!month) {
         throw new Error('Month not found');
      }

      if (!expenses) {
         throw new Error('Expense not found');
      }

      const extract = {
         id: data.name,
         name: data.name,
         value: data.value,
         date: {
            published: new Date().toISOString(),
         },
         link: data?.link,
         notes: data?.notes,
      }

      expenses[0].extract.push(extract)

      const expenseIndex = month.findIndex(i => i.title === data.title);
      month[expenseIndex] = expenses[0];

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
         id: 'clyc8umdi153k07m0uglojucv',
         expenses: [
            ...month,
         ],
      };

      try {
         const { data: updateExpense } = await axios.post(
            this.baseURL as string,
            {
               query,
               variables
            },
            { headers: this.headers }
         )

         return updateExpense.data.updateMonth;

      } catch (error: any) {
         console.log(error.response.data)
      }
   }

   async getUserById(id: string): Promise<UserApiResponse['getUser']['data']['subscriber'] | undefined> {
      return this.getUser(id);
   }
}
