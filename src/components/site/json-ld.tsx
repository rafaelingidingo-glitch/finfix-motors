"use client";

import { useEffect } from "react";

type JsonLdProps = {
  id: string;
  data: Record<string, unknown>;
};

/**
 * Injects schema.org JSON-LD structured data into <head> after hydration.
 *
 * Rendering inline <script> tags inside the RSC tree breaks React 19
 * hydration alignment in Next.js 16, so the script is created on the
 * client instead. Crawlers (incl. Googlebot) execute JavaScript, so the
 * structured data is still indexed.
 */
export function JsonLd({ id, data }: JsonLdProps) {
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = id;
    script.text = JSON.stringify(data);
    document.head.appendChild(script);
    return () => {
      document.getElementById(id)?.remove();
    };
  }, [id]);

  return null;
}
