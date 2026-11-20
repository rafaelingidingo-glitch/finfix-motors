import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { SetupForm } from "./setup-form";

export const metadata: Metadata = {
  title: "Admin Setup",
};

export const dynamic = "force-dynamic";

export default async function AdminSetupPage() {
  // The setup page only works while zero admins exist.
  const adminCount = await db.adminUser.count();
  if (adminCount > 0) {
    redirect("/admin/login");
  }

  return <SetupForm />;
}
