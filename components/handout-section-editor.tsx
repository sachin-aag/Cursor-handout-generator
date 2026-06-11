"use client";

import { ChevronDown, Plus, Trash2 } from "lucide-react";
import {
  INFO_BOX_COUNT,
  MAX_INFO_BOX_ITEMS,
  MAX_REDEEM_STEPS,
  MAX_RESOURCE_LINKS,
  TAGLINE_PRESETS,
  type HandoutConfig,
  type ResourceLink,
} from "@/lib/handout-types";
import { fieldClass, fileInputClass, inputClass } from "@/lib/form-styles";
import { cn } from "@/lib/utils";

interface HandoutSectionEditorProps {
  config: HandoutConfig;
  onChange: (config: HandoutConfig) => void;
  onReset?: () => void;
}

function Field({
  label,
  children,
  hint,
  className,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={fieldClass(className)}>
      <label className="text-xs font-medium text-cursor-text-muted">{label}</label>
      {children}
      {hint && <p className="text-xs text-cursor-text-faint">{hint}</p>}
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="border-b border-cursor-border pb-2 text-xs font-semibold uppercase tracking-wider text-cursor-text-muted">
      {children}
    </h3>
  );
}

function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details
      className="group rounded-md border border-cursor-border bg-cursor-card"
      open={defaultOpen}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-3 text-xs font-semibold uppercase tracking-wider text-cursor-text-muted transition-colors hover:text-cursor-text [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
      </summary>
      <div className="space-y-4 border-t border-cursor-border px-3 pb-3 pt-4">
        {children}
      </div>
    </details>
  );
}

