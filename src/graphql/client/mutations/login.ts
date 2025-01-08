import gql from 'graphql-tag';

export const LOGOUT = gql`
   mutation Logout($userId: String) {
      logout(userId: $userId)
   }
`;
