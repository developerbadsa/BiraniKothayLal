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

  const jsonLd = {"@context":"https://schema.org","@type":"WebPage",name:"BiraniKothayLal",url:process.env.NEXT_PUBLIC_APP_URL||"http://localhost:3000"};

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{t.appName}</h1>
      <p className="text-slate-600">{t.tagline}</p>
      <HomeTabs mosques={JSON.parse(JSON.stringify(mosques))} trending={JSON.parse(JSON.stringify(trending))} t={t} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
}
