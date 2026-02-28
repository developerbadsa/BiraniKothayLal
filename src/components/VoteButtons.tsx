"use client";

import { useState } from "react";

export function VoteButtons({ mosqueId }: { mosqueId: string }) {
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
      setMessage(`You voted recently. Try again in ${mins} min`);
      return;
    }
    if (!res.ok) {
      setMessage(data.error ?? "Vote failed");
      return;
    }
    setMessage("Vote submitted.");
    window.location.reload();
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <button className="rounded-xl bg-emerald-600 px-4 py-2 text-white" onClick={() => vote("YES")}>YES</button>
        <button className="rounded-xl bg-rose-600 px-4 py-2 text-white" onClick={() => vote("NO")}>NO</button>
      </div>
      {message && <p className="text-sm text-slate-600">{message}</p>}
    </div>
  );
}
