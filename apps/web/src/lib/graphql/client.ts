import { GraphQLClient } from "graphql-request";

const endpoint =
  process.env.NEXT_PUBLIC_GRAPHQL_URL ?? "http://localhost:8080/graphql";

/** Shared GraphQL client — points at the gateway when available. */
export function createGraphqlClient(token?: string) {
  return new GraphQLClient(endpoint, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
}

export const graphqlEndpoint = endpoint;
