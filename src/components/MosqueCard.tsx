import Link from "next/link";
import { formatTime } from "@/lib/format";

type Props = {
  mosque: any;
  yesLabel: string;
  noLabel: string;
  openMapsLabel: string;
  lastReportLabel: string;
};

export function MosqueCard({ mosque, yesLabel, noLabel, openMapsLabel, lastReportLabel }: Props) {
  const [lng, lat] = mosque.location.coordinates;
  return (
    <article className="rounded-2xl border bg-white p-4 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link className="text-lg font-semibold hover:underline" href={`/mosque/${mosque._id}`}>
            {mosque.name}
          </Link>
          <p className="text-sm text-slate-600">{mosque.area}</p>
          <p className="text-sm text-slate-500">{mosque.address || "-"}</p>
        </div>
      </div>
      <div className="mt-3 flex gap-4 text-sm">
        <span className="rounded-lg bg-emerald-50 px-2 py-1 text-emerald-700">{yesLabel}: {mosque.aggregates.yesCount}</span>
        <span className="rounded-lg bg-rose-50 px-2 py-1 text-rose-700">{noLabel}: {mosque.aggregates.noCount}</span>
      </div>
      <p className="mt-3 text-xs text-slate-500">{lastReportLabel}: {formatTime(mosque.aggregates.lastVotedAt)}</p>
      <a
        className="mt-3 inline-block text-sm text-blue-700 underline"
        href={`https://www.google.com/maps?q=${lat},${lng}`}
        target="_blank"
        rel="noreferrer"
      >
        {openMapsLabel}
      </a>
    </article>
  );
}
