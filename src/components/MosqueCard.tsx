import Link from "next/link";
import { VoteButtons } from "@/components/VoteButtons";
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
  const totalVotes = mosque.aggregates.yesCount + mosque.aggregates.noCount;
  const confidence = Math.round((mosque.aggregates.confidenceScore ?? 0) * 100);

  return (
    <article className="group rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="mb-2 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">ভেরিফাইড কমিউনিটি রিপোর্ট</p>
          <Link className="line-clamp-2 text-lg font-bold text-slate-900 hover:text-emerald-700 hover:underline" href={`/mosque/${mosque._id}`}>
            {mosque.name}
          </Link>
          <p className="mt-1 text-sm font-medium text-slate-600">{mosque.area}</p>
          <p className="line-clamp-1 text-sm text-slate-500">{mosque.address || "ঠিকানা পাওয়া যায়নি"}</p>
        </div>
        <span className="rounded-xl border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
          {totalVotes} ভোট
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-3 text-emerald-800">
          <p className="text-xs font-semibold uppercase tracking-wide">{yesLabel}</p>
          <p className="mt-1 text-xl font-extrabold">{mosque.aggregates.yesCount}</p>
        </div>
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-3 text-rose-700">
          <p className="text-xs font-semibold uppercase tracking-wide">{noLabel}</p>
          <p className="mt-1 text-xl font-extrabold">{mosque.aggregates.noCount}</p>
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
          <p>বিশ্বাসযোগ্যতা স্কোর</p>
          <p className="font-semibold text-slate-700">{confidence}%</p>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500" style={{ width: `${confidence}%` }} />
        </div>
      </div>

      <p className="mt-4 text-xs text-slate-500">{lastReportLabel}: {formatTime(mosque.aggregates.lastVotedAt)}</p>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <a
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
          href={`https://www.google.com/maps?q=${lat},${lng}`}
          target="_blank"
          rel="noreferrer"
        >
          {openMapsLabel}
        </a>
        <Link
          className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          href={`/mosque/${mosque._id}`}
        >
          বিস্তারিত দেখুন
        </Link>
      </div>

      <div className="mt-4 border-t border-slate-100 pt-4">
        <p className="mb-2 text-xs font-semibold text-slate-500">এই লোকেশনে বিরিয়ানি আছে কি?</p>
        <VoteButtons mosqueId={mosque._id.toString()} compact />
      </div>
    </article>
  );
}
