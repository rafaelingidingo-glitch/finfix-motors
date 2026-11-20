import type { Metadata } from "next";
import { ShieldAlert } from "lucide-react";
import { getAdminSession } from "@/lib/auth/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SettingsForm } from "./settings-form";

export const metadata: Metadata = {
  title: "Settings",
};

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const session = await getAdminSession();

  if (!session || session.role !== "SUPERADMIN") {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-xl font-bold sm:text-2xl">Settings</h1>
        <Card className="p-6">
          <CardHeader className="p-0 pb-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="size-5 text-destructive" aria-hidden="true" />
              <CardTitle className="font-display text-lg font-bold">
                Insufficient permissions
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <p className="text-sm text-muted-foreground">
              Settings and services management requires a SUPERADMIN account.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <SettingsForm />;
}
