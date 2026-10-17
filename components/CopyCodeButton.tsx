"use client";

import { useState } from "react";

export default function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard API unavailable (e.g. insecure context) -- fail quietly */
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="codm-code-copy-btn"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
