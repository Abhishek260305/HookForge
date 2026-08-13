import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authConfigured } from "@/lib/auth";
import { graphqlEndpoint } from "@/lib/graphql/client";
import { fetchProjects } from "@/lib/graphql/projects";

export default async function SettingsPage() {
  let projectCount = 0;
  let gatewayOk = false;
  try {
    const projects = await fetchProjects();
    projectCount = projects.length;
    gatewayOk = true;
  } catch {
    gatewayOk = false;
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Local scaffold configuration and gateway connectivity.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Environment</CardTitle>
          <CardDescription>Runtime wiring for the UI.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between gap-4 border-b py-2">
            <span className="text-muted-foreground">Auth.js GitHub</span>
            <span>{authConfigured ? "Configured" : "Not configured"}</span>
          </div>
          <div className="flex items-center justify-between gap-4 border-b py-2">
            <span className="text-muted-foreground">GraphQL URL</span>
            <span className="truncate font-mono text-xs">{graphqlEndpoint}</span>
          </div>
          <div className="flex items-center justify-between gap-4 border-b py-2">
            <span className="text-muted-foreground">Gateway</span>
            <span>{gatewayOk ? "Reachable" : "Unreachable"}</span>
          </div>
          <div className="flex items-center justify-between gap-4 py-2">
            <span className="text-muted-foreground">Projects</span>
            <span>{projectCount}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
