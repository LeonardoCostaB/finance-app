import { ApolloClient, InMemoryCache } from "@apollo/client";

export const apolloClient = new ApolloClient({
   uri: `${process.env.MAIN_URL as string}/api/graphql`,
   cache: new InMemoryCache(),
});
