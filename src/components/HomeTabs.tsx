"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { MosqueCard } from "@/components/MosqueCard";
import { areas } from "@/i18n/dict";

const DynamicMap = dynamic(() => import("@/components/MapView").then((m) => m.MapView), { ssr: false });

type Props = {
  mosques: any[];
  trending: any;
  t: any;
};

export function HomeTabs({ mosques, trending, t }: Props) {
  const [tab, setTab] = useState<"list" | "map" | "trending">("list");
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
      const block = (title: string, rows: any[]) => (
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
          aria-label="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.search}
          className="rounded-xl border bg-white px-3 py-2"
        />
        <select aria-label="Area filter" value={area} onChange={(e) => setArea(e.target.value)} className="rounded-xl border bg-white px-3 py-2">
          <option value="">{t.allAreas}</option>
          {areas.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>
      <div className="flex gap-2">
        {tabs.map((x) => (
          <button
            key={x.key}
            className={`rounded-xl border px-4 py-2 text-sm ${tab === x.key ? "bg-slate-900 text-white" : "bg-white"}`}
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
