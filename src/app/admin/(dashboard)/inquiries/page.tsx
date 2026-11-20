import type { Metadata } from "next";
import { InquiriesManager } from "./inquiries-manager";

export const metadata: Metadata = {
  title: "Inquiries",
};

export const dynamic = "force-dynamic";

export default function AdminInquiriesPage() {
  return <InquiriesManager />;
}
