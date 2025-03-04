import { gql } from '@apollo/client';

export const refreshTopkenTypeDefs = gql`
   extend type Mutation {
      refreshToken(refreshTokenId: String): RefreshTokenResponse!
   }

   type RefreshTokenResponse {
      token: String!
   }
`;
