import { CreateProjectForm } from "@/components/projects/create-project-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fetchProjects } from "@/lib/graphql/projects";

export default async function OverviewPage() {
  let projects: Awaited<ReturnType<typeof fetchProjects>> = [];
  let loadError: string | null = null;

  try {
    projects = await fetchProjects();
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Failed to load projects";
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="text-sm text-muted-foreground">
          Projects from control-plane via the GraphQL gateway.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create project</CardTitle>
          <CardDescription>Stores a row in Postgres (`control.projects`).</CardDescription>
        </CardHeader>
        <CardContent>
          <CreateProjectForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Projects</CardTitle>
          <CardDescription>
            {loadError
              ? "Gateway unreachable — start Compose / local services."
              : `${projects.length} project(s)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadError ? (
            <p className="text-sm text-destructive">{loadError}</p>
          ) : projects.length === 0 ? (
            <p className="text-sm text-muted-foreground">No projects yet.</p>
          ) : (
            <ul className="divide-y rounded-lg border">
              {projects.map((p) => (
                <li
                  key={p.id}
                  className="flex flex-col gap-1 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.slug} · {p.environment}
                    </p>
                  </div>
                  <p className="font-mono text-xs text-muted-foreground">{p.id}</p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
