"use client";

import { CheckIcon } from "@phosphor-icons/react";
import { useState, type CSSProperties } from "react";

/** A color chip that copies its CSS variable on click. Paints with the live variable, so it follows the theme. */
export function TokenSwatch({
  name,
  label,
  className = "",
  style,
  children,
}: {
  name: string;
  label?: string;
  className?: string;
  style?: CSSProperties;
  children?: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(`var(--${name})`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  }

  return (
    <button
      type="button"
      onClick={copy}
      title={`--${name} · click to copy`}
      aria-label={`Copy var(--${name})`}
      className={`relative block w-full text-left ${className}`}
      style={{ background: `var(--${name})`, ...style }}
    >
      {children}
      {label && <span className="sr-only">{label}</span>}
      {copied && (
        <span className="bg-foreground/70 text-background absolute inset-0 grid place-items-center">
          <CheckIcon weight="duotone" className="size-4" />
        </span>
      )}
    </button>
  );
}
