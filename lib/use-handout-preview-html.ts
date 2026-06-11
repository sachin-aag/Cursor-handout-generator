"use client";

import { useEffect, useState } from "react";
import { generateSingleHandoutHTML } from "@/lib/generate-handouts";
import {
  PLACEHOLDER_CREDIT_URL,
  type HandoutConfig,
} from "@/lib/handout-types";
import { wrapHTML } from "@/lib/handout-template";

export function useHandoutPreviewHtml(
  config: HandoutConfig,
  creditUrl: string | null,
  defaultLogoSrc: string
) {
  const [srcdoc, setSrcdoc] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      setLoading(true);
      setError(null);
      try {
        const html = await generateSingleHandoutHTML(
          config,
          creditUrl ?? PLACEHOLDER_CREDIT_URL,
          0,
          defaultLogoSrc
        );
        if (cancelled) return;
        setSrcdoc(wrapHTML([html], "Preview", config));
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Preview failed");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    const timer = setTimeout(render, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [config, creditUrl, defaultLogoSrc]);

  return { srcdoc, loading, error };
}
