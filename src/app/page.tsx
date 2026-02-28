import { HomeTabs } from "@/components/HomeTabs";
import { connectDb } from "@/lib/db";
import { getDict } from "@/lib/lang";
import { Mosque } from "@/models/Mosque";
import { Vote } from "@/models/Vote";

export const revalidate = 30;

export default async function HomePage() {
  await connectDb();
  const { t } = await getDict();
  const mosques = await Mosque.find({ status: "ACTIVE" }).sort({ "aggregates.lastVotedAt": -1, createdAt: -1 }).limit(100).lean();

  const since = new Date(Date.now() - 6 * 60 * 60 * 1000);
  const rows = await Vote.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: "$mosqueId",
        yes: { $sum: { $cond: [{ $eq: ["$voteType", "YES"] }, 1, 0] } },
        no: { $sum: { $cond: [{ $eq: ["$voteType", "NO"] }, 1, 0] } },
        total: { $sum: 1 },
      },
    },
    { $lookup: { from: "mosques", localField: "_id", foreignField: "_id", as: "mosque" } },
    { $unwind: "$mosque" },
  ]);

  const trending = {
    topYes: [...rows].sort((a, b) => b.yes - a.yes).slice(0, 5),
    topNo: [...rows].sort((a, b) => b.no - a.no).slice(0, 5),
    mostActive: [...rows].sort((a, b) => b.total - a.total).slice(0, 5),
  };

  const stats = [
    { label: "মোট চালু লোকেশন", value: mosques.length.toString() },
    { label: "গত ৬ ঘণ্টার ভোট", value: rows.length.toString() },
    { label: "পাওয়া জায় এমন এলাকা", value: new Set(mosques.map((m) => m.area)).size.toString() },
  ];

  const jsonLd = { "@context": "https://schema.org", "@type": "WebPage", name: "BiraniKothayLal", url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000" };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-orange-200 bg-gradient-to-br from-stone-100 via-orange-50 to-amber-50 p-7 text-zinc-900 shadow-xl">
        <p className="mb-2 inline-flex rounded-full border border-orange-200 bg-white px-3 py-1 text-xs font-semibold tracking-wide text-orange-700">কমিউনিটি লাইভ খবর</p>
        <h1 className="text-3xl font-extrabold leading-tight md:text-4xl">আজক্যা কোটে বিরানি/ইফতার দেবে</h1>
        <p className="mt-3 max-w-3xl text-sm text-zinc-700 md:text-base">
          তাড়াতাড়ি উকট্যাঁন,নিচে সব রিপোর্ট দেখো, ভোট দাও, আর ম্যাপে গিয়ে লোকেশন মিলি নেও।
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {stats.map((item) => (
            <div key={item.label} className="rounded-2xl border border-orange-200/80 bg-white/80 p-4 backdrop-blur">
              <p className="text-xs text-zinc-600">{item.label}</p>
              <p className="mt-1 text-2xl font-bold text-orange-800">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-orange-100 bg-white p-4 shadow-lg md:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-zinc-900">লাইভে উকট্যাঁন</h2>
            <p className="text-sm text-zinc-600">প্রতি মসজিদের ভোট অবস্থা, বিরানি থাকার মান আর দ্রুত কাজ - সব একজায়গায়।</p>
          </div>
        </div>
        <HomeTabs mosques={JSON.parse(JSON.stringify(mosques))} trending={JSON.parse(JSON.stringify(trending))} t={t} />
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
}
