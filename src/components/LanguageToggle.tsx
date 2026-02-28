"use client";

import { useTransition } from "react";

export function LanguageToggle({ current }: { current: "en" | "bn" }) {
  const [pending, start] = useTransition();

  const setLang = (lang: "en" | "bn") => {
    start(async () => {
      await fetch("/api/set-lang", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lang }),
      });
      window.location.reload();
    });
  };

  return (
    <div className="flex items-center gap-2">
      <button
        aria-label="English"
        onClick={() => setLang("en")}
        disabled={pending}
        className={`rounded-xl border px-3 py-1 text-sm ${current === "en" ? "bg-slate-900 text-white" : "bg-white"}`}
      >
        EN
      </button>
      <button
        aria-label="Bangla"
        onClick={() => setLang("bn")}
        disabled={pending}
        className={`rounded-xl border px-3 py-1 text-sm ${current === "bn" ? "bg-slate-900 text-white" : "bg-white"}`}
      >
        বাংলা
      </button>
    </div>
  );
}
