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
    { label: "মোট সক্রিয় লোকেশন", value: mosques.length.toString() },
    { label: "৬ ঘণ্টায় ভোট হয়েছে", value: rows.length.toString() },
    { label: "কভার করা এলাকা", value: new Set(mosques.map((m) => m.area)).size.toString() },
  ];

  const jsonLd = {"@context":"https://schema.org","@type":"WebPage",name:"BiraniKothayLal",url:process.env.NEXT_PUBLIC_APP_URL||"http://localhost:3000"};

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 via-teal-700 to-cyan-700 p-7 text-white shadow-xl">
        <p className="mb-2 inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-semibold tracking-wide">কমিউনিটি লাইভ আপডেট</p>
        <h1 className="text-3xl font-extrabold leading-tight md:text-4xl">আজকে কোন মসজিদে বিরিয়ানি/ইফতার পাওয়া যাচ্ছে?</h1>
        <p className="mt-3 max-w-3xl text-sm text-emerald-50 md:text-base">
          দ্রুত সার্চ করুন, সুন্দর কার্ড ভিউতে সব রিপোর্ট দেখুন, ভোট দিন, আর এক ক্লিকে ম্যাপে গিয়ে লোকেশন যাচাই করুন।
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {stats.map((item) => (
            <div key={item.label} className="rounded-2xl border border-white/25 bg-white/10 p-4 backdrop-blur">
              <p className="text-xs text-emerald-50">{item.label}</p>
              <p className="mt-1 text-2xl font-bold">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-emerald-100 bg-white p-4 shadow-lg md:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">লাইভ ভেরিফিকেশন সেন্টার</h2>
            <p className="text-sm text-slate-600">মডার্ন কার্ডে প্রতিটি মসজিদের ভোট অবস্থা, কনফিডেন্স স্কোর, এবং দ্রুত অ্যাকশন একসাথে দেখুন।</p>
          </div>
        </div>
        <HomeTabs mosques={JSON.parse(JSON.stringify(mosques))} trending={JSON.parse(JSON.stringify(trending))} t={t} />
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
}
