"use client";

import { useState } from "react";

type Props = {
  mosqueId: string;
  compact?: boolean;
};

export function VoteButtons({ mosqueId, compact = false }: Props) {
  const [message, setMessage] = useState("");

  const vote = async (voteType: "YES" | "NO") => {
    const res = await fetch(`/api/mosques/${mosqueId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ voteType }),
    });
    const data = await res.json();
    if (!res.ok && data.nextAllowedAt) {
      const mins = Math.max(1, Math.ceil((new Date(data.nextAllowedAt).getTime() - Date.now()) / 60000));
      setMessage(`আপনি কিছুক্ষণ আগে ভোট দিয়েছেন। ${mins} মিনিট পরে আবার চেষ্টা করুন।`);
      return;
    }
    if (!res.ok) {
      setMessage(data.error ?? "ভোট দেওয়া যায়নি");
      return;
    }
    setMessage("ভোট সাবমিট হয়েছে। ধন্যবাদ!");
    window.location.reload();
  };

  const buttonClass = compact
    ? "rounded-xl px-3 py-2 text-sm font-semibold text-white transition"
    : "rounded-xl px-4 py-2 text-white";

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <button className={`${buttonClass} bg-emerald-600 hover:bg-emerald-700`} onClick={() => vote("YES")}>হ্যাঁ</button>
        <button className={`${buttonClass} bg-rose-600 hover:bg-rose-700`} onClick={() => vote("NO")}>না</button>
      </div>
      {message && <p className="text-xs text-slate-600">{message}</p>}
    </div>
  );
}
