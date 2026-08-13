"use server";

import { createProject } from "@/lib/graphql/projects";

export async function createProjectAction(input: {
  name: string;
  slug: string;
}): Promise<{ error?: string }> {
  try {
    await createProject({
      name: input.name,
      slug: input.slug,
      environment: "dev",
    });
    return {};
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Failed to create project",
    };
  }
}
