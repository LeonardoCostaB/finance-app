import { RESTDataSource } from 'apollo-datasource-rest';
import axios from 'axios';
import { GraphQLError } from 'graphql';

export class RefreshTokenApi extends RESTDataSource {
   private headers: { ['Content-Type']: string; Authorization: string };

   constructor(private userId: string) {
      super();
      this.baseURL = process.env.BASE_URL;
      this.headers = {
         'Content-Type': 'application/json',
         Authorization: process.env.AUTH_TOKEN as string,
      };
   }

   async refreshToken(refreshTokenId: string, sessionToken: string) {
      const query = `
         mutation UPDATE_REFRESH_TOKEN(
            $refreshTokenId:ID!,
            $expiresIn: Int!,
            $updateSubsciber: SubscriberUpdateOneInlineInput
         ) {
            updateRefreshToken(
               where: {
                  id: $refreshTokenId
               },
               data: {
                  expiresIn: $expiresIn,
                  subscriber: $updateSubsciber
               }
            ) {
               id
               userId,
            }

            publishRefreshToken(where: { id: $refreshTokenId }) {
               id
            }
         }
      `;

      const variables = {
         refreshTokenId,
         expiresIn: Date.now() + 1000 * 60 * 60 * 24 * 7,
         updateSubsciber: {
            update: {
               where: {
                  id: this.userId,
               },
               data: {
                  sessionToken,
               },
            },
         },
      };

      try {
         const { data: cms } = await axios.post<{
            data: { updateRefreshToken: RefreshToken };
         }>(this.baseURL as string, { query, variables }, { headers: this.headers });

         return cms.data.updateRefreshToken;
      } catch (e: any) {
         console.log(e.response.data.errors);
         throw new GraphQLError('Token de refresh inválido');
      }
   }
}
