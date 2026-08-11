import Link from "next/link";

import { MobileNav } from "@/components/layout/app-sidebar";
import { UserMenu } from "@/components/layout/user-menu";
import { Badge } from "@/components/ui/badge";
import { authConfigured } from "@/lib/auth";
import { graphqlEndpoint } from "@/lib/graphql/client";

export function AppHeader() {
  return (
    <header className="flex h-14 items-center justify-between gap-3 border-b px-4">
      <div className="flex items-center gap-2">
        <MobileNav />
        <Link href="/overview" className="font-semibold md:hidden">
          Hookforge
        </Link>
        {!authConfigured ? (
          <Badge variant="secondary" className="hidden sm:inline-flex">
            Auth bypass (local)
          </Badge>
        ) : null}
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden max-w-[220px] truncate text-xs text-muted-foreground lg:inline">
          GraphQL: {graphqlEndpoint}
        </span>
        <UserMenu />
      </div>
    </header>
  );
}
