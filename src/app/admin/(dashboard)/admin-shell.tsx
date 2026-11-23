"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Car,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { apiFetch, type AdminSessionInfo } from "@/components/admin/api-client";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  superOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/vehicles", label: "Vehicles", icon: Car },
  { href: "/admin/inquiries", label: "Inquiries", icon: Inbox },
  { href: "/admin/services", label: "Services", icon: Wrench, superOnly: true },
  { href: "/admin/settings", label: "Settings", icon: Settings, superOnly: true },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell({
  session,
  children,
}: {
  session: AdminSessionInfo;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const isSuper = session.role === "SUPERADMIN";
  const visibleItems = NAV_ITEMS.filter((item) => !item.superOnly || isSuper);

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await apiFetch<{ ok: boolean }>("/api/admin/logout", { method: "POST" });
    } catch {
      // Session is being cleared regardless; proceed to login.
    }
    router.replace("/admin/login");
  }

  const navList = (onNavigate?: () => void) => (
    <nav aria-label="Admin navigation" className="flex flex-1 flex-col gap-1 px-3 py-4">
      {visibleItems.map((item) => {
        const active = isActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-white/10 text-brand-soft"
                : "text-white/70 hover:bg-white/5 hover:text-white"
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const brandRow = (
    <div className="flex items-center gap-3 border-b border-white/10 px-4 py-4">
      <Image
        src="/images/finfix-logo.jpg"
        alt="Finfix Motors logo"
        width={40}
        height={40}
        className="size-10 rounded-lg object-cover"
      />
      <div className="leading-tight">
        <p className="font-display text-sm font-bold tracking-wide text-white">
          FINFIX MOTORS
        </p>
        <p className="text-[10px] uppercase tracking-widest text-brand-soft">Admin Panel</p>
      </div>
    </div>
  );

  const userBlock = (
    <div className="border-t border-white/10 p-4">
      <div className="mb-3 flex items-center gap-3">
        <div
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand/15 font-display text-sm font-bold text-brand-soft"
          aria-hidden="true"
        >
          {session.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">{session.name}</p>
          <Badge
            className={cn(
              "mt-0.5 border-transparent px-1.5 text-[10px] uppercase tracking-wider",
              isSuper ? "bg-brand text-white" : "bg-white/10 text-white/70"
            )}
          >
            {session.role}
          </Badge>
        </div>
      </div>
      <Button
        variant="ghost"
        onClick={handleLogout}
        disabled={loggingOut}
        aria-label="Log out"
        className="min-h-11 w-full justify-start gap-3 px-3 text-sm text-white/70 hover:bg-white/5 hover:text-white focus-visible:ring-brand-soft"
      >
        <LogOut className="size-4" aria-hidden="true" />
        {loggingOut ? "Logging out…" : "Log out"}
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside
        className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col bg-charcoal text-white/80 md:flex"
        aria-label="Admin sidebar"
      >
        {brandRow}
        {navList()}
        {userBlock}
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between bg-charcoal px-4 md:hidden">
        <div className="flex items-center gap-2.5">
          <Image
            src="/images/finfix-logo.jpg"
            alt="Finfix Motors logo"
            width={32}
            height={32}
            className="size-8 rounded-md object-cover"
          />
          <span className="font-display text-sm font-bold tracking-wide text-white">
            FINFIX MOTORS
          </span>
          <span className="text-[10px] uppercase tracking-widest text-brand-soft">Admin</span>
        </div>
        <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open navigation menu"
              className="min-h-11 min-w-11 text-white hover:bg-white/10 hover:text-white focus-visible:ring-brand-soft"
            >
              <Menu className="size-5" aria-hidden="true" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="flex w-64 flex-col gap-0 border-white/10 bg-charcoal p-0 text-white/80"
          >
            <SheetTitle className="sr-only">Admin navigation</SheetTitle>
            {brandRow}
            {navList(() => setMobileNavOpen(false))}
            {userBlock}
          </SheetContent>
        </Sheet>
      </header>

      {/* Page content */}
      <div className="pt-14 md:pl-60 md:pt-0">
        <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
