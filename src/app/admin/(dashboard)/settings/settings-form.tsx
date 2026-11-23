"use client";

import { useEffect, useState } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch, type SiteSettings } from "@/components/admin/api-client";

export function SettingsForm() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiFetch<{ settings: SiteSettings }>("/api/admin/settings");
        if (!cancelled) setSettings(data.settings);
      } catch (err) {
        if (!cancelled) {
          toast.error(
            err instanceof Error ? err.message : "Failed to load settings."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function update<K extends keyof SiteSettings>(key: K, value: string) {
    setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!settings || saving) return;

    setSaving(true);
    try {
      const data = await apiFetch<{ settings: SiteSettings }>("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      setSettings(data.settings);
      toast.success("Settings saved", {
        description: "Changes appear on the website immediately.",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not save settings.";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-5 w-44" />
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-2/3" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-xl font-bold sm:text-2xl">Settings</h1>
        <Card className="p-8 text-center text-muted-foreground">
          Settings could not be loaded. Please refresh the page and try again.
        </Card>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-xl font-bold sm:text-2xl">Settings</h1>
          <Button
            type="submit"
            disabled={saving}
            className="min-h-11 bg-charcoal text-white hover:bg-charcoal/90"
          >
            {saving ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Saving…
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>

        {/* Business Information */}
        <Card className="p-5 sm:p-6">
          <CardHeader className="p-0 pb-1">
            <CardTitle className="font-display text-base font-bold sm:text-lg">
              Business Information
            </CardTitle>
            <CardDescription>
              Contact details and branding used across the website.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <SettingsField
                id="set-businessName"
                label="Business name"
                value={settings.businessName}
                onChange={(v) => update("businessName", v)}
              />
              <SettingsField
                id="set-tagline"
                label="Tagline"
                value={settings.tagline}
                onChange={(v) => update("tagline", v)}
              />
              <SettingsField
                id="set-phone"
                label="Phone"
                type="tel"
                value={settings.phone}
                onChange={(v) => update("phone", v)}
                helper="Shown in the header and contact page."
              />
              <SettingsField
                id="set-whatsapp"
                label="WhatsApp number"
                type="tel"
                value={settings.whatsappNumber}
                onChange={(v) => update("whatsappNumber", v)}
                helper="International format, e.g. +255650090909 — used for all WhatsApp links."
              />
              <SettingsField
                id="set-email"
                label="Email"
                type="email"
                value={settings.email}
                onChange={(v) => update("email", v)}
              />
              <SettingsField
                id="set-instagram"
                label="Instagram URL"
                value={settings.instagram}
                onChange={(v) => update("instagram", v)}
                placeholder="https://www.instagram.com/…"
              />
              <SettingsField
                id="set-address"
                label="Address"
                value={settings.address}
                onChange={(v) => update("address", v)}
              />
              <SettingsField
                id="set-landmark"
                label="Landmark"
                value={settings.landmark}
                onChange={(v) => update("landmark", v)}
                helper="e.g. Near City Centre, along Main Road"
              />
            </div>
          </CardContent>
        </Card>

        {/* Homepage Hero */}
        <Card className="p-5 sm:p-6">
          <CardHeader className="p-0 pb-1">
            <CardTitle className="font-display text-base font-bold sm:text-lg">
              Homepage Hero
            </CardTitle>
            <CardDescription>The big headline visitors see first.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-4">
            <div className="grid gap-4">
              <SettingsField
                id="set-heroTitle"
                label="Hero title"
                value={settings.heroTitle}
                onChange={(v) => update("heroTitle", v)}
              />
              <SettingsField
                id="set-heroSubtitle"
                label="Hero subtitle"
                value={settings.heroSubtitle}
                onChange={(v) => update("heroSubtitle", v)}
              />
            </div>
          </CardContent>
        </Card>

        {/* About Page */}
        <Card className="p-5 sm:p-6">
          <CardHeader className="p-0 pb-1">
            <CardTitle className="font-display text-base font-bold sm:text-lg">
              About Page
            </CardTitle>
            <CardDescription>The story shown on the about page.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-4">
            <div className="grid gap-4">
              <SettingsField
                id="set-aboutTitle"
                label="About title"
                value={settings.aboutTitle}
                onChange={(v) => update("aboutTitle", v)}
              />
              <div className="space-y-1.5">
                <Label htmlFor="set-aboutText">About text</Label>
                <Textarea
                  id="set-aboutText"
                  rows={6}
                  value={settings.aboutText}
                  onChange={(e) => update("aboutText", e.target.value)}
                  placeholder="Tell customers about the dealership…"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Map */}
        <Card className="p-5 sm:p-6">
          <CardHeader className="p-0 pb-1">
            <CardTitle className="font-display text-base font-bold sm:text-lg">
              Map
            </CardTitle>
            <CardDescription>
              Used for the Google Maps embed on the contact page.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-4">
            <SettingsField
              id="set-mapQuery"
              label="Map location query"
              value={settings.mapQuery}
              onChange={(v) => update("mapQuery", v)}
              helper="e.g. Dar es Salaam, Tanzania"
            />
          </CardContent>
        </Card>

        {/* Sticky action bar */}
        <div className="sticky bottom-0 -mx-4 border-t border-border bg-background/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="flex items-center justify-end">
            <Button
              type="submit"
              disabled={saving}
              className="min-h-11 bg-charcoal text-white hover:bg-charcoal/90"
            >
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Saving…
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}

function SettingsField({
  id,
  label,
  value,
  onChange,
  type = "text",
  helper,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  helper?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11"
      />
      {helper ? <p className="text-xs text-muted-foreground">{helper}</p> : null}
    </div>
  );
}
