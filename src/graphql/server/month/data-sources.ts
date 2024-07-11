import axios from "axios";
import { RESTDataSource } from "apollo-datasource-rest";
import { AddExpenseItem } from "./resolvers";
import { normalizeId } from "@/utils/normalize-id";

export class MonthApi extends RESTDataSource {
   private headers: { ['Content-Type']: string; Authorization: string }
   private userId: string;

   constructor(isLoggedIn: string) {
      super();
      this.baseURL = process.env.BASE_URL;
      this.userId = isLoggedIn;
      this.headers = {
         'Content-Type': 'application/json',
         'Authorization': process.env.AUTH_TOKEN as string,
      }
   }

   private verifyUserAuthenticity(currentUserId: string, dbUserId: string) {
      if (currentUserId !== dbUserId) {
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
         const { data } = await axios.post<{data: { month: Months }}>(
            this.baseURL as string,
            {
               query,
               variables
            },
            { headers: this.headers }
         )

         return data.data.month;

      } catch (error) {
         console.log(error);
      }
   }

   async createEarningOrExpense({ monthId, title, type }: { monthId: string, title: string, type: 'earnings' | 'expenses' }) {
      const month = await this.getMonthById(monthId);

      if (!month) {
         throw new Error('Month not found');
      }

      this.verifyUserAuthenticity(this.userId, month.user?.id)

      let query = '';
      let variables: any = {};

      if (type === 'expenses') {
         const expenses = month?.expenses?.filter(expense => expense.title.toLowerCase() === title.toLowerCase());

         if (expenses && expenses.length > 0) throw new Error('Você já tem uma despesa cadastrado com esse título');

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
         `

         variables = {
            monthId,
            expenses: [
               ...month.expenses,
               {
                  title,
                  extract: [],
               }
            ],
         }
      } else {
         const earnings = month?.earnings?.filter(earning => earning.title.toLowerCase() === title.toLowerCase());

         if (earnings && earnings?.length > 0) throw new Error('Você já tem um ganho cadastrado com esse título');

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
         `

         variables = {
            monthId,
            earnings: [
               ...month.earnings,
               {
                  title,
                  extract: [],
               }
            ],
         }
      }

      try {
         const { data: createEarnings } = await axios.post(
            this.baseURL as string,
            { query, variables },
            { headers: this.headers }
         )

         return createEarnings.data.updateMonth;

      } catch (error) {
         console.log(error)
      }
   }

   async createEarningItem({ monthId, data }: { monthId: string, data: AddExpenseItem['data'] }) {
      const month = await this.getMonthById(monthId);

      if (!month) {
         throw new Error('Month not found');
      }

      this.verifyUserAuthenticity(this.userId, month.user?.id)

      const earnings = month.earnings?.filter(earning => earning.title === data.title);

      if (!earnings) {
         throw new Error('Earning not found');
      }

      const earningItemExist = earnings
         .map(earning => earning.extract)
         .reduce((acc, item) => acc.concat(item), [])
         .some(extract => extract.id === normalizeId(data.name));

      if (earningItemExist) throw new Error('Você já tem um item cadastrado com esse nome');

      const extract = {
         id: normalizeId(data.name),
         name: data.name,
         value: data.value,
         date: {
            published: new Date().toISOString(),
         },
         link: data?.link,
         notes: data?.notes,
      }

      earnings[0].extract.push(extract)

      const expenseIndex = month.expenses.findIndex(i => i.title === data.title);
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
      `

      const variables = {
         monthId,
         earnings: [
            ...month.earnings,
         ],
      }

      try {
         const { data: createEarningItem } = await axios.post(
            this.baseURL as string,
            { query, variables },
            { headers: this.headers }
         )

         return createEarningItem.data.updateMonth;

      } catch(error) {
         console.log(error)
      }
   }

   async deleteEarningItem({ monthId, earningTitle, earningItemId }: { monthId: string, earningTitle: string, earningItemId: string }) {
      const month = await this.getMonthById(monthId);

      if (!month) {
         throw new Error('Month not found');
      }

      this.verifyUserAuthenticity(this.userId, month.user?.id)

      const earnings = month.earnings?.filter(month => month.title === earningTitle);

      if (!earnings) {
         throw new Error('Expense not found');
      }

      const earningIndex = month.earnings.findIndex(i => i.title === earningTitle);
      const removeEarningItem = earnings[0].extract.filter(extract => extract.id !== earningItemId);3

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
         earnings: [
            ...month.earnings,
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

   async deleteExpenseItem({ monthId, expenseTitle, expenseItemId }: { monthId: string, expenseTitle: string, expenseItemId: string }) {
      const month = await this.getMonthById(monthId);
      const expenses = month?.expenses?.filter(month => month.title === expenseTitle);

      if (!month) {
         throw new Error('Month not found');
      }

      this.verifyUserAuthenticity(this.userId, month.user?.id)

      if (!expenses) {
         throw new Error('Expense not found');
      }

      const expenseIndex = month.expenses.findIndex(i => i.title === expenseTitle);
      const removeExpenseItem = expenses[0].extract.filter(extract => extract.id !== expenseItemId);

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
         expenses: [
            ...month.expenses,
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
      const expenses = month?.expenses?.filter(month => month.title === expenseTitle)

      if (!month) {
         throw new Error('Month not found');
      }

      this.verifyUserAuthenticity(this.userId, month.user?.id)

      if (!expenses) {
         throw new Error('Expense not found');
      }

      const expenseItemIndex = expenses[0].extract.findIndex(i => i.id === expenseItemId);
      const expenseIndex = month.expenses.findIndex(i => i.title === expenseTitle);

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
         expenses: [
            ...month.expenses,
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

   async addExpenseItem({ monthId, data }: { monthId: string, data: AddExpenseItem['data'] }) {
      const month = await this.getMonthById(monthId);

      const expenses = month?.expenses?.filter(month => month.title === data.title)

      if (!month) {
         throw new Error('Month not found');
      }

      this.verifyUserAuthenticity(this.userId, month.user?.id)

      if (!expenses) {
         throw new Error('Expense not found');
      }

      const expenseItemExist = expenses
      .map(expense => expense.extract)
      .reduce((acc, item) => acc.concat(item), [])
      .some(extract => extract.id === normalizeId(data.name));

      if (expenseItemExist) throw new Error('Você já tem um item cadastrado com esse nome ');

      const extract = {
         id: normalizeId(data.name),
         name: data.name,
         value: data.value,
         date: {
            published: new Date().toISOString(),
         },
         link: data?.link,
         notes: data?.notes,
      }

      expenses[0].extract.push(extract)

      const expenseIndex = month.expenses.findIndex(i => i.title === data.title);
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
         expenses: [
            ...month.expenses,
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
}
