'use client';

import { createContext, ReactNode, useEffect, useState } from 'react';

import { apolloClient } from '@/graphql/apollo-client';
import { ApolloProvider, gql, useLazyQuery } from '@apollo/client';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

const GET_USER_BY_EMAIL = gql`
   query getUserByEmail($email: String!) {
      user(data: { email: $email }) {
         id
         name
         email
         economy
         avatar {
            id
            url
         }
      }
   }
`;

interface LoggedInContextProps {
   getUser: () => void;
   user: User | null;
}

interface LoggedInProviderProps {
   children: ReactNode;
}

const LoggedInContext = createContext<LoggedInContextProps>({
   getUser: () => {},
   user: null,
});

function LoggedInProvider({ children }: LoggedInProviderProps) {
   const  [getUserQuery]  = useLazyQuery(GET_USER_BY_EMAIL);
   const router = useRouter();

   const [user, setUser] = useState(null);

   function getUser() {
      getUserQuery({
         variables: { email: '' },
         onError: (error) => {
            if (error.message === 'Unauthenticated') {
               router.push('/unauthenticated')
            }
         },
         onCompleted: (data) => {
            setUser(data.user);
         },
      })
   }

   useEffect(() => {
      if (!Cookies.get('isLoggedIn')) {
         router.push('/unauthenticated');
      }
   }, [])

   return (
      <ApolloProvider client={apolloClient}>
         <LoggedInContext.Provider value={{
            getUser,
            user,
         }}>
            {children}
         </LoggedInContext.Provider>
      </ApolloProvider>
   );
}

export { LoggedInContext, LoggedInProvider };
