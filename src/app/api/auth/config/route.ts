import { NextResponse } from "next/server";

import { logAuthConfigurationIssues } from "@/lib/supabase/config-server";

export const dynamic = "force-dynamic";

export function GET() {
  const status = logAuthConfigurationIssues("healthcheck");
  return NextResponse.json(
    {
      authenticationConfigured: status.publicAuthConfigured,
      accountPersistenceConfigured: status.serviceRoleConfigured,
      siteUrlConfigured: status.siteUrlConfigured,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
