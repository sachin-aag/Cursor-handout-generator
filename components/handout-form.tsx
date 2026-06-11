"use client";

import { type HandoutConfig } from "@/lib/handout-types";
import { fieldClass } from "@/lib/form-styles";
import { cn } from "@/lib/utils";

interface HandoutFormProps {
  config: HandoutConfig;
  onChange: (config: HandoutConfig) => void;
}

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className={fieldClass()}>
      <label className="text-xs font-medium text-cursor-text-muted">{label}</label>
      {children}
      {hint && <p className="text-xs text-cursor-text-faint">{hint}</p>}
    </div>
  );
}

function ModeToggle({
  value,
  onChange,
}: {
  value: "color" | "bw";
  onChange: (mode: "color" | "bw") => void;
}) {
  return (
    <div className="flex gap-2">
      {(
        [
          { id: "color" as const, label: "Color" },
          { id: "bw" as const, label: "Black & white" },
        ] as const
      ).map(({ id, label }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={cn(
            "rounded-md border px-3 py-2 text-xs font-medium transition-colors",
            value === id
              ? "border-cursor-orange/50 bg-cursor-orange/10 text-cursor-orange"
              : "border-cursor-border-emphasis bg-cursor-surface text-cursor-text-muted hover:text-cursor-text"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function HandoutForm({ config, onChange }: HandoutFormProps) {
  const update = (partial: Partial<HandoutConfig>) =>
    onChange({ ...config, ...partial });

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-medium uppercase tracking-wider text-cursor-text-muted">
        2. Print settings
      </h2>

      <Field
        label="Print style"
        hint="Color uses orange accents; B&W is cheaper to print"
      >
        <ModeToggle
          value={config.printMode}
          onChange={(printMode) => update({ printMode })}
        />
      </Field>

      <p className="text-xs text-cursor-text-faint">
        Edit event details, copy, links, sponsor, and branding below.
      </p>
    </div>
  );
}
