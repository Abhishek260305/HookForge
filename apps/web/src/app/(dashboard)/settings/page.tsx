import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { graphqlEndpoint } from "@/lib/graphql/client";
import { authConfigured } from "@/lib/auth";

export default function SettingsPage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Project keys, environments, and integration endpoints.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Environment</CardTitle>
          <CardDescription>Scaffold configuration for local development.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between gap-4 border-b py-2">
            <span className="text-muted-foreground">Auth.js GitHub</span>
            <span>{authConfigured ? "Configured" : "Not configured"}</span>
          </div>
          <div className="flex items-center justify-between gap-4 py-2">
            <span className="text-muted-foreground">GraphQL URL</span>
            <span className="truncate font-mono text-xs">{graphqlEndpoint}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
