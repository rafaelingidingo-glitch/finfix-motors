"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/components/admin/api-client";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [showSetupLink, setShowSetupLink] = useState(false);

  // Show the first-time setup link only when no admin account exists yet.
  useEffect(() => {
    let cancelled = false;
    apiFetch<{ hasAdmin: boolean }>("/api/admin/setup-status")
      .then((data) => {
        if (!cancelled && !data.hasAdmin) setShowSetupLink(true);
      })
      .catch(() => {
        // Ignore — link simply stays hidden.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;

    if (!email.trim()) {
      setError("Enter your email address.");
      return;
    }
    if (!password) {
      setError("Enter your password.");
      return;
    }

    setError(null);
    setPending(true);
    try {
      await apiFetch<{ ok: boolean }>("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      toast.success("Welcome back");
      router.replace(nextPath && nextPath.startsWith("/admin") ? nextPath : "/admin");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign in failed. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setPending(false);
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md border-white/10 bg-charcoal-soft text-white shadow-2xl">
      <CardHeader className="p-6 pb-0 text-center">
        <Image
          src="/images/elly-magari-logo.jpg"
          alt="Elly Magari logo"
          width={56}
          height={56}
          className="mx-auto size-14 rounded-lg object-cover"
        />
        <CardTitle className="font-display text-xl font-bold text-white">
          Elly Magari Admin
        </CardTitle>
        <CardDescription className="text-white/60">
          Sign in to manage your dealership
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="login-email" className="text-white/80">
              Email
            </Label>
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="you@ellymagari.co.tz"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 border-white/15 bg-white/5 text-white placeholder:text-white/30 focus-visible:border-gold"
              disabled={pending}
              aria-invalid={Boolean(error)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="login-password" className="text-white/80">
              Password
            </Label>
            <Input
              id="login-password"
              type="password"
              autoComplete="current-password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 border-white/15 bg-white/5 text-white placeholder:text-white/30 focus-visible:border-gold"
              disabled={pending}
              aria-invalid={Boolean(error)}
            />
          </div>

          {error ? (
            <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-red-300" role="alert">
              {error}
            </p>
          ) : null}

          <Button
            type="submit"
            disabled={pending}
            className="h-11 w-full bg-gold font-semibold text-charcoal hover:bg-gold/90 focus-visible:ring-gold"
          >
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Signing in…
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        {showSetupLink ? (
          <p className="mt-4 text-center text-sm text-white/50">
            First time?{" "}
            <Link
              href="/admin/setup"
              className="font-medium text-gold underline-offset-4 hover:underline"
            >
              Set up the admin account
            </Link>
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
