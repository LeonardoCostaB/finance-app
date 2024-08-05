'use client';

import { createContext, ReactNode } from 'react';

import { apolloClient } from '@/graphql/client/apollo';
import { ApolloProvider } from '@apollo/client';

interface AppContextProps {}

interface AppProviderProps {
   children: ReactNode;
}

const AppContext = createContext<AppContextProps>({});

function AppProvider({ children }: AppProviderProps) {
   return (
      <ApolloProvider client={apolloClient}>
         <AppContext.Provider value={{}}>
            {children}
         </AppContext.Provider>
      </ApolloProvider>
   );
}

export { AppContext, AppProvider };
