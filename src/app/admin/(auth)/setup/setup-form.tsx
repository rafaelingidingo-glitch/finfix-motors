"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { ApiError, apiFetch } from "@/components/admin/api-client";

interface SetupResponse {
  ok: boolean;
  admin: { id: string; name: string; email: string; role: string };
}

export function SetupForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);

  function validate(): boolean {
    const errors: Record<string, string> = {};
    if (name.trim().length < 2) errors.name = "Full name is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = "Enter a valid email address.";
    }
    if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      errors.password = "Minimum 8 characters, include a letter and a number.";
    }
    if (confirmPassword !== password) {
      errors.confirmPassword = "Passwords do not match.";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    setError(null);

    if (!validate()) return;

    setPending(true);
    try {
      await apiFetch<SetupResponse>("/api/admin/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      });
      toast.success("Admin account created");
      router.replace("/admin");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        // An admin already exists — send to login.
        router.replace("/admin/login");
        return;
      }
      const message = err instanceof Error ? err.message : "Setup failed. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setPending(false);
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md border-white/10 bg-charcoal-soft text-white shadow-2xl">
      <CardHeader className="p-6 pb-0 text-center">
        <CardTitle className="font-display text-xl font-bold text-white">
          Admin Setup
        </CardTitle>
        <CardDescription className="text-white/60">
          Create the first administrator account
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <Alert className="mb-5 border-gold/30 bg-gold/10 text-white/80">
          <AlertTitle className="font-display text-sm font-semibold text-gold">
            One-time setup
          </AlertTitle>
          <AlertDescription className="text-white/60">
            This page creates the FIRST super-admin account and is disabled
            permanently afterwards.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="setup-name" className="text-white/80">
              Full name
            </Label>
            <Input
              id="setup-name"
              type="text"
              autoComplete="name"
              placeholder="e.g. Elly Magari"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11 border-white/15 bg-white/5 text-white placeholder:text-white/30 focus-visible:border-gold"
              disabled={pending}
              aria-invalid={Boolean(fieldErrors.name)}
            />
            {fieldErrors.name ? (
              <p className="text-xs text-red-300">{fieldErrors.name}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="setup-email" className="text-white/80">
              Email
            </Label>
            <Input
              id="setup-email"
              type="email"
              autoComplete="email"
              placeholder="you@ellymagari.co.tz"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 border-white/15 bg-white/5 text-white placeholder:text-white/30 focus-visible:border-gold"
              disabled={pending}
              aria-invalid={Boolean(fieldErrors.email)}
            />
            {fieldErrors.email ? (
              <p className="text-xs text-red-300">{fieldErrors.email}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="setup-password" className="text-white/80">
              Password
            </Label>
            <Input
              id="setup-password"
              type="password"
              autoComplete="new-password"
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 border-white/15 bg-white/5 text-white placeholder:text-white/30 focus-visible:border-gold"
              disabled={pending}
              aria-invalid={Boolean(fieldErrors.password)}
            />
            <p className="text-xs text-white/40">
              Minimum 8 characters, include a letter and a number.
            </p>
            {fieldErrors.password ? (
              <p className="text-xs text-red-300">{fieldErrors.password}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="setup-confirm" className="text-white/80">
              Confirm password
            </Label>
            <Input
              id="setup-confirm"
              type="password"
              autoComplete="new-password"
              placeholder="Repeat the password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-11 border-white/15 bg-white/5 text-white placeholder:text-white/30 focus-visible:border-gold"
              disabled={pending}
              aria-invalid={Boolean(fieldErrors.confirmPassword)}
            />
            {fieldErrors.confirmPassword ? (
              <p className="text-xs text-red-300">{fieldErrors.confirmPassword}</p>
            ) : null}
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
                Creating account…
              </>
            ) : (
              "Create Admin Account"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
