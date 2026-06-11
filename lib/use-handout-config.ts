"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  DEFAULT_HANDOUT_CONFIG,
  HANDOUT_CONFIG_STORAGE_KEY,
  normalizeHandoutConfig,
  type HandoutConfig,
} from "./handout-types";

function loadStoredConfig(): HandoutConfig {
  if (typeof window === "undefined") return DEFAULT_HANDOUT_CONFIG;
  try {
    const raw = localStorage.getItem(HANDOUT_CONFIG_STORAGE_KEY);
    if (!raw) return DEFAULT_HANDOUT_CONFIG;
    return normalizeHandoutConfig(JSON.parse(raw) as Partial<HandoutConfig>);
  } catch {
    return DEFAULT_HANDOUT_CONFIG;
  }
}

function stripLargeFields(config: HandoutConfig): HandoutConfig {
  return {
    ...config,
    cursorLogoDataUrl: null,
    sponsorLogoDataUrl: null,
  };
}

function persistConfig(config: HandoutConfig) {
  try {
    localStorage.setItem(HANDOUT_CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch {
    try {
      localStorage.setItem(
        HANDOUT_CONFIG_STORAGE_KEY,
        JSON.stringify(stripLargeFields(config))
      );
    } catch {
      // Quota exceeded — skip persistence
    }
  }
}

export function useHandoutConfig() {
  const [config, setConfigState] = useState<HandoutConfig>(DEFAULT_HANDOUT_CONFIG);
  const [hydrated, setHydrated] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setConfigState(loadStoredConfig());
    setHydrated(true);
  }, []);

  const setConfig = useCallback((next: HandoutConfig | ((prev: HandoutConfig) => HandoutConfig)) => {
    setConfigState((prev) => {
      const resolved = typeof next === "function" ? next(prev) : next;
      return normalizeHandoutConfig(resolved);
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      persistConfig(config);
    }, 400);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [config, hydrated]);

  const resetConfig = useCallback(() => {
    setConfigState(DEFAULT_HANDOUT_CONFIG);
    try {
      localStorage.removeItem(HANDOUT_CONFIG_STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return { config, setConfig, resetConfig, hydrated };
}
