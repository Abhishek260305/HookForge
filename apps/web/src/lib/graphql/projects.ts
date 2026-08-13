import "server-only";

import { createGraphqlClient } from "@/lib/graphql/client";

export type Project = {
  id: string;
  name: string;
  slug: string;
  environment: string;
  createdAt: string;
  updatedAt: string;
};

const PROJECTS_QUERY = /* GraphQL */ `
  query Projects {
    projects {
      id
      name
      slug
      environment
      createdAt
      updatedAt
    }
  }
`;

const CREATE_PROJECT_MUTATION = /* GraphQL */ `
  mutation CreateProject($input: CreateProjectInput!) {
    createProject(input: $input) {
      id
      name
      slug
      environment
      createdAt
      updatedAt
    }
  }
`;

export async function fetchProjects(): Promise<Project[]> {
  const client = createGraphqlClient();
  const data = await client.request<{ projects: Project[] }>(PROJECTS_QUERY);
  return data.projects;
}

export async function createProject(input: {
  name: string;
  slug: string;
  environment?: string;
}): Promise<Project> {
  const client = createGraphqlClient();
  const data = await client.request<{ createProject: Project }>(
    CREATE_PROJECT_MUTATION,
    {
      input: {
        name: input.name,
        slug: input.slug,
        environment: input.environment ?? "dev",
      },
    },
  );
  return data.createProject;
}