export function HandoutSectionEditor({
  config,
  onChange,
  onReset,
}: HandoutSectionEditorProps) {
  const update = (partial: Partial<HandoutConfig>) =>
    onChange({ ...config, ...partial });

  const updateResource = (index: number, partial: Partial<ResourceLink>) => {
    const links = [...config.resourceLinks];
    links[index] = { ...links[index], ...partial };
    update({ resourceLinks: links });
  };

  const addResource = () => {
    if (config.resourceLinks.length >= MAX_RESOURCE_LINKS) return;
    update({
      resourceLinks: [
        ...config.resourceLinks,
        { label: "Resource", url: "https://" },
      ],
    });
  };

  const removeResource = (index: number) => {
    update({
      resourceLinks: config.resourceLinks.filter((_, i) => i !== index),
    });
  };

  const updateRedeemStep = (index: number, value: string) => {
    const steps = [...config.redeemSteps];
    steps[index] = value;
    update({ redeemSteps: steps });
  };

  const addRedeemStep = () => {
    if (config.redeemSteps.length >= MAX_REDEEM_STEPS) return;
    update({ redeemSteps: [...config.redeemSteps, ""] });
  };

  const removeRedeemStep = (index: number) => {
    if (config.redeemSteps.length <= 1) return;
    update({ redeemSteps: config.redeemSteps.filter((_, i) => i !== index) });
  };

  const updateInfoBoxTitle = (boxIndex: number, title: string) => {
    const boxes = config.infoBoxes.map((box, i) =>
      i === boxIndex ? { ...box, title } : box
    );
    update({ infoBoxes: boxes });
  };

  const updateInfoBoxItems = (boxIndex: number, text: string) => {
    const items = text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, MAX_INFO_BOX_ITEMS);
    const boxes = config.infoBoxes.map((box, i) =>
      i === boxIndex ? { ...box, items } : box
    );
    update({ infoBoxes: boxes });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => update({ cursorLogoDataUrl: reader.result as string });
    reader.readAsDataURL(file);
  };

  const handleSponsorLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => update({ sponsorLogoDataUrl: reader.result as string });
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6 pr-1">
      <section className="space-y-4">
        <SectionHeading>Header</SectionHeading>
        <Field label="Event name">
          <input
            className={inputClass}
            value={config.eventName}
            onChange={(e) => update({ eventName: e.target.value })}
            placeholder="Cursor Meetup Stuttgart"
          />
        </Field>
        <Field label="Location">
          <input
            className={inputClass}
            value={config.location}
            onChange={(e) => update({ location: e.target.value })}
            placeholder="Stuttgart, Germany"
          />
        </Field>
        <Field label="Date & time">
          <input
            className={inputClass}
            value={config.dateTime}
            onChange={(e) => update({ dateTime: e.target.value })}
            placeholder="Friday, May 22, 2026 · 3:00 PM – 9:00 PM"
          />
        </Field>
        <Field label="Date format">
          <div className="flex gap-2">
            {(["prose", "mono"] as const).map((fmt) => (
              <button
                key={fmt}
                type="button"
                onClick={() => update({ dateFormat: fmt })}
                className={cn(
                  "flex-1 rounded-md border px-3 py-2 text-xs font-medium transition-colors",
                  config.dateFormat === fmt
                    ? "border-cursor-orange/50 bg-cursor-orange/10 text-cursor-orange"
                    : "border-cursor-border-emphasis bg-cursor-surface text-cursor-text-muted hover:text-cursor-text"
                )}
              >
                {fmt === "prose" ? "Prose date" : "Mono YYYY.MM.DD · VENUE"}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Community name" hint="Optional text beside the Cursor logo">
          <input
            className={inputClass}
            value={config.communityName}
            onChange={(e) => update({ communityName: e.target.value })}
            placeholder="Stuttgart"
          />
        </Field>
      </section>

      <section className="space-y-4">
        <SectionHeading>Tagline & credit</SectionHeading>
        <Field label="Tagline preset">
          <select
            className={inputClass}
            value={
              TAGLINE_PRESETS.includes(
                config.tagline as (typeof TAGLINE_PRESETS)[number]
              )
                ? config.tagline
                : "__custom__"
            }
            onChange={(e) => {
              if (e.target.value !== "__custom__") {
                update({ tagline: e.target.value });
              }
            }}
          >
            {TAGLINE_PRESETS.map((t) => (
              <option key={t} value={t}>
                {t.length > 60 ? `${t.slice(0, 60)}…` : t}
              </option>
            ))}
            <option value="__custom__">Custom (edit below)</option>
          </select>
        </Field>
        <Field label="Tagline">
          <textarea
            className={cn(inputClass, "min-h-[60px] resize-y")}
            value={config.tagline}
            onChange={(e) => update({ tagline: e.target.value })}
          />
        </Field>
        <Field label="Credit amount">
          <input
            className={inputClass}
            value={config.creditAmount}
            onChange={(e) => update({ creditAmount: e.target.value })}
            placeholder="$20"
          />
        </Field>
      </section>

      <CollapsibleSection title="Redemption copy">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-cursor-text-muted">
              Steps (max {MAX_REDEEM_STEPS})
            </span>
            {config.redeemSteps.length < MAX_REDEEM_STEPS && (
              <button
                type="button"
                onClick={addRedeemStep}
                className="flex items-center gap-1 text-xs text-cursor-orange hover:underline"
              >
                <Plus className="h-3 w-3" /> Add step
              </button>
            )}
          </div>
          {config.redeemSteps.map((step, i) => (
            <div key={i} className="flex gap-2">
              <span className="mt-2.5 w-5 shrink-0 text-xs text-cursor-text-faint">
                {i + 1}.
              </span>
              <input
                className={inputClass}
                value={step}
                onChange={(e) => updateRedeemStep(i, e.target.value)}
                placeholder="Redemption step"
              />
              {config.redeemSteps.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRedeemStep(i)}
                  className="self-center rounded p-1.5 text-cursor-text-faint hover:text-red-400"
                  aria-label="Remove step"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        <Field
          label="Redemption note"
          hint="Use **text** for bold (e.g. **cursor.com**)"
        >
          <textarea
            className={cn(inputClass, "min-h-[48px] resize-y")}
            value={config.redeemNote}
            onChange={(e) => update({ redeemNote: e.target.value })}
          />
        </Field>
      </CollapsibleSection>

      <CollapsibleSection title="Info boxes">
        {Array.from({ length: INFO_BOX_COUNT }, (_, boxIndex) => {
          const box = config.infoBoxes[boxIndex];
          return (
            <div
              key={boxIndex}
              className="space-y-2 rounded-md border border-cursor-border bg-cursor-card p-3"
            >
              <Field label={`Box ${boxIndex + 1} title`}>
                <input
                  className={inputClass}
                  value={box.title}
                  onChange={(e) => updateInfoBoxTitle(boxIndex, e.target.value)}
                />
              </Field>
              <Field
                label="Bullets (one per line)"
                hint={`Max ${MAX_INFO_BOX_ITEMS} lines. Use **text** for bold.`}
              >
                <textarea
                  className={cn(inputClass, "min-h-[100px] resize-y font-mono text-xs")}
                  value={box.items.join("\n")}
                  onChange={(e) => updateInfoBoxItems(boxIndex, e.target.value)}
                />
              </Field>
            </div>
          );
        })}
      </CollapsibleSection>

      <CollapsibleSection title="Resource QR links">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-cursor-text-faint">
              Max {MAX_RESOURCE_LINKS} links
            </span>
            {config.resourceLinks.length < MAX_RESOURCE_LINKS && (
              <button
                type="button"
                onClick={addResource}
                className="flex items-center gap-1 text-xs text-cursor-orange hover:underline"
              >
                <Plus className="h-3 w-3" /> Add link
              </button>
            )}
          </div>
          {config.resourceLinks.map((link, i) => (
            <div
              key={i}
              className="flex gap-2 rounded-md border border-cursor-border bg-cursor-card p-3"
            >
              <div className="grid flex-1 gap-2 sm:grid-cols-[minmax(0,7rem)_1fr]">
                <input
                  className={inputClass}
                  value={link.label}
                  onChange={(e) => updateResource(i, { label: e.target.value })}
                  placeholder="Label"
                />
                <input
                  className={inputClass}
                  value={link.url}
                  onChange={(e) => updateResource(i, { url: e.target.value })}
                  placeholder="https://"
                />
              </div>
              <button
                type="button"
                onClick={() => removeResource(i)}
                className="self-start rounded p-1.5 text-cursor-text-faint hover:bg-cursor-surface hover:text-red-400"
                aria-label="Remove link"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Sponsor footer">
        <Field label="Sponsor name" hint="Leave blank to hide the footer">
          <input
            className={inputClass}
            value={config.sponsorName}
            onChange={(e) => update({ sponsorName: e.target.value })}
            placeholder="CREATORS"
          />
        </Field>
        <Field label="Sponsor URL">
          <input
            className={inputClass}
            value={config.sponsorUrl}
            onChange={(e) => update({ sponsorUrl: e.target.value })}
            placeholder="https://creators-ecosystem.de"
          />
        </Field>
        <Field label="Sponsor logo">
          <input
            type="file"
            accept="image/*"
            className={fileInputClass}
            onChange={handleSponsorLogoUpload}
          />
          {config.sponsorLogoDataUrl && (
            <button
              type="button"
              className="text-xs text-cursor-orange hover:underline"
              onClick={() => update({ sponsorLogoDataUrl: null })}
            >
              Remove sponsor logo
            </button>
          )}
        </Field>
      </CollapsibleSection>

      <CollapsibleSection title="Branding">
        <Field label="Cursor logo override">
          <input
            type="file"
            accept="image/*,.svg"
            className={fileInputClass}
            onChange={handleLogoUpload}
          />
          {config.cursorLogoDataUrl && (
            <button
              type="button"
              className="text-xs text-cursor-orange hover:underline"
              onClick={() => update({ cursorLogoDataUrl: null })}
            >
              Reset to default logo
            </button>
          )}
        </Field>
      </CollapsibleSection>

      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="text-xs text-cursor-text-faint hover:text-cursor-text-muted"
        >
          Reset all fields to defaults
        </button>
      )}
    </div>
  );
}
