import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authConfigured, signIn } from "@/lib/auth";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_oklch(0.95_0.02_250),_transparent_55%)] px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign in to Hookforge</CardTitle>
          <CardDescription>
            {authConfigured
              ? "Use GitHub to access the dashboard."
              : "GitHub OAuth is not configured. You can open the dashboard without auth for local scaffolding."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {authConfigured ? (
            <form
              action={async () => {
                "use server";
                await signIn("github", { redirectTo: "/overview" });
              }}
            >
              <Button type="submit" className="w-full">
                Continue with GitHub
              </Button>
            </form>
          ) : (
            <Button className="w-full" render={<Link href="/overview" />}>
              Continue to dashboard
            </Button>
          )}
          <Button variant="ghost" className="w-full" render={<Link href="/" />}>
            Back home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
