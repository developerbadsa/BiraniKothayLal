"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { MosqueCard } from "@/components/MosqueCard";
import { areas } from "@/i18n/dict";
import type { HomeDictionary, MosqueItem, TrendingRow } from "@/types/mosque";

const DynamicMap = dynamic(() => import("@/components/MapView").then((m) => m.MapView), { ssr: false });

type Props = {
  mosques: MosqueItem[];
  trending: {
    topYes: TrendingRow[];
    topNo: TrendingRow[];
    mostActive: TrendingRow[];
  };
  t: HomeDictionary;
};

export function HomeTabs({ mosques, trending, t }: Props) {
  const [tab, setTab] = useState<"list" | "map" | "trending">("map");
  const [query, setQuery] = useState("");
  const [area, setArea] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return mosques.filter((m) => {
      const areaOk = area ? m.area === area : true;
      const text = `${m.name} ${m.address ?? ""} ${m.area}`.toLowerCase();
      return areaOk && (!q || text.includes(q));
    });
  }, [mosques, query, area]);

  const tabs = [
    { key: "list", label: t.list },
    { key: "map", label: t.map },
    { key: "trending", label: t.trending },
  ] as const;

  const content = useMemo(() => {
    if (tab === "map") return <DynamicMap mosques={filtered} />;
    if (tab === "trending") {
      const block = (title: string, rows: TrendingRow[]) => (
        <div className="rounded-2xl border bg-white p-4 shadow-soft">
          <h3 className="mb-3 font-semibold">{title}</h3>
          <div className="space-y-2 text-sm">
            {rows.map((r) => (
              <p key={r._id.toString()}>{r.mosque.name} ({r.total})</p>
            ))}
          </div>
        </div>
      );
      return (
        <div className="grid gap-4 md:grid-cols-3">
          {block(t.topYes, trending.topYes)}
          {block(t.topNo, trending.topNo)}
          {block(t.mostActive, trending.mostActive)}
        </div>
      );
    }

    return (
      <div className="grid gap-4">
        {filtered.map((mosque) => (
          <MosqueCard
            key={mosque._id.toString()}
            mosque={mosque}
            yesLabel={t.yes}
            noLabel={t.no}
            openMapsLabel={t.openMaps}
            lastReportLabel={t.lastReport}
          />
        ))}
      </div>
    );
  }, [tab, filtered, trending, t]);

  return (
    <section className="space-y-4">
      <div className="grid gap-2 md:grid-cols-3">
        <input
          aria-label="খোঁজ করুন"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.search}
          className="rounded-2xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 outline-none ring-emerald-300 transition focus:ring"
        />
        <select
          aria-label="এলাকা ফিল্টার"
          value={area}
          onChange={(e) => setArea(e.target.value)}
          className="rounded-2xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 outline-none ring-emerald-300 transition focus:ring"
        >
          <option value="">{t.allAreas}</option>
          {areas.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>
      <div className="flex flex-wrap gap-2">
        {tabs.map((x) => (
          <button
            key={x.key}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${tab === x.key ? "border-emerald-700 bg-emerald-700 text-white" : "border-emerald-100 bg-white text-slate-700 hover:border-emerald-200 hover:bg-emerald-50"}`}
            onClick={() => setTab(x.key)}
          >
            {x.label}
          </button>
        ))}
      </div>
      {content}
    </section>
  );
}
