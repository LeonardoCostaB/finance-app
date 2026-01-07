import { ApolloClient, InMemoryCache, createHttpLink, from, fromPromise } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import axios from 'axios';
import { toast } from 'sonner';

const httpLink = createHttpLink({
   uri: '/api/graphql',
   credentials: 'include',
});

let isRefreshing = false;
let pendingRequests: (() => void)[] = [];

const resolvePendingRequests = () => {
   pendingRequests.forEach((cb) => cb());
   pendingRequests = [];
};

export const errorLink = onError(({ graphQLErrors, operation, forward }) => {
   if (graphQLErrors?.some((err) => err.message === 'Unauthenticated')) {
      if (!isRefreshing) {
         isRefreshing = true;

         return fromPromise(
            axios
               .post('/api/auth/refresh-token')
               .then(() => {
                  resolvePendingRequests();
               })
               .catch((error) => {
                  if (error instanceof axios.AxiosError) {
                     const message = error.response?.data?.message || 'Failed to refresh token';

                     switch (message) {
                        case 'Invalid or expired refresh token':
                           toast.error('Sua sessão expirou, por favor faça login novamente.');
                           // axios.post('/api/auth/logout');
                           break;

                        case 'Invalid session':
                           toast.error('Sessão inválida, por favor faça login novamente.');
                           // axios.post('/api/auth/logout');
                           break;

                        case 'Token verification failed':
                           toast.error('Erro ao verificar sessão, por favor faça login novamente.');
                           // axios.post('/api/auth/logout');
                           break;
                     }
                  }

                  pendingRequests = [];
               })
               .finally(() => {
                  isRefreshing = false;
               }),
         ).flatMap(() => forward(operation));
      }

      return fromPromise(
         new Promise<void>((resolve) => {
            pendingRequests.push(resolve);
         }),
      ).flatMap(() => forward(operation));
   }
});

export const apolloClient = new ApolloClient({
   link: from([errorLink, httpLink]),
   cache: new InMemoryCache(),
});
