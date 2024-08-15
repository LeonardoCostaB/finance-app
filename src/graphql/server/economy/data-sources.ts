import axios from 'axios';
import { RESTDataSource } from 'apollo-datasource-rest';

export class EconomyApi extends RESTDataSource {
   private headers: { ['Content-Type']: string; Authorization: string };

   constructor() {
      super();
      this.baseURL = process.env.BASE_URL;
      this.headers = {
         'Content-Type': 'application/json',
         Authorization: process.env.AUTH_TOKEN as string,
      };
   }

   private verifyUserAuthenticity(currentUserId: string, userSessionToken: string) {
      if (currentUserId !== userSessionToken) {
         throw new Error('Você não tem permissão para acessar esse item');
      }
   }

   private async publishEconomy(id: string) {
      const query = `
         mutation PUBLISH_ECONOMY($id: ID!) {
            publishEconomy(where: {id: $id}, to: PUBLISHED) {
               id
            }
         }
      `;

      const variables = { id };

      try {
         await axios.post(this.baseURL as string, { query, variables }, { headers: this.headers });
      } catch (error) {
         console.log(error);
      }
   }

   private async createEconomy(
      userId: string,
      data: {
         userId: string;
         economyId: string;
         extract: Array<{
            date: string;
            value: number;
         }>;
      },
   ) {
      const query = `
         mutation CREATE_ECONOMY($extract: Json!, $userCustomId: String!, $userId: ID!) {
            createEconomy(
               data: { extract: $extract, userId: $userCustomId, clyt1f50z01mj07kg9wfxfw5c: { connect: {id: $userId }}}
            ) {
               id
               extract
            }
            publishSubscriber(where: {id: $userId}, to: PUBLISHED) {
               id
            }
         }
      `;

      const variables = {
         userId,
         userCustomId: data.userId,
         extract: data.extract,
      };

      this.verifyUserAuthenticity(userId, data.userId);

      try {
         const { data: cms } = await axios.post(
            this.baseURL as string,
            { query, variables },
            { headers: this.headers },
         );

         console.log(cms);

         await this.publishEconomy(cms.data.createEconomy.id);

         return cms.data.createEconomy;
      } catch (error: any) {
         console.log(error.response.data.errors);

         throw new Error('Tivermos um erro inesperado, tente novamente mais tarde');
      }
   }

   private async updateEconomy(
      userId: string,
      data: {
         userId: string;
         economyId: string;
         extract: Array<{
            date: string;
            value: number;
         }>;
      },
   ) {
      const query = `
         mutation UPDATE_ECONOMY($extract: Json!, $economyId: ID!, $userId: ID!) {
            updateEconomy(
               data: {
                  extract: $extract,
                  clyt1f50z01mj07kg9wfxfw5c: {
                     connect: {
                        where: { id: $userId }
                     }
                  }
               }
               where: {id: $economyId}
            ) {
               id
               extract
            }
            publishEconomy(where: {id: $economyId}, to: PUBLISHED) {
               id
            }
            publishSubscriber(where: {id: $userId}, to: PUBLISHED) {
               id
            }
         }
      `;

      const variables = {
         userId,
         economyId: data.economyId,
         extract: data.extract,
      };

      this.verifyUserAuthenticity(userId, data.userId);

      try {
         const { data: cms } = await axios.post(
            this.baseURL as string,
            { query, variables },
            { headers: this.headers },
         );

         return cms.data.updateEconomy;
      } catch (error: any) {
         console.log(error.response.data.errors);

         throw new Error('Tivermos um erro inesperado, tente novamente mais tarde');
      }
   }

   async saveEconomy(
      userId: string,
      data: {
         userId: string;
         economyId: string;
         extract: Array<{
            date: string;
            value: number;
         }>;
      },
   ) {
      if (data.economyId) {
         return await this.updateEconomy(userId, data);
      }

      return await this.createEconomy(userId, data);
   }
}
