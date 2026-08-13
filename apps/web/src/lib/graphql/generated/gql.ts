/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "query Health {\n  health\n}\n\nquery Projects {\n  projects {\n    id\n    name\n    slug\n    environment\n    createdAt\n    updatedAt\n  }\n}\n\nmutation CreateProject($input: CreateProjectInput!) {\n  createProject(input: $input) {\n    id\n    name\n    slug\n    environment\n    createdAt\n    updatedAt\n  }\n}": typeof types.HealthDocument,
    "\n  query Projects {\n    projects {\n      id\n      name\n      slug\n      environment\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.ProjectsDocument,
    "\n  mutation CreateProject($input: CreateProjectInput!) {\n    createProject(input: $input) {\n      id\n      name\n      slug\n      environment\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.CreateProjectDocument,
};
const documents: Documents = {
    "query Health {\n  health\n}\n\nquery Projects {\n  projects {\n    id\n    name\n    slug\n    environment\n    createdAt\n    updatedAt\n  }\n}\n\nmutation CreateProject($input: CreateProjectInput!) {\n  createProject(input: $input) {\n    id\n    name\n    slug\n    environment\n    createdAt\n    updatedAt\n  }\n}": types.HealthDocument,
    "\n  query Projects {\n    projects {\n      id\n      name\n      slug\n      environment\n      createdAt\n      updatedAt\n    }\n  }\n": types.ProjectsDocument,
    "\n  mutation CreateProject($input: CreateProjectInput!) {\n    createProject(input: $input) {\n      id\n      name\n      slug\n      environment\n      createdAt\n      updatedAt\n    }\n  }\n": types.CreateProjectDocument,
};

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = gql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function gql(source: string): unknown;

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "query Health {\n  health\n}\n\nquery Projects {\n  projects {\n    id\n    name\n    slug\n    environment\n    createdAt\n    updatedAt\n  }\n}\n\nmutation CreateProject($input: CreateProjectInput!) {\n  createProject(input: $input) {\n    id\n    name\n    slug\n    environment\n    createdAt\n    updatedAt\n  }\n}"): (typeof documents)["query Health {\n  health\n}\n\nquery Projects {\n  projects {\n    id\n    name\n    slug\n    environment\n    createdAt\n    updatedAt\n  }\n}\n\nmutation CreateProject($input: CreateProjectInput!) {\n  createProject(input: $input) {\n    id\n    name\n    slug\n    environment\n    createdAt\n    updatedAt\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query Projects {\n    projects {\n      id\n      name\n      slug\n      environment\n      createdAt\n      updatedAt\n    }\n  }\n"): (typeof documents)["\n  query Projects {\n    projects {\n      id\n      name\n      slug\n      environment\n      createdAt\n      updatedAt\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation CreateProject($input: CreateProjectInput!) {\n    createProject(input: $input) {\n      id\n      name\n      slug\n      environment\n      createdAt\n      updatedAt\n    }\n  }\n"): (typeof documents)["\n  mutation CreateProject($input: CreateProjectInput!) {\n    createProject(input: $input) {\n      id\n      name\n      slug\n      environment\n      createdAt\n      updatedAt\n    }\n  }\n"];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;